/* Vercel serverless entry: every /api/* request is rewritten here (see vercel.json). */
module.exports = require('../backend/src/app').handler;
