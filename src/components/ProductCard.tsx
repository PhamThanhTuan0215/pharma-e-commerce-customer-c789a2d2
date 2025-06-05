import React, { useState } from 'react';
import { Heart, Star, ShoppingCart, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Product {
  id: string;
  name: string;
  retail_price: number;
  url_image: string;
  seller_name: string;
  isLiked?: boolean;
  product_details: {
    [key: string]: string;
  }
}

interface ProductCardProps {
  product: Product;
  onLike?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
}

const ProductCard = ({ product, onLike, onAddToCart }: ProductCardProps) => {
  const [isLiked, setIsLiked] = useState(product.isLiked || false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike?.(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.url_image || "/default-product.png"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Like button */}
        <Button
          variant="ghost"
          size="sm"
          className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${isLiked ? 'text-red-500 bg-white/90' : 'text-gray-400 bg-white/90 hover:text-red-500'
            }`}
          onClick={handleLike}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </Button>

      </div>

      <CardContent className="p-3">
        {product.product_details?.["Tên hiển thị"] ? <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
          {product.product_details?.["Tên hiển thị"]}
        </h3> :
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        }

        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-lg font-bold text-medical-red">
              {formatPrice(product.retail_price)}
            </span>
            {product.product_details?.["Đơn vị tính"] && <span className="text-sm text-gray-500 ml-2">
              / {product.product_details?.["Đơn vị tính"]}
            </span>}
          </div>
        </div>

        {product.product_details?.["Quy cách"] && <h3 className="text-sm font-medium text-gray-900 text-medical-blue min-h-[2rem]">
          {product.product_details?.["Quy cách"]}
        </h3>}

        <div className="text-xs text-gray-500 mb-3">{product.seller_name}</div>

        <Button
          size="sm"
          className="w-full bg-primary-600 hover:bg-primary-700 text-white"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-4 h-4 mr-1" />
          Thêm vào giỏ
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
