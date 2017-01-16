const merge = require('webpack-merge');

const mergeWebpackConfigs = (config, overrides) => {

  return merge.smartStrategy({
    entry: 'replace'
  })(config, overrides);
};

module.exports = mergeWebpackConfigs;
