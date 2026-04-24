import React from 'react';
import { motion } from 'motion/react';
import { Wrench, Clock, ShieldCheck, Headphones } from 'lucide-react';

export const AssistancePage = () => {
  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <section className="py-20 bg-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-display font-bold mb-6"
          >
            Assistenza Tecnica Specializzata
          </motion.h1>
          <p className="text-xl text-slate-400 max-w-3xl">
            Supporto rapido, manutenzione preventiva e riparazioni certificate per garantire la massima continuità operativa dei tuoi impianti.
          </p>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center text-gold flex-shrink-0">
                <Clock size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Intervento Rapido</h3>
                <p className="text-slate-600 italic leading-relaxed">
                  Consapevoli che ogni minuto di fermo macchina è un costo, offriamo servizi di assistenza on-site veloci ed efficienti in tutta la Toscana.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center text-gold flex-shrink-0">
                <Wrench size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Riparazioni Certificati</h3>
                <p className="text-slate-600 leading-relaxed">
                  Utilizziamo solo ricambi originali e tecnici altamente qualificati per riparare saldatrici, impianti di taglio e compressori.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center text-gold flex-shrink-0">
                <Clock size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Manutenzione Programmata</h3>
                <p className="text-slate-600 leading-relaxed">
                  Piani di manutenzione preventiva per estendere la vita dei macchinari e prevenire guasti improvvisi.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-2xl font-bold mb-6 italic">Taratura e Certificazione</h3>
            <p className="text-slate-600 mb-6 font-medium">
              Eseguiamo tarature periodiche degli impianti di saldatura secondo le normative UNI EN ISO per garantire la conformità dei processi produttivi e la sicurezza dei lavoratori.
            </p>
            <ul className="space-y-4">
              {["Validazione impianti di saldatura", "Analisi gas e aria compressa", "Certificazioni CE e industria 4.0", "Revisioni periodiche obbligatorie"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700">
                  <ShieldCheck className="text-gold" size={20} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-8 border-t border-slate-100 flex items-center gap-4">
              <Headphones size={40} className="text-gold" />
              <div>
                <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">Linea Diretta Supporto</div>
                <div className="text-xl font-bold text-brand-900">+39 0575 XXXXXX</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
