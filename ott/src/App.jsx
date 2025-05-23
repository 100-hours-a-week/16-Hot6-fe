import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';
import PrivateRoute from './components/PrivateRoute';
import OAuth2RedirectHandler from '@/pages/OAuth2RedirectHandler';
import ScrollToTop from './components/common/ScrollToTop';
import ImageGenerationLoader from './components/common/ImageGenerationLoader';

// 페이지 컴포넌트들
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import DeskAI from './pages/DeskAI';
import AiGenerationResult from './pages/AiGenerationResult';
import PostEditor from './pages/PostEditor';
import Posts from './pages/Posts';
import PostDetail from './pages/PostDetail';
import MyPage from './pages/MyPage';
import ProfileEdit from './pages/ProfileEdit';

const App = () => {
  return (
    <Router>
      <ImageGenerationLoader />
      <ScrollToTop />
      <Routes>
        {/* RootLayout을 사용하는 라우트 */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/desk" element={<DeskAI />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/mypage" element={<MyPage />} />
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
        <Route path="/oauth-success" element={<OAuth2RedirectHandler />} />
        <Route path="/post-editor" element={<PostEditor />} />
        <Route path="/ai-images/:imageId" element={<AiGenerationResult />} />
        <Route path="/posts/:postId" element={<PostDetail />} />
        <Route path="/profile-edit" element={<ProfileEdit />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
