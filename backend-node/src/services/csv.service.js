const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

function readCsv(fileName) {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(__dirname, '../../..', 'temp', fileName);

    fs.createReadStream(filePath)
      .pipe(csv({ separator: ',' }))
      .on('data', (row) => {
        results.push(row);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

module.exports = { readCsv };
