const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');


module.exports = {
  // Don't attempt to continue if there are any errors.
  bail: true,
  // We generate sourcemaps in production. This is slow but gives good results.
  // You can exclude the *.map files from the build during deployment.
  devtool: 'source-map',
  // These are the "entry points" to our application.
  // This means they will be the "root" imports that are included in JS bundle.
  // The first two entry points enable "hot" CSS and auto-refreshes for JS.
  entry: [
    // Include an alternative client for WebpackDevServer. A client's job is to
    // connect to WebpackDevServer by a socket and get notified about changes.
    // When you save a file, the client will either apply hot updates (in case
    // of CSS changes), or refresh the page (in case of JS changes). When you
    // make a syntax error, this client will display a syntax error overlay.
    require.resolve('react-dev-utils/webpackHotDevClient'),
    // We include the app code last so that if there is a runtime error during
    // initialization, it doesn't blow up the WebpackDevServer client, and
    // changing JS code would still trigger a refresh.
    './src/js/main.js'
  ],

  output: {
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
    path: path.resolve(process.cwd(), 'build'),
    publicPath: '/',
    filename: 'bundle.js'
  },

  resolve: {
    // These are the reasonable defaults supported by the Node ecosystem.
    extensions: ['.js', '.json', '.scss'],
    alias: {
      component: path.resolve('./node_modules/@lostmyname/components/dist'),
      chameleon: path.resolve('./node_modules/chameleon-sass/assets/stylesheets'),
      css: path.resolve('./node_modules/@lostmyname/css/scss'),
      fonts: path.resolve('./node_modules/@lostmyname/css/fonts'),
      scss: path.resolve('./src/scss'),
      helpers: path.resolve('./src/js/helpers')
    },
    modules: [
      path.join(process.cwd(), 'src'),
      'node_modules',
      path.join(process.cwd(), 'node_modules')
    ]
  },

  resolveLoader: {
    modules: [path.join(__dirname, 'node_modules')]
  },

  module: {
    rules: [
      // First, run the linter.
      // It's important to do this before Babel processes the JS.
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        exclude: path.join(__dirname, 'node_modules'),
        options: {
          configFile: path.join(__dirname, '.eslintrc'),
          useEslintrc: false
        }
      },

      // Process JS with Babel.
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
            require.resolve('babel-preset-react'),
            [require.resolve('babel-preset-es2015'), {
              modules: false
            }]
          ],
          plugins: [
            require.resolve('babel-plugin-transform-object-rest-spread')
          ],
        }
      },

      // "postcss" loader applies autoprefixer to our CSS.
      // "css" loader resolves paths in CSS and adds assets as dependencies.
      // "style" loader turns CSS into JS modules that inject <style> tags.
      // In production, we use a plugin to extract that CSS to a file, but
      // in development "style" loader enables hot editing of CSS.
      {
        test: /\.(css|scss)$/,
        loader: ExtractTextPlugin.extract({
          fallbackLoader: 'style-loader',
          loader: [
            { loader: 'css-loader?minimize' },
            // See postcss.config.js for configuration
            {
              loader: 'postcss-loader',
              options: {
                // Annoyingly this is all completely annoyed as there is some incompatibility with extract plugin
                // Using LoaderOptionsPlugin for now
                ident: 'postcss',
                plugins: () => {
                  return [
                    require('autoprefixer')({
                      browsers: [
                        '>1%',
                        'last 3 versions',
                        'Firefox ESR',
                        'not ie < 9', // React doesn't support IE8 anyway
                      ]
                    })
                  ];
                }
              }
            },
            {
              loader: 'sass-loader'
            }
          ]
        }),
      },

      // JSON is not enabled by default in Webpack but both Node and Browserify
      // allow it implicitly so we also enable it.
      {
        test: /\.json$/,
        loader: 'json-loader'
      },

      // Find svg images from the /images/ folder and use the svg-url-loader
      {
        test: /images\/.*\.svg$/i,
        loader: 'svg-url-loader'
      },

      // "file" loader makes sure those assets get served by WebpackDevServer.
      // When you `import` an asset, you get its (virtual) filename.
      // In production, they would get copied to the `build` folder.
      {
        test: /fonts\/.*\.(woff|woff2|eot|ttf|svg)$/,
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]'
        }
      }
    ]
  },

  plugins: [
    // This helps ensure the builds are consistent if source hasn't changed:
    new webpack.optimize.OccurrenceOrderPlugin(),
    // new StyleLintPlugin({
    //   configFile: path.join(__dirname, '.stylelintrc')
    // }),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new webpack.HotModuleReplacementPlugin(),
    // Try to dedupe duplicated modules, if any:
    // new webpack.optimize.DedupePlugin(),
    // Minify the code.
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true, // React doesn't support IE8
        warnings: false
      },
      mangle: {
        screw_ie8: true
      },
      output: {
        comments: false,
        screw_ie8: true
      }
    }),
    // Note: this won't work without ExtractTextPlugin.extract(..) in `modules`.
    new ExtractTextPlugin('[name].css'),
    // Generate a manifest file which contains a mapping of all asset filenames
    // to their corresponding output file so that tools can pick it up without
    // having to parse `index.html`.
    new ManifestPlugin({
      fileName: 'asset-manifest.json'
    }),
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: { // <---- postcss configs go here under LoadOptionsPlugin({ options: { ??? } })
          plugins: () => {
            return [
              require('autoprefixer')({
                browsers: [
                  '>1%',
                  'last 3 versions',
                  'Firefox ESR',
                  'not ie < 9', // React doesn't support IE8 anyway
                ]
              })
            ];
          }
        }
      }
    }),
  ],

  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};
