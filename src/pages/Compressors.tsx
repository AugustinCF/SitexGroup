import React from 'react';
import { motion } from 'motion/react';
import { Wind, Gauge, Droplets, ShieldCheck } from 'lucide-react';

export const CompressorsPage = () => {
  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <section className="py-20 bg-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-display font-bold mb-6"
          >
            Aria Compressa Professional
          </motion.h1>
          <p className="text-xl text-slate-400 max-w-3xl">
            Soluzioni complete per la generazione, il trattamento e la distribuzione di aria compressa industriale con il brand Power System.
          </p>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            { title: "Efficienza", icon: Wind, desc: "Riduzione dei consumi energetici" },
            { title: "Potenza", icon: Gauge, desc: "Compressori a vite e pistone" },
            { title: "Purezza", icon: Droplets, desc: "Essiccatori e filtri certificati" },
            { title: "Normativa", icon: ShieldCheck, desc: "Impianti a norma PED" }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:translate-y-[-4px] transition-transform">
              <feature.icon className="text-gold mb-4" size={32} />
              <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
              <p className="text-sm text-slate-500">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 flex flex-col md:flex-row">
          <div className="p-12 md:w-1/2">
            <h2 className="text-3xl font-bold mb-6">Power System</h2>
            <p className="text-slate-600 mb-8 leading-relaxed italic">
              Siamo distributori e partner per l'assistenza di Power System, leader mondiale nella produzione di compressori. Offriamo installazione chiavi in mano e consulenza per il dimensionamento ottimale del tuo impianto pneumatici.
            </p>
            <div className="space-y-4">
              <div className="font-bold border-l-2 border-gold pl-4 text-brand-900">Dimensionamento calcolato sui consumi reali</div>
              <div className="font-bold border-l-2 border-gold pl-4 text-brand-900">Certificazione impianti e audit energetici</div>
              <div className="font-bold border-l-2 border-gold pl-4 text-brand-900">Noleggio operativo e soluzioni su misura</div>
            </div>
          </div>
          <div className="md:w-1/2 bg-brand-800 flex items-center justify-center p-12 text-white/20 font-bold text-4xl">
            POWER SYSTEM PRODUCTS
          </div>
        </div>
      </section>
    </div>
  );
};
