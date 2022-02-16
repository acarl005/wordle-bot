const { GameLoop } = await import("../src/game-loop.mjs")
const { GameMaster } = await import("../src/game-master.mjs")
const { Player } = await import("../src/player.mjs")
const { loadWords } = await import("../src/utilz.mjs")


const { solutionArr, solutionSet, guessSet } = loadWords()


const scores = []


class EvalGameLoop extends GameLoop {
  onLose() {
    throw Error(`player sucks! failed on: ${this.gameMaster.solution}`)
  }
  
  onWin(score) {
    scores.push(score)
  }
}

for (let solution of solutionArr) {
  const gm = new GameMaster(guessSet, solution)
  const player = new Player(guessSet, solutionSet)
  const gameLoop = new EvalGameLoop(gm, player, 10)
  await gameLoop.play()
}

console.log(mean(scores))

function mean(nums) {
  return nums.reduce((acc, el) => acc + el) / nums.length
}
