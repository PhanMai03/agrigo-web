export interface ChatCustomer {
  id: number;
  fullName: string;
}

export interface ChatRoom {
  id: number;
  customer: ChatCustomer;
  adminId: number | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export interface SendMessageInput {
  message: string;
}

export interface MarkReadResponse {
  marked: number;
}

export interface ChatRoomsParams {
  page?: number;
  perPage?: number;
}

export interface ChatMessagesParams {
  page?: number;
  perPage?: number;
}

