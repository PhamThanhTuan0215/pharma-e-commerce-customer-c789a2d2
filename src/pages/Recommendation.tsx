import Header from "../components/Header";
import { useEffect, useState, useRef } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { AlertCircle, Search, Pill, Activity, CheckCircle2, Loader2, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import aiRecommendationApi from '@/services/api-ai-recommendation-service';
import {callWithPrewarm} from '@/services/api-ai-recommendation-service-v2';
import { toast } from '@/hooks/use-toast';
import axios, { CancelTokenSource } from 'axios';
import productApi from '@/services/api-product-service';
import ProductCard from '@/components/ProductCard';

interface Suggestion {
    med_group: string; // tên nhóm thuốc
    drugs: string[]; // danh sách thuốc trong nhóm
}

interface DiseaseResult {
    disease: string; // tên bệnh
    note: string; // ghi chú về độ khớp của triệu chứng với bệnh
    suggestions: Suggestion[]; // danh sách gợi ý thuốc
    suggestions_products?: Product[]; // danh sách sản phẩm thuốc thực tế
    total_products?: number; // tổng số sản phẩm tìm được (không tính phân trang)
    products_page: number; // trang hiện tại của sản phẩm
    products_expanded?: boolean; // trạng thái ẩn/hiện của danh sách sản phẩm
}

interface Prediction {
    user_input: string | null; // triệu chứng người dùng nhập
    min_score: number; // độ tin cậy của triệu chứng ánh xạ (so sánh triệu trứng người dùng nhập với triệu chứng của hệ thống)
    top_k: number; // số lượng bệnh dự đoán
    symptoms_input: string[]; // triệu chứng người đề cập đến
    matched_logs: string[]; // log thông tin so sánh khớp triệu chứng với triệu chứng của hệ thống
    matched_symptoms: string[]; // triệu chứng khớp (các triệu chứng đã được ánh xạ)
    is_perfect_match_disease: boolean; // độ khớp hoàn hảo của triệu chứng với bệnh (nếu là false thì là không có bệnh nào khớp hoàn toàn, mà chỉ lấy ra các bệnh gần đúng nhất)
    diseases_result: DiseaseResult[]; // danh sách bệnh dự đoán
}

interface Product {
    id: string;
    name: string;
    category_name: string; // tương đương với med_group
    retail_price: number;
    stock: number;
    url_image: string;
    seller_id: string;
    seller_name: string;
    product_details: {
      [key: string]: string;
    };
    promotion_name: string;
    promotion_value_percent: number;
    promotion_start_date: string;
    promotion_end_date: string;
    actual_price: number;
}

const PREDICTION_STORAGE_KEY = 'pharma_recommendation_prediction';
const LIMIT_PRODUCT_PER_PAGE = 6; // Số sản phẩm trên mỗi trang

const Recommendation = () => {
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [userInput, setUserInput] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState<{[key: number]: boolean}>({});
    const cancelTokenRef = useRef<CancelTokenSource | null>(null);

    // Đọc dữ liệu prediction từ localStorage khi component mount
    useEffect(() => {
        const savedPrediction = localStorage.getItem(PREDICTION_STORAGE_KEY);
        if (savedPrediction) {
            try {
                const parsedPrediction = JSON.parse(savedPrediction);
                
                // Khởi tạo thêm các thuộc tính cần thiết nếu chưa có
                if (parsedPrediction.diseases_result) {
                    parsedPrediction.diseases_result = parsedPrediction.diseases_result.map((disease: DiseaseResult) => ({
                        ...disease,
                        products_page: disease.products_page || 1,
                        products_expanded: disease.products_expanded || false,
                        suggestions_products: disease.suggestions_products || []
                    }));
                }
                
                setPrediction(parsedPrediction);
                
                // Khôi phục user input nếu có
                if (parsedPrediction.user_input) {
                    setUserInput(parsedPrediction.user_input);
                }
            } catch (error) {
                console.error('Failed to parse saved prediction:', error);
                localStorage.removeItem(PREDICTION_STORAGE_KEY);
            }
        }
    }, []);

    // Hàm để lưu prediction vào localStorage
    const savePredictionToStorage = (predictionData: Prediction) => {
        try {
            localStorage.setItem(PREDICTION_STORAGE_KEY, JSON.stringify(predictionData));
        } catch (error) {
            console.error('Failed to save prediction to localStorage:', error);
        }
    };

    // Hàm để xóa prediction khỏi localStorage
    const clearPredictionFromStorage = () => {
        localStorage.removeItem(PREDICTION_STORAGE_KEY);
    };

    const handleFetchPrediction = async () => {
        if (!userInput.trim()) {
            toast({
                variant: 'info',
                description: "Vui lòng nhập triệu chứng",
            });
            return;
        };
        
        setPrediction(null);
        // Xóa dữ liệu cũ khi bắt đầu phân tích mới
        clearPredictionFromStorage();
        setIsLoading(true);

        // Tạo cancel token cho request nháp
        const draftCancelToken = axios.CancelToken.source();
        
        // Gọi request nháp
        aiRecommendationApi().post('/suggestions', {
            user_input: userInput,
        }, {
            cancelToken: draftCancelToken.token
        }).catch((error) => {
            // Không cần xử lý lỗi của request nháp
            console.log("Draft request canceled or failed:", error.message);
        });
        
        // Tự động hủy request nháp sau 1 giây và gọi request thật
        setTimeout(() => {
            // Hủy request nháp
            draftCancelToken.cancel('Draft request canceled');
            
            // Tạo cancel token mới cho request thật
            cancelTokenRef.current = axios.CancelToken.source();
            
            // Gọi request thật
            aiRecommendationApi().post('/suggestions', {
                user_input: userInput,
            }, {
                cancelToken: cancelTokenRef.current.token
            }).then((response) => {
                if(response.data.code === 0) {
                    const prediction = response.data.data;
                    prediction.user_input = userInput;
                    
                    // Khởi tạo các thuộc tính bổ sung cho mỗi bệnh
                    prediction.diseases_result = prediction.diseases_result.map((disease: DiseaseResult) => ({
                        ...disease,
                        products_page: 1,
                        products_expanded: false,
                        suggestions_products: []
                    }));
                    
                    setPrediction(prediction);
                    // Lưu prediction vào localStorage
                    savePredictionToStorage(prediction);
                }
                setIsLoading(false);
            }).catch((error) => {
                if (axios.isCancel(error)) {
                    toast({
                        variant: 'info',
                        description: "Đã hủy yêu cầu phân tích",
                    });
                } else {
                    toast({
                        variant: 'error',
                        description: error.response?.data?.message || error.message,
                    });
                    setIsLoading(false);
                }
            });
        }, 1000);
    }

    const handleUserInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUserInput(e.target.value);
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Chỉ gửi khi nhấn Ctrl+Enter hoặc Command+Enter
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleFetchPrediction();
        }
    }

    const handleCancelPrediction = () => {
        // Hủy request đang chạy
        if (cancelTokenRef.current) {
            cancelTokenRef.current.cancel('Người dùng đã hủy yêu cầu');
            cancelTokenRef.current = null;
            setIsLoading(false);
        }

        setPrediction(null);
        // Xóa dữ liệu khi người dùng hủy phân tích
        clearPredictionFromStorage();
    }

    // Xử lý chuyển trang cho sản phẩm
    const handlePageChange = (diseaseIndex: number, newPage: number) => {
        if (!prediction) return;
        
        const updatedDiseases = [...prediction.diseases_result];
        updatedDiseases[diseaseIndex].products_page = newPage;
        
        const updatedPrediction = {
            ...prediction,
            diseases_result: updatedDiseases
        };
        
        setPrediction(updatedPrediction);
        savePredictionToStorage(updatedPrediction);
        
        // Tải lại sản phẩm với trang mới
        loadProductsForDisease(updatedDiseases[diseaseIndex], diseaseIndex);
    };

    // Xử lý ẩn/hiện danh sách sản phẩm
    const toggleProductsVisibility = (diseaseIndex: number) => {
        if (!prediction) return;
        
        const updatedDiseases = [...prediction.diseases_result];
        const currentDisease = updatedDiseases[diseaseIndex];
        
        // Đảo ngược trạng thái hiển thị
        currentDisease.products_expanded = !currentDisease.products_expanded;
        
        // Nếu đang mở và chưa có sản phẩm, tải sản phẩm
        if (currentDisease.products_expanded && (!currentDisease.suggestions_products || currentDisease.suggestions_products.length === 0)) {
            loadProductsForDisease(currentDisease, diseaseIndex);
        }
        
        const updatedPrediction = {
            ...prediction,
            diseases_result: updatedDiseases
        };
        
        setPrediction(updatedPrediction);
        savePredictionToStorage(updatedPrediction);
    };

    // Tải sản phẩm cho một bệnh cụ thể
    const loadProductsForDisease = (disease: DiseaseResult, diseaseIndex: number) => {
        if (!prediction) return;
        
        const categories_name = disease.suggestions.map((suggestion) => suggestion.med_group);
        
        // Đánh dấu đang tải sản phẩm
        setIsLoadingProducts(prev => ({ ...prev, [diseaseIndex]: true }));
        
        const params = {
            page: disease.products_page,
            limit: LIMIT_PRODUCT_PER_PAGE,
            is_for_customer: true
        };
        
        const payload = {
            categories_name: categories_name
        };
        
        productApi.post(`/products/list-product-by-categories`, payload, {params})
        .then((response) => {
            if (response.data.code === 0) {
                const products = response.data.data;
                const total_products = response.data.total; // tổng số sản phẩm tìm được (không tính phân trang)
                
                // Cập nhật prediction với sản phẩm mới
                const updatedDiseases = [...prediction.diseases_result];
                updatedDiseases[diseaseIndex].suggestions_products = products;
                updatedDiseases[diseaseIndex].total_products = total_products;
                const updatedPrediction = {
                    ...prediction,
                    diseases_result: updatedDiseases
                };
                
                setPrediction(updatedPrediction);
                savePredictionToStorage(updatedPrediction);
            }
        })
        .catch((error) => {
            toast({
                variant: 'error',
                description: error.response?.data?.message || error.message,
            });
        })
        .finally(() => {
            // Đánh dấu đã tải xong
            setIsLoadingProducts(prev => ({ ...prev, [diseaseIndex]: false }));
        });
    };

    // Tính tổng số trang cho một bệnh cụ thể
    const getTotalPages = (diseaseIndex: number) => {
        if (!prediction || !prediction.diseases_result[diseaseIndex]) return 1;
        
        const disease = prediction.diseases_result[diseaseIndex];
        const totalItems = disease.total_products || 0;
        
        return Math.max(1, Math.ceil(totalItems / LIMIT_PRODUCT_PER_PAGE));
    };

    // Cleanup khi component unmount
    useEffect(() => {
        return () => {
            if (cancelTokenRef.current) {
                cancelTokenRef.current.cancel('Component unmounted');
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6 text-center">Dự đoán bệnh và gợi ý thuốc</h1>
                    
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Mô tả triệu chứng của bạn</CardTitle>
                            <CardDescription>
                                Cung cấp càng chi tiết các triệu chứng bạn đang gặp phải để tăng kết quả dự đoán chính xác.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2">
                                <Textarea 
                                    placeholder="Ví dụ: Tôi đang bị ngứa da&#10;Tôi cũng cảm thấy mụn da dạng nốt" 
                                    value={userInput} 
                                    onChange={handleUserInputChange}
                                    onKeyDown={handleKeyDown}
                                    className="min-h-[80px] resize-y"
                                />
                                <Button 
                                    onClick={handleFetchPrediction} 
                                    disabled={isLoading || !userInput.trim()}
                                    className="self-end mt-2"
                                >
                                    {isLoading ? "Đang phân tích..." : "Phân tích"}
                                    {!isLoading && <Search className="ml-2 h-4 w-4" />}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {isLoading && (
                        <div className="flex justify-center items-center h-full flex-col gap-2">
                            <Loader2 className="h-10 w-10 animate-spin text-gray-500 " />
                            <p className="ml-2 text-lg text-gray-500">Đang phân tích...</p>
                            <p className="ml-2 text-lg text-gray-500">Quá trình này có thể mất từ 10-20 giây</p>
                            <button className="ml-2 text-lg text-red-500 font-bold hover:text-red-600 border border-red-500 rounded-md px-4 py-2" onClick={handleCancelPrediction}>Hủy</button>
                        </div>
                    )}

                    {prediction && (
                        <div className="space-y-6">
                            {/* Thông tin tổng quan */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Activity className="mr-2 h-5 w-5" />
                                        Kết quả phân tích
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-medium mb-2">Thông tin người dùng mô tả:</h3>
                                            <p className="text-sm text-gray-700 italic font-medium m-3 p-3 bg-gray-50 rounded-md whitespace-pre-wrap border border-gray-200">
                                                {prediction.user_input}
                                            </p>
                                            <h3 className="font-medium mb-2">Các triệu chứng đã nhận diện:</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {prediction.symptoms_input.map((symptom, index) => (
                                                    <Badge key={index} variant="outline" className="bg-blue-50">
                                                        {symptom}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <Alert className={prediction.is_perfect_match_disease ? "bg-green-50" : "bg-yellow-50"}>
                                            <AlertCircle className={`h-4 w-4 ${prediction.is_perfect_match_disease ? "text-green-600" : "text-yellow-600"}`} />
                                            <AlertTitle className={prediction.is_perfect_match_disease ? "text-green-600" : "text-yellow-600"}>
                                                {prediction.is_perfect_match_disease 
                                                    ? "Khớp hoàn toàn" 
                                                    : "Khớp một phần"}
                                            </AlertTitle>
                                            <AlertDescription className={prediction.is_perfect_match_disease ? "text-green-700" : "text-yellow-700"}>
                                                {prediction.is_perfect_match_disease
                                                    ? "Các triệu chứng của bạn khớp hoàn toàn với các bệnh được liệt kê dưới đây."
                                                    : "Các triệu chứng của bạn khớp một phần với các bệnh được liệt kê. Đây là những bệnh có khả năng cao nhất dựa trên triệu chứng đã cung cấp."}
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Chi tiết phân tích triệu chứng */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Chi tiết phân tích triệu chứng</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Accordion type="multiple" className="w-full">
                                        <AccordionItem value="symptoms-mapping">
                                            <AccordionTrigger>Quá trình ánh xạ triệu chứng</AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-2 text-sm">
                                                    {prediction.matched_logs.map((log, index) => (
                                                        <div key={index} className="p-2 bg-gray-50 rounded-md">
                                                            {log}
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="matched-symptoms">
                                            <AccordionTrigger>Các triệu chứng đã ánh xạ</AccordionTrigger>
                                            <AccordionContent>
                                                <div className="flex flex-wrap gap-2">
                                                    {prediction.matched_symptoms.map((symptom, index) => (
                                                        <Badge key={index} variant="secondary">
                                                            {symptom}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </CardContent>
                            </Card>

                            {/* Kết quả dự đoán bệnh */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold flex items-center">
                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                    Kết quả dự đoán ({prediction.diseases_result.length} bệnh)
                                </h2>
                                
                                {prediction.diseases_result.map((disease, index) => (
                                    <Card key={index} className={index === 0 ? "border-2 border-blue-300" : ""}>
                                        <CardHeader className={index === 0 ? "bg-blue-50" : ""}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="flex items-center">
                                                        {disease.disease}
                                                        {index === 0 && (
                                                            <Badge className="ml-2 bg-blue-500">Phù hợp nhất</Badge>
                                                        )}
                                                    </CardTitle>
                                                    <CardDescription className="mt-1 text-sm">
                                                        {disease.note}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <h4 className="font-medium mb-3 flex items-center">
                                                <Pill className="mr-2 h-4 w-4" />
                                                Gợi ý thuốc điều trị
                                            </h4>
                                            
                                            {disease.suggestions.length > 0 ? (
                                                <div className="space-y-4">
                                                    {disease.suggestions.map((suggestion, idx) => (
                                                        <div key={idx}>
                                                            <h5 className="font-medium text-sm text-gray-700 mb-2">
                                                                {suggestion.med_group}
                                                            </h5>
                                                            {suggestion.drugs.length > 0 ? (
                                                                <ul className="list-disc pl-5 space-y-1">
                                                                    {suggestion.drugs.map((drug, drugIdx) => (
                                                                        <li key={drugIdx} className="text-sm">
                                                                            {drug}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <p className="text-sm text-gray-500 italic">
                                                                    Không có thuốc cụ thể được đề xuất
                                                                </p>
                                                            )}
                                                            {idx < disease.suggestions.length - 1 && (
                                                                <Separator className="my-3" />
                                                            )}
                                                        </div>
                                                    ))}

                                                    <div className="flex justify-center mt-4">
                                                        <Button 
                                                            onClick={() => toggleProductsVisibility(index)} 
                                                            className="text-sm text-blue-500 font-bold hover:text-blue-600 border border-blue-500 rounded-md px-4 py-2" 
                                                            variant="outline" 
                                                            size="sm"
                                                        >
                                                            <Package className="mr-2 h-4 w-4" />
                                                            {disease.products_expanded 
                                                                ? "Ẩn danh sách sản phẩm thuốc" 
                                                                : "Xem chi tiết các sản phẩm thuốc"}
                                                        </Button>
                                                    </div>

                                                    {disease.products_expanded && (
                                                        <div className="mt-4">
                                                            {isLoadingProducts[index] ? (
                                                                <div className="flex justify-center items-center py-8">
                                                                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                                                                    <p className="ml-2">Đang tải sản phẩm...</p>
                                                                </div>
                                                            ) : disease.suggestions_products && disease.suggestions_products.length > 0 ? (
                                                                <>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                                        {disease.suggestions_products.map((product, productIdx) => (
                                                                            <ProductCard key={productIdx} product={product} />
                                                                        ))}
                                                                    </div>
                                                                    
                                                                    {/* Phân trang */}
                                                                    <div className="flex flex-col items-center mt-6">
                                                                        <div className="flex items-center space-x-2 mb-2">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => handlePageChange(index, Math.max(1, disease.products_page - 1))}
                                                                                disabled={disease.products_page === 1}
                                                                            >
                                                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                                                Trước
                                                                            </Button>
                                                                            
                                                                            <span className="text-sm">
                                                                                Trang {disease.products_page} / {getTotalPages(index)}
                                                                            </span>
                                                                            
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => handlePageChange(index, Math.min(getTotalPages(index), disease.products_page + 1))}
                                                                                disabled={disease.products_page >= getTotalPages(index)}
                                                                            >
                                                                                Sau
                                                                                <ChevronRight className="h-4 w-4 ml-1" />
                                                                            </Button>
                                                                        </div>
                                                                        
                                                                        {disease.total_products !== undefined && (
                                                                            <div className="text-sm text-gray-500">
                                                                                Tìm thấy {disease.total_products} sản phẩm
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <p className="text-center text-gray-500 py-4">
                                                                    Không tìm thấy sản phẩm nào cho bệnh này.
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 italic">
                                                    Không có gợi ý thuốc điều trị cho bệnh này
                                                </p>
                                            )}
                                        </CardContent>
                                        <CardFooter className="bg-gray-50 text-sm text-gray-500">
                                            <p>
                                                Lưu ý: Đây chỉ là gợi ý dựa trên phân tích triệu chứng. 
                                                Vui lòng tham khảo ý kiến bác sĩ trước khi sử dụng bất kỳ loại thuốc nào.
                                            </p>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>

                            <div className="text-center text-sm text-gray-500 mt-8">
                                <p>
                                    Kết quả phân tích được cung cấp chỉ mang tính chất tham khảo và không thay thế cho tư vấn y tế chuyên nghiệp.
                                    <br />
                                    Vui lòng liên hệ với bác sĩ hoặc chuyên gia y tế để được tư vấn chính xác.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default Recommendation;