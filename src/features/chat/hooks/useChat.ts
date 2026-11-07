import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { chatApi } from '../api/chatApi';
import type { ChatMessagesParams, ChatRoomsParams } from '../types';

export const CHAT_KEYS = {
  myRoom: ['chat-my-room'] as const,
  rooms: (params?: ChatRoomsParams) => ['chat-rooms', params] as const,
  messages: (roomId?: number) => ['chat-messages', roomId] as const,
};

/**
 * Customer: Hook to fetch or initialize the customer's personal support room
 */
export function useMyChatRoom(options?: { enabled?: boolean; poll?: boolean }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isCustomerOrAdmin = useAuthStore(
    (state) => state.user?.role === 'customer' || state.user?.role === 'admin'
  );

  return useQuery({
    queryKey: CHAT_KEYS.myRoom,
    queryFn: () => chatApi.getOrCreateMyRoom(),
    enabled: Boolean(isAuthenticated && isCustomerOrAdmin && (options?.enabled ?? true)),
    refetchInterval: options?.poll ? 5000 : false,
    staleTime: 1000 * 10,
  });
}

/**
 * Admin: Hook to list all customer support chat rooms
 */
export function useAdminChatRooms(params: ChatRoomsParams = {}, options?: { enabled?: boolean }) {
  const isAdmin = useAuthStore((state) => state.user?.role === 'admin');

  return useQuery({
    queryKey: CHAT_KEYS.rooms(params),
    queryFn: () => chatApi.getChatRooms(params),
    enabled: Boolean(isAdmin && (options?.enabled ?? true)),
    refetchInterval: 4000, // Poll inbox every 4 seconds for new incoming conversations
  });
}

/**
 * Hook to fetch messages for a specific room with 3000ms polling while open
 * and automatic read marking
 */
export function useRoomMessages(
  roomId: number | undefined,
  options?: { isOpen?: boolean; params?: ChatMessagesParams }
) {
  const queryClient = useQueryClient();
  const isOpen = Boolean(options?.isOpen && roomId);
  const lastMarkedMessageIdRef = useRef<number | null>(null);

  const query = useQuery({
    queryKey: CHAT_KEYS.messages(roomId),
    queryFn: () => chatApi.getRoomMessages(roomId!, options?.params ?? { perPage: 50 }),
    enabled: Boolean(roomId),
    refetchInterval: isOpen ? 3000 : false, // Poll every 3 seconds while active
    staleTime: 1000,
  });

  // Automatically mark as read when the room is open
  useEffect(() => {
    if (!isOpen || !roomId || !query.data?.data) return;

    const messages = query.data.data;
    if (messages.length === 0) return;

    const newestMessage = messages[0]; // Messages are ordered newest first by API
    if (newestMessage.id !== lastMarkedMessageIdRef.current) {
      lastMarkedMessageIdRef.current = newestMessage.id;
      chatApi.markRoomAsRead(roomId).then(() => {
        queryClient.invalidateQueries({ queryKey: CHAT_KEYS.rooms() });
        queryClient.invalidateQueries({ queryKey: CHAT_KEYS.myRoom });
      }).catch(() => {
        // Silently handle mark read error
      });
    }
  }, [isOpen, roomId, query.data, queryClient]);

  return query;
}

/**
 * Mutation hook to send a message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, message }: { roomId: number; message: string }) =>
      chatApi.sendMessage(roomId, message),
    onSuccess: (_, variables) => {
      // Invalidate message thread
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.messages(variables.roomId) });
      // Invalidate rooms inbox
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.myRoom });
    },
  });
}

/**
 * Mutation hook to explicitly mark a room as read
 */
export function useMarkRoomAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: number) => chatApi.markRoomAsRead(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.myRoom });
    },
  });
}
