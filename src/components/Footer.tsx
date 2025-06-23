import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Heart, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Footer = () => {
    return (
        <footer className="bg-[#0B4A75] text-white">
            <div className="container mx-auto px-4 py-8">
                {/* Pharmacy Trust Badges */}
                <div className="flex flex-wrap justify-center gap-8 mb-8 pb-8 border-b border-gray-600">
                    <div className="flex flex-col items-center text-center max-w-[200px]">
                        <div className="bg-green-600 p-3 rounded-full mb-3">
                            <Shield size={24} />
                        </div>
                        <h4 className="font-medium mb-1">Sản phẩm chính hãng</h4>
                        <p className="text-sm text-gray-300">Đảm bảo nguồn gốc từ nhà sản xuất</p>
                    </div>
                    <div className="flex flex-col items-center text-center max-w-[200px]">
                        <div className="bg-green-600 p-3 rounded-full mb-3">
                            <Clock size={24} />
                        </div>
                        <h4 className="font-medium mb-1">Giao hàng nhanh chóng</h4>
                        <p className="text-sm text-gray-300">Nhận hàng trong vòng 2 giờ</p>
                    </div>
                </div>

                {/* Main Footer Content */}
                <div className="flex justify-center border-b border-gray-600 pb-8">
                    <div className="flex flex-col items-center text-center">
                        <h2 className="text-2xl font-bold mb-4">Pharma E-Commerce</h2>
                        <p className="mb-4">Cung cấp các sản phẩm dược phẩm chất lượng cao, đảm bảo sức khỏe cho mọi người.</p>
                        <p className="mb-4">19 Nguyễn Hữu Thọ, Tân Phong, Quận 7, TP.HCM</p>
                        <div className="flex items-center justify-center w-full mb-4">
                            <Phone size={18} className="mr-2" />
                            <p>0867596351</p>
                        </div>
                        <div className="flex items-center justify-center w-full mb-4">
                            <Mail size={18} className="mr-2" />
                            <p>thanhtuancr1234@gmail.com</p>
                        </div>
                    </div>
                </div>

                {/* Health Disclaimer */}
                <div className="mt-8 p-4 bg-blue-900 bg-opacity-50 rounded-lg text-sm text-center">
                    <p className="mb-2"><strong>Lưu ý:</strong> Thông tin trên website chỉ mang tính chất tham khảo và không thay thế cho việc tư vấn với bác sĩ hoặc dược sĩ.</p>
                    <p>Không tự ý sử dụng thuốc khi chưa có sự chỉ định của bác sĩ. Đọc kỹ hướng dẫn sử dụng trước khi dùng.</p>
                </div>

                {/* Social Media & Certification */}
                <div className="mt-8 pt-6 border-t border-gray-600">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex space-x-4 mb-4 md:mb-0">
                            <a href="#" className="bg-gray-700 p-2 rounded-full hover:bg-blue-600 transition-colors">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="bg-gray-700 p-2 rounded-full hover:bg-pink-600 transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="bg-gray-700 p-2 rounded-full hover:bg-blue-400 transition-colors">
                                <Twitter size={20} />
                            </a>
                        </div>
                        {/* <div className="flex items-center space-x-3">
                            <div className="bg-white p-1 rounded">
                                <img src="/placeholder.svg" alt="Bộ Công Thương" className="h-10 w-16" />
                            </div>
                            <div className="bg-white p-1 rounded">
                                <img src="/placeholder.svg" alt="Bộ Y Tế" className="h-10 w-16" />
                            </div>
                        </div> */}

                        {/* Copyright */}
                        <div className="mt-6 text-center text-gray-300 text-sm">
                            <p>© {new Date().getFullYear()} Tuan-Thanh Pharma E-Commerce.</p>
                            {/* <p className="mt-1">Giấy chứng nhận Đăng ký Kinh doanh số: 0123456789 do Sở KH-ĐT TP.HCM cấp ngày 01/01/2023</p> */}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;