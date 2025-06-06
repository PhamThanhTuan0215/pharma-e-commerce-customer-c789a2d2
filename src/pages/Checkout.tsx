
import React, { useState } from 'react';
import { MapPin, CreditCard, Tag, Truck, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  store: string;
  selected: boolean;
}

interface VoucherOption {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minOrder: number;
}

const Checkout = () => {
  const [selectedAddress, setSelectedAddress] = useState('1');
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [note, setNote] = useState('');

  // Sample checkout items grouped by store
  const checkoutItems: Record<string, CheckoutItem[]> = {
    'Nhà thuốc ABC': [
      {
        id: '1',
        name: 'Paracetamol 500mg - Hộp 100 viên',
        price: 25000,
        quantity: 2,
        image: '/placeholder.svg',
        store: 'Nhà thuốc ABC',
        selected: true
      },
      {
        id: '2',
        name: 'Vitamin C 1000mg',
        price: 150000,
        quantity: 1,
        image: '/placeholder.svg',
        store: 'Nhà thuốc ABC',
        selected: true
      }
    ],
    'Pharma Store': [
      {
        id: '3',
        name: 'Máy đo huyết áp Omron',
        price: 1200000,
        quantity: 1,
        image: '/placeholder.svg',
        store: 'Pharma Store',
        selected: true
      }
    ]
  };

  const addresses = [
    {
      id: '1',
      name: 'Nhà riêng',
      address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
      phone: '0123456789',
      isDefault: true
    },
    {
      id: '2',
      name: 'Văn phòng',
      address: '456 Đường DEF, Phường GHI, Quận 3, TP.HCM',
      phone: '0987654321',
      isDefault: false
    }
  ];

  const paymentMethods = [
    {
      id: 'cod',
      name: 'Thanh toán khi nhận hàng (COD)',
      description: 'Thanh toán bằng tiền mặt khi nhận hàng',
      icon: '💵'
    },
    {
      id: 'banking',
      name: 'Chuyển khoản ngân hàng',
      description: 'Chuyển khoản qua ATM/Internet Banking',
      icon: '🏦'
    },
    {
      id: 'momo',
      name: 'Ví MoMo',
      description: 'Thanh toán qua ví điện tử MoMo',
      icon: '📱'
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      description: 'Thanh toán qua ví điện tử ZaloPay',
      icon: '💳'
    }
  ];

  const calculateStoreTotal = (items: CheckoutItem[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateGrandTotal = () => {
    return Object.values(checkoutItems).reduce((total, items) => {
      return total + calculateStoreTotal(items);
    }, 0);
  };

  const shippingFee = 30000; // Fixed shipping fee for demo
  const finalTotal = calculateGrandTotal() + shippingFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => {}} />
      
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-medical-blue" />
                  Địa chỉ giao hàng
                </CardTitle>
                <Button variant="outline" size="sm">
                  Thay đổi
                </Button>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                  {addresses.map((address) => (
                    <div key={address.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                      <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{address.name}</span>
                          {address.isDefault && (
                            <Badge variant="secondary" className="text-xs">Mặc định</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-1">{address.address}</p>
                        <p className="text-gray-600 text-sm">SĐT: {address.phone}</p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Products by Store */}
            {Object.entries(checkoutItems).map(([storeName, items]) => (
              <Card key={storeName}>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <div className="w-6 h-6 bg-medical-green rounded mr-2"></div>
                    {storeName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 py-3 border-b last:border-b-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-medical-red">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.price.toLocaleString('vi-VN')}đ/sản phẩm
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Store voucher selection */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 mr-2 text-medical-blue" />
                        <span className="text-sm font-medium">Voucher cửa hàng</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Chọn voucher
                      </Button>
                    </div>
                  </div>

                  {/* Shipping option */}
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Truck className="w-4 h-4 mr-2 text-medical-orange" />
                        <div>
                          <span className="text-sm font-medium">Giao hàng tiêu chuẩn</span>
                          <div className="flex items-center text-xs text-gray-600 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            Nhận hàng vào 3-5 ngày
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-medium">30.000đ</span>
                    </div>
                  </div>

                  {/* Store total */}
                  <div className="flex justify-between items-center pt-3 font-medium">
                    <span>Tổng tiền ({storeName}):</span>
                    <span className="text-medical-red">
                      {calculateStoreTotal(items).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-medical-blue" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{method.icon}</span>
                          <div>
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Order Note */}
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Ghi chú cho người bán (tùy chọn)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tổng tiền hàng:</span>
                    <span>{calculateGrandTotal().toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Phí vận chuyển:</span>
                    <span>{shippingFee.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Tổng thanh toán:</span>
                      <span className="font-bold text-lg text-medical-red">
                        {finalTotal.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Platform voucher */}
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-medical-red" />
                      <span className="text-sm font-medium">Voucher PharmaMart</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Chọn
                    </Button>
                  </div>
                </div>

                <Button 
                  className="w-full bg-medical-red hover:bg-red-600 text-white py-3 text-lg font-semibold"
                  size="lg"
                >
                  Đặt hàng
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Bằng việc đặt hàng, bạn đồng ý với{' '}
                  <a href="#" className="text-primary-600 hover:underline">
                    Điều khoản sử dụng
                  </a>{' '}
                  của PharmaMart
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
