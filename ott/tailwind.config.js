/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // React 컴포넌트 파일들을 포함
  ],
  theme: {
    extend: {
      // 모바일 최적화를 위한 화면 크기 설정
      screens: {
        xs: '320px', // 작은 모바일
        sm: '640px', // 모바일
        md: '768px', // 태블릿
        lg: '1024px', // 작은 데스크톱
        xl: '1280px', // 데스크톱
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      keyframes: {
        slideup: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadein: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        toastin: {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        toastout: {
          '0%': { opacity: 1, transform: 'translateY(0)' },
          '100%': { opacity: 0, transform: 'translateY(24px)' },
        },
      },
      animation: {
        slideup: 'slideup 0.3s cubic-bezier(0.4,0,0.2,1)',
        fadein: 'fadein 0.3s ease',
        toastin: 'toastin 0.4s cubic-bezier(0.4,0,0.2,1)',
        toastout: 'toastout 0.4s cubic-bezier(0.4,0,0.2,1)',
      },
    },
  },
  plugins: [],
};
