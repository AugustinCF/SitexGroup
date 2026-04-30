import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';
import { motion } from 'motion/react';
import { Euro, ChevronRight, Package } from 'lucide-react';

export const BrandDetailPage = () => {
  const { slug } = useParams();
  const { t, formatText } = useLanguage();
  const [brand, setBrand] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bRes = await fetch(`/api/brands/by-slug/${slug}`);
        if (!bRes.ok) throw new Error();
        const brandData = await bRes.json();
        setBrand(brandData);

        const pRes = await fetch('/api/products');
        const allProducts = await pRes.json();
        setProducts(allProducts.filter((p: any) => p.brandId === brandData.id));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-32 min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-medium animate-pulse italic">Caricamento marchio...</p>
      </div>
    );
  }
  if (!brand) return <div className="pt-40 text-center uppercase font-bold text-slate-400 font-display">Marchio non trovato</div>;

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      {/* Brand Header */}
      <section className="bg-brand-900 text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="w-64 h-64 bg-white rounded-3xl p-10 flex items-center justify-center shadow-2xl">
            {brand.logo ? (
              <img src={brand.logo} alt={brand.name_it} className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-4xl font-bold text-slate-200">{brand.name_it}</span>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 italic">{brand.name_it}</h1>
            <p className="text-xl text-slate-400 max-w-2xl leading-relaxed whitespace-pre-wrap">
              {formatText(t(brand, 'description'))}
            </p>
            {brand.website && (
              <a 
                href={brand.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-8 text-gold font-bold underline underline-offset-8 decoration-gold/30 hover:decoration-gold transition-all"
              >
                Visita il sito ufficiale
              </a>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 skew-x-12 translate-x-1/2" />
      </section>

      {/* Brand Products */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-baseline mb-12 border-b border-slate-200 pb-8">
          <h2 className="text-3xl font-bold italic">Soluzioni {brand.name_it}</h2>
          <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">{products.length} Prodotti Trovati</span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <motion.div 
                key={product.id}
                layout
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 group hover:shadow-xl transition-all flex flex-col"
              >
                <Link to={`/prodotto/${product.id}`} className="h-56 relative bg-slate-100 overflow-hidden">
                  <img 
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop'} 
                    alt={product.name_it} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                    <div className="bg-brand-900/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">
                      {product.id}
                    </div>
                    <div className={`${product.condition === 'Usato' ? 'bg-orange-500/90' : 'bg-green-600/90'} backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest shadow-sm`}>
                      {product.condition || 'Nuovo'}
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <span className="bg-gold/90 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">{product.categoryName}</span>
                  </div>
                </Link>
                <div className="p-8 flex-1 flex flex-col">
                  <Link to={`/prodotto/${product.id}`}>
                    <h4 className="text-xl font-bold mb-2 group-hover:text-gold transition-colors">{product.name_it}</h4>
                  </Link>
                  <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                    {formatText(t(product, 'description'))}
                  </p>
                  <div className="mt-auto flex justify-between items-center pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-gold font-bold text-xl font-display">
                      <Euro size={18} />
                      {product.price 
                        ? Number(product.price).toLocaleString('it-IT', { minimumFractionDigits: 2 })
                        : 'Contattaci'
                      }
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <Package size={64} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">Nessun prodotto disponibile per questo marchio.</p>
          </div>
        )}
      </section>
    </div>
  );
};
