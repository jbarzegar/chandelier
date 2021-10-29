import { DeviceManagerEventEmitter, IDeviceManager } from 'domain/DeviceManager'

export class DeviceManager extends DeviceManagerEventEmitter {
  constructor(private adapter: IDeviceManager) {
    super()

    this.on('deviceMesh.sync', this.onSync)
  }

  private onSync = async () => {
    this.emit('deviceMesh.syncing')

    try {
      console.log(this.adapter)
      const devices = await this.adapter.sync()

      this.emit('deviceMesh.syncCompleted', { added: devices, removable: [] })
    } catch (e) {
      this.emit('deviceMesh.syncError', e)
    }
  }
}
