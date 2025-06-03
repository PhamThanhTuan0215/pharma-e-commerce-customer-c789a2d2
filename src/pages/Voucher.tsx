
import React, { useState } from 'react';
import { Gift, Clock, Tag, Truck, Store, Calendar, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';

interface VoucherItem {
  id: string;
  title: string;
  description: string;
  code: string;
  discount: string;
  minOrder: number;
  maxDiscount?: number;
  expiryDate: string;
  type: 'platform' | 'store' | 'shipping';
  storeName?: string;
  used: boolean;
  available: number;
}

const Voucher = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'used' | 'expired'>('available');
  const [filterType, setFilterType] = useState<'all' | 'platform' | 'store' | 'shipping'>('all');

  const vouchers: VoucherItem[] = [
    {
      id: '1',
      title: 'Giảm 50K cho đơn từ 200K',
      description: 'Áp dụng cho tất cả sản phẩm trên sàn',
      code: 'PHARMA50K',
      discount: '50.000đ',
      minOrder: 200000,
      maxDiscount: 50000,
      expiryDate: '2024-12-31',
      type: 'platform',
      used: false,
      available: 1000
    },
    {
      id: '2',
      title: 'Miễn phí vận chuyển',
      description: 'Freeship toàn quốc cho đơn từ 99K',
      code: 'FREESHIP99',
      discount: 'Freeship',
      minOrder: 99000,
      expiryDate: '2024-11-30',
      type: 'shipping',
      used: false,
      available: 500
    },
    {
      id: '3',
      title: 'Giảm 20% tối đa 100K',
      description: 'Chỉ áp dụng cho nhà thuốc ABC',
      code: 'ABC20PERCENT',
      discount: '20%',
      minOrder: 150000,
      maxDiscount: 100000,
      expiryDate: '2024-12-15',
      type: 'store',
      storeName: 'Nhà thuốc ABC',
      used: false,
      available: 200
    },
    {
      id: '4',
      title: 'Giảm 30K cho lần đầu mua',
      description: 'Dành cho khách hàng mới',
      code: 'WELCOME30',
      discount: '30.000đ',
      minOrder: 100000,
      expiryDate: '2024-10-31',
      type: 'platform',
      used: true,
      available: 0
    }
  ];

  const filteredVouchers = vouchers.filter(voucher => {
    if (activeTab === 'used' && !voucher.used) return false;
    if (activeTab === 'available' && voucher.used) return false;
    if (activeTab === 'expired') {
      const today = new Date();
      const expiry = new Date(voucher.expiryDate);
      return expiry < today;
    }
    if (filterType !== 'all' && voucher.type !== filterType) return false;
    return true;
  });

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You would typically show a toast notification here
    console.log('Copied:', code);
  };

  const getVoucherIcon = (type: string) => {
    switch (type) {
      case 'platform': return <Gift className="w-5 h-5 text-medical-blue" />;
      case 'store': return <Store className="w-5 h-5 text-medical-green" />;
      case 'shipping': return <Truck className="w-5 h-5 text-medical-orange" />;
      default: return <Tag className="w-5 h-5" />;
    }
  };

  const getVoucherTypeLabel = (type: string) => {
    switch (type) {
      case 'platform': return 'Sàn';
      case 'store': return 'Cửa hàng';
      case 'shipping': return 'Vận chuyển';
      default: return '';
    }
  };

  const getVoucherTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'platform': return 'bg-blue-100 text-blue-800';
      case 'store': return 'bg-green-100 text-green-800';
      case 'shipping': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => {}} cartCount={3} wishlistCount={5} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kho Voucher</h1>
          <p className="text-gray-600">Tận dụng các ưu đãi tuyệt vời để tiết kiệm chi phí mua sắm</p>
        </div>

        {/* Voucher Input */}
        <Card className="mb-6">
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
        </Card>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1">
          {[
            { key: 'available', label: 'Có thể sử dụng', count: vouchers.filter(v => !v.used).length },
            { key: 'used', label: 'Đã sử dụng', count: vouchers.filter(v => v.used).length },
            { key: 'expired', label: 'Hết hạn', count: 0 }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
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
            variant={filterType === 'store' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('store')}
          >
            <Store className="w-4 h-4 mr-1" />
            Voucher cửa hàng
          </Button>
          <Button
            variant={filterType === 'shipping' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('shipping')}
          >
            <Truck className="w-4 h-4 mr-1" />
            Voucher vận chuyển
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
              <Card key={voucher.id} className={`${voucher.used ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* Voucher Icon */}
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center">
                      {getVoucherIcon(voucher.type)}
                    </div>

                    {/* Voucher Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{voucher.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{voucher.description}</p>
                          {voucher.storeName && (
                            <p className="text-sm text-primary-600 mb-2">{voucher.storeName}</p>
                          )}
                        </div>
                        <Badge className={getVoucherTypeBadgeColor(voucher.type)}>
                          {getVoucherTypeLabel(voucher.type)}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Tag className="w-4 h-4 mr-1" />
                          Giảm: {voucher.discount}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          HSD: {new Date(voucher.expiryDate).toLocaleDateString('vi-VN')}
                        </div>
                        {voucher.available > 0 && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Còn: {voucher.available}
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        Đơn tối thiểu: {voucher.minOrder.toLocaleString('vi-VN')}đ
                        {voucher.maxDiscount && (
                          <span> • Giảm tối đa: {voucher.maxDiscount.toLocaleString('vi-VN')}đ</span>
                        )}
                      </div>

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

                        {!voucher.used && (
                          <Button size="sm" className="bg-primary-600 hover:bg-primary-700">
                            Sử dụng ngay
                          </Button>
                        )}

                        {voucher.used && (
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
