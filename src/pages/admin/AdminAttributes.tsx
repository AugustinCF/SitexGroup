import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../lib/LanguageContext';
import { Trash2, Edit, Save, X, ListTree, Search, Plus } from 'lucide-react';

export const AdminAttributes = () => {
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newData, setNewData] = useState<any>({ name_it: '', name_en: '' });

  const fetchDefinitions = async () => {
    const res = await fetch('/api/attribute-definitions');
    if (res.ok) setDefinitions(await res.json());
  };

  useEffect(() => {
    fetchDefinitions();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Sicuro di voler eliminare questa definizione? Tutti i valori associati nei prodotti verranno rimossi.')) return;
    const res = await fetch(`/api/attribute-definitions/${id}`, { method: 'DELETE' });
    if (res.ok) fetchDefinitions();
  };

  const handleUpdate = async (id: number) => {
    const res = await fetch(`/api/attribute-definitions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData)
    });
    if (res.ok) {
      setIsEditing(null);
      fetchDefinitions();
    }
  };

  const handleAdd = async () => {
    const res = await fetch('/api/attribute-definitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData)
    });
    if (res.ok) {
      setShowAdd(false);
      setNewData({ name_it: '', name_en: '' });
      fetchDefinitions();
    }
  };

  const filtered = definitions.filter(def => {
    const label = `${def.name_it} ${def.name_en}`.toLowerCase();
    return label.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-brand-900 italic flex items-center gap-2">
            <ListTree className="text-gold" /> Anagrafica Attributi
          </h2>
          <p className="text-slate-500 text-sm">Definisci i nomi degli attributi tecnici che potrai poi assegnare ai prodotti.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group min-w-[250px]">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-gold transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text"
              placeholder="Cerca attributo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:bg-white transition-all"
            />
          </div>
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-brand-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-brand-800 transition-all shadow-lg shadow-brand-900/10"
          >
            <Plus size={20} /> Nuovo
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200 flex flex-col md:flex-row gap-4 items-end animate-in zoom-in-95 duration-200">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nome Italiano</label>
            <input 
              placeholder="es. Peso, Potenza, Giri al minuto"
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm"
              value={newData.name_it}
              onChange={e => setNewData({...newData, name_it: e.target.value})}
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nome Inglese</label>
            <input 
              placeholder="es. Weight, Power, RPM"
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm"
              value={newData.name_en}
              onChange={e => setNewData({...newData, name_en: e.target.value})}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-gold text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all">
              Aggiungi
            </button>
            <button onClick={() => setShowAdd(false)} className="bg-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-300 transition-all">
              Annulla
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100">
              <tr>
                <th className="p-6">Nome (IT)</th>
                <th className="p-6">Nome (EN)</th>
                <th className="p-6">Data Creazione</th>
                <th className="p-6 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((def) => (
                <tr key={def.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6">
                    {isEditing === def.id ? (
                      <input 
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm"
                        value={editData.name_it}
                        onChange={e => setEditData({...editData, name_it: e.target.value})}
                      />
                    ) : (
                      <div className="font-bold text-brand-900">{def.name_it}</div>
                    )}
                  </td>
                  
                  <td className="p-6">
                    {isEditing === def.id ? (
                      <input 
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm"
                        value={editData.name_en || ''}
                        onChange={e => setEditData({...editData, name_en: e.target.value})}
                      />
                    ) : (
                      <div className="text-slate-500 italic">{def.name_en || '-'}</div>
                    )}
                  </td>

                  <td className="p-6">
                    <span className="text-xs text-slate-400">
                      {new Date(def.createdAt).toLocaleDateString('it-IT')}
                    </span>
                  </td>

                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2 text-slate-400">
                      {isEditing === def.id ? (
                        <>
                          <button onClick={() => handleUpdate(def.id)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg">
                            <Save size={18} />
                          </button>
                          <button onClick={() => setIsEditing(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setIsEditing(def.id); setEditData(def); }} className="p-2 hover:text-gold hover:bg-gold/5 rounded-lg transition-all">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(def.id)} className="p-2 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
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

        {filtered.length === 0 && (
          <div className="p-20 text-center">
            <ListTree size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium italic">Nessun attributo definito.</p>
          </div>
        )}
      </div>
    </div>
  );
};
