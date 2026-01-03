import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, BookOpen, Target, Scale, Clock, 
  Trophy, ChevronRight, ChevronLeft, 
  RotateCcw, ExternalLink, Zap, Infinity,
  Activity, GraduationCap, Skull, Loader2,
  Gavel, Lightbulb, ListChecks, ArrowLeft,
  AlertCircle, Lock, Mail, Eye, EyeOff, CheckCircle
} from 'lucide-react';

// --- IMPORTAÇÕES DO FIREBASE ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';

// --- CONFIGURAÇÃO DE SEGURANÇA ---
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env?.VITE_FIREBASE_APP_ID
};

// Inicialização Segura
let app, auth, db;
let configError = null;

try {
  // Verifica se a chave existe antes de tentar iniciar
  if (!firebaseConfig.apiKey) {
    throw new Error("As chaves de API não foram detetadas. Faça REDEPLOY na Vercel.");
  }
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  configError = e.message;
}

const geminiApiKey = import.meta.env?.VITE_GEMINI_API_KEY;
const appId = 'prf-elite-v85'; 

// --- DADOS DO APP ---
const ENHANCED_SUBJECT_INTEL = {
  "Português": {
    legislation: "Manual de Redação da PR + Gramática Normativa",
    focus: ["Ortografia oficial", "Classes de palavras", "Regência e Concordância", "Crase", "Semântica", "Coesão"],
    tricks: "Troca de conectivos; Inversão de orações; Ambiguidade em pronomes.",
    icon: <BookOpen className="w-4 h-4 text-blue-400" />
  },
  "Raciocínio Lógico": {
    legislation: "Lógica Proposicional e Matemática Aplicada",
    focus: ["Raciocínio sequencial", "Diagramas de Venn", "Verdades e Mentiras", "Probabilidade", "Análise Combinatória"],
    tricks: "Negação do 'todo' com 'algum não'; Condição necessária vs suficiente.",
    icon: <Activity className="w-4 h-4 text-purple-400" />
  },
  "Informática": {
    legislation: "TI e Segurança da Informação",
    focus: ["Hardware/Software", "Windows 10/11", "Office vs LibreOffice", "Navegadores", "Malware", "Backup/Nuvem"],
    tricks: "Trocar Ransomware por Spyware; Backup incremental vs diferencial.",
    icon: <Zap className="w-4 h-4 text-yellow-400" />
  },
  "Física": {
    legislation: "Mecânica Clássica PRF",
    focus: ["MRU/MRUV", "Leis de Newton", "Energia/Trabalho", "Colisões/Impulso"],
    tricks: "Erros em unidades; Atrito estático vs cinético.",
    icon: <Activity className="w-4 h-4 text-red-400" />
  },
  "Ética": {
    legislation: "Dec. 1.171/94 + Lei 8.112/90 + Ética Profissional",
    focus: ["Ética vs Moral", "Regras Deontológicas", "Deveres e Vedações", "Comissão de Ética"],
    tricks: "Confundir dever com proibição; Penalidade de censura.",
    icon: <Scale className="w-4 h-4 text-green-400" />
  },
  "CTB + Resoluções": {
    legislation: "Lei 9.503/97 + Lei 14.071/20 + Resoluções 789, 918, 927, 996",
    focus: ["Sistema de Habilitação", "Sinalização", "Infrações/Medidas", "Registro", "Ciclomotores"],
    tricks: "Prazos de defesa; Cassação vs Suspensão; Regras da cadeirinha.",
    icon: <Activity className="w-4 h-4 text-yellow-500" />
  },
  "Legislação Especial": {
    legislation: "Leis 10.826, 12.850, 9.296, 9.613, 10.741, 9.455, 9.605",
    focus: ["Desarmamento", "Org. Criminosas", "Interceptação", "Lavagem", "Tortura", "Ambiental"],
    tricks: "Arma desmuniciada é crime; Tortura-omissão não admite fiança.",
    icon: <Gavel className="w-4 h-4 text-red-500" />
  },
  "Direito Constitucional": {
    legislation: "CF/88 Completa (Foco Art. 144)",
    focus: ["Art. 5-17", "Remédios Constitucionais", "Org. Estado", "Executivo", "Segurança Pública"],
    tricks: "Legitimidade MS Coletivo; Crimes inafiançáveis.",
    icon: <Scale className="w-4 h-4 text-blue-300" />
  },
  "Direito Administrativo": {
    legislation: "LIMPE + Atos + Poderes + Leis 14.133 e 14.230",
    focus: ["Princípios", "Atos", "Poder de Polícia", "Licitações", "Improbidade", "Resp. Civil"],
    tricks: "Improbidade exige dolo; Revogação vs Anulação.",
    icon: <Shield className="w-4 h-4 text-blue-300" />
  },
  "Direito Penal": {
    legislation: "Código Penal (Geral e Especial)",
    focus: ["Teoria do Crime", "Crimes vs Pessoa/Património", "Crimes vs Adm Pública", "Penas"],
    tricks: "Concussão vs Corrupção; Erro de tipo.",
    icon: <Scale className="w-4 h-4 text-blue-300" />
  },
  "Processo Penal": {
    legislation: "CPP + Lei 7.960",
    focus: ["Inquérito", "Ação Penal", "Provas", "Prisões", "Júri/Recursos"],
    tricks: "Flagrante preparado; Requisitos preventiva.",
    icon: <Scale className="w-4 h-4 text-blue-300" />
  },
  "Direitos Humanos": {
    legislation: "DUDH + Pacto SJC",
    focus: ["Gerações", "Características", "Sistema Interamericano"],
    tricks: "Supralegalidade; Corte vs Comissão IDH.",
    icon: <Scale className="w-4 h-4 text-blue-300" />
  }
};

