import { IBridgeAdapter } from 'domain/Bridge'
import { NewDevice, Device } from 'domain/Device'

export class MockBridgeAdapter implements IBridgeAdapter {
  async attachDevice(device: NewDevice): Promise<Device> {
    return { ...device, bridgeId: '1234' }
  }
  removeDevice(id: string): Promise<void> {
    return Promise.resolve()
  }
}
