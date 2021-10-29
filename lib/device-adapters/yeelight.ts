import { Discover, IDevice, DeviceStatus, Yeelight } from 'yeelight-awesome'
import {
  DeviceManagerEventEmitter,
  IDeviceManager,
  SetBrightnessParams,
  SetColorParams,
  SetPowerParams,
} from 'domain/DeviceManager'
import { ColorMode, Light, PowerMode } from 'domain/Light'
import { DistributiveOmit } from 'types'

const Color = require('color')

const numToHex = (num: number) =>
  `#${(Math.abs(num) & 0x00ffffff).toString(16).padStart(6)}`

const hexToRGB = (hex: string) => Color(hex).object()

type YeelightDeviceManagerOpts = { debug?: boolean; initialLights?: Light[] }
export class YeelightDeviceManager implements IDeviceManager {
  private lights: Map<string, Light>
  private discoverer: Discover

  constructor({
    debug = false,
    initialLights = [],
  }: YeelightDeviceManagerOpts = {}) {
    this.discoverer = new Discover({ debug }, debug ? console : undefined)
    this.lights = new Map(initialLights.map(x => [x.id, x]))
  }

  async sync(): Promise<Light[]> {
    const devices = (await this.discoverer.start()).filter(Boolean)

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

    throw new Error('not implemented')
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
    const light: DistributiveOmit<
      Light,
      'colorMode' | 'color' | 'temperature'
    > = {
      id: device.id,
      name: device.name || 'unknownYeelight',
      host: device.host,
      port: device.port,
      brightness: device.bright,
      powerStatus:
        device.status === DeviceStatus.ON ? PowerMode.ON : PowerMode.OFF,
      vendor: 'yeelight',
    }

    // note `yeelight-awesome's` ColorMode is not spec compliant so we use raw numbers
    switch (device.mode) {
      case 1: // RGB light
        return {
          ...light,
          colorMode: ColorMode.RGB,
          color: hexToRGB(numToHex(device.rgb)),
        }
      case 2: // WHITE light
        return {
          ...light,
          colorMode: ColorMode.WHITE,
          temperature: device.ct,
        }
      default:
        return light as Light
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
