export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'room_owner' | 'room_seeker';
  photoURL: string;
  city: string;
  createdAt: string;
}

export interface Room {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerPhoto: string;
  title: string;
  locationText: string;
  wardNo: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  coordinates: { lat: number; lng: number };
  rent: number;
  rentType: 'month' | 'day';
  securityDeposit: number;
  type: 'Single Room' | 'Shared Room' | 'Family Apartment' | 'PG / Hostel';
  genderPref: 'Anyone' | 'Boys Only' | 'Girls Only' | 'Family Only';
  amenities: string[];
  photosURLs: string[];
  available: boolean;
  description: string;
  createdAt: string;
}

export interface RentalRequest {
  id: string;
  roomId: string;
  roomTitle: string;
  roomCity: string;
  roomWard: string;
  roomRent: number;
  roomPhoto: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  seekerId: string;
  seekerName: string;
  seekerPhone: string;
  seekerEmail: string;
  seekerPhoto: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  chatId?: string;
}

export interface Chat {
  id: string;
  roomId: string;
  roomTitle: string;
  participants: string[]; // [ownerId, seekerId]
  ownerId: string;
  seekerId: string;
  ownerName: string;
  seekerName: string;
  ownerPhoto: string;
  seekerPhoto: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: Record<string, number>;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export const INITIAL_USERS: User[] = [
  {
    uid: 'user-ramesh',
    name: 'Ramesh Sharma',
    email: 'ramesh.delhi@roomify.test',
    phone: '+91 98110 12345',
    role: 'room_owner',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    city: 'Delhi',
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    uid: 'user-suresh',
    name: 'Suresh Kumar',
    email: 'suresh.seeker@roomify.test',
    phone: '+91 98765 67890',
    role: 'room_seeker',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    city: 'Delhi',
    createdAt: '2026-01-15T11:30:00Z',
  },
  {
    uid: 'user-ananya',
    name: 'Ananya Reddy',
    email: 'ananya.blr@roomify.test',
    phone: '+91 99450 98765',
    role: 'room_owner',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    city: 'Bengaluru',
    createdAt: '2026-02-01T09:15:00Z',
  },
  {
    uid: 'user-vikram',
    name: 'Vikram Malhotra',
    email: 'vikram.mum@roomify.test',
    phone: '+91 98200 54321',
    role: 'room_owner',
    photoURL: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80',
    city: 'Mumbai',
    createdAt: '2026-02-10T14:20:00Z',
  }
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-delhi-1',
    ownerId: 'user-ramesh',
    ownerName: 'Ramesh Sharma',
    ownerPhone: '+91 98110 12345',
    ownerEmail: 'ramesh.delhi@roomify.test',
    ownerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    title: 'Premium Independent Single Room for Students',
    locationText: 'Hudson Lane, GTB Nagar near Metro Gate 3',
    wardNo: 'Ward 12',
    city: 'Delhi',
    state: 'Delhi NCT',
    pincode: '110009',
    landmark: 'Opposite DU North Campus Gate',
    coordinates: { lat: 28.6985, lng: 77.2029 },
    rent: 5000,
    rentType: 'month',
    securityDeposit: 5000,
    type: 'Single Room',
    genderPref: 'Anyone',
    amenities: ['WiFi', 'AC', 'Attached Bath', 'Power Backup', 'Study Table', 'RO Water'],
    photosURLs: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
    ],
    available: true,
    description: 'Perfect for UPSC & SSC aspirants or DU students. Super quiet environment with lightning fast 100Mbps fiber internet. No timing restrictions. Delicious tiffin service available next door.',
    createdAt: '2026-02-10T08:00:00Z'
  },
  {
    id: 'room-delhi-2',
    ownerId: 'user-ramesh',
    ownerName: 'Ramesh Sharma',
    ownerPhone: '+91 98110 12345',
    ownerEmail: 'ramesh.delhi@roomify.test',
    ownerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    title: 'Comfortable Twin Shared Room with Balcony',
    locationText: 'Mukherjee Nagar, Outram Lines',
    wardNo: 'Ward 12',
    city: 'Delhi',
    state: 'Delhi NCT',
    pincode: '110009',
    landmark: 'Near Batra Cinema Circle',
    coordinates: { lat: 28.7112, lng: 77.2155 },
    rent: 3800,
    rentType: 'month',
    securityDeposit: 3800,
    type: 'Shared Room',
    genderPref: 'Boys Only',
    amenities: ['WiFi', 'Attached Bath', 'Balcony', 'Geyser', 'Washing Machine', 'Two Wheeler Parking'],
    photosURLs: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
    ],
    available: true,
    description: 'Looking for one male flatmate/roommate to share a very airy bedroom. Fully ventilated with a huge private balcony overlooking the green park. 24x7 water and CCTV security.',
    createdAt: '2026-02-12T10:30:00Z'
  },
  {
    id: 'room-blr-1',
    ownerId: 'user-ananya',
    ownerName: 'Ananya Reddy',
    ownerPhone: '+91 99450 98765',
    ownerEmail: 'ananya.blr@roomify.test',
    ownerPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    title: 'Luxury Fully Furnished 1 BHK Studio Suite',
    locationText: 'Koramangala 4th Block, 80ft Road',
    wardNo: 'Ward 152',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560034',
    landmark: 'Near Sony World Signal',
    coordinates: { lat: 12.9345, lng: 77.6261 },
    rent: 14500,
    rentType: 'month',
    securityDeposit: 25000,
    type: 'Family Apartment',
    genderPref: 'Anyone',
    amenities: ['WiFi', 'AC', 'Kitchen', 'Fridge', 'Power Backup', 'Gym', 'Car Parking', 'Smart TV'],
    photosURLs: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80'
    ],
    available: true,
    description: 'An exquisite high-end studio suite designed for IT professionals and young couples. Includes complete modular kitchen, induction cooktop, premium king mattress, and dedicated covered parking.',
    createdAt: '2026-02-14T11:00:00Z'
  },
  {
    id: 'room-blr-2',
    ownerId: 'user-ananya',
    ownerName: 'Ananya Reddy',
    ownerPhone: '+91 99450 98765',
    ownerEmail: 'ananya.blr@roomify.test',
    ownerPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    title: 'Elite Executive Girls PG - Triple Sharing',
    locationText: 'HSR Layout Sector 2',
    wardNo: 'Ward 174',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560102',
    landmark: 'Behind NIFT Campus',
    coordinates: { lat: 12.9141, lng: 77.6411 },
    rent: 6500,
    rentType: 'month',
    securityDeposit: 6500,
    type: 'PG / Hostel',
    genderPref: 'Girls Only',
    amenities: ['WiFi', 'Attached Bath', 'Power Backup', 'Washing Machine', 'CCTV Security', 'Meals Included'],
    photosURLs: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'
    ],
    available: true,
    description: 'Top-rated girls accommodation with 3 delicious hygienic meals per day, biometric automated entry, housekeeping, and vibrant lounge area for socializing and remote work.',
    createdAt: '2026-02-15T09:30:00Z'
  },
  {
    id: 'room-mum-1',
    ownerId: 'user-vikram',
    ownerName: 'Vikram Malhotra',
    ownerPhone: '+91 98200 54321',
    ownerEmail: 'vikram.mum@roomify.test',
    ownerPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80',
    title: 'Modern Single Room near Metro Station',
    locationText: 'Andheri West, JP Road',
    wardNo: 'Ward K/W',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400058',
    landmark: 'Next to DN Nagar Metro Station',
    coordinates: { lat: 19.1244, lng: 72.8311 },
    rent: 11000,
    rentType: 'month',
    securityDeposit: 20000,
    type: 'Single Room',
    genderPref: 'Anyone',
    amenities: ['WiFi', 'AC', 'Attached Bath', 'Elevator', 'Security Guard', 'Microwave'],
    photosURLs: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
    ],
    available: true,
    description: 'Prime Mumbai location. Literally 2 minutes walk to the Metro and Kokilaben Hospital. Brand new split AC installed. Highly supportive flatmates in a gated society.',
    createdAt: '2026-02-18T16:00:00Z'
  },
  {
    id: 'room-delhi-3',
    ownerId: 'user-ramesh',
    ownerName: 'Ramesh Sharma',
    ownerPhone: '+91 98110 12345',
    ownerEmail: 'ramesh.delhi@roomify.test',
    ownerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    title: 'Peaceful Ground Floor PG Room for Girls',
    locationText: 'Kamla Nagar Market, Block F',
    wardNo: 'Ward 11',
    city: 'Delhi',
    state: 'Delhi NCT',
    pincode: '110007',
    landmark: 'Near Spark Mall',
    coordinates: { lat: 28.6811, lng: 77.2014 },
    rent: 6200,
    rentType: 'month',
    securityDeposit: 6200,
    type: 'PG / Hostel',
    genderPref: 'Girls Only',
    amenities: ['WiFi', 'AC', 'Attached Bath', 'Power Backup', 'CCTV Security', 'RO Water'],
    photosURLs: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
    ],
    available: true,
    description: 'Extremely secure girls PG located right in the bustling heart of Kamla Nagar. Female warden on premises 24x7. Biometric gate attendance. High speed study Wi-Fi.',
    createdAt: '2026-02-19T10:00:00Z'
  },
  {
    id: 'room-pune-1',
    ownerId: 'user-ramesh', // lets assign one more to Ramesh or Vikram
    ownerName: 'Vikram Malhotra',
    ownerPhone: '+91 98200 54321',
    ownerEmail: 'vikram.mum@roomify.test',
    ownerPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80',
    title: 'Breezy IT Hub Shared Apartment',
    locationText: 'Viman Nagar, Datta Mandir Road',
    wardNo: 'Ward 3',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411014',
    landmark: 'Near Phoenix Marketcity Mall',
    coordinates: { lat: 18.5679, lng: 73.9143 },
    rent: 4500,
    rentType: 'month',
    securityDeposit: 8000,
    type: 'Shared Room',
    genderPref: 'Anyone',
    amenities: ['WiFi', 'Balcony', 'Kitchen', 'Washing Machine', 'Car Parking', 'Geyser'],
    photosURLs: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
    ],
    available: true,
    description: 'Looking for friendly IT folks or college students to share a spacious 3 BHK. Gorgeous mountain breeze in the mornings. Fully operational kitchen with maid service.',
    createdAt: '2026-02-20T12:00:00Z'
  }
];

