const fs = await import("fs")
const path = await import("path")
const { fileURLToPath } = await import("url")

const { default: csv } = await import("@fast-csv/parse")


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


export function intersect(s1, s2) {
  const result = new Set
  s1 = new Set(s1)
  s2 = new Set(s2)
  const un = union(s1, s2)
  for (let el of un) {
    if (s1.has(el) && s2.has(el)) {
      result.add(el)
    }
  }
  return result
}


const defaultSolutionFilePath = path.join(__dirname, "..", "word-lists", "solutions.txt")
const defaultGuessFilePath = path.join(__dirname, "..", "word-lists", "guesses.txt")

export async function loadWords(solutionFilePath = defaultSolutionFilePath, guessFilePath = defaultGuessFilePath) {
  const solutionArr = (await fs.promises.readFile(solutionFilePath, "utf8"))
    .trim().split("\n").map(word => word.trim())
  const solutionSet = new Set(solutionArr)
  let guessSet = new Set(
    (await fs.promises.readFile(guessFilePath, "utf8"))
      .trim().split("\n").map(word => word.trim())
  )
  guessSet = union(guessSet, solutionSet)
  return { solutionArr, solutionSet, guessSet }
}


const defaultWordDataPath = path.join(__dirname, "..", "word-lists", "word-data.csv")

export async function loadWordData(wordDataPath = defaultWordDataPath) {
  const rawData = await loadCSV(wordDataPath)
  const header = rawData.shift()
  const headerMap = {}
  for (let i = 0; i < header.length; i++) {
    headerMap[header[i]] = i
  }
  const wordData = {}
  for (let row of rawData) {
    wordData[row[headerMap.word]] = {
      freq: +row[headerMap.freq],
      plural: +row[headerMap.plural],
      pastTense: +row[headerMap.pastTense],
      isName: +row[headerMap.isName],
    }
  }
  return wordData
}


function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = []
    fs.createReadStream(filePath)
      .pipe(csv.parse())
      .on("error", error => reject(error))
      .on("data", row => rows.push(row))
      .on("end", () => resolve(rows));
  })
}


export function logistic(x, k, m) {
  return 1 / (1 + Math.exp(-1 * k * (x - m)))
}
