import { db, hasRealFirebase } from "./config";
import { 
  collection, doc, getDoc, setDoc, updateDoc, deleteDoc, 
  query, where, onSnapshot, orderBy 
} from "firebase/firestore";
import { 
  INITIAL_USERS, INITIAL_ROOMS, INITIAL_REQUESTS, INITIAL_CHATS, 
  INITIAL_MESSAGES, Room, RentalRequest, Chat, Message, User 
} from "./mockData";

// --- Custom Local Storage Engine with Real-time PubSub ---
const STORAGE_KEY_USERS = "roomify_users_v2";
const STORAGE_KEY_ROOMS = "roomify_rooms_v2";
const STORAGE_KEY_REQUESTS = "roomify_requests_v2";
const STORAGE_KEY_CHATS = "roomify_chats_v2";
const STORAGE_KEY_MESSAGES = "roomify_messages_v2";

const initLocalStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY_USERS)) {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEY_ROOMS)) {
    localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(INITIAL_ROOMS));
  }
  if (!localStorage.getItem(STORAGE_KEY_REQUESTS)) {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  }
  if (!localStorage.getItem(STORAGE_KEY_CHATS)) {
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(INITIAL_CHATS));
  }
  if (!localStorage.getItem(STORAGE_KEY_MESSAGES)) {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(INITIAL_MESSAGES));
  }
};

initLocalStorage();

// Simple custom event bus to trigger real-time updates in Demo / Local mode
type ListenerCallback = () => void;
const listeners: Record<string, Set<ListenerCallback>> = {
  users: new Set(),
  rooms: new Set(),
  requests: new Set(),
  chats: new Set(),
  messages: new Set(),
};

const notifyListeners = (topic: string) => {
  listeners[topic]?.forEach(cb => cb());
};

const readLocal = <T>(key: string): T[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeLocal = <T>(key: string, data: T[], topic: string) => {
  localStorage.setItem(key, JSON.stringify(data));
  notifyListeners(topic);
};

// ================= DATABASE API =================

// Users
export const getUser = async (uid: string): Promise<User | null> => {
  if (hasRealFirebase && db) {
    try {
      const d = await getDoc(doc(db, "users", uid));
      if (d.exists()) return d.data() as User;
    } catch (e) {
      console.warn("Firestore getUser failed, falling back to local.", e);
    }
  }
  const users = readLocal<User>(STORAGE_KEY_USERS);
  return users.find(u => u.uid === uid) || null;
};

export const saveUser = async (user: User): Promise<void> => {
  if (hasRealFirebase && db) {
    try {
      await setDoc(doc(db, "users", user.uid), user, { merge: true });
      return;
    } catch (e) {
      console.warn("Firestore saveUser failed, falling back.", e);
    }
  }
  const users = readLocal<User>(STORAGE_KEY_USERS);
  const existing = users.findIndex(u => u.uid === user.uid);
  if (existing >= 0) {
    users[existing] = user;
  } else {
    users.push(user);
  }
  writeLocal(STORAGE_KEY_USERS, users, "users");
};

// Rooms
export const subscribeRooms = (callback: (rooms: Room[]) => void) => {
  if (hasRealFirebase && db) {
    const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const liveRooms: Room[] = [];
      snapshot.forEach(doc => liveRooms.push({ id: doc.id, ...doc.data() } as Room));
      callback(liveRooms);
    }, (err) => {
      console.warn("Realtime Firestore unsubscribe err:", err);
      // fallback
      callback(readLocal<Room>(STORAGE_KEY_ROOMS));
    });
  }

  // Local sync subscription
  const trigger = () => callback(readLocal<Room>(STORAGE_KEY_ROOMS));
  trigger();
  listeners.rooms.add(trigger);
  return () => {
    listeners.rooms.delete(trigger);
  };
};

