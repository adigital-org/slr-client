import { countLines } from './FileLineGenerator'

export default class IntegrityChecker {
  constructor(expectedLines) {
    this.expectedLines = expectedLines
  }

  check(file) { //Resolve if check test is ok, otherwise reject.
    return new Promise((res, rej) => {
      const counting = countLines(file)
      counting.then(
        (countedLines) => {
          if (this.expectedLines === countedLines) res(true)
          else rej("Missing records.")
        }
      )
      counting.catch(() => rej("Could not open output file to check integrity."))
    })
  }
}