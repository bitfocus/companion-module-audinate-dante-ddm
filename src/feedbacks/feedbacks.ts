import { CompanionFeedbackDefinitions } from '@companion-module/base'
import { AudinateDanteModule } from '../main.js'

import { isSubscribed, isSubscribedAndHealthy } from './isSubscribedFactory.js'
import { isSubscribedMultiChannel, isSubscribedMultiChannelAndHealthy } from './isSubscribedMultiFactory.js'

import isSelected from './isSelected.js'

function generateFeedbacks(self: AudinateDanteModule): CompanionFeedbackDefinitions {
	const isSubscribedFeedback = isSubscribed(self)
	const isSubscribedAndHealthyFeedback = isSubscribedAndHealthy(self)
	const isSubscribedMultiChannelFeedback = isSubscribedMultiChannel(self)
	const isSubscribedMultiChannelAndHealthyFeedback = isSubscribedMultiChannelAndHealthy(self)
	const isSelectedFeedback = isSelected(self)
	return {
		isSubscribed: isSubscribedFeedback,
		isSubscribedAndHealthy: isSubscribedAndHealthyFeedback,
		isSubscribedMultiChannel: isSubscribedMultiChannelFeedback,
		isSubscribedMultiChannelAndHealthy: isSubscribedMultiChannelAndHealthyFeedback,
		isSelected: isSelectedFeedback,
	}
}

export default generateFeedbacks
