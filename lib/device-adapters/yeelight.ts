import {
  Discover,
  IDevice,
  DeviceStatus,
  Yeelight,
  ColorMode as YeeColorMode,
} from 'yeelight-awesome'
import {
  IDeviceManager,
  SetBrightnessParams,
  SetColorParams,
  SetPowerParams,
} from '../../domain/DeviceManager'
// import * as Color from 'color'
import { ColorMode, Light, PowerMode } from '../../domain/Light'
import { DistributiveOmit } from '../../types'

export class YeelightDeviceManager implements IDeviceManager {
  private discoverer: Discover = new Discover({ debug: true }, console)
  private lights: Map<string, Light> = new Map()

  async sync(): Promise<Light[]> {
    const devices = await this.discoverer.start()

    for (const x of devices) {
      this.lights.set(x.id, this.mapLight(x))
    }

    const lights = Array.from(this.lights, ([, v]) => v)

    await this.discoverer.destroy()

    return lights
  }

  async setPower(params: SetPowerParams): Promise<Light> {
    const light = await this.connectToLight(params.id)

    await light.setPower(params.power === PowerMode.ON, params.transition, 1000)

    return this.updateLight(params.id, { powerStatus: params.power })
  }
  async setColor({ id, ...params }: SetColorParams): Promise<Light> {
    const light = await this.connectToLight(id)

    switch (params.colorMode) {
      case ColorMode.RGB:
        break
      case ColorMode.WHITE:
        break
      case ColorMode.HUE_SAT:
        break
    }

    return this.updateLight(id, params)
  }
  setBrightness(params: SetBrightnessParams): Promise<Light> {
    throw new Error('Method not implemented.')
  }
  cleanup() {
    return this.discoverer.destroy()
  }

  private async connectToLight(id: string): Promise<Yeelight> {
    if (!this.lights.has(id))
      throw new Error(`could not find light with id of ${id}`)

    const x = this.lights.get(id)

    const l = new Yeelight({
      lightId: x?.id,
      lightIp: x?.host,
      lightPort: x?.port,
    })
    const light = await l.connect()

    return light
  }

  private mapLight(device: IDevice): Light {
    const light = {
      id: device.id,
      name: device.name || 'unknownYeelight',
      host: device.host,
      port: device.port,
      brightness: device.bright,
      powerStatus:
        device.status === DeviceStatus.ON ? PowerMode.ON : PowerMode.OFF,
    } as Light

    switch (device.mode) {
      case YeeColorMode.COLOR:
        // const c = Color()
        return {
          ...light,
          colorMode: ColorMode.RGB,
          color: { r: 0, b: 0, g: 0 },
        }
      /** NOTE: the color temp is missing from the lib cuz of a bug */
      case YeeColorMode.WHITE:
        return {
          ...light,
          colorMode: ColorMode.HUE_SAT,
          color: { hue: device.hue, sat: device.sat },
        }
      default:
        return light
    }
  }

  private updateLight(
    id: string,
    p: Partial<DistributiveOmit<Record<keyof Light, Light[keyof Light]>, 'id'>>
  ): Light {
    if (!this.lights.has(id))
      throw new Error(`could not find light with id ${id}`)

    const light = this.lights.get(id) as Light

    this.lights.set(id, { ...light, ...(p as Light) })

    return this.lights.get(id) as Light
  }
}
