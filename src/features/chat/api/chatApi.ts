import { apiClient } from '@/services/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  ChatMessagesParams,
  ChatRoom,
  ChatMessage,
  ChatRoomsParams,
  MarkReadResponse,
} from '../types';

export const chatApi = {
  /**
   * Customers: Initialize or retrieve their existing support room
   * POST /api/chat/rooms/me
   */
  async getOrCreateMyRoom(): Promise<ChatRoom> {
    const res = await apiClient.post<ApiResponse<ChatRoom>>('/chat/rooms/me');
    return res.data.data;
  },

  /**
   * Admin: List all customer chat rooms with unread counts & last message times
   * GET /api/chat/rooms
   */
  async getChatRooms(params: ChatRoomsParams = {}): Promise<PaginatedResponse<ChatRoom>> {
    const res = await apiClient.get<PaginatedResponse<ChatRoom>>('/chat/rooms', {
      params,
    });
    return res.data;
  },

  /**
   * List messages in a room (newest first in backend, client reverses for chronological chat view)
   * GET /api/chat/rooms/{id}/messages
   */
  async getRoomMessages(
    roomId: number,
    params: ChatMessagesParams = {}
  ): Promise<PaginatedResponse<ChatMessage>> {
    const res = await apiClient.get<PaginatedResponse<ChatMessage>>(
      `/chat/rooms/${roomId}/messages`,
      { params }
    );
    return res.data;
  },

  /**
   * Send a new message to a room
   * POST /api/chat/rooms/{id}/messages
   */
  async sendMessage(roomId: number, message: string): Promise<ChatMessage> {
    const res = await apiClient.post<ApiResponse<ChatMessage>>(
      `/chat/rooms/${roomId}/messages`,
      { message }
    );
    return res.data.data;
  },

  /**
   * Mark all unread messages from the other participant as read
   * POST /api/chat/rooms/{id}/read
   */
  async markRoomAsRead(roomId: number): Promise<MarkReadResponse> {
    const res = await apiClient.post<ApiResponse<MarkReadResponse>>(
      `/chat/rooms/${roomId}/read`,
      {}
    );
    return res.data.data;
  },
};
