import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Package, Euro, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';

export const CatalogPage = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.filter((p: any) => p.visibility === 1 || p.visibility === true));
    } catch (error) {
      console.error('Errore nel caricamento prodotti:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter((p) => {
      const name = (t(p, 'name') || '').toLowerCase();
      const description = (t(p, 'description') || '').toLowerCase();
      return name.includes(query) || description.includes(query);
    });
  }, [products, searchQuery, t]);

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <section className="py-20 bg-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
          <div className="flex-1">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-display font-bold mb-6 italic"
            >
              Catalogo Prodotti
            </motion.h1>
            <p className="text-xl text-slate-400 max-w-2xl">
              Esplora i nostri marchi e macchinari professionali.
            </p>
          </div>

          <div className="w-full md:w-96 relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-gold transition-colors">
              <Search size={20} />
            </div>
            <input 
              type="text"
              placeholder="Cerca prodotti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:bg-white/20 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-white transition-colors"
                title="Svuota ricerca"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <motion.div 
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 group hover:shadow-xl transition-all flex flex-col"
            >
              <Link to={`/prodotto/${product.id}`} className="h-64 relative bg-slate-100 overflow-hidden">
                <img 
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop'} 
                  alt={t(product, 'name')} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-brand-900/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">
                  {product.slug || product.id}
                </div>
                <div className="absolute bottom-4 left-4 flex gap-2">
                  {product.categoryName && (
                    <span className="bg-gold/90 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-bold uppercase">{product.categoryName}</span>
                  )}
                  {product.brandName && (
                    <span className="bg-white/90 backdrop-blur-sm text-brand-900 px-2 py-1 rounded text-[10px] font-bold uppercase">{product.brandName}</span>
                  )}
                </div>
              </Link>
              <div className="p-8 flex-1 flex flex-col">
                <Link to={`/prodotto/${product.id}`}>
                  <h4 className="text-xl font-bold mb-2 group-hover:text-gold transition-colors">{t(product, 'name')}</h4>
                </Link>
                <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {t(product, 'description')}
                </p>
                <div className="mt-auto flex justify-between items-center pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-gold font-bold text-xl font-display">
                    <Euro size={18} />
                    {Number(product.price).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="py-20 text-center">
            <Package size={64} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">
              {searchQuery ? `Nessun risultato trovato per "${searchQuery}"` : 'Nessun prodotto nel catalogo.'}
            </p>
          </div>
        )}
      </section>

      {/* Login footer removed in favor of dedicated /accedi-al-catalogo route */}
    </div>
  );
};
