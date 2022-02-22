const { Player } = await import("../src/player.mjs")
const { loadWords, loadWordData } = await import("../src/utilz.mjs")


const { guessSet } = await loadWords()
const wordData = await loadWordData()

let player = new Player(guessSet, guessSet, wordData)
