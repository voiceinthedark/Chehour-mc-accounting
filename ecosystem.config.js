module.exports = {
  apps: [
    {
      name: "med-account-api",
      script: "./src/index.js",
      cwd: "./apps/backend",
      instances: "max", // Utilizes all CPU cores
      exec_mode: "cluster", // Zero-downtime cluster mode
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      error_file: "./logs/med-account-api-error.log",
      out_file: "./logs/med-account-api-out.log",
    },
    // Optional: If running a dedicated SSR/Next frontend or serving static build via serve
    {
      name: "med-account-web",
      script: "serve",
      cwd: "./apps/web-display",
      env: {
        PM2_SERVE_PATH: "./dist",
        PM2_SERVE_PORT: 3000,
        PM2_SERVE_SPA: "true",
        PM2_SERVE_HOMEPAGE: "/index.html",
      },
    },
  ],
};
