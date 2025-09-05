import {
	InstanceBase,
	Regex,
	runEntrypoint,
	InstanceStatus,
	SomeCompanionConfigField,
	CompanionVariableValues,
	DropdownChoice,
} from '@companion-module/base'

import { ApolloClient, NormalizedCacheObject } from '@apollo/client'

import { getApolloClient } from './apolloClient.js'
import { getDomain } from './dante-api/getDomain.js'
import { getDomains } from './dante-api/getDomains.js'

import { DomainQuery, DomainsQuery } from './graphql-codegen/graphql.js'

import { ConfigType } from './config.js'
import UpgradeScripts from './upgrades.js'
import generateActions from './actions.js'
import generateFeedbacks from './feedbacks/feedbacks.js'
import { generatePresets } from './presets.js'
import { generateVariables, getSelectorsFromVariablesForDropdown } from './variables.js'
import { getDropdownChoicesOfDomains, getRxSelectorsDropdown } from './options.js'

const sleep = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class AudinateDanteModule extends InstanceBase<ConfigType> {
	config: ConfigType
	variables: CompanionVariableValues

	domains?: DomainsQuery['domains']
	domain: DomainQuery['domain']
	apolloClient?: ApolloClient<NormalizedCacheObject>

	selectorChoices: DropdownChoice[]

	abort: AbortController
	pollPromise?: Promise<void>
	constructor(internal: unknown) {
		super(internal)
		this.config = <ConfigType>{}
		this.variables = <CompanionVariableValues>{}
		this.domains = <DomainsQuery['domains']>[]
		this.domain = <DomainQuery['domain']>{}
		this.selectorChoices = getSelectorsFromVariablesForDropdown(1)
		this.abort = new AbortController()
	}

	async init(config: ConfigType): Promise<void> {
		this.config = config

		delete this.domains
		delete this.domain
		delete this.apolloClient

		this.selectorChoices = getSelectorsFromVariablesForDropdown(this.config.rxSelectorCount)
		this.variables = {}
		if (this.pollPromise) {
			this.log(`info`, `polling in action, terminating it`)
			this.abort.abort(`init() fn called`)
			await this.pollPromise
			this.pollPromise = undefined
		}
		if (!this.config.apihost) {
			this.updateStatus(InstanceStatus.ConnectionFailure, 'API host not set')
			return
		}

		if (!this.config.apikey) {
			this.updateStatus(InstanceStatus.ConnectionFailure, 'API key not set')
			return
		}

		this.log('info', `Creating ApolloClient`)
		this.apolloClient = getApolloClient(this, this.config.apihost, this.config.apikey)

		this.log('info', `Getting list of available Domains`)
		this.domains = await getDomains(this)

		if (!this.domains) {
			// The InstanceStatus.Disconnected is updated inside getDomains, so that it includes the error message
			return
		}

		// A connection to the server was established, but no domains are found
		if (this.domains.length == 0) {
			this.updateStatus(InstanceStatus.Connecting, 'No domains discovered')
			return
		}

		await this.updateDomain()

		this.updateStatus(InstanceStatus.Ok, 'Successfully polled domain')

		this.log('info', 'Setting module status to OK')

		// IIFE to run the loop outside of the init() function which has a 10s timeout
		setTimeout(() => {
			this.log('info', `Setting up domain update polling...`)
			this.updateDefinitions()
			this.pollPromise = this.poll()
		}, 0)
	}

	async updateDomain(): Promise<void> {
		if (!this.config.domainID || this.config.domainID == 'default') {
			this.updateStatus(InstanceStatus.BadConfig, 'Domain not selected. Please select a domain')
			return
		}

		this.log('debug', `Getting specified Domain (${this.config.domainID})`)

		this.domain = await getDomain(this)

		if (!this.domain) {
			this.updateStatus(InstanceStatus.Connecting, 'Domain not found. Please check the selected domain')
			return
		}
	}

	private updateDefinitions() {
		/**
		 * There are performance issues when calling into companion with very large
		 * domains (>100 devices).
		 * We are logging all the timing information here to be able to track down
		 * where a regression might have occurred, particularly to isolate if it is
		 * on our side or in the companion host.
		 */
		this.log('info', `Setting up companion components...`)

		// -- feedbacks --
		this.log('info', `Setting up feedback definitions...`)

		console.time('setFeedbackDefinitions')
		// setDefinitions() can hang with very large definitions
		// specifically when it is stringified to send through the internal host-ipc
		console.time('generateFeedbacks')
		const feedbacks = generateFeedbacks(this)
		console.timeEnd('generateFeedbacks')
		this.setFeedbackDefinitions(feedbacks)
		console.timeEnd('setFeedbackDefinitions')

		// -- variables --
		this.log('info', `Setting up variable definitions...`)
		console.time('generateVariables')
		this.setVariableDefinitions(generateVariables(this.config.rxSelectorCount))
		console.timeEnd('generateVariables')

		// -- actions --
		this.log('info', `Setting up action definitions...`)
		console.time('generateActions')
		const actions = generateActions(this)
		console.timeEnd('generateActions')
		console.time('setActionDefinitions')
		this.setActionDefinitions(actions)
		console.timeEnd('setActionDefinitions')

		// -- presets --
		this.log('info', `Setting up preset definitions...`)
		console.time('generatePresets')
		this.setPresetDefinitions(generatePresets())
		console.timeEnd('generatePresets')
	}

	/**
	 * poll runs a loop that monitors for changes to the domain, and then updates
	 * various aspects of the module.
	 */
	async poll(): Promise<void> {
		// Use a while-sleep loop to avoid starting parallel requests if the previous
		// request has not yet completed.
		// c.f. a setInterval, which can spawn many parallel requests
		while (!this.abort.signal.aborted) {
			await this.updateDomain()
			this.log('debug', `Checking feedbacks...`)
			console.time('checkFeedbacks')
			this.checkFeedbacks()
			console.timeEnd('checkFeedbacks')

			await sleep(2000)
		}
		this.log(`warn`, `poll() terminated`)
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'Destroying the module instance')
		this.abort.abort('AudinateDanteModule destroy() called')
		await this.pollPromise

		delete this.pollPromise
		delete this.domains
		delete this.domain
		delete this.apolloClient
	}

	async configUpdated(config: ConfigType): Promise<void> {
		this.log('info', `Configuration updated`)
		this.log('debug', JSON.stringify({ ...config, apikey: '**********' }, null, 2))
		await this.init(config)
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		const RegexURL = '[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)'

		return [
			{
				id: 'apihost',
				type: 'textinput',
				label: 'API Host URL',
				default: 'https://api.director.dante.cloud:443/graphql',
				width: 8,
				regex: RegexURL,
			},
			{
				id: 'apikey',
				type: 'textinput',
				label: 'API Key',
				width: 8,
				regex: Regex.SOMETHING,
			},
			{
				id: 'domainID',
				type: 'dropdown',
				label: 'Domain',
				width: 8,
				// isVisible: (configValues) => {
				// 	if (configValues.apikey) {
				// 		return true
				// 	}
				// 	return false
				// },
				default: 'default',
				choices: getDropdownChoicesOfDomains(this.domains),
			},
			{
				id: 'rxSelectorCount',
				type: 'dropdown',
				label: 'Rx Selector Count',
				width: 8,
				default: 1,
				tooltip: 'The number of independent sets of controls you require. One is sufficient for most use cases.',
				choices: getRxSelectorsDropdown(100),
			},
			{
				id: 'disableCertificateValidation',
				type: 'checkbox',
				label: 'Disable certificate validation',
				width: 8,
				tooltip: 'For HTTP endpoints, setting this value has no affect',
				default: false,
			},
			{
				id: 'message',
				type: 'static-text',
				label: 'Reminder',
				value: 'The module must be restarted manually for these settings to take effect',
				width: 8,
			},
		]
	}
}

runEntrypoint(AudinateDanteModule, UpgradeScripts)
