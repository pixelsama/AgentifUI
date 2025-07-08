module.exports = {
  apps: [
    {
      name: 'AgentifUI',
      script: 'pnpm',
      args: 'start',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      out_file: './pm2-logs/out.log',
      error_file: './pm2-logs/error.log',
      autorestart: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
