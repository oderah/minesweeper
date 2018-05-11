const path = require('path');

module.exports = {
  entry: './minesweeper/frontend/src/index.js',
  output: {
      path: path.resolve(__dirname, './minesweeper/frontend/static/js'),
      filename: 'main.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }
    ]
  }
};
