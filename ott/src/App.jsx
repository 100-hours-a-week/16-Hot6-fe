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
import MyDeskImages from './pages/MyDeskImages';
import MyPage from './pages/MyPage';
import MyPosts from './pages/MyPosts';
import MyScrap from './pages/MyScrap';
import NotFound from './pages/NotFound';
import OrderPage from './pages/Order';
import OrderDetail from './pages/OrderDetail';
import OrderList from './pages/OrderList';
import Payment from './pages/Payment';
import PointHistory from './pages/PointHistory';
import PostDetail from './pages/PostDetail';
import PostEditor from './pages/PostEditor';
import Posts from './pages/Posts';
import ProductDetail from './pages/ProductDetail';
import Products from './pages/Products';
import ProfileEdit from './pages/ProfileEdit';
import RecommendedProductDetail from './pages/RecommendedProductDetail';
import RecommendedProducts from './pages/RecommendedProducts';

const App = () => {
  return (
    <ModalProvider>
      <Router>
        <ImageGenerationLoader />
        <ScrollToTop />
        <LoginModal /> {/* 항상 모달이 뜰 수 있게 라우터/라우트 밖에 둡니다! */}
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="/desk" element={<DeskAI />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/my-page" element={<MyPage />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/:orderId" element={<OrderDetail />} />
            <Route path="/orders/:orderId/payment" element={<OrderPage />} />
            <Route path="/my-scraps" element={<MyScrap />} />
            <Route path="/my-point-history" element={<PointHistory />} />
            <Route path="/my-posts" element={<MyPosts />} />
            <Route path="/my-desks" element={<MyDeskImages />} />
            <Route path="/recommended-products" element={<RecommendedProducts />} />
            <Route path="/recommended-products/:productId" element={<RecommendedProductDetail />} />
            <Route path="/products" element={<Products />} />
            {/* 보호된 라우트들도 여기에 추가 */}
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/oauth-success" element={<OAuth2RedirectHandler />} />
          <Route path="/post-editor" element={<PostEditor />} />
          <Route path="/ai-images/:imageId" element={<AiGenerationResult />} />
          <Route path="/posts/:postId" element={<PostDetail />} />
          <Route path="/products/:productId" element={<ProductDetail />} />
          <Route path="/profile-edit" element={<ProfileEdit />} />
          <Route path="/payment/:orderId" element={<Payment />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ModalProvider>
  );
};

export default App;
