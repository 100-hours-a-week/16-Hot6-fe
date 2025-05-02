import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';
import PrivateRoute from './components/PrivateRoute';

// 페이지 컴포넌트들
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* RootLayout을 사용하는 공개 라우트 */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* RootLayout을 사용하는 보호된 라우트 */}
        <Route element={<RootLayout />}>
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
