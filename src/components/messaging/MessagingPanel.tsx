'use client';

import { useState, useMemo } from 'react';
import { mockMessages } from '@/lib/data';
import MessageThread from './MessageThread';
import { formatTime } from '@/lib/utils';
import { Message } from '@/types';

export default function MessagingPanel() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  
  // Group messages by client
  const clientMessages = useMemo(() => {
    return messages.reduce((acc, msg) => {
      if (!acc[msg.clientId]) {
        acc[msg.clientId] = [];
      }
      acc[msg.clientId].push(msg);
      return acc;
    }, {} as Record<string, Message[]>);
  }, [messages]);
  
  const conversations = useMemo(() => {
    return Object.entries(clientMessages).map(([clientId, msgs]) => ({
      clientId,
      clientName: msgs[0].clientName,
      lastMessage: msgs[msgs.length - 1],
      unreadCount: msgs.filter(m => !m.read && m.sender === 'client').length,
    }));
  }, [clientMessages]);
  
  const selectedMessages = selectedClientId ? clientMessages[selectedClientId] || [] : [];
  const selectedClientName = selectedMessages.length > 0 ? selectedMessages[0].clientName : '';

  const handleSendMessage = (content: string) => {
    if (!content.trim() || !selectedClientId) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      clientId: selectedClientId,
      clientName: selectedClientName,
      content: content.trim(),
      sender: 'admin',
      timestamp: new Date(),
      read: true,
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="bg-white rounded-lg shadow flex h-[600px]">
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.clientId}
                onClick={() => setSelectedClientId(conv.clientId)}
                className={`w-full p-4 border-b border-gray-200 text-left hover:bg-gray-50 ${
                  selectedClientId === conv.clientId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold">{conv.clientName}</span>
                  {conv.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {conv.lastMessage.content}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTime(conv.lastMessage.timestamp)}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
      
      <MessageThread 
        messages={selectedMessages} 
        clientId={selectedClientId}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
