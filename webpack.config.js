const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  entry: './src/app/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
  },
  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        include: path.join(__dirname, './src/app/components'),
        use: [
          {loader: 'style-loader'},
          {
            loader: 'typings-for-css-modules-loader',
            options: {
              modules: true,
              namedExport: true,
            },
          },
        ],
      },

      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
      },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {enforce: 'pre', test: /\.js$/, loader: 'source-map-loader'},
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Carabiniere',
      template: './src/app/index.html',
    }),
    new CopyPlugin([
      {
        from: 'node_modules/@blueprintjs/icons/lib/css/blueprint-icons.css',
        to: '',
      },
      {
        from: 'node_modules/@blueprintjs/core/lib/css/blueprint.css',
        to: '',
      },
      {
        from: 'node_modules/normalize.css/normalize.css',
        to: '',
      },
    ]),
  ],
};
