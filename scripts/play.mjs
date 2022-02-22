const { program, InvalidArgumentError } = await import("commander")
const { default: prompts } = await import("prompts")

const { GameLoop } = await import("../src/game-loop.mjs")
const { GameMaster } = await import("../src/game-master.mjs")
const { Player } = await import("../src/player.mjs")
const { loadWords, loadWordData } = await import("../src/utilz.mjs")


const { guessSet, solutionArr } = await loadWords()
const wordData = await loadWordData()


function validateWord(val) {
  if (val.length !== 5) {
    throw new InvalidArgumentError("Word must be 5 letters.")
  }
  return val
}

function parseDate(val) {
  const d = new Date(val)
  if (isNaN(d)) {
    throw new InvalidArgumentError("Invalid date")
  }
  return new Date(val)
}

program
  .option("-w, --word <word>", "The word to set the solution to.", validateWord)
  .option("-d, --date <YYYY-mm-dd>", "Pick the solution based on this date.", parseDate)
  .option("--no-bot", "Play without suggestions.")
  .option("-o --optimal", "Automatically take the optimal suggestions.")

program.parse(process.argv)

const options = program.opts()

let gm
if (options.word) {
  gm = new GameMaster(guessSet, options.word)
} else if (options.date) {
  gm = GameMaster.forSpecificDate(guessSet, solutionArr, options.date)
} else {
  gm = GameMaster.forSpecificDate(guessSet, solutionArr)
}


class InteractiveGameLoop extends GameLoop {
  async nextGuess(maxValGuess) {
    if (options.bot) {
      console.log(maxValGuess)
    }
    if (options.optimal) {
      return super.nextGuess(maxValGuess)
    }
    const response = await prompts({
      type: "text",
      name: "guess",
      message: "Please enter a 5-letter word.",
      validate: value => {
        if (value.length !== 5) {
          return "Word must be 5 letters long." 
        }
        if (!guessSet.has(value)) {
          return `"${value}" is not a word.`
        }
        return true
      }
    })
    return response.guess.toLowerCase()
  }

  onWin(score) {
    this.gameMaster.printPrettyFeedback()
    console.log(`You win!! You got it in ${score}`)
  }

  onLose() {
    console.log(`Loser!!! The word was "${this.gameMaster.solution}".`)
  }

  endTurn() {
    this.gameMaster.printPrettyFeedback()
    //this.player.printKnowledge()
  }
}


const player = new Player(guessSet, guessSet, wordData)
const gameLoop = new InteractiveGameLoop(gm, player)

await gameLoop.play()
