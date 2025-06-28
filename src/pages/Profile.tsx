import React, { useEffect, useRef, useState } from 'react';
import { User, MapPin, Lock, Bell, Package, Heart, CreditCard, LogOut, Edit, Eye, Star, EyeOff, Check, Trash, Loader2, PackageMinus, X, Plus } from 'lucide-react';
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
import productApi from '@/services/api-product-service';
import userApi from '@/services/api-user-service';
import shipmentApi from '@/services/api-shipment-service';
import orderApi from '@/services/api-order-service';
import paymentApi from '@/services/api-payment-service';
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
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

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
  order_status: 'pending' | 'confirmed' | 'ready_to_ship' | 'shipping' | 'delivered' | 'cancelled' | 'refunded';
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

interface OrderReturnRequest {
  id: string;
  order_id: string;
  seller_id: string;
  user_id: string;
  reason: string;
  return_shipping_fee_paid_by: string;
  customer_message: string;
  request_at: string;
  response_message: string | null;
  url_images_related: string[];
  response_at: string | null;
  status: string;
  customer_shipping_address_id: string;
  createdAt: string;
  updatedAt: string;
  Order: {
    id: string;
    total_quantity: number;
    final_total: number;
    createdAt: string;
    updatedAt: string;
  }
}

interface OrderReturnRequestItem {
  id: string;
  order_return_request_id: string;
  returned_order_id: string | null;
  product_id: string;
  product_name: string;
  product_price: number;
  product_quantity: number;
  product_url_image: string;
  createdAt: string;
  updatedAt: string;
}

interface ReturnedOrder {
  id: string;
  order_return_request_id: string;
  order_id: string;
  seller_id: string;
  seller_name: string;
  user_id: string;
  total_quantity: number;
  return_shipping_fee: number;
  return_shipping_fee_paid_by: string;
  refund_amount: number;
  order_status: 'processing' | 'shipping' | 'returned' | 'failed';
  payment_refund_status: 'pending' | 'completed' | 'failed';
  is_completed: boolean;
  returned_at: string | null;
  createdAt: string;
  updatedAt: string;
}

interface OrderReturnRequestItem {
  id: string;
  order_return_request_id: string;
  returned_order_id: string | null;
  product_id: string;
  product_name: string;
  product_price: number;
  product_quantity: number;
  product_url_image: string;
  createdAt: string;
  updatedAt: string;
}

interface RefundOrderInfo {
  order_id: string;
  reason: string;
  customer_message: string;
  customer_shipping_address_id: string;
  items: {
    id: string;
    product_id: string;
    product_quantity: number;
  }[];
  url_images_related: (string | File)[] | null;
}

