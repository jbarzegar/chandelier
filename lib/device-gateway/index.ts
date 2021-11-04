import { BaseDeviceGateway } from 'domain/DeviceGateway'
import { IDeviceController } from 'domain/DeviceController'
import { IBridgeAdapter } from 'domain/Bridge'
import { Device } from 'domain/Device'
import { Light } from 'domain/Light'
import { v4 as uuid } from 'uuid'

const mapLightToDevice = (light: Light): Device =>
  ({
    ...light,
    id: uuid(),
    hwId: light.id,
    type: 'light',
  } as Device)

export class DeviceGateway extends BaseDeviceGateway {
  constructor(
    private controller: IDeviceController,
    private bridge: IBridgeAdapter
  ) {
    super()

    this.on('deviceController.sync', this.onSync)
  }

  private onSync = async () => {
    this.emit('deviceController.syncing')

    try {
      const lights = await this.controller.discover()

      const devices = await Promise.all(
        lights.map(mapLightToDevice).map(x => this.bridge.attachDevice(x))
      )

      this.emit('deviceController.syncCompleted', lights)
    } catch (e) {
      this.emit('deviceController.syncError', e)
    }
  }
}
