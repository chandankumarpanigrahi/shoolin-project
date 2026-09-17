/**
 * Shoolin Innovations Ltd — Socket.io Real-time Client
 * Subscribes to real-time events, project rooms, and data invalidations.
 */

let socketInstance = null;

export function getSocket() {
  if (typeof window === 'undefined') return null;

  if (!socketInstance) {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

    try {
      // Lazy-load or check window io if socket.io-client is bundled
      if (window.io) {
        socketInstance = window.io(SOCKET_URL, {
          transports: ['websocket', 'polling'],
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 5,
        });
      }
    } catch (e) {
      console.warn('[Socket.io] Realtime client not initialized:', e.message);
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
