const path = require('path');
const fse = require('fs-extra');
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
  fse.copy(source, dest, err => {
    if (err) {
      console.error(err);
      exit(1);
    }
    console.log(`INFO::Copy "${source}" to "${dest}".`);
  });
};

//* Copy manifest.json
const sourceManifest = path.resolve(__dirname, './src/manifest/', oriManifest);
const destManifest = path.resolve(__dirname, outputPath, 'manifest.json');
copyHandler(sourceManifest, destManifest);

//* Copy manifest.json
const assets = path.resolve(__dirname, './src/assets');
copyHandler(assets, outputPath);
