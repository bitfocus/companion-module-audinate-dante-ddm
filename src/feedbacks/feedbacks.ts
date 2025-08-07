import { CompanionFeedbackDefinitions } from '@companion-module/base'
import { AudinateDanteModule } from '../main.js'

import { isSubscribed, isSubscribedAndHealthy } from './isSubscribedFactory.js'
import { isSubscribedMultiChannel, isSubscribedMultiChannelAndHealthy } from './isSubscribedMultiFactory.js'

import isSelected from './isSelected.js'

function generateFeedbacks(self: AudinateDanteModule): CompanionFeedbackDefinitions {
	return {
		isSubscribed: isSubscribed(self),
		isSubscribedAndHealthy: isSubscribedAndHealthy(self),
		isSubscribedMultiChannel: isSubscribedMultiChannel(self),
		isSubscribedMultiChannelAndHealthy: isSubscribedMultiChannelAndHealthy(self),
		isSelected: isSelected(self),
	}
}

export default generateFeedbacks
