import React, { useState } from 'react';
import { Search, ShoppingCart, Heart, User, Bell, Menu, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
  cartCount?: number;
  wishlistCount?: number;
  onSearch?: (query: string) => void;
}

const Header = ({ onMenuClick, cartCount = 0, wishlistCount = 0, onSearch }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');

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
            <Link to="#">Kênh người bán</Link>
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
        <div className="flex items-center py-4 gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:bg-primary-500"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Logo */}
          <Link to="/" onClick={handleLogoClick} className="flex items-center space-x-2">
            <div className="bg-white p-2 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-medical-blue to-medical-green rounded"></div>
            </div>
            <span className="text-xl font-bold hidden sm:inline">{import.meta.env.VITE_APPLICATION_NAME || 'Tuan-Thanh PharmaMart'}</span>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
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
                className="w-full pl-4 pr-12 py-2 rounded-lg border-0 bg-white text-gray-900"
              />
              <Button
                size="sm"
                className="absolute right-1 top-1 h-8 px-3 bg-medical-orange hover:bg-medical-orange/90"
                onClick={() => onSearch?.(searchQuery)}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <Link to='/voucher'>
              <Button variant="ghost" size="sm" className="relative text-white hover:bg-primary-500">
                <Gift className="w-5 h-5" />
                <span className="hidden md:inline ml-1">Voucher</span>
              </Button>
            </Link>
            
            <Link to="/wishlist">
              <Button variant="ghost" size="sm" className="relative text-white hover:bg-primary-500">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-medical-red">
                    {wishlistCount}
                  </Badge>
                )}
                <span className="hidden md:inline ml-1">Yêu thích</span>
              </Button>
            </Link>

            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative text-white hover:bg-primary-500">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-medical-red">
                    {cartCount}
                  </Badge>
                )}
                <span className="hidden md:inline ml-1">Giỏ hàng</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
