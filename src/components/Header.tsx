import React, { useState } from 'react';
import { Search, ShoppingCart, Heart, User, Bell, Menu, Gift, Package, BookOpen, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  isShowMenu?: boolean;
  isEnableSearchBar?: boolean;
  onMenuClick?: () => void;
  onSearch?: (query: string) => void;
}

const Header = ({ isShowMenu, isEnableSearchBar, onMenuClick, onSearch }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogoClick = () => {
    // nếu hiện tại đang ở trang chủ thì reload lại chính nó để làm mới dữ liệu
    if (window.location.pathname === '/') {
      window.location.reload();
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
            <Bell className="w-4 h-4" />
            <Link to="#">Thông báo</Link>
            <Link to="#">Hỗ trợ</Link>
            {isLoggedIn ? (
              <Link to="/profile" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{user.fullname}</span>
              </Link>
            ) : (
              <Link to="/login">Đăng nhập</Link>
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
              <Button onClick={() => navigate('/recommendation')}  variant="ghost" size="sm" className="relative text-white hover:bg-primary-500 w-full">
                <BookOpen className="w-5 h-5" />
                <span>Gợi ý thuốc</span>
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

            <Link to='/products'>
              <Button variant="ghost" size="sm" className="relative text-white hover:bg-primary-500">
                <Package className="w-5 h-5" />
                <span className="hidden md:inline ml-1">Sản phẩm</span>
              </Button>
            </Link>

            <Link to='/voucher'>
              <Button variant="ghost" size="sm" className="relative text-white hover:bg-primary-500">
                <Gift className="w-5 h-5" />
                <span className="hidden md:inline ml-1">Voucher</span>
              </Button>
            </Link>

            <Link to="/wishlist">
              <Button variant="ghost" size="sm" className="relative text-white hover:bg-primary-500">
                <Heart className="w-5 h-5" />
                <span className="hidden md:inline ml-1">Yêu thích</span>
              </Button>
            </Link>

            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative text-white hover:bg-primary-500">
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden md:inline ml-1">Giỏ hàng</span>
              </Button>
            </Link>

            <Link to="/checkout">
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
