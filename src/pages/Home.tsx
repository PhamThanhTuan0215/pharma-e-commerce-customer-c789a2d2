import React, { useEffect, useState } from 'react';
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Loader2, Clock } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import productApi from '@/services/api-product-service';
import customerApi from '@/services/api-customer-service';
import { useNavigate } from 'react-router-dom';

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
    };
    promotion_name: string;
    promotion_value_percent: number;
    promotion_start_date: string;
    promotion_end_date: string;
    actual_price: number;
}

interface Promotion {
    catalog_promotion_id: string;
    seller_id: string;
    earliest_start_date: string;
    latest_end_date: string;
    name: string; // flash sale, black friday, ...
    product_ids: string[];
    products: Product[];
    total_products: number;
    isLoading?: boolean;
    hasMore?: boolean;
    currentPage?: number;
    maxValuePercent?: number;
}

interface CatalogProduct {
    id: string,
    name: string,
    brand: string,
    active_status: string,
    url_image: string,
    url_registration_license: string,
    product_type_id: string,
    category_id: string
}

const Home = () => {
    const navigate = useNavigate();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [productIdsInWishlist, setProductIdsInWishlist] = useState<string[]>([]);
    const ITEMS_PER_PAGE = 1;
    const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });

    const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
    const [catalogProductsLoading, setCatalogProductsLoading] = useState(false);
    const [catalogProductsPage, setCatalogProductsPage] = useState(0);
    const CATALOG_PRODUCTS_LIMIT = 10;
    const [catalogProductsSearch, setCatalogProductsSearch] = useState('');
    const [totalCatalogProducts, setTotalCatalogProducts] = useState(0);

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const getHeaderPromotion = (promotionName: string) => {
        // trả về class name của promotionName
        switch (promotionName) {
            case 'flash sale':
                return 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500';
            case 'black friday':
                return 'bg-gradient-to-r from-gray-900 to-black/60'; // đổi màu khác với danh mục sản phẩm
            default:
                return 'bg-gradient-to-r from-red-500 to-red-400';
        }
    }

    const fetchPromotions = async () => {
        setIsLoading(true);
        try {
            const response = await productApi.get('/promotions/available', {
                params: {
                    page: 1,
                    limit: ITEMS_PER_PAGE
                }
            });
            if (response.data.code === 0) {
                const promotionsData = response.data.data.map((promo: Promotion) => ({
                    ...promo,
                    isLoading: false,
                    hasMore: true,
                    currentPage: 1
                }));
                setPromotions(promotionsData);
            }
        } catch (error: any) {
            toast({
                variant: 'error',
                description: error.response?.data?.message || error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const loadMoreProducts = async (promotionName: string) => {
        const promotionIndex = promotions.findIndex(p => p.name === promotionName);
        if (promotionIndex === -1) return;

        const promotion = promotions[promotionIndex];
        if (promotion.isLoading || !promotion.hasMore) return;

        const nextPage = (promotion.currentPage || 1) + 1;

        // Update loading state
        setPromotions(prev => prev.map(p =>
            p.name === promotionName ? { ...p, isLoading: true } : p
        ));

        try {
            const response = await productApi.get(`/promotions/available/products`, {
                params: {
                    page: nextPage,
                    limit: ITEMS_PER_PAGE,
                    promotion_name: promotionName
                }
            });
            if (response.data.code === 0) {
                const newProducts = response.data.data;

                setPromotions(prev => prev.map(p => {
                    if (p.name === promotionName) {
                        return {
                            ...p,
                            products: [...p.products, ...newProducts],
                            isLoading: false,
                            hasMore: newProducts.length > 0,
                            currentPage: nextPage
                        };
                    }
                    return p;
                }));

                if (newProducts.length === 0) {
                    toast({
                        description: 'Đã hiển thị tất cả sản phẩm của chương trình khuyến mãi này',
                    });
                }
            }
        } catch (error: any) {
            toast({
                variant: 'error',
                description: error.response?.data?.message || error.message,
            });
            setPromotions(prev => prev.map(p =>
                p.name === promotionName ? { ...p, isLoading: false } : p
            ));
        }
    };

    const fetchCatalogProducts = async (isClear = false) => {
        setCatalogProductsLoading(true);

        let nextPage = (catalogProductsPage || 0) + 1;
        if (isClear) {
            nextPage = 1;
        }

        try {
            const response = await productApi.get(`/catalog-products`, {
                params: {
                    name: catalogProductsSearch || '',
                    active_status: 'active',
                    page: nextPage,
                    limit: CATALOG_PRODUCTS_LIMIT
                }
            });
            if (response.data.code === 0) {
                if (isClear) {
                    setCatalogProducts(response.data.data);
                }
                else {
                    setCatalogProducts(prev => [...prev, ...response.data.data]);
                }

                setTotalCatalogProducts(response.data.total);
                setCatalogProductsPage(nextPage);
            }
        } catch (error: any) {
            toast({
                variant: 'error',
                description: error.response?.data?.message || error.message,
            });
        } finally {
            setCatalogProductsLoading(false);
        }
    }

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
            };

            customerApi.delete(`/wishlists/remove`, { params })
                .then((response) => {
                    if (response.data.code === 0) {
                        const wishlistItemDeleted = response.data.data;
                        setProductIdsInWishlist(productIdsInWishlist.filter(id => id !== wishlistItemDeleted.product_id));

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
        } else {
            const payload = {
                user_id: user.id,
                product_id: product.id,
                product_name: product.name,
                product_url_image: product.url_image,
                price: product.retail_price,
                seller_id: product.seller_id,
                seller_name: product.seller_name
            };

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
        };

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

    const fetchProductIdsInWishlist = async () => {
        if (!isLoggedIn) return;

        const params = {
            user_id: user.id
        };

        try {
            const response = await customerApi.get(`/wishlists/product-ids`, { params });
            if (response.data.code === 0) {
                const productIds = response.data.data;
                setProductIdsInWishlist(productIds);
            }
        } catch (error: any) {
            toast({
                variant: 'error',
                description: error.response?.data?.message || error.message,
            });
        }
    };

    const handleProductClick = (productId: string) => {
        navigate(`/products/${productId}`);
    };

    // Calculate countdown to end of current day
    const calculateTimeLeft = () => {
        const now = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        const difference = endOfDay.getTime() - now.getTime();
        
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setCountdown({ hours, minutes, seconds });
    };

    // Update countdown every second
    useEffect(() => {
        const timer = setInterval(() => {
            calculateTimeLeft();
        }, 1000);

        calculateTimeLeft(); // Initial calculation
        
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchCatalogProducts(true);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [catalogProductsSearch]);

    useEffect(() => {
        fetchPromotions();
        fetchProductIdsInWishlist();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-12">
                        {promotions.map((promotion) => (
                            promotion.products.length > 0 && (
                                <div key={promotion.name} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                    {/* Header section with gradient background */}
                                    <div className={`${getHeaderPromotion(promotion.name)} p-8`}>
                                        <div className="flex flex-col md:flex-row justify-between items-start space-y-4 md:space-y-0">
                                            <div className="flex-1">
                                                <div className="inline-block px-4 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-3">
                                                    Chương trình khuyến mãi
                                                </div>
                                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                                                    {promotion.name}
                                                </h2>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                                        <span className="text-white/80 text-sm">
                                                            {promotion.total_products} sản phẩm
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {promotion.name === 'flash sale' ? (
                                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[240px]">
                                                    <div className="flex items-center text-white mb-2">
                                                        <Clock className="w-4 h-4 mr-2 text-white/80" />
                                                        <span className="text-white/80 text-sm font-medium">
                                                            Kết thúc trong
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-center gap-2 my-1">
                                                        <div className="flex flex-col items-center">
                                                            <div className="bg-white text-indigo-600 font-bold text-xl w-12 h-12 rounded-lg flex items-center justify-center shadow-lg">
                                                                {String(countdown.hours).padStart(2, '0')}
                                                            </div>
                                                            <span className="text-white/80 text-xs mt-1">Giờ</span>
                                                        </div>
                                                        <div className="text-white font-bold text-xl flex items-center">:</div>
                                                        <div className="flex flex-col items-center">
                                                            <div className="bg-white text-indigo-600 font-bold text-xl w-12 h-12 rounded-lg flex items-center justify-center shadow-lg">
                                                                {String(countdown.minutes).padStart(2, '0')}
                                                            </div>
                                                            <span className="text-white/80 text-xs mt-1">Phút</span>
                                                        </div>
                                                        <div className="text-white font-bold text-xl flex items-center">:</div>
                                                        <div className="flex flex-col items-center">
                                                            <div className="bg-white text-indigo-600 font-bold text-xl w-12 h-12 rounded-lg flex items-center justify-center shadow-lg animate-pulse">
                                                                {String(countdown.seconds).padStart(2, '0')}
                                                            </div>
                                                            <span className="text-white/80 text-xs mt-1">Giây</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-center mt-2">
                                                        <span className="inline-block px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full animate-bounce">
                                                            Hãy nhanh tay!
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[200px]">
                                                    <div className="text-white/80 text-sm font-medium mb-2">
                                                        Thời gian diễn ra
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center text-white">
                                                            <span className="text-white/60 text-sm mr-2">Từ:</span>
                                                            <span className="font-medium">
                                                                {new Date(promotion.earliest_start_date).toLocaleDateString('vi-VN', {
                                                                    year: 'numeric',
                                                                    month: '2-digit',
                                                                    day: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center text-white">
                                                            <span className="text-white/60 text-sm mr-2">Đến:</span>
                                                            <span className="font-medium">
                                                                {new Date(promotion.latest_end_date).toLocaleDateString('vi-VN', {
                                                                    year: 'numeric',
                                                                    month: '2-digit',
                                                                    day: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Products section */}
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                                            {promotion.products.map((product) => (
                                                <div key={product.id} className="transform transition-transform duration-200 hover:scale-105 cursor-pointer" onClick={() => handleProductClick(product.id)}>
                                                    <ProductCard
                                                        product={product}
                                                        onToggleWishlist={handleToggleWishlist}
                                                        onAddToCart={handleAddToCart}
                                                        isInWishlist={productIdsInWishlist.includes(product.id)}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Load more button */}
                                        {promotion.products.length < promotion.total_products && (
                                            <div className="mt-8 text-center">
                                                <Button
                                                    onClick={() => loadMoreProducts(promotion.name)}
                                                    disabled={promotion.isLoading}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
                                                >
                                                    {promotion.isLoading ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Đang tải...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>Xem thêm sản phẩm</span>
                                                            <span className="ml-2 text-sm opacity-80">
                                                                ({promotion.products.length}/{promotion.total_products})
                                                            </span>
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        ))}

                        {promotions.filter(p => p.total_products > 0).length === 0 && (
                            <div className="text-center py-12">
                                <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        Không có chương trình khuyến mãi
                                    </h3>
                                    <p className="text-gray-600">
                                        Hiện tại không có chương trình khuyến mãi nào đang diễn ra.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Catalog Products Section */}
                        <div className="mt-16">
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8">
                                    <h2 className="text-center text-2xl md:text-3xl font-bold text-white mb-4">
                                        Danh mục sản phẩm
                                    </h2>
                                    <div className="max-w-xl mx-auto">
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm sản phẩm..."
                                            className="w-full px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white placeholder-white/60 border border-white/20 focus:outline-none focus:border-white/40"
                                            value={catalogProductsSearch}
                                            onChange={(e) => setCatalogProductsSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="p-6">
                                    {catalogProductsLoading && catalogProducts.length === 0 ? (
                                        <div className="flex justify-center items-center h-32">
                                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                                                {catalogProducts.map((product) => (
                                                    <div
                                                        key={product.id}
                                                        className="cursor-pointer transform transition-all duration-200 hover:scale-105"
                                                        onClick={() => handleProductClick(product.id)}
                                                    >
                                                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                                            <div className="aspect-square relative">
                                                                <img
                                                                    src={product.url_image || '/default-product.png'}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="p-4">
                                                                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                                                                    {product.name}
                                                                </h3>
                                                                <p className="text-sm text-gray-500">
                                                                    Thương hiệu: {product.brand}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {catalogProducts.length < totalCatalogProducts && (
                                                <div className="mt-8 text-center">
                                                    <Button
                                                        onClick={() => fetchCatalogProducts()}
                                                        disabled={catalogProductsLoading}
                                                        className="bg-emerald-500 hover:bg-emerald-600 text-white transition-colors duration-200"
                                                    >
                                                        {catalogProductsLoading ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                Đang tải...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>Xem thêm sản phẩm</span>
                                                                <span className="ml-2 text-sm opacity-80">
                                                                    ({catalogProducts.length}/{totalCatalogProducts})
                                                                </span>
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            )}

                                            {!catalogProductsLoading && catalogProducts.length === 0 && (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-500">
                                                        Không tìm thấy sản phẩm nào phù hợp
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;