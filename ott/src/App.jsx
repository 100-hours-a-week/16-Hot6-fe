import { ModalProvider } from '@/hooks/useGlobalModal'; // 추가!
import OAuth2RedirectHandler from '@/pages/OAuth2RedirectHandler';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ImageGenerationLoader from './components/common/ImageGenerationLoader';
import LoginModal from './components/common/LoginModal'; // 추가!
import ScrollToTop from './components/common/ScrollToTop';
import RootLayout from './components/layout/RootLayout';

// 페이지 컴포넌트들
import AiGenerationResult from './pages/AiGenerationResult';
import DeskAI from './pages/DeskAI';
import Home from './pages/Home';
import Login from './pages/Login';
import MyPage from './pages/MyPage';
import NotFound from './pages/NotFound';
import PostDetail from './pages/PostDetail';
import PostEditor from './pages/PostEditor';
import Posts from './pages/Posts';
import ProfileEdit from './pages/ProfileEdit';

const App = () => {
  return (
    <ModalProvider>
      <Router>
        <ImageGenerationLoader />
        <ScrollToTop />
        <LoginModal /> {/* 항상 모달이 뜰 수 있게 라우터/라우트 밖에 둡니다! */}
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/desk" element={<DeskAI />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/mypage" element={<MyPage />} />
            {/* 보호된 라우트들도 여기에 추가 */}
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/oauth-success" element={<OAuth2RedirectHandler />} />
          <Route path="/post-editor" element={<PostEditor />} />
          <Route path="/ai-images/:imageId" element={<AiGenerationResult />} />
          <Route path="/posts/:postId" element={<PostDetail />} />
          <Route path="/profile-edit" element={<ProfileEdit />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ModalProvider>
  );
};

export default App;
