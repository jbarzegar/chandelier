import {
  IDeviceManager,
  SetColorParams,
  SetPowerParams,
  SetBrightnessParams,
} from 'domain/DeviceManager'
import { Light } from 'domain/Light'

/** This manager will combine other device managers into a single class */
export class ComposedDeviceManager implements IDeviceManager {
  constructor(private adapters: IDeviceManager[]) {}

  async sync(): Promise<Light[]> {
    const all = (await Promise.all(this.adapters.map(x => x.sync()))).flat()
    return all.flat()
  }

  setPower(params: SetPowerParams): Promise<Light> {
    throw new Error('Method not implemented.')
  }
  setColor(params: SetColorParams): Promise<Light> {
    throw new Error('Method not implemented.')
  }
  setBrightness(params: SetBrightnessParams): Promise<Light> {
    throw new Error('Method not implemented.')
  }
  cleanup(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
