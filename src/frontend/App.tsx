import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useWebRTC } from './hooks/useWebRTC';
import { LoginPage } from './components/LoginPage';
import { ChatApp } from './components/ChatApp';
import { ConfigDownloadPage } from './components/ConfigDownloadPage';
import { LandingPage } from './components/LandingPage';
import { DemoPage } from './components/DemoPage';
import { ChromeOSScanner } from './components/ChromeOSScanner';
import { UIShowcase } from './components/UIShowcase';
import './App.css';

function AppRoutes() {
  const {
    currentUser,
    messages,
    onlineUsers,
    pendingChanges,
    login,
    sendMessage,
    loadPendingChanges,
    approveChange,
    rejectChange
  } = useWebRTC();

  const [configComplete, setConfigComplete] = useState(false);

  useEffect(() => {
    const scanCompleted = localStorage.getItem('chromeos_scan_completed') === 'true';
    setConfigComplete(scanCompleted);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<UIShowcase />} />
      <Route path="/showcase" element={<UIShowcase />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route 
        path="/scanner" 
        element={
          <ChromeOSScanner onComplete={() => {
            setConfigComplete(true);
            window.location.href = '/app';
          }} />
        } 
      />
      <Route
        path="/app"
        element={
          !configComplete ? (
            <ConfigDownloadPage onConfigComplete={() => setConfigComplete(true)} />
          ) : !currentUser ? (
            <LoginPage onLogin={login} />
          ) : (
            <ChatApp
              currentUser={currentUser}
              messages={messages}
              onlineUsers={onlineUsers}
              pendingChanges={pendingChanges}
              onSendMessage={sendMessage}
              onLoadPendingChanges={loadPendingChanges}
              onApproveChange={approveChange}
              onRejectChange={rejectChange}
            />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-black">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;
