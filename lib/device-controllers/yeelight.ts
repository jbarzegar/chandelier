import {
  Color as YeColor,
  Discover,
  IDevice,
  DeviceStatus,
  Yeelight,
} from 'yeelight-awesome'
import {
  IDeviceController,
  SetBrightnessParams,
  SetColorParams,
  SetPowerParams,
} from 'domain/DeviceController'
import { ColorMode, Light, PowerMode } from 'domain/Light'

const Color = require('color')

const numToHex = (num: number) =>
  `#${(Math.abs(num) & 0x00ffffff).toString(16).padStart(6)}`

const hexToRGB = (hex: string) => Color(hex).object()

type YeelightControllerOpts = { debug?: boolean; initialLights?: Light[] }
export class YeelightController implements IDeviceController {
  private lights: Map<string, Light>
  private discoverer: Discover

  constructor({
    debug = false,
    initialLights = [],
  }: YeelightControllerOpts = {}) {
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

  async setPower(p: SetPowerParams): Promise<Light> {
    const light = await this.connectToLight(p.id)

    await light.setPower(p.power === PowerMode.ON, p.transition, 1000)
    await light.disconnect()

    return this.updateLight(p.id, { powerStatus: p.power })
  }
  async setColor({ id, ...params }: SetColorParams): Promise<Light> {
    const light = await this.connectToLight(id)

    const update = async (x: Partial<Light>) => {
      await light.disconnect()
      return this.updateLight(id, x)
    }

    switch (params.colorMode) {
      case ColorMode.RGB:
        const { r, g, b } = params.color
        await light.setRGB(new YeColor(r, g, b), 'smooth')

        return await update({
          colorMode: ColorMode.RGB,
          color: params.color,
        })
      case ColorMode.WHITE:
        const { temperature } = params
        await light.setCtAbx(temperature, 'smooth')

        return await update({ colorMode: ColorMode.WHITE, temperature })
      default:
        throw new Error(`unhandled mode ${params.colorMode}`)
    }
  }
  async setBrightness(p: SetBrightnessParams): Promise<Light> {
    const light = await this.connectToLight(p.id)

    await light.setBright(p.brightness, 'smooth').then(light.disconnect)
    await light.disconnect()

    return this.updateLight(p.id, { brightness: p.brightness })
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
      vendor: 'yeelight',
    } as Light

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
        // TODO: attempt to figure out the type???
        throw new Error(`Unhandled device mode ${device.mode}`)
    }
  }

  private updateLight(id: string, p: Partial<Light>): Light {
    if (!this.lights.has(id))
      throw new Error(`could not find light with id ${id}`)

    const light = this.lights.get(id) as Light

    this.lights.set(id, { ...light, ...(p as Light) })

    return this.lights.get(id) as Light
  }
}
