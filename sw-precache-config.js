module.exports = {
  'staticFileGlobs': [
    'dist/**/*.css',
    'dist/**/*.html',
    'dist/**/*.png',
    'dist/**/*.svg',
    'dist/**/*.js',
  ],
  'stripPrefix': 'dist',
  navigateFallback: '/index.html',
  root: 'dist/',
  runtimeCaching: [
    {
      urlPattern: /index\.html/,
      handler: 'fastest'
    },
    {
      urlPattern: /\.js/,
      handler: 'cacheFirst'
    }, {
      urlPattern: /fonts\.googleapis\.com/,
      handler: 'fastest'
    },{
      urlPattern: /fonts\.gstatic\.com/,
      handler: 'fastest'
    },
    {
      default: 'networkFirst'
    }
  ]
};
