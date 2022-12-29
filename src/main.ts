import { InstanceBase, Regex, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'

import UpgradeScripts from './upgrades'
import actions from './actions'

type ConfigType = {
	apihost: string
	apikey: string
	domainID: string
}

class ModuleInstance extends InstanceBase<ConfigType> {
	config: ConfigType
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config
		// this.updateStatus(InstanceStatus.Ok)
		this.setActionDefinitions(actions)
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
		return [
			{
				id: 'apihost',
				type: 'textinput',
				label: 'API Host URL',
				width: 8,
				regex: Regex.HOSTNAME,
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
