import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import productApi from '@/services/api-product-service';
import { toast } from '@/hooks/use-toast';

interface ProductComponent {
  Tên: string;
  "Hàm lượng": string;
}

interface ProductDetails {
  [key: string]: string | ProductComponent[];
}

interface CatalogProduct {
  id: string,
  name: string,
  brand: string,
  active_status: string,
  url_image: string,
  url_registration_license: string,
  product_type_id: string,
  category_id: string,
  product_details: ProductDetails
}

const CatalogProductDetail = () => {
    // cuộn lên đầu trang
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<CatalogProduct | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const detailsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const scrollToSection = (sectionId: string) => {
        if (detailsRef.current[sectionId]) {
            const headerOffset = 200;
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
        productApi.get(`/catalog-products/${id}`)
            .then((response) => {
                if (response.data.code === 0) {
                    const productData = response.data.data;
                    setProduct(productData);
                }
            })
            .catch((error) => {
                toast({
                    variant: 'error',
                    description: error.response?.data?.message || error.message,
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const getProductDetail = (key: string): string => {
        const value = product?.product_details[key];
        return typeof value === 'string' ? value : '';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
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
                <Header />
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
            <Header />

            <div className="container mx-auto px-4 py-6">
                {/* Back button */}
                <Button
                    variant="ghost"
                    className="mb-4 border-2 border-gray-200 rounded-full"
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
                                src={product.url_image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
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

                            {getProductDetail("Yêu cầu kê đơn") === "Có" && (
                                <div className="flex items-center space-x-4 mb-6">
                                    <Badge variant="outline" className="bg-medical-red text-white">
                                        Yêu cầu kê đơn
                                    </Badge>
                                </div>
                            )}

                            <div className="flex items-center space-x-4 mb-4">
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-600">
                                        Trạng thái: &nbsp;
                                        <span className={`text-sm font-bold ${product.active_status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                                            {product.active_status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Thông tin chi tiết */}
                <div className="grid grid-cols-1 gap-8">
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
                </div>
            </div>
        </div>
    );
};

export default CatalogProductDetail;
