import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Store from "./pages/Store";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Voucher from "./pages/Voucher";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import { requestFCMToken, onMessageListener } from './utils/firebaseUtils';
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import notificationApi from '@/services/api-notification-service';
import { toast } from '@/hooks/use-toast';
import Recommendation from "./pages/Recommendation";
import CatalogProductDetail from "./pages/CatalogProductDetail";


const queryClient = new QueryClient();

// Add custom event for notifications
export const NEW_NOTIFICATION_EVENT = 'new-notification';

const App = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchFCMToken = async () => {
      try {
        const token = await requestFCMToken();
        setFcmToken(token);
        // Gọi API lưu FCM token nếu có token và storeId
        if (token && user) {
          try {
            await notificationApi.post('notifications/save-fcm-token', {
              token: token,
              target_type: 'customer',
              target_id: user.id
            })
          } catch (err) {
            console.error('Error saving FCM token:', err);
          }
        }
      } catch (error) {
        console.error("Error fetching FCM token:", error);
      }
    };

    fetchFCMToken();

    // Real-time notification listener
    const handleMessage = (payload: any) => {
      if (payload?.notification) {
        // Show toast notification
        toast({
          variant: 'default',
          title: payload.notification.title,
          description: payload.notification.body,
        });

        // Dispatch custom event for new notification
        window.dispatchEvent(new CustomEvent(NEW_NOTIFICATION_EVENT, { 
          detail: payload.notification 
        }));
      }
    };

    const unsubscribe = onMessageListener(handleMessage);

    // Cleanup
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/catalog-products/:id" element={<CatalogProductDetail />} />
            <Route path="/stores/:id" element={<Store />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/voucher" element={<Voucher />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/recommendation" element={<Recommendation />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
// redeploy