import { InstanceBase, Regex, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'

import UpgradeScripts from './upgrades'
import generateActions from './actions'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { getApolloClient } from './apolloClient'

class ModuleInstance extends InstanceBase<ConfigType> {
	config: ConfigType
	apolloClient: ApolloClient<NormalizedCacheObject>
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config
		this.updateStatus(InstanceStatus.Ok)
		this.apolloClient = getApolloClient(this.config.apihost, this.config.apikey)
		this.setActionDefinitions(generateActions(this.apolloClient, this.config.domainID))
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

runEntrypoint(ModuleInstance, UpgradeScripts)
