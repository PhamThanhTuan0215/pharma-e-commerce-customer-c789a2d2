import React, { useState } from 'react';
import { Heart, Star, ShoppingCart, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  sold: number;
  store: string;
  discount?: number;
  freeShipping?: boolean;
  isLiked?: boolean;
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
          src={product.image || "/default-product.png"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Discount badge */}
        {product.discount && (
          <Badge className="absolute top-2 left-2 bg-medical-red text-white">
            -{product.discount}%
          </Badge>
        )}

        {/* Like button */}
        <Button
          variant="ghost"
          size="sm"
          className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${
            isLiked ? 'text-red-500 bg-white/90' : 'text-gray-400 bg-white/90 hover:text-red-500'
          }`}
          onClick={handleLike}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </Button>

        {/* Free shipping badge */}
        {product.freeShipping && (
          <Badge className="absolute bottom-2 left-2 bg-medical-green text-white text-xs">
            <Package className="w-3 h-3 mr-1" />
            Freeship
          </Badge>
        )}
      </div>

      <CardContent className="p-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">
              ({product.rating})
            </span>
          </div>
          <span className="text-xs text-gray-500 ml-auto">
            Đã bán {product.sold}
          </span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-lg font-bold text-medical-red">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-3">{product.store}</div>

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
