import { generateEslintConfig } from '@companion-module/tools/eslint/config.mjs'

export default generateEslintConfig({
	enableTypescript: true,
	ignores: ['./codegen.ts'],
	parserOptions: {
		project: './tsconfig.json',
	},
})
