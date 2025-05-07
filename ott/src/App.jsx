import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';
import PrivateRoute from './components/PrivateRoute';
import OAuth2RedirectHandler from '@/pages/OAuth2RedirectHandler';

// 페이지 컴포넌트들
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import DeskAI from './pages/DeskAI';
import AiGenerationResult from './pages/AiGenerationResult';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* RootLayout을 사용하는 라우트 */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/desk" element={<DeskAI />} />
          {/* 보호된 라우트들도 여기에 추가 */}
          {/* <Route
            path="/mypage"
            element={
              <PrivateRoute>
                <MyPage />
              </PrivateRoute>
            }
          /> */}
        </Route>

        {/* RootLayout을 사용하지 않는 라우트 */}
        <Route path="/login" element={<Login />} />
        <Route path="/oauth2/authorization/kakao" element={<OAuth2RedirectHandler />} />
        <Route path="/ai-images/:imageId" element={<AiGenerationResult />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
