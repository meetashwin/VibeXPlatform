// Types for WebSocket messages
export type WebSocketMessageType = 'system' | 'chat' | 'codeChange' | 'error';

export interface BaseWSMessage {
  type: WebSocketMessageType;
}

export interface SystemMessage extends BaseWSMessage {
  type: 'system';
  message: string;
}

export interface ChatMessage extends BaseWSMessage {
  type: 'chat';
  userId: string | number;
  username: string;
  message: string;
  timestamp: string;
}

export interface CodeChangeMessage extends BaseWSMessage {
  type: 'codeChange';
  fileId: string | number;
  content: string;
  userId: string | number;
}

export interface ErrorMessage extends BaseWSMessage {
  type: 'error';
  message: string;
}

export type WebSocketMessage = SystemMessage | ChatMessage | CodeChangeMessage | ErrorMessage;

// WebSocket event handlers
type MessageHandler = (message: WebSocketMessage) => void;
type StatusHandler = () => void;

/**
 * Service for managing WebSocket connections
 */
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: MessageHandler[] = [];
  private connectHandlers: StatusHandler[] = [];
  private disconnectHandlers: StatusHandler[] = [];
  private reconnectTimer: any = null;
  private url: string;
  
  constructor() {
    // Determine the appropriate WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // Just use the full host with port already included
    // This avoids issues with undefined port
    this.url = `${protocol}//${window.location.host}/ws`;
    
    console.log('WebSocket URL:', this.url);
  }
  
  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }
    
    this.socket = new WebSocket(this.url);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.notifyConnect();
      
      // Clear any reconnect timer
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };
    
    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.notifyMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.notifyDisconnect();
      this.socket = null;
      
      // Attempt to reconnect after a delay
      this.reconnectTimer = setTimeout(() => this.connect(), 5000);
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    // Clear any reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
  
  /**
   * Send a message to the WebSocket server
   */
  send(message: WebSocketMessage): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message, WebSocket is not connected');
      return;
    }
    
    this.socket.send(JSON.stringify(message));
  }
  
  /**
   * Send a chat message
   */
  sendChatMessage(userId: string | number, username: string, message: string): void {
    this.send({
      type: 'chat',
      userId,
      username,
      message,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Send a code change notification
   */
  sendCodeChange(fileId: string | number, content: string, userId: string | number): void {
    this.send({
      type: 'codeChange',
      fileId,
      content,
      userId
    });
  }
  
  /**
   * Register a handler for incoming messages
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }
  
  /**
   * Register a handler for connection events
   */
  onConnect(handler: StatusHandler): () => void {
    this.connectHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      this.connectHandlers = this.connectHandlers.filter(h => h !== handler);
    };
  }
  
  /**
   * Register a handler for disconnection events
   */
  onDisconnect(handler: StatusHandler): () => void {
    this.disconnectHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      this.disconnectHandlers = this.disconnectHandlers.filter(h => h !== handler);
    };
  }
  
  /**
   * Notify all message handlers of a new message
   */
  private notifyMessage(message: WebSocketMessage): void {
    this.messageHandlers.forEach(handler => handler(message));
  }
  
  /**
   * Notify all connect handlers of connection
   */
  private notifyConnect(): void {
    this.connectHandlers.forEach(handler => handler());
  }
  
  /**
   * Notify all disconnect handlers of disconnection
   */
  private notifyDisconnect(): void {
    this.disconnectHandlers.forEach(handler => handler());
  }
  
  /**
   * Check if WebSocket is currently connected
   */
  isConnected(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

// Create a singleton instance
export const webSocketService = new WebSocketService();

/**
 * React hook for using the WebSocket service in components
 */
export function useWebSocket() {
  return {
    connect: () => webSocketService.connect(),
    disconnect: () => webSocketService.disconnect(),
    sendChatMessage: webSocketService.sendChatMessage.bind(webSocketService),
    sendCodeChange: webSocketService.sendCodeChange.bind(webSocketService),
    onMessage: webSocketService.onMessage.bind(webSocketService),
    onConnect: webSocketService.onConnect.bind(webSocketService),
    onDisconnect: webSocketService.onDisconnect.bind(webSocketService),
    isConnected: webSocketService.isConnected.bind(webSocketService),
  };
}