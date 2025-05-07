import { getConfig } from '@/config/index.js';

const { BASE_URL } = getConfig();

export const API = {
  auth: {
    kakao: `${BASE_URL}/auth/kakao`,
  },
};
