/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // React 컴포넌트 파일들을 포함
  ],
  theme: {
    extend: {
      // 모바일 최적화를 위한 화면 크기 설정
      screens: {
        xs: "320px", // 작은 모바일
        sm: "640px", // 모바일
        md: "768px", // 태블릿
        lg: "1024px", // 작은 데스크톱
        xl: "1280px", // 데스크톱
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
    },
  },
  plugins: [],
};
