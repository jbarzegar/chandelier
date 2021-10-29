import { YeelightDeviceManager } from './yeelight'

describe('Yeelight device manager', () => {
  it('should discover yeelight devices on LAN', async () => {
    const manager = new YeelightDeviceManager({ debug: true })

    const devices = await manager.sync()

    expect(devices.length > 1).toBe(true)
  })
})
