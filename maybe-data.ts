export type Maybe<T> = Some<T> | None<T>

export class Some<T> implements PromiseLike<T> {
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

  innerIt(): T extends Iterable<infer V> ? Iterable<V> : never {
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
    return `Some(${this.v})` as `Some(${T extends number | string | boolean | null | undefined ? T : `string`})`
  }

  private get [Symbol.toStringTag]() {
    return this.toString()
  }

  *[Symbol.iterator]() {
    yield this.v
  }
}

export class None<T> implements PromiseLike<T> {
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

  innerIt(): T extends Iterable<infer V> ? Iterable<V> : never {
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
