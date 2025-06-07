import React, { useEffect, useState } from 'react';
import { MapPin, CreditCard, Tag, Truck, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import shipmentApi from '@/services/api-shipment-service';
import paymentApi from '@/services/api-payment-service';
import customerApi from '@/services/api-customer-service';
import apiGHN from '@/services/api-GHN';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AddressType {
  id?: string;
  address_name: string;
  user_id: string;
  full_name: string;
  phone: string;
  province_id: number;
  province_name: string;
  district_id: number;
  district_name: string;
  ward_code: string;
  ward_name: string;
  address_detail: string;
  is_default: boolean;
}

interface Voucher {
  id: string;
  code: string;
  type: 'order' | 'freeship';
  issuer_type: 'platform' | 'shop';
  issuer_id: string;
  issuer_name: string;
  description: string;
  discount_unit: 'amount' | 'percent';
  discount_value: number;
  min_order_value?: number;
  max_discount_value?: number;
  start_date: string | null;
  end_date: string | null;
}

interface ProductInCart {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_url_image: string;
  price: string;
  quantity: number;
  seller_id: string;
  seller_name: string;
}

interface StoreOrder {
  seller_id: string;
  seller_name: string;
  total_quantity: number;
  original_items_total: number;
  original_shipping_fee: number;
  discount_amount_items: number;
  discount_amount_shipping: number;
  items_total_after_discount: number;
  shipping_fee_after_discount: number;
  discount_amount_items_platform_allocated: number;
  discount_amount_shipping_platform_allocated: number;
  final_total: number;
  order_voucher: {
    is_applied: boolean;
    code: string | null;
    voucher_id: string | null;
    discount_amount: number;
  },
  freeship_voucher: {
    is_applied: boolean;
    code: string | null;
    voucher_id: string | null;
    discount_amount: number;
  },
  platform_order_voucher: {
    is_applied: boolean;
    code: string | null;
    voucher_id: string | null;
    discount_amount: number;
  },
  platform_freeship_voucher: {
    is_applied: boolean;
    code: string | null;
    voucher_id: string | null;
    discount_amount: number;
  },
  products: ProductInCart[];
}

interface PaymentMethodType {
  id: string;
  method_name: string;
  description: string;
}

// hàm lấy phí ship tạm thời thay thế cho api
const randomShippingFee = (addresses: AddressType[], storeOrder: StoreOrder) => {

  if (addresses.length === 0) {
    return 0;
  }

  return Math.floor(Math.random() * 10000) + 10000;
}

const Checkout = () => {

  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!isLoggedIn) {
    return <div>Vui lòng đăng nhập để mua hàng</div>;
  }

  const [selectedAddress, setSelectedAddress] = useState('1');
  const [selectedPayment, setSelectedPayment] = useState('cod');

  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodType[]>([]);
  const [storeOrders, setStoreOrders] = useState<StoreOrder[]>([]);

  const [cartSummary, setCartSummary] = useState<any>({
    platform_discount_amount_items: 10000,
    platform_discount_amount_shipping: 10000,
    platform_order_voucher: {
      is_applied: false,
      code: '',
      voucher_id: null,
      discount_amount: 0
    },
    platform_freeship_voucher: {
      is_applied: false,
      code: '',
      voucher_id: null,
      discount_amount: 0
    }
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const calculateStoresOriginalItemsTotal = () => {
    return storeOrders.reduce((total, storeOrder) => {
      return total + storeOrder.original_items_total;
    }, 0);
  };

  const calculateStoresOriginalShippingFee = () => {
    return storeOrders.reduce((total, storeOrder) => {
      return total + storeOrder.original_shipping_fee;
    }, 0);
  };

  const calculateStoresDiscountAmountItems = () => {
    return storeOrders.reduce((total, storeOrder) => {
      return total + storeOrder.discount_amount_items;
    }, 0);
  };

  const calculateStoresDiscountAmountShipping = () => {
    return storeOrders.reduce((total, storeOrder) => {
      return total + storeOrder.discount_amount_shipping;
    }, 0);
  };

  const calculateGrandItemsTotal = () => {
    return storeOrders.reduce((total, storeOrder) => {
      return total + storeOrder.items_total_after_discount;
    }, 0);
  };

  const calculateGrandShippingFee = () => {
    return storeOrders.reduce((total, storeOrder) => {
      return total + storeOrder.shipping_fee_after_discount;
    }, 0);
  };

  const calculateFinalTotalBeforePlatformVoucher = () => {
    return calculateGrandItemsTotal() + calculateGrandShippingFee();
  }

  const calculateFinalTotalAfterPlatformVoucher = () => {
    return calculateFinalTotalBeforePlatformVoucher() - cartSummary.platform_discount_amount_items - cartSummary.platform_discount_amount_shipping;
  }

  const fetchAddresses = async () => {
    try {
      const response = await shipmentApi.get(`/shipments/addresses?user_id=${user.id}`);
      if (response.data.code === 0) {
        const addresses = response.data.data;
        setAddresses(addresses);
        const defaultAddress = addresses.find(address => address.is_default);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress.id);
        }
        return addresses; // Return the addresses for chaining
      }
    } catch (error) {
      toast({
        variant: 'error',
        description: error.response.data.message || error.message,
      });
    }
    return []; // Return empty array if there's an error
  }

  const fetchPaymentMethods = () => {
    paymentApi.get(`/payments/methods`)
      .then((response) => {
        if (response.data.code === 0) {
          setPaymentMethods(response.data.data);
          setSelectedPayment(response.data.data[0].id);
        }
      })
      .catch((error) => {
        toast({
          variant: 'error',
          description: error.response.data.message || error.message,
        });
      });
  }

  const fetchStoreOrders = async (currentAddresses: AddressType[]) => {
    try {
      const response = await customerApi.get(`/carts/checkout?user_id=${user.id}`)
      if (response.data.code === 0) {
        const storeOrders = response.data.data;
  
        // Sử dụng currentAddresses thay vì addresses từ state
        storeOrders.forEach((storeOrder) => {
          storeOrder.original_shipping_fee = randomShippingFee(currentAddresses, storeOrder);
          storeOrder.shipping_fee_after_discount = storeOrder.original_shipping_fee;
          storeOrder.final_total = storeOrder.items_total_after_discount + storeOrder.shipping_fee_after_discount;
        });
  
        setStoreOrders(storeOrders);
        return storeOrders;
      }
    }
    catch (error) {
      toast({
        variant: 'error',
        description: error.response.data.message || error.message,
      });
    }
    return [];
  }

  const fetchVouchers = (storeOrders: StoreOrder[]) => {
    console.log('fetchVouchers với các ID nhà bán: ', storeOrders.map(storeOrder => storeOrder.seller_id));
  }

  useEffect(() => {
    const initializeCheckout = async () => {
      const fetchedAddresses = await fetchAddresses();
      const fetchedStoreOrders = await fetchStoreOrders(fetchedAddresses);
      fetchVouchers(fetchedStoreOrders);
    };

    initializeCheckout();
    fetchPaymentMethods();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => { }} />

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
                <Button onClick={() => {
                  navigate('/profile', { state: { tab: 'addresses' } });
                }} variant="outline" size="sm">
                  Thay đổi
                </Button>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                  {addresses.length > 0 ? addresses.map((address) => (
                    <div key={address.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                      <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{address.address_name}</span>
                          {address.is_default && (
                            <Badge className='bg-primary-600 text-white'>Mặc định</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-1">{address.address_detail}, {address.ward_name}, {address.district_name}, {address.province_name}</p>
                        <p className="text-gray-600 text-sm mb-1">Tên người nhận: {address.full_name}</p>
                        <p className="text-gray-600 text-sm">SĐT: {address.phone}</p>
                      </Label>
                    </div>
                  )) : (
                    <div className="flex items-center justify-center h-24">
                      <p className="text-gray-600 text-sm">Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ mới</p>
                    </div>
                  )}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Products by Store */}
            {storeOrders.map((storeOrder) => (
              <Card key={storeOrder.seller_id}>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <div className="w-6 h-6 bg-medical-green rounded mr-2"></div>
                    {storeOrder.seller_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {storeOrder.products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-4 py-3 border-b last:border-b-0">
                      <img
                        src={product.product_url_image}
                        alt={product.product_name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{product.product_name}</h3>
                        <p className="text-sm text-gray-600">Số lượng: {product.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-medical-blue">
                          {formatPrice(Number(product.price) * product.quantity)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatPrice(Number(product.price))}/sản phẩm
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Phí vận chuyển gốc */}
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Truck className="w-4 h-4 mr-2 text-medical-orange" />
                        <div>
                          <span className="text-sm font-medium">Phí vận chuyển gốc</span>
                          <div className="flex items-center text-xs text-gray-600 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            Nhận hàng vào 3-5 ngày
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-medical-blue">{formatPrice(storeOrder.shipping_fee_after_discount)}</span>
                    </div>
                  </div>

                  {/* Store order voucher */}
                  <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 mr-2 text-medical-blue" />
                        <span className="text-sm font-medium">Voucher đơn hàng</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Chọn voucher
                      </Button>
                    </div>

                    {/* tiền giảm được từ voucher đơn hàng */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tiền giảm được</span>
                      <span className="text-sm font-medium text-medical-green"> - {formatPrice(storeOrder.discount_amount_items)}</span>
                    </div>
                  </div>

                  {/* Store freeship voucher */}
                  <div className="bg-green-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Truck className="w-4 h-4 mr-2 text-medical-green" />
                        <span className="text-sm font-medium">Voucher vận chuyển</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Chọn voucher
                      </Button>
                    </div>

                    {/* tiền giảm được từ voucher vận chuyển */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tiền giảm được</span>
                      <span className="text-sm font-medium text-medical-green">- {formatPrice(storeOrder.discount_amount_shipping)}</span>
                    </div>
                  </div>

                  {/* Store total */}
                  <div className="flex justify-between items-center pt-3 font-medium">
                    <span>Tổng tiền ({storeOrder.seller_name}):</span>
                    <span className="text-medical-red">
                      {formatPrice(storeOrder.final_total)}
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
                          <p className="font-medium">{method.method_name}</p>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
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
                    <span>{formatPrice(calculateGrandItemsTotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Phí vận chuyển:</span>
                    <span>{formatPrice(calculateGrandShippingFee())}</span>
                  </div>
                </div>

                {/* Platform voucher */}
                <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-medical-blue" />
                      <span className="text-sm font-medium">Voucher đơn hàng của sàn</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Chọn
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tiền giảm được</span>
                    <span className="text-sm font-medium text-medical-green">- {formatPrice(cartSummary.platform_discount_amount_items)}</span>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Truck className="w-4 h-4 mr-2 text-medical-green" />
                      <span className="text-sm font-medium">Voucher vận chuyển của sàn</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Chọn
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tiền giảm được</span>
                    <span className="text-sm font-medium text-medical-green">- {formatPrice(cartSummary.platform_discount_amount_shipping)}</span>
                  </div>
                </div>

                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Tổng thanh toán:</span>
                    <span className="font-bold text-lg text-medical-red">
                      {formatPrice(calculateFinalTotalAfterPlatformVoucher())}
                    </span>
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
