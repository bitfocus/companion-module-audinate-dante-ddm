import { CompanionFeedbackDefinitions } from '@companion-module/base'

function generateFeedbacks(): CompanionFeedbackDefinitions {
	return {
		isSubscribed: {
			name: 'isSubscribed',
			description: 'is the specified channel subscription already in place and healthy',
			type: 'boolean',
			defaultStyle: {
				// RBG hex value converted to decimal
				bgcolor: parseInt('00CC00', 16),
			},
			options: [],
			callback: (feedback) => {
				return true
			},
		},
	}
}

export default generateFeedbacks
