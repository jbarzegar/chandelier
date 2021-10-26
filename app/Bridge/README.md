# Bridge

The Bridge handles the communication between external services and external clients (IE frontend user facing systems)

A module that translates our device calls into a (or many) external services and vice versa
 
For instance, we can translate all our device calls via chandelier into philips HUE (zigbee) calls to allow us to interact philips hue enabled apps/systems

## Depends upon

- [DeviceGateway](../DeviceGateway/README.md)


## Usecases
- Propigates bindings to the `DeviceGateway`
- Translate binding calls into `DeviceEvent`s
- Manage direct interaction with user clients (IE rest api/frontend etc)


## Avalible bindings (tbd)

### Ha-Bridge (wip)
> [Project Link](https://github.com/bwssytems/ha-bridge)

A service that emulates a Philips Hue light system
