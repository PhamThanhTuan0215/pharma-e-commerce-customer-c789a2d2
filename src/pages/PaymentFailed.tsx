import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XCircle, Home, User } from 'lucide-react';
import Header from '@/components/Header';

const PaymentFailed = () => {
    const navigate = useNavigate();

    return (
        <>
            <Header />

            <div className="mt-20 bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
                    <div className="mb-6">
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thất bại!</h1>
                        <p className="text-gray-600">
                            Rất tiếc, đã xảy ra lỗi trong quá trình thanh toán. Vui lòng kiểm tra lại thông tin và thử lại.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Button
                            onClick={() => navigate('/profile', { state: { tab: 'orders' } })}
                            className="w-full bg-primary-600 hover:bg-primary-700"
                        >
                            <User className="w-4 h-4 mr-2" />
                            Xem đơn hàng
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => navigate('/')}
                            className="w-full"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Về trang chủ
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentFailed; 