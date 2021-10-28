import { EventEmitter as EE } from 'events'

type EventMap = Record<string, any>

type EventKey<T extends EventMap> = string & keyof T
type EventReceiver<T> = (params: T) => void

export interface IEventEmitter<T extends EventMap> {
  on<K extends EventKey<T>>(
    eventName: K,
    fn: EventReceiver<T[K]>
  ): IEventEmitter<T>
  off<K extends EventKey<T>>(
    eventName: K,
    fn: EventReceiver<T[K]>
  ): IEventEmitter<T>
  emit<K extends EventKey<T>>(eventName: K, params?: T[K]): boolean
  once<K extends EventKey<T>>(eventName: K, params: T[K]): IEventEmitter<T>
}

export abstract class EventEmitter<T extends EventMap>
  implements IEventEmitter<T>
{
  private emitter = new EE() as IEventEmitter<T>
  on<K extends EventKey<T>>(
    eventName: K,
    fn: EventReceiver<T[K]>
  ): IEventEmitter<T> {
    const _ = this.emitter.on(eventName, fn)
    return _
  }
  off<K extends EventKey<T>>(
    eventName: K,
    fn: EventReceiver<T[K]>
  ): IEventEmitter<T> {
    const _ = this.emitter.off(eventName, fn)
    return _
  }
  once<K extends EventKey<T>>(eventName: K, params: T[K]): IEventEmitter<T> {
    const _ = this.emitter.once(eventName, params)
    return _
  }
  emit<K extends EventKey<T>>(eventName: K, params?: T[K]): boolean {
    const _ = this.emitter.emit(eventName, params)
    return _
  }
}
