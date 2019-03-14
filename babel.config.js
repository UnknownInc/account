module.exports = function (api) {
  api.cache(true);

  const presets = [
    "@babel/preset-env",
    "@babel/preset-typescript"
  ];

  const plugins = [
    "@babel/proposal-class-properties",
    "@babel/proposal-object-rest-spread",
    "@babel/plugin-transform-async-to-generator",
    ["@babel/plugin-transform-runtime",
      {
        "regenerator": true
      }
    ]
  ];

  return {
    presets,
    plugins,
    env:{
      "test": {
        "plugins": ["istanbul"]
      }
    }
  };
}
