import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Euro, Search, X, Filter, ChevronDown, ArrowUpNarrowWide, ArrowDownNarrowWide, RotateCcw } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';

export const CatalogPage = () => {
  const { t, formatText } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('categoria') || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>(searchParams.get('marchio') || 'all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('none');

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const cat = searchParams.get('categoria');
    const brand = searchParams.get('marchio');
    if (cat) setSelectedCategory(cat);
    if (brand) setSelectedBrand(brand);
  }, [searchParams]);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex items-center justify-between gap-4">
            {/* Desktop Filters (Hidden on Mobile) */}
            <div className="hidden lg:flex flex-wrap gap-6 items-end flex-1">
              <div className="w-[250px]">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Categoria</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gold/20 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <option value="all">Tutte le Categorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name_it}</option>
                  ))}
                </select>
              </div>

              <div className="w-[250px]">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Marchio</label>
                <select 
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gold/20 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <option value="all">Tutti i Marchi</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name_it}</option>
                  ))}
                </select>
              </div>

              <div className="w-[250px]">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Ordinamento Prezzo</label>
                <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 h-[46px]">
                  <button 
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'none' : 'asc')}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg transition-all ${sortOrder === 'asc' ? 'bg-white text-gold shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <ArrowUpNarrowWide size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Crescente</span>
                  </button>
                  <button 
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'none' : 'desc')}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg transition-all ${sortOrder === 'desc' ? 'bg-white text-gold shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <ArrowDownNarrowWide size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Decrescente</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-gold transition-colors"
            >
              <Filter size={18} />
              <span>Filtra Prodotti</span>
              {(selectedCategory !== 'all' || selectedBrand !== 'all' || sortOrder !== 'none') && (
                <span className="w-5 h-5 bg-gold text-white rounded-full flex items-center justify-center text-[10px]">
                  {[selectedCategory !== 'all', selectedBrand !== 'all', sortOrder !== 'none'].filter(Boolean).length}
                </span>
              )}
            </button>

            <div className="flex items-center justify-end gap-6 w-full lg:w-auto">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400 font-medium whitespace-nowrap">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'prodotto' : 'prodotti'}
                </span>
                
                {(selectedCategory !== 'all' || selectedBrand !== 'all' || sortOrder !== 'none' || searchQuery) && (
                  <>
                    <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                    <button 
                      onClick={resetFilters}
                      className="flex items-center gap-2 text-slate-400 hover:text-brand-900 transition-colors group"
                      title="Resetta tutto"
                    >
                      <RotateCcw size={18} className="group-hover:rotate-[-45deg] transition-transform" />
                      <span className="text-[10px] font-bold uppercase hidden sm:inline">Resetta</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 bg-brand-900/40 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-xs bg-white z-[101] lg:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 italic">
                  <Filter size={20} className="text-gold" /> Filtri
                </h2>
                <button 
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-8 no-scrollbar">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Categoria</label>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'all' ? 'bg-gold text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                      Tutte le Categorie
                    </button>
                    {categories.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(String(cat.id))}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedCategory === String(cat.id) ? 'bg-gold text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                      >
                        {cat.name_it}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Marchio</label>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setSelectedBrand('all')}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedBrand === 'all' ? 'bg-gold text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                      Tutti i Marchi
                    </button>
                    {brands.map(brand => (
                      <button 
                        key={brand.id}
                        onClick={() => setSelectedBrand(String(brand.id))}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedBrand === String(brand.id) ? 'bg-gold text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                      >
                        {brand.name_it}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Ordinamento</label>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'none' : 'asc')}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${sortOrder === 'asc' ? 'bg-gold text-white' : 'bg-slate-50 text-slate-600'}`}
                    >
                      <span className="flex items-center gap-2">
                        <ArrowUpNarrowWide size={18} /> Prezzo Crescente
                      </span>
                    </button>
                    <button 
                      onClick={() => setSortOrder(sortOrder === 'desc' ? 'none' : 'desc')}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${sortOrder === 'desc' ? 'bg-gold text-white' : 'bg-slate-50 text-slate-600'}`}
                    >
                      <span className="flex items-center gap-2">
                        <ArrowDownNarrowWide size={18} /> Prezzo Decrescente
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <button 
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-gold transition-colors"
                >
                  Mostra {filteredProducts.length} Prodotti
                </button>
                {(selectedCategory !== 'all' || selectedBrand !== 'all' || sortOrder !== 'none') && (
                  <button 
                    onClick={resetFilters}
                    className="w-full mt-4 flex items-center justify-center gap-2 text-slate-400 font-bold py-2 text-sm uppercase tracking-widest"
                  >
                    <RotateCcw size={16} /> Resetta Filtri
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                  <Link to={`/prodotto/${product.slug}`} className="h-64 relative bg-slate-100 overflow-hidden">
                    <img 
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop'} 
                      alt={t(product, 'name')} 
                      loading="lazy"
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
                      {product.categoryName && (
                        <span className="bg-gold/90 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-bold uppercase">{product.categoryName}</span>
                      )}
                      {product.brandName && (
                        <span className="bg-white/90 backdrop-blur-sm text-brand-900 px-2 py-1 rounded text-[10px] font-bold uppercase">{product.brandName}</span>
                      )}
                    </div>
                  </Link>
                  <div className="p-8 flex-1 flex flex-col">
                    <Link to={`/prodotto/${product.slug}`}>
                      <h4 className="text-xl font-bold mb-2 group-hover:text-gold transition-colors">{t(product, 'name')}</h4>
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
