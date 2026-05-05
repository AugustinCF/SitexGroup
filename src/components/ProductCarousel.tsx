import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Euro, Package, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';

interface ProductCarouselProps {
  categorySlug: string;
  title: string;
  buttonText: string;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({ categorySlug, title, buttonText }) => {
  const { t, formatText } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Find category by slug or name
        const catsRes = await fetch('/api/categories');
        const cats = await catsRes.json();
        
        const targetCat = cats.find((c: any) => 
          (c.slug && c.slug.toLowerCase() === categorySlug.toLowerCase()) || 
          (c.name_it && c.name_it.toLowerCase() === categorySlug.toLowerCase())
        );
        
        if (targetCat) {
          setCategoryId(String(targetCat.id));
          // 2. Fetch products for this category
          const productsRes = await fetch('/api/products');
          const allProducts = await productsRes.json();
          
          const filtered = allProducts
            .filter((p: any) => p.categoryId && String(p.categoryId) === String(targetCat.id))
            .filter((p: any) => p.visibility === 1 || p.visibility === true)
            .sort((a: any, b: any) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            })
            .slice(0, 10);
          
          setProducts(filtered);
        } else {
          console.warn(`Category not found for slug or name: ${categorySlug}`);
        }
      } catch (error) {
        console.error('Error fetching carousel products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug]);

  // Auto-scroll logic
  useEffect(() => {
    if (products.length === 0) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollAmount = 320; // card width + gap
        
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [products]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <section className="py-24 bg-white border-t border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex justify-between items-end">
          <div>
            <span className="text-gold font-bold uppercase tracking-widest text-[10px] mb-2 block">Novità in catalogo</span>
            <h2 className="text-4xl font-display font-bold italic">{title}</h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={scrollLeft}
              className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={scrollRight}
              className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-8 no-scrollbar scroll-smooth"
          >
            {products.map((product) => (
              <motion.div 
                key={product.id}
                className="min-w-[300px] w-[300px] bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 group flex flex-col"
              >
                <Link to={`/prodotto/${product.slug}`} className="h-48 relative overflow-hidden bg-slate-200">
                  <img 
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop'} 
                    alt={t(product, 'name')} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                    <div className="bg-brand-900/80 backdrop-blur-md px-2 py-0.5 rounded-full text-white text-[8px] font-bold uppercase tracking-widest">
                      ID: {product.id}
                    </div>
                    <div className={`${product.condition === 'Usato' ? 'bg-orange-500/90' : 'bg-green-600/90'} backdrop-blur-md px-2 py-0.5 rounded-full text-white text-[8px] font-bold uppercase tracking-widest shadow-sm`}>
                      {product.condition || 'Nuovo'}
                    </div>
                  </div>
                </Link>
                <div className="p-6 flex-1 flex flex-col">
                  <Link to={`/prodotto/${product.slug}`}>
                    <h4 className="font-bold mb-2 group-hover:text-gold transition-colors line-clamp-1">{t(product, 'name')}</h4>
                  </Link>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                    {t(product, 'brandName')}
                  </p>
                  <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-100">
                    <div className="text-gold font-bold flex items-center gap-1">
                      <Euro size={14} />
                      {product.price 
                        ? Number(product.price).toLocaleString('it-IT')
                        : 'Contattaci'
                      }
                    </div>
                    <Link to={`/prodotto/${product.slug}`} className="w-8 h-8 rounded-full bg-brand-900 text-white flex items-center justify-center hover:bg-gold transition-colors">
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Link 
            to={`/catalogo?categoria=${categoryId}`}
            className="inline-flex items-center gap-3 px-10 py-5 bg-brand-900 text-white font-bold rounded-2xl hover:bg-brand-800 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            {buttonText}
            <ChevronRight size={20} className="text-gold" />
          </Link>
        </div>
      </div>
    </section>
  );
};
