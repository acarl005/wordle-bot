const fs = await import("fs")
const { program, InvalidArgumentError } = await import("commander")
const { default: prompts } = await import("prompts")

const { GameMaster } = await import("./game-master.mjs")
const { Player } = await import("./player.mjs")
const { union } = await import("./utilz.mjs")


const solutionArr = fs.readFileSync("./solutions.txt", "utf8").trim().split("\n").map(word => word.trim())
const solutionSet = new Set(solutionArr)
let guessSet = new Set(fs.readFileSync("./guesses.txt", "utf8").trim().split("\n").map(word => word.trim()))
guessSet = union(guessSet, solutionSet)

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

program.parse(process.argv)

const options = program.opts()

let gm
if (options.word) {
  gm = new GameMaster(guessSet, options.word)
} else if (options.date) {
  gm = GameMaster.forSpecificDate(guessSet, solutionArr, options.date)
} else {
  gm = GameMaster.forSpecificDate(guessSet, solutionArr, new Date)
}

const player = new Player(guessSet, solutionSet)
for (let i = 0; i < 6; i++) {
  const maxValGuess = player.calculateMaxValueGuess()
  console.log(maxValGuess)
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
  response.guess = response.guess.toLowerCase()
  const feedback = gm.guess(response.guess)
  player.giveFeedback(response.guess, feedback)
  gm.printPrettyFeedback()
  if (feedback === "ggggg") {
    process.exit(0)
  }
}
