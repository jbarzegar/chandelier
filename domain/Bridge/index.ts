import { EventEmitter } from 'lib/events'
import { Device, NewDevice } from 'domain/Device'
import { DistributiveOmit } from 'types'

//export type BridgeActionNames = 'on' | 'off' | 'dim' | 'color'

export type BridgeAction<A extends string = string, P extends any = any> = {
  name: A
  payload: P
}

export type BridgeActionNames = 'on' | 'off' | 'dim' | 'color'

/** Defines possible actions that the bridge can/should support */
type BridgeActionRecord<T extends BridgeAction> = Record<
  `${BridgeActionNames}Actions`,
  T[]
>

export type BridgeDevice<T extends BridgeAction = BridgeAction> = {
  id: string
  name: string
} & BridgeActionRecord<T>

/** A mapped collection of information retrieved from the bridges api. */
export type BridgeInfo = {
  name: string
  modelId: string
  bridgeId: string
  gateway: string
  macAddress: string
  ipAddress: string
  version: {
    api: string
    software: string
  }
  time: {
    zone: string
    utc: Date
    local: Date
  }
}

/** Defines the mapper fn that bindings should utilize if transformation is needed */
export type FnMapBridgeInfo<Response extends Record<any, any>> = (
  response: Response
) => BridgeInfo

type BridgeEvents = {
  devicePower: boolean
  deviceBrightness: number
  deviceColor: Record<'r' | 'g' | 'b', number>
  deviceWhiteBalance: number
}

export interface IBridge {
  registerDevice(device: NewDevice): Promise<Device>
  unregisterDevice(id: string): Promise<void>
}

export interface IBridgeAdapter {
  /** registers a new device within the bridge */
  attachDevice(device: NewDevice): Promise<Device>
  /** removes a device from the bridge */
  removeDevice(id: string): Promise<void>
}

export class BridgeEmitter extends EventEmitter<BridgeEvents> {}
