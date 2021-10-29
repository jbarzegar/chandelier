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
  /** used to determine the vendor of the light -- or the adapter used */
  vendor: string
  powerStatus: PowerMode
  brightness: number
}

export type LightColorModes =
  | { colorMode: ColorMode.RGB; color: RGBRecord }
  | { colorMode: ColorMode.WHITE; temperature: number }
  | { colorMode: ColorMode.HUE_SAT; color: HueSatRecord }

export type Light = BaseLight & LightColorModes
