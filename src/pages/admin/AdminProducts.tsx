import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { Plus, Trash2, Edit, Save, X, Globe, Eye, EyeOff, Euro, Image as ImageIcon } from 'lucide-react';

export const AdminProducts = () => {
  const { lang } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);

  const fetchAll = async () => {
    try {
      const [pRes, bRes, cRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/brands'),
        fetch('/api/categories')
      ]);
      
      if (!pRes.ok) console.error('Products fetch failed:', pRes.status, pRes.statusText);
      if (!bRes.ok) console.error('Brands fetch failed:', bRes.status, bRes.statusText);
      if (!cRes.ok) console.error('Categories fetch failed:', cRes.status, cRes.statusText);

      const pData = await pRes.json();
      const bData = await bRes.json();
      const cData = await cRes.json();
      
      setProducts(pData);
      setBrands(bData);
      setCategories(cData);
    } catch (error: any) {
      console.error('Detailed fetch error:', error);
      // Fallback or alert if needed
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const resetForm = () => {
    setIsEditing(null);
    setFormData({});
    setImageFiles(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) data.append(key, formData[key]);
    });
    if (imageFiles) {
      for (let i = 0; i < imageFiles.length; i++) {
        data.append('images', imageFiles[i]);
      }
    }

    const url = isEditing ? `/api/products/${isEditing.id}` : '/api/products';
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, { method, body: data });
    if (res.ok) {
      resetForm();
      fetchAll();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questo prodotto?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const languages = ['it', 'en', 'es', 'de', 'fr'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestione Prodotti</h1>
        {!isEditing && Object.keys(formData).length === 0 && (
          <button 
            onClick={() => setFormData({ visibility: 'true', price: 0 })}
            className="flex items-center gap-2 px-6 py-3 bg-gold text-white font-bold rounded-xl"
          >
            <Plus size={20} /> Nuovo Prodotto
          </button>
        )}
      </div>

      {(isEditing || Object.keys(formData).length > 0) && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <h2 className="text-xl font-bold mb-6 italic">{isEditing ? 'Modifica Prodotto' : 'Nuovo Prodotto'}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                {languages.map(l => (
                  <div key={l} className="flex gap-2 items-center">
                    <span className="w-8 font-bold uppercase text-xs text-slate-400">{l}</span>
                    <input 
                      placeholder={`Nome (${l.toUpperCase()})`}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2"
                      value={formData[`name_${l}`] || ''}
                      onChange={e => setFormData({...formData, [`name_${l}`]: e.target.value})}
                      required={l === 'it'}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <input 
                  placeholder="Slug (opzionale)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  value={formData.slug || ''}
                  onChange={e => setFormData({...formData, slug: e.target.value})}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <select 
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm"
                    value={formData.brandId || ''}
                    onChange={e => setFormData({...formData, brandId: e.target.value})}
                  >
                    <option value="">Seleziona Marchio</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name_it}</option>)}
                  </select>
                  <select 
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm"
                    value={formData.categoryId || ''}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  >
                    <option value="">Seleziona Categoria</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name_it}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2">
                    <Euro size={16} className="text-slate-400" />
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="Prezzo"
                      className="flex-1 bg-transparent text-sm outline-none"
                      value={formData.price || ''}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-4 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, visibility: formData.visibility === 'true' ? 'false' : 'true'})}
                      className={`flex-1 flex items-center justify-center gap-2 py-1 rounded-md text-xs font-bold ${formData.visibility === 'true' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {formData.visibility === 'true' ? <Eye size={14} /> : <EyeOff size={14} />}
                      {formData.visibility === 'true' ? 'Visibile' : 'Nascosto'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <ImageIcon size={16} /> Galleria Immagini:
                  </span>
                  <input 
                    type="file" 
                    multiple
                    onChange={e => setImageFiles(e.target.files)}
                    className="w-full text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <span className="text-sm font-bold text-slate-400 block uppercase tracking-widest">Descrizioni</span>
                {languages.map(l => (
                  <textarea 
                    key={l}
                    placeholder={`Descrizione (${l.toUpperCase()})`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 h-20 text-sm"
                    value={formData[`description_${l}`] || ''}
                    onChange={e => setFormData({...formData, [`description_${l}`]: e.target.value})}
                  />
                ))}
              </div>
              <div className="space-y-4">
                <span className="text-sm font-bold text-slate-400 block uppercase tracking-widest">SEO Meta</span>
                {languages.map(l => (
                  <div key={l} className="space-y-1">
                    <input 
                      placeholder={`Meta Title (${l.toUpperCase()})`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                      value={formData[`meta_title_${l}`] || ''}
                      onChange={e => setFormData({...formData, [`meta_title_${l}`]: e.target.value})}
                    />
                    <input 
                      placeholder={`Meta Description (${l.toUpperCase()})`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                      value={formData[`meta_description_${l}`] || ''}
                      onChange={e => setFormData({...formData, [`meta_description_${l}`]: e.target.value})}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="flex-1 py-3 bg-brand-900 text-white font-bold rounded-xl hover:bg-brand-800 transition-all flex items-center justify-center gap-2">
                <Save size={20} /> Salva Prodotto
              </button>
              <button type="button" onClick={resetForm} className="px-8 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">
                Annulla
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col group overflow-hidden">
            <div className="h-44 bg-slate-50 flex items-center justify-center overflow-hidden relative">
              {product.images && product.images.length > 0 ? (
                <img src={product.images[0]} alt={product.name_it} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-300 italic text-xs">
                  <ImageIcon size={24} /> No Image
                </div>
              )}
              <div className="absolute top-2 left-2 flex gap-1">
                <span className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] font-bold uppercase text-brand-900 border border-slate-100 shadow-sm">
                  {product.brandName || 'No Brand'}
                </span>
                <span className="bg-gold/90 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] font-bold uppercase text-white border border-gold/10 shadow-sm">
                  {product.categoryName || 'No Cat'}
                </span>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-slate-800 line-clamp-1">{product.name_it}</h3>
              <p className="text-[10px] text-slate-400 font-mono mb-3">/{product.slug}</p>
              
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50">
                <div className="text-gold font-bold flex items-center gap-1">
                  <Euro size={12} /> {Number(product.price).toLocaleString('it-IT')}
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => {
                      setIsEditing(product);
                      setFormData({
                        ...product,
                        visibility: product.visibility ? 'true' : 'false'
                      });
                    }}
                    className="p-2 text-slate-400 hover:text-gold transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
