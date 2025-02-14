import defaultConfig from './envs/default.config';
import developmentConfig from './envs/development.config';
import productionConfig from './envs/production.config';
import testConfig from './envs/test.config';

const envConfigs = {
  development: developmentConfig,
  production: productionConfig,
  test: testConfig,
};

export default () => {
  const env = process.env.NODE_ENV || 'development';
  const defaultConf = defaultConfig();
  const envConf = envConfigs[env]();

  return {
    ...defaultConf,
    ...envConf,
    logger: {
      ...defaultConf.logger,
      ...envConf.logger,
    },
  };
};
