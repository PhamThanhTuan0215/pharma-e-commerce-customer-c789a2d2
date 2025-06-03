
import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingCart, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Link } from 'react-router-dom';

// Mock cart data grouped by store
const mockCartItems = [
  {
    storeId: '1',
    storeName: 'Nhà thuốc ABC',
    freeShippingThreshold: 300000,
    items: [
      {
        id: '1',
        name: 'Panadol Extra Forte 500mg',
        price: 125000,
        originalPrice: 150000,
        image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300',
        quantity: 2,
        selected: true
      },
      {
        id: '2',
        name: 'Vitamin C 1000mg',
        price: 89000,
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300',
        quantity: 1,
        selected: true
      }
    ]
  },
  {
    storeId: '2',
    storeName: 'Medical Equipment Store',
    freeShippingThreshold: 500000,
    items: [
      {
        id: '3',
        name: 'Máy đo huyết áp Omron HEM-7120',
        price: 1250000,
        originalPrice: 1500000,
        image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=300',
        quantity: 1,
        selected: false
      }
    ]
  }
];

const Cart = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartData, setCartData] = useState(mockCartItems);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const updateQuantity = (storeId: string, itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartData(prev => 
      prev.map(store => 
        store.storeId === storeId 
          ? {
              ...store,
              items: store.items.map(item => 
                item.id === itemId ? { ...item, quantity: newQuantity } : item
              )
            }
          : store
      )
    );
  };

  const toggleItemSelection = (storeId: string, itemId: string) => {
    setCartData(prev => 
      prev.map(store => 
        store.storeId === storeId 
          ? {
              ...store,
              items: store.items.map(item => 
                item.id === itemId ? { ...item, selected: !item.selected } : item
              )
            }
          : store
      )
    );
  };

  const toggleStoreSelection = (storeId: string) => {
    setCartData(prev => 
      prev.map(store => {
        if (store.storeId === storeId) {
          const allSelected = store.items.every(item => item.selected);
          return {
            ...store,
            items: store.items.map(item => ({ ...item, selected: !allSelected }))
          };
        }
        return store;
      })
    );
  };

  const removeItem = (storeId: string, itemId: string) => {
    setCartData(prev => 
      prev.map(store => 
        store.storeId === storeId 
          ? { ...store, items: store.items.filter(item => item.id !== itemId) }
          : store
      ).filter(store => store.items.length > 0)
    );
  };

  const getStoreTotal = (store: any) => {
    return store.items
      .filter((item: any) => item.selected)
      .reduce((total: number, item: any) => total + (item.price * item.quantity), 0);
  };

  const getGrandTotal = () => {
    return cartData.reduce((total, store) => total + getStoreTotal(store), 0);
  };

  const getSelectedItemsCount = () => {
    return cartData.reduce((count, store) => 
      count + store.items.filter(item => item.selected).length, 0
    );
  };

  const totalItems = cartData.reduce((total, store) => total + store.items.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={() => setSidebarOpen(true)}
        cartCount={totalItems}
        wishlistCount={0}
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
                <span className="text-gray-900">Giỏ hàng</span>
              </nav>
            </div>
          </div>

          <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <ShoppingCart className="w-6 h-6 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Giỏ hàng ({totalItems})
              </h1>
            </div>

            {totalItems === 0 ? (
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
                    <Card key={store.storeId}>
                      <CardContent className="p-4">
                        {/* Store header */}
                        <div className="flex items-center gap-3 mb-4">
                          <Checkbox
                            checked={store.items.every(item => item.selected)}
                            onCheckedChange={() => toggleStoreSelection(store.storeId)}
                          />
                          <Package className="w-5 h-5 text-primary-600" />
                          <span className="font-medium text-gray-900">{store.storeName}</span>
                          {getStoreTotal(store) >= store.freeShippingThreshold && (
                            <Badge className="bg-medical-green text-white">Freeship</Badge>
                          )}
                        </div>

                        {/* Free shipping progress */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">
                              Mua thêm {formatPrice(Math.max(0, store.freeShippingThreshold - getStoreTotal(store)))} để được freeship
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-medical-green h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, (getStoreTotal(store) / store.freeShippingThreshold) * 100)}%`
                              }}
                            />
                          </div>
                        </div>

                        {/* Store items */}
                        <div className="space-y-4">
                          {store.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                              <Checkbox
                                checked={item.selected}
                                onCheckedChange={() => toggleItemSelection(store.storeId, item.id)}
                              />
                              
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                              />

                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-medical-red">
                                    {formatPrice(item.price)}
                                  </span>
                                  {item.originalPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                      {formatPrice(item.originalPrice)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(store.storeId, item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(store.storeId, item.id, item.quantity + 1)}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-medical-red hover:text-medical-red hover:bg-red-50"
                                onClick={() => removeItem(store.storeId, item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        <Separator className="my-4" />
                        
                        {/* Store total */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Tổng đơn hàng ({store.storeName}):</span>
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
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tạm tính ({getSelectedItemsCount()} sản phẩm):</span>
                          <span>{formatPrice(getGrandTotal())}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phí vận chuyển:</span>
                          <span className="text-medical-green">Miễn phí</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Tổng cộng:</span>
                          <span className="text-medical-red">{formatPrice(getGrandTotal())}</span>
                        </div>
                      </div>

                      <Link to="/checkout">
                        <Button 
                          className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                          disabled={getSelectedItemsCount() === 0}
                        >
                          Mua hàng ({getSelectedItemsCount()})
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
