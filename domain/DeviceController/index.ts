import { Light, LightColorModes, PowerMode, Transition } from 'domain/Light'

export interface DeviceControllerEvents {
  /** triggers a discovery sync.
   * A sync will attempt to find new devices on the local network
   */
  'deviceController.sync': void
  /** communicates that a sync is occurring */
  'deviceController.syncing': void
  /** communicates that a sync has completed, returning any new lights
   * if no changes have been detected empty arrays will be returned
   */
  'deviceController.syncCompleted': Light[]
  /** communicates that an error ocurred during sync
   * TODO: structure error responses
   */
  'deviceController.syncError': any
  /** communicates that the power status of a light has updated */
  'device.powerChanged': { id: string; status: PowerMode }
  /** communicates that the color value, or mode of a light has been updated */
  'device.colorChanged': { id: string } & LightColorModes
  /** communicates that the brightness of a light has been updated */
  'device.brightnessChanged': { id: string; brightness: number }
}

export type SetPowerParams = {
  id: string
  power: PowerMode
  transition?: Transition
}

export type SetColorParams = {
  id: string
} & LightColorModes

export type SetBrightnessParams = { id: string; brightness: number }

export interface IDeviceController<T extends Light = Light> {
  /** Attempts to discover new devices, and flag disconnected devices for deletion */
  discover(): Promise<T[]>
  setPower(params: SetPowerParams): Promise<T>
  setColor(params: SetColorParams): Promise<T>
  setBrightness(params: SetBrightnessParams): Promise<T>
  cleanup(): Promise<void>
}
