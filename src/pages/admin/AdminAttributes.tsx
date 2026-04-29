import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { Trash2, Edit, Save, X, ListTree, Package, Search } from 'lucide-react';

export const AdminAttributes = () => {
  const { t } = useLanguage();
  const [attributes, setAttributes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});

  const fetchAttributes = async () => {
    const res = await fetch('/api/attributes');
    if (res.ok) setAttributes(await res.json());
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Sicuro di voler eliminare questo attributo?')) return;
    const res = await fetch(`/api/attributes/${id}`, { method: 'DELETE' });
    if (res.ok) fetchAttributes();
  };

  const handleUpdate = async (id: number) => {
    const res = await fetch(`/api/attributes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData)
    });
    if (res.ok) {
      setIsEditing(null);
      fetchAttributes();
    }
  };

  const filteredAttributes = attributes.filter(attr => {
    const label = `${attr.name_it} ${attr.value_it} ${attr.product?.name_it}`.toLowerCase();
    return label.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-brand-900 italic flex items-center gap-2">
            <ListTree className="text-gold" /> Gestione Attributi
          </h2>
          <p className="text-slate-500 text-sm">Visualizza e modifica tutti gli attributi tecnici dei prodotti.</p>
        </div>
        
        <div className="relative group min-w-[300px]">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-gold transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text"
            placeholder="Cerca per nome, valore o prodotto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100">
              <tr>
                <th className="p-6">Prodotto</th>
                <th className="p-6">Nome (IT/EN)</th>
                <th className="p-6">Valore (IT/EN)</th>
                <th className="p-6">Ordine</th>
                <th className="p-6 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAttributes.map((attr) => (
                <tr key={attr.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-brand-900 text-sm">{attr.product?.name_it || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-medium">ID Prodotto: {attr.productId}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-6">
                    {isEditing === attr.id ? (
                      <div className="space-y-2">
                        <input 
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                          value={editData.name_it}
                          onChange={e => setEditData({...editData, name_it: e.target.value})}
                          placeholder="Nome IT"
                        />
                        <input 
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                          value={editData.name_en || ''}
                          onChange={e => setEditData({...editData, name_en: e.target.value})}
                          placeholder="Nome EN"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-medium text-slate-700">{attr.name_it}</div>
                        <div className="text-xs text-slate-400 italic">{attr.name_en}</div>
                      </div>
                    )}
                  </td>

                  <td className="p-6">
                    {isEditing === attr.id ? (
                      <div className="space-y-2">
                        <input 
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                          value={editData.value_it}
                          onChange={e => setEditData({...editData, value_it: e.target.value})}
                          placeholder="Valore IT"
                        />
                        <input 
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                          value={editData.value_en || ''}
                          onChange={e => setEditData({...editData, value_en: e.target.value})}
                          placeholder="Valore EN"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-medium text-slate-700">{attr.value_it}</div>
                        <div className="text-xs text-slate-400 italic">{attr.value_en}</div>
                      </div>
                    )}
                  </td>

                  <td className="p-6">
                    {isEditing === attr.id ? (
                      <input 
                        type="number"
                        className="w-20 bg-white border border-slate-200 rounded-lg p-2 text-xs"
                        value={editData.order}
                        onChange={e => setEditData({...editData, order: parseInt(e.target.value) || 0})}
                      />
                    ) : (
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg text-xs font-bold text-slate-500">
                        {attr.order}
                      </span>
                    )}
                  </td>

                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      {isEditing === attr.id ? (
                        <>
                          <button 
                            onClick={() => handleUpdate(attr.id)}
                            className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all"
                            title="Salva"
                          >
                            <Save size={18} />
                          </button>
                          <button 
                            onClick={() => setIsEditing(null)}
                            className="p-2 bg-slate-50 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"
                            title="Annulla"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => {
                              setIsEditing(attr.id);
                              setEditData(attr);
                            }}
                            className="p-2 text-slate-400 hover:text-gold hover:bg-gold/5 rounded-xl transition-all"
                            title="Modifica"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(attr.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Elimina"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAttributes.length === 0 && (
          <div className="p-20 text-center">
            <ListTree size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium italic">Nessun attributo trovato.</p>
          </div>
        )}
      </div>
    </div>
  );
};
