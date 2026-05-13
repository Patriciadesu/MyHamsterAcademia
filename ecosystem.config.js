module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'server.js',
      cwd: './backend',
      env: {
        PORT: 3005
      }
    },
    {
      name: 'frontend',
      script: './node_modules/.bin/vite',
      cwd: './frontend',
      args: '--port 5173',
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};
