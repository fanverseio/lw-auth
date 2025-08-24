module.exports = {
  apps: [
    {
      name: "lw-auth",
      script: "index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/log/pm2/lw-auth-error.log",
      out_file: "/var/log/pm2/lw-auth-out.log",
      log_file: "/var/log/pm2/lw-auth-combined.log",
      time: true,
    },
  ],
};
