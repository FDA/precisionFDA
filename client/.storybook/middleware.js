const proxy = require('http-proxy-middleware');

const filter = function (pathname, req) {
  return pathname.match('^/api');
};

module.exports = function expressMiddleware (router) {
  router.use('/', proxy.createProxyMiddleware(filter, {
    target: 'https://localhost:3000',
    changeOrigin: true,
    secure: false
  }))
}
