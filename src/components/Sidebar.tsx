
import React, { useState } from 'react';
import { X, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  {
    id: 'otc',
    name: 'Thuốc không kê đơn (OTC)',
    icon: '💊',
    subcategories: [
      'Thuốc cảm cúm',
      'Thuốc giảm đau hạ sốt',
      'Thuốc ho, long đờm',
      'Thuốc đau bụng, tiêu hóa',
      'Thuốc dị ứng',
      'Thuốc bôi ngoài da'
    ]
  },
  {
    id: 'supplement',
    name: 'Thực phẩm chức năng',
    icon: '🌿',
    subcategories: [
      'Vitamin tổng hợp',
      'Canxi & Vitamin D',
      'Omega 3',
      'Probiotics',
      'Thực phẩm cho tim mạch',
      'Thực phẩm cho não bộ',
      'Thực phẩm cho xương khớp'
    ]
  },
  {
    id: 'medical-device',
    name: 'Dụng cụ y tế',
    icon: '🩺',
    subcategories: [
      'Máy đo huyết áp',
      'Máy đo đường huyết',
      'Nhiệt kế',
      'Khẩu trang y tế',
      'Băng gạc, cotton',
      'Ống tiêm, kim tiêm',
      'Máy massage'
    ]
  },
  {
    id: 'baby-mom',
    name: 'Mẹ và bé',
    icon: '👶',
    subcategories: [
      'Sữa bột',
      'Tã em bé',
      'Đồ dùng cho bé',
      'Vitamin cho bé',
      'Sản phẩm cho mẹ bầu'
    ]
  },
  {
    id: 'beauty',
    name: 'Làm đẹp & chăm sóc',
    icon: '💄',
    subcategories: [
      'Kem chống nắng',
      'Sản phẩm trị mụn',
      'Kem dưỡng da',
      'Serum',
      'Sản phẩm tắm gội'
    ]
  }
];

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 z-40 w-80 bg-white border-r
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:block md:top-16
        `}
        style={{ height: 'calc(100vh - 4rem)' }}
      >
        <div className="flex items-center justify-between p-4 border-b md:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Danh mục sản phẩm</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="h-full">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4 hidden md:block">
              Danh mục sản phẩm
            </h3>

            <div className="space-y-2">
              {categories.map((category) => (
                <Collapsible
                  key={category.id}
                  open={openCategories.includes(category.id)}
                  onOpenChange={() => toggleCategory(category.id)}
                >
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                      {openCategories.includes(category.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      )}
                    </button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="ml-6 mt-1 space-y-1">
                    {category.subcategories.map((sub) => (
                      <button
                        key={sub}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                      >
                        {sub}
                      </button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>

            {/* Popular brands */}
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                Thương hiệu nổi bật
              </h4>
              <div className="space-y-2">
                {['Taisho', 'Blackmores', 'DHG Pharma', 'Hasan-Dewi', 'Abbott', 'Pfizer'].map((brand) => (
                  <button
                    key={brand}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default Sidebar;
