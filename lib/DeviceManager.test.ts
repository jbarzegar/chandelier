import { DeviceManager } from './DeviceManager'
import { YeelightDeviceManager } from 'lib/device-adapters/yeelight'
import { ComposedDeviceManager } from 'lib/device-adapters/composed'
import { MockManager } from 'lib/device-adapters/mock'

describe('Device Manager', () => {
  const testSync = () => {
    const manager = new DeviceManager(new MockManager())
    return new Promise((resolve, reject) => {
      manager
        .on('deviceMesh.syncCompleted', resolve)
        .on('deviceMesh.syncError', reject)

      manager.emit('deviceMesh.sync')
    })
  }
  it('should sync', async () => {
    const result = await testSync()

    console.log(result)
  })
})
