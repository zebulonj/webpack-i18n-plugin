var path = require( 'path' );
var webpack = require( 'webpack' );

var LocalizationPlugin = require( '../index.js' ).default;

var plugins = [
  new webpack.NamedModulesPlugin(),
  new LocalizationPlugin()
];

if ( process.env.NODE_ENV === "production" ) {
  plugins.push( new webpack.optimize.UglifyJsPlugin() );
}

plugins.push( new webpack.DefinePlugin({
  'process.env': {
    'NODE_ENV': JSON.stringify( process.env.NODE_ENV || "development" )
  }
}));

module.exports = [
  {
      context: path.resolve( __dirname ),
      entry: [
        './src/index.js'
      ],
      resolve: {
        extensions: ['*', '.js', '.json'],
        alias: {}
      },
      output: {
          path: path.resolve( __dirname ),
          filename: "bundle.js",
          publicPath: '/'
      },
      module: {
        rules: [
          {
            test: /\.js(x)?$/,
            loader: 'babel-loader',
            exclude: [
              path.resolve( __dirname, 'node_modules' )
            ]
          }
        ]
      },
      plugins: plugins
  }
];
