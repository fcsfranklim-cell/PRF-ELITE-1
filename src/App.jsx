
Franklimfcs1 <fcsfranklim@gmail.com>
6:00 PM (2 minutes ago)
to me, franklimfcs@gmail.com

import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- VERSÃO DE DIAGNÓSTICO V2 ---

// 1. Tenta carregar as chaves
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env?.VITE_FIREBASE_APP_ID
};

export default function App() {
  const [status, setStatus] = useState("Iniciando...");
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [configCheck, setConfigCheck] = useState(null);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    try {
      // TESTE 1: Verificar se as chaves existem
      setStatus("1. Verificando Chaves...");
      if (!firebaseConfig.apiKey) throw new Error("A chave API_KEY não foi encontrada. Verifique as Variáveis de Ambiente na Vercel.");
      if (!firebaseConfig.authDomain) throw new Error("A chave AUTH_DOMAIN não foi encontrada.");
      
      setConfigCheck("Chaves encontradas ✅");

      // TESTE 2: Inicializar Firebase
      setStatus("2. Inicializando Firebase...");
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      
      // TESTE 3: Tentar Login
      setStatus("3. Tentando Autenticação Anónima...");
      
      // Escutar mudanças
      onAuthStateChanged(auth, (u) => {
        if (u) {
          setUser(u);
          setStatus("CONECTADO COM SUCESSO! 🚀");
        }
      });

      await signInAnonymously(auth);

    } catch (err) {
      console.error(err);
      setError(err.message);
      setStatus("FALHA DETETADA ❌");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-500 p-8 flex flex-col items-center justify-center text-center font-mono">
        <AlertCircle className="w-20 h-20 mb-4" />
        <h2 className="text-xl font-bold mb-4">ERRO CRÍTICO</h2>
        <div className="bg-red-900/20 p-6 rounded-xl border border-red-500/50 text-sm break-words w-full">
          {error}
        </div>
        
        {error.includes("auth/operation-not-allowed") && (
          <p className="mt-4 text-white text-sm">SOLUÇÃO: Vá ao Firebase > Authentication > Sign-in method e ative o 'Anonymous'.</p>
        )}
        {error.includes("auth/unauthorized-domain") && (
          <p className="mt-4 text-white text-sm">SOLUÇÃO: Vá ao Firebase > Authentication > Settings > Authorized domains e adicione o domínio da Vercel.</p>
        )}
        {error.includes("API Key") && (
          <p className="mt-4 text-white text-sm">SOLUÇÃO: Vá à Vercel > Settings > Environment Variables e verifique os nomes das chaves.</p>
        )}
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] text-green-500 p-8 flex flex-col items-center justify-center text-center">
        <CheckCircle className="w-20 h-20 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">SISTEMA ONLINE</h1>
        <p>UID: {user.uid}</p>
        <div className="mt-6 p-4 bg-slate-900 rounded-lg text-slate-300 text-sm">
          <p>Tudo está a funcionar corretamente.</p>
          <p className="mt-2">Agora pode voltar ao GitHub e colar o código original do App.jsx.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-blue-400 p-8 flex flex-col items-center justify-center text-center font-mono">
      <Loader2 className="w-16 h-16 animate-spin mb-6" />
      <h2 className="text-xl font-bold mb-2">{status}</h2>
      <p className="text-slate-500 text-xs">{configCheck || "A aguardar..."}</p>
    </div>
  );
}
