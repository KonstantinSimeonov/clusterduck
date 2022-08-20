type Either<L, R> = Left<L, R> | Right<L, R>

class Left<L, R> implements PromiseLike<R> {
  constructor(private readonly v: L) {}

  then<T>(fn: (x: R) => PromiseLike<T>): Promise<T>
  then<T>(fn: (x: R) => (T | Either<L, T>)): Either<L, T>
  then<T>(fn: (x: R) => (T | Either<L, T>)): Either<L, T> | Promise<R> {
    return this as any
  }

  catch<T>(fn: (x: L) => PromiseLike<T>): Promise<T>
  catch<T>(fn: (x: L) => (T | Either<L, T>)): Either<L, T>
  catch<T>(fn: (x: L) => (T | Either<L, T>)): Either<L, T> | Promise<R> {
    const r = fn(this.v)
    if (r instanceof Right || r instanceof Left || r instanceof Promise) return r
    return new Right<L, T>(r)
  }

  mapLeft<T>(fn: (x: L) => T): Either<T, R> {
    return new Left(fn(this.v))
  }

  filter<T extends R>(predicate: (x: R) => x is T): Either<Error, T>
  filter(predicate: (x: R) => boolean): Either<Error, R>
  filter<E, T extends R>(predicate: (x: R) => x is T, failed: E): Either<L, T>
  filter<E>(predicate: (x: R) => boolean, failed: E): Either<E, R>
  filter<E, T extends R>(predicate: ((x: R) => boolean) | ((x: R) => x is T), failed?: E) {
    return this as any
  }

  unwrap(): undefined
  unwrap(fallback: R): R
  unwrap(...args: [] | [R]): R {
    return args.length > 0 ? args[0] : undefined
  }

  unwrapError(): L
  unwrapError(fallback: L): L
  unwrapError() {
    return this.v
  }

  toArray(): R[] {
    return []
  }

  toString(): `Left(${L extends number | string | boolean | null | undefined ? L : `string`})` {
    return `Left(${this.v})` as `Left(${L extends number | string | boolean | null | undefined ? L : `string`})`
  }

  private get [Symbol.toStringTag]() {
    return this.toString()
  }

  innerIt(): R extends Iterable<infer V> ? Iterable<V> : never {
    return { *[Symbol.iterator]() {} } as any
  }

  *[Symbol.iterator]() {
    yield this.v
  }
}

class Right<L, R> {
  constructor(private readonly v: R) {}

  then<T>(fn: (x: R) => PromiseLike<T>): Promise<T>
  then<T>(fn: (x: R) => (T | Either<L, T>)): Either<L, T>
  then<T>(fn: (x: R) => (T | Either<L, T>)): Either<L, T> | Promise<T> {
    const r = fn(this.v)
    if (r instanceof Right || r instanceof Left || r instanceof Promise) return r
    return new Right(r)
  }

  catch<T>(fn: (x: L) => PromiseLike<T>): Promise<T>
  catch<T>(fn: (x: L) => (T | Either<L, T>)): Either<L, T>
  catch<T>(fn: (x: L) => (T | Either<L, T>)): Either<L, T> | Promise<R> {
    return this as any
  }

  mapLeft<T>(fn: (x: L) => T): Either<T, R> {
    return this as any
  }

  filter<T extends R>(predicate: (x: R) => x is T): Either<Error, T>
  filter(predicate: (x: R) => boolean): Either<Error, R>
  filter<E, T extends R>(predicate: (x: R) => x is T, failed: E): Either<L, T>
  filter<E>(predicate: (x: R) => boolean, failed: E): Either<E, R>
  filter<E, T extends R>(predicate: ((x: R) => boolean) | ((x: R) => x is T), failed?: E) {
    return predicate(this.v) ? this as any : new Left(failed || new Error(`Either predicate returned false`))
  }

  unwrap(): R
  unwrap(fallback: R): R
  unwrap(): R {
    return this.v
  }

  unwrapError(): undefined
  unwrapError(fallback: L): L
  unwrapError() {
    return undefined
  }

  toArray(): R[] {
    return [this.v]
  }

  toString(): `Right(${L extends number | string | boolean | null | undefined ? L : `string`})` {
    return `Right(${this.v})` as `Right(${L extends number | string | boolean | null | undefined ? L : `string`})`
  }

  private get [Symbol.toStringTag]() {
    return this.toString()
  }

  innerIt(): R extends Iterable<infer V> ? Iterable<V> : never {
    return (Symbol.iterator in Object(this.v)
      ? this.v
      : {
          *[Symbol.iterator]() {}
        }) as any
  }

  *[Symbol.iterator]() {}
}

;(async () => {
  const x = await new Right(10)
  console.log(x)
})()
