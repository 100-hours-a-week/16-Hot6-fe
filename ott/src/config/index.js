const config = {
  development: {
    BASE_URL: 'https://dev-backend.onthe-top.com/api/v1',
  },
  production: {
    BASE_URL: 'https://dev-backend.onthe-top.com/api/v1', // 실제 배포 시 사용할 URL
  },
  test: {
    BASE_URL: 'http://test-api.onthetop.com/api/v1', // 테스트용 URL
  },
};

export const getConfig = () => {
  return config[import.meta.env.MODE || 'development'];
};
