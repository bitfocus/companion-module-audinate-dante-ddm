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

export class AudinateDanteModule extends InstanceBase<ConfigType> {
	config: ConfigType
	variables: CompanionVariableValues

	domains?: DomainsQuery['domains']
	domain: DomainQuery['domain']
	apolloClient?: ApolloClient<NormalizedCacheObject>

	pollDomainAndUpdateFeedbacksInterval?: NodeJS.Timeout

	selectorChoices: DropdownChoice[]

	constructor(internal: unknown) {
		super(internal)
		this.config = <ConfigType>{}
		this.variables = <CompanionVariableValues>{}
		this.domains = <DomainsQuery['domains']>[]
		this.domain = <DomainQuery['domain']>{}
		this.selectorChoices = getSelectorsFromVariablesForDropdown(1)
	}

	async init(config: ConfigType): Promise<void> {
		this.config = config

		delete this.domains
		delete this.domain
		delete this.apolloClient
		clearInterval(this.pollDomainAndUpdateFeedbacksInterval)
		delete this.pollDomainAndUpdateFeedbacksInterval

		this.selectorChoices = getSelectorsFromVariablesForDropdown(this.config.rxSelectorCount)
		this.variables = {}

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

		this.log('info', `Setting up domain update polling...`)
		// Do it once initially, then poll thereafter
		await this.pollDomainAndUpdateFeedbacks()
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		this.pollDomainAndUpdateFeedbacksInterval = setInterval(async () => {
			await this.pollDomainAndUpdateFeedbacks()
		}, 2000)

		this.log('info', `Setting up companion components...`)
		this.setVariableDefinitions(generateVariables(this.config.rxSelectorCount))
		this.setFeedbackDefinitions(generateFeedbacks(this))
		this.setActionDefinitions(generateActions(this))
		this.setPresetDefinitions(generatePresets())

		this.updateStatus(InstanceStatus.Ok)
	}

	async pollDomainAndUpdateFeedbacks(): Promise<void> {
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

		this.domain = await getDomain(this)
		this.updateStatus(InstanceStatus.Ok, 'Successfully polled domain')
		this.checkFeedbacks()
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'Destroying the module instance')
		clearInterval(this.pollDomainAndUpdateFeedbacksInterval)
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
				tooltip: 'Set the required number of Rx selectors',
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
