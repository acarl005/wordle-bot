const { default: cliProgress } = await import("cli-progress")
const { default: babar } = await import("babar")

const { GameLoop } = await import("../src/game-loop.mjs")
const { GameMaster } = await import("../src/game-master.mjs")
const { Player } = await import("../src/player.mjs")
const { loadWords } = await import("../src/utilz.mjs")
const { Counter, DefaultDict } = await import("../src/data-structs.mjs")


const { solutionArr, solutionSet, guessSet } = loadWords()


const scoreCounts = new Counter
const scoresToWords = new DefaultDict(Array)


class EvalGameLoop extends GameLoop {
  onLose() {
    throw Error(`player sucks! failed on: ${this.gameMaster.solution}`)
  }
  
  onWin(score) {
    scoreCounts[score]++
    scoresToWords[score].push(this.gameMaster.solution)
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

console.log(scoreCounts)
const barData = Object.entries(scoreCounts).map(([k, v]) => [+k, v])
console.log(babar(barData, { minY: 0.00001 }))
console.log(weightedMean(scoreCounts))

function weightedMean(nums) {
  let numerator = 0
  let denominator = 0
  for (let [val, weight] of Object.entries(nums)) {
    numerator += (+val) * weight
    denominator += weight
  }
  return numerator / denominator
}

console.log(scoresToWords[8])
console.log(scoresToWords[7])
