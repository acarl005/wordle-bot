const { default: chalk } = await import("chalk")

const { DefaultDict } = await import("./data-structs.mjs")
const { loadWords } = await import("./utilz.mjs")


const { solutionArr, guessSet } = loadWords()


class PlayerError extends Error {}


const COLOR_MAP = {
  "g": str => chalk.whiteBright(chalk.bgGreen(str)),
  "b": str => chalk.whiteBright(chalk.bgGrey(str)),
  "y": str => chalk.whiteBright(chalk.bgYellow(str))
}


export class GameMaster {
  static zeroDate = new Date(2021, 5, 19, 0, 0, 0, 0)


  static forSpecificDate(possibleGuesses, possibleSolutions, thisDate) {
    if (thisDate === undefined) {
      thisDate = new Date
    } else {
      thisDate = new Date(thisDate)
    }
    const timeDiffMs = thisDate.setHours(0, 0, 0, 0) - GameMaster.zeroDate.getTime()
    const timeDiffDays = Math.floor(timeDiffMs / 1000 / 60 / 60 / 24)
    const solutionIndex = timeDiffDays % possibleSolutions.length
    const solution = possibleSolutions[solutionIndex]
    return new GameMaster(possibleGuesses, solution)
  }


  constructor(possibleGuesses, chosenSolution) {
    this.possibleGuesses = new Set(possibleGuesses)
    this.solution = chosenSolution
    this.guesses = []
  }


  guess(word) {
    if (!this.possibleGuesses.has(word)) {
      throw new PlayerError(`invalid guess: ${word}`)
    }
    const feedback = Array(5)
    const remainingLetters = new DefaultDict(Set)
    for (let i = 0; i < 5; i++) {
      const ch = this.solution[i]
      remainingLetters[ch].add(i)
    }
    for (let i = 0; i < 5; i++) {
      if (word[i] === this.solution[i]) {
        feedback[i] = "g"
        multiMapRemove(remainingLetters, word[i], i)
      }
    }
    for (let i = 0; i < 5; i++) {
      if (word[i] in remainingLetters && feedback[i] === undefined) {
        feedback[i] = "y"
        const nextPosition = remainingLetters[word[i]].values().next().value
        multiMapRemove(remainingLetters, word[i], nextPosition)
      } else if (feedback[i] === undefined) {
        feedback[i] = "b"
      }
    }
    const feedbackStr = feedback.join("")
    this.guesses.push({ word, feedback: feedbackStr })
    return feedbackStr
  }

  printPrettyFeedback() {
    for (let i = 0; i < this.guesses.length; i++) {
      const guess = this.guesses[i]
      if (i === 0) {
        console.log("╔═══╦═══╦═══╦═══╦═══╗")
      } else {
        console.log("╠═══╬═══╬═══╬═══╬═══╣")
      }
      let row = []
      for (let j = 0; j < 5; j++) {
        row.push(COLOR_MAP[guess.feedback[j]](` ${guess.word[j]} `))
      }
      console.log("║" + row.join("║") + "║")
    }
    console.log("╚═══╩═══╩═══╩═══╩═══╝")
  }
}


function multiMapRemove(map, key, elem) {
  map[key].delete(elem)
  if (map[key].size === 0) {
    delete map[key]
  }
}

