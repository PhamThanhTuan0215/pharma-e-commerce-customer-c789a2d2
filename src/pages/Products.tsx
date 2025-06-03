
import React, { useState, useEffect } from 'react';
import { Filter, Grid3X3, List, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

// Mock data for products
const mockProducts = [
  {
    id: '1',
    name: 'Panadol Extra Forte 500mg - Giảm đau hạ sốt nhanh chóng',
    price: 125000,
    originalPrice: 150000,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300',
    rating: 4.8,
    sold: 1200,
    store: 'Nhà thuốc ABC',
    discount: 17,
    freeShipping: true
  },
  {
    id: '2',
    name: 'Blackmores Bio C 1000mg - Vitamin C tăng cường miễn dịch',
    price: 320000,
    originalPrice: 380000,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300',
    rating: 4.9,
    sold: 856,
    store: 'Pharma Store',
    discount: 16,
    freeShipping: true
  },
  {
    id: '3',
    name: 'Máy đo huyết áp Omron HEM-7120 - Chính xác và tiện dụng',
    price: 1250000,
    originalPrice: 1500000,
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=300',
    rating: 4.7,
    sold: 234,
    store: 'Medical Equipment',
    discount: 17,
    freeShipping: true
  },
  {
    id: '4',
    name: 'Centrum Advance Multivitamin - Bổ sung vitamin tổng hợp',
    price: 450000,
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8017?w=300',
    rating: 4.6,
    sold: 567,
    store: 'Health Plus',
    freeShipping: false
  },
  {
    id: '5',
    name: 'Khẩu trang y tế 4 lớp Nam Anh - Hộp 50 chiếc',
    price: 85000,
    originalPrice: 100000,
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300',
    rating: 4.5,
    sold: 3456,
    store: 'Medical Supply',
    discount: 15,
    freeShipping: true
  },
  {
    id: '6',
    name: 'Dầu gội trị gàu Head & Shoulders 400ml - Ngăn ngừa gàu hiệu quả',
    price: 156000,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300',
    rating: 4.4,
    sold: 789,
    store: 'Beauty Care',
    freeShipping: false
  }
];

const Products = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [products, setProducts] = useState(mockProducts);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const handleAddToCart = (productId: string) => {
    setCartCount(prev => prev + 1);
    console.log('Added to cart:', productId);
  };

  const handleLike = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product?.isLiked) {
      setWishlistCount(prev => Math.max(0, prev - 1));
    } else {
      setWishlistCount(prev => prev + 1);
    }
    
    setProducts(prev => 
      prev.map(p => 
        p.id === productId ? { ...p, isLiked: !p.isLiked } : p
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={() => setSidebarOpen(true)}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
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
                <span className="text-gray-900">Tất cả sản phẩm</span>
              </nav>
            </div>
          </div>

          {/* Filters and sorting */}
          <div className="bg-white border-b px-4 py-4">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600">Sắp xếp theo:</span>
                  <Button variant="outline" size="sm" className="text-primary-600 border-primary-600">
                    Phổ biến
                  </Button>
                  <Button variant="outline" size="sm">
                    Mới nhất
                  </Button>
                  <Button variant="outline" size="sm">
                    Bán chạy
                  </Button>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Giá" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price-low">Giá: Thấp đến Cao</SelectItem>
                      <SelectItem value="price-high">Giá: Cao đến Thấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 hidden md:inline">
                    <span className="text-primary-600">{products.length}</span> sản phẩm
                  </span>
                  <div className="flex border rounded-lg overflow-hidden">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active filters */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-sm text-gray-600">Bộ lọc đã chọn:</span>
                <Badge variant="secondary" className="bg-primary-100 text-primary-800">
                  Freeship
                  <button className="ml-1 text-primary-600 hover:text-primary-800">×</button>
                </Badge>
                <Badge variant="secondary" className="bg-primary-100 text-primary-800">
                  Giảm giá
                  <button className="ml-1 text-primary-600 hover:text-primary-800">×</button>
                </Badge>
              </div>
            </div>
          </div>

          {/* Products grid */}
          <div className="container mx-auto px-4 py-6">
            <div className={`grid gap-4 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onLike={handleLike}
                />
              ))}
            </div>

            {/* Load more */}
            <div className="text-center mt-8">
              <Button variant="outline" size="lg" className="px-8">
                Xem thêm sản phẩm
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Products;
