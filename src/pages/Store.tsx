import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Mail, Phone, CalendarDays, ArrowLeft, SlidersHorizontal, Grid, List, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import storeApi from '@/services/api-store-service';
import { toast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import productApi from "@/services/api-product-service";
import ProductCard from "@/components/ProductCard";
import customerApi from '@/services/api-customer-service';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";

interface StoreData {
    id: string;
    owner_id: string;
    name: string;
    description: string;
    avatar_url: string;
    banner_url: string;
    phone: string;
    email: string;
    address_line: string;
    province_id: number;
    province_name: string;
    district_id: number;
    district_name: string;
    ward_code: string;
    ward_name: string;
    address_detail: string;
    license_url: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

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

const Store = () => {
    const { tab } = useLocation().state || { tab: 'profile' };

    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [store, setStore] = useState<StoreData | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const itemsPerPage = 10;
    const [productIdsInWishlist, setProductIdsInWishlist] = useState<string[]>([]);
    let timeoutId: NodeJS.Timeout;
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [filters, setFilters] = useState({
        page: currentPage,
        limit: itemsPerPage,
        is_for_customer: true,
        name: null,
        sort_price: null,
    });

    const fetchStore = async () => {
        storeApi.get(`stores/${id}`)
            .then((response) => {
                if (response.data.code === 0) {
                    const storeData = response.data.data;
                    setStore(storeData);
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

    const fetchProducts = async () => {
        // setIsLoadingProducts(true);
        productApi.get('/products/list-product', {
          params: {
            seller_id: id,
            page: currentPage,
            limit: itemsPerPage,
            is_for_customer: true,
            name: filters.name,
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
            // setIsLoadingProducts(false);
          });
      }

    const handleSearch = (query: string) => {
        // đợi ngừng gõ mới fetch
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            setFilters({
                ...filters,
                name: query,
                page: 1 
            });
        }, 400);
    };

    const handleToggleWishlist = (product: Product) => {
        if (!isLoggedIn) {
            toast({
                variant: 'error',
                description: 'Vui lòng đăng nhập để sử dụng chức năng này',
            });
            return;
        }

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
        if (!isLoggedIn) {
            toast({
                variant: 'error',
                description: 'Vui lòng đăng nhập để sử dụng chức năng này',
            });
            return;
        }

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

    useEffect(() => {
        fetchProducts();
    }, [filters, currentPage]);

    useEffect(() => {
        fetchStore();
        fetchProducts();
        fetchProductIdsInWishlist();
    }, [id]);

    if (isLoading) {
        return (
            <div className="container max-w-6xl py-6 space-y-6">
                <Skeleton className="w-full h-[300px] rounded-lg" />
                <div className="flex gap-6">
                    <Skeleton className="w-[200px] h-[200px] rounded-lg" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="w-1/2 h-8" />
                        <Skeleton className="w-full h-20" />
                    </div>
                </div>
            </div>
        );
    }

    if (!store) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container max-w-6xl py-6 bg-gray-300">
                    <Button variant="outline" className=" backdrop-blur-sm bg-white/80 rounded-full" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Quay lại</span>
                    </Button>
                    <p className="text-center text-gray-500">Không tìm thấy thông tin cửa hàng</p>
                </div>
            </div>
        );
    }

    const fullAddress = `${store.address_detail}, ${store.ward_name}, ${store.district_name}, ${store.province_name}`;

    return (
        <>
            <Header />

            <div className="min-h-screen bg-gray-50">
                <div className="relative h-[350px]">
                    <Button variant="outline" className="absolute top-4 left-4 z-10 backdrop-blur-sm bg-white/80 rounded-full" onClick={() => {
                        if (tab === 'orders') {
                            navigate('/profile', { state: { tab: 'orders' } });
                        }
                        else {
                            navigate(-1);
                        }
                    }}>
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Quay lại</span>
                    </Button>

                    <img
                        src={store.banner_url}
                        alt={`${store.name} banner`}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                </div>

                <div className="container max-w-6xl -mt-16 relative z-10 pb-10">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <img
                                    src={store.avatar_url}
                                    alt={`${store.name} avatar`}
                                    className="w-[200px] h-[200px] rounded-lg border-4 border-white shadow-md object-cover"
                                />

                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
                                        <p className="text-sm text-gray-500">
                                            Tham gia từ {new Date(store.createdAt).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>

                                    <p className="text-gray-600">{store.description}</p>

                                    <Separator />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="w-5 h-5" />
                                            <span>{fullAddress}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Phone className="w-5 h-5" />
                                            <span>{store.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Mail className="w-5 h-5" />
                                            <span>{store.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <CalendarDays className="w-5 h-5" />
                                            <span>Cập nhật lần cuối: {new Date(store.updatedAt).toLocaleDateString("vi-VN")}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Products Section */}
                    <div className="mt-8">
                        <Card>
                            <CardContent className="p-6">
                                {/* Search and Filters */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <div className="flex-1 max-w-md relative">
                                        <Input
                                            className="pr-10 rounded-full border-blue-300"
                                            type="text"
                                            placeholder="Tìm kiếm sản phẩm..."
                                            onChange={(e) => handleSearch(e.target.value)}
                                        />
                                        <Search className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => setFilters({ 
                                                ...filters, 
                                                sort_price: filters.sort_price === 'asc' ? 'desc' : 'asc' 
                                            })}
                                        >
                                            <SlidersHorizontal className="w-4 h-4 mr-2" />
                                            Giá {filters.sort_price === 'asc' ? 'tăng dần' : 'giảm dần'}
                                        </Button>
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

                                {/* Products Grid */}
                                <div className={`grid gap-4 ${viewMode === 'grid'
                                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
                                    : 'grid-cols-1'
                                    }`}>
                                    {isLoadingProducts ? (
                                        <div className="col-span-full flex justify-center items-center h-32">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        </div>
                                    ) : products.length > 0 ? products.map((product) => (
                                        <div key={product.id} onClick={() => handleProductClick(product.id)} className="cursor-pointer">
                                            <ProductCard
                                                product={product}
                                                onToggleWishlist={handleToggleWishlist}
                                                onAddToCart={handleAddToCart}
                                                isInWishlist={productIdsInWishlist.includes(product.id)}
                                            />
                                        </div>
                                    )) : (
                                        <div className="col-span-full flex justify-center items-center h-32">
                                            <p className="text-gray-500">Không có sản phẩm nào</p>
                                        </div>
                                    )}
                                </div>

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
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Store; 