import {
  IDeviceController,
  SetColorParams,
  SetPowerParams,
  SetBrightnessParams,
} from 'domain/DeviceController'
import { Light } from 'domain/Light'

/** This manager will combine other device managers into a single class */
export class ComposedDeviceManager implements IDeviceController {
  constructor(private adapters: IDeviceController[]) {}

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
