export enum Transition {
  SMOOTH = 'smooth',
  SUDDEN = 'sudden',
}

export enum PowerMode {
  ON = 'on',
  OFF = 'off',
}

export enum ColorMode {
  RGB = 1,
  WHITE = 2,
  HUE_SAT = 3,
}

export type MethodOptions = { timing: number; transition: Transition }

type RGBRecord = Record<'r' | 'g' | 'b', number>
type HueSatRecord = Record<'hue' | 'sat', number>

interface BaseLight {
  id: string
  port: number
  host: string
  name?: string
  powerStatus: PowerMode
  brightness: number
}

export type LightColorModes =
  | { colorMode: ColorMode.RGB; color: RGBRecord }
  | { colorMode: ColorMode.WHITE; temperature: number }
  | { colorMode: ColorMode.HUE_SAT; color: HueSatRecord }

export type Light = BaseLight & LightColorModes

export type LightClientDisconnected = Light & {
  /** return value indicates successful connection */
  connect(): Promise<LightClientConnected>
}

export type LightClientConnected = Omit<Light, 'connect'> & {
  getStatus(): string
  setPower(status: PowerMode, options: MethodOptions): Promise<void>
  setBrightness(intensity: number, options: MethodOptions): Promise<void>
  setColor(color: string, options: MethodOptions): Promise<void>
  disconnect(): Promise<void>
}
