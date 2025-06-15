import React, { useEffect, useState } from 'react';
import { Gift, Clock, Tag, Truck, Store, Calendar, Copy, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import discountApi from '@/services/api-discount-service';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// mock vouchers data
// const mockAvailableVouchers : Voucher[] = [
//   {
//     id: '16',
//     code: '2WQqxuub8D',
//     description: 'Giảm tối đa 10K cho đơn từ 20K',
//     type: 'freeship',
//     discount_unit: 'percent',
//     discount_value: 15,
//     min_order_value: 25000,
//     max_discount_value: 10000,
//     end_date: '2025-07-28T23:59:59.000Z',
//     issuer_type: 'platform',
//     issuer_id: null,
//     issuer_name: null
//   }
// ];

// const mockUsageVouchers : Voucher[] = [
//   {
//     id: '1',
//     description: 'Giảm tối đa 10K cho đơn từ 20K',
//     code: '2WQqxuub8D',
//     type: 'order',
//     discount_unit: 'amount',
//     discount_value: 5000,
//     min_order_value: 25000,
//     max_discount_value: 5000,
//     issuer_type: 'shop',
//     issuer_id: '1',
//     issuer_name: 'ABC Store',
//     discount_amount: 5000,
//     usedAt: '2025-06-06T14:33:04.328Z',
//   }
// ]

interface Voucher {
  id: string;
  description: string;
  code: string;
  type: 'order' | 'freeship';
  discount_unit: 'amount' | 'percent';
  discount_value: number;
  min_order_value?: number;
  max_discount_value?: number;
  end_date?: string | null;
  issuer_type: 'platform' | 'shop';
  issuer_id: string;
  issuer_name?: string;
  //
  order_id?: string | null;
  discount_amount?: number | null;
  usedAt?: string | null; // ngày áp dụng
}

const Voucher = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'available' | 'used'>('available');
  const [filterType, setFilterType] = useState<'all' | 'platform' | 'shop'>('all');

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!isLoggedIn) {
    return <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center mt-20 h-screen">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Vui lòng đăng nhập để xem voucher</h1>
          <Button onClick={() => {
            navigate('/login');
          }}>Đăng nhập</Button>
        </div>
      </div>
    </div>;
  }

  const [isAvailableVouchersLoading, setIsAvailableVouchersLoading] = useState(false);
  const [isUsedVouchersLoading, setIsUsedVouchersLoading] = useState(false);

  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [usedVouchers, setUsedVouchers] = useState<Voucher[]>([]);

  const [rawFilteredVouchers, setRawFilteredVouchers] = useState<Voucher[]>([]);
  const [filteredVouchers, setFilteredVouchers] = useState<Voucher[]>([]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // useEffect(() => {
  // setFilteredVouchers([]);
  // const timeout = setTimeout(() => {
  //   if (activeTab === 'available') {
  //     setFilteredVouchers(availableVouchers.filter(voucher => {
  //       if (filterType !== 'all' && voucher.issuer_type !== filterType) return false;
  //       return true;
  //     }));
  //   } else {
  //     setFilteredVouchers(usedVouchers.filter(voucher => {
  //       if (filterType !== 'all' && voucher.issuer_type !== filterType) return false;
  //       return true;
  //     }));
  //   }
  // }, 0);

  // return () => clearTimeout(timeout);
  // }, [activeTab, filterType]);

  // Bước 1: lọc dữ liệu khi activeTab hoặc filterType thay đổi
  useEffect(() => {
    if (activeTab === 'available') {
      setRawFilteredVouchers(
        availableVouchers.filter(voucher =>
          filterType === 'all' || voucher.issuer_type === filterType
        )
      );
    } else {
      setRawFilteredVouchers(
        usedVouchers.filter(voucher =>
          filterType === 'all' || voucher.issuer_type === filterType
        )
      );
    }
  }, [activeTab, filterType]);

  // Bước 2: clear UI trước rồi mới hiển thị data (trigger re-render)
  useEffect(() => {
    setFilteredVouchers([]); // clear trước
    const frame = requestAnimationFrame(() => {
      setFilteredVouchers(rawFilteredVouchers); // sau 1 frame, set lại
    });
    return () => cancelAnimationFrame(frame); // cleanup nếu effect chạy lại
  }, [rawFilteredVouchers]);

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      variant: 'success',
      description: 'Đã sao chép mã voucher',
    });
  };

  const getVoucherIcon = (type: string) => {
    switch (type) {
      case 'platform': return <Gift className="w-5 h-5 text-medical-blue" />;
      case 'shop': return <Store className="w-5 h-5 text-medical-green" />;
      default: return <Tag className="w-5 h-5" />;
    }
  };

  const getVoucherTypeLabel = (type: string) => {
    switch (type) {
      case 'platform': return 'Sàn';
      case 'shop': return 'Cửa hàng';
      default: return '';
    }
  };

  const getVoucherTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'platform': return 'bg-blue-100 text-blue-800';
      case 'shop': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchAvailableVouchers = () => {
    if (!isLoggedIn) return;

    const params = {
      user_id: user.id,
    }

    setIsAvailableVouchersLoading(true);

    discountApi.get('voucher-usages/all-avaiable-vouchers', { params })
      .then((response) => {
        if (response.data.code === 0) {
          const availableVouchers = response.data.data;
          setAvailableVouchers(availableVouchers);
          setFilteredVouchers(availableVouchers);

          console.log(response.data.message);
        }
      })
      .catch((error) => {
        toast({
          variant: 'error',
          description: error.response.data.message || error.message,
        });
      })
      .finally(() => {
        setIsAvailableVouchersLoading(false);
      });
  }

  const fetchUsageVouchers = () => {
    if (!isLoggedIn) return;
    const params = {
      user_id: user.id,
    }

    setIsUsedVouchersLoading(true);

    discountApi.get('voucher-usages/get-by-user', { params })
      .then((response) => {
        if (response.data.code === 0) {
          const usedVouchers = response.data.data;

          // format lại định dạng voucher để lưu vào setUsedVouchers

          const formattedUsedVouchers = usedVouchers.map((usageVoucher) => {
            return {
              id: usageVoucher.voucher.id,
              description: usageVoucher.voucher.description,
              code: usageVoucher.voucher.code,
              type: usageVoucher.voucher.type,
              discount_unit: usageVoucher.voucher.discount_unit,
              discount_value: usageVoucher.voucher.discount_value,
              min_order_value: usageVoucher.voucher.min_order_value,
              max_discount_value: usageVoucher.voucher.max_discount_value,
              issuer_type: usageVoucher.voucher.issuer_type,
              issuer_id: usageVoucher.voucher.issuer_id,
              issuer_name: usageVoucher.voucher.issuer_name,
              order_id: usageVoucher.order_id,
              discount_amount: usageVoucher.discount_amount,
              usedAt: usageVoucher.createdAt,
            }
          });

          setUsedVouchers(formattedUsedVouchers);

          console.log(response.data.message);
        }
      })
      .catch((error) => {
        toast({
          variant: 'error',
          description: error.response.data.message || error.message,
        });
      })
      .finally(() => {
        setIsUsedVouchersLoading(false);
      });
  }

  useEffect(() => {
    fetchAvailableVouchers();
    fetchUsageVouchers();
  }, []);

  if (isAvailableVouchersLoading || isUsedVouchersLoading) {
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

      {/* Breadcrumb */}
      <div className="bg-white border-b px-4 py-3">
        <div className="container mx-auto">
          <nav className="text-sm text-gray-500">
            <span onClick={() => navigate('/')} className="cursor-pointer hover:text-gray-900">Trang chủ</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Kho voucher</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kho Voucher</h1>
          <p className="text-gray-600">Tận dụng các ưu đãi tuyệt vời để tiết kiệm chi phí mua sắm</p>
        </div>

        {/* Voucher Input */}
        {/* <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex space-x-2">
              <Input 
                placeholder="Nhập mã voucher để sưu tập" 
                className="flex-1"
              />
              <Button className="bg-primary-600 hover:bg-primary-700">
                Lưu mã
              </Button>
            </div>
          </CardContent>
        </Card> */}

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1">
          {[
            { key: 'available', label: 'Có thể sử dụng', count: availableVouchers.length },
            { key: 'used', label: 'Đã sử dụng', count: usedVouchers.length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Filter by type */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            Tất cả
          </Button>
          <Button
            variant={filterType === 'platform' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('platform')}
          >
            <Gift className="w-4 h-4 mr-1" />
            Voucher sàn
          </Button>
          <Button
            variant={filterType === 'shop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('shop')}
          >
            <Store className="w-4 h-4 mr-1" />
            Voucher cửa hàng
          </Button>
        </div>

        {/* Voucher List */}
        <div className="space-y-4">
          {filteredVouchers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Không có voucher nào phù hợp</p>
              </CardContent>
            </Card>
          ) : (
            filteredVouchers.map((voucher) => (
              <Card key={voucher.id} className={`${voucher.usedAt ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* Voucher Icon */}
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center">
                      {getVoucherIcon(voucher.issuer_type)}
                    </div>

                    {/* Voucher Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{voucher.description}</h3>
                          {voucher.issuer_name && (
                            <p className="text-sm text-primary-600 mb-2">{voucher.issuer_name}</p>
                          )}
                        </div>
                        <Badge className={getVoucherTypeBadgeColor(voucher.issuer_type)}>
                          {getVoucherTypeLabel(voucher.issuer_type)}
                        </Badge>
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
                          {voucher.usedAt && (
                            <span> • Ngày sử dụng: {new Date(voucher.usedAt).toLocaleDateString('vi-VN')}</span>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        Đơn tối thiểu: {formatPrice(voucher.min_order_value)}
                        {voucher.max_discount_value && (
                          <span> • Giảm tối đa: {formatPrice(voucher.max_discount_value)}</span>
                        )}

                      </div>

                      {(voucher.discount_amount && voucher.order_id) && (
                        <div className="text-sm text-gray-600 mb-3">
                          Đã giảm thành công {formatPrice(voucher.discount_amount)} trong đơn hàng có ID: {voucher.order_id}
                        </div>
                      )}

                      {/* Voucher Code */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded border-2 border-dashed border-gray-300">
                            {voucher.code}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyVoucherCode(voucher.code)}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Sao chép
                          </Button>
                        </div>

                        {voucher.usedAt && (
                          <Badge variant="secondary">Đã sử dụng</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Voucher;
