// src/config/index.js
require('dotenv').config();

const SAP_BASE_URL = process.env.SAP_BASE_URL || 'https://sap.exemplo.com';
const SAP_ODATA_PATH = process.env.SAP_ODATA_PATH || '/sap/opu/odata/sap/ZMEU_SRV';
const SAP_USER = process.env.SAP_USER || '';
const SAP_PASS = process.env.SAP_PASS || '';
const USE_MOCK = (process.env.USE_MOCK || 'true').toLowerCase() === 'true';

module.exports = {
  SAP_BASE_URL,
  SAP_ODATA_PATH,
  SAP_USER,
  SAP_PASS,
  USE_MOCK
};
