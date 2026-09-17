import { io } from 'socket.io-client';

/**
 * Shoolin Innovations Ltd — Socket.io Real-time Client Engine
 * Connects to Express + WebSocket engine for multi-device instant sync.
 */

let socketInstance = null;

export function getSocket() {
  if (typeof window === 'undefined') return null;

  if (!socketInstance) {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    try {
      socketInstance = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
      });

      socketInstance.on('connect', () => {
        console.log('⚡ Real-time WebSocket multi-device sync active');
      });
    } catch (e) {
      console.warn('[Socket.io] Initialization error:', e.message);
    }
  }

  return socketInstance;
}

export function subscribeToRealtimeEvent(event, callback) {
  const socket = getSocket();
  if (!socket) return () => {};

  socket.on(event, callback);
  return () => socket.off(event, callback);
}
