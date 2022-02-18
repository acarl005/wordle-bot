const { List } = await import("immutable")

const { WordleTrie } = await import("./trie.mjs")
const { ALPHABET, Counter, newImmutableLetterCounter } = await import("./data-structs.mjs")
const { maxKeyByVal, findIndices, areDisjoint, loadWords, intersect } = await import("./utilz.mjs")


const { solutionSet, guessSet } = loadWords()


export class Player {

  static greenVal = 1.2
  static yellowVal = 1

  constructor(guessSet, solutionSet) {
    this.solutionTrie = new WordleTrie
    this.guessTrie = new WordleTrie

    // all solutions are also guesses
    for (let solution of solutionSet) {
      this.solutionTrie.add(solution)
    }

    for (let guess of guessSet) {
      this.guessTrie.add(guess)
    }
    this.feedbacks = []
    this.knowledge = { blacks: new Set, yellows: {}, greens: {}, greensInv: {} }
    this.computeStats(solutionSet)
  }


  computeStats(solutionSet) {
    this.masterWordLetterCounter = Object.fromEntries(ALPHABET.map(ch => [ch, new Counter]))
    this.positionLetterCounts = Array(5).fill().map(() => new Counter)
    for (let solution of solutionSet) {
      const wordLetterCounter = new Counter
      for (let i = 0; i < solution.length; i++) {
        const letter = solution[i]
        this.positionLetterCounts[i][letter]++
        wordLetterCounter[letter]++
      }
      for (let [ch, count] of Object.entries(wordLetterCounter)) {
        for (let i = 1; i <= count; i++) {
          this.masterWordLetterCounter[ch][i]++
        }
      }
    }
  }


  calculateMaxValueGuess(verbose) {
    const maxValInfo = this._calculateMaxValueGuess(this.remainingSolutionTrie || this.guessTrie, newImmutableLetterCounter(), 0, 0, new List, verbose)
    maxValInfo.debug = Array.from(maxValInfo.debug)
    return maxValInfo
  }

  _calculateMaxValueGuess(guessTrie, letterCounter, sumExpectedValue, wordPosition, debugList) {
    if (wordPosition === 5) {
      return { word: "", value: sumExpectedValue, debug: debugList }
    }
    const childVals = {}
    const childDebug = {}
    for (let nextLetter in guessTrie.children) {
      if (this.knowledge.blacks.has(nextLetter)) {
        continue
      }
      let countForThisLetter = letterCounter.get(nextLetter) + 1
      const updatedLetterCounter = letterCounter.set(nextLetter, countForThisLetter)
      if (nextLetter in this.knowledge.greensInv && !this.knowledge.greensInv[nextLetter].has(wordPosition)) {
        countForThisLetter++
      }
      const greenWeight = this.positionLetterCounts[wordPosition][nextLetter]
      const yellowWeight = this.masterWordLetterCounter[nextLetter][countForThisLetter]
      let greenVal = greenWeight * Player.greenVal
      let yellowVal = yellowWeight * Player.yellowVal
      if (wordPosition in this.knowledge.greens) {
        greenVal = 0
        if (this.knowledge.greens[wordPosition] === nextLetter) {
          yellowVal = 0
        }
      }
      if (nextLetter in this.knowledge.yellows) {
        if (this.knowledge.yellows[nextLetter].positions.has(wordPosition)) {
          yellowVal = 0
          greenVal = 0
        } else {
          yellowVal /= (this.knowledge.yellows[nextLetter].positions.size + 1)
        }
      }
      const expectedValue = greenVal + yellowVal
      const { word, value, debug } = this._calculateMaxValueGuess(guessTrie.children[nextLetter], updatedLetterCounter, sumExpectedValue + expectedValue, wordPosition + 1, debugList.push([expectedValue, `${yellowVal} (${yellowWeight} * ${Player.yellowVal})`, `${greenVal} (${greenWeight} * ${Player.greenVal})`]))
      if (value !== undefined) {
        childVals[nextLetter + word] = value
        childDebug[nextLetter + word] = debug
      }
    }
    if (Object.keys(childVals).length === 0) {
      return { word: "", value: undefined, debug: undefined }
    }
    const maxWord = maxKeyByVal(childVals)
    return { word: maxWord, value: childVals[maxWord], debug: childDebug[maxWord] }
  }

