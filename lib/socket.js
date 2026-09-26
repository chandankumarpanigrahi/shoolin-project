import { io } from 'socket.io-client';

/**
 * Shoolin Innovations Ltd — Multi-Device & Cross-Tab Real-time Engine
 * Combines Socket.io (for WebSocket connection), BroadcastChannel (for instant 0ms cross-tab sync),
 * and EventBus (for in-memory section-level sync).
 */

let socketInstance = null;
let broadcastChannel = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('shoolin_realtime_bus');
  } catch (e) {
    console.warn('[BroadcastChannel] Not available:', e);
  }
}

export function getSocket() {
  if (typeof window === 'undefined') return null;

  if (!socketInstance) {
    const defaultUrl = process.env.NODE_ENV === 'production' 
      ? (typeof window !== 'undefined' ? window.location.origin : '') 
      : 'http://localhost:5000';
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || defaultUrl;
    try {
      socketInstance = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        timeout: 4000,
      });

      socketInstance.on('connect', () => {
        console.log('⚡ Real-time WebSocket multi-device sync active');
      });
      socketInstance.on('connect_error', () => {
        // Fallback to HTTP polling sync silently
      });
    } catch (e) {
      // Quiet fallback
    }
  }

  return socketInstance;
}

/**
 * Broadcasts an event locally across all tabs and components
 */
export function broadcastLocalEvent(event, data) {
  if (typeof window === 'undefined') return;

  // 1. BroadcastChannel across all browser tabs
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ event, data });
    } catch (e) {}
  }

  // 2. Window CustomEvent for current window
  try {
    window.dispatchEvent(new CustomEvent('shoolin_realtime_event', { detail: { event, data } }));
  } catch (e) {}
}

/**
 * Subscribes to real-time events across Socket.IO, BroadcastChannel, and window bus
 */
export function subscribeToRealtimeEvent(event, callback) {
  if (typeof window === 'undefined') return () => {};

  // 1. Socket.io handler
  const socket = getSocket();
  if (socket) {
    socket.on(event, callback);
  }

  // 2. BroadcastChannel handler
  const handleBcMessage = (msgEvent) => {
    if (msgEvent.data && msgEvent.data.event === event) {
      callback(msgEvent.data.data);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBcMessage);
  }

  // 3. Local window Event handler
  const handleWindowEvent = (e) => {
    if (e.detail && e.detail.event === event) {
      callback(e.detail.data);
    }
  };
  window.addEventListener('shoolin_realtime_event', handleWindowEvent);

  return () => {
    if (socket) {
      socket.off(event, callback);
    }
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBcMessage);
    }
    window.removeEventListener('shoolin_realtime_event', handleWindowEvent);
  };
}
