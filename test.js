const fs = require('fs');
const path = require('path');
const tilesToFeatures = require('./tilesToFeatures');

const srcJson = fs.readFileSync(path.join(__dirname, './src.json'));

const writeGeoJsonFile = () => {
  const geojson = {
    type: 'FeatureCollection',
    features: tilesToFeatures(JSON.parse(srcJson)),
  };
  fs.writeFile(path.join(__dirname, './dist/buildings.geojson'), JSON.stringify(geojson), 'utf-8', (err) => {
    if (err) {
      throw err;
    }
    console.log('geojson生成完毕！');
  });
};

writeGeoJsonFile();
