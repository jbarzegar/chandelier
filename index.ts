import { YeelightDeviceManager } from './lib/device-adapters/yeelight'

const d = new YeelightDeviceManager()

d.sync().then(console.log)
