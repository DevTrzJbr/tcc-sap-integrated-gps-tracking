// src/services/rota.service.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

async function csvToGeoJson(filePath) {
  return new Promise((resolve, reject) => {
    const points = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Espera que CSV tenha colunas: latitude, longitude
        // console.log(row);
        if (row.Latitude && row.Longitude) {
          points.push([
            parseFloat(row.Longitude),
            parseFloat(row.Latitude)
          ]);
        //   console.log('Encontrou lat e long')
        }
      })
      .on('end', () => {
        // console.log(points);
        const geojson = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: points
              }
            }
          ]
        };
        resolve(geojson);
        // console.log('GeoJSON: ' + geojson);
      })
      .on('error', reject);
  });
}

async function getRotaGeoJson(rotaId) {
  // Exemplo: projeto/temp/rota_normal.csv
  const filePath = path.join(__dirname, '../../..', 'temp', `${rotaId}.csv`);

//   console.log(filePath);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo da rota ${rotaId} não encontrado`);
  }

  let json = await csvToGeoJson(filePath);

//   console.log(json.features.geometry);

  return json;
}

module.exports = {
  getRotaGeoJson,
};
