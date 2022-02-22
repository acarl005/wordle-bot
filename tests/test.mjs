const { default: test } = await import("ava")

const { GameLoop } = await import("../src/game-loop.mjs")
const { GameMaster } = await import("../src/game-master.mjs")
const { Player } = await import("../src/player.mjs")
const { loadWords, loadWordData } = await import("../src/utilz.mjs")


const { guessSet } = await loadWords()
const wordData = await loadWordData()


class LoseGameError extends Error {}


class TestGameLoop extends GameLoop {
  onLose() {
    throw new LoseGameError(`lost game on word "${this.gameMaster.solution}"`)
  }
}


test.beforeEach(t => {
  t.context.player = new Player(guessSet, guessSet, wordData)
})

const wordsToTest = ["aroma", "death", "latch"]

for (let word of wordsToTest) {
  test(word, async t => {
    const gm = new GameMaster(guessSet, word)
    const gameLoop = new TestGameLoop(gm, t.context.player)
    await t.notThrowsAsync(gameLoop.play())
  })
}
