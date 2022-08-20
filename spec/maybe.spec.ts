import * as m from "../maybe"

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

describe(`Maybe`, () => {
  it(`chain unwrap`, () => {
    const cap = (x: string) => x.toUpperCase()
    const appendB = (x: string) => `${x}b`
    const data = `hello`
    expect(
      m.Some(data)
        .then(cap)
        .then(appendB)
        .unwrap()
    ).toEqual(appendB(cap(data)))
  })

  it(`can transform type with then`, () => {
    const v = m.Some(10)
      .then(x => x + 3)
      .then(x => ({ y: 2, x }))
      .then(({ x, y }) => x * y)
      .unwrap()

    expect(v).toEqual(26)
  })

  it(`None doesn't call functions`, () => {
    m.None<number>()
      .then((x): string => { throw new Error() })
      .then((x): number => { throw new Error() })
  })

  it(`then flattens the result`, () => {
    const v = m.Some(20)
      .then(x => m.Some(x * 2))
      .then(x => x + 1)
      .then(x => m.Some(x * 4))
      .then(x => x + 1)
      .then(x => m.Some(x * 10))
      .unwrap()

    expect(v).toEqual(1650)
  })

  it(`then flattens with None`, () => {
    const v = m.Some(1)
      .then(x => m.None<number>())

    expect(m.isSome(v)).toBeFalsy()
  })

  it(`None unwraps with undefined`, () => {
    expect(m.None<number>().then(() => 5).unwrap()).toBeUndefined()
  })

  it(`None unwraps with fallback`, () => {
    expect(m.None<number>().then(() => 10).unwrap(15)).toEqual(15)
  })

  it(`Can iterate inner iterable`, () => {
    const xs = [1, 2, 3]
    expect([...m.Some(xs).innerIt()]).toStrictEqual(xs)
  })

  it(`Can refine values`, () => {
    const v = m.Some(20).then(x => x + 1).filter((x): x is 21 => x === 21).unwrap(42 as const)
    const v1: 42 | 21 = v

    // @ts-expect-error
    const v2: 3 = v

    expect(v1).toEqual(21)
  })

  it(`Failed filter returns None`, () => {
    const o = m.Some(10).filter(x => x > 100)
    expect(m.isSome(o)).toBeFalsy()
  })

  it(`Can chain filters`, () => {
    const o = m.Some([1, 2]).filter(([a, b]) => a < b).filter(([a, b]) => a < 5 && b < 5)

    expect(o.unwrap()).toStrictEqual([1, 2])

    expect(m.isSome(o.filter(() => false))).toBeFalsy()
  })

  it(`Can recover with catch`, () => {
    const v = m.None<{ age: number; name: string }>()
      .catch(() => ({ age: 28, name: `Pilav` }))
      .then(pilav => ({ ...pilav, age: 29 }))
      .unwrap()

    expect(v).toMatchObject({ age: 29, name: `Pilav` })
  })

  it(`Some iterator has one entry`, () => {
    expect([...m.Some(10)]).toStrictEqual([10])
  })

  it(`None iterator is empty`, () => {
    expect([...m.None()]).toStrictEqual([])
  })

  it(`can be used with async/await`, async () => {
    const x = await m.Some(10).then(x => x + 10)
    const y = await Promise.resolve(20)
    const z = await m.None<number>().catch(() => 5)

    expect(x + y + z).toEqual(45)
  })

  it(`None breaks early from async/await`, async () => {
    // TODO: bailing in async context probably leaves
    // the promise in a pending state and leaks
    await Promise.race([
      (async () => {
        await m.None<number>()
        throw new Error(`None didn't bail`)
      })(),
      sleep(200)
    ])
  })
})
