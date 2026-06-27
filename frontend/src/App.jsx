import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';

// Components
import LoginModal from './components/LoginModal';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Menu from './pages/Menu';
import Deals from './pages/Deals';
import Gallery from './pages/Gallery';
import Testimonials from './pages/Testimonials';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderDetails from './pages/OrderDetails';

// Admin Dashboard Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import DashboardOverview from './pages/admin/DashboardOverview';
import ManageOrders from './pages/admin/ManageOrders';
import ManageCategories from './pages/admin/ManageCategories';
import ManageFoods from './pages/admin/ManageFoods';
import ManageDeals from './pages/admin/ManageDeals';
import ManageGallery from './pages/admin/ManageGallery';
import ManagePayments from './pages/admin/ManagePayments';
import ManageTestimonials from './pages/admin/ManageTestimonials';
import ManageSettings from './pages/admin/ManageSettings';

// Public Layout Wrapper
const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <SettingsProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              
              <Routes>
                
                {/* Public Routes */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<Home />} />
                  <Route path="about" element={<About />} />
                  <Route path="menu" element={<Menu />} />
                  <Route path="deals" element={<Deals />} />
                  <Route path="gallery" element={<Gallery />} />
                  <Route path="testimonials" element={<Testimonials />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="order-details/:id" element={<OrderDetails />} />
                </Route>

                {/* Admin Login Route (No Header/Footer) */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Protected Admin Console Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<DashboardOverview />} />
                  <Route path="orders" element={<ManageOrders />} />
                  <Route path="categories" element={<ManageCategories />} />
                  <Route path="foods" element={<ManageFoods />} />
                  <Route path="deals" element={<ManageDeals />} />
                  <Route path="gallery" element={<ManageGallery />} />
                  <Route path="payments" element={<ManagePayments />} />
                  <Route path="testimonials" element={<ManageTestimonials />} />
                  <Route path="settings" element={<ManageSettings />} />
                </Route>

              </Routes>

              {/* Global Customer Verification Modal */}
              <LoginModal />

            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </SettingsProvider>
    </Router>
  );
}

export default App;