export const INITIAL_REQUESTS: RentalRequest[] = [
  {
    id: 'req-1',
    roomId: 'room-delhi-1',
    roomTitle: 'Premium Independent Single Room for Students',
    roomCity: 'Delhi',
    roomWard: 'Ward 12',
    roomRent: 5000,
    roomPhoto: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    ownerId: 'user-ramesh',
    ownerName: 'Ramesh Sharma',
    ownerPhone: '+91 98110 12345',
    ownerEmail: 'ramesh.delhi@roomify.test',
    seekerId: 'user-suresh',
    seekerName: 'Suresh Kumar',
    seekerPhone: '+91 98765 67890',
    seekerEmail: 'suresh.seeker@roomify.test',
    seekerPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    message: 'Hello Ramesh ji! I am Suresh from Rajasthan. I am preparing for SSC CGL at Mukherjee Nagar and want to rent this room immediately from 1st of next month.',
    status: 'accepted',
    createdAt: '2026-02-15T14:00:00Z',
    chatId: 'chat-ramesh-suresh'
  },
  {
    id: 'req-2',
    roomId: 'room-delhi-2',
    roomTitle: 'Comfortable Twin Shared Room with Balcony',
    roomCity: 'Delhi',
    roomWard: 'Ward 12',
    roomRent: 3800,
    roomPhoto: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    ownerId: 'user-ramesh',
    ownerName: 'Ramesh Sharma',
    ownerPhone: '+91 98110 12345',
    ownerEmail: 'ramesh.delhi@roomify.test',
    seekerId: 'user-suresh',
    seekerName: 'Suresh Kumar',
    seekerPhone: '+91 98765 67890',
    seekerEmail: 'suresh.seeker@roomify.test',
    seekerPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    message: 'Namaste! Is this shared room available for a quiet non-smoking student? Would love to visit tomorrow evening.',
    status: 'pending',
    createdAt: '2026-02-21T09:00:00Z',
  }
];

