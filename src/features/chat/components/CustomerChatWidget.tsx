import { useState, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Headphones,
  Sparkles,
  LogIn,
  CheckCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useMyChatRoom, useRoomMessages, useSendMessage } from '../hooks/useChat';

export function CustomerChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentUser = useAuthStore((state) => state.user);

  // Load customer support room when widget is open or authenticated
  const { data: myRoom, isLoading: isLoadingRoom } = useMyChatRoom({
    enabled: isAuthenticated,
    poll: !isOpen, // Poll room status when closed to update unread badge
  });

  // Load and poll messages every 3s while open
  const roomId = myRoom?.id;
  const { data: messagesResponse, isLoading: isLoadingMessages } = useRoomMessages(
    roomId,
    { isOpen }
  );

  const sendMessageMutation = useSendMessage();

  // Sort messages chronologically (oldest to newest for chat flow)
  const messages = useMemo(() => {
    if (!messagesResponse?.data) return [];
    return [...messagesResponse.data].reverse();
  }, [messagesResponse?.data]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputValue.trim();
    if (!text || !roomId || sendMessageMutation.isPending) return;

    setInputValue('');
    try {
      await sendMessageMutation.mutateAsync({
        roomId,
        message: text,
      });
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      // Restore input on failure
      setInputValue(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const unreadCount = myRoom?.unreadCount ?? 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 flex h-[520px] max-h-[80vh] w-[360px] sm:w-[390px] flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-3.5 text-white shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 ring-2 ring-emerald-300">
                  <Headphones className="h-5 w-5 text-emerald-100" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-emerald-700" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold leading-tight">AgriGo Support</h3>
                  <p className="flex items-center text-xs text-emerald-100">
                    <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                    Online • Typically replies instantly
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-emerald-100 transition hover:bg-emerald-800 hover:text-white"
                title="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Area */}
            {!isAuthenticated ? (
              <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h4 className="text-base font-semibold text-gray-800">
                  Connect with Farm Experts
                </h4>
                <p className="mt-2 text-xs text-gray-500">
                  Please log in to your AgriGo account to chat with our harvest support specialists regarding produce origins, fresh orders, and delivery.
                </p>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="mt-5 inline-flex items-center space-x-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-emerald-800"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In to Continue</span>
                </Link>
              </div>
            ) : isLoadingRoom ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              </div>
            ) : (
              <>
                {/* Messages Feed */}
                <div className="flex-1 space-y-3 overflow-y-auto bg-stone-50/60 p-4">
                  {/* Welcome Greeting */}
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 text-xs text-emerald-800">
                    <p className="font-medium">🌱 Welcome to AgriGo Live Support!</p>
                    <p className="mt-1 text-emerald-700">
                      Our customer service team is here to assist with fresh produce specifications, order logistics, and VietGAP inquiries.
                    </p>
                  </div>

                  {isLoadingMessages && messages.length === 0 ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-12 text-center text-xs text-gray-400">
                      No previous messages. Send a message to start chatting!
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
                            className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                              isMe
                                ? 'rounded-br-xs bg-emerald-700 text-white'
                                : 'rounded-bl-xs border border-gray-100 bg-white text-gray-800'
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
                              <span title="Read">
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

                {/* Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center border-t border-gray-100 bg-white p-3"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm text-gray-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
                    maxLength={2000}
                    disabled={sendMessageMutation.isPending}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || sendMessageMutation.isPending}
                    className="ml-2 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow transition hover:bg-emerald-800 disabled:opacity-40"
                    title="Send message"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-white shadow-xl transition-colors hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200"
        aria-label="Open support chat"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageSquare className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </>
        )}
      </motion.button>
    </div>
  );
}
