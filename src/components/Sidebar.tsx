import React, { useEffect, useState } from 'react';
import { X, ChevronRight, ChevronDown, Package2, Tags } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import productApi from '@/services/api-product-service';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: string) => void;
  onSelectBrand: (brand: string) => void;
  onSelectProductType: (productType: string) => void;
  onResetFilter: () => void;
}

const Sidebar = ({ isOpen, onClose, onSelectCategory, onSelectBrand, onSelectProductType, onResetFilter }: SidebarProps) => { 
  const [productTypes, setProductTypes] = useState([]);
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const [brands, setBrands] = useState([]);
  const [isProductTypesLoading, setIsProductTypesLoading] = useState(true);
  const [isBrandsLoading, setIsBrandsLoading] = useState(false);

  const fetchProductTypes = async () => {
    setIsProductTypesLoading(true);
    productApi.get('/product-types/full-list-product-type')
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
      })
      .finally(() => {
        setIsProductTypesLoading(false);
      });
  };

  const fetchBrands = async () => {
    setIsBrandsLoading(true);
    productApi.get('/products/brands')
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
      })
      .finally(() => {
        setIsBrandsLoading(false);
      });
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleResetFilter = () => {
    setOpenCategories([]);
    onSelectProductType('');
    onSelectBrand('');
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
          className="fixed inset-0 bg-black/50 z-[90] md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 w-80 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 z-[100]' : '-translate-x-full'} 
          md:translate-x-0 md:z-40 md:top-16 md:shadow-none md:border-r
        `}
        style={{ height: 'calc(100vh)' }}
      >
        <div className="flex flex-col h-full md:h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 md:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Danh mục sản phẩm</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-blue-100/50">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4">
              {/* Reset Filter Button */}
              <button 
                className="w-full text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 
                px-4 py-3 rounded-xl uppercase tracking-wide mb-6 transition-colors duration-200
                flex items-center justify-center space-x-2 hidden md:flex"
                onClick={() => onResetFilter()}
              >
                <Package2 className="w-4 h-4" />
                <span>Tất cả sản phẩm</span>
              </button>

              {/* Product Types Section */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4 px-3 flex items-center">
                  <Tags className="w-4 h-4 mr-2" />
                  Danh mục sản phẩm
                </h3>

                <div className="space-y-1">
                  {isProductTypesLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-10 bg-gray-100 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    productTypes.map((productType) => (
                      <Collapsible
                        key={productType.product_type_id}
                        open={openCategories.includes(productType.product_type_id)}
                        onOpenChange={() => {
                          onSelectProductType(productType.product_type_name);
                          toggleCategory(productType.product_type_id);
                        }}
                      >
                        <CollapsibleTrigger asChild>
                          <button className="w-full flex items-center justify-between p-3 text-left rounded-lg
                            hover:bg-blue-50 transition-all duration-200 group">
                            <span className="font-medium text-gray-700 group-hover:text-blue-600">
                              {productType.product_type_name}
                            </span>
                            {openCategories.includes(productType.product_type_id) ? (
                              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                            )}
                          </button>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="ml-3 mt-1 space-y-1 border-l-2 border-blue-100">
                          {productType.categories.map((category) => (
                            <button
                              key={category.category_id}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-600
                                hover:text-blue-600 hover:bg-blue-50 rounded-r-lg transition-colors
                                focus:outline-none focus:bg-blue-50 focus:text-blue-600"
                              onClick={() => onSelectCategory(category.category_name)}
                            >
                              {category.category_name}
                            </button>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))
                  )}
                </div>
              </div>

              {/* Brands Section */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4 px-3 flex items-center">
                  <Package2 className="w-4 h-4 mr-2" />
                  Thương hiệu
                </h4>
                <div className="space-y-1">
                  {isBrandsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-8 bg-gray-100 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    brands.map((brand) => (
                      <button
                        key={brand}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-600
                          hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors
                          focus:outline-none focus:bg-blue-50 focus:text-blue-600"
                        onClick={() => onSelectBrand(brand)}
                      >
                        {brand}
                      </button>
                    ))
                  )}
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