export const INITIAL_CHATS: Chat[] = [
  {
    id: 'chat-ramesh-suresh',
    roomId: 'room-delhi-1',
    roomTitle: 'Premium Independent Single Room for Students',
    participants: ['user-ramesh', 'user-suresh'],
    ownerId: 'user-ramesh',
    seekerId: 'user-suresh',
    ownerName: 'Ramesh Sharma',
    seekerName: 'Suresh Kumar',
    ownerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    seekerPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    lastMessage: 'Sure Suresh ji, I have locked the booking for you. See you tomorrow at 10 AM at Gate 3.',
    lastMessageTime: '2026-02-21T18:45:00Z',
    unreadCount: { 'user-suresh': 1, 'user-ramesh': 0 }
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    chatId: 'chat-ramesh-suresh',
    senderId: 'user-suresh',
    senderName: 'Suresh Kumar',
    text: 'Hello Ramesh ji! Thank you for accepting my rental request. I am extremely interested in your Hudson Lane single room.',
    timestamp: '2026-02-15T14:05:00Z'
  },
  {
    id: 'msg-2',
    chatId: 'chat-ramesh-suresh',
    senderId: 'user-ramesh',
    senderName: 'Ramesh Sharma',
    text: 'Welcome Suresh! Happy to have a serious aspirant. When would you like to come over for a quick walk through and verification?',
    timestamp: '2026-02-15T14:15:00Z'
  },
  {
    id: 'msg-3',
    chatId: 'chat-ramesh-suresh',
    senderId: 'user-suresh',
    senderName: 'Suresh Kumar',
    text: 'Can I visit tomorrow morning around 10 AM? I will also bring my Aadhar card and security deposit token.',
    timestamp: '2026-02-21T18:40:00Z'
  },
  {
    id: 'msg-4',
    chatId: 'chat-ramesh-suresh',
    senderId: 'user-ramesh',
    senderName: 'Ramesh Sharma',
    text: 'Sure Suresh ji, I have locked the booking for you. See you tomorrow at 10 AM at Gate 3.',
    timestamp: '2026-02-21T18:45:00Z'
  }
];

