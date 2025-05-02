const config = {
  development: {
    baseUrl: 'http://dev-backend.onthe-top.com/api/v1',
  },
  production: {
    baseUrl: 'https://dev-backend.onthe-top.com/api/v1', // 실제 배포 시 사용할 URL
  },
  test: {
    baseUrl: 'http://test-api.onthetop.com/api/v1', // 테스트용 URL
  },
};

export const getConfig = () => {
  return config[import.meta.env.MODE || 'development'];
};
