const path = require('path');

const root = path.resolve(__dirname);
const rootSlash = root.replace(/\\/g, '/');

module.exports = {
  root,
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    fs: {
      strict: false,
      allow: [
        root,
        rootSlash,
        path.resolve(root, '..'),
        'D:/Others/smart-stay-client',
        'D:/OTHERS~1/smart-stay-client',
        'D:\\Others\\smart-stay-client',
        'D:\\OTHERS~1\\smart-stay-client'
      ]
    }
  }
};
