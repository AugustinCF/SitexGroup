import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Tag, Layers, Package, LogOut, Globe, Plus } from 'lucide-react';

export const AdminLayout = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/check-auth');
        const data = await res.json();
        if (!data.isAdmin) {
          navigate('/accedi-al-catalogo');
        } else {
          setIsAdmin(true);
        }
      } catch (e) {
        navigate('/accedi-al-catalogo');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    navigate('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-900 text-white flex flex-col">
        <div className="p-8">
          <h2 className="text-2xl font-display font-bold text-gold italic">Admin Panel</h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <NavLink 
            to="/admin/brands" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-gold text-white' : 'hover:bg-white/10 text-slate-400'}`}
          >
            <Tag size={20} /> Marchi
          </NavLink>
          <NavLink 
            to="/admin/categories" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-gold text-white' : 'hover:bg-white/10 text-slate-400'}`}
          >
            <Layers size={20} /> Categorie
          </NavLink>
          <NavLink 
            to="/admin/products" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-gold text-white' : 'hover:bg-white/10 text-slate-400'}`}
          >
            <Package size={20} /> Prodotti
          </NavLink>
          <NavLink 
            to="/admin/import" 
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-gold text-white' : 'hover:bg-white/10 text-slate-400'}`}
          >
            <Plus size={20} /> Importa CSV
          </NavLink>
        </nav>

        <div className="p-4 mt-auto space-y-2">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-all"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12">
        <Outlet />
      </main>
    </div>
  );
};
