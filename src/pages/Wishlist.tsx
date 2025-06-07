import React, { useEffect, useState } from 'react';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import customerApi from '@/services/api-customer-service';
import { toast } from '@/hooks/use-toast';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleClickProduct = (item: any) => {
    navigate(`/products/${item.product_id}`);
  };

  const handleRemoveFromWishlist = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();

    const params = {
      user_id: item.user_id,
      product_id: item.product_id
    }

    customerApi.delete(`/wishlists/remove`, { params })
      .then((response) => {
        if (response.data.code === 0) {
          const wishlistItemDeleted = response.data.data;
          setWishlistItems(wishlistItems.filter(item => item.id !== wishlistItemDeleted.id));

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

  const handleAddToCart = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    
    const payload = {
      user_id: user.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_url_image: item.product_url_image,
      price: item.price,
      seller_id: item.seller_id,
      seller_name: item.seller_name,
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

  const fetchWishlistItems = () => {
    if (!isLoggedIn) return;

    setIsLoading(true);
    const params = {
      user_id: user.id
    }

    customerApi.get(`/wishlists`, { params })
      .then((response) => {
        if (response.data.code === 0) {
          const wishlistItems = response.data.data;
          setWishlistItems(wishlistItems);
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
  };

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  if (isLoading) {

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">

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
              {/* {wishlistItems.length > 0 && (
                <Button onClick={handleAddAllToCart} className="bg-primary-600 hover:bg-primary-700">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Thêm tất cả vào giỏ
                </Button>
              )} */}
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
                  <Button className="bg-primary-600 hover:bg-primary-700" onClick={() => navigate('/products')}>
                    Khám phá sản phẩm
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* Wishlist items */
              <div className="space-y-4">
                {wishlistItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden cursor-pointer" onClick={() => handleClickProduct(item)}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Product image */}
                        <div className="flex-shrink-0">
                          <div className="relative w-full md:w-32 h-32">
                            <img
                              src={item.product_url_image || "/default-product.png"}
                              alt={item.product_name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        </div>

                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                            {item.product_name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">{item.seller_name}</p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-medical-red">
                                {formatPrice(item.price)}
                              </span>
                            </div>

                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 min-w-0 md:min-w-[120px]">
                          <Button
                            size="sm"
                            className="w-full bg-primary-600 hover:bg-primary-700"
                            onClick={(e) => handleAddToCart(e, item)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Thêm vào giỏ
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-medical-red border-medical-red hover:bg-medical-red hover:text-white"
                            onClick={(e) => handleRemoveFromWishlist(e, item)}
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
