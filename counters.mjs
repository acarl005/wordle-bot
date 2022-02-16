const { List, Map } = await import("immutable")


export const ALPHABET = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
]


export class Counter {
  constructor() {
    return new Proxy({}, {
      get: (target, name) => name in target ? target[name] : 0
    })
  }
}


export function newImmutableLetterCounter() {
  let counter = new Map
  for (let ch of ALPHABET) {
    counter = counter.set(ch, 0)
  }
  return counter
}
