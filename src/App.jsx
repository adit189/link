import React, { useState, useEffect } from "react";
import { 
  Link as LinkIcon, 
  Download, 
  Trash2, 
  Plus, 
  LayoutDashboard, 
  LogOut, 
  ExternalLink, 
  FileText,
  FolderPlus,
  ArrowLeft,
  Edit3,
  Folder,
  ChevronDown,
  ChevronUp,
  Lock,
  LogIn,
  Clock,
  AlertTriangle,
  Image as ImageIcon,
  Video,
  File,
  PlayCircle,
  MessageCircle,
  Check,
  X,
  MessageSquare,
  Quote,
  RefreshCw,
  Layout,
  PlusCircle
} from 'lucide-react';

// --- CONFIGURATION & BRANDING ---
const LOGO_URL = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=200&h=200&auto=format&fit=crop"; 
const HEADER_BG_URL = "https://images.unsplash.com/photo-1542044896530-05d3c8c566bf?q=80&w=1000&auto=format&fit=crop";

const COLOR_PRIMARY = "#01013d";
const COLOR_SECONDARY = "#e61f69";
const COLOR_TERTIARY = "#ff9100";

// --- API CONFIGURATION ---
const API_URL = 'api.php'; 
const USER_ID = 'admin_user'; 

// --- HELPERS ---
const formatTimeLeft = (expiresAt) => {
  if (!expiresAt) return null;
  const diff = expiresAt - Date.now();
  if (diff <= 0) return 'Berakhir';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  if (days > 0) return `${days} Hari ${hours} Jam`;
  return `${hours} Jam ${minutes} Menit`;
};

