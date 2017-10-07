const fs = require('fs');
const path = require('path');
const Axios = require('axios');
const chunk = require('lodash').chunk;
const TileLnglatTransform = require('tile-lnglat-transform');
const tilesToFeatures = require('./tilesToFeatures');

// 需要爬取的经纬度范围（左上角、右下角）
const lnglatRange = [
  [118.01307678222655, 24.596143627409358],
  [118.15830230712889, 24.452462684995407],
];

// 单个请求的瓦片数量
const tilesCountPerReq = 100;

const axios = Axios.create({
  baseURL: 'http://vector.amap.com/vector/',
  timeout: 1e4,
  headers: {
    Accept: '*/*',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    Cookie:
      'guid=79aa-8b3a-7e1d-21b3; UM_distinctid=15d73c745f317b-08246e6485b3bc-30667808-1fa400-15d73c745f4104; Kdw4_5279_saltkey=iQi1nA59; Kdw4_5279_lastvisit=1500882510; Kdw4_5279_visitedfid=59; Kdw4_5279_st_p=0%7C1500887117%7C17f2b67a0a07513e13a8bc49e0b84de5; Kdw4_5279_viewid=tid_26343; cna=m/FxEUQMe1ICAXGMGAQdRR4k; isg=Ajg4VzV1leVAFPlqlMwe-GBYCeDAqWw7Zfu2N3KrynMmjdF3GLUluqXtM7PG; key=8325164e247e15eea68b59e89200988b',
    Host: 'vector.amap.com',
    Pragma: 'no-cache',
    Referer: 'http://lbs.amap.com/console/show/tools',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
  },
});

const lnglatToTilesRange = lnglat =>
  TileLnglatTransform.TileLnglatTransformGaode.lnglatToTile(
    lnglat[0],
    lnglat[1],
    17
  );

const tilesRange = {
  minX: lnglatToTilesRange(lnglatRange[0]).tileX,
  minY: lnglatToTilesRange(lnglatRange[0]).tileY,
  maxX: lnglatToTilesRange(lnglatRange[1]).tileX,
  maxY: lnglatToTilesRange(lnglatRange[1]).tileY,
};

console.log(tilesRange);

const tileList = [];
const area = {
  x: tilesRange.minX,
  y: tilesRange.minY,
};
while (area.x <= tilesRange.maxX && area.y <= tilesRange.maxY) {
  area.x += 1;
  tileList.push([area.x, area.y]);
  if (area.x === tilesRange.maxX) {
    area.x = tilesRange.minX;
    area.y += 1;
  }
}
const reqQueue = chunk(tileList, tilesCountPerReq).map(chunk => {
  const tileStr = chunk.map(tile => `${tile[0]},${tile[1]};`).join('');
  const url = `buildings?tiles=${tileStr}&level=17`;
  return url;
});

const writeGeoJsonFile = features => {
  const geojson = {
    type: 'FeatureCollection',
    features,
  };
  fs.writeFile(
    path.join(__dirname, './dist/buildings.geojson'),
    JSON.stringify(geojson),
    'utf-8',
    err => {
      if (err) {
        throw err;
      }
      console.log('geojson生成完毕！');
    }
  );
};

let fullFeatures = [];
const total = reqQueue.length;

const execQueue = () => {
  const curUrl = reqQueue.shift();

  axios
    .get(curUrl)
    .then(res => {
      const json = JSON.parse(
        JSON.stringify(res.data).replace(/(jsonp[^\(]+\(|\);)/g, '')
      );
      fullFeatures = fullFeatures.concat(tilesToFeatures(json));

      console.log(`爬取瓦片源：${total - reqQueue.length}/${total}`);

      if (reqQueue.length > 0) {
        execQueue();
      } else {
        writeGeoJsonFile(fullFeatures);
      }
    })
    .catch(err => {
      throw err;
    });
};

execQueue();
