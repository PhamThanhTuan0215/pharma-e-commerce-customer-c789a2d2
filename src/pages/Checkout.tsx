import React, { useEffect, useState } from 'react';
import { MapPin, CreditCard, Tag, Truck, ChevronRight, Clock, Package, Loader2 } from 'lucide-react';
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
import discountApi from '@/services/api-discount-service';
import orderApi from '@/services/api-order-service';
import apiGHN from '@/services/api-GHN';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from 'lucide-react';

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

interface SumaryVoucherUsage {
  is_applied: boolean;
  code: string | null;
  voucher_id: string | null;
  discount_amount: number;
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
  order_voucher: SumaryVoucherUsage,
  freeship_voucher: SumaryVoucherUsage,
  platform_order_voucher: SumaryVoucherUsage,
  platform_freeship_voucher: SumaryVoucherUsage,
  products: ProductInCart[];
  order_id?: string; // chỉ có khi đã đặt hàng
}

interface PaymentMethodType {
  id: string;
  method_name: string;
  description: string;
}

interface Order {
  id: string;
  user_id: string;
  seller_id: string;
  seller_name: string;
  total_quantity: number;
  original_items_total: number;
  original_shipping_fee: number;
  discount_amount_items: number;
  discount_amount_shipping: number;
  discount_amount_items_platform_allocated: number;
  discount_amount_shipping_platform_allocated: number;
  final_total: number;
  payment_method: string;
  order_status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  is_completed: boolean;
  createdAt: string;
}

interface ApplyVoucheStorerResponse {
  voucher: Voucher;
  original_items_total: number;
  original_shipping_fee: number;
  discount_amount_items: number;
  discount_amount_shipping: number;
  items_total_after_discount: number;
  shipping_fee_after_discount: number;
}

interface ApplyVouchePlatformResponse {
  voucher: Voucher;
  items_total_before_platform_discount: number;
  shipping_fee_before_platform_discount: number;
  discount_amount_items_platform: number;
  discount_amount_shipping_platform: number;
  items_total_after_platform_discount: number;
  shipping_fee_after_platform_discount: number;
  platform_voucher_allocates_to_stores: [
    {
      store_id: string;
      voucher_id: string;
      type: 'order' | 'freeship';
      allocated_discount_amount: number
    }
  ]
}

interface PlaceOrderBody {
  user_id: string;
  payment_method: string;
  payment_status: string;
  stores: StoreOrder[];
}

interface SaveVouchersUsageBody {
  user_id: string;
  stores: {
    seller_id: string;
    order_id: string;
    order_voucher: SumaryVoucherUsage;
    freeship_voucher: SumaryVoucherUsage;
    platform_order_voucher: SumaryVoucherUsage;
    platform_freeship_voucher: SumaryVoucherUsage;
  }[]
}

// hàm lấy phí ship tạm thời thay thế cho api
const randomShippingFee = (addresses: AddressType[], storeOrder: StoreOrder) => {

  if (addresses.length === 0) {
    return 0;
  }

  // trả về ngãu nhiên 10K, 15K, 20K, 25K, 30K
  const randomShippingFee = Math.floor(Math.random() * 4) * 5000 + 10000;
  return randomShippingFee;
}

