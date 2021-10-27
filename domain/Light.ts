export type PowerMode = 'off' | 'on'
export type Transition = 'smooth' | 'sudden'
export type MethodOptions = { timing: number; transition: Transition }

export interface Light {
  id: string
  port: number
  host: string
  name?: string
  status: PowerMode
}

export interface LightClientDisconnected extends Light {
  /** return value indicates successful connection */
  connect(): Promise<LightClientConnected>
}

export interface LightClientConnected extends Omit<Light, 'connect'> {
  getStatus(): string
  setPower(status: PowerMode, options: MethodOptions): Promise<void>
  setBrightness(intensity: number, options: MethodOptions): Promise<void>
  setColor(color: string, options: MethodOptions): Promise<void>
  disconnect(): Promise<void>
}