const BLOCKS = {
  BLOCO_I: { id: 'BLOCO_I', title: "Bloco I - Básicas", subjects: ["Português", "Raciocínio Lógico", "Informática", "Física", "Ética"] },
  BLOCO_II: { id: 'BLOCO_II', title: "Bloco II - Trânsito", subjects: ["CTB + Resoluções"] },
  BLOCO_III: { id: 'BLOCO_III', title: "Bloco III - Direito", subjects: ["Legislação Especial", "Direito Constitucional", "Direito Administrativo", "Direito Penal", "Processo Penal", "Direitos Humanos"] }
};

// --- TELA DE LOGIN ---
const LoginPage = ({ onLogin }) => {
  const [loginMode, setLoginMode] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEmailLogin = () => {
    setError(''); setSuccess('');
    if (!email || !password) { setError('Preencha todos os campos'); return; }
    if (loginMode === 'register' && password !== confirmPassword) { setError('As senhas não coincidem'); return; }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess('Acesso autorizado!');
      setTimeout(onLogin, 800);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-200 font-sans flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">PRF <span className="text-blue-500">Elite</span></h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Sistema de Preparação Tático</p>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex gap-2 bg-slate-950/50 p-1 rounded-xl">
            <button onClick={() => setLoginMode('login')} className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${loginMode === 'login' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-300'}`}>Entrar</button>
            <button onClick={() => setLoginMode('register')} className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${loginMode === 'register' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-300'}`}>Criar Conta</button>
          </div>
          {error && <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold"><AlertCircle className="w-4 h-4" />{error}</div>}
          {success && <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold"><CheckCircle className="w-4 h-4" />{success}</div>}
          <div className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full bg-slate-950 border border-slate-800 pl-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-blue-500 transition-colors" />
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 pl-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-blue-500 transition-colors" />
            {loginMode === 'register' && <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar Senha" className="w-full bg-slate-950 border border-slate-800 pl-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-blue-500 transition-colors" />}
            <button onClick={handleEmailLogin} disabled={loading} className="w-full py-4 rounded-xl font-black text-sm uppercase bg-blue-600 hover:bg-blue-500 text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (loginMode === 'login' ? 'Entrar' : 'Criar Conta')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---
const App = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appState, setAppState] = useState('config'); 
  const [authError, setAuthError] = useState(null);
  
  // States do Quiz
  const [selectedBlock, setSelectedBlock] = useState('BLOCO_I');
  const [selectedSubject, setSelectedSubject] = useState('Português');
  const [customTopic, setCustomTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('junior'); 
  const [marathonMode, setMarathonMode] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isRefetching, setIsRefetching] = useState(false);
  const [questionSeconds, setQuestionSeconds] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ correct: 0, total: 0, points: 0 });
  
  const questionTimerRef = useRef(null);

  // --- AUTENTICAÇÃO E RECUPERAÇÃO ---
  useEffect(() => {
    if (configError) return;

    // Timeout de segurança: Se não conectar em 8 segundos, mostra erro
    const safetyTimer = setTimeout(() => {
      if (!user && !authError) {
        setAuthError("Tempo limite excedido. Verifique se adicionou as Chaves na Vercel e fez Redeploy.");
      }
    }, 8000);

    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth error:", err);
        setAuthError(err.message);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        clearTimeout(safetyTimer); // Cancela o erro se conectou
        setUser(u);
      }
    });
    return () => {
      unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  // --- SINCRONIZAÇÃO FIRESTORE ---
  useEffect(() => {
    if (!user || !db) return;
    const statsRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'stats');
    const unsub = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) setStats(docSnap.data());
    }, (err) => console.log("Novo utilizador, sem stats ainda."));
    return () => unsub();
  }, [user]);

  // --- LÓGICA DO JOGO ---
  useEffect(() => {
    if (appState === 'quiz') questionTimerRef.current = setInterval(() => setQuestionSeconds(s => s + 1), 1000);
    else clearInterval(questionTimerRef.current);
    return () => clearInterval(questionTimerRef.current);
  }, [appState]);

  useEffect(() => { setQuestionSeconds(0); }, [currentIndex]);

  const fetchWithRetry = async (prompt, retries = 5) => {
    if (!geminiApiKey) throw new Error("Chave Gemini ausente.");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${geminiApiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } };

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error("Erro na API Gemini");
        const data = await response.json();
        return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text);
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
      }
    }
  };

  const startMission = async (append = false) => {
    setError(null);
    if (!append) { setAppState('loading'); setQuestions([]); setAnswers({}); setCurrentIndex(0); setLoadingStatus("Gerando questões..."); }
    else { setIsRefetching(true); }
    
    const intel = ENHANCED_SUBJECT_INTEL[selectedSubject];
    const promptText = `ATUE COMO EXAMINADOR CEBRASPE. DISCIPLINA: ${selectedSubject}. BASE: ${intel.legislation}. PEGADINHAS: ${intel.tricks}. DIFICULDADE: ${difficulty}. RETORNE JSON: { "itens": [{ "texto": "...", "assertiva": "...", "gabarito": "C/E", "comentario": "...", "busca": "..." }] }. QUANTIDADE: ${numQuestions}.`;

    try {
      const data = await fetchWithRetry(promptText);
      const newItems = data.itens || [];
      if (append) { setQuestions(p => [...p, ...newItems]); setCurrentIndex(p => p + 1); setIsRefetching(false); }
      else { setQuestions(newItems); setAppState('quiz'); }
    } catch (err) { setError("Falha ao gerar questões. Verifique sua chave Gemini."); setAppState('config'); setIsRefetching(false); }
  };

  const handleAnswer = async (choice) => {
    if (answers[currentIndex] || !user) return;
    const isCorrect = choice === questions[currentIndex].gabarito;
    setAnswers({ ...answers, [currentIndex]: { choice, isCorrect } });
    
    const newStats = { correct: stats.correct + (isCorrect ? 1 : 0), total: stats.total + 1, points: isCorrect ? stats.points + 1 : stats.points - 1 };
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'stats'), newStats, { merge: true });
  };

  // --- RENDERIZAÇÃO DE ERROS DE CONEXÃO ---
  if (configError || authError) {
    return (
      <div className="min-h-screen bg-black text-red-500 p-8 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-16 h-16 mb-4" />
        <h2 className="text-xl font-bold mb-2">ERRO DE CONEXÃO</h2>
        <div className="bg-red-900/20 p-4 rounded border border-red-500/50 text-sm max-w-md">
          {configError || authError}
        </div>
        <p className="text-slate-500 mt-4 text-xs">Vá à Vercel &gt; Deployments e clique em Redeploy.</p>
      </div>
    );
  }

  // --- FLUXO NORMAL DO APP ---
  if (!isLoggedIn) return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  if (!user) return <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center"><Loader2 className="animate-spin text-blue-500 w-12 h-12" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-200 font-sans">
      {appState === 'config' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-in fade-in">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center">
               <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
                  <Trophy className="w-3 h-3 text-yellow-500" />
                  <span className={`text-[10px] font-bold uppercase ${stats.points >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>Saldo Líquido: {stats.points} pts</span>
               </div>
               <h1 className="text-4xl font-black italic uppercase text-white">PRF <span className="text-blue-500">Elite</span></h1>
               <p className="text-[9px] font-bold uppercase text-slate-500">V8.5 Maximum Tactical</p>
            </div>
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-3xl space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-blue-500 uppercase px-1">Área</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(BLOCKS).map(b => (
                    <button key={b.id} onClick={() => { setSelectedBlock(b.id); setSelectedSubject(b.subjects[0]); }} className={`p-2 rounded-xl border text-[10px] font-black transition-all ${selectedBlock === b.id ? 'bg-blue-600/20 border-blue-500 text-blue-100' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>{b.title.split(' - ')[1]}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-blue-500 uppercase px-1">Disciplina</label>
                 <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-colors">
                    {BLOCKS[selectedBlock].subjects.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
              </div>
              <div className="flex gap-2">
                   <button onClick={() => setDifficulty(d => d === 'junior' ? 'caveira' : 'junior')} className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${difficulty === 'caveira' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                    {difficulty === 'caveira' ? <Skull className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                    <span className="text-[9px] font-black uppercase">{difficulty === 'caveira' ? 'Caveira' : 'Padrão'}</span>
                  </button>
                   <button onClick={() => setMarathonMode(!marathonMode)} className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${marathonMode ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                    <Infinity className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase">{marathonMode ? 'Maratona' : 'Fixo'}</span>
                  </button>
              </div>
              {error && <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-[10px] font-bold text-center"><AlertCircle className="w-3 h-3 inline mr-1" /> {error}</div>}
              <button onClick={() => startMission(false)} className="w-full py-4 rounded-2xl font-black text-sm uppercase bg-blue-600 hover:bg-blue-500 text-white shadow-lg flex items-center justify-center gap-2 transition-all">
                <Target className="w-4 h-4" /> Iniciar Missão
              </button>
            </div>
          </div>
        </div>
      )}

      {appState === 'loading' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 animate-in zoom-in-95">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <h2 className="text-xl font-black text-white italic uppercase">{loadingStatus}</h2>
        </div>
      )}

      {appState === 'quiz' && questions[currentIndex] && (
        <div className="min-h-screen flex flex-col pb-24">
          <header className="sticky top-0 bg-[#0a0f1c]/90 backdrop-blur-md border-b border-white/5 p-3 z-50">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <button onClick={() => setAppState('config')} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-colors"><ArrowLeft className="w-4 h-4" /></button>
              <div className="text-center"><span className="text-[9px] font-black text-blue-500 uppercase tracking-widest block">{selectedSubject}</span><span className="text-xs font-bold text-white">{currentIndex + 1} / {questions.length}</span></div>
              <button onClick={() => setAppState('results')} className="text-[9px] font-black text-red-500 bg-red-950/20 px-2 py-1 rounded uppercase">Encerrar</button>
            </div>
          </header>
          <main className="flex-grow p-4 max-w-3xl mx-auto w-full">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex justify-between items-center">
                <div className="px-2 py-1 rounded text-[10px] font-black uppercase border bg-blue-500/10 text-blue-500 border-blue-500/20">Item Tático</div>
                {!answers[currentIndex] && <div className="flex items-center gap-1 text-slate-500 font-mono text-[10px] font-bold"><Clock className="w-3 h-3" /> {questionSeconds}s</div>}
              </div>
              <p className="text-lg sm:text-xl font-bold text-white leading-relaxed">{questions[currentIndex].assertiva}</p>
              <div className="grid grid-cols-2 gap-4">
                {['C', 'E'].map(opt => {
                  const done = !!answers[currentIndex];
                  const sel = answers[currentIndex]?.choice === opt;
                  const correct = questions[currentIndex].gabarito === opt;
                  let style = "bg-slate-950 border-slate-800 text-slate-400";
                  if (done) {
                    if (correct) style = "bg-emerald-500/10 border-emerald-500 text-emerald-500";
                    else if (sel) style = "bg-red-500/10 border-red-500 text-red-500 opacity-60";
                    else style = "bg-slate-950 border-slate-800 text-slate-700 opacity-30";
                  }
                  return <button key={opt} disabled={done} onClick={() => handleAnswer(opt)} className={`h-20 rounded-2xl border-2 font-black text-xl transition-all ${style}`}>{opt === 'C' ? 'CERTO' : 'ERRADO'}</button>
                })}
              </div>
              {answers[currentIndex] && (
                <div className="mt-8 pt-6 border-t border-slate-800 animate-in slide-in-from-bottom-2 space-y-4">
                  <div className="flex items-center gap-2"><Zap className="w-3 h-3 text-blue-400" /><span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Fundamentação</span></div>
                  <p className="text-slate-300 text-sm leading-relaxed">{questions[currentIndex].comentario}</p>
                  <a href={`https://www.google.com/search?q=${encodeURIComponent(questions[currentIndex].busca)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-[10px] font-black text-blue-400 uppercase tracking-widest border border-blue-500/10 no-underline"><ExternalLink className="w-3 h-3" /> Ver Referência</a>
                </div>
              )}
            </div>
          </main>
          <footer className="fixed bottom-0 w-full bg-[#0a0f1c]/90 backdrop-blur-md border-t border-white/5 p-4">
            <div className="max-w-3xl mx-auto flex gap-4">
              <button onClick={() => setCurrentIndex(c => Math.max(0, c - 1))} disabled={currentIndex === 0} className="px-6 py-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => { if (currentIndex === questions.length - 1) marathonMode ? startMission(true) : setAppState('results'); else setCurrentIndex(c => c + 1); }} disabled={!answers[currentIndex] || isRefetching} className="flex-1 py-3 rounded-xl font-black uppercase text-xs bg-blue-600 text-white flex items-center justify-center gap-2">
                {isRefetching ? <Loader2 className="w-4 h-4 animate-spin" /> : (currentIndex === questions.length - 1 ? (marathonMode ? "Próxima Carga" : "Finalizar") : "Próximo")} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </footer>
        </div>
      )}

      {appState === 'results' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-8 animate-in zoom-in-95">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white italic uppercase">Relatório Final</h2>
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
             <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center">
                <div className={`text-2xl font-black ${stats.points >= 0 ? 'text-blue-500' : 'text-red-400'}`}>{stats.points}</div>
                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Saldo Líquido</div>
             </div>
             <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center">
                <div className="text-2xl font-black text-emerald-500">{stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(0) : 0}%</div>
                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Eficiência Geral</div>
             </div>
          </div>
          <button onClick={() => setAppState('config')} className="w-full max-w-md py-4 bg-white text-slate-950 font-black rounded-2xl uppercase text-sm">Novo Ciclo</button>
        </div>
      )}
    </div>
  );
};

export default App;
