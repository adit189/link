import React, { useState, useEffect } from 'react';
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
  PlusCircle,
  Copy
} from 'lucide-react';

// --- UTILITAS & PENGATURAN GLOBAL ---

// [PETUNJUK]: Ganti tautan (link) gambar di bawah ini untuk MENGUBAH LOGO
const LOGO_URL = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=200&h=200&auto=format&fit=crop"; 

// [PETUNJUK]: Ganti tautan gambar di bawah ini untuk MENGUBAH FOTO BACKGROUND KLIEN
const HEADER_BG_URL = "https://images.unsplash.com/photo-1542044896530-05d3c8c566bf?q=80&w=1000&auto=format&fit=crop";

// [PETUNJUK]: Ubah nomor di bawah jika kolom WhatsApp per project kosong
const DEFAULT_WHATSAPP = "628123456789";

// KODE WARNA BRANDING
const COLOR_PRIMARY = "#01013d";
const COLOR_SECONDARY = "#e61f69";
const COLOR_TERTIARY = "#ff9100";

// --- API CONFIGURATION ---
const API_URL = 'api.php'; 
const USER_ID = 'admin_user'; 

// Helper Format Waktu Sisa
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

// Helper YouTube ID
const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// --- KOMPONEN UI ---

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled, type="button" }) => {
  const baseStyle = "flex items-center justify-center px-5 py-2.5 rounded-lg font-bold transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed tracking-wide active:translate-y-0";
  
  const variants = {
    primary: `text-white shadow-lg hover:shadow-xl hover:-translate-y-1`,
    secondary: `bg-white hover:bg-slate-50 shadow-sm border hover:-translate-y-1`,
    danger: `bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 hover:-translate-y-1`,
    ghost: `bg-transparent text-slate-500 hover:bg-slate-50 hover:-translate-y-1`,
    whatsapp: `bg-green-600 text-white hover:bg-green-700 shadow-xl hover:-translate-y-1`
  };

  let inlineStyle = {};
  if (variant === 'primary') inlineStyle = { backgroundColor: COLOR_PRIMARY };
  else if (variant === 'secondary') inlineStyle = { color: COLOR_PRIMARY, borderColor: COLOR_PRIMARY };

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

const Input = ({ label, value, onChange, placeholder, type = "text", name, ...props }) => (
  <div className="mb-4 text-left">
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all text-slate-800 font-medium"
      {...props}
    />
  </div>
);

const Select = ({ label, value, onChange, options, ...props }) => (
  <div className="mb-4 text-left">
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all text-slate-800 appearance-none font-medium"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={16} />
    </div>
  </div>
);

const TextArea = ({ label, value, onChange, placeholder, rows = 3, ...props }) => (
  <div className="mb-4 text-left">
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all resize-none text-slate-800 font-medium"
      {...props}
    />
  </div>
);

// --- APLIKASI UTAMA ---

export default function App() {
  
  // PENGECEKAN MODE KLIEN VIA URL (Menggunakan Slug atau ID)
  const urlParams = new URLSearchParams(window.location.search);
  const clientParam = urlParams.get('client');

  // --- STATE ---
  const [isClientMode, setIsClientMode] = useState(!!clientParam);
  const [currentView, setCurrentView] = useState(clientParam ? 'client-view' : 'login');
  const [activeProjectId, setActiveProjectId] = useState(null); // Diatur setelah fetch data
  
  const [editorTab, setEditorTab] = useState('content');
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // State Pop Up Klien
  const [showTestimonial, setShowTestimonial] = useState(false);
  const [isClosingTesti, setIsClosingTesti] = useState(false);
  const [clientTestiName, setClientTestiName] = useState('');
  const [clientTestiMsg, setClientTestiMsg] = useState('');
  
  const [tick, setTick] = useState(0);

  // Database Projects
  const [projects, setProjects] = useState([]);

  // Forms State
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDuration, setNewProjectDuration] = useState('1w'); 
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [addItemCategory, setAddItemCategory] = useState('link');

  // State Edit Item
  const [editingItemId, setEditingItemId] = useState(null);
  const [editItemTitle, setEditItemTitle] = useState('');
  const [editItemUrl, setEditItemUrl] = useState('');

  const [notification, setNotification] = useState(null);
  
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Helper Pencarian Project & Item Aktif
  const activeProject = projects.find(p => String(p.id) === String(activeProjectId));

  // --- EFFECT: DINAMIS DOCUMENT TITLE ---
  useEffect(() => {
    if (currentView === 'client-view' && activeProject) {
      document.title = activeProject.name;
    } else {
      document.title = 'One Link';
    }
  }, [currentView, activeProject]);

  // --- DATABASE OPERATIONS ---

  const getFullApiUrl = (params = "") => {
    try {
      if (window.location.origin && window.location.origin.startsWith('http')) {
        return `${window.location.origin}/${API_URL}${params}`;
      }
      return `${API_URL}${params}`;
    } catch (e) {
      return `${API_URL}${params}`;
    }
  };

  useEffect(() => {
    const resolveClientProject = (projectsData) => {
      if (clientParam) {
        // Cari project berdasarkan slug atau ID (untuk backward compatibility)
        const matched = projectsData.find(p => p.slug === clientParam || String(p.id) === clientParam);
        if (matched) {
          setActiveProjectId(matched.id);
        }
      }
    };

    const fetchData = async () => {
      try {
        const url = getFullApiUrl(`?user_id=${USER_ID}`);
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Network error');
        
        const text = await response.text();
        let data;
        try { 
          data = JSON.parse(text); 
          if (Array.isArray(data)) {
            data = data.map(p => ({
              ...p,
              config: p.config || { title: p.name, description: '', whatsapp: '', enableTestimonialForm: false },
              items: p.items || [],
              submittedTestimonials: p.submittedTestimonials || []
            }));
          }
        } catch (e) { 
          throw new Error('Invalid JSON'); 
        }
        
        if (data && Array.isArray(data) && data.length > 0) {
          setProjects(data);
          localStorage.setItem('drivelink_backup', JSON.stringify(data));
          resolveClientProject(data);
        } else {
          loadFallbackData();
        }
      } catch (error) {
        console.warn("Fetch failed, using local backup:", error.message);
        loadFallbackData();
      } finally {
        setIsLoading(false);
      }
    };

    const loadFallbackData = () => {
      const localData = localStorage.getItem('drivelink_backup');
      let parsedData = [];
      if (localData) {
        parsedData = JSON.parse(localData);
      } else {
        parsedData = [
          {
            id: 'p1',
            name: 'Project Alpha Launch',
            slug: 'project-alpha-launch',
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), 
            config: {
              title: 'Project Alpha Assets',
              description: 'Terima kasih telah mempercayakan project ini kepada kami. Silakan unduh file Anda.',
              whatsapp: '628123456789',
              enableTestimonialForm: true
            },
            items: [],
            submittedTestimonials: []
          }
        ];
      }
      setProjects(parsedData);
      resolveClientProject(parsedData);
    };

    fetchData();
  }, [clientParam]);

  const syncWithDatabase = async (currentProjects) => {
    localStorage.setItem('drivelink_backup', JSON.stringify(currentProjects));
    setIsSaving(true);
    try {
      const url = getFullApiUrl();
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', user_id: USER_ID, content: JSON.stringify(currentProjects) })
      });
      if (!response.ok) throw new Error('Offline');
      showNotification("Sinkronisasi Cloud Berhasil");
    } catch (error) {
      console.log("Cloud sync skipped (Local mode active)");
    } finally {
      setIsSaving(false);
    }
  };

  // --- EFFECT: COUNTDOWN ---
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- EFFECT: JEDA 20 DETIK UNTUK POP-UP ULASAN KLIEN ---
  useEffect(() => {
    let timeoutId;
    if (currentView === 'client-view' && activeProjectId) {
      const activeProj = projects.find(p => String(p.id) === String(activeProjectId));
      if (activeProj?.config?.enableTestimonialForm) {
        const hasSeen = localStorage.getItem(`testi_shown_${activeProj.id}`);
        if (!hasSeen) {
          timeoutId = setTimeout(() => {
            setShowTestimonial(true);
          }, 20000); 
        }
      } else {
        setShowTestimonial(false);
      }
    }
    return () => clearTimeout(timeoutId);
  }, [currentView, activeProjectId, projects]);

  const handleCloseTestimonial = () => {
    setIsClosingTesti(true);
    setTimeout(() => {
      setShowTestimonial(false);
      setIsClosingTesti(false);
      localStorage.setItem(`testi_shown_${activeProjectId}`, 'true');
    }, 300);
  };

  // --- ACTIONS ---

  const handleCopyLink = (slug) => {
    const link = `${window.location.origin}${window.location.pathname}?client=${slug}`;
    
    const textArea = document.createElement("textarea");
    textArea.value = link;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showNotification('Link Klien berhasil disalin!');
    } catch (err) {
        console.error('Gagal menyalin link', err);
        showNotification('Gagal menyalin link');
    }
    document.body.removeChild(textArea);
  };

  const handleCreateProject = () => {
    if (!newProjectName) return;
    
    let durationMs = 0;
    switch (newProjectDuration) {
      case '1w': durationMs = 7 * 24 * 60 * 60 * 1000; break;
      case '1mo': durationMs = 30 * 24 * 60 * 60 * 1000; break;
      case '3mo': durationMs = 90 * 24 * 60 * 60 * 1000; break;
      case '6mo': durationMs = 180 * 24 * 60 * 60 * 1000; break;
      case '1y': durationMs = 365 * 24 * 60 * 60 * 1000; break;
      default: durationMs = 7 * 24 * 60 * 60 * 1000;
    }

    const newProject = {
      id: `p${Date.now()}`,
      name: newProjectName,
      slug: newProjectName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      expiresAt: Date.now() + durationMs,
      config: { 
        title: newProjectName, 
        description: 'Silakan akses file Anda di bawah ini.', 
        whatsapp: '',
        enableTestimonialForm: false
      },
      items: [],
      submittedTestimonials: []
    };
    
    const updated = [newProject, ...projects];
    setProjects(updated);
    syncWithDatabase(updated);
    setIsCreatingProject(false);
    setNewProjectName('');
    showNotification('Project berhasil dibuat');
  };

  const handleAddItem = () => {
    if (!newItemTitle) { showNotification('Judul harus diisi'); return; }
    if (addItemCategory !== 'folder' && !newItemUrl) { showNotification('URL harus diisi'); return; }

    const newItem = {
      id: Date.now(),
      type: addItemCategory,
      title: newItemTitle,
      clicks: 0,
      ...(addItemCategory !== 'folder' ? { url: newItemUrl } : { items: [] })
    };

    const updated = projects.map(p => {
      if (String(p.id) !== String(activeProjectId)) return p;
      let updatedItems;
      if (!activeFolderId) {
        updatedItems = [...(p.items || []), newItem];
      } else {
        updatedItems = (p.items || []).map(item => {
          if (String(item.id) === String(activeFolderId) && item.type === 'folder') {
            return { ...item, items: [...(item.items || []), newItem] };
          }
          return item;
        });
      }
      return { ...p, items: updatedItems };
    });

    setProjects(updated);
    syncWithDatabase(updated);
    setNewItemTitle('');
    setNewItemUrl('');
    setIsAddingItem(false);
    showNotification('Item berhasil ditambahkan');
  };

  const handleSaveEdit = () => {
    if (!editItemTitle) { showNotification('Judul harus diisi'); return; }

    const updated = projects.map(p => {
      if (String(p.id) !== String(activeProjectId)) return p;
      
      const updateRecursive = (itemsList) => (itemsList || []).map(it => {
        if (String(it.id) === String(editingItemId)) {
          return { ...it, title: editItemTitle, url: it.type !== 'folder' ? editItemUrl : it.url };
        }
        if (it.type === 'folder' && it.items) {
          return { ...it, items: updateRecursive(it.items) };
        }
        return it;
      });

      return { ...p, items: updateRecursive(p.items) };
    });

    setProjects(updated);
    syncWithDatabase(updated);
    setEditingItemId(null);
    showNotification('Item berhasil diperbarui');
  };

  const handleExportCSV = () => {
    const activeProj = projects.find(p => String(p.id) === String(activeProjectId));
    if (!activeProj || !activeProj.submittedTestimonials || activeProj.submittedTestimonials.length === 0) {
      showNotification('Tidak ada data testimoni.');
      return;
    }

    const data = activeProj.submittedTestimonials;
    const headers = ['Nama/Instansi', 'Pesan Testimoni', 'Tanggal'];
    const csvRows = data.map(t => `"${t.name}","${t.message}","${t.date}"`);
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Testimoni_${activeProj.name.replace(/\s+/g, '_')}.csv`;
    link.click();
    showNotification('CSV Berhasil Diunduh');
  };

  const displayedItems = activeFolderId 
    ? activeProject?.items?.find(i => String(i.id) === String(activeFolderId))?.items || []
    : activeProject?.items || [];

  // --- RENDERING TAMPILAN ---
  const renderContent = () => {
    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><RefreshCw className="animate-spin" size={40} style={{color: COLOR_PRIMARY}} /></div>;

    // 1. LOGIN
    if (currentView === 'login') {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 relative overflow-hidden">
            <div className="text-center mb-8 pt-4">
              <img src={LOGO_URL} alt="Logo" className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg object-cover" style={{ backgroundColor: COLOR_PRIMARY }} />
              <h1 className="text-2xl font-black tracking-tight uppercase" style={{ color: COLOR_PRIMARY }}>Dashboard</h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest mt-1 font-bold">Link Project Management</p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const u = e.target.elements.u?.value;
              const p = e.target.elements.p?.value;
              if (u === 'admin@onedream.id' && p === 'admin123') setCurrentView('projects-list');
              else setAuthError('Email atau password salah');
            }} className="space-y-4">
              <Input label="Email" type="email" placeholder="" name="u"/>
              <Input label="Password" type="password" placeholder="" name="p"/>
              {authError && <div className="text-red-600 text-xs text-center font-bold bg-red-50 py-2 rounded-lg">{authError}</div>}
              <Button variant="primary" className="w-full mt-2 py-4 text-sm" type="submit">LOGIN</Button>
            </form>
          </div>
        </div>
      );
    }

    // 2. DASHBOARD PROJECT LIST
    if (currentView === 'projects-list') {
      return (
        <div className="min-h-screen bg-gray-50 pb-12">
          <nav className="bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm border-b border-gray-200">
            <div className="flex items-center gap-3">
               <img src={LOGO_URL} alt="Logo" className="w-10 h-10 rounded-full flex items-center justify-center object-cover" style={{ backgroundColor: COLOR_PRIMARY }} />
               <div className="flex flex-col">
                 <span className="font-black text-lg tracking-tight uppercase leading-tight" style={{ color: COLOR_PRIMARY }}>ONE DREAM</span>
                 <span className="text-[9px] text-slate-500 uppercase tracking-widest leading-tight font-bold">Creative</span>
               </div>
            </div>
            <div className="flex items-center gap-4">
               {isSaving && <RefreshCw size={14} className="animate-spin text-slate-400" />}
               <button onClick={() => setCurrentView('login')} className="transition-colors flex items-center text-sm font-bold uppercase tracking-wider" style={{ color: COLOR_SECONDARY }}>
                 <LogOut size={16} className="mr-2"/> Keluar
               </button>
            </div>
          </nav>

          <main className="max-w-6xl mx-auto p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                 <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: COLOR_PRIMARY }}>Project Aktif</h2>
                 <p className="text-slate-500 text-sm font-medium mt-1">Kelola file yang dibagikan ke klien Anda.</p>
              </div>
              <Button variant="primary" icon={Plus} onClick={() => setIsCreatingProject(true)}>Buat Project</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {isCreatingProject && (
                <Card className="p-6 h-full border-dashed border-2 bg-slate-50 relative animate-fade-in" style={{ borderColor: COLOR_PRIMARY }}>
                  <button onClick={() => setIsCreatingProject(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><X size={20}/></button>
                  <h3 className="font-bold mb-4 uppercase text-sm tracking-wider" style={{ color: COLOR_PRIMARY }}>Project Baru</h3>
                  <Input label="Nama Klien" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} placeholder="Contoh: Wedding A & B" />
                  <Select 
                    label="Durasi Aktif"
                    value={newProjectDuration}
                    onChange={(e) => setNewProjectDuration(e.target.value)}
                    options={[
                      { value: '1w', label: '1 Minggu' },
                      { value: '1mo', label: '1 Bulan' },
                      { value: '3mo', label: '3 Bulan' },
                      { value: '6mo', label: '6 Bulan' },
                      { value: '1y', label: '1 Tahun' },
                    ]}
                  />
                  <Button variant="primary" className="w-full mt-2" onClick={handleCreateProject}>Simpan & Buat</Button>
                </Card>
              )}

              {projects.map(project => (
                <Card key={project.id} onClick={() => { setActiveProjectId(project.id); setEditingItemId(null); setEditorTab('content'); setCurrentView('project-editor'); }} className="cursor-pointer hover:shadow-xl hover:-translate-y-1 group relative flex flex-col h-full transition-all duration-300">
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 text-white rounded-xl shadow-sm transition-colors" style={{ backgroundColor: COLOR_PRIMARY }}><FolderPlus size={24}/></div>
                      <button onClick={(e) => { e.stopPropagation(); if(confirm("Hapus project?")) { const up = projects.filter(p => p.id !== project.id); setProjects(up); syncWithDatabase(up); } }} className="text-gray-300 hover:text-red-500 z-10 p-2"><Trash2 size={18}/></button>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-1 truncate" style={{ color: COLOR_PRIMARY }}>{project.name}</h3>
                    <div className="text-xs font-bold text-slate-400 mb-6 bg-slate-100 inline-block px-2 py-1 rounded">/{project.slug}</div>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                      <div className="flex items-center text-[11px] font-bold text-slate-500 tracking-wide uppercase">
                        <Clock size={12} className="mr-1.5"/> {formatTimeLeft(project.expiresAt)}
                      </div>
                      <span className="text-xs text-white px-2 py-1 rounded-md font-bold" style={{ backgroundColor: COLOR_SECONDARY }}>{(project.items || []).length} Item</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </main>
        </div>
      );
    }

    // 3. PROJECT EDITOR
    if (currentView === 'project-editor' && activeProject) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button onClick={() => { setActiveProjectId(null); setEditingItemId(null); setCurrentView('projects-list'); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors" style={{ color: COLOR_PRIMARY }}><ArrowLeft size={22}/></button>
              <h1 className="text-lg font-black uppercase tracking-tight" style={{ color: COLOR_PRIMARY }}>{activeProject.name}</h1>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
               <div className="hidden md:flex items-center gap-2 text-xs font-bold tracking-wide bg-slate-50 px-4 py-2 rounded-full border border-gray-200" style={{ color: COLOR_SECONDARY }}>
                 <Clock size={14}/> {formatTimeLeft(activeProject.expiresAt)}
               </div>
               
               {/* Tombol Copy Link menggunakan Slug */}
               <Button variant="secondary" className="py-2 text-sm w-full sm:w-auto" icon={Copy} onClick={() => handleCopyLink(activeProject.slug || activeProject.id)}>Salin Link</Button>
               
               <Button variant="primary" className="py-2 text-sm w-full sm:w-auto" icon={ExternalLink} onClick={() => setCurrentView('client-view')}>Preview Klien</Button>
            </div>
          </header>

          <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
            <div className="flex justify-center mb-8">
              <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex overflow-hidden flex-wrap">
                <button onClick={() => setEditorTab('content')} className={`px-6 sm:px-8 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center ${editorTab === 'content' ? 'text-white rounded-lg shadow' : 'text-slate-500 hover:bg-slate-50'}`} style={editorTab === 'content' ? { backgroundColor: COLOR_PRIMARY } : {}}>
                  <LayoutDashboard size={16} className="mr-2"/> Konten
                </button>
                <button onClick={() => setEditorTab('settings')} className={`px-6 sm:px-8 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center ${editorTab === 'settings' ? 'text-white rounded-lg shadow' : 'text-slate-500 hover:bg-slate-50'}`} style={editorTab === 'settings' ? { backgroundColor: COLOR_PRIMARY } : {}}>
                  <Edit3 size={16} className="mr-2"/> Pengaturan
                </button>
                <button onClick={() => setEditorTab('testimonials')} className={`px-6 sm:px-8 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center ${editorTab === 'testimonials' ? 'text-white rounded-lg shadow' : 'text-slate-500 hover:bg-slate-50'}`} style={editorTab === 'testimonials' ? { backgroundColor: COLOR_PRIMARY } : {}}>
                  <MessageSquare size={16} className="mr-2"/> Testimoni
                </button>
              </div>
            </div>

            {editorTab === 'content' && (
              <div className="space-y-6 animate-fade-in">
                {activeFolderId && (
                  <button onClick={() => { setActiveFolderId(null); setEditingItemId(null); }} className="flex items-center text-sm hover:underline mb-2 font-bold uppercase tracking-wider" style={{ color: COLOR_SECONDARY }}>
                    <ArrowLeft size={16} className="mr-2"/> Kembali
                  </button>
                )}

                <Card className="p-6 border-slate-200 bg-white shadow-md">
                  {!isAddingItem ? (
                     <div className="flex flex-wrap gap-2 sm:gap-4">
                       {!activeFolderId && (
                         <button onClick={() => { setIsAddingItem(true); setAddItemCategory('folder'); }} className="flex-1 min-w-[100px] flex flex-col items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-300 shadow-sm transition-colors">
                           <FolderPlus size={24} className="mb-2" style={{ color: COLOR_PRIMARY }}/>
                           <span className="text-xs font-bold uppercase" style={{ color: COLOR_PRIMARY }}>Folder</span>
                         </button>
                       )}
                       <button onClick={() => { setIsAddingItem(true); setAddItemCategory('link'); }} className="flex-1 min-w-[100px] flex flex-col items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-300 shadow-sm transition-colors">
                         <LinkIcon size={24} className="text-blue-600 mb-2"/>
                         <span className="text-xs font-bold text-slate-600 uppercase">Link</span>
                       </button>
                       <button onClick={() => { setIsAddingItem(true); setAddItemCategory('file'); }} className="flex-1 min-w-[100px] flex flex-col items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-300 shadow-sm transition-colors">
                         <File size={24} className="text-orange-600 mb-2"/>
                         <span className="text-xs font-bold text-slate-600 uppercase">File</span>
                       </button>
                       <button onClick={() => { setIsAddingItem(true); setAddItemCategory('photo'); }} className="flex-1 min-w-[100px] flex flex-col items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-300 shadow-sm transition-colors">
                         <ImageIcon size={24} className="text-purple-600 mb-2"/>
                         <span className="text-xs font-bold text-slate-600 uppercase">Foto</span>
                       </button>
                       <button onClick={() => { setIsAddingItem(true); setAddItemCategory('video'); }} className="flex-1 min-w-[100px] flex flex-col items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-300 shadow-sm transition-colors">
                         <Video size={24} className="mb-2" style={{ color: COLOR_SECONDARY }}/>
                         <span className="text-xs font-bold text-slate-600 uppercase">Video</span>
                       </button>
                     </div>
                  ) : (
                    <div className="space-y-4">
                      <Input label="Judul Tombol" placeholder="Contoh: Download Video Final" value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} />
                      {addItemCategory !== 'folder' && (
                        <Input label="URL Tujuan" placeholder={addItemCategory === 'video' ? "Link YouTube..." : "https://drive.google.com/..."} value={newItemUrl} onChange={e => setNewItemUrl(e.target.value)} />
                      )}
                      <div className="flex gap-2">
                         <Button variant="primary" className="flex-1 py-3" onClick={handleAddItem}>Simpan Item</Button>
                         <Button variant="secondary" onClick={() => setIsAddingItem(false)}>Batal</Button>
                      </div>
                    </div>
                  )}
                </Card>

                <div className="space-y-3">
                  {(displayedItems || []).map(item => {
                    if (String(editingItemId) === String(item.id)) {
                      return (
                        <Card key={item.id} className="p-5 border-slate-200 shadow-md">
                          <div className="space-y-4">
                            <h4 className="font-bold text-sm tracking-widest uppercase flex items-center justify-between" style={{ color: COLOR_PRIMARY }}>
                              Edit {item.type}
                              <button onClick={() => setEditingItemId(null)} className="p-1 text-gray-400 hover:text-red-500 bg-gray-100 rounded-md"><X size={16}/></button>
                            </h4>
                            <Input label="Judul Tombol" value={editItemTitle} onChange={e => setEditItemTitle(e.target.value)} />
                            {item.type !== 'folder' && (
                              <Input label="URL Tujuan" value={editItemUrl} onChange={e => setEditItemUrl(e.target.value)} />
                            )}
                            <div className="flex gap-3 pt-2">
                              <Button variant="secondary" className="flex-1" onClick={() => setEditingItemId(null)}>Batal</Button>
                              <Button variant="primary" className="flex-1" onClick={handleSaveEdit}>Simpan Perubahan</Button>
                            </div>
                          </div>
                        </Card>
                      );
                    }

                    let iconColor = "text-blue-600 bg-blue-50";
                    if (item.type === 'photo') iconColor = "text-purple-600 bg-purple-50";
                    else if (item.type === 'file') iconColor = "text-orange-600 bg-orange-50";
                    else if (item.type === 'video') iconColor = `text-[${COLOR_SECONDARY}] bg-pink-50`;
                    else if (item.type === 'folder') iconColor = `text-[${COLOR_PRIMARY}] bg-blue-50`;

                    return (
                      <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className={`p-3 rounded-xl ${iconColor}`}>
                            {item.type === 'folder' ? <Folder size={20}/> : 
                             item.type === 'photo' ? <ImageIcon size={20}/> :
                             item.type === 'video' ? <Video size={20}/> :
                             item.type === 'file' ? <File size={20}/> : <LinkIcon size={20}/>}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm truncate" style={{ color: COLOR_PRIMARY }}>{item.title}</h4>
                            {item.type !== 'folder' && <p className="text-xs text-gray-400 truncate mt-0.5 font-medium">{item.url}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.type === 'folder' && (
                            <Button variant="secondary" className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider" onClick={() => setActiveFolderId(item.id)}>Buka</Button>
                          )}
                          <button onClick={() => {
                             setEditingItemId(item.id);
                             setEditItemTitle(item.title);
                             setEditItemUrl(item.url || '');
                          }} className="p-2.5 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"><Edit3 size={18}/></button>
                          <button onClick={() => handleDeleteItem(item.id)} className="p-2.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={18}/></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {editorTab === 'settings' && (
              <div className="grid grid-cols-1 gap-6 animate-fade-in">
                <Card className="p-6 shadow-md">
                   <h3 className="font-black mb-6 border-b border-gray-100 pb-3 uppercase tracking-widest text-sm" style={{ color: COLOR_PRIMARY }}>Informasi Halaman</h3>
                   <Input label="Judul Header" value={activeProject?.config?.title || ''} onChange={e => {
                      const up = projects.map(p => String(p.id) === String(activeProjectId) ? {...p, config: {...(p.config || {}), title: e.target.value}} : p);
                      setProjects(up);
                      syncWithDatabase(up);
                   }}/>
                   <TextArea label="Pesan Sambutan" value={activeProject?.config?.description || ''} onChange={e => {
                       const up = projects.map(p => String(p.id) === String(activeProjectId) ? {...p, config: {...(p.config || {}), description: e.target.value}} : p);
                       setProjects(up);
                       syncWithDatabase(up);
                   }}/>
                </Card>

                <Card className="p-6 shadow-md">
                   <h3 className="font-black mb-6 border-b border-gray-100 pb-3 uppercase tracking-widest text-sm" style={{ color: COLOR_PRIMARY }}>Bantuan & Testimoni</h3>
                   <Input label="Nomor WhatsApp (62812...)" value={activeProject?.config?.whatsapp || ''} onChange={e => {
                       const up = projects.map(p => String(p.id) === String(activeProjectId) ? {...p, config: {...(p.config || {}), whatsapp: e.target.value}} : p);
                       setProjects(up);
                       syncWithDatabase(up);
                   }}/>
                   <div className="mt-6">
                     <Select 
                       label="Form Pop-up Testimoni Klien"
                       value={activeProject?.config?.enableTestimonialForm ? 'true' : 'false'}
                       onChange={e => {
                           const val = e.target.value === 'true';
                           const up = projects.map(p => String(p.id) === String(activeProjectId) ? {...p, config: {...(p.config || {}), enableTestimonialForm: val}} : p);
                           setProjects(up);
                           syncWithDatabase(up);
                       }}
                       options={[
                         { value: 'true', label: 'Aktif (Tampilkan Form)' },
                         { value: 'false', label: 'Nonaktif' }
                       ]}
                     />
                   </div>
                </Card>
              </div>
            )}

            {editorTab === 'testimonials' && (
              <div className="animate-fade-in">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black uppercase tracking-widest text-sm" style={{ color: COLOR_PRIMARY }}>Testimoni Klien</h3>
                    <Button onClick={handleExportCSV} variant="secondary" className="text-xs" icon={Download}>Export CSV</Button>
                 </div>
                 <div className="space-y-4">
                    {(!activeProject?.submittedTestimonials || activeProject.submittedTestimonials.length === 0) ? (
                       <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500 font-medium">Belum ada testimoni.</div>
                    ) : (
                       activeProject.submittedTestimonials.map(t => (
                          <Card key={t.id} className="p-5 border-l-4 shadow-sm" style={{borderLeftColor: COLOR_TERTIARY}}>
                             <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-sm" style={{ color: COLOR_PRIMARY }}>{t.name}</h4>
                                <span className="text-[10px] font-bold text-gray-400">{t.date}</span>
                             </div>
                             <p className="text-xs text-gray-600 italic font-medium">"{t.message}"</p>
                          </Card>
                       ))
                    )}
                 </div>
              </div>
            )}

          </div>
          {notification && <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 text-xs font-bold uppercase tracking-widest animate-fade-in">{notification}</div>}
        </div>
      );
    }

    // 4. CLIENT VIEW (ONE DREAM UI)
    if (currentView === 'client-view' && activeProject) {
      const ClientItemRenderer = ({ item }) => {
        const [isOpen, setIsOpen] = useState(false);
        const youtubeId = item.type === 'video' ? getYouTubeId(item.url) : null;

        if (item.type === 'folder') {
          return (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4 shadow-sm w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-colors active:translate-y-0"
              >
                <div className="flex items-center gap-3">
                  <Folder size={22} style={{ color: COLOR_PRIMARY }} />
                  <span className="font-bold text-base" style={{ color: COLOR_PRIMARY }}>{item.title}</span>
                </div>
                {isOpen ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
              </button>
              {isOpen && (
                <div className="bg-slate-50 p-4 space-y-3 border-t border-gray-200">
                  {(item.items && item.items.length > 0) ? (
                     item.items.map(sub => <ClientItemRenderer key={sub.id} item={sub} />)
                  ) : (
                     <p className="text-sm text-slate-400 text-center py-4 font-medium">Folder ini kosong</p>
                  )}
                </div>
              )}
            </div>
          );
        }

        if (youtubeId) {
          return (
            <div className="mb-6 bg-white p-4 rounded-xl shadow-md border w-full">
               <div className="flex items-center gap-2 mb-3">
                  <PlayCircle size={18} style={{ color: COLOR_SECONDARY }}/>
                  <span className="font-bold text-sm tracking-wide" style={{ color: COLOR_PRIMARY }}>{item.title}</span>
               </div>
               <iframe width="100%" className="aspect-video rounded-xl" src={`https://www.youtube.com/embed/${youtubeId}`} frameBorder="0" allowFullScreen></iframe>
            </div>
          );
        }

        let iconColor = "text-blue-600 bg-blue-50";
        if (item.type === 'photo') iconColor = "text-purple-600 bg-purple-50";
        else if (item.type === 'file') iconColor = "text-orange-600 bg-orange-50";
        else if (item.type === 'video') iconColor = `text-[${COLOR_SECONDARY}] bg-pink-50`;

        return (
          <a 
            href={item.url} target="_blank" rel="noreferrer"
            className="block bg-white p-5 rounded-xl shadow-md border hover:-translate-y-1 hover:shadow-lg active:translate-y-0 transition-all duration-300 mb-4 flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${iconColor}`}>
                {item.type === 'photo' ? <ImageIcon size={22}/> : <LinkIcon size={22}/>}
              </div>
              <span className="font-bold text-base" style={{ color: COLOR_PRIMARY }}>{item.title}</span>
            </div>
            <ExternalLink size={18} className="text-slate-300" />
          </a>
        );
      };

      return (
        <div className="min-h-screen bg-slate-100 flex flex-col relative">
          
          {/* MODAL ULASAN DENGAN ANIMASI TUTUP */}
          {showTestimonial && activeProject?.config?.enableTestimonialForm && (
            <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md transition-opacity duration-300 ${isClosingTesti ? 'opacity-0' : 'opacity-100'}`}>
               <div className={`bg-white rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl transition-transform duration-300 ${isClosingTesti ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0'}`}>
                  <button onClick={handleCloseTestimonial} className="absolute top-5 right-5 text-gray-400"><X size={20}/></button>
                  <h3 className="font-black text-xl mb-1" style={{ color: COLOR_PRIMARY }}>Berikan Ulasan</h3>
                  <p className="text-sm text-slate-500 mb-6 font-medium">Bagikan pengalaman Anda dengan One Dream Creative</p>
                  <Input label="Nama / Instansi" placeholder="Nama Anda..." value={clientTestiName} onChange={e => setClientTestiName(e.target.value)} />
                  <TextArea label="Ulasan" rows={3} value={clientTestiMsg} onChange={e => setClientTestiMsg(e.target.value)} />
                  <Button variant="primary" className="w-full mt-2 py-3" onClick={() => {
                        if (!clientTestiName || !clientTestiMsg) return;
                        const newTesti = { id: Date.now(), name: clientTestiName, message: clientTestiMsg, date: new Date().toLocaleDateString('id-ID') };
                        const up = projects.map(p => String(p.id) === String(activeProject.id) ? { ...p, submittedTestimonials: [...(p.submittedTestimonials || []), newTesti] } : p);
                        setProjects(up);
                        syncWithDatabase(up);
                        
                        alert("Terima kasih atas ulasan Anda!");
                        handleCloseTestimonial();
                    }}>Kirim Ulasan</Button>
               </div>
            </div>
          )}

          {/* Tampilkan tombol kembali HANYA JIKA BUKAN MODE KLIEN */}
          {!isClientMode && (
            <button onClick={() => setCurrentView('project-editor')} className="fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow border hover:bg-white hover:-translate-y-1 active:translate-y-0 transition-all duration-300"><ArrowLeft size={18}/></button>
          )}

          <div className="relative text-white pt-24 pb-24 px-4 bg-cover bg-center" style={{ backgroundImage: `url('${HEADER_BG_URL}')` }}>
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" style={{ backgroundColor: 'rgba(1, 1, 61, 0.8)' }}></div> 
            {/* Wrapper diatur agar lebar dan posisinya sama persis dengan kartu konten (w-full max-w-md) namun teks dibuat rata tengah (text-center) */}
            <div className="relative z-10 max-w-md w-full mx-auto flex flex-col items-center text-center">
               <img src={LOGO_URL} alt="Logo" className="w-24 h-24 rounded-full bg-white mb-6 flex items-center justify-center shadow-2xl border-4 object-cover self-center" style={{borderColor: COLOR_PRIMARY}} />
               <div className="w-full">
                 <h1 className="text-3xl font-black mb-3 tracking-tight uppercase leading-tight">{activeProject?.config?.title || activeProject?.name}</h1>
                 <p className="text-slate-200 text-sm font-medium leading-relaxed">{activeProject?.config?.description || ''}</p>
               </div>
            </div>
          </div>

          <div className="flex-1 max-w-md w-full mx-auto px-4 -mt-10 relative z-20 pb-10 flex flex-col">
            <div className="shadow-xl rounded-xl p-4 flex items-center justify-between mb-6 text-white transition-all duration-300 hover:-translate-y-1" style={{ backgroundColor: COLOR_SECONDARY }}>
                <div className="flex flex-col text-left"><span className="text-[10px] font-bold uppercase opacity-80">Batas Waktu Akses</span><span className="text-sm font-black">{formatTimeLeft(activeProject?.expiresAt)}</span></div>
                <Clock size={24} className="animate-pulse" />
            </div>
            <div className="space-y-1 mb-8">
               {(activeProject?.items || []).map(item => <ClientItemRenderer key={item.id} item={item} />)}
            </div>
            
            <div className="w-full flex justify-center mt-auto pb-8">
               <a href={`https://wa.me/${activeProject?.config?.whatsapp || DEFAULT_WHATSAPP}`} target="_blank" rel="noreferrer" className="bg-green-600 text-white px-8 py-4 rounded-full shadow-lg flex items-center gap-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:translate-y-0">
                 <MessageCircle size={20}/> Hubungi Kami
               </a>
            </div>
          </div>

          <footer className="bg-transparent font-bold text-center py-8 text-[10px] uppercase border-t border-slate-200/50" style={{ color: COLOR_PRIMARY }}>
             © {new Date().getFullYear()} PT ONE DREAM CREATIVE.
          </footer>
        </div>
      );
    }

    // --- FINAL FALLBACK ---
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4 p-6 text-center">
         <AlertTriangle size={48} className="text-amber-500 mb-2" />
         <div>
           <p className="text-slate-900 font-black uppercase text-sm tracking-widest">Sesi Berakhir atau Project Tidak Ditemukan</p>
           <p className="text-slate-500 text-xs mt-1 font-medium">Data sedang disinkronkan atau Anda telah keluar sistem.</p>
         </div>
         {!isClientMode && (
           <Button variant="primary" className="mt-4 px-10" onClick={() => { setCurrentView('login'); setActiveProjectId(null); }}>Kembali ke Login</Button>
         )}
      </div>
    );
  };

  // Bungkus seluruh konten dengan styling Global untuk font Urbanist
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap');
        * {
          font-family: 'Urbanist', sans-serif !important;
        }
      `}</style>
      {renderContent()}
    </>
  );
}