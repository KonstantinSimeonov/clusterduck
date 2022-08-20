import * as m from "./maybe-data"

export const Some = <T>(x: T) => new m.Some(x)
const _none = new m.None()
export const None = <T>() => _none as m.None<T>

const isNotEmpty = <T>(x: T | null | undefined | '' | []): x is T =>
  x !== undefined
    && x !== null
    && ((!Array.isArray(x) && typeof x !== `string`) || x.length === 0)
    && (typeof x !== `number` || Number.isNaN(x))

export const fromJS = <T>(x: T) => new m.Some(x).filter(isNotEmpty)

export const isSome = <T>(x: m.Maybe<T>): x is m.Some<T> => x instanceof m.Some

export const somes = <T>(xs: readonly m.Maybe<T>[]): T[] => xs.filter(isSome).map(x => x.unwrap())

type All<T> = T extends readonly [m.Maybe<infer X>, ...infer XS] ? [X, ...All<XS>] : []

export const all = <T extends readonly m.Maybe<unknown>[]>(...maybes: T): m.Maybe<All<T>> => {
  const ms = maybes.filter(isSome)
  return ms.length === maybes.length ? Some(ms.map(m => m.unwrap()) as All<T>) : None()
}
