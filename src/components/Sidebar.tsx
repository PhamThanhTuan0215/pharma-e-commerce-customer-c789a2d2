import React, { useEffect, useState } from 'react';
import { X, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import api from '@/services/api';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: string) => void;
  onSelectBrand: (brand: string) => void;
  onSelectProductType: (productType: string) => void;
}

const Sidebar = ({ isOpen, onClose, onSelectCategory, onSelectBrand, onSelectProductType }: SidebarProps) => {
  const [productTypes, setProductTypes] = useState([]);
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const [brands, setBrands] = useState([]);

  const fetchProductTypes = async () => {
    api.get('/product/product-types/full-list-product-type')
      .then((response) => {
        if (response.data.code === 0) {
          const productTypes = response.data.data;
          setProductTypes(productTypes);
        }
      })
      .catch((error) => {
        toast({
          variant: 'error',
          description: error.response.data.message || error.message,
        });
      });
  };

  const fetchBrands = async () => {
    api.get('/product/products/brands')
      .then((response) => {
        if (response.data.code === 0) {
          const brands = response.data.data;
          setBrands(brands);
        }
      })
      .catch((error) => {
        toast({
          variant: 'error',
          description: error.response.data.message || error.message,
        });
      });
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  useEffect(() => {
    fetchProductTypes();
    fetchBrands();
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90] md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 w-80 bg-white border-r
          transform transition-transform duration-300 ease-in-out overflow-hidden
          ${isOpen ? 'translate-x-0 z-[100]' : '-translate-x-full'} 
          md:translate-x-0 md:z-40 md:top-16
        `}
        style={{ height: 'calc(100vh)' }}
      >
        <div className="flex flex-col h-full md:h-[calc(100vh-4rem)]">
          <div className="flex items-center justify-between p-4 border-b md:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Danh mục sản phẩm</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4 hidden md:block">
                Danh mục sản phẩm
              </h3>

              <div className="space-y-2">
                {productTypes.map((productType) => (
                  <Collapsible
                    key={productType.product_type_id}
                    open={openCategories.includes(productType.product_type_id)}
                    onOpenChange={() => {
                      onSelectProductType(productType.product_type_name);
                      toggleCategory(productType.product_type_id);
                    }}
                  >
                    <CollapsibleTrigger asChild>
                      <button className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-900">{productType.product_type_name}</span>
                        </div>
                        {openCategories.includes(productType.product_type_id) ? (
                          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        )}
                      </button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="ml-6 mt-1 space-y-1">
                      {productType.categories.map((category) => (
                        <button
                          key={category.category_id}
                          className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          onClick={() => onSelectCategory(category.category_name)}
                        >
                          {category.category_name}
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
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                      onClick={() => onSelectBrand(brand)}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
