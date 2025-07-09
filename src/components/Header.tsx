import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Heart, User, Bell, Menu, Gift, Package, BookOpen, CreditCard, ShoppingBag, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import notificationAPI from '@/services/api-notification-service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  isShowMenu?: boolean;
  isEnableSearchBar?: boolean;
  onMenuClick?: () => void;
  onSearch?: (query: string) => void;
}

const Header = ({ isShowMenu, isEnableSearchBar, onMenuClick, onSearch }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isLoggedIn || !user?.id) return;
      try {
        const res = await notificationAPI.get(
          `/notifications?target_type=customer&target_id=${user.id}`
        );
        setNotifications(res.data.data || []);
        setNotificationCount(res.data.total || 0);
      } catch (err) {
        setNotifications([]);
        setNotificationCount(0);
      }
    };
    fetchNotifications();
  }, [isLoggedIn, user?.id]);

  const handleLogoClick = () => {
    // nếu hiện tại đang ở trang chủ thì reload lại chính nó để làm mới dữ liệu
    if (window.location.pathname === '/') {
      window.location.reload();
    }
    else {
      navigate('/');
    }
  };

  const badgeCount = notificationCount > 99 ? '99+' : notificationCount;

  // Hàm đánh dấu đã đọc
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationAPI.post('/notifications/mark-as-read', { notificationId });
      setNotifications((prev) => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
      setNotificationCount((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (err) {
      // Có thể hiện toast lỗi nếu muốn
    }
  };

  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-2 text-sm border-b border-primary-500/30">
          <div className="hidden md:flex items-center space-x-4">
            <Link to={import.meta.env.VITE_URL_SELLER_CLIENT}>Kênh người bán</Link>
            <span>Trở thành Người bán dược phẩm</span>
          </div>
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-1 cursor-pointer select-none relative focus:outline-none" aria-label="Xem thông báo">
                  <button
                    className="relative focus:outline-none bg-transparent border-none p-0 m-0"
                    tabIndex={-1}
                    style={{ boxShadow: 'none' }}
                  >
                    <Bell className="w-5 h-5" />
                    {isLoggedIn && notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1 min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white select-none">
                        {badgeCount}
                      </span>
                    )}
                  </button>
                  <span className="ml-1 hover:underline text-white text-sm">Thông báo</span>
                </div>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                {!isLoggedIn ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Avatar className="h-16 w-16 mb-2">
                      <AvatarImage src="/default-avatar.png" alt="avatar" />
                      <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                    <div className="text-gray-700 font-medium mt-2">Đăng nhập để xem Thông báo</div>
                  </div>
                ) : (
                  <>
                    <div className="px-4 pt-4 pb-2 font-semibold text-base">Thông báo của bạn</div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-200">
                      {notifications.length > 0 ? notifications.map((n) => (
                        <div key={n.id} className={`p-3 flex items-start justify-between ${n.is_read ? 'bg-white' : 'bg-blue-50'}`}>
                          <div>
                            <div className="font-semibold text-sm">{n.title}</div>
                            <div className="text-xs text-gray-700">{n.body}</div>
                            <div className="text-[10px] text-gray-400 mt-1">{n.created_at}</div>
                          </div>
                          {!n.is_read && (
                            <button
                              className="ml-2 text-blue-500 hover:text-green-600 transition-colors"
                              title="Đánh dấu đã đọc"
                              onClick={() => handleMarkAsRead(n.id)}
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      )) : (
                        <div className="text-center text-gray-500 py-4">Không có thông báo nào.</div>
                      )}
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>
            <Link onClick={() => {
              // cuộn lên đầu trang
              window.scrollTo(0, 0);
            }} to="#">Hỗ trợ</Link>
            {isLoggedIn ? (
              <Link onClick={() => {
                // cuộn lên đầu trang
                window.scrollTo(0, 0);
              }} to="/profile" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{user.fullname}</span>
              </Link>
            ) : (
              <Link onClick={() => {
                // cuộn lên đầu trang
                window.scrollTo(0, 0);
              }} to="/login">Đăng nhập</Link>
            )}
          </div>
        </div>

        {/* Main header */}
        <div className="flex flex-col lg:flex-row items-center py-4 gap-4">
          <div className="flex items-center gap-4 w-full overflow-x-hidden">
            {/* Mobile menu button */}
            {isShowMenu && (
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-white hover:bg-primary-500"
                onClick={onMenuClick}
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}

            {/* Logo */}
            <Link to="/" onClick={handleLogoClick} className="flex items-center space-x-2 shrink-0">
              <div className="bg-white p-2 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-medical-blue to-medical-green rounded"></div>
              </div>
              <span className="text-xl font-bold hidden md:inline truncate max-w-[300px]">{import.meta.env.VITE_APPLICATION_NAME || 'Tuan-Thanh PharmaMart'}</span>
            </Link>

            {/* Nút điều hướng tới mô hình khuyến nghị thuốc */}
            <div className="flex-1 min-w-0 mx-4 flex justify-center bg-blue-500 rounded-lg">
              <Button onClick={() => navigate('/recommendation')} variant="ghost" size="sm" className="relative text-white hover:bg-primary-500 w-full">
                <BookOpen className="w-5 h-5" />
                <span >Gợi ý thuốc</span>
              </Button>
            </div>

            {/* Search bar */}
            {/* <div className="flex-1 min-w-0 mx-4">
              <div className='relative'>
                <Input
                  type="text"
                  placeholder="Tìm kiếm thuốc, thực phẩm chức năng, dụng cụ y tế..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSearch?.(searchQuery);
                    }
                  }}
                  disabled={!isEnableSearchBar}
                  className="w-full pl-4 pr-12 py-2 rounded-lg border-0 bg-white text-gray-900 min-w-[200px] disabled:bg-white/80"
                />
                <Button
                  size="sm"
                  disabled={!isEnableSearchBar}
                  className="absolute right-1 top-1 h-8 px-3 bg-medical-orange hover:bg-medical-orange/90 disabled:bg-medical-orange/50"
                  onClick={() => onSearch?.(searchQuery)}
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div> */}
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 w-full lg:w-auto justify-center lg:justify-end">

            <Link onClick={() => {
              // cuộn lên đầu trang
              window.scrollTo(0, 0);
            }} to='/products'>
              <Button variant="ghost" size="sm" className="relative text-white hover:bg-primary-500">
                <ShoppingBag className="w-5 h-5" />
                <span className="hidden md:inline ml-1">Mua sắm</span>
              </Button>
            </Link>

            <Link onClick={() => {
              window.scrollTo(0, 0);
            }} to='/voucher'>
              <Button variant="ghost" size="sm" className="relative text-white hover:bg-primary-500">
                <Gift className="w-5 h-5" />
                <span className="hidden md:inline ml-1">Voucher</span>
              </Button>
            </Link>

            <Link onClick={() => {
              window.scrollTo(0, 0);
            }} to="/wishlist">
              <Button variant="ghost" size="sm" className="relative text-white hover:bg-primary-500">
                <Heart className="w-5 h-5" />
                <span className="hidden md:inline ml-1">Yêu thích</span>
              </Button>
            </Link>

            <Link onClick={() => {
              window.scrollTo(0, 0);
            }} to="/cart">
              <Button variant="ghost" size="sm" className="relative text-white hover:bg-primary-500">
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden md:inline ml-1">Giỏ hàng</span>
              </Button>
            </Link>

            <Link onClick={() => {
              window.scrollTo(0, 0);
            }} to="/checkout">
              <Button variant="ghost" size="sm" className="relative text-white hover:bg-primary-500">
                <CreditCard className="w-5 h-5" />
                <span className="hidden md:inline ml-1">Thanh toán</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
