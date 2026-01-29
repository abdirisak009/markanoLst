module.exports = {
  apps: [{
    name: 'markano-app',
    script: 'npm',
    args: 'start',
    cwd: '/home/deploy/markano-app',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/deploy/.pm2/logs/markano-app-error.log',
    out_file: '/home/deploy/.pm2/logs/markano-app-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M',
    watch: false,
    ignore_watch: ['node_modules', '.next', 'logs'],
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
