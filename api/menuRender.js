'use strict';

const fs = require('node:fs');
const path = require('node:path');

module.exports = async () => {
  const modules = await fs.promises.readdir('./api');
  const appList = modules.map((el) => path.basename(el, '.js'));
  return appList;
};
