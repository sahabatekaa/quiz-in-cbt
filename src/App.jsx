import React, { useState, useEffect, useRef } from 'react';
import { 
  Moon, Sun, LayoutGrid, Clock, LogOut, ShieldAlert, 
  Send, ChevronLeft, ChevronRight, User, Eye, 
  FileJson, Trash2, Printer, CheckCircle2, AlertCircle,
  Upload, Users, BookOpen, X
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, getDocs, deleteDoc } from 'firebase/firestore';

// ==========================================
// 1. FIREBASE INITIALIZATION
// ==========================================
// TODO: GANTI DENGAN CONFIG FIREBASE ANDA SENDIRI DARI TAHAP 5
const firebaseConfig = {
  apiKey: "AIzaSyAN11BP0HAC8gY95UweSGjVABwW3Yna1mo",
  authDomain: "quiz-in-8289f.firebaseapp.com",
  projectId: "quiz-in-8289f",
  storageBucket: "quiz-in-8289f.firebasestorage.app",
  messagingSenderId: "911240714603",
  appId: "1:911240714603:web:2e2ff3df922549c6c2142e"
};

// Logika agar tetap bisa jalan di platform Preview/Canvas maupun Localhost
const config = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : firebaseConfig;
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'cbt-smp-local';

// ==========================================
// 2. DEFAULT QUESTIONS TEMPLATE (JSON)
// ==========================================
const DEFAULT_QUESTIONS = [
  { 
    id: 1, 
    type: "PG", 
    q: "Campuran antara warna merah dan kuning akan menghasilkan warna...", 
    a: ["Hijau", "Jingga", "Ungu", "Cokelat"], 
    correct: 1 
  },
  { 
    id: 2, 
    type: "PG", 
    q: "Tari Kecak merupakan tarian tradisional yang berasal dari daerah...", 
    a: ["Sumatera Barat", "Jawa Timur", "Sulawesi Selatan", "Bali"], 
    correct: 3 
  },
  { 
    id: 3, 
    type: "PG", 
    q: "Alat musik sasando yang berasal dari Nusa Tenggara Timur dimainkan dengan cara...", 
    a: ["Dipetik", "Digesek", "Ditiup", "Dipukul"], 
    correct: 0 
  },
  { 
    id: 4, 
    type: "PG", 
    q: "Lagu daerah 'Ampar-Ampar Pisang' berasal dari provinsi...", 
    a: ["Maluku", "Sumatera Utara", "Kalimantan Selatan", "Kalimantan Barat"], 
    correct: 2 
  },
  { 
    id: 5, 
    type: "PG", 
    q: "Unsur paling dasar dalam seni rupa dua dimensi yang menjadi awal terbentuknya suatu goresan adalah...", 
    a: ["Bidang", "Garis", "Warna", "Titik"], 
    correct: 3 
  },
  { 
    id: 6, 
    type: "PG", 
    q: "Patung yang dibuat dengan tujuan untuk memperingati peristiwa bersejarah atau mengenang jasa pahlawan disebut patung...", 
    a: ["Monumen", "Religi", "Dekorasi", "Arsitektur"], 
    correct: 0 
  },
  { 
    id: 7, 
    type: "PG", 
    q: "Pencipta lagu kebangsaan 'Indonesia Raya' adalah...", 
    a: ["Ismail Marzuki", "W.R. Supratman", "Ibu Sud", "C. Simanjuntak"], 
    correct: 1 
  },
  { 
    id: 8, 
    type: "PG", 
    q: "Tangga nada yang hanya terdiri dari lima nada pokok disebut tangga nada...", 
    a: ["Diatonis", "Kromatis", "Melodis", "Pentatonis"], 
    correct: 3 
  },
  { 
    id: 9, 
    type: "PG", 
    q: "Teknik melukis dengan menggunakan titik-titik warna untuk membentuk sebuah objek gambar disebut teknik...", 
    a: ["Pointilis", "Dusel", "Akuarel", "Plakat"], 
    correct: 0 
  },
  { 
    id: 10, 
    type: "PG", 
    q: "Motif hias kain batik 'Mega Mendung' yang terkenal dengan bentuk awan-awannya berasal dari daerah...", 
    a: ["Solo", "Cirebon", "Pekalongan", "Yogyakarta"], 
    correct: 1 
  },
  { 
    id: 11, 
    type: "PG", 
    q: "Pertunjukan teater tradisional yang berasal dari Jawa Timur dan sering menggunakan dialog yang spontan atau improvisasi adalah...", 
    a: ["Lenong", "Ketoprak", "Makyong", "Ludruk"], 
    correct: 3 
  },
  { 
    id: 12, 
    type: "PG", 
    q: "Alat musik angklung yang diakui sebagai warisan budaya dunia terbuat dari bahan dasar...", 
    a: ["Bambu", "Rotan", "Logam", "Kayu"], 
    correct: 0 
  },
  { 
    id: 13, 
    type: "PG", 
    q: "Tari Saman dari Aceh sangat mengandalkan unsur...", 
    a: ["Iringan alat musik tiup", "Kekompakan gerak dan tepukan", "Properti panggung", "Tata rias yang tebal"], 
    correct: 1 
  },
  { 
    id: 14, 
    type: "PG", 
    q: "Gambar yang dibuat dengan tujuan untuk memperjelas, menerangkan, atau menghiasi suatu teks/cerita disebut gambar...", 
    a: ["Karikatur", "Ilustrasi", "Dekoratif", "Bentuk"], 
    correct: 1 
  },
  { 
    id: 15, 
    type: "PG", 
    q: "Jarak antara nada satu ke nada yang lain dalam ilmu musik sering disebut sebagai...", 
    a: ["Tempo", "Birama", "Interval", "Melodi"], 
    correct: 2 
  },
  { 
    id: 16, 
    type: "PG", 
    q: "Berikut ini yang merupakan kelompok warna primer (warna dasar) murni adalah...", 
    a: ["Merah, Hijau, Biru", "Kuning, Hijau, Ungu", "Merah, Hitam, Putih", "Merah, Kuning, Biru"], 
    correct: 3 
  },
  { 
    id: 17, 
    type: "PG", 
    q: "Tarian yang hanya dibawakan atau dilakukan oleh seorang penari saja disebut tari...", 
    a: ["Tunggal", "Kelompok", "Berpasangan", "Massal"], 
    correct: 0 
  },
  { 
    id: 18, 
    type: "PG", 
    q: "Proses pembuatan batik tradisional yang secara manual menggunakan malam (lilin) dan alat bernama canting disebut teknik batik...", 
    a: ["Sablon", "Tulis", "Cap", "Celup ikat"], 
    correct: 1 
  },
  { 
    id: 19, 
    type: "PG", 
    q: "Fungsi utama dari alat musik ritmis (seperti gendang, ketipung, tamborin) dalam sebuah ansambel adalah untuk...", 
    a: ["Mengatur irama/tempo lagu", "Memberikan nada dasar", "Memainkan melodi utama", "Mengiringi penyanyi secara solo"], 
    correct: 0 
  },
  { 
    id: 20, 
    type: "PG", 
    q: "Kain tenun tradisional khas suku Batak dari Sumatera Utara yang sering digunakan dalam berbagai upacara adat disebut...", 
    a: ["Songket", "Sasirangan", "Ulos", "Gringsing"], 
    correct: 2 
  }
];

