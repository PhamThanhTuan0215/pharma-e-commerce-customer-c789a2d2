
import React, { useState } from 'react';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

// Mock wishlist data
const mockWishlistItems = [
  {
    id: '1',
    name: 'Panadol Extra Forte 500mg - Giảm đau hạ sốt nhanh chóng',
    price: 125000,
    originalPrice: 150000,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300',
    store: 'Nhà thuốc ABC',
    discount: 17,
    inStock: true,
    freeShipping: true
  },
  {
    id: '2',
    name: 'Blackmores Bio C 1000mg - Vitamin C tăng cường miễn dịch',
    price: 320000,
    originalPrice: 380000,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300',
    store: 'Pharma Store',
    discount: 16,
    inStock: true,
    freeShipping: true
  },
  {
    id: '3',
    name: 'Máy đo huyết áp Omron HEM-7120 - Chính xác và tiện dụng',
    price: 1250000,
    originalPrice: 1500000,
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=300',
    store: 'Medical Equipment',
    discount: 17,
    inStock: false,
    freeShipping: true
  }
];

const Wishlist = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems);
  const [cartCount, setCartCount] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleRemoveFromWishlist = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleAddToCart = (itemId: string) => {
    const item = wishlistItems.find(item => item.id === itemId);
    if (item?.inStock) {
      setCartCount(prev => prev + 1);
      console.log('Added to cart:', itemId);
    }
  };

  const handleAddAllToCart = () => {
    const inStockItems = wishlistItems.filter(item => item.inStock);
    setCartCount(prev => prev + inStockItems.length);
    console.log('Added all in-stock items to cart');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={() => setSidebarOpen(true)}
        cartCount={cartCount}
        wishlistCount={wishlistItems.length}
      />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-h-screen">
          {/* Breadcrumb */}
          <div className="bg-white border-b px-4 py-3">
            <div className="container mx-auto">
              <nav className="text-sm text-gray-500">
                <span>Trang chủ</span>
                <span className="mx-2">/</span>
                <span className="text-gray-900">Danh sách yêu thích</span>
              </nav>
            </div>
          </div>

          <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-medical-red" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Danh sách yêu thích ({wishlistItems.length})
                </h1>
              </div>
              {wishlistItems.length > 0 && (
                <Button onClick={handleAddAllToCart} className="bg-primary-600 hover:bg-primary-700">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Thêm tất cả vào giỏ
                </Button>
              )}
            </div>

            {wishlistItems.length === 0 ? (
              /* Empty state */
              <Card className="text-center py-12">
                <CardContent>
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Danh sách yêu thích trống
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Hãy thêm những sản phẩm bạn quan tâm vào danh sách yêu thích
                  </p>
                  <Button className="bg-primary-600 hover:bg-primary-700">
                    Khám phá sản phẩm
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* Wishlist items */
              <div className="space-y-4">
                {wishlistItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Product image */}
                        <div className="flex-shrink-0">
                          <div className="relative w-full md:w-32 h-32">
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            {item.discount && (
                              <Badge className="absolute top-1 left-1 bg-medical-red text-white text-xs">
                                -{item.discount}%
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">{item.store}</p>
                          
                          {item.freeShipping && (
                            <Badge variant="secondary" className="bg-medical-green/10 text-medical-green mb-2">
                              Freeship
                            </Badge>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-medical-red">
                                {formatPrice(item.price)}
                              </span>
                              {item.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(item.originalPrice)}
                                </span>
                              )}
                            </div>

                            <div className={`text-sm font-medium ${
                              item.inStock ? 'text-medical-green' : 'text-medical-red'
                            }`}>
                              {item.inStock ? 'Còn hàng' : 'Hết hàng'}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 min-w-0 md:min-w-[120px]">
                          <Button
                            size="sm"
                            className="w-full bg-primary-600 hover:bg-primary-700"
                            disabled={!item.inStock}
                            onClick={() => handleAddToCart(item.id)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Thêm vào giỏ
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-medical-red border-medical-red hover:bg-medical-red hover:text-white"
                            onClick={() => handleRemoveFromWishlist(item.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Xóa
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Wishlist;
