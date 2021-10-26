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

interface Device { }


export interface DeviceGateway {
    devices: Device[]
}
