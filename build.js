const path = require('path');
const fse = require('fs-extra');
const archiver = require('archiver');
const packageInfo = require('./package.json');
const { exit } = require('process');
const args = require('minimist')(process.argv.slice(2));

let dir, oriManifest;
switch (args['name']) {
  case 'c2':
    dir = 'chromium_v2/';
    oriManifest = 'manifest_chromium_v2.json';
    break;
  case 'c3':
    dir = 'chromium_v3/';
    oriManifest = 'manifest_chromium_v3.json';
    break;
  case 'ff':
    dir = 'firefox/';
    oriManifest = 'manifest_firefox.json';
    break;
  default:
    dir = 'build/';
    oriManifest = 'manifest.json';
    break;
}

const outputPath = path.resolve(__dirname, './build/', dir);
fse.removeSync(outputPath);
console.log(`INFO::Clear dir: ${outputPath}`);

if (!fse.existsSync(outputPath)) {
  try {
    fse.mkdirSync(outputPath, {
      recursive: true,
    });
  } catch (err) {
    console.error(err);
    exit(1);
  }
}

const copyHandler = function (source, dest) {
  fse.copySync(source, dest);
  console.log(`INFO::Copy "${source}" to "${dest}"`);
};

//* Copy manifest.json
const sourceManifest = path.resolve(__dirname, './src/manifest/', oriManifest);
const destManifest = path.resolve(__dirname, outputPath, 'manifest.json');
copyHandler(sourceManifest, destManifest);

//* Copy manifest.json
const assets = path.resolve(__dirname, './src/assets');
copyHandler(assets, outputPath);

if (args['pack']) {
  const infoName = packageInfo.name;
  const infoVersion = packageInfo.version;
  switch (args['pack']) {
    case 'c2':
      packName = `${infoName}-manifest-v2_v${infoVersion}.zip`;
      break;
    case 'c3':
      packName = `${infoName}-manifest-v3_v${infoVersion}.zip`;
      break;
    case 'ff':
      packName = `${infoName}-firefox_v${infoVersion}.zip`;
      break;
    default:
      packName = `${infoName}_v${infoVersion}.zip`;
      break;
  }
  const packFile = fse.createWriteStream(__dirname + '/archive/' + packName);
  const archive = archiver('zip');

  packFile.on('close', () => {
    console.log(`INFO::Archive ${outputPath} to ${packName} | ${archive.pointer()} total bytes.`);
  });
  packFile.on('end', () => {
    console.log('INFO::Data has been drained.');
  });

  archive.on('error', err => {
    throw err;
  });

  archive.pipe(packFile);
  archive.directory(outputPath, false);
  archive.finalize();
}
