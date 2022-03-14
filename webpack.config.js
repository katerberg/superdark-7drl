const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = () => ({
  entry: './src/index.js',
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      template: './src/index.html',
      bodyHtmlSnippet: '<div class="contents"></div>',
      favicon: './src/assets/favicon.ico',
      title: 'Superdark',
    }),
  ],
  output: {
    path: `${__dirname}/public`,
    publicPath: '/',
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(eot|otf|ttf|woff|woff2|wav|mp3)$/,
        use: 'file-loader',
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js'],
    alias: {
      assets: `${__dirname}/src/assets`,
    },
  },
  devServer: {
    static: {
      directory: './public',
    },
  },
});
