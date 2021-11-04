import fetch from 'node-fetch'
import { IBridgeAdapter, BridgeAction } from 'domain/Bridge'
import { NewDevice, Device } from 'domain/Device'

export type BridgeActionNames = 'on' | 'off' | 'dim' | 'color'

type HaBridgeConfig = {
  /** base url of bridge */
  bridgeUrl: string
  bridgeDeviceURL: string
}
export class HaBridgeBindings implements IBridgeAdapter {
  private apiUrl: string

  constructor(public config: HaBridgeConfig) {
    this.apiUrl = `${config.bridgeUrl}/api`
  }

  async attachDevice(device: NewDevice): Promise<Device> {
    try {
      await fetch(`${this.apiUrl}/devices`, {
        method: 'POST',
        body: JSON.stringify([this.mapPayload(device)]),
      })
      return { ...device, id: device.id } as Device
    } catch (e) {
      throw e
    }
  }
  async removeDevice(bridgeId: string): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/devices/${bridgeId}`, { method: 'DELETE' })
    } catch (e) {
      throw e
    }
  }

  private createActions = (actions: BridgeAction[] = []) =>
    JSON.stringify(
      actions.map(x => ({
        item: this.config.bridgeDeviceURL,
        type: 'httpDevice',
        contentType: 'application/json',
        httpVerb: 'POST',
        httpBody: JSON.stringify({
          mapId: '${device.mapId}',
          name: x.name,
          payload: x.payload,
        }),
      }))
    )

  private mapPayload = (device: NewDevice) => ({
    name: `bridge--${device.name}`,
    deviceType: 'custom',
    mapId: device.id,
    mapType: 'httpDevice',
    onUrl: this.createActions([{ name: 'SET_POWER', payload: 'on' }]),
    offUrl: this.createActions([{ name: 'SET_POWER', payload: 'off' }]),
    dimUrl: this.createActions([
      { name: 'SET_BRIGHTNESS', payload: '${device.intensity}' },
    ]),
    colorUrl: this.createActions([
      {
        name: 'SET_COLOR',
        payload: { r: '${color.r}', g: '${color.g}', b: '${color.b}' },
      },
    ]),
  })
}
