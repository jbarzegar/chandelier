import { EventEmitter } from "lib/events"

interface Device {
  id: string
  status: "on" | "off"
  color: string
  whiteBalance: string
}

type BridgeEvents = {
  devicePower: boolean
  deviceBrightness: number
  deviceColor: Record<"r" | "g" | "b", number>
  deviceWhiteBalance: number
}

export class BridgeEmitter extends EventEmitter<BridgeEvents> {}