const Checkout = () => {

  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!isLoggedIn) {
    return <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center mt-20 h-screen">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Vui lòng đăng nhập để mua hàng</h1>
          <Button onClick={() => {
            navigate('/login');
          }}>Đăng nhập</Button>
        </div>
      </div>
    </div>;
  }

  const [isLoading, setIsLoading] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [isPaymentMethodLoading, setIsPaymentMethodLoading] = useState(false);
  const [isStoreOrdersLoading, setIsStoreOrdersLoading] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodType[]>([]);
  const [storeOrders, setStoreOrders] = useState<StoreOrder[]>([]);

  const [showPlaceOrderDialog, setShowPlaceOrderDialog] = useState(false);

  const [cartSummary, setCartSummary] = useState<any>({
    platform_discount_amount_items: 0,
    platform_discount_amount_shipping: 0,
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

  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);

  const [showVoucherDialog, setShowVoucherDialog] = useState(false);

  const [voucherCode, setVoucherCode] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // const calculateStoresOriginalItemsTotal = () => {
  //   return storeOrders.reduce((total, storeOrder) => {
  //     return total + storeOrder.original_items_total;
  //   }, 0);
  // };

  // const calculateStoresOriginalShippingFee = () => {
  //   return storeOrders.reduce((total, storeOrder) => {
  //     return total + storeOrder.original_shipping_fee;
  //   }, 0);
  // };

  // const calculateStoresDiscountAmountItems = () => {
  //   return storeOrders.reduce((total, storeOrder) => {
  //     return total + storeOrder.discount_amount_items;
  //   }, 0);
  // };

  // const calculateStoresDiscountAmountShipping = () => {
  //   return storeOrders.reduce((total, storeOrder) => {
  //     return total + storeOrder.discount_amount_shipping;
  //   }, 0);
  // };

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
    setIsAddressLoading(true);
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
    } finally {
      setIsAddressLoading(false);
    }
    return []; // Return empty array if there's an error
  }

  const fetchPaymentMethods = () => {
    setIsPaymentMethodLoading(true);
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
      })
      .finally(() => {
        setIsPaymentMethodLoading(false);
      });
  }

  const fetchStoreOrders = async (currentAddresses: AddressType[]) => {
    setIsStoreOrdersLoading(true);
    try {
      const response = await customerApi.get(`/carts/checkout?user_id=${user.id}`)
      if (response.data.code === 0) {
        const storeOrders = response.data.data;

        // gọi api để tính phí vận chuyển cho nhiều cửa hàng cùng lúc
        const address = currentAddresses.find(address => address.is_default);

        const store_ids = [];
        storeOrders.forEach(storeOrder => {
          store_ids.push(storeOrder.seller_id);
        });

        const user_address = {
          district_id: address.district_id,
          ward_code: address.ward_code,
        }

        const body = {
          user_address,
          store_ids
        }

        try {
          const shippingFeeResponse = await shipmentApi.post('/shipments/shipping-fee', body);
          if (shippingFeeResponse.data.code === 0) {
            const shippingFeesInfo = shippingFeeResponse.data.data;

            storeOrders.forEach(storeOrder => {
              storeOrder.original_shipping_fee = shippingFeesInfo[storeOrder.seller_id].original_shipping_fee || 0;
              storeOrder.shipping_fee_after_discount = storeOrder.original_shipping_fee;
              storeOrder.final_total = storeOrder.items_total_after_discount + storeOrder.shipping_fee_after_discount;
            });
          }
        }
        catch (error) {
          toast({
            variant: 'error',
            description: error.response.data.message || error.message,
          });
        }

        setStoreOrders(storeOrders);
        return storeOrders;
      }
    }
    catch (error) {
      toast({
        variant: 'error',
        description: error.response.data.message || error.message,
      });
    } finally {
      setIsStoreOrdersLoading(false);
    }
    return [];
  }

  const fetchShippingFee = async (address: AddressType) => {
    const store_ids = [];
    storeOrders.forEach(storeOrder => {
      store_ids.push(storeOrder.seller_id);
    });

    const body = {
      user_address: {
        district_id: address.district_id,
        ward_code: address.ward_code,
      },
      store_ids
    }

    handleRemoveAllVouchers();

    try {
      const shippingFeeResponse = await shipmentApi.post('/shipments/shipping-fee', body);
      if (shippingFeeResponse.data.code === 0) {
        const shippingFeesInfo = shippingFeeResponse.data.data;

        setStoreOrders(prevStoreOrders => {
          return prevStoreOrders.map(storeOrder => {
            const shippingFee = shippingFeesInfo[storeOrder.seller_id];
            return {
              ...storeOrder,
              original_shipping_fee: shippingFee.original_shipping_fee || 0,
              shipping_fee_after_discount: shippingFee.original_shipping_fee || 0,
              final_total: storeOrder.items_total_after_discount + shippingFee.original_shipping_fee || 0,
            };
          });
        });
      }
    }
    catch (error) {
      toast({
        variant: 'error',
        description: error.response.data.message || error.message,
      });
    }
  }

  const fetchPlatformVouchers = async (type: 'order' | 'freeship') => {
    setIsLoading(true);
    try {
      const params = {
        type: type,
        user_id: user.id
      }

      const response = await discountApi.get(`/voucher-usages/platform`, { params });
      if (response.data.code === 0) {
        const platformVouchers = response.data.data;
        if (type === 'order') {
          setAvailableVouchers(platformVouchers.order);
        } else if (type === 'freeship') {
          setAvailableVouchers(platformVouchers.freeship);
        }
      }
    }
    catch (error) {
      toast({
        variant: 'error',
        description: error.response.data.message || error.message,
      });
    }
    finally {
      setIsLoading(false);
    }
  }

  const fetchStoreVouchers = async (sellerId: string, type: 'order' | 'freeship') => {
    setIsLoading(true);

    try {
      const params = {
        type: type,
        user_id: user.id
      }

      const response = await discountApi.get(`/voucher-usages/shop/${sellerId}`, { params });
      if (response.data.code === 0) {
        const storeVouchers = response.data.data;
        if (type === 'order') {
          setAvailableVouchers(storeVouchers.order);
        } else if (type === 'freeship') {
          setAvailableVouchers(storeVouchers.freeship);
        }
      }
    }
    catch (error) {
      toast({
        variant: 'error',
        description: error.response.data.message || error.message,
      });
    }
    finally {
      setIsLoading(false);
    }
  }

  const handleSelectVoucher = async (voucher: Voucher) => {

    if (voucher.issuer_type === 'platform') {
      if (voucher.type === 'freeship') {
        // kiểm tra xem có shop nào đã áp dụng voucher loại freeship, nếu có rồi thì không cho áp dụng bời vì không thể cùng lúc dùng freeship của shop và sàn
        const hasShopAppliedFreeshipVoucher = storeOrders.some(storeOrder => storeOrder.freeship_voucher.is_applied);
        if (hasShopAppliedFreeshipVoucher) {
          toast({
            variant: 'error',
            description: 'Không thể áp dụng voucher freeship của sàn vì đã có shop áp dụng voucher freeship',
          });
          return;
        }
      }

      const params = {
        apply_type: voucher.type,
      }

      const body = {
        user_id: user.id,
        voucher_code: voucher.code,
        stores: storeOrders.map(storeOrder => {
          return {
            seller_id: storeOrder.seller_id,
            items_total_after_discount: storeOrder.items_total_after_discount,
            shipping_fee_after_discount: storeOrder.shipping_fee_after_discount,
          }
        })
      }

      discountApi.post(`/voucher-usages/apply`, body, { params })
        .then((response) => {
          if (response.data.code === 0) {

            const applyData: ApplyVouchePlatformResponse = response.data.data;

            // cập nhật lại cartSummary
            setCartSummary(prevCartSummary => {
              if (applyData.voucher.type === 'order') {
                return {
                  ...prevCartSummary,
                  platform_discount_amount_items: applyData.discount_amount_items_platform,
                  platform_order_voucher: {
                    is_applied: true,
                    code: voucher.code,
                    voucher_id: voucher.id,
                    discount_amount: applyData.discount_amount_items_platform,
                  },
                };
              } else if (applyData.voucher.type === 'freeship') {
                return {
                  ...prevCartSummary,
                  platform_discount_amount_shipping: applyData.discount_amount_shipping_platform,
                  platform_freeship_voucher: {
                    is_applied: true,
                    code: voucher.code,
                    voucher_id: voucher.id,
                    discount_amount: applyData.discount_amount_shipping_platform,
                  },
                };
              }
            });

            // cập nhật lại phân bổ giá trị giảm giá của voucher vào các storeOrder
            setStoreOrders(prevStoreOrders => {
              return prevStoreOrders.map(storeOrder => {
                const allocatedVoucher = applyData.platform_voucher_allocates_to_stores.find(voucher => voucher.store_id === storeOrder.seller_id);
                if (allocatedVoucher.type === 'order') {
                  return {
                    ...storeOrder,
                    discount_amount_items_platform_allocated: allocatedVoucher.allocated_discount_amount,
                    platform_order_voucher: {
                      is_applied: true,
                      code: voucher.code,
                      voucher_id: voucher.id,
                      discount_amount: allocatedVoucher.allocated_discount_amount,
                    },
                  };
                } else if (allocatedVoucher.type === 'freeship') {
                  return {
                    ...storeOrder,
                    discount_amount_shipping_platform_allocated: allocatedVoucher.allocated_discount_amount,
                    platform_freeship_voucher: {
                      is_applied: true,
                      code: voucher.code,
                      voucher_id: voucher.id,
                      discount_amount: allocatedVoucher.allocated_discount_amount,
                    },
                  };
                }
              });
            });

            setShowVoucherDialog(false);
          }
        })
        .catch((error) => {
          toast({
            variant: 'error',
            description: `${error.response.data.message} ${error.response.data.note && `(${error.response.data.note})`}` || error.message,
          });
        });

    }
    else if (voucher.issuer_type === 'shop') {

      const storeOrder = storeOrders.find(storeOrder => storeOrder.seller_id === voucher.issuer_id);

      const params = {
        apply_type: voucher.type,
      }

      const body = {
        user_id: user.id,
        seller_id: voucher.issuer_id,
        voucher_code: voucher.code,
        original_items_total: storeOrder.original_items_total,
        original_shipping_fee: storeOrder.original_shipping_fee,
      }

      discountApi.post(`/voucher-usages/apply/${voucher.issuer_id}`, body, { params })
        .then((response) => {
          if (response.data.code === 0) {

            // xóa tất cả voucher hiện tại của sàn
            setStoreOrders(prevStoreOrders => {
              return prevStoreOrders.map(storeOrder => {
                return {
                  ...storeOrder,
                  discount_amount_items_platform_allocated: 0,
                  discount_amount_shipping_platform_allocated: 0,
                  platform_order_voucher: {
                    is_applied: false,
                    code: null,
                    voucher_id: null,
                    discount_amount: 0,
                  },
                  platform_freeship_voucher: {
                    is_applied: false,
                    code: null,
                    voucher_id: null,
                    discount_amount: 0,
                  },
                };
              });
            });

            setCartSummary(prevCartSummary => {
              return {
                ...prevCartSummary,
                platform_discount_amount_items: 0,
                platform_discount_amount_shipping: 0,
                platform_order_voucher: {
                  is_applied: false,
                  code: null,
                  voucher_id: null,
                  discount_amount: 0,
                },
                platform_freeship_voucher: {
                  is_applied: false,
                  code: null,
                  voucher_id: null,
                  discount_amount: 0,
                },
              };
            });

            const applyData: ApplyVoucheStorerResponse = response.data.data;

            // câp nhật lại storeOrder đã áp dụng voucher này, còn các nhà bán khác giữ nguyên
            setStoreOrders(prevStoreOrders => {
              return prevStoreOrders.map(storeOrder => {
                if (storeOrder.seller_id === voucher.issuer_id) {
                  return {
                    ...storeOrder,
                    discount_amount_items: applyData.discount_amount_items,
                    discount_amount_shipping: applyData.discount_amount_shipping,
                    items_total_after_discount: applyData.items_total_after_discount,
                    shipping_fee_after_discount: applyData.shipping_fee_after_discount,
                    final_total: applyData.items_total_after_discount + applyData.shipping_fee_after_discount,
                    // tùy thuộc voucher loại gì thì cập nhật voucher đó
                    order_voucher: {
                      is_applied: voucher.type === 'order' ? true : storeOrder.order_voucher.is_applied,
                      code: voucher.type === 'order' ? voucher.code : storeOrder.order_voucher.code,
                      voucher_id: voucher.type === 'order' ? voucher.id : storeOrder.order_voucher.voucher_id,
                      discount_amount: voucher.type === 'order' ? applyData.discount_amount_items : storeOrder.order_voucher.discount_amount,
                    },
                    freeship_voucher: {
                      is_applied: voucher.type === 'freeship' ? true : storeOrder.freeship_voucher.is_applied,
                      code: voucher.type === 'freeship' ? voucher.code : storeOrder.freeship_voucher.code,
                      voucher_id: voucher.type === 'freeship' ? voucher.id : storeOrder.freeship_voucher.voucher_id,
                      discount_amount: voucher.type === 'freeship' ? applyData.discount_amount_shipping : storeOrder.freeship_voucher.discount_amount,
                    },
                  };
                }
                return storeOrder;
              });
            });

            setShowVoucherDialog(false);
          }
        })
        .catch((error) => {
          toast({
            variant: 'error',
            description: error.response.data.message || error.message,
          });
        });
    }
  }

  const handleEnterVoucherCode = async (voucherCode: string) => {

    //tìm ra voucher có code trùng với voucherCode
    const voucher = availableVouchers.find(voucher => voucher.code === voucherCode);
    if (voucher) {
      handleSelectVoucher(voucher);
    }
    else {
      toast({
        variant: 'error',
        description: 'Mã voucher không hợp lệ',
      });
    }
  }

  const handleCloseVoucherDialog = () => {
    setShowVoucherDialog(false);
  }

  const handleRemoveAllVouchers = () => {
    setStoreOrders(prevStoreOrders => {
      return prevStoreOrders.map(storeOrder => {
        return {
          ...storeOrder,
          discount_amount_items: 0,
          discount_amount_shipping: 0,
          discount_amount_items_platform_allocated: 0,
          discount_amount_shipping_platform_allocated: 0,
          items_total_after_discount: storeOrder.original_items_total,
          shipping_fee_after_discount: storeOrder.original_shipping_fee,
          final_total: storeOrder.original_items_total + storeOrder.original_shipping_fee,
          order_voucher: {
            is_applied: false,
            code: null,
            voucher_id: null,
            discount_amount: 0,
          },
          freeship_voucher: {
            is_applied: false,
            code: null,
            voucher_id: null,
            discount_amount: 0,
          },
          platform_order_voucher: {
            is_applied: false,
            code: null,
            voucher_id: null,
            discount_amount: 0,
          },
          platform_freeship_voucher: {
            is_applied: false,
            code: null,
            voucher_id: null,
            discount_amount: 0,
          },
        };
      });
    });

    setCartSummary(prevCartSummary => {
      return {
        ...prevCartSummary,
        platform_discount_amount_items: 0,
        platform_discount_amount_shipping: 0,
        platform_order_voucher: {
          is_applied: false,
          code: null,
          voucher_id: null,
          discount_amount: 0,
        },
        platform_freeship_voucher: {
          is_applied: false,
          code: null,
          voucher_id: null,
          discount_amount: 0,
        },
      };
    });
  }

  const confirmPlaceOrder = () => {
    setShowPlaceOrderDialog(true);
  }

  const placeOrder = async () => {
    // yêu cầu đã chọn địa chỉ giao hàng
    if (!selectedAddress) {
      toast({
        variant: 'error',
        description: 'Vui lòng chọn địa chỉ giao hàng',
      });
      return;
    }

    // yêu cầu đã chọn phương thức thanh toán
    if (!selectedPayment) {
      toast({
        variant: 'error',
        description: 'Vui lòng chọn phương thức thanh toán',
      });
      return;
    }

    if (storeOrders.length === 0) {
      toast({
        variant: 'error',
        description: 'Không có sản phẩm nào để đặt hàng',
      });
      return;
    }

    // lưu lại đơn hàng
    const bodyPlaceOrder: PlaceOrderBody = {
      user_id: user.id,
      payment_method: paymentMethods.find(payment => payment.id === selectedPayment)?.method_name || 'COD',
      payment_status: 'pending',
      stores: storeOrders,
    }

    setIsLoading(true);

    try {
      const placeOrderResponse = await orderApi.post('/orders', bodyPlaceOrder);
      if (placeOrderResponse.data.code === 0) {

        const newOrders = placeOrderResponse.data.data;
        const newStoreOrders = storeOrders.map(storeOrder => {
          const newOrder = newOrders.find(order => order.seller_id === storeOrder.seller_id);
          return {
            ...storeOrder,
            order_id: newOrder.id,
          };
        });

        handleSaveVouchersUsage(newStoreOrders);

        if (bodyPlaceOrder.payment_method.toUpperCase() === 'COD') {
          // thực hiện gọi tạo thông tin thanh toán COD cho nhiều đơn hàng
          handleCODPayment(newOrders);
          navigate('/profile', { state: { tab: 'orders', isPlaceOrder: true } });
        }
        // so sánh payment_method với 'VNPAY' không phân biệt hoa thường
        else if (bodyPlaceOrder.payment_method.toUpperCase() === 'VNPAY') {
          // thực hiện gọi thanh toán VNPay chung cho tất cả các đơn hàng (vẫn tạo ra thông tin thanh toán cho từng đơn hàng)
          handleVNPayPayment(newOrders);
        }
      }
    }
    catch (error) {
      toast({
        variant: 'error',
        description: error.response.data.message || error.message,
      });
    }
    finally {
      setIsLoading(false);
    }
  }

  const handleCODPayment = (orders: Order[]) => {
    const body = {
      user_id: user.id,
      orders
    }

    paymentApi.post(`/payments/cod`, body)
      .then((response) => {
        if (response.data.code === 0) {
          const payment = response.data.data;
          console.log('Các giao dịch được tạo ra: ', payment);
        }
      })
      .catch((error) => {
        toast({
          variant: 'error',
          description: error.response.data.message || error.message,
        });
      });
  }

  const handleVNPayPayment = (orders: Order[]) => {
    const body = {
      user_id: user.id,
      orders,
      bankCode: 'VNBANK',
      language: 'vn',
    }

    paymentApi.post(`/payments/vnpay/create_payment_url/multiple`, body)
      .then((response) => {
        if (response.data.code === 0) {
          const data = response.data.data;
          const { url, payments } = data;
          console.log('Các giao dịch được tạo ra: ', payments);
          // chuyển hướng tới trang thanh toán
          window.location.href = url;
        }
      })
      .catch((error) => {
        toast({
          variant: 'error',
          description: error.response.data.message || error.message,
        });
      });
  }

  const handleSaveVouchersUsage = async (newStoreOrders: StoreOrder[]) => {
    const bodySaveVouchersUsage: SaveVouchersUsageBody = {
      user_id: user.id,
      stores: newStoreOrders.map(storeOrder => {
        return {
          seller_id: storeOrder.seller_id,
          order_id: storeOrder.order_id,
          order_voucher: storeOrder.order_voucher,
          freeship_voucher: storeOrder.freeship_voucher,
          platform_order_voucher: storeOrder.platform_order_voucher,
          platform_freeship_voucher: storeOrder.platform_freeship_voucher,
        }
      }),
    }

    try {
      const saveVouchersUsageResponse = await discountApi.post('/voucher-usages/save', bodySaveVouchersUsage);
      if (saveVouchersUsageResponse.data.code === 0) {
        console.log(saveVouchersUsageResponse.data.message);
      }
    }
    catch (error) {
      toast({
        variant: 'error',
        description: error.response.data.message || error.message,
      });
    }
  }

  const handleChangeAddress = (addressId: string) => {
    setSelectedAddress(addressId);
    const address = addresses.find(address => address.id === addressId);
    if (address) {
      fetchShippingFee(address);
    }
  }

  useEffect(() => {
    const initializeCheckout = async () => {
      const fetchedAddresses = await fetchAddresses();
      fetchStoreOrders(fetchedAddresses);
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
                <RadioGroup value={selectedAddress} onValueChange={handleChangeAddress}>
                  {isAddressLoading ? (
                    <div className="flex items-center justify-center h-24">
                      <Loader2 className="w-4 h-4 mr-2 text-medical-blue animate-spin" />
                      <span className="text-gray-600 text-sm">Đang tải địa chỉ...</span>
                    </div>
                  ) : addresses.length > 0 ? addresses.map((address) => (
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
            {isStoreOrdersLoading ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="w-4 h-4 mr-2 text-medical-blue animate-spin" />
                <span className="text-gray-600 text-sm">Đang tải đơn hàng...</span>
              </div>
            ) : storeOrders.map((storeOrder) => (
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
                      <span className="text-sm font-medium text-medical-blue">{formatPrice(storeOrder.original_shipping_fee)}</span>
                    </div>
                  </div>

                  {/* Store order voucher */}
                  <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 mr-2 text-medical-blue" />
                        <span className="text-sm font-medium">Voucher đơn hàng</span>
                      </div>
                      <Button onClick={() => {
                        setShowVoucherDialog(true);
                        fetchStoreVouchers(storeOrder.seller_id, 'order');
                      }} variant="outline" size="sm">
                        Chọn voucher
                      </Button>
                    </div>

                    {/* tiền giảm được từ voucher đơn hàng */}
                    {storeOrder.order_voucher.is_applied && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">Mã voucher: {storeOrder.order_voucher.code}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium">Tiền giảm được: &nbsp;</span>
                          <span className="text-sm font-medium text-medical-green"> - {formatPrice(storeOrder.discount_amount_items)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Store freeship voucher */}
                  <div className="bg-green-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Truck className="w-4 h-4 mr-2 text-medical-green" />
                        <span className="text-sm font-medium">Voucher vận chuyển</span>
                      </div>
                      <Button onClick={() => {
                        setShowVoucherDialog(true);
                        fetchStoreVouchers(storeOrder.seller_id, 'freeship');
                      }} variant="outline" size="sm">
                        Chọn voucher
                      </Button>
                    </div>

                    {/* tiền giảm được từ voucher vận chuyển */}
                    {storeOrder.freeship_voucher.is_applied && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">Mã voucher: {storeOrder.freeship_voucher.code}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium">Tiền giảm được: &nbsp;</span>
                          <span className="text-sm font-medium text-medical-green">- {formatPrice(storeOrder.discount_amount_shipping)}</span>
                        </div>
                      </div>
                    )}
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
                  {isPaymentMethodLoading ? (
                    <div className="flex items-center justify-center h-24">
                      <Loader2 className="w-4 h-4 mr-2 text-medical-blue animate-spin" />
                      <span className="text-gray-600 text-sm">Đang tải phương thức thanh toán...</span>
                    </div>
                  ) : paymentMethods.map((method) => (
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
                    <Button onClick={() => {
                      setShowVoucherDialog(true);
                      fetchPlatformVouchers('order');
                    }} variant="outline" size="sm">
                      Chọn
                    </Button>
                  </div>
                  {cartSummary.platform_order_voucher.is_applied && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tiền giảm được: &nbsp;</span>
                      <span className="text-sm font-medium text-medical-green">- {formatPrice(cartSummary.platform_discount_amount_items)}</span>
                    </div>
                  )}
                </div>

                <div className="bg-green-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Truck className="w-4 h-4 mr-2 text-medical-green" />
                      <span className="text-sm font-medium">Voucher vận chuyển của sàn</span>
                    </div>
                    <Button onClick={() => {
                      setShowVoucherDialog(true);
                      fetchPlatformVouchers('freeship');
                    }} variant="outline" size="sm">
                      Chọn
                    </Button>
                  </div>
                  {cartSummary.platform_freeship_voucher.is_applied && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tiền giảm được: &nbsp;</span>
                      <span className="text-sm font-medium text-medical-green">- {formatPrice(cartSummary.platform_discount_amount_shipping)}</span>
                    </div>
                  )}
                </div>

                {/* nút xóa toàn bộ voucher */}
                <Button onClick={handleRemoveAllVouchers} variant="outline" size="sm" className="w-full">
                  Gỡ bỏ toàn bộ voucher đang áp dụng
                </Button>

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
                  onClick={confirmPlaceOrder}
                  disabled={isLoading}
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

                <Dialog open={showPlaceOrderDialog} onOpenChange={setShowPlaceOrderDialog}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Đặt hàng</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                      Bạn có chắc chắn muốn đặt hàng không?
                    </DialogDescription>
                    <DialogFooter className="flex space-x-2 justify-end">
                      <Button variant="outline" onClick={() => setShowPlaceOrderDialog(false)}>
                        Đóng
                      </Button>
                      <Button variant="destructive" onClick={placeOrder}>
                        Xác nhận đặt hàng
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Voucher Dialog */}
      <Dialog open={showVoucherDialog} onOpenChange={handleCloseVoucherDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chọn voucher</DialogTitle>
          </DialogHeader>
          <DialogDescription className="space-y-2 max-h-[80vh] overflow-y-auto">
            {/* input chiều dài 2 phần, button 1 phần, có border */}
            <div className="p-4 flex items-center gap-2 border rounded-lg">
              <Input
                placeholder="Nhập mã voucher"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                className="w-2/3 border rounded-lg p-2"
              />
              <Button onClick={() => handleEnterVoucherCode(voucherCode)} className="w-1/3 border rounded-lg p-2">Áp dụng</Button>
            </div>
            {isLoading ? (
              <p>Đang tải voucher...</p>
            ) : availableVouchers.length > 0 ? (
              availableVouchers.map((voucher) => (
                <div key={voucher.id} className="flex items-center justify-between border-b last:border-b-0 py-4 border-gray-300 p-4">
                  <div className="p-4">
                    <div className="flex items-start space-x-4">

                      {/* Voucher Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{voucher.description}</h3>
                            {voucher.issuer_name && (
                              <p className="text-sm text-primary-600 mb-2">{voucher.issuer_name}</p>
                            )}
                          </div>
                        </div>

                        {/* Voucher type */}
                        {voucher.type === 'order' && (
                          <div className="text-sm text-orange-600 mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4 mr-1" />
                            Voucher đơn hàng
                          </div>
                        )}

                        {voucher.type === 'freeship' && (
                          <div className="text-sm text-green-600 mb-3 flex items-center gap-2">
                            <Truck className="w-4 h-4 mr-1" />
                            Free ship
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Tag className="w-4 h-4 mr-1" />
                            Giảm: {voucher.discount_unit === 'amount' ? formatPrice(voucher.discount_value) : Math.round(voucher.discount_value) + '%'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {voucher.end_date && (
                              <span>Hạn sử dụng: {new Date(voucher.end_date).toLocaleDateString('vi-VN')}</span>
                            )}
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-3">
                          Đơn tối thiểu: {formatPrice(voucher.min_order_value)}
                          {voucher.max_discount_value && (
                            <span> • Giảm tối đa: {formatPrice(voucher.max_discount_value)}</span>
                          )}

                        </div>

                        {/* Voucher Code */}
                        <p>Mã voucher: <span className="font-mono text-sm px-2 py-1 text-blue-600">{voucher.code}</span></p>

                      </div>
                    </div>
                  </div>
                  <Button onClick={() => {
                    handleSelectVoucher(voucher);
                  }} variant="outline" size="sm">
                    Chọn
                  </Button>
                </div>
              ))
            ) : (
              <p>Không có voucher nào</p>
            )}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checkout;
