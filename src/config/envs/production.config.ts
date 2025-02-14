export default () => ({
  env: 'production',
  port: parseInt(process.env.PORT, 10) || 3000,
  // 生产环境特定配置
});
