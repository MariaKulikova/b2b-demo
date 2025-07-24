import React, { useEffect } from 'react';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';

const ChatWidget = () => {
  useEffect(() => {
    createChat({
      webhookUrl: 'https://dealmx.app.n8n.cloud/webhook/852922ca-1f2d-4c85-a02b-863ca4d3c7eb/chat',
      target: '.chat-widget',
      mode: 'window',
      showWelcomeScreen: true,
      chatInputKey: 'chatInput',
      chatSessionKey: 'sessionId'
    });
  }, []);

  return <div className="chat-widget"></div>;
};

export default ChatWidget;