// ==========================================
// 3. REUSABLE UI COMPONENTS
// ==========================================
const Card = ({ children, className = '', isDarkMode }) => (
  <div className={`backdrop-blur-xl border shadow-2xl rounded-3xl transition-all duration-300
    ${isDarkMode 
      ? 'bg-slate-800/40 border-slate-700/50 shadow-black/50 text-slate-100' 
      : 'bg-white/60 border-white/80 shadow-emerald-900/10 text-slate-800'} 
    ${className}`}>
    {children}
  </div>
);

// ==========================================
// 4. MAIN APPLICATION COMPONENT
// ==========================================
const App = () => {
  const [authUser, setAuthUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [view, setView] = useState('login'); 
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  
  // Custom Modal UI State (MENGGANTIKAN PROMPT/ALERT BAWAAN)
  const [modal, setModal] = useState({ isOpen: false, type: '', message: '', inputValue: '' });

  const [user, setUser] = useState({ name: '', class: '', token: '' });
  const [examState, setExamState] = useState({
    answers: {}, timeLeft: 3600, currentIdx: 0, isFinished: false, violations: 0, score: 0
  });

  const [studentsData, setStudentsData] = useState([]);
  const timerRef = useRef(null);

  // --- EFFECT: FIREBASE AUTH ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          // Hanya dijalankan jika berada di Canvas environment
          await import('firebase/auth').then(({ signInWithCustomToken }) => {
            signInWithCustomToken(auth, __initial_auth_token);
          });
        } else {
          // Untuk Localhost VS Code
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => setAuthUser(u));
    return () => unsubscribe();
  }, []);

  // --- EFFECT: FETCH QUESTIONS ---
  useEffect(() => {
    if (!authUser) return;
    const qRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'questions');
    const unsub = onSnapshot(qRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().data) {
        setQuestions(docSnap.data().data);
      }
    });
    return () => unsub();
  }, [authUser]);

  // --- EFFECT: LOCAL STORAGE ---
  useEffect(() => {
    const savedSession = localStorage.getItem('cbt_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.view === 'exam' || parsed.view === 'result') {
          setUser(parsed.user);
          setExamState(parsed.examState);
          setView(parsed.view);
        }
      } catch (e) { console.error(e); }
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (view === 'exam' || view === 'result') {
      localStorage.setItem('cbt_session', JSON.stringify({ user, examState, view }));
    }
  }, [user, examState, view]);

  // --- EFFECT: TIMER ---
  useEffect(() => {
    if (view === 'exam' && examState.timeLeft > 0 && !examState.isFinished) {
      timerRef.current = setInterval(() => {
        setExamState(prev => {
          if (prev.timeLeft <= 1) {
            handleAutoFinish(prev);
            return { ...prev, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [view, examState.isFinished]);

  // --- EFFECT: ANTI-CHEATING ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (view === 'exam' && !examState.isFinished && !modal.isOpen) {
        if (document.hidden) {
          setExamState(prev => {
            const newViolations = prev.violations + 1;
            syncStudentToFirebase({ ...prev, violations: newViolations }, false);
            return { ...prev, violations: newViolations };
          });
        } else {
          syncStudentToFirebase(examState, true);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [view, examState, authUser, modal.isOpen]);

  // --- SYNC TO FIREBASE ---
  const syncStudentToFirebase = (currentState, isTabActive = true) => {
    if (!authUser || view !== 'exam') return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', authUser.uid);
    setDoc(docRef, {
      name: user.name, class: user.class,
      progress: Object.keys(currentState.answers).length,
      totalQuestions: questions.length,
      violations: currentState.violations,
      isFinished: currentState.isFinished,
      score: currentState.score,
      lastActive: Date.now(), isTabActive: isTabActive
    }, { merge: true });
  };

  useEffect(() => {
    if (view === 'exam') syncStudentToFirebase(examState, !document.hidden);
  }, [examState.answers, view]);

  // --- ADMIN LIVE MONITORING ---
  useEffect(() => {
    if (view === 'admin' && authUser) {
      const studentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'students');
      const unsub = onSnapshot(studentsRef, (snapshot) => {
        const data = [];
        snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => (b.score || 0) - (a.score || 0));
        setStudentsData(data);
      });
      return () => unsub();
    }
  }, [view, authUser]);

  // --- HANDLERS ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (!user.name || !user.class) return;
    setView('exam');
    syncStudentToFirebase(examState, true);
  };

  const calculateScore = (answers) => {
    let correctCount = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correct) correctCount++; });
    return Math.round((correctCount / questions.length) * 100);
  };

  const executeFinish = () => {
    const finalScore = calculateScore(examState.answers);
    const newState = { ...examState, isFinished: true, score: finalScore };
    setExamState(newState);
    syncStudentToFirebase(newState, true);
    clearInterval(timerRef.current);
    setView('result');
  };

  const handleAutoFinish = (currentState) => {
    const finalScore = calculateScore(currentState.answers);
    const newState = { ...currentState, isFinished: true, score: finalScore, timeLeft: 0 };
    setExamState(newState);
    syncStudentToFirebase(newState, true);
    clearInterval(timerRef.current);
    setView('result');
  };

  const handleFinishClick = () => {
    setModal({
      isOpen: true, type: 'confirmFinish',
      message: 'Apakah Anda yakin ingin menyelesaikan dan mengumpulkan ujian sekarang?',
      inputValue: ''
    });
  };

  const handleSecretLogin = () => {
    if (view === 'admin') return;
    setModal(prev => {
      // Logic untuk hitung klik rahasia tanpa state yang re-render layar
      const newCount = (window.secretClick || 0) + 1;
      window.secretClick = newCount;
      if (newCount >= 5) {
        window.secretClick = 0;
        return { isOpen: true, type: 'adminLogin', message: 'Masukkan Password Pengawas:', inputValue: '' };
      }
      return prev;
    });
  };

  const handleResetDataClick = () => {
    setModal({
      isOpen: true, type: 'confirmReset',
      message: 'PERINGATAN! Ketik "RESET" untuk menghapus semua data peserta ujian:',
      inputValue: ''
    });
  };

  const handleUploadQuestions = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (Array.isArray(json)) {
          const qRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'questions');
          await setDoc(qRef, { data: json, updatedAt: Date.now() });
          setModal({ isOpen: true, type: 'alert', message: 'Berhasil! Soal JSON telah di-upload ke sistem.', inputValue: '' });
        } else {
          setModal({ isOpen: true, type: 'alert', message: 'Format JSON tidak valid. Harus berupa Array.', inputValue: '' });
        }
      } catch (err) {
        setModal({ isOpen: true, type: 'alert', message: 'Gagal membaca file JSON. Pastikan formatnya benar.', inputValue: '' });
      }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  const closeModal = () => setModal({ isOpen: false, type: '', message: '', inputValue: '' });

  const handleModalSubmit = async () => {
    const { type, inputValue } = modal;
    if (type === 'adminLogin') {
      if (inputValue === '1') {
        setView('admin');
        closeModal();
      } else {
        setModal({ isOpen: true, type: 'alert', message: 'Password yang Anda masukkan salah!', inputValue: '' });
      }
    } else if (type === 'confirmFinish') {
      closeModal();
      executeFinish();
    } else if (type === 'confirmReset') {
      if (inputValue === 'RESET') {
        try {
          const studentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'students');
          const snapshot = await getDocs(studentsRef);
          const deletePromises = [];
          snapshot.forEach((docSnap) => {
            deletePromises.push(deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', docSnap.id)));
          });
          await Promise.all(deletePromises);
          setModal({ isOpen: true, type: 'alert', message: 'Sukses! Semua data siswa berhasil direset.', inputValue: '' });
        } catch (error) {
          setModal({ isOpen: true, type: 'alert', message: 'Terjadi kesalahan saat mencoba mereset data.', inputValue: '' });
        }
      } else {
        setModal({ isOpen: true, type: 'alert', message: 'Kata kunci konfirmasi salah. Data batal direset.', inputValue: '' });
      }
    } else if (type === 'alert') {
      closeModal();
    }
  };

  const getStudentRank = () => {
    if (!authUser || !examState.isFinished) return "-";
    const sorted = [...studentsData].sort((a, b) => b.score - a.score);
    const index = sorted.findIndex(s => s.id === authUser.uid);
    return index !== -1 ? index + 1 : "-";
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // RENDER VIEW
  // ==========================================
  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans relative overflow-hidden ${isDarkMode ? 'bg-slate-900' : 'bg-emerald-50'}`}>
      
      {/* Background Decorators */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-500/20 blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-amber-500/20 blur-[100px] pointer-events-none z-0"></div>

      {/* CUSTOM MODAL UI */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <Card isDarkMode={isDarkMode} className="w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-black text-lg ${modal.type === 'alert' && modal.message.includes('salah') ? 'text-red-500' : 'text-emerald-500'}`}>
                {modal.type === 'alert' ? 'Pemberitahuan' : modal.type === 'adminLogin' ? 'Akses Pengawas' : 'Konfirmasi'}
              </h3>
              <button onClick={closeModal} className={`p-1 rounded-full hover:bg-slate-500/20 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <X size={20} />
              </button>
            </div>
            <p className={`mb-6 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{modal.message}</p>
            {(modal.type === 'adminLogin' || modal.type === 'confirmReset') && (
              <input
                type={modal.type === 'adminLogin' ? 'password' : 'text'}
                autoFocus
                placeholder={modal.type === 'adminLogin' ? 'Masukkan Password' : 'Ketik RESET'}
                className={`w-full p-4 rounded-xl border-2 mb-6 outline-none transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-700 focus:border-emerald-500 text-white' : 'bg-white/50 border-white focus:border-emerald-500 text-slate-800'}`}
                value={modal.inputValue}
                onChange={e => setModal({...modal, inputValue: e.target.value})}
                onKeyDown={e => { if (e.key === 'Enter') handleModalSubmit(); }}
              />
            )}
            <div className="flex justify-end gap-3">
              {modal.type !== 'alert' && (
                <button onClick={closeModal} className={`px-5 py-2.5 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-600'}`}>Batal</button>
              )}
              <button onClick={handleModalSubmit} className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-500/30">
                {modal.type === 'alert' ? 'Tutup' : modal.type === 'adminLogin' ? 'Masuk' : 'Ya, Lanjutkan'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* NAVBAR */}
      <nav className={`relative z-50 p-4 flex justify-between items-center backdrop-blur-md border-b print:hidden ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-emerald-200/50 bg-white/30'}`}>
        <div className="flex items-center gap-3 cursor-pointer select-none group" onClick={handleSecretLogin}>
          <div className={`p-2.5 rounded-xl shadow-lg transition-transform group-active:scale-90 ${isDarkMode ? 'bg-emerald-600 shadow-emerald-900/50' : 'bg-emerald-600 shadow-emerald-500/30'}`}>
            <BookOpen size={22} className="text-white" />
          </div>
          <div>
            <h1 className={`font-black text-xl tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-emerald-950'}`}>Quiz-in <span className="text-emerald-500">CBT</span></h1>
            <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold">SMP/MTs Darma Pertiwi Bah Butong</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {view === 'exam' && (
            <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full font-bold font-mono text-lg border ${examState.timeLeft < 300 ? 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse' : isDarkMode ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-white border-emerald-100 text-emerald-600'}`}>
              <Clock size={20} />{formatTime(examState.timeLeft)}
            </div>
          )}
          <button type="button" onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2.5 rounded-full transition-all hover:scale-110 active:scale-95 ${isDarkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-emerald-100 shadow-sm'}`}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <div className="relative z-10">
        
        {/* LOGIN VIEW */}
        {view === 'login' && (
          <main className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
            <Card isDarkMode={isDarkMode} className="w-full max-w-md p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center mb-8">
                <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 mb-4"><User size={40} /></div>
                <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-emerald-500 to-amber-500 bg-clip-text text-transparent">Portal Ujian</h2>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Silakan isi identitas Anda dengan benar.</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nama Lengkap</label>
                  <input required type="text" value={user.name} onChange={(e) => setUser({...user, name: e.target.value})} className={`w-full p-4 rounded-2xl outline-none transition-all border-2 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 focus:border-emerald-500 text-white' : 'bg-white/50 border-white focus:border-emerald-500 focus:bg-white text-slate-800'}`} placeholder="Contoh: Ahmad Fulan" />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Kelas</label>
                  <select required value={user.class} onChange={(e) => setUser({...user, class: e.target.value})} className={`w-full p-4 rounded-2xl outline-none transition-all border-2 appearance-none ${isDarkMode ? 'bg-slate-900/50 border-slate-700 focus:border-emerald-500 text-white' : 'bg-white/50 border-white focus:border-emerald-500 focus:bg-white text-slate-800'}`}>
                    <option value="" disabled>Pilih Kelas</option>
                    <option value="9A">Kelas 9A1</option><option value="9B">Kelas 9A2</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Token Ujian (Opsional)</label>
                  <input type="text" value={user.token} onChange={(e) => setUser({...user, token: e.target.value})} className={`w-full p-4 rounded-2xl outline-none transition-all border-2 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 focus:border-emerald-500 text-white' : 'bg-white/50 border-white focus:border-emerald-500 focus:bg-white text-slate-800'}`} placeholder="Masukkan Token" />
                </div>
                <button type="submit" className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg p-4 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all active:scale-95 flex justify-center items-center gap-2 group">
                  Mulai Ujian <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </Card>
          </main>
        )}

        {/* EXAM VIEW */}
        {view === 'exam' && (
          <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
            <div className="lg:col-span-3 space-y-6 flex flex-col">
              <Card isDarkMode={isDarkMode} className="p-6 sm:p-8 lg:p-10 flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-emerald-500/20">Soal No. {examState.currentIdx + 1}</span>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>dari {questions.length} Soal</span>
                  </div>
                  <div className={`md:hidden flex items-center gap-2 px-3 py-1.5 rounded-full font-bold font-mono text-sm border ${examState.timeLeft < 300 ? 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse' : isDarkMode ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-white border-emerald-100 text-emerald-600'}`}>
                    <Clock size={16} />{formatTime(examState.timeLeft)}
                  </div>
                </div>
                <h3 className={`text-xl sm:text-2xl font-medium leading-relaxed mb-10 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{questions[examState.currentIdx]?.q}</h3>
                <div className="grid gap-4 mt-auto">
                  {questions[examState.currentIdx]?.a.map((ans, i) => {
                    const isSelected = examState.answers[examState.currentIdx] === i;
                    return (
                      <button key={i} type="button" onClick={() => setExamState({...examState, answers: {...examState.answers, [examState.currentIdx]: i}})} className={`group flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all text-left ${isSelected ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/5' : isDarkMode ? 'border-slate-700 bg-slate-800/50 hover:border-emerald-500/50 hover:bg-slate-700' : 'border-white bg-white/50 hover:border-emerald-300 hover:bg-white'}`}>
                        <span className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl font-bold text-lg transition-colors ${isSelected ? 'bg-emerald-500 text-white shadow-md' : isDarkMode ? 'bg-slate-700 text-slate-300 group-hover:bg-slate-600' : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200'}`}>{String.fromCharCode(65 + i)}</span>
                        <span className={`text-base sm:text-lg ${isSelected ? 'font-medium' : ''} ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{ans}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
              <div className="flex justify-between items-center gap-4">
                <button type="button" disabled={examState.currentIdx === 0} onClick={() => setExamState({...examState, currentIdx: examState.currentIdx - 1})} className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all ${examState.currentIdx === 0 ? 'opacity-40 cursor-not-allowed bg-slate-500/20' : isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-white hover:bg-emerald-50 text-slate-700 shadow-sm'}`}>
                  <ChevronLeft size={20} /> <span className="hidden sm:inline">Sebelumnya</span>
                </button>
                {examState.currentIdx === questions.length - 1 ? (
                  <button type="button" onClick={handleFinishClick} className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black transition-all shadow-xl shadow-amber-500/20 active:scale-95">
                    Selesai & Kumpul <Send size={20} />
                  </button>
                ) : (
                  <button type="button" onClick={() => setExamState({...examState, currentIdx: examState.currentIdx + 1})} className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-white hover:bg-emerald-50 text-slate-700 shadow-sm'}`}>
                    <span className="hidden sm:inline">Berikutnya</span> <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>
            <div className="lg:col-span-1">
              <Card isDarkMode={isDarkMode} className="p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-emerald-500/10"><LayoutGrid size={20} className="text-emerald-500"/><h4 className="font-bold text-lg">Navigasi Soal</h4></div>
                <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-4 gap-2 sm:gap-3 mb-8">
                  {questions.map((_, i) => {
                    const isAnswered = examState.answers[i] !== undefined; const isActive = examState.currentIdx === i;
                    return (
                      <button key={i} type="button" onClick={() => setExamState({...examState, currentIdx: i})} className={`aspect-square rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 relative ${isActive ? 'ring-4 ring-emerald-500/50 scale-110 z-10' : 'hover:scale-105'} ${isAnswered ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-white text-slate-500 border border-emerald-100 shadow-sm'}`}>
                        {i + 1}{isAnswered && !isActive && (<div className={`absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 ${isDarkMode ? 'border-slate-800' : 'border-white'}`}></div>)}
                      </button>
                    )
                  })}
                </div>
                <div className={`mt-auto pt-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-emerald-100'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500"><User size={20} /></div>
                    <div><p className="font-bold text-sm leading-tight">{user.name}</p><p className="text-xs opacity-60">Kelas {user.class}</p></div>
                  </div>
                  {examState.violations > 0 && (
                     <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <div><p className="text-xs font-bold uppercase">Peringatan Sistem</p><p className="text-xs opacity-80 mt-1">Terdeteksi {examState.violations} kali keluar dari halaman ujian.</p></div>
                     </div>
                  )}
                </div>
              </Card>
            </div>
          </main>
        )}

        {/* RESULT VIEW */}
        {view === 'result' && (
          <main className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6 animate-in zoom-in-95 duration-700">
            <Card isDarkMode={isDarkMode} className="w-full max-w-lg p-10 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-gold-400 to-emerald-400"></div>
               <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(16,185,129,0.2)]"><CheckCircle2 size={50} strokeWidth={2.5} /></div>
               <h2 className={`text-3xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Ujian Selesai!</h2>
               <p className={`mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Alhamdulillah, ujian telah berhasil diselesaikan oleh <strong className={isDarkMode ? 'text-white' : 'text-slate-800'}>{user.name}</strong>.</p>
               <div className="grid grid-cols-2 gap-4 mb-10">
                 <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-emerald-100'}`}>
                   <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">Nilai Akhir</p><p className="text-5xl font-black bg-gradient-to-br from-emerald-400 to-emerald-600 bg-clip-text text-transparent">{examState.score}</p>
                 </div>
                 <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-emerald-100'}`}>
                   <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">Peringkat Live</p><p className="text-5xl font-black bg-gradient-to-br from-amber-400 to-orange-500 bg-clip-text text-transparent">#{getStudentRank()}</p>
                 </div>
               </div>
               <button type="button" onClick={() => { localStorage.removeItem('cbt_session'); window.location.reload(); }} className="w-full bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"><LogOut size={18}/> Keluar / Kembali ke Awal</button>
            </Card>
          </main>
        )}

        {/* ADMIN DASHBOARD VIEW */}
        {view === 'admin' && (
          <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-8">
            <div className="hidden print:block text-center border-b-4 border-black pb-4 mb-8">
               <h1 className="text-3xl font-black uppercase text-black">Laporan Hasil Ujian CBT</h1><h2 className="text-xl font-bold text-black mt-1">SMP/MTs Generasi Baru</h2><p className="text-sm text-black mt-1">Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</p>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
               <div><h2 className={`text-3xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}><ShieldAlert className="text-emerald-500" size={32} />Dashboard <span className="text-emerald-500">Pengawas</span></h2><p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Pantau ujian siswa secara real-time dan kelola data.</p></div>
               <div className="flex flex-wrap gap-2">
                 <label className="cursor-pointer flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg"><Upload size={16}/> Upload JSON Soal<input type="file" accept=".json" className="hidden" onChange={handleUploadQuestions} /></label>
                 <button type="button" onClick={() => window.print()} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20"><Printer size={16}/> Cetak PDF</button>
                 <button type="button" onClick={handleResetDataClick} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-500/20"><Trash2 size={16}/> Reset Data</button>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 print:hidden">
               <Card isDarkMode={isDarkMode} className="p-6 border-l-4 border-l-blue-500"><p className="text-sm opacity-60 font-bold uppercase mb-1">Total Peserta</p><p className="text-3xl font-black">{studentsData.length}</p></Card>
               <Card isDarkMode={isDarkMode} className="p-6 border-l-4 border-l-emerald-500"><p className="text-sm opacity-60 font-bold uppercase mb-1">Selesai Ujian</p><p className="text-3xl font-black">{studentsData.filter(s => s.isFinished).length}</p></Card>
               <Card isDarkMode={isDarkMode} className="p-6 border-l-4 border-l-red-500"><p className="text-sm opacity-60 font-bold uppercase mb-1">Indikasi Mencontek</p><p className="text-3xl font-black text-red-500">{studentsData.filter(s => s.violations > 0).length}</p></Card>
            </div>
            <Card isDarkMode={isDarkMode} className="overflow-x-auto print:shadow-none print:border-none print:bg-transparent">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className={`text-xs uppercase tracking-wider ${isDarkMode ? 'bg-slate-800/80 text-slate-400' : 'bg-emerald-100/50 text-emerald-800'} print:bg-gray-200 print:text-black`}>
                  <tr><th className="p-5 font-bold rounded-tl-xl print:rounded-none border-b print:border-black">No</th><th className="p-5 font-bold border-b print:border-black">Nama Siswa</th><th className="p-5 font-bold border-b print:border-black">Kelas</th><th className="p-5 font-bold border-b print:border-black">Status / Progress</th><th className="p-5 font-bold text-center border-b print:border-black">Pelanggaran</th><th className="p-5 font-bold text-right rounded-tr-xl print:rounded-none border-b print:border-black">Nilai Akhir</th></tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-emerald-100'} print:divide-black`}>
                  {studentsData.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center opacity-50 italic">Belum ada siswa yang login/memulai ujian.</td></tr>
                  ) : (
                    studentsData.map((student, idx) => {
                      const timeSinceLastActive = Date.now() - (student.lastActive || 0);
                      const isOffline = timeSinceLastActive > 15000 && !student.isFinished; 
                      const isDanger = student.violations > 0 || (!student.isTabActive && !student.isFinished);
                      const progressPercent = Math.round((student.progress / (student.totalQuestions || questions.length)) * 100);
                      return (
                        <tr key={student.id} className={`transition-colors print:text-black ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-white/50'}`}>
                          <td className="p-5 font-bold opacity-50">{idx + 1}</td>
                          <td className="p-5">
                            <p className="font-bold text-base">{student.name}</p>
                            <div className="flex items-center gap-2 mt-1 print:hidden">
                              {student.isFinished ? (<span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded">Selesai</span>) : isOffline ? (<><span className="w-2 h-2 rounded-full bg-slate-500"></span><span className="text-[10px] uppercase font-bold text-slate-500">Offline</span></>) : isDanger ? (<><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span><span className="text-[10px] uppercase font-bold text-red-500">Meninggalkan Tab</span></>) : (<><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span><span className="text-[10px] uppercase font-bold text-emerald-500">Mengerjakan</span></>)}
                            </div>
                          </td>
                          <td className="p-5 opacity-80">{student.class}</td>
                          <td className="p-5">
                            <div className="flex items-center gap-3 print:hidden">
                              <div className={`w-full max-w-[150px] h-2.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-emerald-100'}`}><div className={`h-full rounded-full transition-all duration-1000 ${student.isFinished ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{width: `${progressPercent}%`}}></div></div>
                              <span className="text-xs font-bold w-8">{progressPercent}%</span>
                            </div>
                            <span className="hidden print:inline">{progressPercent}% Selesai</span>
                          </td>
                          <td className="p-5 text-center">{student.violations > 0 ? (<span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20 text-red-600 font-black border border-red-500/30">{student.violations}</span>) : (<span className="opacity-30">-</span>)}</td>
                          <td className="p-5 text-right">{student.isFinished ? (<span className="text-2xl font-black text-emerald-500">{student.score}</span>) : (<span className="text-sm opacity-50 italic">Belum Selesai</span>)}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </Card>
            <button type="button" onClick={() => setView('login')} className="text-sm opacity-50 hover:opacity-100 mt-6 flex items-center gap-2 transition-all print:hidden"><ChevronLeft size={16}/> Kembali ke Login</button>
          </main>
        )}
      </div>
    </div>
  );
};
export default App;
