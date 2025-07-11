// getApolloClient.test.ts

// eslint-disable-next-line n/no-unpublished-import
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'

import { gql } from '@apollo/client/core'
import { InstanceStatus } from '@companion-module/base'

// eslint-disable-next-line n/no-unpublished-import
import { http, HttpResponse } from 'msw'
// eslint-disable-next-line n/no-unpublished-import
import { setupServer } from 'msw/node'
import https from 'https'
import http_server from 'http'

// eslint-disable-next-line n/no-unpublished-import
import pem from 'pem'
import { getApolloClient } from './apolloClient.js' // The function to test
import { AudinateDanteModule } from './main.js' // Import the type for casting

// Define the GraphQL query for testing
const DOMAINS_QUERY = gql`
	query Domains {
		domains {
			id
			name
		}
	}
`

// Define the mock response data
const mockDomainsResponse = {
	data: {
		domains: [
			{ id: '1', name: 'Domain A' },
			{ id: '2', name: 'Domain B' },
		],
	},
}

// --- Mock Companion Module Instance ---
// This object simulates the main module instance passed to the function.
const mockSelf = {
	config: {
		disableCertificateValidation: false,
	},
	updateStatus: vi.fn(),
	log: vi.fn(),
	// Add properties from AudinateDanteModule to satisfy the type
	variables: {},
	domain: {},
	init: vi.fn(),
	destroy: vi.fn(),
}

// --- Server Setup ---
// We will use a combination of a real HTTPS server for certificate tests
// and MSW for simpler HTTP/GraphQL error tests.

let httpsServer: https.Server
let httpServer: http_server.Server
const httpsPort = 8443 // Use a non-standard port to avoid conflicts
const httpPort = 8080

// MSW server for general cases not requiring real network errors
const mswServer = setupServer(
	// This handler will intercept requests that are not directed to our real test servers
	http.post('https://ddm.example.com/graphql', () => {
		// Used for testing a successful HTTPS connection without cert issues
		return HttpResponse.json(mockDomainsResponse)
	}),
	http.post('http://ddm.example.com/graphql', () => {
		// Used for testing a successful HTTP connection
		return HttpResponse.json(mockDomainsResponse)
	}),
)

describe('getApolloClient', () => {
	// Before all tests, create and start our servers
	beforeAll(async () => {
		mswServer.listen({ onUnhandledRequest: 'bypass' })

		// 1. Create a self-signed certificate, wrapped in a promise for async/await
		const keys = await new Promise<{ serviceKey: string; certificate: string }>((resolve, reject) => {
			pem.createCertificate({ days: 1, selfSigned: true }, (err: Error, k: any) => {
				if (err) {
					return reject(err)
				}
				resolve(k)
			})
		})

		const options = { key: keys.serviceKey, cert: keys.certificate }
		const requestHandler = (_req: any, res: any) => {
			res.writeHead(200, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify(mockDomainsResponse))
		}

		// 2. Create an HTTPS server with the self-signed certificate
		httpsServer = https.createServer(options, requestHandler).listen(httpsPort)

		// 3. Create a standard HTTP server
		httpServer = http_server.createServer(requestHandler).listen(httpPort)
	})

	// After all tests, stop the servers
	afterAll(() => {
		mswServer.close()
		httpsServer.close()
		httpServer.close()
	})

	// Reset mocks after each test
	afterEach(() => {
		vi.clearAllMocks()
		mockSelf.config.disableCertificateValidation = false
	})

	// --- Test Cases ---

	it('should create a client for HTTP and fetch data successfully', async () => {
		const client = getApolloClient(mockSelf as unknown as AudinateDanteModule, `http://localhost:${httpPort}/graphql`)
		const response = await client.query({ query: DOMAINS_QUERY })

		expect(response.data).toEqual(mockDomainsResponse.data)
		expect(mockSelf.updateStatus).not.toHaveBeenCalled()
	})

	it('should create a client for a valid HTTPS endpoint and fetch data successfully', async () => {
		// We use MSW here to simulate a "valid" certificate endpoint without needing a trusted CA
		const client = getApolloClient(mockSelf as unknown as AudinateDanteModule, 'https://ddm.example.com/graphql')
		const response = await client.query({ query: DOMAINS_QUERY })

		expect(response.data).toEqual(mockDomainsResponse.data)
		expect(mockSelf.updateStatus).not.toHaveBeenCalled()
	})

	it('should fail with a network error for HTTPS with a self-signed certificate by default', async () => {
		const client = getApolloClient(mockSelf as unknown as AudinateDanteModule, `https://localhost:${httpsPort}/graphql`)

		// The query should reject because the certificate is self-signed and not trusted by Node's default CA.
		await expect(client.query({ query: DOMAINS_QUERY })).rejects.toThrow(
			/self-signed certificate|unable to verify the first certificate/,
		)

		// The onError link should catch this and update the status
		expect(mockSelf.updateStatus).toHaveBeenCalledWith(InstanceStatus.ConnectionFailure, 'Network error')
	})

	it('should succeed for HTTPS with a self-signed certificate when validation is disabled', async () => {
		mockSelf.config.disableCertificateValidation = true
		const client = getApolloClient(mockSelf as unknown as AudinateDanteModule, `https://localhost:${httpsPort}/graphql`)

		// With validation disabled, the query should now succeed
		const response = await client.query({ query: DOMAINS_QUERY })

		expect(response.data).toEqual(mockDomainsResponse.data)
		expect(mockSelf.updateStatus).not.toHaveBeenCalled()
	})

	it('should attach the authorization token to headers when provided', async () => {
		const token = 'Bearer my-secret-token'
		let receivedHeaders: any // Changed from Headers to any to avoid unsupported feature error

		// Use MSW to intercept and inspect the request
		mswServer.use(
			http.post('https://ddm.example.com/graphql', ({ request }: { request: any }) => {
				receivedHeaders = request.headers
				return HttpResponse.json(mockDomainsResponse)
			}),
		)

		const client = getApolloClient(mockSelf as unknown as AudinateDanteModule, 'https://ddm.example.com/graphql', token)
		await client.query({ query: DOMAINS_QUERY })

		expect(receivedHeaders).toBeDefined()
		expect(receivedHeaders.get('authorization')).toBe(token)
	})
})
