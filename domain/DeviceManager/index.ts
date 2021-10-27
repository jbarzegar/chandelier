import { Light } from 'domain/Light'
import { EventEmitter } from 'lib/events'

type DeviceManagerEvents = {
  devicesDiscovered: Light[]
}

export interface IDeviceManager<T> {
  discoverAllLights(): Promise<T[]>
  cleanup(): Promise<void>
}

export class DeviceManagerEmitter extends EventEmitter<DeviceManagerEvents> {}
