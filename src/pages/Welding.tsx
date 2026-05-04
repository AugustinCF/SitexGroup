import React from 'react';
import { motion } from 'motion/react';
import { Zap, Cpu, Settings, Target } from 'lucide-react';
import { ProductCarousel } from '../components/ProductCarousel';

export const WeldingPage = () => {
  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <section className="py-20 bg-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-display font-bold mb-6 uppercase"
          >
            Saldatura & Automazione
          </motion.h1>
          <p className="text-xl text-slate-400 max-w-3xl">
            Dal banco di lavoro manuale alle linee robotizzate più complesse. Siamo il core partner per la tua officina 4.0.
          </p>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-3xl font-bold mb-6">Sistemi di Saldatura Manuale</h2>
              <p className="text-slate-600 mb-8 font-medium">Offriamo le migliori tecnologie per ogni esigenza di saldatura professionale:</p>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <Zap className="text-gold" />
                  <span className="font-bold">MIG / MAG</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <Target className="text-gold" />
                  <span className="font-bold">TIG</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <Zap className="text-gold" />
                  <span className="font-bold">Laser</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <Target className="text-gold" />
                  <span className="font-bold">Plasma</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-3xl font-bold mb-6 italic">Integrazione Cobot & Robotica</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Progettiamo e integriamo celle di saldatura automatizzate utilizzando robot industriali e Cobot (robot collaborativi). Questi sistemi garantiscono:
              </p>
              <ul className="grid grid-cols-2 gap-4">
                {["Aumento della produttività", "Precisione millimetrica", "Riduzione degli scarti", "Maggiore sicurezza"].map((item, i) => (
                  <li key={i} className="flex gap-2 font-medium text-slate-800">
                    <span className="text-gold font-bold">/</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gold p-8 rounded-3xl text-white">
              <div className="mb-4 bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center">
                <Settings size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Impianti su Misura</h3>
              <p className="opacity-90 font-medium">
                Ogni azienda produce pezzi unici. Realizziamo posizionatori, manipolatori e travi di saldatura progettati specificamente per il tuo flusso di lavoro.
              </p>
            </div>
            
            <div className="rounded-3xl overflow-hidden shadow-lg h-64 border border-slate-200 bg-white flex items-center justify-center p-8 text-center italic text-slate-400">
              [Immagine Impianto Saldatura Robotizzata]
            </div>
          </div>
        </div>
      </section>

      <ProductCarousel 
        categorySlug="saldatura" 
        title="Catalogo Saldatura" 
        buttonText="Vedi tutti i prodotti per Saldatura" 
      />
    </div>
  );
};
