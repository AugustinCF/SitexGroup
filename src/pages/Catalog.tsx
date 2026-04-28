import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, Euro, ChevronRight, Search, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';

export const CatalogPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const { t } = useLanguage();

  const fetchAll = async () => {
    try {
      const [pRes, cRes, bRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/brands')
      ]);
      
      if (!pRes.ok) console.error('Products fetch failed:', pRes.status, pRes.statusText);
      if (!cRes.ok) console.error('Categories fetch failed:', cRes.status, cRes.statusText);
      if (!bRes.ok) console.error('Brands fetch failed:', bRes.status, bRes.statusText);

      const pData = await pRes.json();
      const cData = await cRes.json();
      const bData = await bRes.json();
      
      setProducts(pData.filter((p: any) => p.visibility));
      setCategories(cData);
      setBrands(bData);
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = t(p, 'name').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.categoryId === parseInt(selectedCategory);
    const matchesBrand = selectedBrand === 'all' || p.brandId === parseInt(selectedBrand);
    return matchesSearch && matchesCategory && matchesBrand;
  });

  return (
    <div className="pt-24 min-h-screen bg-slate-50 pb-20">
      {/* Header Section */}
      <section className="py-24 bg-brand-900 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 italic">
              Catalogo <span className="text-gold">Tecnico</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
              La nostra selezione di macchinari e materiali di consumo per l'industria metalmeccanica e l'automazione.
            </p>
          </motion.div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      </section>

      {/* Filters & Search */}
      <section className="sticky top-20 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Cerca macchinario, marca o componente..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-gold/20 focus:border-gold outline-none transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <select 
                className="flex-1 lg:w-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-gold transition-colors text-sm font-bold"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                <option value="all">Tutte le Categorie</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name_it}</option>)}
              </select>
              
              <select 
                className="flex-1 lg:w-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-gold transition-colors text-sm font-bold"
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
              >
                <option value="all">Tutti i Marchi</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name_it}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl transition-all group"
              >
                <Link to={`/prodotto/${product.id}`} className="block h-72 relative bg-slate-100 overflow-hidden">
                  <img 
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop'} 
                    alt={t(product, 'name')} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="bg-white/95 backdrop-blur-sm px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-brand-900 shadow-sm border border-slate-100">
                      {product.brandName}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <div className="p-8">
                  <span className="text-gold font-bold text-[10px] uppercase tracking-[0.2em] mb-3 block">
                    {product.categoryName}
                  </span>
                  <Link to={`/prodotto/${product.id}`}>
                    <h3 className="text-2xl font-bold mb-4 italic group-hover:text-gold transition-colors line-clamp-1">
                      {t(product, 'name')}
                    </h3>
                  </Link>
                  <p className="text-slate-500 text-sm mb-8 line-clamp-2 font-medium leading-relaxed">
                    {t(product, 'description')}
                  </p>
                  
                  <div className="flex justify-between items-center py-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-2xl font-display font-bold text-brand-900">
                      <Euro size={20} className="text-gold" />
                      {Number(product.price).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </div>
                    <Link 
                      to={`/prodotto/${product.id}`}
                      className="flex items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-full hover:bg-gold transition-all"
                    >
                      <ChevronRight size={24} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Package size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Nessun prodotto trovato</h3>
            <p className="text-slate-400">Prova a cambiare i filtri o i termini di ricerca.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedBrand('all');
              }}
              className="mt-8 text-gold font-bold underline underline-offset-8"
            >
              Resetta tutti i filtri
            </button>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gold rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="relative z-10 max-w-xl text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 italic">Supporto Tecnico <br/> Specializzato</h2>
            <p className="text-lg opacity-90 font-medium leading-relaxed">
              Hai bisogno di una consulenza tecnica per scegliere l'impianto giusto per la tua officina? I nostri ingegneri sono a tua disposizione.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link 
              to="/contatti" 
              className="px-10 py-5 bg-brand-900 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-brand-800 transition-all shadow-xl"
            >
              Contattaci <ArrowRight size={20} />
            </Link>
          </div>
          
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/4" />
        </div>
      </section>
    </div>
  );
};

