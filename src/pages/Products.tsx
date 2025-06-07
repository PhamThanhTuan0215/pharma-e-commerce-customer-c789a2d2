import React, { useEffect, useState } from 'react';
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
import productApi from '@/services/api-product-service';
import customerApi from '@/services/api-customer-service';
import { toast } from '@/hooks/use-toast';

// products mock data
// const allProducts: Product[] = [
//   {
//     id: '1',
//     name: 'Kem bôi da Ketoconazol 2%',
//     retail_price: 25000,
//     url_image: 'default-product.png',
//     seller_name: 'ABC Store',
//     isLiked: false,
//     product_details: {
//       "Tên hiển thị": "Kem bôi da Ketoconazol 2% Medipharco điều trị các bệnh nấm da và niêm mạc (10g)",
//       "Đơn vị tính": "Hộp",
//       "Quy cách": "Hộp x 10g"
//     }
//   }
// ];

interface Product {
  id: string;
  name: string;
  retail_price: number;
  stock: number;
  url_image: string;
  seller_id: string;
  seller_name: string;
  product_details: {
    [key: string]: string;
  }
}

const Products = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [advancedFilter, setAdvancedFilter] = useState({
    name: null,
    brand: null,
    product_type_name: null,
    category_name: null,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [productIdsInWishlist, setProductIdsInWishlist] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState({
    page: currentPage,
    limit: itemsPerPage,
    is_for_customer: true,
    name: null,
    brand: null,
    product_type_name: null,
    category_name: null,
    sort_price: null, // '', 'asc' or 'desc'
  });

  const handleProductTypeSelect = (productType: string) => {
    setFilters({
      ...filters,
      product_type_name: productType,
      category_name: null,
      brand: null,
      name: null,
      sort_price: null,
      page: 1
    });
  };

  const handleCategorySelect = (category: string) => {
    setFilters({
      ...filters,
      category_name: category,
      product_type_name: null,
      brand: null,
      name: null,
      sort_price: null,
      page: 1
    });

    setIsSidebarOpen(false);
  };

  const handleBrandSelect = (brand: string) => {
    setFilters({
      ...filters,
      brand: brand,
      product_type_name: null,
      category_name: null,
      name: null,
      sort_price: null,
      page: 1
    });

    setIsSidebarOpen(false);
  };

  const handleSearch = (query: string) => {
    setFilters({
      ...filters,
      name: query,
      brand: null,
      product_type_name: null,
      category_name: null,
      sort_price: null,
      page: 1
    });
  };

  const handleToggleWishlist = (product: Product) => {

    if (productIdsInWishlist.includes(product.id)) {

      const params = {
        user_id: user.id,
        product_id: product.id
      }

      customerApi.delete(`/wishlists/remove`, { params })
        .then((response) => {
          if (response.data.code === 0) {
            const wilistItemDeleted = response.data.data;
            setProductIdsInWishlist(productIdsInWishlist.filter(id => id !== wilistItemDeleted.product_id));

            toast({
              variant: 'success',
              description: response.data.message,
            });
          }
        })
        .catch((error) => {
          toast({
            variant: 'error',
            description: error.response.data.message || error.message,
          });
        });
    }
    else {
      const payload = {
        user_id: user.id,
        product_id: product.id,
        product_name: product.name,
        product_url_image: product.url_image,
        price: product.retail_price,
        seller_id: product.seller_id,
        seller_name: product.seller_name
      }

      customerApi.post(`/wishlists/add`, payload)
        .then((response) => {
          if (response.data.code === 0) {
            const wishlistItemAdded = response.data.data;
            setProductIdsInWishlist([...productIdsInWishlist, wishlistItemAdded.product_id]);

            toast({
              variant: 'success',
              description: response.data.message,
            });
          }
        })
        .catch((error) => {
          toast({
            variant: 'error',
            description: error.response.data.message || error.message,
          });
        });
    }
  };

  const handleAddToCart = (product: Product) => {

    const payload = {
      user_id: user.id,
      product_id: product.id,
      product_name: product.name,
      product_url_image: product.url_image,
      price: product.retail_price,
      seller_id: product.seller_id,
      seller_name: product.seller_name,
      quantity: 1
    }

    customerApi.post(`/carts/add`, payload)
      .then((response) => {
        if (response.data.code === 0) {
          toast({
            variant: 'success',
            description: response.data.message,
          });
        }
      })
      .catch((error) => {
        toast({
          variant: 'error',
          description: error.response.data.message || error.message,
        });
      });

  };

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const fetchProductIdsInWishlist = async () => {

    if (!isLoggedIn) return;

    const params = {
      user_id: user.id
    }

    customerApi.get(`/wishlists/product-ids`, { params })
      .then((response) => {
        if (response.data.code === 0) {
          const productIds = response.data.data;
          setProductIdsInWishlist(productIds);
        }
      })
      .catch((error) => {
        toast({
          variant: 'error',
          description: error.response.data.message || error.message,
        });
      });
  }

  const fetchProducts = async () => {
    setIsLoading(true);
    productApi.get('/products/list-product', {
      params: {
        page: currentPage,
        limit: itemsPerPage,
        is_for_customer: true,
        name: filters.name,
        brand: filters.brand,
        product_type_name: filters.product_type_name,
        category_name: filters.category_name,
        sort_price: filters.sort_price,
      }
    })
      .then((response) => {
        if (response.data.code === 0) {
          const products = response.data.data;
          const totalProducts = response.data.total;
          setTotalPages(Math.ceil(totalProducts / itemsPerPage));
          setProducts(products);
        }
      })
      .catch((error) => {
        toast({
          variant: 'error',
          description: error.response.data.message || error.message,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const handleApplyAdvancedFilter = () => {
    setIsAdvancedFilterOpen(false);
    setFilters({
      ...filters,
      name: advancedFilter.name,
      brand: advancedFilter.brand,
      product_type_name: advancedFilter.product_type_name,
      category_name: advancedFilter.category_name,
      sort_price: null,
      page: 1
    });
  }

  const handleResetAdvancedFilter = () => {
    setAdvancedFilter({ name: "", brand: "", product_type_name: "", category_name: "" });
  }

  useEffect(() => {
    fetchProducts();
    fetchProductIdsInWishlist();
  }, [filters, currentPage]);

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50">
  //       <Header isShowMenu={true} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} onSearch={handleSearch} />
  //       <div className="container mx-auto px-4 py-6">
  //         <div className="animate-pulse">
  //           <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
  //           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
  //             <div className="aspect-square bg-gray-200 rounded-lg"></div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        isShowMenu={true}
        isEnableSearchBar={true}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onSearch={handleSearch}
      />

      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelectCategory={handleCategorySelect}
          onSelectBrand={handleBrandSelect}
          onSelectProductType={handleProductTypeSelect}
        />

        <main className="flex-1 p-4">
          {/* Filters and sorting */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4 relative">
                <Button variant="outline" size="sm" onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}>
                  <Filter className="w-4 h-4 mr-2" />
                  Bộ lọc
                </Button>
                {isAdvancedFilterOpen && (
                  <div className="absolute z-10 top-full left-0 mt-2 p-4 bg-white rounded-lg shadow-lg border w-64">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Tên sản phẩm</label>
                        <Input
                          type="text"
                          placeholder="Tên sản phẩm"
                          value={advancedFilter.name}
                          onChange={(e) => setAdvancedFilter({ ...advancedFilter, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Thương hiệu</label>
                        <Input
                          type="text"
                          placeholder="Thương hiệu"
                          value={advancedFilter.brand}
                          onChange={(e) => setAdvancedFilter({ ...advancedFilter, brand: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Loại sản phẩm</label>
                        <Input
                          type="text"
                          placeholder="Loại sản phẩm"
                          value={advancedFilter.product_type_name}
                          onChange={(e) => setAdvancedFilter({ ...advancedFilter, product_type_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Danh mục</label>
                        <Input
                          type="text"
                          placeholder="Danh mục"
                          value={advancedFilter.category_name}
                          onChange={(e) => setAdvancedFilter({ ...advancedFilter, category_name: e.target.value })}
                        />
                      </div>
                      <div className="pt-2 flex justify-between">
                        <Button
                          onClick={() => setIsAdvancedFilterOpen(false)}
                          variant="outline"
                          size="sm"
                        >
                          Đóng
                        </Button>
                        <Button
                          onClick={handleResetAdvancedFilter}
                          variant="outline"
                          size="sm"
                        >
                          Đặt lại
                        </Button>
                        <Button
                          onClick={handleApplyAdvancedFilter}
                          variant="outline"
                          size="sm"
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          Lọc
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={() => setFilters({ ...filters, sort_price: filters.sort_price === 'asc' ? 'desc' : 'asc' })}>
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Sắp xếp theo giá {filters.sort_price === 'asc' ? 'tăng dần' : 'giảm dần'}
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
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ) : (
             <div className={`grid gap-4 ${viewMode === 'grid'
            ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            : 'grid-cols-1'
            }`}>
            {products.length > 0 ? products.map((product) => (
              <div key={product.id} onClick={() => handleProductClick(product.id)} className="cursor-pointer">
                <ProductCard
                  product={product}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={handleAddToCart}
                  isInWishlist={productIdsInWishlist.includes(product.id)}
                />
              </div>
            )) : (
              <div className="col-span-full flex justify-center items-center h-full">
                <p className="text-gray-500">Không có sản phẩm nào phù hợp</p>
              </div>
            )}
          </div>
          )}

          {/* Pagination */}
          {totalPages > 0 && (
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
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;
