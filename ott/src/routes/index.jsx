import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../components/layout/RootLayout';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      // 추가 라우트는 여기에 설정
      // 예시:
      // {
      //   path: '/about',
      //   element: <About />,
      // },
    ],
  },
]);

export default router;