export const ROOM_TYPE_OPTIONS = ['Single Room', 'Shared Room', 'Family Apartment', 'PG / Hostel'] as const;
export const GENDER_OPTIONS = ['Anyone', 'Boys Only', 'Girls Only', 'Family Only'] as const;

export const POPULAR_CITIES = [
  { name: 'Delhi', roomsCount: 14, states: 'Delhi NCT', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80' },
  { name: 'Bengaluru', roomsCount: 22, states: 'Karnataka', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80' },
  { name: 'Mumbai', roomsCount: 19, states: 'Maharashtra', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=400&q=80' },
  { name: 'Pune', roomsCount: 16, states: 'Maharashtra', image: 'https://images.unsplash.com/photo-1627483262112-039e9a0a0d16?auto=format&fit=crop&w=400&q=80' },
  { name: 'Noida', roomsCount: 11, states: 'Uttar Pradesh', image: 'https://images.unsplash.com/photo-1617854818583-09e7f077a156?auto=format&fit=crop&w=400&q=80' },
  { name: 'Kota', roomsCount: 28, states: 'Rajasthan', image: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=400&q=80' }
];

export const ALL_AMENITIES_LIST = [
  { id: 'WiFi', label: 'High-Speed Wi-Fi', icon: '📶' },
  { id: 'AC', label: 'Air Conditioner', icon: '❄️' },
  { id: 'Attached Bath', label: 'Attached Washroom', icon: '🚿' },
  { id: 'Power Backup', label: '24/7 Power Backup', icon: '⚡' },
  { id: 'Kitchen', label: 'Modular Kitchen', icon: '🍳' },
  { id: 'Balcony', label: 'Private Balcony', icon: '🌅' },
  { id: 'RO Water', label: 'RO Purified Water', icon: '💧' },
  { id: 'Car Parking', label: 'Car Parking', icon: '🚗' },
  { id: 'Two Wheeler Parking', label: 'Two Wheeler Parking', icon: '🛵' },
  { id: 'Study Table', label: 'Study Table & Chair', icon: '📚' },
  { id: 'Washing Machine', label: 'Washing Machine', icon: '🧺' },
  { id: 'Geyser', label: 'Hot Water Geyser', icon: '♨️' },
  { id: 'CCTV Security', label: 'CCTV Security', icon: '🛡️' },
  { id: 'Meals Included', label: 'Meals Included (Tiffin)', icon: '🍱' },
  { id: 'Elevator', label: 'Elevator / Lift', icon: '🛗' },
  { id: 'Fridge', label: 'Refrigerator', icon: '🧊' }
];

export const DEMO_PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
];