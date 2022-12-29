import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
	schema: 'https://james.dev.audinatescratch.com:4000',
	documents: ['./src/**/*.ts'],
	generates: {
		'./src/graphql-types.ts': {
			documents: ['./src/**/*.ts'],
			plugins: ['typescript', 'typescript-operations'],
		},
	},
}

export default config