  getRemainingCandidates() {
    const candidates = []
    this._getRemainingCandidates(this.solutionTrie, "", 0, candidates)
    return candidates
  }

  _getRemainingCandidates(solutionTrie, prefix, wordPosition, foundCandidates) {
    if (wordPosition === 5 && this.satisfiesYellows(prefix)) {
      foundCandidates.push(prefix)
      return
    }

    if (wordPosition in this.knowledge.greens) {
      let nextLetter = this.knowledge.greens[wordPosition]
      if (nextLetter in solutionTrie.children) {
        this._getRemainingCandidates(solutionTrie.children[nextLetter], prefix + nextLetter, wordPosition + 1, foundCandidates)
      }
    }
    else {
      for (let nextLetter in solutionTrie.children) {
        if (!this.knowledge.blacks.has(nextLetter) && !(nextLetter in this.knowledge.yellows && this.knowledge.yellows[nextLetter].positions.has(wordPosition))) {
          this._getRemainingCandidates(solutionTrie.children[nextLetter], prefix + nextLetter, wordPosition + 1, foundCandidates)
        }
      }
    }
  }

  satisfiesYellows(word) {
    const wordCounter = new Counter
    for (let ch of word) {
      wordCounter[ch]++
    }
    for (let [ch, info] of Object.entries(this.knowledge.yellows)) {
      const indices = findIndices(word, ch)
      if (wordCounter[ch] < info.atLeast || !areDisjoint(indices, info.positions) || (info.atMost && info.atMost < wordCounter[ch])) {
        return false
      }
    }
    return true
  }

  giveFeedback(wordGuessed, colors) {
    const feedback = []
    for (let i = 0; i < 5; i++) {
      feedback.push({ letter: wordGuessed[i], color: colors[i] })
    }
    this.feedbacks.push(feedback)
    const newKnowledge = structuredClone(this.knowledge)
    const allYellows = new Counter
    const allGreens = new Counter
    const allBlacks = new Set
    for (let { letter, color } of feedback) {
      if (color === "y") {
        allYellows[letter]++
      }
      if (color === "b") {
        allBlacks.add(letter)
      }
      if (color === "g") {
        allGreens[letter]++
      }
    }
    for (let i = 0; i < feedback.length; i++) {
      const { letter, color } = feedback[i]
      if (color === "b" && allYellows[letter] === 0 && allGreens[letter] === 0) {
        newKnowledge.blacks.add(letter)
      }
      if (color === "y") {
        const atLeast = allYellows[letter] + allGreens[letter]
        if (!(letter in newKnowledge.yellows)) {
          newKnowledge.yellows[letter] = { positions: new Set }
        }
        newKnowledge.yellows[letter].positions.add(i)
        newKnowledge.yellows[letter].atLeast = Math.max(atLeast, this.knowledge.yellows[letter]?.atLeast || 0)
        if (allBlacks.has(letter)) {
          newKnowledge.yellows[letter].atMost = atLeast
        }
      }
      if (color === "g") {
        newKnowledge.greens[i] = letter
        if (!(letter in newKnowledge.greensInv)) {
          newKnowledge.greensInv[letter] = new Set
        }
        newKnowledge.greensInv[letter].add(i)
        if (allBlacks.has(letter) && !allYellows[letter]) {
          const exactCount = allGreens[letter]
          if (!(letter in newKnowledge.yellows)) {
            newKnowledge.yellows[letter] = { positions: new Set }
          }
          for (let i of intersect(findIndices(colors, "b"), findIndices(wordGuessed, letter))) {
            newKnowledge.yellows[letter].positions.add(i)
          }
          newKnowledge.yellows[letter].atLeast = exactCount
          newKnowledge.yellows[letter].atMost = exactCount
        }
      }
    }
    this.knowledge = newKnowledge
    const remainingCandidates = this.getRemainingCandidates()
    this.computeStats(remainingCandidates)
    if (remainingCandidates.length < 5) {
      this.remainingSolutionTrie = new WordleTrie
      for (let candidate of remainingCandidates) {
        this.remainingSolutionTrie.add(candidate)
      }
    }
  }
}
