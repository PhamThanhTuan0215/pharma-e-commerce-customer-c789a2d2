import React, { useState } from 'react';
import { Filter, SlidersHorizontal, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  sold: number;
  store: string;
  discount?: number;
  freeShipping?: boolean;
  isLiked?: boolean;
}

const Products = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState([0, 1000000]);

  // Sample products data with isLiked property
  const sampleProducts: Product[] = [
    {
      id: '1',
      name: 'Paracetamol 500mg - Hộp 100 viên',
      price: 25000,
      originalPrice: 30000,
      image: '/placeholder.svg',
      rating: 4.5,
      sold: 1234,
      store: 'Nhà thuốc ABC',
      discount: 17,
      freeShipping: true,
      isLiked: false
    },
    {
      id: '2',
      name: 'Vitamin C 1000mg Blackmores',
      price: 450000,
      image: '/placeholder.svg',
      rating: 4.8,
      sold: 856,
      store: 'Pharma Store',
      freeShipping: true,
      isLiked: true
    },
    {
      id: '3',
      name: 'Máy đo huyết áp Omron HEM-7121',
      price: 1200000,
      originalPrice: 1500000,
      image: '/placeholder.svg',
      rating: 4.7,
      sold: 432,
      store: 'Y tế ABC',
      discount: 20,
      isLiked: false
    },
    {
      id: '4',
      name: 'Dầu gió xanh Con Ó 5ml',
      price: 8000,
      image: '/placeholder.svg',
      rating: 4.3,
      sold: 2341,
      store: 'Nhà thuốc Bình An',
      isLiked: false
    }
  ];

  const handleLike = (productId: string) => {
    console.log('Liked product:', productId);
  };

  const handleAddToCart = (productId: string) => {
    console.log('Added to cart:', productId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        cartCount={3}
        wishlistCount={sampleProducts.filter(p => p.isLiked).length}
      />
      
      <div className="flex">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        <main className="flex-1 p-4">
          {/* Filters and sorting */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Bộ lọc
                </Button>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Sắp xếp
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products grid */}
          <div className={`grid gap-4 ${
            viewMode === 'grid' 
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
              : 'grid-cols-1'
          }`}>
            {sampleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onLike={handleLike}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {/* Load more */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Xem thêm sản phẩm
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Products;
