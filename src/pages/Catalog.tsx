import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db, auth, signInWithGoogle, logout } from '../lib/firebase';
import { motion } from 'motion/react';
import { Plus, Trash2, LogIn, LogOut, Package, Euro } from 'lucide-react';

export const CatalogPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    internalCode: '',
    imageUrl: '',
    price: 0
  });

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prods);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSnapshot();
    };
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'products'), {
        ...formData,
        price: Number(formData.price),
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop'
      });
      setIsAdding(false);
      setFormData({ title: '', description: '', internalCode: '', imageUrl: '', price: 0 });
    } catch (error) {
      console.error('Errore durante l\'aggiunta:', error);
      alert('Errore: ' + (error as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Eliminare questo prodotto?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error('Errore durante l\'eliminazione:', error);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <section className="py-20 bg-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-end">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-display font-bold mb-6 italic"
            >
              Catalogo Prodotti
            </motion.h1>
            <p className="text-xl text-slate-400 max-w-2xl">
              Gestione inventario e soluzioni tecniche TPC Group.
            </p>
          </div>
          
          <div className="flex gap-4">
            {!user ? (
              <button 
                onClick={signInWithGoogle}
                className="flex items-center gap-2 px-6 py-3 bg-white text-brand-900 font-bold rounded-lg hover:bg-slate-100 transition-all"
              >
                <LogIn size={20} /> Login Operatore
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-300">Ciao, {user.displayName}</span>
                <button 
                  onClick={logout}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                >
                  <LogOut size={20} />
                </button>
                <button 
                  onClick={() => setIsAdding(!isAdding)}
                  className="flex items-center gap-2 px-6 py-3 bg-gold text-white font-bold rounded-lg hover:brightness-110 transition-all"
                >
                  <Plus size={20} /> Aggiungi Prodotto
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {isAdding && user && (
        <section className="py-12 max-w-3xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200"
          >
            <h3 className="text-2xl font-bold mb-6 italic">Nuovo Prodotto</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input 
                  placeholder="Titolo Prodotto"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-gold"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
                <input 
                  placeholder="Codice Interno"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-gold"
                  value={formData.internalCode}
                  onChange={e => setFormData({...formData, internalCode: e.target.value})}
                />
              </div>
              <textarea 
                placeholder="Descrizione"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 h-32 outline-none focus:border-gold"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  placeholder="Prezzo (€)"
                  type="number"
                  step="0.01"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-gold"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                />
                <input 
                  placeholder="URL Immagine"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-gold"
                  value={formData.imageUrl}
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-4 bg-brand-900 text-white font-bold rounded-lg hover:bg-brand-800 transition-all">
                  Salva Prodotto
                </button>
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-8 py-4 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-all"
                >
                  Annulla
                </button>
              </div>
            </form>
          </motion.div>
        </section>
      )}

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <motion.div 
              key={product.id}
              layout
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 group hover:shadow-xl transition-all"
            >
              <div className="h-56 relative bg-slate-100 overflow-hidden">
                <img 
                  src={product.imageUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop'} 
                  alt={product.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-brand-900/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-widest">
                  {product.internalCode}
                </div>
              </div>
              <div className="p-8">
                <h4 className="text-xl font-bold mb-2 group-hover:text-gold transition-colors">{product.title}</h4>
                <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {product.description}
                </p>
                <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-gold font-bold text-xl font-display">
                    <Euro size={18} />
                    {product.price.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                  </div>
                  
                  {user && user.uid === product.creatorId && (
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="py-20 text-center">
            <Package size={64} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">Nessun prodotto nel catalogo.</p>
          </div>
        )}
      </section>
    </div>
  );
};
