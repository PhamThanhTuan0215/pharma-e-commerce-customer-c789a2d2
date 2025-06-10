import React, { useEffect, useRef, useState } from 'react';
import { User, MapPin, Lock, Bell, Package, Heart, CreditCard, LogOut, Edit, Eye, Star, EyeOff, Check, Trash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import userApi from '@/services/api-user-service';
import shipmentApi from '@/services/api-shipment-service';
import orderApi from '@/services/api-order-service';
import { Checkbox } from "@/components/ui/checkbox";
import apiGHN from '@/services/api-GHN';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface Province {
  ProvinceID: number;
  Code: number;
  ProvinceName: string;
}

interface District {
  DistrictID: number;
  ProvinceID: number;
  Code: number;
  DistrictName: string;
}

interface Ward {
  WardCode: string;
  DistrictID: number;
  WardName: string;
}

// mock data address
// const mockAddresses: AddressType[] = [
//   {
//     address_name: 'Nhà riêng',
//     user_id: '1',
//     full_name: 'Nguyễn Văn A',
//     phone: '0912345678',
//     province_id: 1,
//     province_name: 'Hà Nội',
//     district_id: 2,
//     district_name: 'Quận Đống Đa',
//     ward_code: '3',
//     ward_name: 'Phường Láng Thượng',
//     address_detail: 'Số 123, đường Láng',
//     is_default: true
//   }
// ];

// mock data orders
// const mockOrders: Order[] = [
//   {
//     id: '1',
//     user_id: '1',
//     seller_id: '1',
//     seller_name: 'ABC Store',
//     total_quantity: 3,
//     original_items_total: 33000,
//     original_shipping_fee: 25000,
//     discount_amount_items: 5000,
//     discount_amount_shipping: 0,
//     discount_amount_items_platform_allocated: 2800,
//     discount_amount_shipping_platform_allocated: 0,
//     final_total: 50200,
//     payment_method: 'COD',
//     order_status: 'pending',
//     payment_status: 'pending',
//     is_completed: false,
//     createdAt: '2025-06-08T12:05:51.416Z',
//   }
// ];

// const mockOrderItems: OrderItem[] = [
//   {
//     id: '1',
//     order_id: '1',
//     product_id: '1',
//     product_name: 'Kem bôi da Ketoconazol 2%',
//     product_price: 11000,
//     product_quantity: 3,
//     product_url_image: 'https://res.cloudinary.com/dyacy1md1/image/upload/v1747463989/ecommerce-pharmacy/products/jrxob9mq3cj0wsruixl4.jpg',
//   }
// ];

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
  order_status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  is_completed: boolean;
  createdAt: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_quantity: number;
  product_url_image: string;
}

type OrderType = Order & {
  items?: OrderItem[];
  date?: string;
  status?: string;
  statusText?: string;
  total?: number;
};

