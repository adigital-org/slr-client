const projectPath = process.cwd().split('\\').join('/');
const buildCmd = 'docker build -t slr-client-electron-build-linux utils/ElectronJsDocker/'.split(' ');
const runCmd = `docker run --rm -v ${projectPath}:/electron-repo slr-client-electron-build-linux`.split(' ');

const call = (command, params, callback) => {
  const { spawn } = require('child_process');
  const child = spawn(command, params);

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    process.stdout.write(chunk);
  });

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => {
    process.stdout.write(chunk);
  });

  child.on('close', (code) => {
    process.stdout.write(`child process exited with code ${code}\n`);
    if (callback) {
      if (code !== 0) process.stdout.write('Got error code. Stop.\n');
      else callback();
    }
  });
}

const runImage = () => {
  call(runCmd[0], runCmd.slice(1));
}

const buildImage = () => {
  call(buildCmd[0], buildCmd.slice(1), runImage);
}

buildImage();