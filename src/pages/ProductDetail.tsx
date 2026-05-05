import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronRight, Package, Euro, Phone, Mail, ArrowLeft, ShieldCheck, Tag, Layers } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const { t, formatText } = useLanguage();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/by-slug/${slug}`);
        const data = await response.json();
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0]);
        } else {
          setMainImage('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop');
        }
      } catch (error) {
        console.error('Errore caricamento prodotto:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-32 min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-medium animate-pulse italic">Caricamento prodotto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 min-h-screen bg-slate-50 text-center">
        <Package size={64} className="mx-auto text-slate-200 mb-4" />
        <h2 className="text-2xl font-bold text-slate-400">Prodotto non trovato</h2>
        <Link to="/catalogo" className="mt-4 text-gold font-bold inline-flex items-center gap-2">
          <ArrowLeft size={20} /> Torna al catalogo
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-slate-50 pb-20">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 overflow-x-auto no-scrollbar whitespace-nowrap">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <ChevronRight size={16} className="flex-shrink-0" />
            <Link to="/catalogo" className="hover:text-gold transition-colors">Catalogo</Link>
            {product.category && (
              <>
                <ChevronRight size={16} className="flex-shrink-0" />
                <Link to={`/categorie/${product.category.slug}`} className="hover:text-gold transition-colors">{product.categoryName}</Link>
              </>
            )}
            <ChevronRight size={16} className="flex-shrink-0" />
            <span className="text-brand-900 truncate">{t(product, 'name')}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery Section */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200"
            >
              <img 
                src={mainImage} 
                alt={t(product, 'name')} 
                className="w-full h-full object-contain p-4"
              />
            </motion.div>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-4">
                {product.images.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-gold shadow-md' : 'border-transparent hover:border-slate-300'}`}
                  >
                    <img src={img} alt={`${t(product, 'name')} view ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white ${product.condition === 'Usato' ? 'bg-orange-500' : 'bg-green-600'}`}>
                {product.condition || 'Nuovo'}
              </span>
              <div className="flex flex-wrap gap-2">
                {product.category && (
                  <Link 
                    to={`/categorie/${product.category.slug}`}
                    className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 transition-colors px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-500"
                  >
                    <Layers size={12} /> {product.categoryName}
                  </Link>
                )}
                {product.brand && (
                  <Link 
                    to={`/marchi/${product.brand.slug}`}
                    className="flex items-center gap-1 bg-gold/10 hover:bg-gold/20 transition-colors px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-gold"
                  >
                    <Tag size={12} /> {product.brandName}
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-start justify-between gap-4 mb-4">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl md:text-5xl font-display font-bold text-brand-900 italic leading-tight"
              >
                {t(product, 'name')}
              </motion.h1>
              
              {product.brand?.logo && (
                <Link 
                  to={`/marchi/${product.brand.slug}`}
                  className="hidden sm:block flex-shrink-0 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-gold transition-all"
                >
                  <img 
                    src={product.brand.logo} 
                    alt={product.brandName} 
                    className="h-12 w-auto object-contain"
                  />
                </Link>
              )}
            </div>

            <div className="text-4xl font-display font-bold text-gold mb-10 flex items-center gap-2">
              <Euro size={32} />
              {product.price 
                ? Number(product.price).toLocaleString('it-IT', { minimumFractionDigits: 2 })
                : 'Trattativa Riservata'
              }
              {product.price && <span className="text-sm font-medium text-slate-400 ml-2 italic">+ IVA</span>}
            </div>

            <div className="prose prose-slate max-w-none mb-12">
              <h3 className="text-lg font-bold text-brand-900 mb-3 italic">Descrizione Prodotto</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {formatText(t(product, 'description'))}
              </p>
            </div>

            {product.attributes && product.attributes.length > 0 && (
              <div className="mb-12">
                <h3 className="text-lg font-bold text-brand-900 mb-4 italic flex items-center gap-2">
                  <Package size={20} className="text-gold" /> Specifiche Tecniche
                </h3>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  {product.attributes.map((attr: any, idx: number) => (
                    <div 
                      key={attr.id} 
                      className={`grid grid-cols-2 p-4 text-sm ${idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'} ${idx !== product.attributes.length - 1 ? 'border-b border-slate-100' : ''}`}
                    >
                      <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">{t(attr.definition, 'name')}</div>
                      <div className="text-brand-900 font-medium whitespace-pre-wrap">{formatText(t(attr, 'value'))}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a 
                href="tel:+39061234567"
                className="flex items-center justify-center gap-3 py-4 bg-brand-900 text-white font-bold rounded-xl hover:bg-brand-800 transition-all shadow-lg"
              >
                <Phone size={20} />
                Chiedi Informazioni
              </a>
              <a 
                href={`mailto:info@tpcsrl.com?subject=Informazioni Prodotto: ${t(product, 'name')}`}
                className="flex items-center justify-center gap-3 py-4 bg-white text-brand-900 border-2 border-brand-900 font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                <Mail size={20} />
                Invia Email
              </a>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200 flex items-center gap-3 text-slate-400">
              <ShieldCheck size={20} className="text-gold" />
              <p className="text-xs font-medium">Garanzia TPC Group e assistenza tecnica inclusa sull'installazione.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
