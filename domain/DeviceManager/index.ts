import { EventEmitter } from 'lib/events'
import { Light, LightColorModes, PowerMode, Transition } from 'domain/Light'

interface DeviceManagerEvents {
  /** triggers a discovery sync.
   * A sync will attempt to find new devices on the local network
   * and flag any currently saved devices as removable if they cannot be seen on the local network any longer
   */
  'deviceMesh.sync': void
  /** communicates that a sync is occurring */
  'deviceMesh.syncing': void
  /** communicates that a sync has completed, returning any new and/or removable lights
   * if no changes have been detected empty arrays will be returned
   */
  'deviceMesh.syncCompleted': { added: Light[]; removable: Light[] }
  /** communicates that an error ocurred during sync
   * TODO: structure error responses
   */
  'deviceMesh.syncError': any
  /** communicates that the power status of a light has updated */
  'device.powerChanged': { id: string; status: PowerMode }
  /** communicates that the color value, or mode of a light has been updated */
  'device.colorChanged': { id: string } & LightColorModes
  /** communicates that the brightness of a light has been updated */
  'device.brightnessChanged': { id: string; brightness: number }
}

export class DeviceManagerEventEmitter extends EventEmitter<DeviceManagerEvents> {}

export type SetPowerParams = {
  id: string
  power: PowerMode
  transition?: Transition
}

export type SetColorParams = {
  id: string
} & LightColorModes

export type SetBrightnessParams = { id: string; brightness: number }

export interface IDeviceManager<T extends Light = Light> {
  /** Attempts to discover new devices, and flag disconnected devices for deletion */
  sync(): Promise<T[]>
  setPower(params: SetPowerParams): Promise<T>
  setColor(params: SetColorParams): Promise<T>
  setBrightness(params: SetBrightnessParams): Promise<T>
  cleanup(): Promise<void>
}
