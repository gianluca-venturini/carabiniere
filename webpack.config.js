const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/app/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
  },
  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      {test: /\.tsx?$/, loader: 'awesome-typescript-loader'},

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {enforce: 'pre', test: /\.js$/, loader: 'source-map-loader'},
    ],
  },
  // This libraries will be cached by the browser between builds
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Carabiniere',
      template: './src/app/index.html',
    }),
  ],
};
