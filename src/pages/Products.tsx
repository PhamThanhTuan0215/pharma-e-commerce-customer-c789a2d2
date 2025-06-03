import React, { useState } from 'react';
import { Filter, SlidersHorizontal, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ProductCard from '@/components/ProductCard';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample products data - expanded for pagination
  const allProducts: Product[] = [
    {
      id: '1',
      name: 'Paracetamol 500mg - Hộp 100 viên',
      price: 25000,
      originalPrice: 30000,
      image: 'default-product.png',
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
      image: 'default-product.png',
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
      image: 'default-product.png',
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
      image: 'default-product.png',
      rating: 4.3,
      sold: 2341,
      store: 'Nhà thuốc Bình An',
      isLiked: false
    },
    // Additional products for pagination
    ...Array.from({ length: 26 }, (_, i) => ({
      id: `${i + 5}`,
      name: `Sản phẩm ${i + 5}`,
      price: Math.floor(Math.random() * 1000000) + 10000,
      originalPrice: Math.floor(Math.random() * 1200000) + 50000,
      image: 'default-product.png',
      rating: Math.floor(Math.random() * 2) + 4,
      sold: Math.floor(Math.random() * 5000) + 100,
      store: ['Nhà thuốc ABC', 'Pharma Store', 'Y tế ABC', 'Nhà thuốc Bình An'][Math.floor(Math.random() * 4)],
      discount: Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 10 : undefined,
      freeShipping: Math.random() > 0.5,
      isLiked: Math.random() > 0.7
    }))
  ];

  const totalPages = Math.ceil(allProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = allProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleLike = (productId: string) => {
    console.log('Liked product:', productId);
  };

  const handleAddToCart = (productId: string) => {
    console.log('Added to cart:', productId);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        cartCount={3}
        wishlistCount={allProducts.filter(p => p.isLiked).length}
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
            {currentProducts.map((product) => (
              <div key={product.id} onClick={() => handleProductClick(product.id)} className="cursor-pointer">
                <ProductCard
                  product={product}
                  onLike={handleLike}
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === pageNum}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {totalPages > 5 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Products;
