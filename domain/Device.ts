import { DistributiveOmit } from 'types'
import { Light } from './Light'

type _Device = { id: string; hwId: string; bridgeId: string }

export type Device = _Device & ({ type: 'light' } & Light)

export type NewDevice = DistributiveOmit<Device, 'bridgeId'>
