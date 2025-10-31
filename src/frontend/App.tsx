import React, { useState, useEffect } from 'react';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { useWebRTC } from './hooks/useWebRTC';
import { LoginPage } from './components/LoginPage';
import { ChatApp } from './components/ChatApp';
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

  if (!currentUser) {
    return <LoginPage onLogin={login} />;
  }

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
