import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';
import { motion } from 'motion/react';
import { Euro, ChevronRight, Package, Layers } from 'lucide-react';

export const CategoryDetailPage = () => {
  const { slug } = useParams();
  const { t } = useLanguage();
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cRes = await fetch(`/api/categories/by-slug/${slug}`);
        if (!cRes.ok) throw new Error();
        const catData = await cRes.json();
        setCategory(catData);

        const pRes = await fetch('/api/products');
        const allProducts = await pRes.json();
        setProducts(allProducts.filter((p: any) => p.categoryId === catData.id));
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
        <p className="mt-4 text-slate-400 font-medium animate-pulse italic">Caricamento categoria...</p>
      </div>
    );
  }
  if (!category) return <div className="pt-40 text-center uppercase font-bold text-slate-400 font-display">Categoria non trovata</div>;

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      {/* Category Header */}
      <section className="bg-brand-900 text-white py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-1 bg-gold rounded-full" />
              <span className="text-gold font-bold uppercase tracking-widest text-xs">Settore Industriale</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-8 italic">{category.name_it}</h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
              {t(category, 'description')}
            </p>
          </div>
        </div>
        
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          {category.image ? (
            <img src={category.image} alt="" className="w-full h-full object-cover grayscale blur-sm" />
          ) : (
            <Layers className="w-full h-full text-white" />
          )}
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-baseline mb-12 border-b border-slate-200 pb-8">
          <h2 className="text-3xl font-bold italic">Selezione {category.name_it}</h2>
          <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">{products.length} Macchinari Disponibili</span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <motion.div 
                key={product.id}
                layout
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 group hover:shadow-xl transition-all flex flex-col"
              >
                <Link to={`/prodotto/${product.id}`} className="h-64 relative bg-slate-100 overflow-hidden">
                  <img 
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop'} 
                    alt={product.name_it} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-brand-900 shadow-lg">
                      {product.brandName}
                    </span>
                  </div>
                </Link>
                <div className="p-8 flex-1 flex flex-col">
                  <Link to={`/prodotto/${product.id}`}>
                    <h4 className="text-2xl font-bold mb-3 italic group-hover:text-gold transition-colors">{product.name_it}</h4>
                  </Link>
                  <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {t(product, 'description')}
                  </p>
                  <div className="mt-auto flex justify-between items-center pt-6 border-t border-slate-100">
                    <div className="text-gold font-bold text-2xl font-display flex items-center gap-1">
                      <Euro size={20} />
                      {Number(product.price).toLocaleString('it-IT')}
                    </div>
                    <Link to={`/prodotto/${product.id}`} className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-gold transition-colors">
                      <ChevronRight size={20} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <Package size={64} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">Coming Soon: Stiamo caricando i macchinari professionali per questo settore.</p>
          </div>
        )}
      </section>
    </div>
  );
};
