export class WordleTrie {
  constructor() {
    this.isMember = false
    this.isSolution = false
    this.children = {}
    this.size = 0
  }

  add(word, isSolution) {
    this.size++
    if (word === "") {
      this.isMember = true
      if (isSolution) {
        this.isSolution = true
      }
    } else {
      const nextLetter = word[0]
      if (!(nextLetter in this.children)) {
        this.children[nextLetter] = new WordleTrie
      }
      this.children[nextLetter].add(word.slice(1))
    }
  }

  contains(word) {
    if (word === "") {
      return this.isMember
    }
    const nextLetter = word[0]
    if (!(nextLetter in this.children)) {
      return false
    }
    return this.children[nextLetter].contains(word.slice(1))
  }
}
