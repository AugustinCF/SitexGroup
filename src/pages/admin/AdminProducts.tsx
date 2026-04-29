import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { Plus, Trash2, Edit, Save, X, Globe, Eye, EyeOff, Euro, Image as ImageIcon, ListTree } from 'lucide-react';

export const AdminProducts = () => {
  const { lang } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [attributeDefinitions, setAttributeDefinitions] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [newAttr, setNewAttr] = useState({ attributeDefinitionId: '', value_it: '', value_en: '', order: 0 });

  const fetchAll = async () => {
    try {
      const [pRes, bRes, cRes, dRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/brands'),
        fetch('/api/categories'),
        fetch('/api/attribute-definitions')
      ]);

      if (pRes.ok) setProducts(await pRes.json());
      if (bRes.ok) setBrands(await bRes.json());
      if (cRes.ok) setCategories(await cRes.json());
      if (dRes.ok) setAttributeDefinitions(await dRes.json());
      
      if (!pRes.ok || !bRes.ok || !cRes.ok || !dRes.ok) {
        console.error('Some APIs failed to load');
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const fetchAttributes = async (productId: number) => {
    const res = await fetch(`/api/products/${productId}/attributes`);
    if (res.ok) setAttributes(await res.json());
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const resetForm = () => {
    setIsEditing(null);
    setFormData({});
    setImageFiles(null);
    setAttributes([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      // Don't send relation arrays or nulls
      if (formData[key] !== null && typeof formData[key] !== 'object') {
        data.append(key, formData[key]);
      }
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

  const handleAddAttribute = async () => {
    if (!isEditing) return;
    const res = await fetch(`/api/products/${isEditing.id}/attributes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAttr)
    });
    if (res.ok) {
      setNewAttr({ attributeDefinitionId: '', value_it: '', value_en: '', order: attributes.length + 1 });
      fetchAttributes(isEditing.id);
    }
  };

  const handleDeleteAttribute = async (id: number) => {
    const res = await fetch(`/api/attributes/${id}`, { method: 'DELETE' });
    if (res.ok && isEditing) fetchAttributes(isEditing.id);
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

            <div className="grid grid-cols-1 gap-6 pt-6 border-t border-slate-100">
              <div className="space-y-4">
                <span className="text-sm font-bold text-brand-900 block uppercase tracking-widest flex items-center gap-2">
                  <ListTree size={18} /> Attributi Tecnici
                </span>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                          <tr>
                            <th className="p-3">Attributo (Nome)</th>
                            <th className="p-3">Valore (IT/EN)</th>
                            <th className="p-3">Ordine</th>
                            <th className="p-3">Azioni</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {attributes.map(attr => (
                            <tr key={attr.id} className="hover:bg-slate-50/50">
                              <td className="p-3 font-medium">
                                <div>{attr.definition?.name_it}</div>
                                <div className="text-slate-400 text-[10px] italic">{attr.definition?.name_en}</div>
                              </td>
                              <td className="p-3">
                                <div>{attr.value_it}</div>
                                <div className="text-slate-400 text-[10px] italic">{attr.value_en}</div>
                              </td>
                              <td className="p-3 text-slate-500">{attr.order}</td>
                              <td className="p-3">
                                <button type="button" onClick={() => handleDeleteAttribute(attr.id)} className="text-red-400 hover:text-red-600">
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl grid grid-cols-1 md:grid-cols-5 gap-3 items-end border border-slate-100">
                      <div className="space-y-1 col-span-1 text-left">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Scegli Attributo</label>
                        <select 
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                          value={newAttr.attributeDefinitionId}
                          onChange={e => setNewAttr({...newAttr, attributeDefinitionId: e.target.value})}
                        >
                          <option value="">Seleziona...</option>
                          {attributeDefinitions.map(def => (
                            <option key={def.id} value={def.id}>{def.name_it}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Valore IT/EN</label>
                        <input 
                          placeholder="es. 10kg"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                          value={newAttr.value_it}
                          onChange={e => setNewAttr({...newAttr, value_it: e.target.value})}
                        />
                        <input 
                          placeholder="es. 10kg"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                          value={newAttr.value_en}
                          onChange={e => setNewAttr({...newAttr, value_en: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Ordine</label>
                        <input 
                          type="number"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                          value={newAttr.order}
                          onChange={e => setNewAttr({...newAttr, order: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={handleAddAttribute}
                        className="py-2.5 bg-brand-900 text-white font-bold rounded-lg hover:bg-brand-800 transition-all text-xs"
                      >
                        Aggiungi
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Salva il prodotto per poter aggiungere attributi tecnici.</p>
                )}
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
                      fetchAttributes(product.id);
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
