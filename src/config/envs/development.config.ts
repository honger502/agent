export default () => ({
  env: 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  // 开发环境特定配置
});
