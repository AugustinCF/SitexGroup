import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../lib/LanguageContext';
import { ChevronRight } from 'lucide-react';

export const BrandsPage = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    fetch('/api/brands')
      .then(res => res.json())
      .then(data => setBrands(data.filter((b: any) => b.visibility)));
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <section className="py-20 bg-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-display font-bold mb-6 italic"
          >
            I Nostri Partner
          </motion.h1>
          <p className="text-xl text-slate-400 max-w-3xl">
            Scegliamo l'eccellenza per la tua produzione industriale.
          </p>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-xl transition-all group"
            >
              <Link to={`/marchi/${brand.slug}`} className="block h-48 p-8 bg-slate-50 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name_it} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-2xl font-bold text-slate-300">{brand.name_it}</span>
                )}
              </Link>
              <div className="p-8 flex-1 flex flex-col">
                <Link to={`/marchi/${brand.slug}`}>
                  <h4 className="text-2xl font-bold mb-3 italic group-hover:text-gold transition-colors">{brand.name_it}</h4>
                </Link>
                <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {t(brand, 'description')}
                </p>
                <Link 
                  to={`/marchi/${brand.slug}`} 
                  className="mt-auto flex items-center gap-2 text-sm font-bold text-brand-900 group-hover:text-gold transition-colors"
                >
                  Vedi Prodotti <ChevronRight size={16} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