export const createRoom = async (roomData: Omit<Room, "id">): Promise<string> => {
  const newId = "room-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
  const fullRoom: Room = { ...roomData, id: newId };

  if (hasRealFirebase && db) {
    try {
      await setDoc(doc(db, "rooms", newId), fullRoom);
      return newId;
    } catch (e) {
      console.warn("Firestore createRoom failed, executing local sync.", e);
    }
  }

  const rooms = readLocal<Room>(STORAGE_KEY_ROOMS);
  rooms.unshift(fullRoom);
  writeLocal(STORAGE_KEY_ROOMS, rooms, "rooms");
  return newId;
};

export const updateRoomStatus = async (roomId: string, available: boolean): Promise<void> => {
  if (hasRealFirebase && db) {
    try {
      await updateDoc(doc(db, "rooms", roomId), { available });
      return;
    } catch (e) {
      console.warn("Firestore updateRoomStatus err:", e);
    }
  }

  const rooms = readLocal<Room>(STORAGE_KEY_ROOMS);
  const idx = rooms.findIndex(r => r.id === roomId);
  if (idx >= 0) {
    rooms[idx].available = available;
    writeLocal(STORAGE_KEY_ROOMS, rooms, "rooms");
  }
};

export const deleteRoomDoc = async (roomId: string): Promise<void> => {
  if (hasRealFirebase && db) {
    try {
      await deleteDoc(doc(db, "rooms", roomId));
      return;
    } catch (e) {
      console.warn("Firestore delete err:", e);
    }
  }
  const rooms = readLocal<Room>(STORAGE_KEY_ROOMS);
  const filtered = rooms.filter(r => r.id !== roomId);
  writeLocal(STORAGE_KEY_ROOMS, filtered, "rooms");
};

// Requests
export const subscribeRequests = (userId: string, role: 'room_owner' | 'room_seeker', callback: (requests: RentalRequest[]) => void) => {
  if (hasRealFirebase && db) {
    const field = role === 'room_owner' ? 'ownerId' : 'seekerId';
    const q = query(collection(db, "requests"), where(field, "==", userId));
    return onSnapshot(q, (snapshot) => {
      const reqs: RentalRequest[] = [];
      snapshot.forEach(doc => reqs.push({ id: doc.id, ...doc.data() } as RentalRequest));
      reqs.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(reqs);
    }, () => {
      // fallback
      const all = readLocal<RentalRequest>(STORAGE_KEY_REQUESTS);
      const matched = all.filter(r => role === 'room_owner' ? r.ownerId === userId : r.seekerId === userId);
      callback(matched);
    });
  }

  const trigger = () => {
    const all = readLocal<RentalRequest>(STORAGE_KEY_REQUESTS);
    const matched = all.filter(r => role === 'room_owner' ? r.ownerId === userId : r.seekerId === userId);
    matched.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(matched);
  };
  trigger();
  listeners.requests.add(trigger);
  return () => {
    listeners.requests.delete(trigger);
  };
};

