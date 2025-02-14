export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  logger: {
    console: true,
    file: true,
  },
  siliconflow: {
    apiUrl: process.env.SILICONFLOW_API_URL,
    apiKey: process.env.SILICONFLOW_API_KEY,
    timeout: parseInt(process.env.SILICONFLOW_TIMEOUT, 10) || 60000,
  },
});
