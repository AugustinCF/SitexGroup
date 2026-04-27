import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, LogIn, LogOut, Package, Euro } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const CatalogPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isManagingLists, setIsManagingLists] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    internalCode: '',
    category: '',
    brand: '',
    condition: 'Nuovo',
    price: 0
  });

  const loadProducts = async () => {
    try {
      const response = await window.fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Errore nel caricamento prodotti:', error);
    }
  };

  const loadLists = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        window.fetch('/api/categories'),
        window.fetch('/api/brands')
      ]);
      setCategories(await catRes.json());
      setBrands(await brandRes.json());
    } catch (error) {
      console.error('Errore nel caricamento liste:', error);
    }
  };

  const verifyAuth = async () => {
    try {
      const response = await window.fetch('/api/check-auth');
      const data = await response.json();
      setIsAdmin(data.isAdmin);
    } catch (error) {
      console.error('Errore nel controllo auth:', error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadLists();
    verifyAuth();
  }, []);

  const handleManageList = async (type: 'categories' | 'brands', action: 'add' | 'delete', value?: any) => {
    if (!isAdmin) return;
    try {
      if (action === 'add') {
        const name = type === 'categories' ? newCategoryName : newBrandName;
        if (!name) return;
        const res = await window.fetch(`/api/${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
        if (res.ok) {
          if (type === 'categories') setNewCategoryName('');
          else setNewBrandName('');
          loadLists();
        }
      } else {
        const res = await window.fetch(`/api/${type}/${value}`, { method: 'DELETE' });
        if (res.ok) loadLists();
      }
    } catch (error) {
      console.error(`Errore gestione ${type}:`, error);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('internalCode', formData.internalCode);
    data.append('category', formData.category);
    data.append('brand', formData.brand);
    data.append('condition', formData.condition);
    data.append('price', formData.price.toString());

    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        data.append('images', selectedFiles[i]);
      }
    }

    try {
      const response = await window.fetch('/api/products', {
        method: 'POST',
        body: data
      });

      if (response.ok) {
        setIsAdding(false);
        setFormData({ title: '', description: '', internalCode: '', category: '', brand: '', condition: 'Nuovo', price: 0 });
        setSelectedFiles(null);
        loadProducts();
      } else {
        const errorData = await response.json();
        alert(`Errore: ${errorData.error || 'Invio fallito'}`);
      }
    } catch (error) {
      console.error('Errore durante l\'aggiunta:', error);
      alert('Errore di connessione al server');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Eliminare questo prodotto?')) return;
    try {
      const response = await window.fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        loadProducts();
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione:', error);
    }
  };

  const handleLogout = async () => {
    await window.fetch('/api/logout', { method: 'POST' });
    setIsAdmin(false);
    navigate('/');
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <section className="py-20 bg-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-display font-bold mb-6 italic"
            >
              Catalogo Prodotti
            </motion.h1>
            <p className="text-xl text-slate-400 max-w-2xl">
              Esplora i nostri marchi e macchinari professionali.
            </p>
          </div>
          
          <div className="flex gap-4">
            {isAdmin && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-300">Area Admin Attiva</span>
                <button 
                  onClick={() => setIsManagingLists(!isManagingLists)}
                  className={`p-3 rounded-lg transition-all ${isManagingLists ? 'bg-gold text-white' : 'bg-white/10 hover:bg-white/20'}`}
                  title="Gestione Categorie e Marchi"
                >
                  <Package size={20} />
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
                <button 
                  onClick={() => setIsAdding(!isAdding)}
                  className="flex items-center gap-2 px-6 py-3 bg-gold text-white font-bold rounded-lg hover:brightness-110 transition-all shadow-lg shadow-gold/20"
                >
                  <Plus size={20} /> Aggiungi Prodotto
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {isManagingLists && isAdmin && (
        <section className="py-12 max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gestione Categorie */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-4 italic">Gestione Categorie</h3>
              <div className="flex gap-2 mb-4">
                <input 
                  placeholder="Nuova Categoria"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-gold"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                />
                <button 
                  onClick={() => handleManageList('categories', 'add')}
                  className="p-2 bg-brand-900 text-white rounded-lg hover:bg-brand-800"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {categories.map(cat => (
                  <div key={cat.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg group">
                    <span className="text-sm font-medium">{cat.name}</span>
                    <button 
                      onClick={() => handleManageList('categories', 'delete', cat.id)}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Gestione Marchi */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-4 italic">Gestione Marchi</h3>
              <div className="flex gap-2 mb-4">
                <input 
                  placeholder="Nuovo Marchio"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-gold"
                  value={newBrandName}
                  onChange={e => setNewBrandName(e.target.value)}
                />
                <button 
                  onClick={() => handleManageList('brands', 'add')}
                  className="p-2 bg-brand-900 text-white rounded-lg hover:bg-brand-800"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {brands.map(brand => (
                  <div key={brand.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg group">
                    <span className="text-sm font-medium">{brand.name}</span>
                    <button 
                      onClick={() => handleManageList('brands', 'delete', brand.id)}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {isAdding && isAdmin && (
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
              <div className="grid grid-cols-2 gap-4">
                <select 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-gold text-slate-500"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Seleziona Categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <select 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-gold text-slate-500"
                  value={formData.brand}
                  onChange={e => setFormData({...formData, brand: e.target.value})}
                >
                  <option value="">Seleziona Marchio</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.name}>{brand.name}</option>
                  ))}
                </select>
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
                <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-1">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, condition: 'Nuovo'})}
                    className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${formData.condition === 'Nuovo' ? 'bg-brand-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    Nuovo
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, condition: 'Usato'})}
                    className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${formData.condition === 'Usato' ? 'bg-brand-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    Usato
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Immagini Prodotto (max 10)</label>
                <input 
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={e => setSelectedFiles(e.target.files)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20"
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
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 group hover:shadow-xl transition-all flex flex-col"
            >
              <Link to={`/prodotto/${product.id}`} className="h-56 relative bg-slate-100 overflow-hidden">
                <img 
                  src={product.imageUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop'} 
                  alt={product.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-brand-900/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">
                  {product.internalCode}
                </div>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${product.condition === 'Nuovo' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                    {product.condition}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="bg-gold/90 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-bold uppercase">{product.category}</span>
                  <span className="bg-white/90 backdrop-blur-sm text-brand-900 px-2 py-1 rounded text-[10px] font-bold uppercase">{product.brand}</span>
                </div>
              </Link>
              <div className="p-8 flex-1 flex flex-col">
                <Link to={`/prodotto/${product.id}`}>
                  <h4 className="text-xl font-bold mb-2 group-hover:text-gold transition-colors">{product.title}</h4>
                </Link>
                <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {product.description}
                </p>
                <div className="mt-auto flex justify-between items-center pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-gold font-bold text-xl font-display">
                    <Euro size={18} />
                    {Number(product.price).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                  </div>
                  
                  {isAdmin && (
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

      {/* Login footer removed in favor of dedicated /accedi-al-catalogo route */}
    </div>
  );
};
