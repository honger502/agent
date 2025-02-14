import developmentConfig from './envs/development.config';
import productionConfig from './envs/production.config';
import testConfig from './envs/test.config';

const configs = {
  development: developmentConfig,
  production: productionConfig,
  test: testConfig,
};

export default () => {
  const env = process.env.NODE_ENV || 'development';
  const config = configs[env]();

  return {
    ...config,
    // 所有环境通用的配置
    isProduction: env === 'production',
    isDevelopment: env === 'development',
    isTest: env === 'test',
  };
};
