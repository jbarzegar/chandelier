import { DeviceGateway } from '.'
import { MockDeviceController } from 'lib/device-controllers/mock'
import { MockBridgeAdapter } from 'lib/bridge/bindings/mock-bridge'

describe('Device Gateway', () => {
  const testSync = () => {
    const controller = new MockDeviceController()
    const bridge = new MockBridgeAdapter()
    const gateway = new DeviceGateway(controller, bridge)

    return new Promise((resolve, reject) => {
      gateway
        .on('deviceController.syncCompleted', resolve)
        .on('deviceController.syncError', reject)

      gateway.emit('deviceController.sync')
    })
  }
  it('should sync', async () => {
    const result = await testSync()

    console.log(result)
  })
  it.todo('should sync, showing newly discovered devices')
  it.todo('should listen for color changes')
})
