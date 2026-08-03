module.exports = {
  apps: [
    {
      name: "med-account-api",
      script: "./apps/backend/src/index.js",
      instances: "max", // Utilizes all CPU cores
      exec_mode: "cluster", // Zero-downtime cluster mode
      watch: false,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
    // Optional: If running a dedicated SSR/Next frontend or serving static build via serve
    {
      name: "med-account-web",
      script: "serve",
      env: {
        PM2_SERVE_PATH: "./apps/web/dist",
        PM2_SERVE_PORT: 3000,
        PM2_SERVE_SPA: "true",
        PM2_SERVE_HOMEPAGE: "/index.html",
      },
    },
  ],
};
