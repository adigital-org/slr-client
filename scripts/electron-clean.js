const fs = require('fs')

const origPath = './dist/'
const destPath = './build/dist/'

const files = fs.readdirSync(origPath)

const fileTypesToMove = ['exe', 'AppImage', 'zip', 'tar.gz']
const filesToMove = []

for (let f of files) {
  for (let fType of fileTypesToMove) {
    if (f.substr(fType.length*-1) === fType) filesToMove.push(f)
  }
}

console.log('Found ' + filesToMove.length + ' file(s) to copy.')
if (filesToMove.length <= 0) return

fs.mkdirSync(destPath, { recursive: true })
for (let fMove of filesToMove) {
  console.log('Copying "' + fMove + '"...')
  fs.copyFileSync(origPath + fMove, destPath + fMove)
}

console.log('Done')