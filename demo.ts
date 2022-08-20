import { Maybe, all, Some, None } from './maybe'

const fn = (x: Maybe<number>) => x.then(x => x + 1)

const xs = all(Some(1), Some(`gosho`), Some(true))
console.log({ xs })

console.log(String(Some(3)), String(None()))

for (const x of Some(new Map<number, string | number>([[1, 2], [2, 'gosho']])).itflat()) {
  console.log(x)
}

;(async () => {
  console.log(await Promise.resolve('BAH TAQ NEDOKLATENA MONADA'))
  const o = Some(3).then(x => x + 3).then(x => Promise.resolve(x))
  const x = await o
  console.log(x)
  for (const x of Some(10)) {
    console.log('HAHAHA', x)
  }
  const set = new Set(None())
  console.log(set)
  const z = Some(5).filter(x => x > 0)
  const y = await Promise.resolve().then(
    () => Some(10).then(x => Some(x + 3)).filter((x): x is 0 => x === 0).toString()
  )
  console.log(x, y)
})()
