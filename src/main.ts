import {
	InstanceBase,
	Regex,
	runEntrypoint,
	InstanceStatus,
	SomeCompanionConfigField,
	CompanionVariableValues,
} from '@companion-module/base'

import { ApolloClient, NormalizedCacheObject } from '@apollo/client'

import { getApolloClient } from './apolloClient'
import { getDomain } from './dante-api/getDomain'
import { getDomains } from './dante-api/getDomains'

import { DomainQuery, DomainsQuery } from './graphql-codegen/graphql'

import UpgradeScripts from './upgrades'
import generateActions from './actions'
import generateFeedbacks from './feedbacks'
import { generatePresets } from './presets'
import { generateVariables } from './variables'

export class AudinateDanteModule extends InstanceBase<ConfigType> {
	config: ConfigType
	variables: CompanionVariableValues

	domains: DomainsQuery['domains']
	domain: DomainQuery['domain']
	apolloClient: ApolloClient<NormalizedCacheObject>

	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config

		delete this.domains
		delete this.domain
		delete this.apolloClient

		this.variables = {}

		if (!this.config.apihost) {
			this.updateStatus(InstanceStatus.ConnectionFailure, 'API host not set')
			return
		}

		if (!this.config.apikey) {
			this.updateStatus(InstanceStatus.ConnectionFailure, 'API key not set')
			return
		}

		console.log(`Creating ApolloClient`)
		this.apolloClient = getApolloClient(this, this.config.apihost, this.config.apikey)

		console.log(`Getting list of available Domains`)
		try {
			this.domains = await getDomains(this)
		} catch (e) {
			this.updateStatus(InstanceStatus.Disconnected, e.toString())
			return
		}

		if (!this.domains) {
			this.updateStatus(InstanceStatus.Connecting, 'No domains discovered')
			return
		}

		if (!this.config.domainID) {
			this.updateStatus(InstanceStatus.BadConfig, 'Domain not selected')
			return
		}

		console.log(`Getting specified Domain (${this.config.domainID})`)
		try {
			this.domain = await getDomain(this)
		} catch (e) {
			this.updateStatus(InstanceStatus.Disconnected, e.toString())
			return
		}

		if (!this.domain) {
			this.updateStatus(InstanceStatus.Connecting, 'Domain not found')
			return
		}

		console.log(`Setting up companion components...`)
		this.setVariableDefinitions(generateVariables())
		this.setFeedbackDefinitions(generateFeedbacks(this))
		this.setActionDefinitions(generateActions(this))
		this.setPresetDefinitions(generatePresets(this))

		console.log(`Setting up domain update polling...`)
		setInterval(async () => {
			this.domain = await getDomain(this)
			this.checkFeedbacks()
		}, 2000)

		this.updateStatus(InstanceStatus.Ok)
	}

	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		console.log(`Configuration updated`)
		console.log(config)
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
				default: 'https://<instance>.beta.dante.cloud:4000/graphql',
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
				choices: [
					{ id: 'default', label: 'None' },
					...(this.domains?.map((d) => ({
						id: d.id,
						label: d.name,
					})) ?? []),
				],
			},
			{
				id: 'disableCertificateValidation',
				type: 'checkbox',
				label: 'Disable certificate validation',
				width: 8,
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
