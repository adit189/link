import React, { useState, useEffect } from "react";
import { 
  Folder, Link, FileText, Image, Video, Plus, Trash2, Edit3, 
  ChevronRight, ExternalLink, Globe, Layout, Share2, LogIn,
  ArrowLeft, Download, PlusCircle, Check, X, Save, RefreshCw
} from "lucide-react";

// --- CONFIGURATION ---
const COLOR_PRIMARY = "#0F172A"; // Slate 900
const LOGO_URL = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=200&h=200&auto=format&fit=crop";

// --- API CONFIGURATION ---
// Catatan: Di Hostinger, biarkan tetap 'api.php'. 
const API_URL = 'api.php'; 
const USER_ID = 'admin_user'; 

const App = () => {
  // --- STATE ---
  const [currentView, setCurrentView] = useState('login');
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Data State
  const [projects, setProjects] = useState([]);
  
  // Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [addItemCategory, setAddItemCategory] = useState('link');
  
  // Edit State
  const [editingItemId, setEditingItemId] = useState(null);
  const [editItemTitle, setEditItemTitle] = useState('');
  const [editItemUrl, setEditItemUrl] = useState('');

  const [notification, setNotification] = useState(null);

  // --- DATABASE OPERATIONS ---

  // Fungsi pembantu untuk memvalidasi URL
  const getFullApiUrl = (params = "") => {
    return `${API_URL}${params}`;
  };

  // 1. Ambil Data dari Database (Fetch) dengan Fallback ke LocalStorage
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Coba ambil dari MySQL di Hostinger
        const response = await fetch(getFullApiUrl(`?user_id=${USER_ID}`));
        
        // Cek jika response bukan JSON atau error 404
        if (!response.ok) throw new Error('API file not found or server error');
        
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            // Jika api.php mengembalikan error HTML atau text bukan JSON
            throw new Error('Invalid JSON response from server');
        }
        
        if (data && Array.isArray(data) && data.length > 0) {
          setProjects(data);
          localStorage.setItem('drivelink_backup', JSON.stringify(data));
        } else {
          loadFallbackData();
        }
      } catch (error) {
        console.warn("Database MySQL belum siap atau tidak terjangkau. Menggunakan data lokal.");
        loadFallbackData();
      } finally {
        setIsLoading(false);
      }
    };

    const loadFallbackData = () => {
      const localData = localStorage.getItem('drivelink_backup');
      if (localData) {
        setProjects(JSON.parse(localData));
      } else {
        setProjects([
          { id: 'p1', name: 'Project Alpha Launch', items: [], settings: { theme: 'modern' } }
        ]);
      }
    };

    fetchData();
  }, []);

  // 2. Simpan Data ke Database
  const syncWithDatabase = async (currentProjects) => {
    localStorage.setItem('drivelink_backup', JSON.stringify(currentProjects));
    
    setIsSaving(true);
    try {
      const response = await fetch(getFullApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          user_id: USER_ID,
          content: JSON.stringify(currentProjects)
        })
      });
      
      if (!response.ok) throw new Error('Offline/API not found');
      
      const result = await response.json();
      if (result.status !== 'success') throw new Error(result.message);
      showNotification("Sinkronisasi Cloud Berhasil");
    } catch (error) {
      console.log("Sinkronisasi Cloud dilewati (Mode Lokal)");
    } finally {
      setIsSaving(false);
    }
  };

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- HANDLERS ---

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === '1234') {
      setCurrentView('projects-list');
    } else {
      showNotification('Username atau password salah', 'error');
    }
  };

  const handleAddProject = () => {
    const name = prompt("Nama Project Baru:");
    if (name) {
      const newProjects = [...projects, { id: Date.now().toString(), name, items: [], settings: { theme: 'modern' } }];
      setProjects(newProjects);
      syncWithDatabase(newProjects);
      showNotification('Project berhasil dibuat');
    }
  };

  const handleAddItem = () => {
    if (!newItemTitle) return;
    
    const newItem = {
      id: Date.now().toString(),
      type: addItemCategory,
      title: newItemTitle,
      url: addItemCategory === 'folder' ? null : newItemUrl,
      items: addItemCategory === 'folder' ? [] : null
    };

    const updatedProjects = projects.map(p => {
      if (p.id !== activeProjectId) return p;
      
      if (!activeFolderId) {
        return { ...p, items: [...p.items, newItem] };
      } else {
        const updateInFolder = (items) => items.map(it => {
          if (it.id === activeFolderId) {
            return { ...it, items: [...(it.items || []), newItem] };
          }
          if (it.items) return { ...it, items: updateInFolder(it.items) };
          return it;
        });
        return { ...p, items: updateInFolder(p.items) };
      }
    });

    setProjects(updatedProjects);
    syncWithDatabase(updatedProjects);
    setNewItemTitle('');
    setNewItemUrl('');
    showNotification('Item berhasil ditambahkan');
  };

  const handleSaveEdit = () => {
    if (!editItemTitle) return;

    const updatedProjects = projects.map(p => {
      if (p.id !== activeProjectId) return p;
      
      const updateRecursive = (itemsList) => itemsList.map(it => {
        if (it.id === editingItemId) {
          return { ...it, title: editItemTitle, url: it.type !== 'folder' ? editItemUrl : it.url };
        }
        if (it.type === 'folder' && it.items) {
          return { ...it, items: updateRecursive(it.items) };
        }
        return it;
      });

      return { ...p, items: updateRecursive(p.items) };
    });

    setProjects(updatedProjects);
    syncWithDatabase(updatedProjects);
    setEditingItemId(null);
    showNotification('Item berhasil diperbarui');
  };

  const handleDeleteItem = (id) => {
    if (!confirm("Hapus item ini?")) return;

    const updatedProjects = projects.map(p => {
      if (p.id !== activeProjectId) return p;
      
      const removeRecursive = (itemsList) => itemsList
        .filter(it => it.id !== id)
        .map(it => it.items ? { ...it, items: removeRecursive(it.items) } : it);

      return { ...p, items: removeRecursive(p.items) };
    });

    setProjects(updatedProjects);
    syncWithDatabase(updatedProjects);
    showNotification('Item dihapus');
  };

  const handleLogout = () => {
    setCurrentView('login');
    setUsername('');
    setPassword('');
  };

  // --- RENDERING HELPERS ---
  const activeProject = projects.find(p => p.id === activeProjectId);
  const displayedItems = activeFolderId 
    ? (function findFolder(items) {
        for (let it of items) {
          if (it.id === activeFolderId) return it.items || [];
          if (it.items) {
            const found = findFolder(it.items);
            if (found) return found;
          }
        }
        return [];
      })(activeProject?.items || [])
    : activeProject?.items || [];

  // --- VIEWS ---

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-slate-400" size={40} />
          <p className="text-slate-500 font-medium animate-pulse">Menghubungkan ke Sistem...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-900"></div>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
              <Layout className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">DRIVELINK</h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Creative Cloud Manager</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all" placeholder="admin" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all" placeholder="••••" />
            </div>
            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-6">
              Masuk <LogIn size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Layout className="text-white" size={18} />
          </div>
          <span className="font-black text-slate-900 tracking-tighter text-xl">DRIVELINK</span>
        </div>
        <div className="flex items-center gap-4">
          {isSaving && <span className="text-[10px] font-bold text-slate-400 uppercase animate-pulse flex items-center gap-1"><RefreshCw size={10} className="animate-spin"/> Menghubungkan Cloud...</span>}
          <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors">Keluar</button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {currentView === 'projects-list' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h2>
                <p className="text-slate-500 text-sm">Kelola semua project link Anda di satu tempat.</p>
              </div>
              <button onClick={handleAddProject} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all active:scale-95">
                <Plus size={18} /> Project Baru
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {projects.map(p => (
                <div key={p.id} onClick={() => { setActiveProjectId(p.id); setCurrentView('editor'); }} className="bg-white border border-slate-200 rounded-3xl p-6 cursor-pointer hover:border-slate-400 hover:shadow-xl transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <Folder size={24} />
                    </div>
                    <h3 className="font-black text-xl text-slate-900 mb-1">{p.name}</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{p.items.length} Items</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* PROJECT EDITOR VIEW */
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button onClick={() => { setCurrentView('projects-list'); setActiveFolderId(null); }} className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{activeProject?.name}</h2>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span className="hover:text-slate-900 cursor-pointer" onClick={() => setActiveFolderId(null)}>Root</span>
                  {activeFolderId && <span>/ Folder Aktif</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT: ADD FORM */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm sticky top-24">
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                    <PlusCircle size={14}/> Tambah Konten Baru
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'link', icon: Link, label: 'Link' },
                        { id: 'folder', icon: Folder, label: 'Folder' },
                        { id: 'file', icon: FileText, label: 'File' }
                      ].map(cat => (
                        <button key={cat.id} onClick={() => setAddItemCategory(cat.id)} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${addItemCategory === cat.id ? 'border-slate-900 bg-slate-50 text-slate-900' : 'border-transparent bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                          <cat.icon size={20} className="mb-1" />
                          <span className="text-[10px] font-bold uppercase">{cat.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3 pt-2">
                      <input value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} placeholder="Judul Tombol..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-medium" />
                      {addItemCategory !== 'folder' && (
                        <input value={newItemUrl} onChange={e => setNewItemUrl(e.target.value)} placeholder="Link URL (https://...)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-medium" />
                      )}
                      <button onClick={handleAddItem} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-slate-800 shadow-md active:scale-95 transition-all mt-2">
                        Simpan Item
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: LIST ITEMS */}
              <div className="lg:col-span-2 space-y-4">
                {displayedItems.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 flex flex-col items-center">
                    <Download size={32} className="mb-2 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-xs">Belum ada konten di sini</p>
                  </div>
                ) : (
                  displayedItems.map(item => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all">
                      {editingItemId === item.id ? (
                        <div className="w-full space-y-3 p-2">
                           <div className="flex justify-between items-center mb-2">
                             <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Mode Edit</span>
                             <button onClick={() => setEditingItemId(null)}><X size={16} className="text-red-400"/></button>
                           </div>
                           <input value={editItemTitle} onChange={e => setEditItemTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm" />
                           {item.type !== 'folder' && <input value={editItemUrl} onChange={e => setEditItemUrl(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm" />}
                           <button onClick={handleSaveEdit} className="w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-bold uppercase">Update</button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'folder' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                              {item.type === 'folder' ? <Folder size={20}/> : <Link size={20}/>}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm leading-tight">{item.title}</h4>
                              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{item.type === 'folder' ? 'Click to open' : item.url}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.type === 'folder' && (
                              <button onClick={() => setActiveFolderId(item.id)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"><ChevronRight size={18}/></button>
                            )}
                            <button onClick={() => { setEditingItemId(item.id); setEditItemTitle(item.title); setEditItemUrl(item.url || ''); }} className="p-2 text-slate-400 hover:text-blue-500 rounded-lg transition-all"><Edit3 size={16}/></button>
                            <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-all"><Trash2 size={16}/></button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* NOTIFICATION */}
      {notification && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-2xl shadow-2xl z-50 animate-bounce flex items-center gap-3 border ${notification.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-white border-slate-100 text-slate-900'}`}>
          {notification.type === 'error' ? <X size={18}/> : <Check size={18} className="text-green-500" />}
          <span className="font-bold text-xs uppercase tracking-widest">{notification.msg}</span>
        </div>
      )}
    </div>
  );
};

export default App;