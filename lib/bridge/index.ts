import { IBridgeAdapter, IBridge } from 'domain/Bridge'
import { NewDevice, Device } from 'domain/Device'

export class Bridge implements IBridge {
  constructor(private adapter: IBridgeAdapter) {}
  registerDevice(device: NewDevice): Promise<Device> {
    return this.adapter.attachDevice(device)
  }
  unregisterDevice(id: string): Promise<void> {
    return this.adapter.removeDevice(id)
  }
}
