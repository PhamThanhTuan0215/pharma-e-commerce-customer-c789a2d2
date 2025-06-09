import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Star, Package, Shield, Truck, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import productApi from '@/services/api-product-service';
import customerApi from '@/services/api-customer-service';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProductComponent {
  Tên: string;
  "Hàm lượng": string;
}

interface ProductDetails {
  [key: string]: string | ProductComponent[];
}

interface Product {
  id: string;
  name: string;
  brand: string;
  retail_price: number;
  stock: number;
  seller_id: string;
  seller_name: string;
  url_image: string;
  url_images: string[];
  product_details: ProductDetails;
}

const ProductDetail = () => {
  const { tab, _selectedOrder } = useLocation().state || { tab: 'profile', _selectedOrder: null };

  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReviewToRemove, setSelectedReviewToRemove] = useState<string | null>(null);
  const [showRemoveReviewDialog, setShowRemoveReviewDialog] = useState(false);

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  const detailsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollToSection = (sectionId: string) => {
    if (detailsRef.current[sectionId]) {
      const headerOffset = 200; // Điều chỉnh offset này tùy theo chiều cao của header
      const elementPosition = detailsRef.current[sectionId]?.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const fetchProduct = async () => {
    setIsLoading(true);
    productApi.get(`/products/display-for-customer/${id}`)
      .then((response) => {
        if (response.data.code === 0) {
          const productData = response.data.data;
          setProduct(productData);
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
  };

  const fetchReviews = async () => {
    productApi.get(`/reviews/${id}`)
      .then((response) => {
        if (response.data.code === 0) {
          const reviews = response.data.data;
          setReviews(reviews);
        }
      })
      .catch((error) => {
        toast({
          variant: 'error',
          description: error.response.data.message || error.message,
        });
      });
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleSubmitReview = () => {
    if (!isLoggedIn) {
      toast({
        variant: 'error',
        description: 'Vui lòng đăng nhập để đánh giá sản phẩm',
      });
      return;
    }

    if (reviewText.length < 5) {
      toast({
        variant: 'error',
        description: 'Nhận xét phải có ít nhất 5 ký tự',
      });
      return;
    }

    const params = {
      user_id: user.id,
      user_fullname: user.fullname,
    }

    const payload = {
      rating: reviewRating,
      comment: reviewText,
    }

    productApi.post(`/reviews/add/${id}`, payload, { params })
      .then((response) => {
        if (response.data.code === 0) {
          const newReview = response.data.data;
          // cập nhật lại review nếu đã tồn tại hoặc thêm mới nếu chưa tồn tại
          const existingReview = reviews.find((review) => review.id === newReview.id);
          if (existingReview) {
            const updatedReviews = reviews.map((review) => review.id === newReview.id ? newReview : review);
            setReviews(updatedReviews);
          } else {
            setReviews([newReview, ...reviews]);
          }

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

    setReviewText('');
    setReviewRating(5);
  };

  const confirmRemoveReview = (reviewId: string) => {
    setSelectedReviewToRemove(reviewId);
    setShowRemoveReviewDialog(true);
  };

  const removeReview = (reviewId: string) => {
    productApi.delete(`/reviews/delete/${reviewId}?user_id=${user.id}`)
      .then((response) => {
        if (response.data.code === 0) {
          setReviews(reviews.filter((review) => review.id !== reviewId));
          setShowRemoveReviewDialog(false);

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

  const getProductDetail = (key: string): string => {
    const value = product?.product_details[key];
    return typeof value === 'string' ? value : '';
  };

  const handleAddToCart = () => {
    const payload = {
      user_id: user.id,
      product_id: product.id,
      product_name: product.name,
      product_url_image: product.url_image,
      price: product.retail_price,
      seller_id: product.seller_id,
      seller_name: product.seller_name,
      quantity: quantity
    }

    customerApi.post(`/carts/add`, payload)
      .then((response) => {
        if (response.data.code === 0) {
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onMenuClick={() => { }} />
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onMenuClick={() => { }} />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy sản phẩm</h2>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => { }} />

      <div className="container mx-auto px-4 py-6">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => {
            if (tab === 'orders') {
              navigate('/profile', { state: { tab: 'orders', _selectedOrder: _selectedOrder } });
            }
            else {
              navigate(-1);
            }
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-white">
              <img
                src={product.url_image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* <div className="grid grid-cols-3 gap-2">
              {product.url_images.map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg bg-white border-2 border-gray-200">
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                  />
                </div>
              ))}
            </div> */}
          </div>

          {/* Product info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">
                    Thương hiệu: &nbsp;
                  </span>
                  <span className="text-sm font-bold text-blue-500">
                    {product.brand}
                  </span>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">{getProductDetail("Tên hiển thị") || product.name}</h1>

              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-medical-red">
                  {formatPrice(product.retail_price)}
                </span>
              </div>

              {getProductDetail("Đơn vị tính") && (
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">
                      Đơn vị tính: &nbsp;
                      <span className="text-sm font-bold rounded-full border-2 border-blue-300 px-2 py-1">
                        {getProductDetail("Đơn vị tính")}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {getProductDetail("Quy cách") && (
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">
                      Quy cách: &nbsp;
                      <span className="text-sm font-bold">
                        {getProductDetail("Quy cách")}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {getProductDetail("Dạng bào chế") && (
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">
                      Dạng bào chế: &nbsp;
                      <span className="text-sm font-bold">
                        {getProductDetail("Dạng bào chế")}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {getProductDetail("Nhà sản xuất") && (
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">
                      Nhà sản xuất: &nbsp;
                      <span className="text-sm font-bold">
                        {getProductDetail("Nhà sản xuất")}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {getProductDetail("Nước sản xuất") && (
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">
                      Nước sản xuất: &nbsp;
                      <span className="text-sm font-bold">
                        {getProductDetail("Nước sản xuất")}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {getProductDetail("Xuất xứ thương hiệu") && (
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">
                      Xuất xứ thương hiệu: &nbsp;
                      <span className="text-sm font-bold">
                        {getProductDetail("Xuất xứ thương hiệu")}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {getProductDetail("Số đăng ký") && (
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">
                      Số đăng ký: &nbsp;
                      <span className="text-sm font-bold">
                        {getProductDetail("Số đăng ký")}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {getProductDetail("Mô tả ngắn") && (
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">
                      Mô tả ngắn: &nbsp;
                      <span className="text-sm text-black">
                        {getProductDetail("Mô tả ngắn")}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {getProductDetail("Yêu cầu kê đơn") === "Không" && (
                <div className="flex items-center space-x-4 mb-6">
                  <Badge variant="outline" className="bg-medical-green text-white">
                    Không kê đơn
                  </Badge>
                </div>
              )}

            </div>

            {/* nhà bán */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-600">
                  Nhà bán: &nbsp;
                  <span className="text-sm font-bold text-blue-500">
                    {product.seller_name}
                  </span>
                </span>
              </div>
            </div>

            {/* Quantity and actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label>Số lượng:</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm text-gray-600">
                  {product.stock} sản phẩm còn lại
                </span>
              </div>

              <div className="flex space-x-4">
                <Button disabled={product.stock === 0} onClick={handleAddToCart} className="flex-1 bg-primary-600 hover:bg-primary-700">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Thêm vào giỏ
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* Thông tin chi tiết và đánh giá */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Thông tin chi tiết */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chi tiết sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Navigation tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                {Object.keys(product.product_details).map((key) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => scrollToSection(key)}
                    className="whitespace-nowrap"
                  >
                    {key}
                  </Button>
                ))}
              </div>

              {Object.entries(product.product_details).map(([key, value]) => {
                // Xử lý đặc biệt cho trường "Thành phần" vì nó là một mảng
                if (key === "Thành phần" && Array.isArray(value)) {
                  return (
                    <div key={key} ref={el => detailsRef.current[key] = el} className="scroll-mt-4">
                      <h4 className="font-medium mb-2">{key}:</h4>
                      <table className="w-full text-left border border-gray-300 rounded-md">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="p-2 border-r border-gray-300">Tên</th>
                            <th className="p-2">Hàm lượng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(value as ProductComponent[]).map((item, index) => (
                            <tr key={index} className="border-t border-gray-200">
                              <td className="p-2 border-r border-gray-300">{item["Tên"]}</td>
                              <td className="p-2">{item["Hàm lượng"]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                return (
                  <div key={key} ref={el => detailsRef.current[key] = el} className="scroll-mt-4">
                    <h4 className="font-medium mb-2">{key}:</h4>
                    <p className="text-gray-600 whitespace-pre-line">{value as string}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Đánh giá sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* avg rating */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Đánh giá trung bình:</span>
                {reviews.length > 0 ? <span className="text-sm font-bold text-blue-500">{reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length} / 5</span> : <span className="text-sm font-bold text-blue-500">Chưa có đánh giá</span>}
              </div>

              {/* Existing reviews */}
              {reviews.length > 0 ? <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0 flex justify-between">
                    <div className="flex items-start space-x-3">
                      <Avatar>
                        <AvatarFallback>{review.user_fullname[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium">{review.user_fullname}</span>
                          {/* số sao có thể là số lẻ */}
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.round(review.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.updatedAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    </div>
                    {isLoggedIn && user.id === review.user_id && (
                      <Button variant="ghost" size="icon" onClick={() => confirmRemoveReview(review.id)}>
                        <Trash className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div> : <div className="space-y-4">
                <p className="text-gray-600">Chưa có đánh giá nào</p>
              </div>}

              {/* Write review */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Viết đánh giá</h4>
                <div className="space-y-4">
                  <div>
                    <Label>Đánh giá của bạn:</Label>
                    <div className="flex items-center space-x-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 cursor-pointer ${i < reviewRating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 hover:text-yellow-400'
                            }`}
                          onClick={() => setReviewRating(i + 1)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="review">Nhận xét:</Label>
                    <Textarea
                      id="review"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                      className="mt-2"
                    />
                  </div>
                  <Button onClick={handleSubmitReview} className="bg-primary-600 hover:bg-primary-700">
                    Gửi đánh giá
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Remove review dialog */}
          <Dialog open={showRemoveReviewDialog} onOpenChange={setShowRemoveReviewDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xóa đánh giá</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa đánh giá này không?
              </DialogDescription>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRemoveReviewDialog(false)}>Hủy</Button>
                <Button variant="destructive" onClick={() => removeReview(selectedReviewToRemove)}>Xóa</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
