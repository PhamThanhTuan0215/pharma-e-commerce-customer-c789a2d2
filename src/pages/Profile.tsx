import React, { useState } from 'react';
import { User, MapPin, Lock, Bell, Package, Heart, CreditCard, LogOut, Edit, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0123456789',
    birthDate: '1990-01-01',
    gender: 'Nam'
  });

  const menuItems = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    { id: 'orders', label: 'Đơn hàng', icon: Package },
    { id: 'addresses', label: 'Địa chỉ', icon: MapPin },
    { id: 'security', label: 'Bảo mật', icon: Lock },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'wishlist', label: 'Yêu thích', icon: Heart },
    { id: 'payment', label: 'Thanh toán', icon: CreditCard },
  ];

  const addresses = [
    {
      id: 1,
      name: 'Nhà riêng',
      address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
      phone: '0123456789',
      isDefault: true
    },
    {
      id: 2,
      name: 'Văn phòng',
      address: '456 Đường DEF, Phường GHI, Quận 3, TP.HCM',
      phone: '0987654321',
      isDefault: false
    }
  ];

  const orders = [
    {
      id: 'DH001',
      date: '2024-01-15',
      status: 'delivered',
      statusText: 'Đã giao hàng',
      total: 125000,
      items: [
        {
          id: 1,
          name: 'Paracetamol 500mg - Hộp 100 viên',
          image: '/placeholder.svg',
          price: 25000,
          quantity: 2,
          store: 'Nhà thuốc ABC'
        },
        {
          id: 2,
          name: 'Vitamin C 1000mg',
          image: '/placeholder.svg',
          price: 75000,
          quantity: 1,
          store: 'Nhà thuốc ABC'
        }
      ]
    },
    {
      id: 'DH002',
      date: '2024-01-20',
      status: 'shipping',
      statusText: 'Đang giao hàng',
      total: 450000,
      items: [
        {
          id: 3,
          name: 'Máy đo huyết áp Omron',
          image: '/placeholder.svg',
          price: 450000,
          quantity: 1,
          store: 'Y tế ABC'
        }
      ]
    },
    {
      id: 'DH003',
      date: '2024-01-25',
      status: 'pending',
      statusText: 'Chờ xác nhận',
      total: 85000,
      items: [
        {
          id: 4,
          name: 'Dầu gió xanh Con Ó',
          image: '/placeholder.svg',
          price: 8000,
          quantity: 5,
          store: 'Nhà thuốc Bình An'
        },
        {
          id: 5,
          name: 'Thuốc ho',
          image: '/placeholder.svg',
          price: 45000,
          quantity: 1,
          store: 'Nhà thuốc Bình An'
        }
      ]
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      shipping: { variant: 'default' as const, color: 'bg-orange-100 text-orange-800' },
      delivered: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      cancelled: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    };
    
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const renderOrdersContent = () => (
    <Card>
      <CardHeader>
        <CardTitle>Đơn hàng của tôi</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="pending">Chờ xác nhận</TabsTrigger>
            <TabsTrigger value="shipping">Đang giao</TabsTrigger>
            <TabsTrigger value="delivered">Đã giao</TabsTrigger>
            <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4 mt-6">
            {orders.map((order) => (
              <Card key={order.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">Đơn hàng #{order.id}</span>
                      <span className="text-sm text-gray-500">{order.date}</span>
                    </div>
                    <Badge className={getStatusBadge(order.status).color}>
                      {order.statusText}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-500">{item.store}</p>
                          <p className="text-sm">{formatPrice(item.price)} x {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="font-medium">
                      Tổng tiền: <span className="text-medical-red">{formatPrice(order.total)}</span>
                    </span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Chi tiết
                      </Button>
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm">
                          <Star className="w-4 h-4 mr-1" />
                          Đánh giá
                        </Button>
                      )}
                      {order.status === 'pending' && (
                        <Button variant="destructive" size="sm">
                          Hủy đơn
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          {['pending', 'shipping', 'delivered', 'cancelled'].map((status) => (
            <TabsContent key={status} value={status} className="mt-6">
              <div className="space-y-4">
                {orders
                  .filter((order) => order.status === status)
                  .map((order) => (
                    <Card key={order.id} className="border">
                      <CardContent className="p-4">
                        {/* Same order card content as above */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <span className="font-medium">Đơn hàng #{order.id}</span>
                            <span className="text-sm text-gray-500">{order.date}</span>
                          </div>
                          <Badge className={getStatusBadge(order.status).color}>
                            {order.statusText}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{item.name}</h4>
                                <p className="text-xs text-gray-500">{item.store}</p>
                                <p className="text-sm">{formatPrice(item.price)} x {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <span className="font-medium">
                            Tổng tiền: <span className="text-medical-red">{formatPrice(order.total)}</span>
                          </span>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Chi tiết
                            </Button>
                            {order.status === 'delivered' && (
                              <Button variant="outline" size="sm">
                                <Star className="w-4 h-4 mr-1" />
                                Đánh giá
                              </Button>
                            )}
                            {order.status === 'pending' && (
                              <Button variant="destructive" size="sm">
                                Hủy đơn
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {orders.filter((order) => order.status === status).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Không có đơn hàng nào trong trạng thái này
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Thông tin cá nhân</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? 'Hủy' : 'Chỉnh sửa'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>NA</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" size="sm">
                    Đổi ảnh đại diện
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    name="name"
                    value={userInfo.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={userInfo.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={userInfo.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="birthDate">Ngày sinh</Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={userInfo.birthDate}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-2 pt-4">
                  <Button className="bg-primary-600 hover:bg-primary-700">
                    Lưu thay đổi
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Hủy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'orders':
        return renderOrdersContent();

      case 'addresses':
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Địa chỉ giao hàng</CardTitle>
              <Button className="bg-primary-600 hover:bg-primary-700">
                Thêm địa chỉ mới
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{address.name}</h3>
                        {address.isDefault && (
                          <Badge variant="secondary">Mặc định</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-1">{address.address}</p>
                      <p className="text-gray-600">SĐT: {address.phone}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Sửa</Button>
                      <Button variant="outline" size="sm">Xóa</Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );

      case 'security':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Bảo mật tài khoản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Đổi mật khẩu</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button className="bg-primary-600 hover:bg-primary-700">
                    Đổi mật khẩu
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Xác thực hai bước</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Authentication</p>
                    <p className="text-sm text-gray-600">Gửi mã xác thực qua SMS</p>
                  </div>
                  <Button variant="outline">Kích hoạt</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Tính năng đang được phát triển...</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => {}} cartCount={3} wishlistCount={5} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar menu */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>NA</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{userInfo.name}</p>
                    <p className="text-sm text-gray-600">{userInfo.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        activeTab === item.id 
                          ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600' 
                          : 'text-gray-700'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                  <button className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-red-600">
                    <LogOut className="w-5 h-5" />
                    <span>Đăng xuất</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
