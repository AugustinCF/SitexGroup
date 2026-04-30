import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Euro, Search, X, Filter, ChevronDown, ArrowUpNarrowWide, ArrowDownNarrowWide, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';

export const CatalogPage = () => {
  const { t, formatText } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('none');
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/brands')
      ]);
      
      const [productsData, categoriesData, brandsData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        brandsRes.json()
      ]);

      setProducts(productsData.filter((p: any) => p.visibility === 1 || p.visibility === true));
      setCategories(categoriesData);
      setBrands(brandsData);
    } catch (error) {
      console.error('Errore nel caricamento dati:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const name = (t(p, 'name') || '').toLowerCase();
        const description = (t(p, 'description') || '').toLowerCase();
        return name.includes(query) || description.includes(query);
      });
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => String(p.categoryId) === selectedCategory);
    }

    // Brand filter
    if (selectedBrand !== 'all') {
      result = result.filter(p => String(p.brandId) === selectedBrand);
    }

    // Sorting
    if (sortOrder === 'asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedBrand, sortOrder, t]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSortOrder('none');
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <section className="py-20 bg-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
          <div className="flex-1">
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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

      <section className="bg-white border-b border-slate-200 sticky top-20 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${showFilters ? 'bg-brand-900 border-brand-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              >
                <Filter size={18} />
                <span className="font-bold text-sm uppercase">Filtri</span>
                <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <div className="h-8 w-px bg-slate-200" />
              
              <span className="text-sm text-slate-400 font-medium">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'prodotto' : 'prodotti'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setSortOrder('asc')}
                  className={`p-2 rounded-lg transition-all ${sortOrder === 'asc' ? 'bg-white text-gold shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  title="Prezzo: Crescente"
                >
                  <ArrowUpNarrowWide size={20} />
                </button>
                <button 
                  onClick={() => setSortOrder('desc')}
                  className={`p-2 rounded-lg transition-all ${sortOrder === 'desc' ? 'bg-white text-gold shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  title="Prezzo: Decrescente"
                >
                  <ArrowDownNarrowWide size={20} />
                </button>
              </div>

              {(selectedCategory !== 'all' || selectedBrand !== 'all' || sortOrder !== 'none' || searchQuery) && (
                <button 
                  onClick={resetFilters}
                  className="p-2 text-slate-400 hover:text-brand-900 transition-colors"
                  title="Resetta tutto"
                >
                  <RotateCcw size={20} />
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-6 pb-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-slate-100 mt-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Categoria</label>
                    <select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gold/20 outline-none appearance-none cursor-pointer"
                    >
                      <option value="all">Tutte le Categorie</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name_it}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Marchio</label>
                    <select 
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gold/20 outline-none appearance-none cursor-pointer"
                    >
                      <option value="all">Tutti i Marchi</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name_it}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 font-medium animate-pulse italic">Caricamento catalogo...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <motion.div 
                  key={product.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 group hover:shadow-xl transition-all flex flex-col"
                >
                  <Link to={`/prodotto/${product.id}`} className="h-64 relative bg-slate-100 overflow-hidden">
                    <img 
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop'} 
                      alt={t(product, 'name')} 
                      className="w-full h-full object-cover"
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
                    <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                      {formatText(t(product, 'description'))}
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
          </>
        )}
      </section>

      {/* Login footer removed in favor of dedicated /accedi-al-catalogo route */}
    </div>
  );
};
