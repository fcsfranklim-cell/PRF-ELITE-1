import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export default function App() {
  const [logs, setLogs] = useState([]);

  // Função para adicionar mensagens no ecrã
  const addLog = (msg) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

  useEffect(() => {
    runSystemCheck();
  }, []);

  const runSystemCheck = async () => {
    addLog("1. A iniciar Sistema de Diagnóstico...");

    // ETAPA 1: VERIFICAR CHAVES
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

    if (!apiKey) {
      addLog("❌ ERRO CRÍTICO: VITE_FIREBASE_API_KEY não encontrada.");
      addLog("⚠️ SOLUÇÃO: Vá à Vercel > Settings > Environment Variables e adicione as chaves.");
      addLog("⚠️ IMPORTANTE: Depois de adicionar, tem de fazer REDEPLOY.");
      return;
    } else {
      addLog(`✅ Chave API detetada (Começa com: ${apiKey.substring(0, 4)}...)`);
    }

    if (!projectId) {
      addLog("❌ ERRO: VITE_FIREBASE_PROJECT_ID em falta.");
      return;
    }

    // ETAPA 2: CONFIGURAR FIREBASE
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    try {
      addLog("2. A inicializar a App Firebase...");
      const app = initializeApp(firebaseConfig);
      addLog("✅ Firebase App criada.");

      addLog("3. A inicializar a Autenticação...");
      const auth = getAuth(app);
      
      addLog("⏳ A tentar Login Anónimo...");
      const userCredential = await signInAnonymously(auth);
      
      addLog("🎉 SUCESSO TOTAL!");
      addLog(`👤 Utilizador conectado: ${userCredential.user.uid}`);
      addLog("✅ O sistema está pronto. Pode voltar ao código original.");

    } catch (error) {
      addLog("❌ ERRO NO PROCESSO:");
      addLog(error.message);

      if (error.message.includes("auth/operation-not-allowed")) {
        addLog("👉 SOLUÇÃO: Ative o fornecedor 'Anonymous' na consola do Firebase.");
      }
      if (error.message.includes("auth/unauthorized-domain") || error.message.includes("auth/configuration-not-found")) {
        addLog("👉 SOLUÇÃO: Adicione este domínio aos 'Authorized Domains' no Firebase Auth.");
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#0a0f1c', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'monospace' }}>
      <h1 style={{ color: '#3b82f6', fontSize: '20px', marginBottom: '20px' }}>CONSOLE DE DIAGNÓSTICO V3</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {logs.map((log, index) => (
          <div key={index} style={{ 
            padding: '10px', 
            borderRadius: '5px', 
            backgroundColor: log.includes('❌') ? 'rgba(239, 68, 68, 0.2)' : 
                             log.includes('✅') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)',
            border: log.includes('❌') ? '1px solid #ef4444' : '1px solid #333'
          }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
