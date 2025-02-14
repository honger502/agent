export default () => ({
  env: 'test',
  port: parseInt(process.env.PORT, 10) || 3000,
  // 测试环境日志配置
  logger: {
    level: 'debug',
    console: true,
    file: false,
  },
  // 测试环境特定配置
});
