const fs = await import("fs")
const { default: chalk } = await import("chalk")

const { DefaultDict } = await import("./default-dict.mjs")
const { union } = await import("./utilz.mjs")


const solutionArr = fs.readFileSync("./solutions.txt", "utf8").trim().split("\n").map(word => word.trim())
let guessSet = new Set(fs.readFileSync("./guesses.txt", "utf8").trim().split("\n").map(word => word.trim()))
guessSet = union(guessSet, solutionArr)


class PlayerError extends Error {}


const COLOR_MAP = {
  "g": "bgGreen",
  "b": "bgGrey",
  "y": "bgYellow"
}


export class GameMaster {
  static zeroDate = new Date("2021-06-19")


  static forSpecificDate(possibleGuesses, possibleSolutions, thisDate) {
    if (thisDate === undefined) {
      thisDate = new Date
    }
    const timeDiffMs = thisDate.getTime() - GameMaster.zeroDate.getTime()
    const timeDiffDays = Math.round(timeDiffMs / 1000 / 60 / 60 / 24)
    const solutionIndex = timeDiffDays % possibleSolutions.length
    return new GameMaster(possibleGuesses, possibleSolutions[solutionIndex])
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
        console.log("╔═ ═╦═ ═╦═ ═╦═ ═╦═ ═╗")
      } else {
        console.log("╠═ ═╬═ ═╬═ ═╬═ ═╬═ ═╣")
      }
      let row = []
      for (let j = 0; j < 5; j++) {
        row.push(chalk[COLOR_MAP[guess.feedback[j]]](` ${guess.word[j]} `))
      }
      console.log("║" + row.join("║") + "║")
    }
    console.log("╚═ ═╩═ ═╩═ ═╩═ ═╩═ ═╝")
  }
}


function multiMapRemove(map, key, elem) {
  map[key].delete(elem)
  if (map[key].size === 0) {
    delete map[key]
  }
}


let gm = GameMaster.forSpecificDate(guessSet, solutionArr)