const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// --- UI COMPONENTS ---
const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled, type="button" }) => {
  const baseStyle = "flex items-center justify-center px-5 py-2.5 rounded-lg font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: `text-white shadow-lg hover:shadow-xl hover:scale-[1.02]`,
    secondary: `bg-white hover:bg-slate-50 shadow-sm border`,
    danger: `bg-red-50 text-red-600 border border-red-100 hover:bg-red-100`,
    ghost: `bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50`,
  };
  const inlineStyle = variant === 'primary' ? { backgroundColor: COLOR_PRIMARY } : 
                      variant === 'secondary' ? { color: COLOR_PRIMARY, borderColor: COLOR_PRIMARY } : {};
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`} style={inlineStyle}>
      {Icon && <Icon size={18} className="mr-2" />}
      {children}
    </button>
  );
};

const Card = ({ children, className = '', onClick, style={} }) => (
  <div onClick={onClick} style={style} className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Input = ({ label, value, onChange, placeholder, type = "text", name }) => (
  <div className="mb-4 text-left">
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all text-slate-800" />
  </div>
);

const App = () => {
  // --- STATE ---
  const [currentView, setCurrentView] = useState('login');
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [editorTab, setEditorTab] = useState('content');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [authError, setAuthError] = useState('');
  
  // Data State
  const [projects, setProjects] = useState([]);
  
  // Testimonial Pop-up
  const [showTestimonial, setShowTestimonial] = useState(false);
  const [clientTestiName, setClientTestiName] = useState('');
  const [clientTestiMsg, setClientTestiMsg] = useState('');

  // Form States
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDuration, setNewProjectDuration] = useState('1w');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [addItemCategory, setAddItemCategory] = useState('link');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  
  // Edit State
  const [editingItemId, setEditingItemId] = useState(null);
  const [editItemTitle, setEditItemTitle] = useState('');
  const [editItemUrl, setEditItemUrl] = useState('');

  // --- DATABASE OPERATIONS ---

  const getFullApiUrl = (params = "") => `${API_URL}${params}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(getFullApiUrl(`?user_id=${USER_ID}`));
        if (!response.ok) throw new Error('Offline');
        const text = await response.text();
        let data;
        try { data = JSON.parse(text); } catch (e) { throw new Error('Invalid JSON'); }
        
        if (data && Array.isArray(data) && data.length > 0) {
          setProjects(data);
          localStorage.setItem('drivelink_backup', JSON.stringify(data));
        } else {
          loadFallbackData();
        }
      } catch (error) {
        loadFallbackData();
      } finally {
        setIsLoading(false);
      }
    };
    const loadFallbackData = () => {
      const localData = localStorage.getItem('drivelink_backup');
      if (localData) setProjects(JSON.parse(localData));
      else setProjects([{ id: 'p1', name: 'Project Alpha', slug: 'alpha', expiresAt: Date.now() + 604800000, config: { title: 'Alpha Assets', description: 'Welcome', whatsapp: '', enableTestimonialForm: true }, items: [], submittedTestimonials: [] }]);
    };
    fetchData();
  }, []);

  const syncWithDatabase = async (currentProjects) => {
    localStorage.setItem('drivelink_backup', JSON.stringify(currentProjects));
    setIsSaving(true);
    try {
      const response = await fetch(getFullApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', user_id: USER_ID, content: JSON.stringify(currentProjects) })
      });
      if (!response.ok) throw new Error('Offline');
      showNotification("Sinkronisasi Cloud Berhasil");
    } catch (error) {
      console.log("Mode Lokal Aktif");
    } finally {
      setIsSaving(false);
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // --- HANDLERS ---
  const handleLogin = (e) => {
    e.preventDefault();
    const u = e.target.elements.u?.value;
    const p = e.target.elements.p?.value;
    if (u === 'admin' && p === '123') setCurrentView('projects-list');
    else setAuthError('Username atau password salah');
  };

  const handleCreateProject = () => {
    if (!newProjectName) return;
    let durationMs = 7 * 24 * 60 * 60 * 1000;
    const newProj = {
      id: `p${Date.now()}`,
      name: newProjectName,
      slug: newProjectName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      expiresAt: Date.now() + durationMs,
      config: { title: newProjectName, description: 'Silakan akses file Anda di bawah ini.', whatsapp: '', enableTestimonialForm: false },
      items: [],
      submittedTestimonials: []
    };
    const updated = [newProj, ...projects];
    setProjects(updated);
    syncWithDatabase(updated);
    setIsCreatingProject(false);
    setNewProjectName('');
  };

  const handleAddItem = () => {
    if (!newItemTitle) return;
    const newItem = {
      id: Date.now(),
      type: addItemCategory,
      title: newItemTitle,
      url: addItemCategory === 'folder' ? null : newItemUrl,
      items: addItemCategory === 'folder' ? [] : null,
      clicks: 0
    };
    const updated = projects.map(p => {
      if (p.id !== activeProjectId) return p;
      if (!activeFolderId) return { ...p, items: [...p.items, newItem] };
      return { ...p, items: p.items.map(it => it.id === activeFolderId ? { ...it, items: [...(it.items || []), newItem] } : it) };
    });
    setProjects(updated);
    syncWithDatabase(updated);
    setNewItemTitle(''); setNewItemUrl(''); setIsAddingItem(false);
  };

  const handleSaveEdit = () => {
    const updated = projects.map(p => {
      if (p.id !== activeProjectId) return p;
      const updateRec = (list) => list.map(it => {
        if (it.id === editingItemId) return { ...it, title: editItemTitle, url: it.type !== 'folder' ? editItemUrl : it.url };
        if (it.items) return { ...it, items: updateRec(it.items) };
        return it;
      });
      return { ...p, items: updateRec(p.items) };
    });
    setProjects(updated);
    syncWithDatabase(updated);
    setEditingItemId(null);
  };

  const handleDeleteItem = (id) => {
    if (!confirm("Hapus item?")) return;
    const updated = projects.map(p => {
      if (p.id !== activeProjectId) return p;
      const remRec = (list) => list.filter(it => it.id !== id).map(it => it.items ? { ...it, items: remRec(it.items) } : it);
      return { ...p, items: remRec(p.items) };
    });
    setProjects(updated);
    syncWithDatabase(updated);
  };

  const handleExportCSV = () => {
    const activeProj = projects.find(p => p.id === activeProjectId);
    if (!activeProj?.submittedTestimonials?.length) return;
    const csv = ["Nama,Pesan,Tanggal", ...activeProj.submittedTestimonials.map(t => `"${t.name}","${t.message}","${t.date}"`)].join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Testi_${activeProj.name}.csv`; a.click();
  };

  const activeProject = projects.find(p => p.id === activeProjectId);
  const displayedItems = activeFolderId 
    ? activeProject?.items.find(i => i.id === activeFolderId)?.items || []
    : activeProject?.items || [];

  // --- VIEWS ---
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><RefreshCw className="animate-spin" size={40} /></div>;

  if (currentView === 'login') return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden border">
        <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: COLOR_TERTIARY }}></div>
        <div className="text-center mb-8 pt-4">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg" style={{ backgroundColor: COLOR_PRIMARY }}>
            <Layout className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tight uppercase" style={{ color: COLOR_PRIMARY }}>Dashboard</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Creative Management</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input label="Username" name="u" placeholder="admin" />
          <Input label="Password" name="p" type="password" placeholder="123" />
          {authError && <div className="text-red-600 text-xs text-center font-bold bg-red-50 py-2 rounded-lg">{authError}</div>}
          <Button variant="primary" className="w-full py-4" type="submit">LOGIN</Button>
        </form>
      </div>
    </div>
  );

  if (currentView === 'projects-list') return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm border-b">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: COLOR_PRIMARY }}><Layout className="text-white" size={20}/></div>
           <div className="flex flex-col">
             <span className="font-black text-lg uppercase leading-tight" style={{ color: COLOR_PRIMARY }}>ONE DREAM</span>
             <span className="text-[9px] text-slate-500 uppercase tracking-widest leading-tight">Creative</span>
           </div>
        </div>
        <div className="flex items-center gap-4">
          {isSaving && <RefreshCw size={14} className="animate-spin text-slate-400" />}
          <button onClick={() => setCurrentView('login')} className="text-sm font-bold uppercase tracking-wider" style={{ color: COLOR_SECONDARY }}>Keluar</button>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: COLOR_PRIMARY }}>Project Aktif</h2>
          <Button variant="primary" icon={Plus} onClick={() => setIsCreatingProject(true)}>Buat Project</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isCreatingProject && (
            <Card className="p-6 border-dashed border-2 bg-slate-50 relative" style={{ borderColor: COLOR_PRIMARY }}>
              <h3 className="font-bold mb-4 uppercase text-sm" style={{ color: COLOR_PRIMARY }}>Project Baru</h3>
              <Input label="Nama Klien" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} placeholder="Wedding A & B" />
              <Button variant="primary" className="w-full" onClick={handleCreateProject}>Simpan & Buat</Button>
            </Card>
          )}
          {projects.map(p => (
            <Card key={p.id} onClick={() => { setActiveProjectId(p.id); setEditorTab('content'); setCurrentView('project-editor'); }} className="cursor-pointer hover:shadow-xl transition-all p-6 border group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 text-white rounded-xl shadow-sm" style={{ backgroundColor: COLOR_PRIMARY }}><FolderPlus size={24}/></div>
                <button onClick={(e) => { e.stopPropagation(); if(confirm("Hapus?")) { const up = projects.filter(pr => pr.id !== p.id); setProjects(up); syncWithDatabase(up); } }} className="text-gray-300 hover:text-red-500"><Trash2 size={18}/></button>
              </div>
              <h3 className="text-lg font-bold mb-1" style={{ color: COLOR_PRIMARY }}>{p.name}</h3>
              <div className="mt-auto pt-4 border-t flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                <div className="flex items-center"><Clock size={12} className="mr-1"/> {formatTimeLeft(p.expiresAt)}</div>
                <span className="text-white px-2 py-1 rounded-md" style={{ backgroundColor: COLOR_SECONDARY }}>{p.items.length} Item</span>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );

  if (currentView === 'project-editor' && activeProject) return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => { setCurrentView('projects-list'); setActiveFolderId(null); }} className="p-2 hover:bg-slate-100 rounded-full" style={{ color: COLOR_PRIMARY }}><ArrowLeft size={22}/></button>
          <h1 className="text-lg font-black uppercase tracking-tight" style={{ color: COLOR_PRIMARY }}>{activeProject.name}</h1>
        </div>
        <Button variant="primary" className="py-2 text-sm" icon={ExternalLink} onClick={() => setCurrentView('client-view')}>Preview Klien</Button>
      </header>
      <div className="flex-1 max-w-4xl w-full mx-auto p-6">
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl border flex overflow-hidden">
            <button onClick={() => setEditorTab('content')} className={`px-8 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${editorTab === 'content' ? 'text-white rounded-lg shadow' : 'text-slate-500'}`} style={editorTab === 'content' ? { backgroundColor: COLOR_PRIMARY } : {}}>Konten</button>
            <button onClick={() => setEditorTab('settings')} className={`px-8 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${editorTab === 'settings' ? 'text-white rounded-lg shadow' : 'text-slate-500'}`} style={editorTab === 'settings' ? { backgroundColor: COLOR_PRIMARY } : {}}>Pengaturan</button>
            <button onClick={() => setEditorTab('testimonials')} className={`px-8 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${editorTab === 'testimonials' ? 'text-white rounded-lg shadow' : 'text-slate-500'}`} style={editorTab === 'testimonials' ? { backgroundColor: COLOR_PRIMARY } : {}}>Testimoni</button>
          </div>
        </div>
        {editorTab === 'content' && (
          <div className="space-y-6">
            {activeFolderId && <button onClick={() => setActiveFolderId(null)} className="flex items-center text-xs font-bold uppercase" style={{ color: COLOR_SECONDARY }}><ArrowLeft size={16} className="mr-2"/> Kembali</button>}
            <Card className="p-6">
              {!isAddingItem ? (
                 <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                   {!activeFolderId && <button onClick={() => { setIsAddingItem(true); setAddItemCategory('folder'); }} className="p-4 border rounded-xl flex flex-col items-center"><Folder size={20} className="mb-1" style={{color: COLOR_PRIMARY}}/> <span className="text-[10px] font-bold">FOLDER</span></button>}
                   <button onClick={() => { setIsAddingItem(true); setAddItemCategory('link'); }} className="p-4 border rounded-xl flex flex-col items-center"><LinkIcon size={20} className="mb-1 text-blue-600"/> <span className="text-[10px] font-bold">LINK</span></button>
                   <button onClick={() => { setIsAddingItem(true); setAddItemCategory('photo'); }} className="p-4 border rounded-xl flex flex-col items-center"><ImageIcon size={20} className="mb-1 text-purple-600"/> <span className="text-[10px] font-bold">FOTO</span></button>
                   <button onClick={() => { setIsAddingItem(true); setAddItemCategory('video'); }} className="p-4 border rounded-xl flex flex-col items-center"><Video size={20} className="mb-1 text-pink-600"/> <span className="text-[10px] font-bold">VIDEO</span></button>
                   <button onClick={() => { setIsAddingItem(true); setAddItemCategory('file'); }} className="p-4 border rounded-xl flex flex-col items-center"><File size={20} className="mb-1 text-orange-600"/> <span className="text-[10px] font-bold">FILE</span></button>
                 </div>
              ) : (
                <div className="space-y-4">
                  <Input label="Judul Tombol" value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} />
                  {addItemCategory !== 'folder' && <Input label="URL Tujuan" value={newItemUrl} onChange={e => setNewItemUrl(e.target.value)} />}
                  <div className="flex gap-2"><Button variant="primary" className="flex-1" onClick={handleAddItem}>Simpan</Button><Button variant="secondary" onClick={() => setIsAddingItem(false)}>Batal</Button></div>
                </div>
              )}
            </Card>
            <div className="space-y-3">
              {displayedItems.map(it => (
                <div key={it.id} className="bg-white p-4 rounded-xl border flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-slate-50">{it.type === 'folder' ? <Folder size={20}/> : <LinkIcon size={20}/>}</div>
                    <div><h4 className="font-bold text-sm" style={{ color: COLOR_PRIMARY }}>{it.title}</h4><p className="text-[10px] text-gray-400">{it.url || 'Folder'}</p></div>
                  </div>
                  <div className="flex gap-2">
                    {it.type === 'folder' && <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => setActiveFolderId(it.id)}>Buka</Button>}
                    <button onClick={() => handleDeleteItem(it.id)} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {editorTab === 'settings' && (
          <Card className="p-6 space-y-4">
             <Input label="Judul Halaman" value={activeProject.config.title} onChange={e => { const up = projects.map(p => p.id === activeProjectId ? {...p, config: {...p.config, title: e.target.value}} : p); setProjects(up); syncWithDatabase(up); }}/>
             <Input label="WhatsApp (Cth: 62812...)" value={activeProject.config.whatsapp} onChange={e => { const up = projects.map(p => p.id === activeProjectId ? {...p, config: {...p.config, whatsapp: e.target.value}} : p); setProjects(up); syncWithDatabase(up); }}/>
             <div className="flex items-center gap-3 py-2">
               <input type="checkbox" checked={activeProject.config.enableTestimonialForm} onChange={e => { const up = projects.map(p => p.id === activeProjectId ? {...p, config: {...p.config, enableTestimonialForm: e.target.checked}} : p); setProjects(up); syncWithDatabase(up); }} />
               <label className="text-sm font-bold text-slate-700 uppercase">Aktifkan Form Testimoni</label>
             </div>
          </Card>
        )}
        {editorTab === 'testimonials' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h3 className="font-bold uppercase text-sm">Ulasan Klien</h3><Button onClick={handleExportCSV} variant="secondary" className="text-xs" icon={Download}>Export CSV</Button></div>
            {activeProject.submittedTestimonials.map(t => (
              <Card key={t.id} className="p-4 border-l-4" style={{borderLeftColor: COLOR_TERTIARY}}>
                <div className="flex justify-between mb-1"><span className="font-bold text-sm">{t.name}</span><span className="text-[10px] text-gray-400">{t.date}</span></div>
                <p className="text-xs italic text-gray-600">"{t.message}"</p>
              </Card>
            ))}
          </div>
        )}
      </div>
      {notification && <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 text-xs font-bold uppercase tracking-widest">{notification}</div>}
    </div>
  );

  if (currentView === 'client-view' && activeProject) return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col relative">
      {showTestimonial && activeProject.config.enableTestimonialForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
           <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl">
              <button onClick={() => setShowTestimonial(false)} className="absolute top-5 right-5 text-gray-300"><X size={20}/></button>
              <h3 className="font-black text-xl mb-6 uppercase" style={{ color: COLOR_PRIMARY }}>Berikan Ulasan</h3>
              <Input label="Nama" placeholder="Nama Anda..." value={clientTestiName} onChange={e => setClientTestiName(e.target.value)} />
              <textarea placeholder="Pesan Anda..." className="w-full p-4 bg-slate-50 border rounded-xl mb-4 text-sm" rows={3} value={clientTestiMsg} onChange={e => setClientTestiMsg(e.target.value)}></textarea>
              <Button variant="primary" className="w-full py-3" onClick={() => {
                if(!clientTestiName || !clientTestiMsg) return;
                const newT = { id: Date.now(), name: clientTestiName, message: clientTestiMsg, date: new Date().toLocaleDateString() };
                const up = projects.map(p => p.id === activeProject.id ? {...p, submittedTestimonials: [...p.submittedTestimonials, newT]} : p);
                setProjects(up); syncWithDatabase(up); setShowTestimonial(false); alert("Terima kasih!");
              }}>Kirim</Button>
           </div>
        </div>
      )}
      <button onClick={() => setCurrentView('project-editor')} className="fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow"><ArrowLeft size={18}/></button>
      <div className="relative text-white pt-24 pb-24 px-4 text-center bg-cover bg-center" style={{ backgroundImage: `url('${HEADER_BG_URL}')` }}>
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" style={{ backgroundColor: 'rgba(1, 1, 61, 0.8)' }}></div> 
        <div className="relative z-10 max-w-md mx-auto flex flex-col items-center">
           <div className="w-24 h-24 rounded-full bg-white mb-6 flex items-center justify-center shadow-2xl border-4" style={{borderColor: COLOR_PRIMARY}}><Layout size={40} style={{color: COLOR_PRIMARY}}/></div>
           <h1 className="text-3xl font-black mb-4 uppercase tracking-tight">{activeProject.config.title}</h1>
           <p className="text-slate-200 text-sm font-medium">{activeProject.config.description}</p>
        </div>
      </div>
      <div className="flex-1 max-w-md w-full mx-auto px-4 -mt-10 relative z-20 pb-20">
        <div className="shadow-xl rounded-xl p-4 flex items-center justify-between mb-6 text-white" style={{ backgroundColor: COLOR_SECONDARY }}>
            <div className="flex flex-col"><span className="text-[10px] font-bold uppercase opacity-80">Batas Waktu Akses</span><span className="text-sm font-black">{formatTimeLeft(activeProject.expiresAt)}</span></div>
            <Clock size={24} className="animate-pulse" />
        </div>
        <div className="space-y-4">
           {activeProject.items.map(item => {
             const ytId = getYouTubeId(item.url);
             if (ytId) return (
               <div key={item.id} className="bg-white p-4 rounded-xl shadow-md border w-full overflow-hidden">
                 <h4 className="font-bold text-sm mb-3 flex items-center gap-2" style={{color: COLOR_PRIMARY}}><PlayCircle size={16} style={{color: COLOR_SECONDARY}}/> {item.title}</h4>
                 <iframe className="w-full aspect-video rounded-lg" src={`https://www.youtube.com/embed/${ytId}`} frameBorder="0" allowFullScreen></iframe>
               </div>
             );
             return (
               <a key={item.id} href={item.url} target="_blank" className="block bg-white p-5 rounded-xl shadow-md border hover:-translate-y-1 transition-all flex items-center justify-between group">
                 <div className="flex items-center gap-4">
                   <div className="p-3 rounded-lg bg-slate-50 group-hover:bg-slate-900 group-hover:text-white transition-colors">{item.type === 'photo' ? <ImageIcon size={20}/> : <LinkIcon size={20}/>}</div>
                   <span className="font-bold text-sm" style={{color: COLOR_PRIMARY}}>{item.title}</span>
                 </div>
                 <ExternalLink size={18} className="text-slate-300" />
               </a>
             );
           })}
        </div>
        {activeProject.config.whatsapp && (
          <a href={`https://wa.me/${activeProject.config.whatsapp}`} target="_blank" className="mt-10 bg-green-600 text-white px-8 py-4 rounded-full shadow-lg flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-wider mx-auto w-fit">
            <MessageCircle size={20}/> Hubungi Kami
          </a>
        )}
      </div>
      <footer className="bg-white font-bold text-center py-8 text-[10px] uppercase border-t" style={{ color: COLOR_PRIMARY }}>© {new Date().getFullYear()} PT ONE DREAM CREATIVE.</footer>
    </div>
  );
  return null;
};
export default App;