import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithGoogle } from '../lib/firebase';
import { LogIn, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/catalogo');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
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
          L'accesso è consentito solo agli operatori autorizzati TPC Group per la gestione del catalogo prodotti.
        </p>
        
        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 py-4 bg-brand-900 text-white font-bold rounded-xl hover:bg-brand-800 transition-all shadow-lg"
        >
          <LogIn size={20} />
          Accedi con Google
        </button>
        
        <div className="mt-8 pt-8 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            TPC Group • Sicurezza & Controllo
          </p>
        </div>
      </motion.div>
    </div>
  );
};
