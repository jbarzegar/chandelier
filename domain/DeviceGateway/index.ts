import { EventEmitter } from 'lib/events'
import { DeviceControllerEvents } from 'domain/DeviceController'

export interface GatewayEvents extends DeviceControllerEvents {}

export abstract class BaseDeviceGateway extends EventEmitter<GatewayEvents> {}
