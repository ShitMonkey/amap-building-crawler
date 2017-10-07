const TileLnglatTransform = require('tile-lnglat-transform');
const coordtransform = require('coordtransform');
const chunk = require('lodash').chunk;
const matchClasses = require('./matchClasses');
const hashString = str => {
  const hash = require('crypto').createHash('md5');
  hash.update(str);
  return hash.digest('hex');
};

const pixelToLnglat = (pixels, index) => {
  const points = chunk(pixels, 2);
  const lnglatPoints = points.map(point => {
    // 像素转坐标值
    const gaodeTransfer = TileLnglatTransform.TileLnglatTransformGaode;
    const location = gaodeTransfer.pixelToLnglat(point[0], point[1], index.x, index.y, index.z);
    // 国测局坐标转wgs84坐标
    return coordtransform.gcj02towgs84(location.lng, location.lat);
  });
  return lnglatPoints;
};

const tilesToFeatures = tilesJson => {
  const features = [];

  if (tilesJson.list) {
    tilesJson.list.forEach((tileData, i) => {
      tileData.tile.forEach((region, j) => {
        const feature = {
          type: 'Feature',
          properties: {
            level: 1,
            name: region.name ? region.name : hashString(`tile_${i}_region_${j}`),
            height: parseInt(region.floor, 10) * 10,
            base_height: 0,
            color: '#ddd',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              pixelToLnglat(region.coords, tileData.index),
            ],
          },
        };
        feature.properties = matchClasses(feature.properties);
        features.push(feature);
      });
    });
  }

  return features;
};

module.exports = tilesToFeatures;
