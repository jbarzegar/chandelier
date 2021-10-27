# DeviceData

A module that acts as the data persistance/management point for our devices

## Depends upon

- [DeviceGateway](../DeviceGateway/README.md)

- [A database adapter](#database-adapter)

## Usecases

- Manages persistant device state

  - store relevant device information/state
  - stores mapped bridge, hardware ids

- CRUD data about a single device
- CRUD data about many devices

- Validate incoming device data

## Validation

Data integrety is validated whenever it is CREATED or UPDATED, if the data being prepared for saving is found to be invalid an error will be thrown to the above layer.

Data will not be validated upon read or delete.

## Database adapter

A database adapter is used to simplify the data interactions between a chosen db and the system. These database adapters are responsible for interacting with/through the database or db client

The database adapter should be able to support basic CRUD features for now.
