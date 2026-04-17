// server-proxy.cjs
const cors_proxy = require('cors-anywhere');

cors_proxy.createServer({
  originWhitelist: [],
  requireHeader: [],
  removeHeaders: []
}).listen(8080, () => {
  console.log('✅ CORS proxy running on http://localhost:8080');
  console.log('➡️  Use this proxy: http://localhost:8080/https://votre-url');
});