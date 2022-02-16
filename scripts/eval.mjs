const { default: cliProgress } = await import("cli-progress")

const { GameLoop } = await import("../src/game-loop.mjs")
const { GameMaster } = await import("../src/game-master.mjs")
const { Player } = await import("../src/player.mjs")
const { loadWords } = await import("../src/utilz.mjs")
const { Counter } = await import("../src/data-structs.mjs")


const { solutionArr, solutionSet, guessSet } = loadWords()


const scores = new Counter


class EvalGameLoop extends GameLoop {
  onLose() {
    throw Error(`player sucks! failed on: ${this.gameMaster.solution}`)
  }
  
  onWin(score) {
    scores[score]++
  }
}


const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
bar1.start(solutionArr.length, 0);

for (let solution of solutionArr) {
  const gm = new GameMaster(guessSet, solution)
  const player = new Player(guessSet, solutionSet)
  const gameLoop = new EvalGameLoop(gm, player, 10)
  await gameLoop.play()
  bar1.update(bar1.value + 1)
}
bar1.stop()

console.log(scores)
console.log(weightedMean(scores))

function weightedMean(nums) {
  let numerator = 0
  let denominator = 0
  for (let [val, weight] of Object.entries(nums)) {
    numerator += (+val) * weight
    denominator += weight
  }
  return numerator / denominator
}
