import { YeelightController } from './yeelight'

describe('Yeelight device controller', () => {
  it('should discover yeelight devices on LAN', async () => {
    const controller = new YeelightController({ debug: false })

    const devices = await controller.discover()

    console.log(devices)
    expect(devices.length > 1).toBe(true)
  })
})