const Profile = () => {

  const { tab, isPlaceOrder, _selectedOrder } = useLocation().state || { tab: 'profile', isPlaceOrder: false, selectedOrderId: null };

  useEffect(() => {
    if (tab === 'orders') {
      fetchOrders();
      if (isPlaceOrder) {
        toast({
          variant: 'success',
          description: 'Đã đặt hàng thành công',
        });
      }
      if (_selectedOrder) {
        handleViewOrderDetail(_selectedOrder);
      }
    }
    else if (tab === 'addresses') {
      fetchAddresses();
    }
  }, [tab]);

  const menuItems = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    {
      id: 'orders', label: 'Đơn hàng', icon: Package, onClick: () => {
        fetchOrders();
      }
    },
    {
      id: 'addresses', label: 'Địa chỉ', icon: MapPin, onClick: () => {
        fetchAddresses();
      }
    },
    { id: 'security', label: 'Bảo mật', icon: Lock },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    // { id: 'wishlist', label: 'Yêu thích', icon: Heart },
    // { id: 'payment', label: 'Thanh toán', icon: CreditCard },
  ];

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  const [activeTab, setActiveTab] = useState(tab);
  const [isEditing, setIsEditing] = useState(false);

  const [avatarImage, setAvatarImage] = useState(null);

  const fileInputRef = useRef(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [securityInfo, setSecurityInfo] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [userInfo, setUserInfo] = useState({
    id: '',
    email: '',
    fullname: '',
    phone: '',
    avatar: '',
    role: ''
  });

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [addressesInfo, setAddressesInfo] = useState<AddressType[]>([]);

  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const emptyAddress: AddressType = {
    address_name: '',
    user_id: '',
    full_name: '',
    phone: '',
    province_id: 0,
    province_name: '',
    district_id: 0,
    district_name: '',
    ward_code: '',
    ward_name: '',
    address_detail: '',
    is_default: false
  };

  const [newAddressInfo, setNewAddressInfo] = useState<AddressType>(emptyAddress);

  const [orders, setOrders] = useState<OrderType[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const [showCancelOrderDialog, setShowCancelOrderDialog] = useState(false);
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState<string | null>(null);

  const handleInputChangeUserInfo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleInputChangeSecurity = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecurityInfo({
      ...securityInfo,
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

  const getOrderStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'shipping': 'Đang giao',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'text-yellow-600',
      'completed': 'text-green-600',
      'failed': 'text-red-600',
      'cancelled': 'text-red-600',
      'refunded': 'text-green-600'
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Chờ thanh toán',
      'completed': 'Đã thanh toán',
      'failed': 'Thanh toán thất bại',
      'cancelled': 'Đã hủy',
      'refunded': 'Đã hoàn tiền'
    };
    return statusMap[status] || status;
  };

  const handleViewOrderDetail = async (order: OrderType) => {
    setSelectedOrder(order);
    setShowOrderDialog(true);
    setIsLoading(true);

    try {
      const response = await orderApi.get(`/orders/details/${order.id}`);
      if (response.data.code === 0) {
        const orderItems = response.data.data;
        setOrderItems(orderItems);
      }
    } catch (error) {
      toast({
        variant: 'error',
        description: error.response.data.message || error.message,
      });
    }
    setIsLoading(false);
  };

  const renderOrdersContent = () => (
    <Card>
      <CardHeader>
        <CardTitle>Đơn hàng của tôi</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="pending">Chờ xác nhận</TabsTrigger>
            <TabsTrigger value="confirmed">Đã xác nhận</TabsTrigger>
            <TabsTrigger value="shipping">Đang giao</TabsTrigger>
            <TabsTrigger value="delivered">Đã giao</TabsTrigger>
            <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {orders.map((order) => (
              <Card key={order.id} className="border hover:border-primary-500 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">Đơn hàng #{order.id}</span>
                      <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    {!order.is_completed ? <div className="flex items-center space-x-2">
                      <Badge className={getStatusBadge(order.order_status || '').color}>
                        {getOrderStatusText(order.order_status)}
                      </Badge>
                    </div> : <Badge className='bg-green-600 text-white'>
                      Đã hoàn thành
                    </Badge>}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Người bán: {order.seller_name}</p>
                      <p className="text-sm text-gray-600">Số lượng: {order.total_quantity} sản phẩm</p>
                      <p className="font-medium">
                        Tổng tiền: <span className="text-medical-red">{formatPrice(order.final_total)}</span>
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewOrderDetail(order)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Chi tiết
                      </Button>
                      {/* {order.order_status === 'delivered' && (
                        <Button variant="outline" size="sm">
                          <Star className="w-4 h-4 mr-1" />
                          Đánh giá
                        </Button>
                      )} */}
                      {order.order_status === 'pending' && (
                        <Button variant="destructive" size="sm" onClick={() => confirmCancelOrder(order.id)}>
                          Hủy đơn
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'].map((status) => (
            <TabsContent key={status} value={status} className="mt-6">
              <div className="space-y-4">
                {orders
                  .filter((order) => order.order_status === status)
                  .map((order) => (
                    <Card key={order.id} className="border hover:border-primary-500 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <span className="font-medium">Đơn hàng #{order.id}</span>
                            <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                          {!order.is_completed ? <div className="flex items-center space-x-2">
                            <Badge className={getStatusBadge(order.order_status || '').color}>
                              {getOrderStatusText(order.order_status)}
                            </Badge>
                          </div> : <Badge className='bg-green-600 text-white'>
                            Đã hoàn thành
                          </Badge>}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">Người bán: {order.seller_name}</p>
                            <p className="text-sm text-gray-600">Số lượng: {order.total_quantity} sản phẩm</p>
                            <p className="font-medium">
                              Tổng tiền: <span className="text-medical-red">{formatPrice(order.final_total)}</span>
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewOrderDetail(order)}>
                              <Eye className="w-4 h-4 mr-1" />
                              Chi tiết
                            </Button>
                            {/* {order.order_status === 'delivered' && (
                              <Button variant="outline" size="sm">
                                <Star className="w-4 h-4 mr-1" />
                                Đánh giá
                              </Button>
                            )} */}
                            {order.order_status === 'pending' && (
                              <Button variant="destructive" size="sm" onClick={() => confirmCancelOrder(order.id)}>
                                Hủy đơn
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {orders.filter((order) => order.order_status === status).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Không có đơn hàng nào trong trạng thái này
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Order Detail Dialog */}
        <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Chi tiết đơn hàng (Mã đơn: #{selectedOrder?.id})</DialogTitle>
              <DialogDescription>
                Đặt ngày {new Date(selectedOrder?.createdAt).toLocaleDateString('vi-VN')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Order Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Trạng thái đơn hàng</p>
                    <Badge className={getStatusBadge(selectedOrder?.order_status || '').color}>
                      {getOrderStatusText(selectedOrder?.order_status || '')}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                    <p className="font-medium">{selectedOrder?.payment_method}</p>
                    <p className={`${getPaymentStatusColor(selectedOrder?.payment_status || '')}`}>{getPaymentStatusText(selectedOrder?.payment_status || '')}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {isLoading ? <div className="flex justify-center items-center h-full">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div> : <div className="space-y-4">
                <h4 className="font-medium">Sản phẩm</h4>
                {orderItems.map((item) => (
                  <div onClick={() => handleClickProduct(item)} key={item.id} className="flex items-center space-x-4 border-b pb-4 cursor-pointer">
                    <img
                      src={item.product_url_image}
                      alt={item.product_name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product_name}</h4>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.product_price)} x {item.product_quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-medical-red">
                        {formatPrice(item.product_price * item.product_quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>}

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính</span>
                  <span>{formatPrice(selectedOrder?.original_items_total || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Phí vận chuyển</span>
                  <span>{formatPrice(selectedOrder?.original_shipping_fee || 0)}</span>
                </div>
                {selectedOrder?.discount_amount_items > 0 && <div className="flex justify-between text-sm text-green-600">
                  <span>Giảm giá sản phẩm từ nhà bán</span>
                  <span>-{formatPrice(selectedOrder?.discount_amount_items)}</span>
                </div>}
                {selectedOrder?.discount_amount_items_platform_allocated > 0 && <div className="flex justify-between text-sm text-green-600">
                  <span>Giảm giá sản phẩm từ sàn</span>
                  <span>-{formatPrice(selectedOrder?.discount_amount_items_platform_allocated)}</span>
                </div>}
                {selectedOrder?.discount_amount_shipping > 0 && <div className="flex justify-between text-sm text-green-600">
                  <span>Giảm giá vận chuyển từ nhà bán</span>
                  <span>-{formatPrice(selectedOrder?.discount_amount_shipping)}</span>
                </div>}
                {selectedOrder?.discount_amount_shipping_platform_allocated > 0 && <div className="flex justify-between text-sm text-green-600">
                  <span>Giảm giá vận chuyển từ sàn</span>
                  <span>-{formatPrice(selectedOrder?.discount_amount_shipping_platform_allocated)}</span>
                </div>}
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Tổng cộng</span>
                  <span className="text-medical-red">{formatPrice(selectedOrder?.final_total || 0)}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Order Dialog */}
        <Dialog open={showCancelOrderDialog} onOpenChange={setShowCancelOrderDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Hủy đơn hàng</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex space-x-2 justify-end">
              <Button variant="outline" onClick={() => setShowCancelOrderDialog(false)}>
                Đóng
              </Button>
              <Button variant="destructive" onClick={handleCancelOrder}>
                Xác nhận hủy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                      onChange={handleInputChangeUserInfo}
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
                      onChange={handleInputChangeUserInfo}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={userInfo.phone}
                      onChange={handleInputChangeUserInfo}
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
              <Button className="bg-primary-600 hover:bg-primary-700" onClick={handleAddNewAddress}>
                Thêm địa chỉ mới
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {addressesInfo.length > 0 ? addressesInfo.map((address) => (
                <div key={address.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{address.address_name}</h3>
                        {address.is_default && (
                          <Badge className='bg-primary-600 text-white'>Mặc định</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-1">{address.address_detail}, {address.ward_name}, {address.district_name}, {address.province_name}</p>
                      <p className="text-gray-600 mb-1">Tên người nhận: {address.full_name}</p>
                      <p className="text-gray-600">SĐT: {address.phone}</p>
                    </div>
                    <div className="flex space-x-2">
                      {!address.is_default && (
                        <Button variant="outline" size="sm" onClick={() => setDefaultAddress(address.id)}>
                          Đặt làm mặc định
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleEditAddress(address)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Sửa
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteAddress(address.id)}>
                        <Trash className="w-4 h-4 mr-2" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  Không có địa chỉ giao hàng. Vui lòng thêm địa chỉ mới
                </div>
              )}

              {/* Address Dialog */}
              <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{isEditingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</DialogTitle>
                    <DialogDescription>
                      Vui lòng điền đầy đủ thông tin địa chỉ bên dưới
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="address_name" className="text-right">
                        Tên địa chỉ
                      </Label>
                      <Input
                        id="address_name"
                        name="address_name"
                        placeholder="VD: Nhà riêng, Văn phòng"
                        className="col-span-3"
                        value={newAddressInfo.address_name}
                        onChange={handleAddressInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="full_name" className="text-right">
                        Tên người nhận
                      </Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        className="col-span-3"
                        value={newAddressInfo.full_name}
                        onChange={handleAddressInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">
                        Số điện thoại
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        className="col-span-3"
                        value={newAddressInfo.phone}
                        onChange={handleAddressInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="province" className="text-right">
                        Tỉnh/Thành phố
                      </Label>
                      <Select
                        value={newAddressInfo.province_id.toString()}
                        onValueChange={handleProvinceChange}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Chọn tỉnh/thành phố" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.map((province) => (
                            <SelectItem key={province.ProvinceID} value={province.ProvinceID.toString()}>
                              {province.ProvinceName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="district" className="text-right">
                        Quận/Huyện
                      </Label>
                      <Select
                        value={newAddressInfo.district_id.toString()}
                        onValueChange={handleDistrictChange}
                        disabled={!newAddressInfo.province_id}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Chọn quận/huyện" />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map((district) => (
                            <SelectItem key={district.DistrictID} value={district.DistrictID.toString()}>
                              {district.DistrictName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="ward" className="text-right">
                        Phường/Xã
                      </Label>
                      <Select
                        value={newAddressInfo.ward_code.toString()}
                        onValueChange={handleWardChange}
                        disabled={!newAddressInfo.district_id}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Chọn phường/xã" />
                        </SelectTrigger>
                        <SelectContent>
                          {wards.map((ward) => (
                            <SelectItem key={ward.WardCode} value={ward.WardCode.toString()}>
                              {ward.WardName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="address_detail" className="text-right">
                        Địa chỉ chi tiết
                      </Label>
                      <Input
                        id="address_detail"
                        name="address_detail"
                        placeholder="Số nhà, tên đường"
                        className="col-span-3"
                        value={newAddressInfo.address_detail}
                        onChange={handleAddressInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="col-start-2 col-span-3 flex items-center space-x-2">
                        <Checkbox
                          id="is_default"
                          checked={newAddressInfo.is_default}
                          onCheckedChange={handleDefaultChange}
                        />
                        <label
                          htmlFor="is_default"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Đặt làm địa chỉ mặc định
                        </label>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddressDialog(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleSaveAddress}>
                      {isEditingAddress ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={securityInfo.currentPassword}
                      onChange={handleInputChangeSecurity}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={securityInfo.newPassword}
                        onChange={handleInputChangeSecurity}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={securityInfo.confirmPassword}
                      onChange={handleInputChangeSecurity}
                    />
                  </div>
                  <Button onClick={handleChangePassword} className="bg-primary-600 hover:bg-primary-700">
                    Đổi mật khẩu
                  </Button>
                </div>
              </div>

              {/* <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Xác thực hai bước</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Authentication</p>
                    <p className="text-sm text-gray-600">Gửi mã xác thực qua SMS</p>
                  </div>
                  <Button variant="outline">Kích hoạt</Button>
                </div>
              </div> */}
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
  const fetchUserInfo = async () => {
    if (!isLoggedIn) return;

    setIsLoading(true);

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
        })
        .finally(() => {
          setIsLoading(false);
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

  // Đổi mật khẩu
  const handleChangePassword = () => {

    if (!isLoggedIn) return;

    if (securityInfo.newPassword !== securityInfo.confirmPassword) {
      toast({
        variant: 'error',
        description: 'Mật khẩu mới và xác nhận mật khẩu mới không khớp',
      });
      return;
    }

    const payload = {
      oldPassword: securityInfo.currentPassword,
      newPassword: securityInfo.newPassword
    }

    userApi.post(`/users/change-password`, payload)
      .then((response) => {
        if (response.data.code === 0) {
          setSecurityInfo({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });

          setShowNewPassword(false);

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

  // Fetch provinces data
  const fetchProvinces = async () => {
    try {
      const response = await apiGHN().get('/master-data/province');
      const data = response.data;
      setProvinces(data.data);
    } catch (error) {
      toast({
        variant: 'error',
        description: 'Không thể tải danh sách tỉnh/thành phố',
      });
    }
  };

  // Fetch districts by province
  const fetchDistricts = async (provinceId) => {

    try {
      const response = await apiGHN().get(`/master-data/district?province_id=${provinceId}`);
      const data = response.data;
      setDistricts(data.data);
      setWards([]); // Reset wards when province changes
    } catch (error) {
      toast({
        variant: 'error',
        description: 'Không thể tải danh sách quận/huyện',
      });
    }
  };

  // Fetch wards by district
  const fetchWards = async (districtId: string) => {
    try {
      const response = await apiGHN().get(`/master-data/ward?district_id=${districtId}`);
      const data = response.data;
      setWards(data.data);
    } catch (error) {
      toast({
        variant: 'error',
        description: 'Không thể tải danh sách phường/xã',
      });
    }
  };

  // Handle address form input changes
  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddressInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle province selection
  const handleProvinceChange = (value: string) => {
    const provinceId = parseInt(value);
    const selectedProvince = provinces.find(p => p.ProvinceID === provinceId);

    setNewAddressInfo(prev => ({
      ...prev,
      province_id: provinceId,
      province_name: selectedProvince?.ProvinceName || '',
      district_id: 0,
      district_name: '',
      ward_code: '',
      ward_name: ''
    }));

    if (provinceId) {
      fetchDistricts(provinceId.toString());
    } else {
      setDistricts([]);
      setWards([]);
    }
  };

  // Handle district selection
  const handleDistrictChange = (value: string) => {
    const districtId = parseInt(value);
    const selectedDistrict = districts.find(d => d.DistrictID === districtId);

    setNewAddressInfo(prev => ({
      ...prev,
      district_id: districtId,
      district_name: selectedDistrict?.DistrictName || '',
      ward_code: '',
      ward_name: ''
    }));

    if (districtId) {
      // Sử dụng DistrictID thay vì district_id
      const district = districts.find(d => d.DistrictID === districtId);
      if (district) {
        fetchWards(district.DistrictID.toString());
      }
    } else {
      setWards([]);
    }
  };

  // Handle ward selection
  const handleWardChange = (value: string) => {
    const wardCode = value;
    const selectedWard = wards.find(w => w.WardCode === wardCode);

    setNewAddressInfo(prev => ({
      ...prev,
      ward_code: wardCode,
      ward_name: selectedWard?.WardName || ''
    }));
  };

  // Handle checkbox change
  const handleDefaultChange = (checked: boolean) => {
    setNewAddressInfo(prev => ({
      ...prev,
      is_default: checked
    }));
  };

  // Open dialog for new address
  const handleAddNewAddress = () => {
    setIsEditingAddress(false);
    setNewAddressInfo(emptyAddress);
    setShowAddressDialog(true);
    fetchProvinces();
  };

  // Open dialog for editing address
  const handleEditAddress = (address: AddressType) => {
    setIsEditingAddress(true);
    setNewAddressInfo(address);
    setShowAddressDialog(true);
    fetchProvinces();

    // Fetch districts and wards for the selected address
    const getLocationData = async () => {
      if (address.province_id) {
        await fetchDistricts(address.province_id.toString());
      }
      if (address.district_id) {
        await fetchWards(address.district_id.toString());
      }
    };

    getLocationData();
  };

  // Save address (create new or update)
  const handleSaveAddress = () => {
    // Validate required fields
    const requiredFields = ['address_name', 'full_name', 'phone', 'province_id', 'district_id', 'ward_code', 'address_detail'];
    const missingFields = requiredFields.filter(field => !newAddressInfo[field as keyof AddressType]);

    if (missingFields.length > 0) {
      toast({
        variant: 'error',
        description: 'Vui lòng điền đầy đủ thông tin',
      });
      return;
    }

    // Prepare the address data with proper is_default value
    let payload = {
      user_id: user.id,
      address_name: newAddressInfo.address_name,
      full_name: newAddressInfo.full_name,
      phone: newAddressInfo.phone,
      province_id: newAddressInfo.province_id,
      province_name: newAddressInfo.province_name,
      district_id: newAddressInfo.district_id,
      district_name: newAddressInfo.district_name,
      ward_code: newAddressInfo.ward_code,
      ward_name: newAddressInfo.ward_name,
      address_detail: newAddressInfo.address_detail,
      is_default: newAddressInfo.is_default
    };

    const addressDefault = addressesInfo.find(addr => addr.is_default);

    // If this is the first address, make it default
    if (!addressDefault) {
      payload.is_default = true;
    }
    // If editing and this address was default, keep it default
    else if (isEditingAddress && addressDefault?.id === newAddressInfo.id) {
      payload.is_default = true;
    }
    else if (isEditingAddress && addressDefault?.id !== newAddressInfo.id) {
      payload.is_default = false;
    }
    // If there's already a default address and this is a new address, make it non-default
    else if (!isEditingAddress && addressDefault) {
      payload.is_default = false;
    }

    // Here you would typically make an API call to save the address
    if (isEditingAddress) {
      shipmentApi.put(`/shipments/addresses/${newAddressInfo.id}`, payload)
        .then((response) => {
          if (response.data.code === 0) {
            const updatedAddress = response.data.data;
            setAddressesInfo(prev => prev.map(addr => addr.id === updatedAddress.id ? updatedAddress : addr));

            toast({
              variant: 'success',
              description: 'Cập nhật địa chỉ thành công',
            });

            setShowAddressDialog(false);
          }
        })
        .catch((error) => {
          toast({
            variant: 'error',
            description: error.response.data.message || error.message,
          });
        })
    } else {

      shipmentApi.post(`/shipments/addresses`, payload)
        .then((response) => {
          if (response.data.code === 0) {
            const newAddress = response.data.data;
            setAddressesInfo(prev => [...prev, newAddress]);

            toast({
              variant: 'success',
              description: 'Thêm địa chỉ thành công',
            });

            setShowAddressDialog(false);
          }
        })
        .catch((error) => {
          toast({
            variant: 'error',
            description: error.response.data.message || error.message,
          });
        })
    }
  };

  const handleDeleteAddress = (address_id: string) => {

    // kiểm tra có đang là địa chỉ mặc định không
    const addressDefault = addressesInfo.find(addr => addr.is_default);
    if (addressDefault?.id === address_id && addressesInfo.length > 1) {
      toast({
        variant: 'error',
        description: 'Chọn địa chỉ mặc định khác trước khi xóa',
      });
      return;
    }

    shipmentApi.delete(`/shipments/addresses/${address_id}`)
      .then((response) => {
        if (response.data.code === 0) {
          setAddressesInfo(prev => prev.filter(addr => addr.id !== address_id));

          toast({
            variant: 'success',
            description: 'Xóa địa chỉ thành công',
          });
        }
      })
      .catch((error) => {
        toast({
          variant: 'error',
          description: error.response.data.message || error.message,
        });
      })
  }

  const setDefaultAddress = (address_id: string) => {
    shipmentApi.get(`/shipments/addresses/set-default/${address_id}`)
      .then((response) => {
        if (response.data.code === 0) {
          setAddressesInfo(prev => prev.map(addr => addr.id === address_id ? { ...addr, is_default: true } : { ...addr, is_default: false }));

          toast({
            variant: 'success',
            description: 'Cập nhật địa chỉ mặc định thành công',
          });
        }
      })
      .catch((error) => {
        toast({
          variant: 'error',
          description: error.response.data.message || error.message,
        });
      })
  }

  const fetchAddresses = () => {
    setIsLoading(true);

    shipmentApi.get(`/shipments/addresses?user_id=${user.id}`)
      .then((response) => {
        if (response.data.code === 0) {
          const addresses = response.data.data;
          setAddressesInfo(addresses);
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
  }

  const handleClickProduct = (item: any) => {
    navigate(`/products/${item.product_id}`, { state: { tab: 'orders', _selectedOrder: selectedOrder } });
  };

  const fetchOrders = () => {
    setIsLoading(true);

    orderApi.get(`/orders?user_id=${user.id}`)
      .then((response) => {
        if (response.data.code === 0) {
          const orders = response.data.data;
          const formattedOrders = orders.map((order: any) => ({
            ...order
          }));
          setOrders(formattedOrders);
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
    // // Trong thực tế, bạn sẽ gọi API để lấy danh sách đơn hàng
    // const formattedOrders = mockOrders.map(order => ({
    //   ...order,
    //   date: new Date(order.createdAt).toLocaleDateString('vi-VN'),
    //   status: order.order_status,
    //   statusText: getOrderStatusText(order.order_status),
    //   total: order.final_total
    // }));

    // setOrders(formattedOrders);
    setIsLoading(false);
  }

  const confirmCancelOrder = (order_id: string) => {
    setSelectedOrderToCancel(order_id);
    setShowCancelOrderDialog(true);
  }

  const handleCancelOrder = () => {
    if (selectedOrderToCancel) {
      cancelOrder(selectedOrderToCancel);
      setShowCancelOrderDialog(false);
      setSelectedOrderToCancel(null);
    }
  }

  const cancelOrder = (order_id: string) => {
    orderApi.delete(`/orders/${order_id}`)
      .then((response) => {
        if (response.data.code === 0) {
          const canceledOrder = response.data.data;
          setOrders(prev => prev.map(order => order.id === canceledOrder.id ? canceledOrder : order));

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
      })
  }

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar menu */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={userInfo.avatar || 'default-avatar.png'} />
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
                      onClick={() => {
                        setActiveTab(item.id);
                        item.onClick?.();
                      }}
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
            {isLoading ? <div className="flex justify-center items-center h-full">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div> : renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
