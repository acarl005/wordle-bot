// abstract class
export class GameLoop {
  constructor(gameMaster, player, maxGuesses = 6) {
    this.gameMaster = gameMaster
    this.player = player
    this.maxGuesses = maxGuesses
  }

  async play() {
    for (let i = 0; i <= this.maxGuesses; i++) {
      if (i === this.maxGuesses) {
        return this.onLose()
      }
      const maxValGuess = this.player.calculateMaxValueGuess()
      const nextGuess = await this.nextGuess(maxValGuess)
      const feedback = this.gameMaster.guess(nextGuess)
      if (feedback === "ggggg") {
        this.onWin(i + 1)
        break
      }
      this.player.giveFeedback(nextGuess, feedback)
      this.endTurn()
    }
  }

  async nextGuess(maxValGuess) {
    return maxValGuess.word
  }

  endTurn() {}

  onLose() {
    throw Error("not implemented")
  }
  
  onWin(i) {}
}

