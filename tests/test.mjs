const { default: test } = await import("ava")

const { GameLoop } = await import("../src/game-loop.mjs")
const { GameMaster } = await import("../src/game-master.mjs")
const { Player } = await import("../src/player.mjs")
const { loadWords } = await import("../src/utilz.mjs")

const { solutionArr, solutionSet, guessSet } = loadWords()


class LoseGameError extends Error {}


class TestGameLoop extends GameLoop {
  onLose() {
    throw new LoseGameError(`lost game on word "${this.gameMaster.solution}"`)
  }
}


test.beforeEach(t => {
  t.context.player = new Player(guessSet, solutionSet)
})

const wordsToTest = ["aroma", "death", "latch"]

for (let word of wordsToTest) {
  test(word, async t => {
    const gm = new GameMaster(guessSet, word)
    const gameLoop = new TestGameLoop(gm, t.context.player)
    await t.notThrowsAsync(gameLoop.play())
  })
}
