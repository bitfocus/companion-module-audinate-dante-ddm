import { InstanceBase, Regex, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'

import UpgradeScripts from './upgrades'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { getApolloClient } from './apolloClient'
import { getDomain } from './getDomain'
import { DomainQuery, DomainsQuery } from './graphql-codegen/graphql'
import { getDomains } from './getDomains'

import generateActions from './actions'
import generateFeedbacks from './feedbacks'
import { generatePresets } from './presets'

const DESK_DOMAIN_ID = 'de20a958252a42a089207aaf45f61a37'

export class AudinateDanteModule extends InstanceBase<ConfigType> {
	config: ConfigType
	domains: DomainsQuery['domains']
	domain: DomainQuery['domain']
	apolloClient: ApolloClient<NormalizedCacheObject>
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config

		this.updateStatus(InstanceStatus.Connecting)

		this.apolloClient = getApolloClient(this.config.apihost, this.config.apikey)

		this.domains = await getDomains(this.apolloClient)
		console.log(this.domains)

		this.domain = await getDomain(this.apolloClient, this.config.domainID)
		console.log(this.domain)

		this.setFeedbackDefinitions(generateFeedbacks(this))
		this.setActionDefinitions(generateActions(this))
		this.setPresetDefinitions(generatePresets(this))

		setInterval(async () => {
			this.domain = await getDomain(this.apolloClient, this.config.domainID)
			this.checkFeedbacks('isSubscribed')
		}, 500)
		this.updateStatus(InstanceStatus.Ok)
	}

	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		const RegexURL = '[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)'
		return [
			{
				id: 'apihost',
				type: 'textinput',
				label: 'API Host URL',
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
				type: 'textinput',
				label: 'Domain ID',
				width: 8,
				regex: Regex.SOMETHING,
			},
		]
	}
}

runEntrypoint(AudinateDanteModule, UpgradeScripts)
