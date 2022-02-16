const fs = await import("fs")

const { Player } = await import("./player.mjs")
const { union } = await import("./utilz.mjs")

const solutionSet = new Set(fs.readFileSync("./solutions.txt", "utf8").trim().split("\n").map(word => word.trim()))
let guessSet = new Set(fs.readFileSync("./guesses.txt", "utf8").trim().split("\n").map(word => word.trim()))
guessSet = union(guessSet, solutionSet)

let player = new Player(guessSet, solutionSet)
