# Audinate Dante

This module enables the ability to set Dante subscriptions which using a managed domain

There are two modes of operations

1. Setting subscriptions using fixed values for Rx and Tx
2. Setting subscriptions using a selector (first select the Rx, then the Tx)

Each of these operations has a preset which includes the appropriate feedback.
However the option values in the each feedback will need to be set manually for each button

## Selector

When using the selector, it is expected that a row of buttons is set up to set the selector value (ie. the destination)
and another set of buttons which set the subscription value (ie. the source)

## Connection

This module requires access to the Dante Managed API which is currently available through a Dante Cloud Beta account or through the upcoming DDM 1.5 release

Each module is scoped to a particular Dante domain.
If you have multiple domains you want to manage, just set up a new connection for each domain.

* API Host -> The HTTP(S) endpoint for the API
* API Key -> The secret key with access to the domain below
* Domain ID -> The machine-friendly identifier for the domain you want to use.
