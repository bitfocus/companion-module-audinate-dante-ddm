// eslint-disable-next-line n/no-unpublished-import
import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
	schema: './dante-api.graphql',
	documents: ['./src/**/*.ts'],
	generates: {
		'./src/graphql-codegen/': {
			preset: 'client',
			plugins: [],
		},
	},
}

export default config
