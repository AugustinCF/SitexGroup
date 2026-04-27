import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Key } from 'lucide-react';
import { motion } from 'motion/react';

export const LoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch('/api/check-auth');
      const data = await response.json();
      if (data.isAdmin) {
        navigate('/catalogo');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (data.success) {
        navigate('/catalogo');
      } else {
        setError(data.message || 'Accesso negato');
      }
    } catch (err) {
      console.error('Errore dettagliato:', err);
      setError('Errore di connessione: verifica che il server Node sia attivo sulla porta 3000');
    }
  };

  return (
    <div className="min-h-screen pt-24 bg-brand-900 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl text-center"
      >
        <div className="w-20 h-20 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mx-auto mb-8">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-3xl font-display font-bold text-brand-900 mb-4">Area Riservata</h1>
        <p className="text-slate-500 mb-10 leading-relaxed font-medium">
          Inserisci la password amministratore per gestire il catalogo prodotti.
        </p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="password"
              placeholder="Inserisci Password"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-gold transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-bold">{error}</p>
          )}
          
          <button 
            type="submit"
            className="w-full py-4 bg-brand-900 text-white font-bold rounded-xl hover:bg-brand-800 transition-all shadow-lg"
          >
            Accedi ora
          </button>
        </form>
        
        <div className="mt-8 pt-8 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            TPC Group • Sicurezza & Controllo Locale
          </p>
        </div>
      </motion.div>
    </div>
  );
};