export const submitRentalRequest = async (requestData: Omit<RentalRequest, "id" | "status" | "createdAt">): Promise<boolean> => {
  const newId = "req-" + Date.now();
  const fullReq: RentalRequest = {
    ...requestData,
    id: newId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  if (hasRealFirebase && db) {
    try {
      await setDoc(doc(db, "requests", newId), fullReq);
      return true;
    } catch (e) {
      console.warn("Firestore submitRentalRequest err:", e);
    }
  }

  const reqs = readLocal<RentalRequest>(STORAGE_KEY_REQUESTS);
  // Check if existing
  const existing = reqs.find(r => r.roomId === requestData.roomId && r.seekerId === requestData.seekerId);
  if (existing) {
    return false; // already requested
  }

  reqs.unshift(fullReq);
  writeLocal(STORAGE_KEY_REQUESTS, reqs, "requests");
  return true;
};

export const acceptRentalRequest = async (req: RentalRequest): Promise<string> => {
  // Update status to accepted
  // Create or get chat
  const chatId = `chat-${req.ownerId}-${req.seekerId}`;

  if (hasRealFirebase && db) {
    try {
      await updateDoc(doc(db, "requests", req.id), { status: 'accepted', chatId });
      // Create chat doc if not exists
      const chatRef = doc(db, "chats", chatId);
      const c = await getDoc(chatRef);
      if (!c.exists()) {
        const newChat: Chat = {
          id: chatId,
          roomId: req.roomId,
          roomTitle: req.roomTitle,
          participants: [req.ownerId, req.seekerId],
          ownerId: req.ownerId,
          seekerId: req.seekerId,
          ownerName: req.ownerName,
          seekerName: req.seekerName,
          ownerPhoto: req.roomPhoto, // or owner photo
          seekerPhoto: req.seekerPhoto,
          lastMessage: `Rental request accepted! Contact unlocked.`,
          lastMessageTime: new Date().toISOString(),
          unreadCount: { [req.seekerId]: 1, [req.ownerId]: 0 }
        };
        await setDoc(chatRef, newChat);
      }
      return chatId;
    } catch (e) {
      console.warn("Firestore accept err:", e);
    }
  }

  // Local sync
  const reqs = readLocal<RentalRequest>(STORAGE_KEY_REQUESTS);
  const rIdx = reqs.findIndex(r => r.id === req.id);
  if (rIdx >= 0) {
    reqs[rIdx].status = 'accepted';
    reqs[rIdx].chatId = chatId;
    writeLocal(STORAGE_KEY_REQUESTS, reqs, "requests");
  }

  const chats = readLocal<Chat>(STORAGE_KEY_CHATS);
  let cObj = chats.find(c => c.id === chatId);
  if (!cObj) {
    cObj = {
      id: chatId,
      roomId: req.roomId,
      roomTitle: req.roomTitle,
      participants: [req.ownerId, req.seekerId],
      ownerId: req.ownerId,
      seekerId: req.seekerId,
      ownerName: req.ownerName,
      seekerName: req.seekerName,
      ownerPhoto: req.roomPhoto,
      seekerPhoto: req.seekerPhoto,
      lastMessage: `Rental request accepted! Let's connect.`,
      lastMessageTime: new Date().toISOString(),
      unreadCount: { [req.seekerId]: 1, [req.ownerId]: 0 }
    };
    chats.unshift(cObj);
    writeLocal(STORAGE_KEY_CHATS, chats, "chats");

    // Add initial welcome message
    const msgs = readLocal<Message>(STORAGE_KEY_MESSAGES);
    msgs.push({
      id: "msg-" + Date.now(),
      chatId,
      senderId: req.ownerId,
      senderName: req.ownerName,
      text: `Hello ${req.seekerName}! I have accepted your rental request for ${req.roomTitle}. My phone number is ${req.ownerPhone}. When do you want to inspect the room?`,
      timestamp: new Date().toISOString()
    });
    writeLocal(STORAGE_KEY_MESSAGES, msgs, "messages");
  }

  return chatId;
};

export const rejectRentalRequest = async (requestId: string): Promise<void> => {
  if (hasRealFirebase && db) {
    try {
      await updateDoc(doc(db, "requests", requestId), { status: 'rejected' });
      return;
    } catch (e) {
      console.warn("Firestore reject err:", e);
    }
  }

  const reqs = readLocal<RentalRequest>(STORAGE_KEY_REQUESTS);
  const idx = reqs.findIndex(r => r.id === requestId);
  if (idx >= 0) {
    reqs[idx].status = 'rejected';
    writeLocal(STORAGE_KEY_REQUESTS, reqs, "requests");
  }
};

// Chats & Messages
export const subscribeChats = (userId: string, callback: (chats: Chat[]) => void) => {
  if (hasRealFirebase && db) {
    const q = query(collection(db, "chats"), where("participants", "array-contains", userId));
    return onSnapshot(q, (snapshot) => {
      const list: Chat[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Chat));
      list.sort((a,b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
      callback(list);
    }, () => {
      const all = readLocal<Chat>(STORAGE_KEY_CHATS);
      const matched = all.filter(c => c.participants.includes(userId));
      callback(matched);
    });
  }

  const trigger = () => {
    const all = readLocal<Chat>(STORAGE_KEY_CHATS);
    const matched = all.filter(c => c.participants.includes(userId));
    matched.sort((a,b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
    callback(matched);
  };
  trigger();
  listeners.chats.add(trigger);
  return () => {
    listeners.chats.delete(trigger);
  };
};

export const subscribeMessages = (chatId: string, callback: (messages: Message[]) => void) => {
  if (hasRealFirebase && db) {
    const q = query(collection(db, "messages"), where("chatId", "==", chatId));
    return onSnapshot(q, (snapshot) => {
      const list: Message[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Message));
      list.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      callback(list);
    }, () => {
      const all = readLocal<Message>(STORAGE_KEY_MESSAGES);
      callback(all.filter(m => m.chatId === chatId));
    });
  }

  const trigger = () => {
    const all = readLocal<Message>(STORAGE_KEY_MESSAGES);
    const matched = all.filter(m => m.chatId === chatId);
    matched.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    callback(matched);
  };
  trigger();
  listeners.messages.add(trigger);
  return () => {
    listeners.messages.delete(trigger);
  };
};

export const sendMessageDoc = async (chatId: string, senderId: string, senderName: string, text: string, recipientId: string): Promise<void> => {
  const newMsg: Message = {
    id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    chatId,
    senderId,
    senderName,
    text,
    timestamp: new Date().toISOString()
  };

  if (hasRealFirebase && db) {
    try {
      await setDoc(doc(db, "messages", newMsg.id), newMsg);
      // Update chat last message & timestamp
      const chatRef = doc(db, "chats", chatId);
      const cSnap = await getDoc(chatRef);
      if (cSnap.exists()) {
        const data = cSnap.data() as Chat;
        const currentUnread = data.unreadCount?.[recipientId] || 0;
        await updateDoc(chatRef, {
          lastMessage: text,
          lastMessageTime: newMsg.timestamp,
          [`unreadCount.${recipientId}`]: currentUnread + 1
        });
      }
      return;
    } catch (e) {
      console.warn("Firestore sendMessageDoc err:", e);
    }
  }

  const msgs = readLocal<Message>(STORAGE_KEY_MESSAGES);
  msgs.push(newMsg);
  writeLocal(STORAGE_KEY_MESSAGES, msgs, "messages");

  const chats = readLocal<Chat>(STORAGE_KEY_CHATS);
  const cIdx = chats.findIndex(c => c.id === chatId);
  if (cIdx >= 0) {
    chats[cIdx].lastMessage = text;
    chats[cIdx].lastMessageTime = newMsg.timestamp;
    if (!chats[cIdx].unreadCount) chats[cIdx].unreadCount = {};
    chats[cIdx].unreadCount[recipientId] = (chats[cIdx].unreadCount[recipientId] || 0) + 1;
    writeLocal(STORAGE_KEY_CHATS, chats, "chats");
  }
};

export const markChatReadLocal = async (chatId: string, myUserId: string): Promise<void> => {
  if (hasRealFirebase && db) {
    try {
      await updateDoc(doc(db, "chats", chatId), {
        [`unreadCount.${myUserId}`]: 0
      });
      return;
    } catch (e) {
      console.warn("Firestore markRead err:", e);
    }
  }

  const chats = readLocal<Chat>(STORAGE_KEY_CHATS);
  const cIdx = chats.findIndex(c => c.id === chatId);
  if (cIdx >= 0) {
    if (!chats[cIdx].unreadCount) chats[cIdx].unreadCount = {};
    chats[cIdx].unreadCount[myUserId] = 0;
    writeLocal(STORAGE_KEY_CHATS, chats, "chats");
  }
};