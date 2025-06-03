import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Star, Package, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  // Mock product data
  const product = {
    id: id,
    name: 'Paracetamol 500mg - Hộp 100 viên',
    price: 25000,
    originalPrice: 30000,
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    rating: 4.5,
    sold: 1234,
    store: 'Nhà thuốc ABC',
    discount: 17,
    freeShipping: true,
    description: 'Paracetamol là thuốc giảm đau, hạ sốt được sử dụng rộng rãi. Thuốc có tác dụng giảm đau nhẹ đến vừa và hạ sốt hiệu quả.',
    ingredients: 'Paracetamol 500mg',
    dosage: 'Người lớn: Uống 1-2 viên mỗi lần, 3-4 lần/ngày. Không quá 8 viên/ngày.',
    contraindications: 'Không dùng cho người mẫn cảm với Paracetamol.',
    storage: 'Bảo quản nơi khô ráo, thoáng mát, tránh ánh sáng.',
    stock: 156
  };

  const reviews = [
    {
      id: 1,
      user: 'Nguyễn Văn A',
      rating: 5,
      date: '2024-01-15',
      comment: 'Thuốc rất hiệu quả, giảm đau nhanh. Đóng gói cẩn thận.',
      avatar: '/placeholder.svg'
    },
    {
      id: 2,
      user: 'Trần Thị B',
      rating: 4,
      date: '2024-01-10',
      comment: 'Chất lượng tốt, giao hàng nhanh. Sẽ mua lại.',
      avatar: '/placeholder.svg'
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleSubmitReview = () => {
    console.log('Submitting review:', { rating: reviewRating, text: reviewText });
    setReviewText('');
    setReviewRating(5);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => {}} cartCount={3} wishlistCount={5} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Back button */}
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-white">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {product.images.map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg bg-white border-2 border-gray-200">
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    ({product.rating}) • Đã bán {product.sold}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-medical-red">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <Badge className="bg-medical-red text-white">
                      -{product.discount}%
                    </Badge>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-4 mb-6">
                {product.freeShipping && (
                  <Badge className="bg-medical-green text-white">
                    <Package className="w-3 h-3 mr-1" />
                    Freeship
                  </Badge>
                )}
                <Badge variant="outline">
                  <Shield className="w-3 h-3 mr-1" />
                  Chính hãng
                </Badge>
                <Badge variant="outline">
                  <Truck className="w-3 h-3 mr-1" />
                  Giao nhanh
                </Badge>
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
                  {product.stock} sản phẩm có sẵn
                </span>
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                  Yêu thích
                </Button>
                <Button className="flex-1 bg-primary-600 hover:bg-primary-700">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Thêm vào giỏ
                </Button>
              </div>

              <Button size="lg" className="w-full bg-medical-red hover:bg-red-700">
                Mua ngay
              </Button>
            </div>

            {/* Store info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>NT</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium">{product.store}</h3>
                    <p className="text-sm text-gray-600">Online 2 giờ trước</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Chat</Button>
                    <Button variant="outline" size="sm">Xem shop</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Mô tả sản phẩm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Công dụng:</h4>
                  <p className="text-gray-600">{product.description}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Thành phần:</h4>
                  <p className="text-gray-600">{product.ingredients}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Liều dùng:</h4>
                  <p className="text-gray-600">{product.dosage}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Chống chỉ định:</h4>
                  <p className="text-gray-600">{product.contraindications}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Bảo quản:</h4>
                  <p className="text-gray-600">{product.storage}</p>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Đánh giá sản phẩm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Existing reviews */}
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <Avatar>
                          <AvatarImage src={review.avatar} />
                          <AvatarFallback>{review.user[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">{review.user}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

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
                            className={`w-6 h-6 cursor-pointer ${
                              i < reviewRating
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
          </div>

          {/* Related products */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Sản phẩm liên quan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <img
                        src="/placeholder.svg"
                        alt={`Related product ${i}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium line-clamp-2">
                          Sản phẩm liên quan {i}
                        </h4>
                        <p className="text-sm text-medical-red font-medium">
                          {formatPrice(50000 + i * 10000)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
