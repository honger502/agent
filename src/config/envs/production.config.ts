export default () => ({
  env: 'production',
  port: parseInt(process.env.PORT, 10) || 3000,
  // 生产环境日志配置
  logger: {
    level: 'info',
    console: false,
    file: true,
  },
  // 生产环境特定配置
});
