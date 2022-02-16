const fs = await import("fs")

const { GameMaster } = await import("./game-master.mjs")
const { Player } = await import("./player.mjs")
const { union } = await import("./utilz.mjs")


const solutionArr = fs.readFileSync("./solutions.txt", "utf8").trim().split("\n").map(word => word.trim())
const solutionSet = new Set(solutionArr)
let guessSet = new Set(fs.readFileSync("./guesses.txt", "utf8").trim().split("\n").map(word => word.trim()))
guessSet = union(guessSet, solutionSet)


const scores = []

for (let solution of solutionArr) {
  const gm = new GameMaster(guessSet, solution)
  const player = new Player(guessSet, solutionSet)
  for (let i = 0; i < 11; i++) {
    if (i === 10) {
      throw Error(`player sucks! failed on: ${solution}`)
    }
    const nextGuess = player.calculateMaxValueGuess().word
    const feedback = gm.guess(nextGuess)
    if (feedback === "ggggg") {
      scores.push(i + 1)
      break
    }
    player.giveFeedback(nextGuess, feedback)
  }
}

console.log()

function mean(nums) {
  return nums.reduce((acc, el) => acc + el) / nums.length
}
