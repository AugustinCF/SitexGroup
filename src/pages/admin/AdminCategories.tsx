import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { Plus, Trash2, Edit, Save, X, Globe, Eye, Image as ImageIcon } from 'lucide-react';

export const AdminCategories = () => {
  const { lang } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setIsEditing(null);
    setFormData({});
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (imageFile) data.append('image', imageFile);

    const url = isEditing ? `/api/categories/${isEditing.id}` : '/api/categories';
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, { method, body: data });
    if (res.ok) {
      resetForm();
      fetchCategories();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminare questa categoria?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  const languages = ['it', 'en', 'es', 'de', 'fr'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestione Categorie</h1>
        {!isEditing && Object.keys(formData).length === 0 && (
          <button 
            onClick={() => setFormData({})}
            className="flex items-center gap-2 px-6 py-3 bg-gold text-white font-bold rounded-xl"
          >
            <Plus size={20} /> Nuova Categoria
          </button>
        )}
      </div>

      {(isEditing || Object.keys(formData).length > 0) && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <h2 className="text-xl font-bold mb-6 italic">{isEditing ? 'Modifica Categoria' : 'Nuova Categoria'}</h2>
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
                <div className="space-y-2">
                  <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <ImageIcon size={16} /> Immagine di Copertina:
                  </span>
                  <input 
                    type="file" 
                    onChange={e => setImageFile(e.target.files?.[0] || null)}
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
                <Save size={20} /> Salva Categoria
              </button>
              <button type="button" onClick={resetForm} className="px-8 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">
                Annulla
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="h-32 bg-slate-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-slate-100">
              {cat.image ? (
                <img src={cat.image} alt={cat.name_it} className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-300 font-bold uppercase text-xs flex flex-col items-center gap-2">
                  <ImageIcon size={24} /> No Image
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold mb-1">{cat.name_it}</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">/{cat.slug}</p>
            
            <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-slate-50">
              <button 
                onClick={() => {
                  setIsEditing(cat);
                  setFormData(cat);
                }}
                className="p-2 text-slate-400 hover:text-gold transition-colors"
              >
                <Edit size={18} />
              </button>
              <button 
                onClick={() => handleDelete(cat.id)}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
