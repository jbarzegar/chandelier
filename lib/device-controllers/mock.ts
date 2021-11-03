import {
  IDeviceController,
  SetColorParams,
  SetPowerParams,
  SetBrightnessParams,
} from 'domain/DeviceController'
import { Light, ColorMode, PowerMode } from 'domain/Light'

export class MockDeviceController implements IDeviceController {
  async sync(): Promise<Light[]> {
    return new Array(2).fill(0).map((x, i) => ({
      id: i.toString(),
      brightness: x,
      colorMode: ColorMode.WHITE,
      temperature: 555,
      host: 'www://',
      port: 0,
      powerStatus: PowerMode.ON,
      name: '',
      vendor: 'mock',
    }))
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
