import React, { useState, useEffect } from 'react';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { useWebRTC } from './hooks/useWebRTC';
import { LoginPage } from './components/LoginPage';
import { ChatApp } from './components/ChatApp';
import { ConfigDownloadPage } from './components/ConfigDownloadPage';
import './App.css';

function App() {
  const {
    connected,
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
    // Check if config was completed
    const scanCompleted = localStorage.getItem('chromeos_scan_completed') === 'true';
    setConfigComplete(scanCompleted);
  }, []);

  // Show config download page if not completed
  if (!configComplete) {
    return (
      <Theme appearance="dark" accentColor="red" radius="medium">
        <ConfigDownloadPage onConfigComplete={() => setConfigComplete(true)} />
      </Theme>
    );
  }

  // Show login page if no user
  if (!currentUser) {
    return <LoginPage onLogin={login} />;
  }

  // Show main app
  return (
    <Theme appearance="dark" accentColor="red" radius="medium">
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
    </Theme>
  );
}

export default App;
