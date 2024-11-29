const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env) => {
  return {
    entry: env.WEBPACK_SERVE ? './src/test/index.ts' : './src/paintlib/index.ts',
    devtool: 'inline-source-map',
    output: {
      filename: env.WEBPACK_SERVE ? 'index.js' : 'paintlib.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      library: env.WEBPACK_BUILD ? { type: 'umd' } : undefined,
    },
    resolve: {
      extensions: ['.ts', '.js'], // Resolves .ts and .js files
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'], // Handles CSS files
        },
        {
          test: /\.svg$/,
          type: 'asset/source', // Inline the SVG as a string
        },
      ],
    },
    plugins: env.WEBPACK_SERVE
      ? [
          new HtmlWebpackPlugin({
            template: './src/test/index.html',
          }),
          new CopyWebpackPlugin({ patterns: [{ from: 'assets', to: 'assets' }] }),
        ]
      : undefined,
    devServer: {
      static: './dist',
      open: false,
      hot: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
    },
    mode: env.WEBPACK_BUILD ? 'production' : 'development',
  };
};
