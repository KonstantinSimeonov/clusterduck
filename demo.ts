import { Maybe, all } from './zdr'

const fn = (x: Maybe<number>) => x.then(x => x + 1)

const xs = all(Maybe(1), Maybe(`gosho`), Maybe(true))
console.log({ xs })

console.log(String(Maybe(3)), String(Maybe()))

for (const x of Maybe(new Map<number, string | number>([[1, 2], [2, 'gosho']])).itflat()) {
  console.log(x)
}

;(async () => {
  console.log(await Promise.resolve('BAH TAQ NEDOKLATENA MONADA'))
  const o = Maybe<number>(3).then(x => x + 3).then(x => Promise.resolve(x))
  const x = await o
  console.log(x)
  for (const x of Maybe(10)) {
    console.log('HAHAHA', x)
  }
  const set = new Set(Maybe())
  console.log(set)
  const z = Maybe(5).filter(x => x > 0)
  const y = await Promise.resolve().then(
    () => Maybe(10).then(x => Maybe(x + 3)).filter((x): x is 0 => x === 0).toString()
  )
  console.log(x, y)
})()
