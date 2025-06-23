import React, { useEffect, useState } from 'react';
import { Minus, Plus, Trash2, ShoppingCart, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import { Link, useNavigate } from 'react-router-dom';
import customerApi from '@/services/api-customer-service';
import { toast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  original_price: string;
  price: string;
  product_url_image: string;
  quantity: number;
  seller_id: string;
  seller_name: string;
  selected?: boolean;
  stock: number;
  promotion_name: string;
  promotion_value_percent: number;
  promotion_start_date: string;
  promotion_end_date: string;
}
interface Store {
  seller_id: string;
  seller_name: string;
  total_quantity: number;
  total_price: number;
  products: CartItem[];
}

// Mock cart data grouped by store
// const mockCartItems = [
//   {
//     seller_id: '1',
//     seller_name: 'ABC Store',
//     total_quantity: 4,
//     total_price: 41000,
//     products: [
//       {
//         id: '18',
//         user_id: '1',
//         product_id: '1',
//         product_name: 'Kem bôi da Ketoconazol 2%',
//         price: '11000',
//         product_url_image: 'https://res.cloudinary.com/dyacy1md1/image/upload/v1747463989/ecommerce-pharmacy/products/jrxob9mq3cj0wsruixl4.jpg',
//         quantity: 3,
//         seller_id: '1',
//         seller_name: 'ABC Store',
//         selected: true
//       },
//       {
//         id: '19',
//         user_id: '1',
//         product_id: '2',
//         product_name: 'Bông y tế',
//         price: '8000',
//         product_url_image: 'https://res.cloudinary.com/dyacy1md1/image/upload/v1747731300/ecommerce-pharmacy/products/oqjacwdsz7yoepau8e99.webp',
//         quantity: 1,
//         seller_id: '1',
//         seller_name: 'ABC Store',
//         selected: true
//       }
//     ]
//   },
//   {
//     seller_id: '2',
//     seller_name: 'DEF Store',
//     total_quantity: 2,
//     total_price: 30000,
//     products: [
//       {
//         id: '20',
//         user_id: '1',
//         product_id: '3',
//         product_name: 'Túi chườm nóng',
//         price: '15000',
//         product_url_image: 'https://res.cloudinary.com/dyacy1md1/image/upload/v1747731300/ecommerce-pharmacy/products/oqjacwdsz7yoepau8e99.webp',
//         quantity: 2,
//         seller_id: '2',
//         seller_name: 'DEF Store',
//         selected: true
//       }
//     ]
//   }
// ];

const Cart = () => {
  const [cartData, setCartData] = useState<Store[]>([]);

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  if (!isLoggedIn) {
    return <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center mt-20 h-screen">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Vui lòng đăng nhập để xem giỏ hàng</h1>
          <Button onClick={() => {
            navigate('/login');
          }}>Đăng nhập</Button>
        </div>
      </div>
    </div>;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const increaseQuantity = (item: CartItem) => {
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
          // Update the cart data with the new item quantity
          setCartData(prev => {
            return prev.map(store => {
              if (store.seller_id === item.seller_id) {
                // Update store total quantity
                const updatedStore = {
                  ...store,
                  total_quantity: store.total_quantity + 1,
                  products: store.products.map(product => {
                    if (product.id === item.id) {
                      // Update the product quantity
                      return {
                        ...product,
                        quantity: product.quantity + 1
                      };
                    }
                    return product;
                  })
                };
                return updatedStore;
              }
              return store;
            });
          });

          console.log(response.data.message);
        }
      })
      .catch((error) => {
        toast({
          variant: 'error',
          description: error.response?.data?.message || error.message,
        });
      });
  };

  const decreaseQuantity = (item: CartItem) => {
    if (item.quantity <= 1) {
      return;
    }

    customerApi.delete(`/carts/reduce/${item.id}`)
      .then((response) => {
        if (response.data.code === 0) {
          // Update the cart data with the reduced quantity
          setCartData(prev => {
            return prev.map(store => {
              if (store.seller_id === item.seller_id) {
                // Update store total quantity
                const updatedStore = {
                  ...store,
                  total_quantity: store.total_quantity - 1,
                  products: store.products.map(product => {
                    if (product.id === item.id) {
                      // Update the product quantity
                      return {
                        ...product,
                        quantity: product.quantity - 1
                      };
                    }
                    return product;
                  })
                };
                return updatedStore;
              }
              return store;
            });
          });

          console.log(response.data.message);
        }
      })
      .catch((error) => {
        toast({
          variant: 'error',
          description: error.response?.data?.message || error.message,
        });
      });
  }

  const toggleItemSelection = (sellerId: string, itemId: string) => {
    setCartData(prev =>
      prev.map(store =>
        store.seller_id === sellerId
          ? {
            ...store,
            products: store.products.map(item =>
              item.id === itemId ? { ...item, selected: !item.selected } : item
            )
          }
          : store
      )
    );
  };

  const toggleStoreSelection = (sellerId: string) => {
    setCartData(prev =>
      prev.map(store => {
        if (store.seller_id === sellerId) {
          const allSelected = store.products.every(item => item.selected);
          return {
            ...store,
            products: store.products.map(item => ({ ...item, selected: !allSelected }))
          };
        }
        return store;
      })
    );
  };

  const removeItem = (item: CartItem) => {
    customerApi.delete(`/carts/remove/${item.id}`)
      .then((response) => {
        if (response.data.code === 0) {
          // Update the cart data by removing the item
          setCartData(prev => {
            // First, filter out the item from its store
            const updatedStores = prev.map(store => {
              if (store.seller_id === item.seller_id) {
                return {
                  ...store,
                  total_quantity: store.total_quantity - item.quantity,
                  products: store.products.filter(product => product.id !== item.id)
                };
              }
              return store;
            });
            
            // Then, remove any stores that no longer have products
            return updatedStores.filter(store => store.products.length > 0);
          });

          console.log(response.data.message);
        }
      })
      .catch((error) => {
        toast({
          variant: 'error',
          description: error.response?.data?.message || error.message,
        });
      });
  };

  const getStoreTotal = (store: Store) => {
    return store.products
      .filter((item: CartItem) => item.selected)
      .reduce((total: number, item: CartItem) => total + (Number(item.price) * item.quantity), 0);
  };

  const getGrandTotal = () => {
    return cartData.reduce((total, store) => total + getStoreTotal(store), 0);
  };

  const getStoreQuantity = (store: Store) => {
    return store.products.reduce((total: number, item: CartItem) => total + item.quantity, 0);
  };

  const getTotalQuantity = () => {
    return cartData.reduce((total, store) => total + getStoreQuantity(store), 0);
  };

  const isOutOfStock = () => {
    return cartData.some((store: Store) => store.products.some((item: CartItem) => item.stock === 0));
  };

  const getSelectedItemsCount = () => {
    return cartData.reduce((count, store) =>
      count + store.products.filter(item => item.selected).length, 0
    );
  };

  const handleClickProduct = (item: CartItem) => {
    navigate(`/products/${item.product_id}`);
  };

  const fetchCartData = async () => {
    if (!isLoggedIn) return;

    setIsLoading(true);
    const params = {
      user_id: user.id
    }

    customerApi.get(`/carts`, { params })
      .then((response) => {
        if (response.data.code === 0) {
          const cartData = response.data.data;
          // thêm tự động selected = true cho tất cả các sản phẩm
          cartData.forEach((store: Store) => {
            store.products.forEach((item: CartItem) => {
              item.selected = true;
            });
          });
          setCartData(cartData);
        }
      })
      .catch((error) => {
        toast({
          variant: 'error',
          description: error.response?.data?.message || error.message,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCartData();
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
                <span onClick={() => navigate('/')} className="cursor-pointer hover:text-gray-900">Trang chủ</span>
                <span className="mx-2">/</span>
                <span className="text-gray-900">Giỏ hàng</span>
              </nav>
            </div>
          </div>

          <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <ShoppingCart className="w-6 h-6 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Giỏ hàng ({getTotalQuantity()})
              </h1>
            </div>

            {getTotalQuantity() === 0 ? (
              /* Empty cart */
              <Card className="text-center py-12">
                <CardContent>
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Giỏ hàng trống
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
                  </p>
                  <Link to="/">
                    <Button className="bg-primary-600 hover:bg-primary-700">
                      Tiếp tục mua sắm
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cart items */}
                <div className="lg:col-span-2 space-y-4">
                  {cartData.map((store) => (
                    <Card key={store.seller_id}>
                      <CardContent className="p-4">
                        {/* Store header */}
                        <div className="flex items-center gap-3 mb-4">
                          {/* <Checkbox
                            checked={store.products.every(item => item.selected)}
                            onCheckedChange={() => toggleStoreSelection(store.seller_id)}
                          /> */}
                          <Store className="w-5 h-5 text-primary-600" />
                          <span className="font-medium text-gray-900">{store.seller_name}</span>
                        </div>

                        {/* Store items */}
                        <div className="space-y-4">
                          {store.products.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-gray-50 rounded-lg justify-between">
                              <div onClick={() => handleClickProduct(item)} className="flex items-center gap-4 w-full sm:w-auto cursor-pointer">
                                {/* <Checkbox
                                  checked={item.selected}
                                  onCheckedChange={() => toggleItemSelection(store.seller_id, item.id)}
                                /> */}

                                <img
                                  src={item.product_url_image || "/default-product.png"}
                                  alt={item.product_name}
                                  className="w-16 h-16 object-cover rounded"
                                />

                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 mb-1">{item.product_name}</h4>
                                  <div className="flex items-center gap-2">
                                    {Number(item.original_price) !== Number(item.price) && (
                                      <span className="text-sm text-gray-500 line-through">
                                        {formatPrice(Number(item.original_price))}
                                      </span>
                                    )}
                                    <span className="text-lg font-bold text-medical-red">
                                      {formatPrice(Number(item.price))}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                {item.stock === 0 ? (
                                  <span className="text-sm text-red-500 bg-red-100 px-2 py-1 rounded-md">Hết hàng</span>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => decreaseQuantity(item)}
                                      disabled={item.quantity <= 1}
                                    >
                                      <Minus className="w-4 h-4" />
                                    </Button>
                                    <span className="w-8 text-center">{item.quantity}</span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => increaseQuantity(item)}
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-medical-red hover:text-medical-red hover:bg-red-50"
                                  onClick={() => removeItem(item)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <Separator className="my-4" />

                        {/* Store total */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Tổng đơn hàng ({store.seller_name}):</span>
                          <span className="text-lg font-bold text-primary-600">
                            {formatPrice(getStoreTotal(store))}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Order summary */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-4">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h3>

                      <div className="space-y-3 mb-4">

                        {/* <div className="flex justify-between">
                          <span className="text-gray-600">Tạm tính ({getSelectedItemsCount()} sản phẩm):</span>
                          <span>{formatPrice(getGrandTotal())}</span>
                        </div> */}

                        {cartData.map((store) => (
                          <div className="flex justify-between" key={store.seller_id}>
                            <span>{store.seller_name} ({getStoreQuantity(store)} sản phẩm)</span>
                            <span>{formatPrice(getStoreTotal(store))}</span>
                          </div>
                        ))}

                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Tổng số sản phẩm:</span>
                          <span className="text-medical-blue">{getTotalQuantity()}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span>Tổng cộng:</span>
                          <span className="text-medical-red">{formatPrice(getGrandTotal())}</span>
                        </div>
                        <span className="text-gray-500 text-sm italic">(không bao gồm phí vận chuyển)</span>
                      </div>

                      <Link to={getTotalQuantity() === 0 || isOutOfStock() ? '#' : '/checkout'}>
                        <Button
                          className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                          disabled={getTotalQuantity() === 0 || isOutOfStock()}
                        >
                          Mua hàng ({getTotalQuantity()})
                        </Button>
                      </Link>

                      <Link to="/">
                        <Button variant="outline" className="w-full mt-2">
                          Tiếp tục mua sắm
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Cart;
