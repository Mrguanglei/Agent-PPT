'use client';

import { useState, useEffect } from 'react';
import { Chat, ChatListResponse } from '@/types/chat';
import { API_URL } from '@/lib/constants';

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/v1/chats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const data: ChatListResponse = await response.json();
      setChats(data.chats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const createChat = async (title?: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(title ? { title } : {}),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      const newChat: Chat = await response.json();
      setChats((prev) => [newChat, ...prev]);
      return newChat;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/chats/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }

      setChats((prev) => prev.filter((c) => c.id !== chatId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const updateChat = async (chatId: string, data: { title?: string }) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/chats/${chatId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update chat');
      }

      const updatedChat: Chat = await response.json();
      setChats((prev) => prev.map((c) => (c.id === chatId ? updatedChat : c)));
      return updatedChat;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return {
    chats,
    isLoading,
    error,
    refetch: fetchChats,
    createChat,
    deleteChat,
    updateChat,
  };
}
