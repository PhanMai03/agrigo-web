import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Send,
  Loader2,
  CheckCheck,
  Headphones,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AdminLayout } from '@/layouts/AdminLayout';
import {
  useAdminChatRooms,
  useRoomMessages,
  useSendMessage,
} from '@/features/chat/hooks/useChat';
import { useAuthStore } from '@/stores/authStore';

export function AdminChatInboxPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [page, setPage] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentUser = useAuthStore((state) => state.user);

  // Fetch all chat rooms for admin
  const {
    data: roomsResponse,
    isLoading: isLoadingRooms,
    refetch: refetchRooms,
    isRefetching: isRefetchingRooms,
  } = useAdminChatRooms({ page, perPage: 20 });

  const rooms = roomsResponse?.data ?? [];
  const meta = roomsResponse?.meta;

  // Filter rooms by search keyword
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    const q = searchQuery.toLowerCase().trim();
    return rooms.filter((r) => r.customer.fullName.toLowerCase().includes(q));
  }, [rooms, searchQuery]);

  // Selected room details
  const activeRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId) ?? null,
    [rooms, selectedRoomId]
  );

  // Fetch messages for selected room (polls every 3s while viewing)
  const { data: messagesResponse, isLoading: isLoadingMessages } = useRoomMessages(
    selectedRoomId ?? undefined,
    { isOpen: Boolean(selectedRoomId) }
  );

  const sendMessageMutation = useSendMessage();

  // Messages ordered oldest to newest for visual thread
  const messages = useMemo(() => {
    if (!messagesResponse?.data) return [];
    return [...messagesResponse.data].reverse();
  }, [messagesResponse?.data]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (selectedRoomId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedRoomId]);

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = replyText.trim();
    if (!text || !selectedRoomId || sendMessageMutation.isPending) return;

    setReplyText('');
    try {
      await sendMessageMutation.mutateAsync({
        roomId: selectedRoomId,
        message: text,
      });
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch {
      setReplyText(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const totalUnreadCount = useMemo(() => {
    return rooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);
  }, [rooms]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Customer Support Inbox
            </h1>
            <p className="text-sm text-gray-500">
              Real-time messaging with shoppers and farm wholesale clients.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {totalUnreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
                {totalUnreadCount} Unread Message{totalUnreadCount > 1 ? 's' : ''}
              </span>
            )}
            <button
              type="button"
              onClick={() => refetchRooms()}
              disabled={isRefetchingRooms}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefetchingRooms ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Dual-Pane Messenger Card */}
        <div className="grid h-[680px] grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:grid-cols-12">
          {/* Left Column: Room / Customer List (4 cols) */}
          <div className="flex flex-col border-r border-gray-200 md:col-span-4 lg:col-span-4">
            {/* Search Input */}
            <div className="border-b border-gray-100 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-xs text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {isLoadingRooms ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  {searchQuery ? 'No conversations match your search.' : 'No active support conversations yet.'}
                </div>
              ) : (
                filteredRooms.map((room) => {
                  const isSelected = room.id === selectedRoomId;
                  const hasUnread = room.unreadCount > 0;

                  return (
                    <button
                      type="button"
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`flex w-full items-start space-x-3 p-3.5 text-left transition hover:bg-emerald-50/50 ${
                        isSelected
                          ? 'border-l-4 border-emerald-600 bg-emerald-50/70'
                          : 'border-l-4 border-transparent'
                      }`}
                    >
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800">
                        {room.customer.fullName.slice(0, 2).toUpperCase()}
                        {hasUnread && (
                          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`truncate text-sm ${
                              hasUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-800'
                            }`}
                          >
                            {room.customer.fullName}
                          </h4>
                          {room.lastMessageAt && (
                            <span className="text-[11px] text-gray-400 shrink-0 ml-1">
                              {new Date(room.lastMessageAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                          <span className="truncate">Customer #{room.customer.id}</span>
                          {hasUnread && (
                            <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                              {room.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 p-2 text-xs text-gray-500">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded p-1 hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span>
                  Page {meta.page} of {meta.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded p-1 hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Active Conversation (8 cols) */}
          <div className="flex flex-col md:col-span-8 lg:col-span-8 bg-stone-50/40">
            {activeRoom ? (
              <>
                {/* Active Room Top Header */}
                <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3.5">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
                      {activeRoom.customer.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {activeRoom.customer.fullName}
                      </h3>
                      <p className="text-xs text-gray-400">
                        Customer Account ID: {activeRoom.customer.id} • Room #{activeRoom.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Live Thread
                    </span>
                  </div>
                </div>

                {/* Message Stream */}
                <div className="flex-1 space-y-3 overflow-y-auto p-5">
                  <div className="flex justify-center">
                    <span className="rounded-full bg-gray-200/60 px-3 py-1 text-[11px] font-medium text-gray-500">
                      Conversation started on{' '}
                      {new Date(activeRoom.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {isLoadingMessages && messages.length === 0 ? (
                    <div className="flex h-40 items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-20 text-center text-xs text-gray-400">
                      No messages in this room yet. Send a greeting to initiate contact.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === currentUser?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                              isMe
                                ? 'rounded-br-xs bg-emerald-700 text-white'
                                : 'rounded-bl-xs border border-gray-200/80 bg-white text-gray-800'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                          </div>
                          <div className="mt-1 flex items-center space-x-1 px-1 text-[10px] text-gray-400">
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMe && msg.readAt && (
                              <span title="Customer read">
                                <CheckCheck className="h-3 w-3 text-emerald-500" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Form Footer */}
                <form
                  onSubmit={handleSendReply}
                  className="border-t border-gray-200 bg-white p-3.5"
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder={`Reply to ${activeRoom.customer.fullName}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      maxLength={2000}
                      className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim() || sendMessageMutation.isPending}
                      className="inline-flex items-center space-x-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-800 disabled:opacity-40"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <span>Send</span>
                          <Send className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Empty Placeholder */
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Headphones className="h-8 w-8" />
                </div>
                <h3 className="text-base font-semibold text-gray-800">
                  Select a Conversation
                </h3>
                <p className="mt-1 max-w-sm text-xs text-gray-500">
                  Choose a customer support room from the list on the left to read their inquiry and reply.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
