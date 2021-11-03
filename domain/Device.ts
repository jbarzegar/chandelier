import { Light } from './Light'

type _Device = { id: string; hwId: string }

export type Device = _Device & ({ type: 'light' } & Light)
