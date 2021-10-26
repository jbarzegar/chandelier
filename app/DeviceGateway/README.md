# DeviceGateway

A module that manages Devices. This gateway is responsible for managing, translating 

## Depends upon

- [DeviceManager](../DeviceManager/README.md)
- [Bridge](../Bridge/README.md)
- [DeviceData](../DeviceData/README.md)

## Usecases

- Manage `DeviceEvent` streams, translating into `DeviceManager` calls
- Interacts with `DeviceData` to persist/read the state of given devices


## Entities

- Gateway (the main interface )
