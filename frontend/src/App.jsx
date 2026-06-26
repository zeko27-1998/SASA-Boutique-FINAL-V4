import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { WishlistProvider } from './pages/WishlistPage';

import Navbar         from './components/layout/Navbar';
import Footer         from './components/layout/Footer';
import CartSidebar    from './components/cart/CartSidebar';
import SplashScreen   from './components/ui/SplashScreen';
import BackToTop, { ScrollToTop } from './components/ui/BackToTop';

import Home           from './pages/Home';
import CategoryPage   from './pages/CategoryPage';
import ProductPage    from './pages/ProductPage';
import AuthPage       from './pages/AuthPage';
import CheckoutPage   from './pages/CheckoutPage';
import AdminPage      from './pages/AdminPage';
import NotFoundPage   from './pages/NotFoundPage';
import OrderTrackPage from './pages/OrderTrackPage';
import WishlistPage   from './pages/WishlistPage';
import ProfilePage    from './pages/ProfilePage';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartSidebar />
      <main className="flex-1">{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem('sasa_splash') === '1'
  );
  const handleSplashDone = useCallback(() => {
    sessionStorage.setItem('sasa_splash', '1');
    setSplashDone(true);
  }, []);

  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Toaster position="top-right" toastOptions={{
                duration: 3000,
                style: { fontFamily:'DM Sans, Cairo, sans-serif', fontSize:'14px', borderRadius:'12px', fontWeight:600 },
              }}/>
              <ScrollToTop />
              {!splashDone && <SplashScreen onDone={handleSplashDone}/>}
              <Routes>
                <Route path="/"                    element={<Layout><Home/></Layout>} />
                <Route path="/category/:category"  element={<Layout><CategoryPage/></Layout>} />
                <Route path="/category"            element={<Layout><CategoryPage/></Layout>} />
                <Route path="/search"              element={<Layout><CategoryPage/></Layout>} />
                <Route path="/product/:id"         element={<Layout><ProductPage/></Layout>} />
                <Route path="/checkout"            element={<Layout><CheckoutPage/></Layout>} />
                <Route path="/wishlist"            element={<Layout><WishlistPage/></Layout>} />
                <Route path="/track-order"         element={<Layout><OrderTrackPage/></Layout>} />
                <Route path="/profile"             element={<Layout><ProfilePage/></Layout>} />
                <Route path="/login"               element={<AuthPage/>} />
                <Route path="/register"            element={<AuthPage/>} />
                <Route path="/admin/*"             element={<AdminPage/>} />
                <Route path="*"                    element={<Layout><NotFoundPage/></Layout>} />
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
