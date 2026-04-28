import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const AdminImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setResult(null);

    const data = new FormData();
    data.append('csv', file);

    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        body: data
      });
      const dataRes = await res.json();
      setResult(dataRes);
    } catch (e) {
      setResult({ error: 'Errore durante l\'importazione' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Importazione Massiva</h1>
        <p className="text-slate-500">
          Carica un file CSV per aggiungere prodotti in blocco. Il sistema scaricherà automaticamente le immagini se fornisci gli URL.
        </p>
      </div>

      <div className="bg-white p-12 rounded-3xl shadow-xl border-2 border-dashed border-slate-200 text-center">
        <form onSubmit={handleImport} className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
              <Upload size={32} />
            </div>
            <label className="cursor-pointer">
              <span className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all">
                Seleziona CSV
              </span>
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
            </label>
            {file && (
              <p className="mt-4 text-sm font-bold text-brand-900 flex items-center gap-2">
                <FileText size={16} /> {file.name}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 text-gold font-bold">
              <Loader2 className="animate-spin" /> Importazione in corso...
            </div>
          ) : (
            <button 
              disabled={!file}
              className="w-full max-w-xs py-4 bg-gold text-white font-bold rounded-xl shadow-lg shadow-gold/20 disabled:opacity-50"
            >
              Avvia Importazione
            </button>
          )}
        </form>
      </div>

      {result && (
        <div className={`p-6 rounded-2xl flex items-start gap-4 ${result.error ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
          {result.error ? <AlertCircle /> : <CheckCircle2 />}
          <div>
            <h4 className="font-bold">{result.error ? 'Errore' : 'Successo!'}</h4>
            <p className="text-sm">
              {result.error || `Importazione completata: ${result.count} nuovi record aggiunti su ${result.total} totali.`}
            </p>
          </div>
        </div>
      )}

      <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 space-y-8">
        <div>
          <h4 className="font-bold mb-4 italic text-brand-900 border-l-4 border-gold pl-4">Formato CSV Richiesto:</h4>
          <p className="text-sm text-slate-500 mb-4">
            La prima riga deve contenere gli header. La colonna <code className="text-gold font-bold">type</code> determina l'entità.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-brand-900 text-white text-[10px] font-bold rounded uppercase tracking-widest">Type: product</span>
            </div>
            <code className="block p-4 bg-slate-900 text-gold rounded-lg text-[10px] overflow-x-auto whitespace-nowrap mb-2">
              type,name_it,slug,description_it,price,imageUrls,brandName,categoryName
            </code>
            <ul className="text-[10px] text-slate-400 space-y-1 mt-2">
              <li>* imageUrls: lista di URL separati da virgola.</li>
              <li>* brandName / categoryName: verranno collegati automaticamente se esistono (per nome o slug).</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-brand-900 text-white text-[10px] font-bold rounded uppercase tracking-widest">Type: brand</span>
            </div>
            <code className="block p-4 bg-slate-900 text-gold rounded-lg text-[10px] overflow-x-auto whitespace-nowrap mb-2">
              type,name_it,slug,description_it,website,logoUrl
            </code>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-brand-900 text-white text-[10px] font-bold rounded uppercase tracking-widest">Type: category</span>
            </div>
            <code className="block p-4 bg-slate-900 text-gold rounded-lg text-[10px] overflow-x-auto whitespace-nowrap mb-2">
              type,name_it,slug,description_it,imageUrl
            </code>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-[10px] text-slate-400">
            * Se lo <code className="text-brand-900 font-bold">slug</code> è già presente nel database, il record verrà saltato (INSERT IGNORE).
          </p>
        </div>
      </div>
    </div>
  );
};
