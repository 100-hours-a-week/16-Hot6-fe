import { getConfig } from '@/config/index.js';

const { baseUrl } = getConfig();

export const API = {
  auth: {
    kakao: `${baseUrl}/auth/kakao`,
  },
};
