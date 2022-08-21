import * as m from "./maybe-data"

export const Some = <T>(x: T) => new m.Some(x)
const _none = new m.None()
export const None = <T>() => _none as m.None<T>

const isNotEmpty = <T>(x: T | null | undefined | '' | []): x is T =>
  x !== undefined
    && x !== null
    && ((!Array.isArray(x) && typeof x !== `string`) || x.length > 0)
    && (typeof x !== `number` || !Number.isNaN(x))

export const fromJS = <T>(x: T) => Some(x).filter(isNotEmpty)

export const isSome = <T>(x: m.Maybe<T>): x is m.Some<T> => x instanceof m.Some

export const somes = <T>(xs: readonly m.Maybe<T>[]): T[] => xs.filter(isSome).map(x => x.unwrap())

type UnwrapMaybeArray<T> = T extends readonly [m.Maybe<infer X>, ...infer XS]
  ? [X, ...UnwrapMaybeArray<XS>]
  : T extends []
    ? []
    : T extends Array<m.Maybe<infer U>>
      ? U[]
      : never

export const all = <T extends readonly m.Maybe<unknown>[]>(...maybes: T): m.Maybe<UnwrapMaybeArray<T>> => {
  const ms = maybes.filter(isSome)
  return ms.length === maybes.length ? Some(ms.map(m => m.unwrap()) as UnwrapMaybeArray<T>) : None()
}
