const fs = await import("fs")
const path = await import("path")
const { fileURLToPath } = await import("url")


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export function maxKeyByVal(obj) {
  let maxKey = Object.keys(obj)[0]
  let maxVal = obj[maxKey]
  for (let [k, v] of Object.entries(obj)) {
    if (v > maxVal) {
      maxKey = k
      maxVal = v
    }
  }
  return maxKey
}


export function findIndices(word, ch) {
  return [...word.matchAll(ch)].map(m => m.index)
}


export function areDisjoint(s1, s2) {
  for (let el of s1) {
    if (s2.has(el)) {
      return false
    }
  }
  return true
}


export function union(s1, s2) {
  const unionSet = new Set
  for (let el of s1) {
    unionSet.add(el)
  }
  for (let el of s2) {
    unionSet.add(el)
  }
  return unionSet
}


const defaultSolutionFilePath = path.join(__dirname, "..", "word-lists", "solutions.txt")
const defaultGuessFilePath = path.join(__dirname, "..", "word-lists", "guesses.txt")

export function loadWords(solutionFilePath = defaultSolutionFilePath, guessFilePath = defaultGuessFilePath) {
  const solutionArr = fs.readFileSync(solutionFilePath, "utf8").trim().split("\n").map(word => word.trim())
  const solutionSet = new Set(solutionArr)
  let guessSet = new Set(fs.readFileSync(guessFilePath, "utf8").trim().split("\n").map(word => word.trim()))
  guessSet = union(guessSet, solutionSet)
  return { solutionArr, solutionSet, guessSet }
}
