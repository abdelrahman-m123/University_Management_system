"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { HubConnection, HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import { MessageCircle, Search, Send, UserRound } from "lucide-react";
import ProtectedRoute from "../../components/ProtectedRoutes";
import Sidebar from "../../components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChatContact, ChatMessage } from "./actions";
import {
  getChatContacts,
  getChatMessages,
  getUnreadChats,
  markChatAsRead,
  sendChatMessage,
} from "./actions";

type ChatRole = "student" | "Doctor";

const ChatsPage = () => {
  const [role, setRole] = useState<ChatRole | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [live, setLive] = useState(false);
  const [unreadByContact, setUnreadByContact] = useState<Record<number, number>>({});

  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    const savedUserId = Number(localStorage.getItem("userId"));

    if (savedRole === "student" || savedRole === "Doctor") {
      setRole(savedRole);
    } else {
      setError("Only students and doctors can use chat.");
    }

    if (Number.isInteger(savedUserId)) {
      setCurrentUserId(savedUserId);
    }
  }, []);

  useEffect(() => {
    if (!role || !currentUserId) return;

    let cancelled = false;
    getUnreadChats().then((result) => {
      if (cancelled || !result.success) return;

      const unreadCounts: Record<number, number> = {};
      result.unreadChats.forEach((chat) => {
        const contactId = role === "student" ? chat.doctorId : chat.studentId;
        unreadCounts[contactId] = chat.unreadCount;
      });
      setUnreadByContact(unreadCounts);
    });

    return () => {
      cancelled = true;
    };
  }, [role, currentUserId]);

  useEffect(() => {
    if (!role || !currentUserId) return;

    const token = localStorage.getItem("token");
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5219";
    const hubConnection = new HubConnectionBuilder()
      .withUrl(`${apiBaseUrl}/hubs/chat`, {
        accessTokenFactory: () => token ?? "",
      })
      .withAutomaticReconnect()
      .build();

    const addIncomingMessage = (message: ChatMessage) => {
      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) return current;
        return [...current, message];
      });

      if (message.senderId !== currentUserId) {
        const contactId = role === "student" ? message.doctorId : message.studentId;
        setUnreadByContact((current) => ({ ...current, [contactId]: 0 }));
        void markChatAsRead(message.doctorId, message.studentId);
      }
    };

    const updateUnreadCount = (change: {
      doctorId: number;
      studentId: number;
      unreadCount: number;
    }) => {
      const contactId = role === "student" ? change.doctorId : change.studentId;
      setUnreadByContact((current) => ({
        ...current,
        [contactId]: change.unreadCount,
      }));
    };

    hubConnection.on("MessageReceived", addIncomingMessage);
    hubConnection.on("UnreadCountChanged", updateUnreadCount);
    hubConnection.onreconnecting(() => setLive(false));
    hubConnection.onreconnected(() => setLive(true));
    hubConnection.onclose(() => setLive(false));

    hubConnection
      .start()
      .then(() => {
        setConnection(hubConnection);
        setLive(true);
      })
      .catch(() => setLive(false));

    return () => {
      hubConnection.off("MessageReceived", addIncomingMessage);
      hubConnection.off("UnreadCountChanged", updateUnreadCount);
      void hubConnection.stop();
      setConnection(null);
      setLive(false);
    };
  }, [role, currentUserId]);

  useEffect(() => {
    if (!connection || !selectedContact || !currentUserId || !role) return;

    const ids = getParticipantIds(selectedContact);
    if (connection.state !== HubConnectionState.Connected) return;

    void connection.invoke("JoinChat", ids.doctorId, ids.studentId).catch(() => {
      setLive(false);
    });

    return () => {
      if (connection.state === HubConnectionState.Connected) {
        void connection.invoke("LeaveChat", ids.doctorId, ids.studentId);
      }
    };
  }, [connection, selectedContact, currentUserId, role, live]);

  useEffect(() => {
    if (!role) return;

    let cancelled = false;
    const loadContacts = async () => {
      setLoadingContacts(true);
      setError(null);
      const result = await getChatContacts(role);

      if (!cancelled) {
        if (result.success) {
          setContacts(result.contacts);
        } else {
          setError(result.error ?? "Could not load chat contacts.");
        }
        setLoadingContacts(false);
      }
    };

    loadContacts();
    return () => {
      cancelled = true;
    };
  }, [role]);

  const filteredContacts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return contacts;

    return contacts.filter((contact) =>
      contact.fullName.toLowerCase().includes(normalizedSearch),
    );
  }, [contacts, search]);

  const getParticipantIds = (contact: ChatContact) => ({
    doctorId: role === "student" ? contact.userId : currentUserId!,
    studentId: role === "student" ? currentUserId! : contact.userId,
  });

  const selectContact = async (contact: ChatContact) => {
    if (!currentUserId) return;

    setSelectedContact(contact);
    setMessages([]);
    setLoadingMessages(true);
    setError(null);

    const ids = getParticipantIds(contact);
    const result = await getChatMessages(ids.doctorId, ids.studentId);
    if (result.success) {
      setMessages(result.messages);
      setUnreadByContact((current) => ({ ...current, [contact.userId]: 0 }));
      void markChatAsRead(ids.doctorId, ids.studentId);
    } else {
      setError(result.error ?? "Could not load messages.");
    }
    setLoadingMessages(false);
  };

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedContact || !draft.trim() || !currentUserId || sending) return;

    setSending(true);
    setError(null);
    const ids = getParticipantIds(selectedContact);
    const result = await sendChatMessage(ids.doctorId, ids.studentId, draft.trim());

    if (result.success && result.message) {
      setMessages((current) => {
        if (current.some((item) => item.id === result.message!.id)) return current;
        return [...current, result.message!];
      });
      setDraft("");
    } else {
      setError(result.error ?? "Could not send message.");
    }
    setSending(false);
  };

  return (
    <ProtectedRoute allowedRoles={["student", "Doctor"]}>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex h-screen min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4 pt-0 pb-0 sm:px-6 lg:px-8">
          <div className="-mx-4 grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] max-w-none overflow-hidden gap-5 sm:-mx-6 lg:-mx-8 lg:grid-rows-1 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-0 lg:divide-x lg:divide-slate-200">
            <aside className="flex min-h-0 flex-col overflow-hidden bg-white">
              <div className="shrink-0 border-b border-slate-200 p-4">
                <h2 className="mb-3 text-sm font-semibold text-slate-900">
                  Find {role === "student" ? "a doctor" : "a student"}
                </h2>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name"
                    className="pl-9"
                    aria-label="Search chat contacts by name"
                  />
                </div>
              </div>

              <div className="chat-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
                {loadingContacts ? (
                  <p className="p-4 text-sm text-slate-500">Loading contacts...</p>
                ) : filteredContacts.length === 0 ? (
                  <p className="p-4 text-sm text-slate-500">
                    No matching {role === "student" ? "doctors" : "students"} found.
                  </p>
                ) : (
                  filteredContacts.map((contact) => {
                    const isSelected = selectedContact?.userId === contact.userId;
                    const unreadCount = unreadByContact[contact.userId] ?? 0;
                    return (
                      <button
                        key={contact.userId}
                        type="button"
                        onClick={() => selectContact(contact)}
                        className={`mb-1 flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                          isSelected
                            ? "bg-blue-50 text-blue-900"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-900">
                          {contact.fullName
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {contact.fullName}
                            {unreadCount > 0 && (
                              <span className="ml-1 font-normal text-slate-500">
                                ({unreadCount > 99 ? "99+" : unreadCount})
                              </span>
                            )}
                          </span>
                          <span className="block truncate text-xs text-slate-500">
                            {contact.email}
                          </span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            <section className="flex min-h-0 flex-col overflow-hidden bg-white">
              {selectedContact ? (
                <>
                  <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 p-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-900">
                      <UserRound className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-slate-900">{selectedContact.fullName}</h2>
                        {(unreadByContact[selectedContact.userId] ?? 0) > 0 && (
                          <span className="text-sm font-normal text-slate-500">
                            ({(unreadByContact[selectedContact.userId] ?? 0) > 99
                              ? "99+"
                              : unreadByContact[selectedContact.userId]})
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        {selectedContact.role} · {live ? "Live" : "Connecting..."}
                      </p>
                    </div>
                  </header>

                  <div className="chat-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                    {loadingMessages ? (
                      <p className="text-center text-sm text-slate-500">Loading messages...</p>
                    ) : messages.length === 0 ? (
                      <div className="flex h-full min-h-48 flex-col items-center justify-center text-center text-slate-500">
                        <MessageCircle className="mb-2 h-8 w-8 text-blue-300" />
                        <p className="text-sm">No messages yet.</p>
                        <p className="text-xs">Send the first message to start this chat.</p>
                      </div>
                    ) : (
                      messages.map((message, index) => {
                        const isMine = message.senderId === currentUserId;
                        return (
                          <div
                            key={message.id || `${message.timeStamp}-${index}`}
                            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                                isMine
                                  ? "rounded-br-sm bg-blue-900 text-white"
                                  : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{message.message}</p>
                              <time
                                dateTime={message.timeStamp}
                                className={`mt-1 block text-[10px] ${isMine ? "text-blue-200" : "text-slate-400"}`}
                              >
                                {new Date(message.timeStamp).toLocaleString()}
                              </time>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={handleSend} className="sticky bottom-0 z-10 flex shrink-0 gap-2 border-t border-slate-200 bg-white p-3">
                    <Input
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Write a message..."
                      maxLength={2000}
                      disabled={sending}
                      aria-label="Message"
                    />
                    <Button type="submit" disabled={sending || !draft.trim()}>
                      <Send className="h-4 w-4" />
                      <span className="hidden sm:inline">Send</span>
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto p-8 text-center text-slate-500">
                  <MessageCircle className="mb-3 h-12 w-12 text-blue-200" />
                  <h2 className="text-lg font-semibold text-slate-800">Choose someone to chat with</h2>
                  <p className="mt-1 max-w-sm text-sm">
                    Search for a {role === "student" ? "doctor" : "student"} on the left to open a conversation.
                  </p>
                </div>
              )}
            </section>
          </div>

          {error && (
            <p className="mx-auto mt-4 max-w-7xl shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ChatsPage;
