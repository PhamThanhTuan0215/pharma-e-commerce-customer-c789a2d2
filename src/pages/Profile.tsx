import React, { useEffect, useRef, useState } from 'react';
import { User, MapPin, Lock, Bell, Package, Heart, CreditCard, LogOut, Edit, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import userApi from '@/services/api-user-service';

const Profile = () => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  const [avatarImage, setAvatarImage] = useState(null);

  const fileInputRef = useRef(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  const [userInfo, setUserInfo] = useState({
    id: '',
    email: '',
    fullname: '',
    phone: '',
    avatar: '',
    role: ''
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
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ảnh đại diện</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={previewAvatar || userInfo.avatar || '/default-avatar.png'} />
                    <AvatarFallback>NA</AvatarFallback>
                  </Avatar>
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      style={{ display: "none" }}
                    />
                    <Button variant="outline" size="sm" onClick={handleChooseAvatar}>
                      Đổi ảnh đại diện
                    </Button>
                    {previewAvatar && <Button variant="outline" size="sm" onClick={handleUpdateAvatar} className="hover:bg-primary-500">
                      Lưu ảnh
                    </Button>}
                  </>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Thông tin cá nhân</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isEditing ? handleCancelUpdateUserInfo() : setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullname">Họ và tên</Label>
                    <Input
                      id="fullname"
                      name="fullname"
                      value={userInfo.fullname}
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
                </div>

                {isEditing && (
                  <div className="flex space-x-2 pt-4">
                    <Button onClick={handleUpdateUserInfo} className="bg-primary-600 hover:bg-primary-700">
                      Lưu thay đổi
                    </Button>
                    <Button variant="outline" onClick={handleCancelUpdateUserInfo}>
                      Hủy
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
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

  // đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isLoggedIn');

    setIsLoggedIn(false);
    setUser(null);

    toast({
      variant: 'success',
      description: 'Đăng xuất thành công',
    });
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // lấy thông tin người dùng
  const getUserInfo = async () => {
    if (!isLoggedIn) return;

    if (user.id) {
      userApi.get(`/users/${user.id}`)
        .then((response) => {
          if (response.data.code === 0) {
            const userInfo = response.data.data;
            setUserInfo({
              id: userInfo.id,
              email: userInfo.email,
              fullname: userInfo.fullname,
              phone: userInfo.phone,
              avatar: userInfo.avatar,
              role: userInfo.role,
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
  }

  // Chỉnh sửa thông tin cá nhân
  const handleUpdateUserInfo = async () => {
    if (!isLoggedIn) return;

    if (userInfo.id) {
      userApi.put(`/users`, userInfo)
        .then((response) => {
          if (response.data.code === 0) {
            const user = response.data.data;
            localStorage.setItem('user', JSON.stringify(user));

            setUser(user);
            setIsEditing(false);

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
  }

  // Cập nhật ảnh đại diện
  const handleUpdateAvatar = async () => {

    if (!isLoggedIn) return;

    const formData = new FormData();
    formData.append('image', avatarImage);

    userApi.post(`/users/${user.id}/update-avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
      .then((response) => {
        if (response.data.code === 0) {
          const newAvatar = response.data.data.avatar;

          const updatedUser = {
            ...user,
            avatar: newAvatar
          };
          setUser(updatedUser);
          setUserInfo(prev => ({
            ...prev,
            avatar: newAvatar
          }));
          localStorage.setItem('user', JSON.stringify(updatedUser));

          setAvatarImage(null);
          setPreviewAvatar(null);

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

  // Chọn ảnh đại diện
  const handleChooseAvatar = () => {
    fileInputRef.current.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setPreviewAvatar(imageURL); // hiển thị ảnh tạm
      setAvatarImage(file);
    }
  };

  // Hủy chỉnh sửa thông tin cá nhân
  const handleCancelUpdateUserInfo = () => {
    setUserInfo({
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
    });

    setPreviewAvatar(null);

    setIsEditing(false);
  }

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log(user.avatar);

    getUserInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => { }} cartCount={3} wishlistCount={5} />

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
                    <p className="font-medium">{userInfo.fullname}</p>
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
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${activeTab === item.id
                        ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                        : 'text-gray-700'
                        }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                  <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-red-600">
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
