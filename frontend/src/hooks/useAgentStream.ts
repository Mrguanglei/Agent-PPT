'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useToolPanelStore } from '@/stores/toolPanelStore';
import type { SSEEvent, ToolCall, ToolCallStatus } from '@/types/tool';

interface UseAgentStreamOptions {
  agentRunId: string | null;
  onMessage?: (content: string) => void;
  onToolCallStart?: (index: number, name: string) => void;
  onToolCallProgress?: (index: number, name: string, status: ToolCallStatus, params?: any) => void;
  onToolCallComplete?: (index: number, name: string, status: ToolCallStatus, result?: any, error?: string) => void;
  onSlideUpdate?: (data: any) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function useAgentStream({
  agentRunId,
  onMessage,
  onToolCallStart,
  onToolCallProgress,
  onToolCallComplete,
  onSlideUpdate,
  onComplete,
  onError,
}: UseAgentStreamOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const { addToolCall, updateToolCall, openPanel } = useToolPanelStore();

  // 使用 ref 存储回调函数，确保使用最新的回调
  const callbacksRef = useRef({
    onMessage,
    onToolCallStart,
    onToolCallProgress,
    onToolCallComplete,
    onSlideUpdate,
    onComplete,
    onError,
  });

  // 更新回调 ref
  useEffect(() => {
    callbacksRef.current = {
      onMessage,
      onToolCallStart,
      onToolCallProgress,
      onToolCallComplete,
      onSlideUpdate,
      onComplete,
      onError,
    };
  }, [onMessage, onToolCallStart, onToolCallProgress, onToolCallComplete, onSlideUpdate, onComplete, onError]);

  useEffect(() => {
    if (!agentRunId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No authentication token found');
      const { onError } = callbacksRef.current;
      if (onError) {
        onError('Authentication required');
      }
      return;
    }

    // Pass token as query parameter (EventSource doesn't support custom headers)
    const url = `${apiUrl}/api/v1/stream/agent/${agentRunId}?token=${encodeURIComponent(token)}`;

    // Create EventSource connection
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    // Handle message events (streaming text)
    eventSource.addEventListener('message', (e: MessageEvent) => {
      const { onMessage } = callbacksRef.current;
      try {
        const data = JSON.parse(e.data);
        if (data.content && onMessage) {
          onMessage(data.content);
        }
      } catch (err) {
        console.error('Failed to parse message event:', err);
      }
    });

    // Handle tool_call_start events
    eventSource.addEventListener('tool_call_start', (e: MessageEvent) => {
      const { onToolCallStart } = callbacksRef.current;
      try {
        const data = JSON.parse(e.data);
        const { tool_index, tool_name } = data;

        // Add tool call to store
        addToolCall({
          index: tool_index,
          name: tool_name,
          status: 'pending',
        });

        // Open panel automatically on first tool call
        if (tool_index === 0) {
          openPanel(0);
        }

        if (onToolCallStart) {
          onToolCallStart(tool_index, tool_name);
        }
      } catch (err) {
        console.error('Failed to parse tool_call_start event:', err);
      }
    });

    // Handle tool_call_progress events
    eventSource.addEventListener('tool_call_progress', (e: MessageEvent) => {
      const { onToolCallProgress } = callbacksRef.current;
      try {
        const data = JSON.parse(e.data);
        const { tool_index, tool_name, status, params } = data;

        updateToolCall(tool_index, { status, params });

        if (onToolCallProgress) {
          onToolCallProgress(tool_index, tool_name, status, params);
        }
      } catch (err) {
        console.error('Failed to parse tool_call_progress event:', err);
      }
    });

    // Handle tool_call_complete events
    eventSource.addEventListener('tool_call_complete', (e: MessageEvent) => {
      const { onToolCallComplete } = callbacksRef.current;
      try {
        const data = JSON.parse(e.data);
        const { tool_index, tool_name, status, result, error, execution_time } = data;

        updateToolCall(tool_index, { status, result, error, executionTime: execution_time });

        if (onToolCallComplete) {
          onToolCallComplete(tool_index, tool_name, status, result, error);
        }
      } catch (err) {
        console.error('Failed to parse tool_call_complete event:', err);
      }
    });

    // Handle slide_update events
    eventSource.addEventListener('slide_update', (e: MessageEvent) => {
      const { onSlideUpdate } = callbacksRef.current;
      try {
        const data = JSON.parse(e.data);
        if (onSlideUpdate) {
          onSlideUpdate(data);
        }
      } catch (err) {
        console.error('Failed to parse slide_update event:', err);
      }
    });

    // Handle done event
    eventSource.addEventListener('done', (e: MessageEvent) => {
      const { onComplete } = callbacksRef.current;
      try {
        const data = JSON.parse(e.data);
        if (onComplete) {
          onComplete();
        }
        eventSource.close();
      } catch (err) {
        console.error('Failed to parse done event:', err);
      }
    });

    // Handle error event
    eventSource.addEventListener('error', (e: MessageEvent) => {
      const { onError } = callbacksRef.current;
      try {
        // Check if data exists and is valid JSON
        if (e.data && e.data !== 'undefined') {
          const data = JSON.parse(e.data);
          if (onError) {
            onError(data.message || 'Unknown error');
          }
        } else {
          // Generic SSE connection error
          if (onError) {
            onError('Connection error or server disconnected');
          }
        }
        eventSource.close();
      } catch (err) {
        console.error('Failed to parse error event:', err);
        if (onError) {
          onError('Connection error');
        }
        eventSource.close();
      }
    });

    // Handle connection errors
    eventSource.onerror = (err) => {
      const { onError } = callbacksRef.current;
      console.error('EventSource error:', err);
      if (onError) {
        onError('Connection error');
      }
    };

    // Cleanup
    return () => {
      eventSource.close();
    };
  }, [agentRunId, addToolCall, updateToolCall, openPanel]); // 只依赖 agentRunId 和稳定的函数

  const closeConnection = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
  }, []);

  return { closeConnection };
}
