import { BaseDeviceGateway } from 'domain/DeviceGateway'
import { IDeviceController } from 'domain/DeviceController'

export class DeviceGateway extends BaseDeviceGateway {
  constructor(private adapter: IDeviceController) {
    super()

    this.on('deviceController.sync', this.onSync)
  }

  private onSync = async () => {
    this.emit('deviceController.syncing')

    try {
      const devices = await this.adapter.sync()

      this.emit('deviceController.syncCompleted', devices)
    } catch (e) {
      this.emit('deviceController.syncError', e)
    }
  }
}
