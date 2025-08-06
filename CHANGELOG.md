# Changelog

## v.1.2.3 (2025-08-06)

### Bugfixes

- Enforce a 4 second timeout for requests made during module initialization
- Improved logging

## v.1.2.1 (2025-07-25)

### New Additions

- Added multi-channel Dante subscription support with a new action
- Added a learn function to this action to load current Dante subscription states from the device
- Added two new feedbacks (subscribedMultiChannel, and subscribedMultiChannelAndHealthy) for this action

### Bug Fixes/module-updates

- updated companion base module from v1.11 → v1.12.
- Handle http and https API URLs using http and https agents separately. This issue was causing problems for DDM users and has been resolved in this version.

### Known issues

- Connection in the connection tab may not apply the new configuration after hitting save.
  - Workaround: stop and restart the connection
- Multi-channel subscription, may not apply to all channels at times due to packet loss
  - Workaround: send the action again until the desired state is achieved
