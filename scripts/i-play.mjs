const { Player } = await import("../src/player.mjs")
const { loadWords } = await import("../src/utilz.mjs")

const { solutionSet, guessSet } = loadWords()

let player = new Player(guessSet, solutionSet)
