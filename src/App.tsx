import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  Shield, 
  Settings, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight, 
  Menu, 
  X, 
  CheckCircle2, 
  Cpu, 
  Zap, 
  Box
} from 'lucide-react';
import { 
  COMPANY_NAME, 
  LOCATION, 
  EXPERIENCE, 
  HERO_CONTENT, 
  SERVICES, 
  ABOUT_US 
} from './constants';
import { AssistancePage } from './pages/Assistance';
import { WeldingPage } from './pages/Welding';
import { CompressorsPage } from './pages/Compressors';
import { BrandsPage } from './pages/Brands';
import { CatalogPage } from './pages/Catalog';
import { LoginPage } from './pages/Login';
import { ProductDetailPage } from './pages/ProductDetail';
import { AdminLayout } from './pages/AdminLayout';
import { AdminBrands } from './pages/admin/AdminBrands';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminImport } from './pages/admin/AdminImport';
import { BrandDetailPage } from './pages/BrandDetail';
import { CategoryDetailPage } from './pages/CategoryDetail';
import { useLanguage } from './lib/LanguageContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { lang, setLang } = useLanguage();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAdminPath = location.pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isAdminPath) return null;

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Saldatura', href: '/saldatura' },
    { name: 'Compressori', href: '/compressori' },
    { name: 'Marchi', href: '/marchi' },
    { name: 'Catalogo', href: '/catalogo' },
    { name: 'Assistenza', href: '/assistenza' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled || !isHome ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className={`flex items-center gap-3 text-2xl font-display font-bold tracking-tighter ${isScrolled || !isHome ? 'text-brand-900' : 'text-white'}`}>
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white shadow-lg overflow-hidden">
                <Zap size={24} fill="currentColor" />
              </div>
              <span>{COMPANY_NAME}</span>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-xs font-bold uppercase tracking-widest transition-colors hover:text-gold ${
                  isScrolled || !isHome ? 'text-brand-800' : 'text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="flex gap-2 ml-4 border-l border-slate-300/30 pl-4">
              {['it', 'en', 'es', 'de', 'fr'].map(l => (
                <button 
                  key={l}
                  onClick={() => setLang(l as any)}
                  className={`text-[10px] font-bold uppercase w-6 h-6 rounded flex items-center justify-center transition-all ${lang === l ? 'bg-gold text-white shadow-sm' : 'text-slate-400 hover:bg-white/10'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={isScrolled || !isHome ? 'text-brand-900' : 'text-white'}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-base font-bold uppercase tracking-tight text-brand-800 hover:text-gold"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  return (
    <section id="home" className="relative h-screen flex items-center overflow-hidden">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=2070"
          alt="Industrial Welding"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-900/70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <span className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-widest text-gold uppercase bg-gold/10 border border-gold/20 rounded-full">
            {EXPERIENCE}
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight mb-6">
            {HERO_CONTENT.title}
          </h1>
          <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl">
            {HERO_CONTENT.subtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#services"
              className="px-8 py-4 bg-accent hover:brightness-110 text-white font-bold rounded-lg transition-all transform hover:-translate-y-1 shadow-lg shadow-accent/20"
            >
              Scopri i Servizi
            </a>
            <a
              href="#contact"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg backdrop-blur-sm border border-white/30 transition-all"
            >
              Richiedi Consulenza
            </a>
          </div>
        </motion.div>
      </div>

      {/* Decorative Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent z-10" />
    </section>
  );
};

const ServiceCard: React.FC<{ service: any; index: number }> = ({ service, index }) => {
  const Icon = service.icon === 'Wrench' ? Wrench : service.icon === 'Shield' ? Shield : Settings;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition-all group"
    >
      <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-6 text-gold group-hover:bg-gold group-hover:text-white transition-colors">
        <Icon size={28} />
      </div>
      <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
      <p className="text-slate-600 mb-6">{service.description}</p>
      <ul className="space-y-3">
        {service.items.map((item: string, i: number) => (
          <li key={i} className="flex items-start text-sm text-slate-700">
            <CheckCircle2 size={16} className="text-gold mr-3 mt-1 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

const About = () => {
  return (
    <section id="about" className="py-24 bg-brand-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10 border-l-4 border-accent pl-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-8">{ABOUT_US.title}</h2>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                {ABOUT_US.content}
              </p>
              <div className="grid grid-cols-3 gap-8">
                {ABOUT_US.stats.map((stat, i) => (
                  <div key={i}>
                    <div className="text-3xl font-display font-bold text-gold mb-1">{stat.value}</div>
                    <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Background pattern */}
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800" 
              alt="Engineering" 
              className="rounded-2xl h-64 w-full object-cover"
            />
            <img 
              src="https://images.unsplash.com/photo-1565345711656-74fcba88471e?auto=format&fit=crop&q=80&w=800" 
              alt="Robotic Welding" 
              className="rounded-2xl h-80 w-full object-cover lg:-mt-16"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          <div className="grid md:grid-cols-2">
            <div className="p-12 lg:p-16">
              <h2 className="text-4xl font-bold mb-6">Contattaci</h2>
              <p className="text-slate-600 mb-10">
                Il nostro team di esperti è pronto a supportarti nella scelta delle migliori soluzioni per la tua azienda.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-accent mr-4 flex-shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Sede</h4>
                    <p className="text-slate-600 font-medium">{LOCATION}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-accent mr-4 flex-shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Telefono</h4>
                    <p className="text-slate-600 font-medium">+39 0575 XXXXXX</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-accent mr-4 flex-shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Email</h4>
                    <p className="text-slate-600 font-medium">info@tpcgroup.it</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900 p-12 lg:p-16 text-white">
              <h3 className="text-2xl font-bold mb-8 italic">Richiedi un preventivo gratuito</h3>
              <form 
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data = {
                    name: formData.get('name'),
                    company: formData.get('company'),
                    email: formData.get('email'),
                    message: formData.get('message'),
                  };
                  
                  try {
                    const response = await fetch('/api/contact', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });
                    const result = await response.json();
                    if (result.success) {
                      alert('Messaggio inviato con successo!');
                      (e.target as HTMLFormElement).reset();
                    }
                  } catch (error) {
                    console.error('Errore:', error);
                    alert('Si è verificato un errore durante l\'invio.');
                  }
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Nome</label>
                    <input name="name" type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-accent transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Azienda</label>
                    <input name="company" type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-accent transition-colors" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Email</label>
                  <input name="email" type="email" required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-accent transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Messaggio</label>
                  <textarea name="message" required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 h-32 outline-none focus:border-accent transition-colors" />
                </div>
                <button type="submit" className="w-full py-4 bg-accent hover:brightness-110 text-white font-bold rounded-lg transition-all shadow-lg shadow-accent/20">
                  Invia Messaggio
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const HomePage = () => {
  return (
    <>
      <Hero />
      
      <section id="services" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4 italic"
          >
            Le Nostre Competenze
          </motion.h2>
          <p className="text-slate-600 max-w-2xl mx-auto font-medium">
            Soluzioni tecnologiche all'avanguardia per ottimizzare ogni fase del processo produttivo metalmeccanico.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
      </section>

      {/* Brand values / Core strengths */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 text-gold"><Cpu size={48} strokeWidth={1} /></div>
              <h4 className="font-bold italic uppercase tracking-tighter">Automazione</h4>
              <p className="text-sm text-slate-500">Robotica e Cobot integrati</p>
            </div>
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 text-gold"><Zap size={48} strokeWidth={1} /></div>
              <h4 className="font-bold italic uppercase tracking-tighter">Laser e Plasma</h4>
              <p className="text-sm text-slate-500">Taglio e saldatura precisione</p>
            </div>
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 text-gold"><Box size={48} strokeWidth={1} /></div>
              <h4 className="font-bold italic uppercase tracking-tighter">Logistica Ricambi</h4>
              <p className="text-sm text-slate-500">Gestione efficiente magazzino</p>
            </div>
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 text-gold"><Shield size={48} strokeWidth={1} /></div>
              <h4 className="font-bold italic uppercase tracking-tighter">Certificazione</h4>
              <p className="text-sm text-slate-500">Conformità normativa garantita</p>
            </div>
          </div>
        </div>
      </section>

      <About />
      <Contact />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/assistenza" element={<AssistancePage />} />
          <Route path="/saldatura" element={<WeldingPage />} />
          <Route path="/compressori" element={<CompressorsPage />} />
          <Route path="/marchi" element={<BrandsPage />} />
          <Route path="/marchi/:slug" element={<BrandDetailPage />} />
          <Route path="/categorie/:slug" element={<CategoryDetailPage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/accedi-al-catalogo" element={<LoginPage />} />
          <Route path="/prodotto/:id" element={<ProductDetailPage />} />
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<div className="text-center py-20"><h2 className="text-4xl font-bold text-slate-200 uppercase italic">Seleziona una sezione</h2></div>} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="import" element={<AdminImport />} />
          </Route>
        </Routes>
        
        <footer className="bg-brand-900 border-t border-white/10 py-12 text-slate-500 text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
              <div>
                <span className="text-white text-xl font-display font-bold tracking-tighter block mb-2">{COMPANY_NAME}</span>
                <p>© 2024 {COMPANY_NAME}. Tutti i diritti riservati.</p>
                <p className="mt-1 font-bold italic">{LOCATION}</p>
              </div>
              
              <div className="flex space-x-12">
                <div className="space-y-4">
                  <h5 className="text-white font-bold uppercase tracking-widest text-xs">Azienda</h5>
                  <ul className="space-y-2">
                    <li><Link to="/" className="hover:text-accent transition-colors">Home</Link></li>
                    <li><Link to="/saldatura" className="hover:text-accent transition-colors">Saldatura</Link></li>
                    <li><Link to="/compressori" className="hover:text-accent transition-colors">Compressori</Link></li>
                    <li><Link to="/marchi" className="hover:text-accent transition-colors">Marchi</Link></li>
                    <li><Link to="/catalogo" className="hover:text-accent transition-colors">Catalogo</Link></li>
                    <li><Link to="/assistenza" className="hover:text-accent transition-colors">Assistenza</Link></li>
                    <li><Link to="/admin" className="text-[10px] text-slate-700 hover:text-white mt-4 block">Area Admin</Link></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h5 className="text-white font-bold uppercase tracking-widest text-xs">Legale</h5>
                  <ul className="space-y-2">
                    <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-accent transition-colors">Cookie Policy</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
