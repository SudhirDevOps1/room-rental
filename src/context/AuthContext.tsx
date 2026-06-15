import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, INITIAL_USERS } from '../firebase/mockData';
import { saveUser, subscribeChats, subscribeRequests } from '../firebase/db';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  activeRole: 'room_owner' | 'room_seeker';
  loginAsDemoUser: (uid: string) => void;
  customLoginOrSignup: (phoneOrEmail: string, name: string, role: 'room_owner' | 'room_seeker', city: string) => Promise<User>;
  logout: () => void;
  switchRole: (role: 'room_owner' | 'room_seeker') => void;
  unreadMessagesCount: number;
  pendingRequestsCount: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default start as Suresh (Room Seeker) or Ramesh (Room Owner) for excellent initial walkthrough
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("roomify_active_user");
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_USERS[1]; // default Suresh Kumar (Room Seeker)
  });

  const [activeRole, setActiveRole] = useState<'room_owner' | 'room_seeker'>(user ? user.role : 'room_seeker');
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    if (user) {
      localStorage.setItem("roomify_active_user", JSON.stringify(user));
      setActiveRole(user.role);
    } else {
      localStorage.removeItem("roomify_active_user");
    }
  }, [user]);

  // Subscribe to unread chat badges & pending requests
  useEffect(() => {
    if (!user) {
      setUnreadMessagesCount(0);
      setPendingRequestsCount(0);
      return;
    }

    const unsubChats = subscribeChats(user.uid, (chats) => {
      let totalUnread = 0;
      chats.forEach(c => {
        totalUnread += c.unreadCount?.[user.uid] || 0;
      });
      setUnreadMessagesCount(totalUnread);
    });

    const unsubReqs = subscribeRequests(user.uid, activeRole, (reqs) => {
      if (activeRole === 'room_owner') {
        const pending = reqs.filter(r => r.status === 'pending');
        setPendingRequestsCount(pending.length);
      } else {
        const acceptedOrPending = reqs.filter(r => r.status === 'accepted' || r.status === 'pending');
        setPendingRequestsCount(acceptedOrPending.length);
      }
    });

    return () => {
      unsubChats();
      unsubReqs();
    };
  }, [user, activeRole]);

  const loginAsDemoUser = (uid: string) => {
    const usersList = JSON.parse(localStorage.getItem("roomify_users_v2") || JSON.stringify(INITIAL_USERS)) as User[];
    const target = usersList.find(u => u.uid === uid);
    if (target) {
      setUser(target);
      setActiveRole(target.role);
    }
  };

  const customLoginOrSignup = async (phoneOrEmail: string, name: string, role: 'room_owner' | 'room_seeker', city: string): Promise<User> => {
    const newUser: User = {
      uid: "user-" + Date.now().toString(36),
      name: name.trim() || (role === 'room_owner' ? 'Proud Room Owner' : 'New Seeker'),
      email: phoneOrEmail.includes('@') ? phoneOrEmail : `user${Date.now().toString().slice(-4)}@roomify.app`,
      phone: phoneOrEmail.includes('@') ? '+91 98000 00000' : phoneOrEmail,
      role,
      photoURL: `https://images.unsplash.com/photo-${role === 'room_owner' ? '1507003211169-0a1dd7228f2d' : '1534528741775-53994a69daeb'}?auto=format&fit=crop&w=250&q=80`,
      city: city || 'Delhi',
      createdAt: new Date().toISOString()
    };
    await saveUser(newUser);
    setUser(newUser);
    setActiveRole(role);
    return newUser;
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = async (newRole: 'room_owner' | 'room_seeker') => {
    if (!user) return;
    setActiveRole(newRole);
    const updated: User = { ...user, role: newRole };
    setUser(updated);
    await saveUser(updated);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      activeRole,
      loginAsDemoUser,
      customLoginOrSignup,
      logout,
      switchRole,
      unreadMessagesCount,
      pendingRequestsCount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};