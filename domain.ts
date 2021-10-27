/*
 * # Entities
 *
 * ## Device Gateway
 * The device gateway will manage and modfiy the state of currently connected devices
 *
 *
 * # UseCases
 *
 * ## Gateway
 *
 *
 */

interface Device {
  id: string
}

export interface DeviceGateway {
  devices: Device[]
}
