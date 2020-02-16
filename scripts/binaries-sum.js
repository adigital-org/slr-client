const crypto = require('crypto')
const fs = require('fs')

const dirToSum = './build/dist/'
const sumOutput = './build/dist/checksum.txt'

// Remove previous sum
const algorithms = ['sha1','sha256','md5'];

// Read a file and calculate hashes
async function checksums(path, fileName, algs) {
  return new Promise((res, rej) => {
    const fd = fs.createReadStream(`${path}/${fileName}`);
    const digests = algs.map((c) => [c, crypto.createHash(c)]);
    digests.forEach((d) => d[1].setEncoding('hex'));

    fd.on('data', (data) => {
      digests.forEach((d) => d[1].update(data))
    });

    fd.on('end', () => {
      const fileSum = [];
      digests.forEach((d) => {
        d[1].end();
        fileSum.push([d[0], d[1].read()]);
      });

      res(fileSum);
    });
  });
}

// Calculate all hashes
async function getFilesSum(filesToSum) {
  const data = [];
  for (let f of filesToSum) {
    data.push([f, await checksums(dirToSum, f, algorithms)]);
  }
  return data;
}

// Save checksums to output file
function saveSums(filesSums) {
  let txtData = '';
  for (let fileSums of filesSums) {
    txtData += fileSums[0] + '\n';
    fileSums[1].forEach((sum) => txtData += `    => ${sum[0]}: ${sum[1]}\n`);
    txtData += '\n'
  }
  fs.writeFileSync(sumOutput, txtData, {"encoding": "utf8"})
}

try {
  // Delete checksum file if exists
  if (fs.existsSync(sumOutput)) fs.unlinkSync(sumOutput)

  // Read dir, calculate checksums and save file
  const filesToSum = fs.readdirSync(dirToSum);
  if (filesToSum.length > 0) getFilesSum(filesToSum).then((filesSums) => saveSums(filesSums));
  else console.log('No files to summarize found in ' + dirToSum)
} catch(e) {
  console.log('Fatal error. Folder ' + dirToSum + ' not found?')
}