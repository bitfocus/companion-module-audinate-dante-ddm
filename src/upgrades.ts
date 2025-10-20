import type {
	CompanionStaticUpgradeScript,
	CompanionStaticUpgradeResult,
	CompanionUpgradeContext,
	CompanionStaticUpgradeProps,
} from '@companion-module/base'
import { ConfigType } from './config.js'

const upgradeScripts: CompanionStaticUpgradeScript<ConfigType>[] = [
	function (
		_context: CompanionUpgradeContext<ConfigType>,
		props: CompanionStaticUpgradeProps<ConfigType>,
	): CompanionStaticUpgradeResult<ConfigType> {
		const result: CompanionStaticUpgradeResult<ConfigType> = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}

		if (props.config && typeof props.config.rxSelectorCount === 'undefined') {
			result.updatedConfig = {
				...props.config,
				rxSelectorCount: 4,
			}
		}

		return result
	},
]

export default upgradeScripts
