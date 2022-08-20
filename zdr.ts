type It<T> = {
  next(): { done: true; value: undefined } | { done: false; value: T }
}

type Maybe<T> = Some<T> | None<T>

class Some<T> implements PromiseLike<T> {
  constructor(private readonly v: T) {}

  then<R>(fn: (x: T) => Promise<R>): Promise<R>
  then<R>(fn: (x: T) => (R | Maybe<R>)): Maybe<R>
  then<R>(fn: (x: T) => (R | Maybe<R> | Promise<R>)): Maybe<R> | Promise<R> {
    const r = fn(this.v)
    if (r instanceof Some || r instanceof None || r instanceof Promise) return r
    return new Some(r)
  }

  unwrap(): T
  unwrap(fallback: T): T
  unwrap(): T {
    return this.v
  }

  filter<R extends T>(predicate: (x: T) => x is R): Maybe<R>
  filter(predicate: (x: T) => boolean): Maybe<T>
  filter<R extends T = T>(predicate: ((x: T) => boolean) | ((x: T) => x is R)) {
    return predicate(this.v) ? new Some(this.v) : new None<T>()
  }

  itflat(): T extends Iterable<infer V> ? Iterator<V> : Iterator<never> {
    return Symbol.iterator in Object(this.v)
      ? this.v[Symbol.iterator]()
      : {
        next: () => ({ done: true, value: undefined })
      }
  }

  toArray(): T[] {
    return [this.v]
  }

  toString(): `Some(${T extends number | string | boolean | null | undefined ? T : `string`})` {
    return `Some(${this.v})` as any
  }

  *[Symbol.iterator]() {
    yield this.v
  }
}

class None<T> implements PromiseLike<T> {
  // todo fix this promise dog shit
  then<R>(fn: (x: T) => Promise<R>): Promise<R>
  then<R>(fn: (x: T) => (R | Maybe<R>)): Maybe<R>
  then() {
    return this as any
  }

  unwrap(): undefined
  unwrap(fallback: T): T
  unwrap(...args: [] | [T]): T | undefined {
    if (args.length > 0) return args[0]
  }

  filter<R extends T>(predicate: (x: T) => x is R): Maybe<R>
  filter(predicate: (x: T) => boolean): Maybe<T>
  filter() {
    return this as any
  }

  itflat(): T extends Iterable<infer V> ? Iterator<V> : Iterator<never> {
    return { next: () => ({ done: true, value: undefined }) } as any
  }

  toArray(): T[] {
    return []
  }

  toString(): `None` {
    return `None`
  }

  *[Symbol.iterator]() {}
}

type MaybeFn = {
  <T>(): None<T>
  <T>(x: T): Some<T>
}

const Maybe: MaybeFn = <T>(...args: [] | [T]): any =>
  args.length === 0 ? new None<T>() : new Some(args[0])

const isEmpty = <T>(x: T) =>
  x === undefined
    || x === null
    || ((Array.isArray(x) || typeof x === `string`) && x.length === 0)
    || (typeof x === `number` && Number.isNaN(x))

const fromJS = <T>(x: T) => isEmpty(x) ? new Some(x): new None<T>()

type IsSomeFn = {
  (x: unknown): x is Some<unknown>
  <T>(x: Maybe<T>): x is Some<T>
}
const isSome: IsSomeFn = <T>(x: unknown): x is Some<T> => x instanceof Some

const somes = <T>(xs: readonly Maybe<T>[]): T[] => xs.filter(isSome).map(x => x.unwrap())

type All<T> = T extends readonly [Maybe<infer X>, ...infer XS] ? [X, ...All<XS>] : []

const all = <T extends readonly Maybe<unknown>[]>(...maybes: T): Maybe<All<T>> => {
  const ms = maybes.filter(isSome)
  return ms.length === maybes.length ? Maybe(ms) : Maybe as any
}

const xs = all(Maybe(1), Maybe(`gosho`), Maybe(true))

;(async () => {
  console.log(await Promise.resolve('BAH TAQ NEDOKLATENA MONADA'))
  const o = Maybe<number>().then(x => x + 3).then(x => Promise.resolve(x))
  const x = await o
  console.log(x)
  //for (const x of Maybe()) {
  //  console.log('HAHAHA')
  //}
  //const set = new Set(Maybe())
  //console.log(set)
  //const z = Maybe(5).filter(x => x > 0)
  //const y = await Promise.resolve().then(
  //  () => Maybe(10).then(x => Maybe(x + 3)).filter((x): x is 0 => x === 0).toString()
  //)
  //console.log(x, y)
})()
