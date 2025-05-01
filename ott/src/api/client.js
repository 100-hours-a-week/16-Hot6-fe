import { getConfig } from '@/config';

const { baseUrl } = getConfig();

export const API = {
  auth: {
    kakao: `${baseUrl}/auth/kakao`,
  },
};
