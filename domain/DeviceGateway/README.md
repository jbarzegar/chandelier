# DeviceGateway

A module that manages Devices. This gateway is responsible for managing, translating controller, mesh etc events

## Depends upon

- [DeviceController](../DeviceController/README.md)
- [Bridge](../Bridge/README.md)
- [DeviceData](../DeviceData/README.md)

## Usecases

- Manage `DeviceEvent` streams, translating into `DeviceController` calls
- Interacts with `DeviceData` to persist/read the state of given devices

## Entities

- Gateway (the main interface)