interface Review {
  id: string;
  user_id: string;
  seller_id: string;
  order_id: string;
  user_fullname: string;
  product_id: string;
  comment: string;
  rating: number;
  url_images_related: string[];
  createdAt: string;
  updatedAt: string;
  is_edited: boolean;
  response_review: {
    id: string;
    review_id: string;
    seller_name: string;
    response_comment: string;
    url_image_related: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}

interface submitReviewData {
  user_id: string;
  user_fullname: string;
  order_id: string;
  product_id: string;
  rating: number;
  comment: string;
  images: File[];
}

// SHIPPING_STATUS trạng thái đơn hàng
const SHIPPING_STATUS = {
  WAITING_FOR_PICKUP: 'WAITING_FOR_PICKUP',
  PICKUP_FAILED: 'PICKUP_FAILED',
  PICKED_UP: 'PICKED_UP',
  IN_WAREHOUSE: 'IN_WAREHOUSE',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  DELIVERY_FAILED: 'DELIVERY_FAILED',
  RETURNING: 'RETURNING',
  RETURNED: 'RETURNED',
  CANCELLED: 'CANCELLED',
  LOST: 'LOST',
  DAMAGED: 'DAMAGED',
  ON_HOLD: 'ON_HOLD',
};

// CHECKPOINT_STATUS trạng thái quét mã
const CHECKPOINT_STATUS = {
  PICKUP_SUCCESS: 'PICKUP_SUCCESS',
  PICKUP_FAILED: 'PICKUP_FAILED',
  ARRIVAL_WAREHOUSE: 'ARRIVAL_WAREHOUSE',
  DEPARTURE_WAREHOUSE: 'DEPARTURE_WAREHOUSE',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED_SUCCESS: 'DELIVERED_SUCCESS',
  DELIVERED_FAILED: 'DELIVERED_FAILED',
  RETURN_TO_SENDER: 'RETURN_TO_SENDER',
};

interface ShipmentProgress {
  location: string;
  status: string;
  note: string;
  timestamp: string;
}

interface OrderShipment {
  id: string;
  order_id: string;
  tracking_number: string;
  shipping_provider_id: string;
  shipping_address_from_id: string;
  shipping_address_to_id: string;
  current_status: string;
  progress: ShipmentProgress[];
  createdAt: string;
  updatedAt: string;
}

// mock data of order shipment
// const orderShipmentMock: OrderShipment = {
//   id: "1",
//   order_id: "1",
//   tracking_number: "SH202506171138416686",
//   shipping_provider_id: "1",
//   shipping_address_from_id: "1",
//   shipping_address_to_id: "2",
//   current_status: "IN_TRANSIT",
//   progress: [
//       {
//           location: "Kho Nha Trang",
//           status: "ARRIVAL_WAREHOUSE",
//           note: "Đơn hàng đang ở kho Kho Nha Trang",
//           timestamp: "2025-06-17T01:38:41.315Z"
//       },
//       {
//           location: "Kho Hồ Chí Minh",
//           status: "DEPARTURE_WAREHOUSE",
//           note: "Đơn hàng đã rời kho Kho Hồ Chí Minh",
//           timestamp: "2025-06-17T02:38:41.315Z"
//       },
//       {
//           location: "Hà Nội",
//           status: "IN_TRANSIT",
//           note: "Đơn hàng đang di chuyển qua Hà Nội",
//           timestamp: "2025-06-17T03:38:41.315Z"
//       }
//   ],
//   createdAt: "2025-06-17T04:38:41.316Z",
//   updatedAt: "2025-06-17T04:38:41.316Z"
// }

const reasons_for_funded = [
  'Sản phẩm bị lỗi, hư hỏng',
  'Giao sai sản phẩm',
  'Sản phẩm hết hạn sử dụng',
  'Sản phẩm không đúng mô tả',
  'Bao bì sản phẩm bị móp méo, rách, không đảm bảo',
  'Khách đặt nhầm sản phẩm',
  'Khách hàng đổi ý không muốn mua'
]

// const orderReturnRequestMock: OrderReturnRequest[] = [
//   {
//     id: "11",
//     order_id: "2",
//     seller_id: "2",
//     user_id: "1",
//     reason: "Sản phẩm không đúng mô tả",
//     return_shipping_fee_paid_by: "seller",
//     customer_message: "Sản phẩm không giống với hiển thị trên cửa hàng",
//     request_at: "2025-06-11T16:13:51.725Z",
//     response_message: "Đồng ý cho khách hàng hoàn trả sản phẩm",
//     response_at: "2025-06-11T16:14:33.969Z",
//     status: "accepted",
//     customer_shipping_address_id: "8",
//     createdAt: "2025-06-11T16:13:51.727Z",
//     updatedAt: "2025-06-11T16:14:33.969Z",
//     Order: {
//       id: "2",
//       total_quantity: 1,
//       final_total: 38800,
//       createdAt: "2025-06-08T12:05:51.417Z",
//       updatedAt: "2025-06-11T16:07:44.313Z"
//     }
//   },
//   {
//     id: "10",
//     order_id: "23",
//     seller_id: "1",
//     user_id: "1",
//     reason: "Sản phẩm bị lỗi, hư hỏng",
//     return_shipping_fee_paid_by: "seller",
//     customer_message: "Sản phẩm bị hư hỏng, không an toàn khi sử dụng",
//     request_at: "2025-06-11T16:01:43.962Z",
//     response_message: null,
//     response_at: null,
//     status: "requested",
//     customer_shipping_address_id: "8",
//     createdAt: "2025-06-11T16:01:43.965Z",
//     updatedAt: "2025-06-11T16:01:43.965Z",
//     Order: {
//       id: "23",
//       total_quantity: 1,
//       final_total: 32001,
//       createdAt: "2025-06-10T13:07:37.127Z",
//       updatedAt: "2025-06-11T15:33:40.522Z"
//     }
//   }
// ]

// const orderReturnRequestItemMock: OrderReturnRequestItem[] = [
//   {
//     id: "10",
//     order_return_request_id: "10",
//     returned_order_id: null,
//     product_id: "1",
//     product_name: "Kem bôi da Ketoconazol 2%",
//     product_price: 11000,
//     product_quantity: 1,
//     product_url_image: "https://res.cloudinary.com/dyacy1md1/image/upload/v1747463989/ecommerce-pharmacy/products/jrxob9mq3cj0wsruixl4.jpg",
//     createdAt: "2025-06-11T16:01:44.030Z",
//     updatedAt: "2025-06-11T16:01:44.030Z"
//   }
// ]

// const returnedOrderMock: ReturnedOrder[] = [
//   {
//     id: "10",
//     order_return_request_id: "11",
//     order_id: "2",
//     seller_id: "2",
//     seller_name: "DEF Store",
//     user_id: "1",
//     total_quantity: 1,
//     return_shipping_fee: 29001,
//     return_shipping_fee_paid_by: "seller",
//     refund_amount: 28800,
//     order_status: "processing",
//     payment_refund_status: "pending",
//     is_completed: false,
//     returned_at: null,
//     createdAt: "2025-06-11T16:14:35.652Z",
//     updatedAt: "2025-06-11T16:14:35.652Z"
//   }
// ]

// const returnedOrderItemMock: OrderReturnRequestItem[] = [
//   {
//     id: "11",
//     order_return_request_id: "11",
//     returned_order_id: "10",
//     product_id: "6",
//     product_name: "Túi chườm nóng y tế",
//     product_price: 32000,
//     product_quantity: 1,
//     product_url_image: "https://res.cloudinary.com/dyacy1md1/image/upload/v1749379245/ecommerce-pharmacy/products/yyomvugxpz5ipfqoub1g.webp",
//     createdAt: "2025-06-11T16:13:51.773Z",
//     updatedAt: "2025-06-11T16:14:35.697Z"
//   }
// ]

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
    else if (tab === 'order-return') {
      fetchOrderReturnRequests();
      fetchReturnedOrders();
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
      id: 'order-return', label: 'Đơn hàng hoàn trả', icon: PackageMinus, onClick: () => {
        fetchOrderReturnRequests();
        fetchReturnedOrders();
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
  const [isLoadingPayOrder, setIsLoadingPayOrder] = useState(false);
  const [isLoadingSubmitReview, setIsLoadingSubmitReview] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  const [activeTab, setActiveTab] = useState(tab);
  const [isEditing, setIsEditing] = useState(false);

  const [avatarImage, setAvatarImage] = useState(null);

  // Add new states for managing tabs
  const [activeOrderTab, setActiveOrderTab] = useState('all');
  const [activeOrderReturnTab, setActiveOrderReturnTab] = useState('order-return-requests');

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

  const [orderReturnRequests, setOrderReturnRequests] = useState<OrderReturnRequest[]>([]);
  const [returnedOrders, setReturnedOrders] = useState<ReturnedOrder[]>([]);

  const [orderReturnRequestItems, setOrderReturnRequestItems] = useState<OrderReturnRequestItem[]>([]);
  const [returnedOrderItems, setReturnedOrderItems] = useState<OrderReturnRequestItem[]>([]);

  const [showReturnRequestDialog, setShowReturnRequestDialog] = useState(false);
  const [selectedReturnRequest, setSelectedReturnRequest] = useState<OrderReturnRequest | null>(null);

  const [showReturnedOrderDialog, setShowReturnedOrderDialog] = useState(false);
  const [selectedReturnedOrder, setSelectedReturnedOrder] = useState<ReturnedOrder | null>(null);

  const [showCancelReturnRequestDialog, setShowCancelReturnRequestDialog] = useState(false);
  const [selectedReturnRequestToCancel, setSelectedReturnRequestToCancel] = useState<string | null>(null);

  const [showRefundOrderDialog, setShowRefundOrderDialog] = useState(false);
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [refundOrderInfo, setRefundOrderInfo] = useState<RefundOrderInfo>({
    order_id: '',
    reason: '',
    customer_message: '',
    customer_shipping_address_id: '',
    items: [],
    url_images_related: null
  });

  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedOrderToReview, setSelectedOrderToReview] = useState<OrderType | null>(null);
  const [reviewItems, setReviewItems] = useState<{
    product_id: string;
    rating: number;
    comment: string;
    images: File[];
  }[]>([]);

  const [orderReviews, setOrderReviews] = useState<Review[]>([]);

  const [productsSelectedToReview, setProductsSelectedToReview] = useState<string[]>([]);

  const [showEditReviewDialog, setShowEditReviewDialog] = useState(false);
  const [editingReview, setEditingReview] = useState<{
    review: Review;
    rating: number;
    comment: string;
    images: File[];
  } | null>(null);

  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [orderShipment, setOrderShipment] = useState<OrderShipment | null>(null);

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
      ready_to_ship: { variant: 'default' as const, color: 'bg-orange-100 text-orange-800' },
      shipping: { variant: 'default' as const, color: 'bg-orange-100 text-orange-800' },
      delivered: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      cancelled: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      refunded: { variant: 'default' as const, color: 'bg-green-100 text-green-800' }
    };

    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const getOrderStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'ready_to_ship': 'Chờ lấy hàng',
      'shipping': 'Đang giao',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy',
      'refunded': 'Đã hoàn tiền'
    };
    return statusMap[status] || status;
  };

  const getReturnRequestStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'requested': 'Đã gửi yêu cầu',
      'accepted': 'Đã đồng ý',
      'rejected': 'Đã từ chối'
    };
    return statusMap[status] || status;
  }

  const getReturnRequestStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return statusMap[status] || statusMap.pending;
  }

  const getReturnedOrderStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'processing': 'Đang xử lý',
      'returned': 'Đã hoàn trả',
      'failed': 'Đã hủy'
    };
    return statusMap[status] || status;
  }

  const getReturnedOrderStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'processing': 'bg-yellow-100 text-yellow-800',
      'returned': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return statusMap[status] || statusMap.processing;
  }

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

  const getPaymentStatusText = (status: string, isRefunded: boolean = false) => {
    const statusMap: { [key: string]: string } = {
      'pending': isRefunded ? 'Chờ hoàn tiền' : 'Chờ thanh toán',
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackOrder = async (order: OrderType) => {
    setIsLoading(true);
    try {
      const response = await shipmentApi.get(`/shipments/shipping-orders/order/${order.id}`);
      if (response.data.code === 0) {
        const orderShipment = response.data.data;
        setOrderShipment(orderShipment);
      }
    } catch (error) {
      toast({
        variant: 'error',
        description: error.response.data.message || error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleReviewOrder = async (order: OrderType) => {
    setSelectedOrderToReview(order);
    setShowReviewDialog(true);
    setIsLoading(true);

    try {
      const [itemsResponse, reviewsResponse] = await Promise.all([
        orderApi.get(`/orders/details/${order.id}`),
        productApi.get(`/reviews/order/${order.id}`)
      ]);

      if (itemsResponse.data.code === 0) {
        const orderItems = itemsResponse.data.data;
        setOrderItems(orderItems);
        setReviewItems(orderItems.map(item => ({
          product_id: item.product_id,
          rating: 5,
          comment: '',
          images: []
        })));
      }

      if (reviewsResponse.data.code === 0) {
        const reviews = reviewsResponse.data.data;
        setOrderReviews(reviews);
      }
    } catch (error) {
      toast({
        variant: 'error',
        description: error.response.data.message || error.message,
      });
    }
    setIsLoading(false);
  }

  const handleEditReview = (review: Review) => {
    setEditingReview({
      review,
      rating: review.rating,
      comment: review.comment,
      images: []
    });
    setShowEditReviewDialog(true);
  }

  const submitEditReview = async () => {
    if (!editingReview) return;

    setIsLoadingSubmitReview(true);
    const formData = new FormData();
    formData.append('rating', editingReview.rating.toString());
    formData.append('comment', editingReview.comment);
    editingReview.images.forEach((file, index) => {
      formData.append('image_related', file);
    });

    try {
      const response = await productApi.put(`/reviews/update/${editingReview.review.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.code === 0) {
        const updatedReview = response.data.data;
        setOrderReviews(orderReviews.map(review =>
          review.id === updatedReview.id ? updatedReview : review
        ));

        toast({
          variant: 'success',
          description: 'Cập nhật đánh giá thành công',
        });
        setShowEditReviewDialog(false);
      }
    } catch (error) {
      toast({
        variant: 'error',
        description: error.response.data.message || error.message,
      });
    } finally {
      setIsLoadingSubmitReview(false);
    }
  }

  const submitReview = async (submitReviewData: submitReviewData) => {
    setIsLoadingSubmitReview(true);
    const formData = new FormData();
    formData.append('order_id', submitReviewData.order_id);
    formData.append('rating', submitReviewData.rating.toString());
    formData.append('comment', submitReviewData.comment);
    submitReviewData.images.forEach((file) => {
      formData.append('image_related', file);
    });

    const params = {
      user_id: submitReviewData.user_id,
      user_fullname: submitReviewData.user_fullname,
    }
    try {
      const response = await productApi.post(`/reviews/add/${submitReviewData.product_id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        params
      });
      if (response.data.code === 0) {
        const newReview = response.data.data;
        setOrderReviews([...orderReviews, newReview]);

        toast({
          variant: 'success',
          description: 'Đánh giá thành công',
        });
      }
    } catch (error) {
      toast({
        variant: 'error',
        description: error.response.data.message || error.message,
      });
    } finally {
      // xóa product_id khỏi productsSelectedToReview
      setProductsSelectedToReview(productsSelectedToReview.filter(productId => productId !== submitReviewData.product_id));
      setIsLoadingSubmitReview(false);
    }
  }

  const renderOrdersContent = () => (
    <Card>
      <CardHeader>
        <CardTitle>Đơn hàng của tôi</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeOrderTab} onValueChange={setActiveOrderTab} className="w-full">
          <div className="mb-10 sm:mb-5">
            {/* nếu là màn hình bình thường */}
            <div className="hidden sm:block">
              <TabsList className="grid grid-cols-4 sm:grid-cols-7 gap-2 pb-2">
                <TabsTrigger value="all" className="relative mr-2 border-2 border-grey-300 pt-4">Tất cả {orders.length === 0 ? '' : <span className="absolute -top-2 -right-2 text-red-500 rounded-full px-2 py-1 text-lg">{orders.length}</span>} </TabsTrigger>
                <TabsTrigger value="pending" className="relative mr-2 border-2 border-grey-300 pt-4">Chờ xác nhận {orders.filter(order => order.order_status === 'pending').length === 0 ? '' : <span className="absolute -top-2 -right-2 text-red-500 rounded-full px-2 py-1 text-lg">{orders.filter(order => order.order_status === 'pending').length}</span>} </TabsTrigger>
                <TabsTrigger value="confirmed" className="relative mr-2 border-2 border-grey-300 pt-4">Đã xác nhận {orders.filter(order => order.order_status === 'confirmed').length === 0 ? '' : <span className="absolute -top-2 -right-2 text-red-500 rounded-full px-2 py-1 text-lg">{orders.filter(order => order.order_status === 'confirmed').length}</span>} </TabsTrigger>
                <TabsTrigger value="ready_to_ship" className="relative mr-2 border-2 border-grey-300 pt-4">Chờ lấy hàng {orders.filter(order => order.order_status === 'ready_to_ship').length === 0 ? '' : <span className="absolute -top-2 -right-2 text-red-500 rounded-full px-2 py-1 text-lg">{orders.filter(order => order.order_status === 'ready_to_ship').length}</span>} </TabsTrigger>
                <TabsTrigger value="shipping" className="relative mr-2 border-2 border-grey-300 pt-4">Đang giao {orders.filter(order => order.order_status === 'shipping').length === 0 ? '' : <span className="absolute -top-2 -right-2 text-red-500 rounded-full px-2 py-1 text-lg">{orders.filter(order => order.order_status === 'shipping').length}</span>} </TabsTrigger>
                <TabsTrigger value="delivered" className="relative mr-2 border-2 border-grey-300 pt-4">Đã giao {orders.filter(order => order.order_status === 'delivered').length === 0 ? '' : <span className="absolute -top-2 -right-2 text-red-500 rounded-full px-2 py-1 text-lg">{orders.filter(order => order.order_status === 'delivered').length}</span>} </TabsTrigger>
                <TabsTrigger value="cancelled" className="relative mr-2 border-2 border-grey-300 pt-4">Đã hủy {orders.filter(order => order.order_status === 'cancelled').length === 0 ? '' : <span className="absolute -top-2 -right-2 text-red-500 rounded-full px-2 py-1 text-lg">{orders.filter(order => order.order_status === 'cancelled').length}</span>} </TabsTrigger>
              </TabsList>
            </div>

            {/* nếu là màn hình mobile */}
            <div className="block sm:hidden">
              <TabsList className="grid grid-cols-3 sm:grid-cols-7 gap-2 pb-2">
                <TabsTrigger value="all" className="relative mr-2 border-2 border-grey-300 pt-4">Tất cả {orders.length === 0 ? '' : <span className="absolute -top-2 -right-2 text-red-500 rounded-full px-2 py-1 text-lg">{orders.length}</span>} </TabsTrigger>
              </TabsList>

              <TabsList className="grid grid-cols-3 sm:grid-cols-7 gap-2 pb-2">
                <TabsTrigger value="pending" className="relative mr-2 border-2 border-grey-300 pt-4">Chờ xác nhận {orders.filter(order => order.order_status === 'pending').length === 0 ? '' : <span className="absolute -top-2 -right-2 text-red-500 rounded-full px-2 py-1 text-lg">{orders.filter(order => order.order_status === 'pending').length}</span>} </TabsTrigger>
                <TabsTrigger value="confirmed" className="relative mr-2 border-2 border-grey-300 pt-4">Đã xác nhận {orders.filter(order => order.order_status === 'confirmed').length === 0 ? '' : <span className="absolute -top-2 -right-2 text-red-500 rounded-full px-2 py-1 text-lg">{orders.filter(order => order.order_status === 'confirmed').length}</span>} </TabsTrigger>
                <TabsTrigger value="ready_to_ship" className="relative mr-2 border-2 border-grey-300 pt-4">Chờ lấy hàng {orders.filter(order => order.order_status === 'ready_to_ship').length === 0 ? '' : <span className="absolute -top-2 -right-2 text-red-500 rounded-full px-2 py-1 text-lg">{orders.filter(order => order.order_status === 'ready_to_ship').length}</span>} </TabsTrigger>
              </TabsList>

              <TabsList className="grid grid-cols-3 sm:grid-cols-7 gap-2 pb-2">
                <TabsTrigger value="shipping" className="relative mr-2 border-2 border-grey-300 pt-4">Đang giao {orders.filter(order => order.order_status === 'shipping').length === 0 ? '' : <span className="absolute -top-2 -right-2 text-red-500 rounded-full px-2 py-1 text-lg">{orders.filter(order => order.order_status === 'shipping').length}</span>} </TabsTrigger>
                <TabsTrigger value="delivered" className="relative mr-2 border-2 border-grey-300 pt-4">Đã giao {orders.filter(order => order.order_status === 'delivered').length === 0 ? '' : <span className="absolute -top-2 -right-2 text-red-500 rounded-full px-2 py-1 text-lg">{orders.filter(order => order.order_status === 'delivered').length}</span>} </TabsTrigger>
                <TabsTrigger value="cancelled" className="relative mr-2 border-2 border-grey-300 pt-4">Đã hủy {orders.filter(order => order.order_status === 'cancelled').length === 0 ? '' : <span className="absolute -top-2 -right-2 text-red-500 rounded-full px-2 py-1 text-lg">{orders.filter(order => order.order_status === 'cancelled').length}</span>} </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4 mt-6">
            {orders.map((order) => (
              <Card key={order.id} className="border hover:border-primary-500 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col-reverse md:flex-row md:items-center justify-between mb-4">
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-2 md:mt-0">
                      <span className="font-medium">Đơn hàng #{order.id}</span>
                      <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!order.is_completed ? <div className="flex items-center space-x-2">
                        <Badge className={getStatusBadge(order.order_status || '').color}>
                          {getOrderStatusText(order.order_status)}
                        </Badge>
                      </div> : <Badge className='bg-green-600 text-white'>
                        Đã hoàn thành
                      </Badge>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Nhà bán: <span onClick={() => handleClickStore(order.seller_id)} className="font-bold text-medical-blue cursor-pointer">{order.seller_name}</span></p>
                      <p className="text-sm text-gray-600">Số lượng: {order.total_quantity} sản phẩm</p>
                      <p className="font-medium">
                        Tổng tiền: <span className="text-medical-red">{formatPrice(order.final_total)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end mt-4">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewOrderDetail(order)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Chi tiết
                      </Button>
                      {['ready_to_ship', 'shipping'].includes(order.order_status) && (
                        <Button variant="outline" size="sm" onClick={() => handleTrackOrder(order)}>
                          <MapPin className="w-4 h-4 mr-1" />
                          Theo dõi đơn hàng
                        </Button>
                      )}

                      {['delivered', 'cancelled', 'refunded'].includes(order.order_status) && (
                        <Button variant="outline" size="sm" onClick={() => handleTrackOrder(order)}>
                          <MapPin className="w-4 h-4 mr-1" />
                          Lịch sử vận chuyển
                        </Button>
                      )}

                      {((order.payment_status === 'pending' || order.payment_status === 'failed') && order.order_status !== 'cancelled') && order.payment_method.toUpperCase() === 'VNPAY' && (
                        <Button variant="outline" size="sm" onClick={() => handlePayOrder(order)} disabled={isLoadingPayOrder}>
                          <CreditCard className="w-4 h-4 mr-1" />
                          {isLoadingPayOrder ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Đang xử lý</span> : 'Thanh toán'}
                        </Button>
                      )}
                      {order.is_completed && (
                        <Button variant="outline" size="sm" onClick={() => handleRefundOrder(order)}>
                          <PackageMinus className="w-4 h-4 mr-1" />
                          Hoàn trả
                        </Button>
                      )}
                      {order.order_status === 'pending' && (
                        <Button variant="destructive" size="sm" onClick={() => confirmCancelOrder(order.id)}>
                          Hủy
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {['pending', 'confirmed', 'ready_to_ship', 'shipping', 'delivered', 'cancelled'].map((status) => (
            <TabsContent key={status} value={status} className="mt-6">
              <div className="space-y-4">
                {orders
                  .filter((order) => order.order_status === status)
                  .map((order) => (
                    <Card key={order.id} className="border hover:border-primary-500 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex flex-col-reverse md:flex-row md:items-center justify-between mb-4">
                          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-2 md:mt-0">
                            <span className="font-medium">Đơn hàng #{order.id}</span>
                            <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!order.is_completed ? <div className="flex items-center space-x-2">
                              <Badge className={getStatusBadge(order.order_status || '').color}>
                                {getOrderStatusText(order.order_status)}
                              </Badge>
                            </div> : <Badge className='bg-green-600 text-white'>
                              Đã hoàn thành
                            </Badge>}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">Nhà bán: <span onClick={() => handleClickStore(order.seller_id)} className="font-bold text-medical-blue cursor-pointer">{order.seller_name}</span></p>
                            <p className="text-sm text-gray-600">Số lượng: {order.total_quantity} sản phẩm</p>
                            <p className="font-medium">
                              Tổng tiền: <span className="text-medical-red">{formatPrice(order.final_total)}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-end mt-4">
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewOrderDetail(order)}>
                              <Eye className="w-4 h-4 mr-1" />
                              Chi tiết
                            </Button>
                            {['ready_to_ship', 'shipping'].includes(order.order_status) && (
                              <Button variant="outline" size="sm" onClick={() => handleTrackOrder(order)}>
                                <MapPin className="w-4 h-4 mr-1" />
                                Theo dõi đơn hàng
                              </Button>
                            )}
                            {['delivered', 'cancelled', 'refunded'].includes(order.order_status) && (
                              <Button variant="outline" size="sm" onClick={() => handleTrackOrder(order)}>
                                <MapPin className="w-4 h-4 mr-1" />
                                Lịch sử vận chuyển
                              </Button>
                            )}
                            {((order.payment_status === 'pending' || order.payment_status === 'failed') && order.order_status !== 'cancelled') && order.payment_method.toUpperCase() === 'VNPAY' && (
                              <Button variant="outline" size="sm" onClick={() => handlePayOrder(order)} disabled={isLoadingPayOrder}>
                                <CreditCard className="w-4 h-4 mr-1" />
                                {isLoadingPayOrder ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Đang xử lý</span> : 'Thanh toán'}
                              </Button>
                            )}
                            {order.is_completed && (
                              <Button variant="outline" size="sm" onClick={() => handleRefundOrder(order)}>
                                <PackageMinus className="w-4 h-4 mr-1" />
                                Hoàn trả
                              </Button>
                            )}
                            {order.order_status === 'pending' && (
                              <Button variant="destructive" size="sm" onClick={() => confirmCancelOrder(order.id)}>
                                Hủy
                              </Button>
                            )}
                            {order.is_completed && (
                              <Button variant="outline" size="sm" onClick={() => handleReviewOrder(order)}>
                                <Star className="w-4 h-4 mr-1" />
                                Đánh giá
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {orders.filter((order) => order.order_status === status).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Không có đơn hàng nào
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Order Detail Dialog */}
        <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
          <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[100vh]">
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

        {/* Refund Order Dialog, hiện thanh cuộn khi chiều cao không đủ */}
        <Dialog open={showRefundOrderDialog} onOpenChange={setShowRefundOrderDialog}>
          <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[100vh]">
            <DialogHeader>
              <DialogTitle>Hoàn trả đơn hàng</DialogTitle>
              <DialogDescription>
                Vui lòng chọn sản phẩm và điền thông tin hoàn trả
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Product Selection */}
              <div className="space-y-4">
                <h4 className="font-medium">Chọn sản phẩm hoàn trả</h4>
                {currentOrderItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                    <Checkbox
                      checked={refundOrderInfo.items.some(i => i.id === item.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setRefundOrderInfo(prev => ({
                            ...prev,
                            items: [...prev.items, { id: item.id, product_id: item.product_id, product_quantity: 1 }]
                          }));
                        } else {
                          setRefundOrderInfo(prev => ({
                            ...prev,
                            items: prev.items.filter(i => i.id !== item.id)
                          }));
                        }
                      }}
                    />
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
                      {refundOrderInfo.items.some(i => i.id === item.id) && (
                        <div className="mt-2 flex items-center space-x-2">
                          <Label>Số lượng hoàn trả:</Label>
                          <Input
                            type="number"
                            min="1"
                            max={item.product_quantity}
                            value={refundOrderInfo.items.find(i => i.id === item.id)?.product_quantity || 1}
                            onChange={(e) => {
                              const quantity = Math.min(Math.max(1, parseInt(e.target.value) || 1), item.product_quantity);
                              setRefundOrderInfo(prev => ({
                                ...prev,
                                items: prev.items.map(i =>
                                  i.id === item.id
                                    ? { ...i, product_quantity: quantity }
                                    : i
                                )
                              }));
                            }}
                            className="w-20"
                          />
                          <span className="text-sm text-gray-500">/ {item.product_quantity}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reason Selection */}
              <div className="space-y-2">
                <Label>Lý do hoàn trả</Label>
                <Select
                  onValueChange={(value) => {
                    setRefundOrderInfo(prev => ({
                      ...prev,
                      reason: value,
                      customer_message: value
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lý do hoàn trả" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasons_for_funded.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Message */}
              <div className="space-y-2">
                <Label>Tin nhắn bổ sung</Label>
                <Input
                  placeholder="Nhập tin nhắn bổ sung (nếu có)"
                  value={refundOrderInfo.customer_message}
                  onChange={(e) => {
                    setRefundOrderInfo(prev => ({
                      ...prev,
                      customer_message: e.target.value
                    }));
                  }}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Hình ảnh liên quan</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {refundOrderInfo.url_images_related?.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                        alt={`Ảnh ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                        onClick={() => {
                          setSelectedImage(typeof image === 'string' ? image : URL.createObjectURL(image));
                          setShowImageDialog(true);
                        }}
                      />
                      <button
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setRefundOrderInfo(prev => ({
                            ...prev,
                            url_images_related: prev.url_images_related?.filter((_, i) => i !== index) || null
                          }));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(!refundOrderInfo.url_images_related || refundOrderInfo.url_images_related.length < 10) && (
                    <div
                      className="w-full h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors"
                      onClick={() => document.getElementById('refund-image-upload')?.click()}
                    >
                      <Plus className="w-6 h-6 text-gray-400" />
                      <input
                        id="refund-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setRefundOrderInfo(prev => ({
                              ...prev,
                              url_images_related: [...(prev.url_images_related || []), file] as (string | File)[]
                            }));
                          }
                          e.target.value = '';
                        }}
                      />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">Tối đa 10 ảnh. Nhấn vào ảnh để xem chi tiết.</p>
              </div>

              {/* Address Selection */}
              <div className="space-y-2">
                <Label>Địa chỉ lấy hàng hoàn trả</Label>
                <Select
                  onValueChange={(value) => {
                    setRefundOrderInfo(prev => ({
                      ...prev,
                      customer_shipping_address_id: value
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn địa chỉ lấy hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {addressesInfo.map((address) => (
                      <SelectItem key={address.id} value={address.id}>
                        {address.address_name} - {address.address_detail}, {address.ward_name}, {address.district_name}, {address.province_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="flex space-x-2 justify-end">
              <Button variant="outline" onClick={() => setShowRefundOrderDialog(false)}>
                Đóng
              </Button>
              <Button
                variant="destructive"
                onClick={() => refundOrder(refundOrderInfo)}
                disabled={!refundOrderInfo.items.length || !refundOrderInfo.customer_message || !refundOrderInfo.customer_shipping_address_id}
              >
                Xác nhận hoàn trả
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[100vh]">
            <DialogHeader>
              <DialogTitle>Đánh giá sản phẩm</DialogTitle>
              <DialogDescription>
                Đơn hàng #{selectedOrderToReview?.id} - Đặt ngày {selectedOrderToReview && new Date(selectedOrderToReview.createdAt).toLocaleDateString('vi-VN')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((item, index) => {
                    // Check if product has been reviewed
                    const existingReview = orderReviews.find(review => review.product_id === item.product_id);

                    return (
                      <div key={item.id} className="border-b pb-4 mb-4 last:border-b-0">
                        <div className="flex gap-4">
                          <img
                            src={item.product_url_image || '/default-product.png'}
                            alt={item.product_name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product_name}</h4>
                            <p className="text-sm text-gray-600">Số lượng: {item.product_quantity}</p>
                            <p className="text-sm text-gray-600">Giá: {formatPrice(item.product_price)}đ</p>
                          </div>
                        </div>

                        {existingReview ? (
                          <div className="mt-4 space-y-4">
                            <div className="flex items-start gap-4">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src="/default-avatar.png" />
                                <AvatarFallback>A</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{existingReview.user_fullname}</p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(existingReview.createdAt).toLocaleDateString('vi-VN')}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={cn(
                                        "h-4 w-4",
                                        star <= existingReview.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                                      )}
                                    />
                                  ))}
                                </div>
                                <p className="mt-2">{existingReview.comment}</p>
                                {existingReview.url_images_related && existingReview.url_images_related.length > 0 && (
                                  <div className="mt-2 flex gap-2 flex-wrap">
                                    {existingReview.url_images_related.map((url, index) => (
                                      <img
                                        key={index}
                                        src={url}
                                        alt={`Review image ${index + 1}`}
                                        className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                                        onClick={() => {
                                          setSelectedImage(url);
                                          setShowImageDialog(true);
                                        }}
                                      />
                                    ))}
                                  </div>
                                )}

                                {existingReview.response_review && (
                                  <div className="mt-4 pl-4 border-l-2 border-gray-200">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-medical-blue">Phản hồi từ {existingReview.response_review.seller_name}</p>
                                      <p className="text-sm text-gray-500">
                                        {new Date(existingReview.response_review.createdAt).toLocaleDateString('vi-VN')}
                                      </p>
                                    </div>
                                    <p className="mt-1">{existingReview.response_review.response_comment}</p>
                                    {existingReview.response_review.url_image_related && (
                                      <img
                                        src={existingReview.response_review.url_image_related}
                                        alt="Response image"
                                        className="mt-2 w-24 h-24 object-cover rounded-lg"
                                      />
                                    )}
                                  </div>
                                )}

                                {!existingReview.is_edited && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => handleEditReview(existingReview)}
                                  >
                                    Chỉnh sửa
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 space-y-4">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    "h-6 w-6 cursor-pointer",
                                    star <= reviewItems[index]?.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                                  )}
                                  onClick={() => {
                                    const newReviewItems = [...reviewItems];
                                    newReviewItems[index] = {
                                      ...newReviewItems[index],
                                      rating: star
                                    };
                                    setReviewItems(newReviewItems);
                                  }}
                                />
                              ))}
                            </div>

                            <Textarea
                              placeholder="Viết đánh giá của bạn..."
                              value={reviewItems[index]?.comment}
                              onChange={(e) => {
                                const newReviewItems = [...reviewItems];
                                newReviewItems[index] = {
                                  ...newReviewItems[index],
                                  comment: e.target.value
                                };
                                setReviewItems(newReviewItems);
                              }}
                            />

                            <div className="space-y-2">
                              <Label>Hình ảnh liên quan</Label>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {reviewItems[index]?.images.map((image, imageIndex) => (
                                  <div key={imageIndex} className="relative group">
                                    <img
                                      src={URL.createObjectURL(image)}
                                      alt={`Ảnh ${imageIndex + 1}`}
                                      className="w-full h-24 object-cover rounded-lg"
                                      onClick={() => {
                                        setSelectedImage(URL.createObjectURL(image));
                                        setShowImageDialog(true);
                                      }}
                                    />
                                    <button
                                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => {
                                        const newReviewItems = [...reviewItems];
                                        newReviewItems[index] = {
                                          ...newReviewItems[index],
                                          images: newReviewItems[index].images.filter((_, i) => i !== imageIndex)
                                        };
                                        setReviewItems(newReviewItems);
                                      }}
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                                {(!reviewItems[index]?.images || reviewItems[index]?.images.length < 10) && (
                                  <div
                                    className="w-full h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors"
                                    onClick={() => document.getElementById(`review-image-upload-${index}`)?.click()}
                                  >
                                    <Plus className="w-6 h-6 text-gray-400" />
                                    <input
                                      id={`review-image-upload-${index}`}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const newReviewItems = [...reviewItems];
                                          newReviewItems[index] = {
                                            ...newReviewItems[index],
                                            images: [...(newReviewItems[index].images || []), file]
                                          };
                                          setReviewItems(newReviewItems);
                                        }
                                        e.target.value = '';
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">Tối đa 10 ảnh. Nhấn vào ảnh để xem chi tiết.</p>
                            </div>

                            <Button
                              className="mt-2"
                              disabled={isLoadingSubmitReview && productsSelectedToReview.includes(item.product_id)}
                              onClick={() => {
                                setProductsSelectedToReview([...productsSelectedToReview, item.product_id]);

                                const submitReviewData: submitReviewData = {
                                  user_id: user.id,
                                  user_fullname: user.fullname,
                                  order_id: selectedOrderToReview?.id || '',
                                  product_id: item.product_id,
                                  rating: reviewItems[index]?.rating,
                                  comment: reviewItems[index]?.comment,
                                  images: reviewItems[index]?.images || []
                                }

                                submitReview(submitReviewData);
                              }}
                            >
                              Gửi đánh giá
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Review Dialog */}
        <Dialog open={showEditReviewDialog} onOpenChange={setShowEditReviewDialog}>
          <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[100vh]">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa đánh giá</DialogTitle>
              <DialogDescription>
                Đơn hàng #{editingReview?.review?.order_id} - Đặt ngày {editingReview && new Date(editingReview.review.createdAt).toLocaleDateString('vi-VN')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {editingReview && (
                <div className="space-y-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-6 w-6 cursor-pointer",
                          star <= editingReview.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                        )}
                        onClick={() => {
                          setEditingReview({
                            ...editingReview,
                            rating: star
                          });
                        }}
                      />
                    ))}
                  </div>

                  <Textarea
                    placeholder="Viết đánh giá của bạn..."
                    value={editingReview.comment}
                    onChange={(e) => {
                      setEditingReview({
                        ...editingReview,
                        comment: e.target.value
                      });
                    }}
                  />

                  <div className="space-y-2">
                    <Label>Hình ảnh liên quan</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {editingReview.images.map((image, imageIndex) => (
                        <div key={imageIndex} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Ảnh mới ${imageIndex + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                            onClick={() => {
                              setSelectedImage(URL.createObjectURL(image));
                              setShowImageDialog(true);
                            }}
                          />
                          <button
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setEditingReview({
                                ...editingReview,
                                images: editingReview.images.filter((_, i) => i !== imageIndex)
                              });
                            }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {(!editingReview.images || editingReview.images.length < 10) && (
                        <div
                          className="w-full h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors"
                          onClick={() => document.getElementById('edit-review-image-upload')?.click()}
                        >
                          <Plus className="w-6 h-6 text-gray-400" />
                          <input
                            id="edit-review-image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setEditingReview({
                                  ...editingReview,
                                  images: [...editingReview.images, file]
                                });
                              }
                              e.target.value = '';
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">Tối đa 10 ảnh. Nhấn vào ảnh để xem chi tiết.</p>

                    {editingReview.review.url_images_related && editingReview.review.url_images_related.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-2">Ảnh hiện tại:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {editingReview.review.url_images_related.map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Ảnh hiện tại ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg cursor-pointer"
                              onClick={() => {
                                setSelectedImage(url);
                                setShowImageDialog(true);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    disabled={isLoadingSubmitReview}
                    onClick={submitEditReview}
                  >
                    {isLoadingSubmitReview ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang cập nhật...
                      </span>
                    ) : (
                      'Cập nhật đánh giá'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );

  const renderOrderReturnContent = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng hoàn trả</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="order-return-requests" value={activeOrderReturnTab} onValueChange={setActiveOrderReturnTab} className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="order-return-requests" className="flex-1 relative mr-2 border-2 border-grey-300">Yêu cầu hoàn trả <span className="absolute -top-2 -right-2 text-red-500 px-2 py-1 text-lg">{orderReturnRequests.length}</span></TabsTrigger>
              <TabsTrigger value="returned-orders" className="flex-1 relative mr-2 border-2 border-grey-300">Đơn hàng hoàn trả <span className="absolute -top-2 -right-2 text-red-500 px-2 py-1 text-lg">{returnedOrders.length}</span></TabsTrigger>
            </TabsList>

            {/* Order Return Requests Tab */}
            <TabsContent value="order-return-requests" className="space-y-4">
              {orderReturnRequests.length > 0 ? (
                orderReturnRequests.map((request) => (
                  <Card key={request.id} className="border hover:border-primary-500 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex flex-col-reverse md:flex-row md:items-center justify-between mb-4">
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-2 md:mt-0">
                          <span className="font-medium">Đơn hàng gốc #{request.Order.id}</span>
                          <span className="text-sm text-gray-500">{new Date(request.request_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getReturnRequestStatusColor(request.status)}>
                            {getReturnRequestStatusText(request.status)}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Lý do hoàn trả:</span> {request.reason}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Phí vận chuyển:</span> {request.return_shipping_fee_paid_by === 'seller' ? 'Nhà bán thanh toán' : 'Người mua thanh toán'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Ghi chú:</span> {request.customer_message}
                        </p>
                        {request.response_message && <p className={`text-sm ${request.status === 'accepted' ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="font-medium">Trả lời từ nhà bán:</span> {request.response_message}
                        </p>}
                        {!request.response_message && <p className="text-sm text-yellow-600">
                          <span>Đang chờ phản hồi</span>
                        </p>}
                      </div>

                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewReturnRequestDetail(request)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Chi tiết
                        </Button>
                        {request.status === 'requested' && (
                          <Button variant="destructive" size="sm" onClick={() => handleCancelReturnRequest(request.id)}>
                            <Trash className="w-4 h-4 mr-1" />
                            Hủy yêu cầu
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Không có yêu cầu hoàn trả nào
                </div>
              )}
            </TabsContent>

            {/* Cancel Return Request Dialog */}
            <Dialog open={showCancelReturnRequestDialog} onOpenChange={setShowCancelReturnRequestDialog}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Hủy yêu cầu hoàn trả</DialogTitle>
                  <DialogDescription>
                    Bạn có chắc chắn muốn hủy yêu cầu hoàn trả này không? Hành động này không thể hoàn tác.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex space-x-2 justify-end">
                  <Button variant="outline" onClick={() => setShowCancelReturnRequestDialog(false)}>
                    Đóng
                  </Button>
                  <Button variant="destructive" onClick={() => cancelReturnRequest(selectedReturnRequestToCancel)}>
                    Xác nhận hủy
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Returned Orders Tab */}
            <TabsContent value="returned-orders" className="space-y-4">
              {returnedOrders.length > 0 ? (
                returnedOrders.map((order) => (
                  <Card key={order.id} className="border hover:border-primary-500 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex flex-col-reverse md:flex-row md:items-center justify-between mb-4">
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-2 md:mt-0">
                          <span className="font-medium">Đơn hoàn trả #{order.id}</span>
                          <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getReturnedOrderStatusColor(order.order_status)}>
                            {getReturnedOrderStatusText(order.order_status)}
                          </Badge>
                          <Badge>
                            {getPaymentStatusText(order.payment_refund_status, true)}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Đơn hàng gốc:</span> #{order.order_id}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Nhà bán:</span> <span onClick={() => handleClickStore(order.seller_id)} className="text-blue-500 cursor-pointer font-bold">{order.seller_name}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Số lượng:</span> {order.total_quantity} sản phẩm
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Phí vận chuyển hoàn trả:</span> {formatPrice(order.return_shipping_fee)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Số tiền hoàn trả:</span> {formatPrice(order.refund_amount)}
                        </p>
                      </div>

                      <div className="flex items-center justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleViewReturnedOrderDetail(order)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Chi tiết
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Không có đơn hàng hoàn trả nào
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Return Request Detail Dialog */}
          <Dialog open={showReturnRequestDialog} onOpenChange={setShowReturnRequestDialog}>
            <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[100vh]">
              <DialogHeader>
                <DialogTitle>Chi tiết yêu cầu hoàn trả (Đơn hàng #{selectedReturnRequest?.order_id})</DialogTitle>
                <DialogDescription>
                  Yêu cầu ngày {selectedReturnRequest && new Date(selectedReturnRequest.request_at).toLocaleDateString('vi-VN')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Request Status */}
                <div className="bg-gray-50 rounded-lg">
                  <Badge className={getReturnRequestStatusColor(selectedReturnRequest?.status)}>
                    {getReturnRequestStatusText(selectedReturnRequest?.status)}
                  </Badge>
                </div>

                {/* Request Details */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Lý do hoàn trả:</span> {selectedReturnRequest?.reason}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Phí vận chuyển:</span> {selectedReturnRequest?.return_shipping_fee_paid_by === 'seller' ? 'Nhà bán thanh toán' : 'Người mua thanh toán'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Ghi chú:</span> {selectedReturnRequest?.customer_message}
                  </p>
                  {selectedReturnRequest?.response_message && (
                    <p className={`text-sm ${selectedReturnRequest.status === 'accepted' ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="font-medium">Trả lời từ nhà bán:</span> {selectedReturnRequest.response_message}
                    </p>
                  )}
                </div>

                {/* Related Images */}
                {selectedReturnRequest?.url_images_related && selectedReturnRequest.url_images_related.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Hình ảnh liên quan</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedReturnRequest.url_images_related.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Ảnh ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg cursor-pointer"
                          onClick={() => {
                            setSelectedImage(image);
                            setShowImageDialog(true);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="font-medium">Sản phẩm hoàn trả</h4>
                    {orderReturnRequestItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
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
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowReturnRequestDialog(false)}>
                  Đóng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Returned Order Detail Dialog */}
          <Dialog open={showReturnedOrderDialog} onOpenChange={setShowReturnedOrderDialog}>
            <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[100vh]">
              <DialogHeader>
                <DialogTitle>Chi tiết đơn hoàn trả #{selectedReturnedOrder?.id}</DialogTitle>
                <DialogDescription>
                  Tạo ngày {selectedReturnedOrder && new Date(selectedReturnedOrder.createdAt).toLocaleDateString('vi-VN')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Order Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Trạng thái đơn hoàn trả</p>
                      <Badge className={getReturnedOrderStatusColor(selectedReturnedOrder?.order_status)}>
                        {getReturnedOrderStatusText(selectedReturnedOrder?.order_status)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Trạng thái hoàn tiền</p>
                      <Badge>
                        {getPaymentStatusText(selectedReturnedOrder?.payment_refund_status, true)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="font-medium">Sản phẩm hoàn trả</h4>
                    {returnedOrderItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
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
                  </div>
                )}

                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Phí vận chuyển hoàn trả</span>
                    {selectedReturnedOrder?.return_shipping_fee_paid_by === 'seller' && <span className="text-sm text-blue-500">Do nhà bán trả</span>}
                    {selectedReturnedOrder?.return_shipping_fee_paid_by === 'customer' && <span className="text-sm text-blue-500">Do khách hàng trả</span>}
                    {selectedReturnedOrder?.return_shipping_fee_paid_by === 'platform' && <span className="text-sm text-blue-500">Do sàn trả</span>}
                    <span>{formatPrice(selectedReturnedOrder?.return_shipping_fee || 0)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Tổng tiền hoàn trả <span className="text-sm text-gray-500">(Đã trừ voucher)</span></span>
                    <span className="text-medical-red">{formatPrice(selectedReturnedOrder?.refund_amount || 0)}</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowReturnedOrderDialog(false)}>
                  Đóng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    )
  }

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

      case 'order-return':
        return renderOrderReturnContent();

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
    if (!isLoggedIn) return;

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

  const handleClickStore = (seller_id: string) => {
    navigate(`/stores/${seller_id}`, { state: { tab: 'orders' } });
  }

  const handleRefundOrder = async (order: Order) => {
    setRefundOrderInfo({
      order_id: order.id,
      reason: '',
      customer_message: '',
      customer_shipping_address_id: '',
      items: [],
      url_images_related: null
    });
    setShowRefundOrderDialog(true);

    setIsLoading(true);

    //lấy các sản phẩm hiện trong đơn hàng để chọn hoàn trả
    try {
      const response = await orderApi.get(`/orders/details/${order.id}`);
      if (response.data.code === 0) {
        const orderItems = response.data.data;
        setCurrentOrderItems(orderItems);
      }
    } catch (error) {
      toast({
        variant: 'error',
        description: error.response.data.message || error.message,
      });
    }
    setIsLoading(false);
  }

  const refundOrder = (refundOrderInfo: RefundOrderInfo) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('order_id', refundOrderInfo.order_id);
    formData.append('reason', refundOrderInfo.reason);
    formData.append('customer_message', refundOrderInfo.customer_message);
    formData.append('customer_shipping_address_id', refundOrderInfo.customer_shipping_address_id);
    formData.append('items', JSON.stringify(refundOrderInfo.items));

    if (refundOrderInfo.url_images_related) {
      refundOrderInfo.url_images_related.forEach((image) => {
        if (image && typeof image !== 'string') {
          formData.append('image_related', image);
        }
      });
    }

    orderApi.post(`/order-returns/request/${refundOrderInfo.order_id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then((response) => {
        if (response.data.code === 0) {
          setShowRefundOrderDialog(false);
          setRefundOrderInfo({
            order_id: '',
            reason: '',
            customer_message: '',
            customer_shipping_address_id: '',
            items: [],
            url_images_related: null
          });

          toast({
            variant: 'success',
            description: response.data.message,
          });

          fetchOrderReturnRequests();
          fetchReturnedOrders();
          setActiveTab('order-return');
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

  const fetchOrders = () => {
    if (!isLoggedIn) return;

    setIsLoading(true);

    orderApi.get(`/orders?user_id=${user.id}`)
      .then((response) => {
        if (response.data.code === 0) {
          const orders = response.data.data;
          setOrders(orders);
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
          const cancelledOrder = response.data.data;
          cancelledOrder.payment_status = 'cancelled';
          setOrders(prev => prev.map(order => order.id === cancelledOrder.id ? cancelledOrder : order));

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

  const handlePayOrder = (order: Order) => {
    if (order.payment_method.toUpperCase() === 'VNPAY') {
      handleVNPayPayment(order);
    }
  }

  const handleVNPayPayment = (order: Order) => {
    const body = {
      user_id: user.id,
      order_id: order.id,
      seller_id: order.seller_id,
      amount: order.final_total,
      bankCode: 'VNBANK',
      language: 'vn',
    }

    setIsLoadingPayOrder(true);

    paymentApi.post(`/payments/vnpay/create_payment_url`, body)
      .then((response) => {
        if (response.data.code === 0) {
          const data = response.data.data;
          const { url, payment } = data;
          // chuyển hướng tới trang thanh toán
          window.location.href = url;
        }
      })
      .catch((error) => {
        toast({
          variant: 'error',
          description: error.response.data.message || error.message,
        });
      })
      .finally(() => {
        setIsLoadingPayOrder(false);
      });
  }

  const fetchOrderReturnRequests = () => {
    if (!isLoggedIn) return;

    setIsLoading(true);
    orderApi.get(`/order-returns/requests?user_id=${user.id}`)
      .then((response) => {
        if (response.data.code === 0) {
          const orderReturnRequests = response.data.data;
          setOrderReturnRequests(orderReturnRequests);
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

  const fetchReturnedOrders = () => {
    if (!isLoggedIn) return;

    orderApi.get(`/order-returns/returned-orders?user_id=${user.id}`)
      .then((response) => {
        if (response.data.code === 0) {
          const returnedOrders = response.data.data;
          setReturnedOrders(returnedOrders);
        }
      })
      .catch((error) => {
        toast({
          variant: 'error',
          description: error.response.data.message || error.message,
        });
      });
  }

  const handleViewReturnRequestDetail = (request: OrderReturnRequest) => {
    setSelectedReturnRequest(request);
    setShowReturnRequestDialog(true);

    setIsLoading(true);

    const params = {
      order_return_request_id: request.id,
    }

    orderApi.get(`/order-returns/request/details`, { params })
      .then((response) => {
        if (response.data.code === 0) {
          const orderReturnRequestItems = response.data.data;
          setOrderReturnRequestItems(orderReturnRequestItems);
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

  const handleViewReturnedOrderDetail = (returnedOrder: ReturnedOrder) => {
    setSelectedReturnedOrder(returnedOrder);
    setShowReturnedOrderDialog(true);

    setIsLoading(true);

    const params = {
      returned_order_id: returnedOrder.id,
    }

    orderApi.get(`/order-returns/returned-order/details`, { params })
      .then((response) => {
        if (response.data.code === 0) {
          const returnedOrderItems = response.data.data;
          setReturnedOrderItems(returnedOrderItems);
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

  const handleCancelReturnRequest = (request_id: string) => {
    setSelectedReturnRequestToCancel(request_id);
    setShowCancelReturnRequestDialog(true);
  }

  const cancelReturnRequest = (request_id: string) => {
    orderApi.delete(`/order-returns/request/${request_id}`)
      .then((response) => {
        if (response.data.code === 0) {
          setOrderReturnRequests(prev => prev.filter(request => request.id !== request_id));

          setShowCancelReturnRequestDialog(false);
          setSelectedReturnRequestToCancel(null);

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
    fetchAddresses();
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
                    {/* <p className="text-sm text-gray-600">{userInfo.email}</p> */}
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

        {/* Image Dialog */}
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent className="sm:max-w-[800px] p-0">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Chi tiết ảnh"
                className="w-full h-auto"
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Tracking Dialog */}
        <Dialog open={!!orderShipment} onOpenChange={(open) => !open && setOrderShipment(null)}>
          <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[100vh]">
            <DialogHeader>
              <DialogTitle>Theo dõi đơn hàng</DialogTitle>
              <DialogDescription>
                Mã vận đơn: {orderShipment?.tracking_number}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Current Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                {[SHIPPING_STATUS.WAITING_FOR_PICKUP, SHIPPING_STATUS.PICKED_UP, SHIPPING_STATUS.IN_TRANSIT, SHIPPING_STATUS.OUT_FOR_DELIVERY, SHIPPING_STATUS.DELIVERED].includes(orderShipment?.current_status) ? (
                  <div className="space-y-4">
                    {/* Progress Points */}
                    <div className="relative">
                      {/* Connecting Line */}
                      <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-200"></div>

                      {/* Progress Line */}
                      <div
                        className="absolute top-5 left-0 h-[2px] bg-medical-blue transition-all duration-300"
                        style={{
                          width: orderShipment?.current_status === SHIPPING_STATUS.WAITING_FOR_PICKUP ? '0%' :
                            orderShipment?.current_status === SHIPPING_STATUS.PICKED_UP ? '25%' :
                              orderShipment?.current_status === SHIPPING_STATUS.IN_TRANSIT ? '50%' :
                                orderShipment?.current_status === SHIPPING_STATUS.OUT_FOR_DELIVERY ? '75%' :
                                  orderShipment?.current_status === SHIPPING_STATUS.DELIVERED ? '100%' : '0%'
                        }}
                      ></div>

                      {/* Points */}
                      <div className="relative z-10 flex justify-between">
                        {/* Waiting for Pickup */}
                        <div className="flex flex-col items-center gap-2">
                          <div className={cn(
                            "w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white",
                            orderShipment?.current_status === SHIPPING_STATUS.WAITING_FOR_PICKUP ? "border-medical-blue" :
                              ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(orderShipment?.current_status) ? "border-medical-blue bg-medical-blue" : "border-gray-300"
                          )}>
                            {["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(orderShipment?.current_status) ? (
                              <Check className="w-5 h-5 text-white" />
                            ) : (
                              <div className={cn(
                                "w-3 h-3 rounded-full",
                                orderShipment?.current_status === SHIPPING_STATUS.WAITING_FOR_PICKUP ? "bg-medical-blue" : "bg-gray-300"
                              )}></div>
                            )}
                          </div>
                          <span className={cn(
                            "text-xs text-center",
                            orderShipment?.current_status === SHIPPING_STATUS.WAITING_FOR_PICKUP ? "text-medical-blue font-medium" : "text-gray-500"
                          )}>Chờ lấy hàng</span>
                        </div>

                        {/* Picked Up */}
                        <div className="flex flex-col items-center gap-2">
                          <div className={cn(
                            "w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white",
                            orderShipment?.current_status === SHIPPING_STATUS.PICKED_UP ? "border-medical-blue" :
                              ["IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(orderShipment?.current_status) ? "border-medical-blue bg-medical-blue" : "border-gray-300"
                          )}>
                            {["IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(orderShipment?.current_status) ? (
                              <Check className="w-5 h-5 text-white" />
                            ) : (
                              <div className={cn(
                                "w-3 h-3 rounded-full",
                                orderShipment?.current_status === SHIPPING_STATUS.PICKED_UP ? "bg-medical-blue" : "bg-gray-300"
                              )}></div>
                            )}
                          </div>
                          <span className={cn(
                            "text-xs text-center",
                            orderShipment?.current_status === SHIPPING_STATUS.PICKED_UP ? "text-medical-blue font-medium" : "text-gray-500"
                          )}>Lấy hàng thành công</span>
                        </div>

                        {/* In Transit */}
                        <div className="flex flex-col items-center gap-2">
                          <div className={cn(
                            "w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white",
                            orderShipment?.current_status === SHIPPING_STATUS.IN_TRANSIT ? "border-medical-blue" :
                              ["OUT_FOR_DELIVERY", "DELIVERED"].includes(orderShipment?.current_status) ? "border-medical-blue bg-medical-blue" : "border-gray-300"
                          )}>
                            {["OUT_FOR_DELIVERY", "DELIVERED"].includes(orderShipment?.current_status) ? (
                              <Check className="w-5 h-5 text-white" />
                            ) : (
                              <div className={cn(
                                "w-3 h-3 rounded-full",
                                orderShipment?.current_status === SHIPPING_STATUS.IN_TRANSIT ? "bg-medical-blue" : "bg-gray-300"
                              )}></div>
                            )}
                          </div>
                          <span className={cn(
                            "text-xs text-center",
                            orderShipment?.current_status === SHIPPING_STATUS.IN_TRANSIT ? "text-medical-blue font-medium" : "text-gray-500"
                          )}>Đang vận chuyển</span>
                        </div>

                        {/* Out for Delivery */}
                        <div className="flex flex-col items-center gap-2">
                          <div className={cn(
                            "w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white",
                            orderShipment?.current_status === SHIPPING_STATUS.OUT_FOR_DELIVERY ? "border-medical-blue" :
                              ["DELIVERED"].includes(orderShipment?.current_status) ? "border-medical-blue bg-medical-blue" : "border-gray-300"
                          )}>
                            {["DELIVERED"].includes(orderShipment?.current_status) ? (
                              <Check className="w-5 h-5 text-white" />
                            ) : (
                              <div className={cn(
                                "w-3 h-3 rounded-full",
                                orderShipment?.current_status === SHIPPING_STATUS.OUT_FOR_DELIVERY ? "bg-medical-blue" : "bg-gray-300"
                              )}></div>
                            )}
                          </div>
                          <span className={cn(
                            "text-xs text-center",
                            orderShipment?.current_status === SHIPPING_STATUS.OUT_FOR_DELIVERY ? "text-medical-blue font-medium" : "text-gray-500"
                          )}>Đang giao hàng</span>
                        </div>

                        {/* Delivered */}
                        <div className="flex flex-col items-center gap-2">
                          <div className={cn(
                            "w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white",
                            orderShipment?.current_status === SHIPPING_STATUS.DELIVERED ? "border-medical-blue bg-medical-blue" : "border-gray-300"
                          )}>
                            {orderShipment?.current_status === SHIPPING_STATUS.DELIVERED ? (
                              <Check className="w-5 h-5 text-white" />
                            ) : (
                              <div className={cn(
                                "w-3 h-3 rounded-full",
                                "bg-gray-300"
                              )}></div>
                            )}
                          </div>
                          <span className={cn(
                            "text-xs text-center",
                            orderShipment?.current_status === SHIPPING_STATUS.DELIVERED ? "text-medical-blue font-medium" : "text-gray-500"
                          )}>Đã giao hàng</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-medical-red" />
                    <span className="font-medium text-medical-red">
                      {orderShipment?.current_status === SHIPPING_STATUS.IN_WAREHOUSE ? 'Đang trong kho' :
                        orderShipment?.current_status === SHIPPING_STATUS.PICKUP_FAILED ? 'Lấy hàng thất bại' :
                          orderShipment?.current_status === SHIPPING_STATUS.DELIVERY_FAILED ? 'Giao hàng thất bại' :
                            orderShipment?.current_status === SHIPPING_STATUS.RETURNING ? 'Đang hoàn trả' :
                              orderShipment?.current_status === SHIPPING_STATUS.RETURNED ? 'Đã hoàn trả' :
                                orderShipment?.current_status === SHIPPING_STATUS.CANCELLED ? 'Đã hủy' :
                                  orderShipment?.current_status === SHIPPING_STATUS.LOST ? 'Mất hàng' :
                                    orderShipment?.current_status === SHIPPING_STATUS.DAMAGED ? 'Hàng bị hỏng' :
                                      orderShipment?.current_status === SHIPPING_STATUS.ON_HOLD ? 'Đang chờ' :

                                        'Đang xử lý'}
                    </span>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                {orderShipment?.progress.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((progress, index) => (
                  <div key={index} className="relative flex items-start">
                    {/* Timestamp */}
                    <div className="w-32 pr-4 text-right text-sm">
                      <div className="font-medium">
                        {new Date(progress.timestamp).toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="text-gray-500">
                        {new Date(progress.timestamp).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                    </div>

                    <div className="relative flex-1 pl-6 pb-4 last:pb-0">
                      {/* Line */}
                      <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-gray-200"></div>

                      {/* Dot */}
                      <div className={cn(
                        "absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white z-10",
                        index === 0 ? "border-medical-blue" : "border-gray-300"
                      )}>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          index === 0 ? "bg-medical-blue" : "bg-gray-300"
                        )}></div>
                      </div>

                      {/* Content */}
                      <div className={cn(
                        "ml-2",
                        index === 0 ? "text-medical-blue" : "text-gray-600"
                      )}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{progress.location}</span>
                        </div>
                        <p className={cn(
                          "text-sm mt-1",
                          index === 0 ? "text-medical-blue" : "text-gray-500"
                        )}>{progress.note}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOrderShipment(null)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Profile;