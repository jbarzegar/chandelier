import {
  Yeelight,
  Discover,
  IDevice,
  Color as LightColor,
} from 'yeelight-awesome'
import * as Color from 'color'
import { pick } from 'lodash'

import type { IDeviceManager } from 'domain/DeviceManager'
import type { LightClientDisconnected } from 'domain/Light'

const devicePickKeys = ['host', 'id', 'port', 'status'] as const

export class YeelightDeviceManager
  implements IDeviceManager<LightClientDisconnected>
{
  private discoverer: Discover = new Discover({})

  async discoverAllLights() {
    const devices = (await this.discoverer.start()).filter(Boolean)
    const lights: LightClientDisconnected[] = devices.map(_ => this.mapLight(_))

    return lights
  }
  cleanup() {
    return this.discoverer.destroy()
  }

  private createConnect(device: IDevice): LightClientDisconnected['connect'] {
    return async () => {
      const light = new Yeelight({
        lightId: device.id,
        lightIp: device.host,
        lightPort: device.port,
      })

      const l = await light.connect()

      return {
        ...pick(device, [...devicePickKeys, 'name']),
        getStatus: () => device.status,
        setBrightness: async (intensity, options) => {
          await l.setBright(intensity, options.transition, options.timing)
        },
        setColor: async (color, options) => {
          await l.setRGB(this.toRGB(color), options.transition, options.timing)
        },
        setPower: async (status, opts) => {
          try {
            await l.setPower(status === 'on', opts.transition, opts.timing)
          } catch (e) {
            throw e
          }
        },
        disconnect: async () => {
          await l.disconnect()
        },
      }
    }
  }

  private mapLight(device: IDevice): LightClientDisconnected {
    return {
      ...pick(device, devicePickKeys),
      name: device.name || 'unknownYeelight',
      connect: this.createConnect(device),
    }
  }

  private toRGB(hex: string): LightColor {
    // @ts-expect-error
    const rgb: [number, number, number] = new Color(hex).rgb().toJSON().color

    return new LightColor(...rgb)
  }
}
