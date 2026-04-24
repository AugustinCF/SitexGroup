import React from 'react';
import { motion } from 'motion/react';
import { BRANDS } from '../constants';

export const BrandsPage = () => {
  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <section className="py-20 bg-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-display font-bold mb-6 uppercase tracking-tight"
          >
            I Nostri Partner
          </motion.h1>
          <p className="text-xl text-slate-400 max-w-3xl font-medium">
            Selezioniamo solo i migliori marchi a livello globale per offrire affidabilità e innovazione ai nostri clienti.
          </p>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {BRANDS.map((brand, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center group hover:shadow-xl transition-all"
            >
              <div className="h-24 flex items-center justify-center mb-6 grayscale group-hover:grayscale-0 transition-all opacity-60 group-hover:opacity-100">
                <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-brand-900 italic uppercase">{brand.name}</h4>
              <span className="text-xs font-bold tracking-widest text-gold uppercase bg-gold/10 px-2 py-1 rounded">{brand.category}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-6 italic">Vuoi diventare nostro partner?</h3>
          <p className="text-slate-600 mb-8 leading-relaxed font-medium">
            Siamo sempre alla ricerca di tecnologie innovative da proporre ai nostri clienti nel settore metalmeccanico. Contattaci per discutere possibili collaborazioni.
          </p>
          <a href="#contact" className="inline-block px-8 py-4 bg-brand-900 text-white font-bold rounded-lg hover:bg-brand-800 transition-colors">
            Collabora con noi
          </a>
        </div>
      </section>
    </div>
  );
};
