export type Maybe<T> = Some<T> | None<T>

class Some<T> implements PromiseLike<T> {
  constructor(private readonly v: T) {}

  then<R>(fn: (x: T) => Promise<R>): Promise<R>
  then<R>(fn: (x: T) => (R | Maybe<R>)): Maybe<R>
  then<R>(fn: (x: T) => (R | Maybe<R> | Promise<R>)): Maybe<R> | Promise<R> {
    const r = fn(this.v)
    if (r instanceof Some || r instanceof None || r instanceof Promise) return r
    return new Some(r)
  }

  catch<R>(fn: () => R): Maybe<T> {
    return this
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

  itflat(): T extends Iterable<infer V> ? Iterable<V> : Iterable<never> {
    return (Symbol.iterator in Object(this.v)
      ? this.v
      : {
          *[Symbol.iterator]() {}
        }) as any
  }

  toArray(): T[] {
    return [this.v]
  }

  toString(): `Some(${T extends number | string | boolean | null | undefined ? T : `string`})` {
    return `Some(${this.v})` as any
  }

  private get [Symbol.toStringTag]() {
    return this.toString()
  }

  *[Symbol.iterator]() {
    yield this.v
  }
}

class None<T> implements PromiseLike<T> {
  then<R>(fn: (x: T) => Promise<R>): Promise<R>
  then<R>(fn: (x: T) => (R | Maybe<R>)): Maybe<R>
  then() {
    return this as any
  }

  catch<R>(fn: () => (R | Maybe<R>)): Maybe<R> {
    const r = fn()
    return (r instanceof Some || r instanceof None) ? r : new Some(r)
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

  innerIt(): T extends Iterable<infer V> ? Iterable<V> : Iterable<never> {
    return { *[Symbol.iterator]() {} } as any
  }

  toArray(): T[] {
    return []
  }

  toString(): `None` {
    return `None`
  }

  private get [Symbol.toStringTag]() {
    return this.toString()
  }

  *[Symbol.iterator]() {}
}

type MaybeFn = {
  <T>(): None<T>
  <T>(x: T): Some<T>
}

export const Maybe: MaybeFn = <T>(...args: [] | [T]): any =>
  args.length === 0 ? new None<T>() : new Some(args[0])

const isNotEmpty = <T>(x: T | null | undefined | '' | []): x is T =>
  x !== undefined
    && x !== null
    && ((!Array.isArray(x) && typeof x !== `string`) || x.length === 0)
    && (typeof x !== `number` || Number.isNaN(x))

export const fromJS = <T>(x: T) => new Some(x).filter(isNotEmpty)

const y = fromJS("asd" as string | undefined)

type IsSomeFn = {
  (x: unknown): x is Some<unknown>
  <T>(x: Maybe<T>): x is Some<T>
}
export const isSome: IsSomeFn = <T>(x: unknown): x is Some<T> => x instanceof Some

export const somes = <T>(xs: readonly Maybe<T>[]): T[] => xs.filter(isSome).map(x => x.unwrap())

type All<T> = T extends readonly [Maybe<infer X>, ...infer XS] ? [X, ...All<XS>] : []

export const all = <T extends readonly Maybe<unknown>[]>(...maybes: T): Maybe<All<T>> => {
  const ms = maybes.filter(isSome)
  return ms.length === maybes.length ? Maybe(ms) : Maybe as any
}
