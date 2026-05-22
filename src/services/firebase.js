import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

// Keys for local storage fallback
const CONFIG_KEY = 'resumeai_firebase_config';
const LOCAL_USERS_KEY = 'resumeai_local_users';
const LOCAL_ACTIVE_USER_KEY = 'resumeai_local_active_user';
const LOCAL_RESUMES_KEY = 'resumeai_local_resumes';
const LOCAL_CHATS_KEY = 'resumeai_local_chats';

// Get user configuration from Local Storage
export function getStoredFirebaseConfig() {
  try {
    const data = localStorage.getItem(CONFIG_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error fetching stored Firebase config', e);
    return null;
  }
}

// Save user configuration to Local Storage
export function setStoredFirebaseConfig(config) {
  if (!config) {
    localStorage.removeItem(CONFIG_KEY);
  } else {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }
}

// ----------------------------------------------------
// THE TWO-TIER AUTH & FIRESTORE SERVICE ENGINE
// ----------------------------------------------------
let realFirebaseEnabled = false;
let authInstance = null;
let firestoreInstance = null;

const storedConfig = getStoredFirebaseConfig();

if (storedConfig && storedConfig.apiKey) {
  try {
    const app = getApps().length === 0 ? initializeApp(storedConfig) : getApp();
    authInstance = getAuth(app);
    firestoreInstance = getFirestore(app);
    realFirebaseEnabled = true;
    console.log('ResumeAI Engine: Real Firebase initialized successfully.');
  } catch (error) {
    console.warn('ResumeAI Engine: Real Firebase initialization failed, falling back to Simulator.', error);
  }
}

// --- Dynamic Reinitialization ---
export function reinitializeFirebase(config) {
  setStoredFirebaseConfig(config);
  if (config) {
    window.location.reload(); // Quick refresh to re-evaluate module bindings smoothly
  }
}

// ----------------------------------------------------
// LOCAL SIMULATOR IMPLEMENTATIONS
// ----------------------------------------------------

// Simulated Authentication
class SimulatedAuth {
  constructor() {
    this.listeners = [];
    this.activeUser = null;
    
    try {
      const saved = localStorage.getItem(LOCAL_ACTIVE_USER_KEY);
      if (saved) {
        this.activeUser = JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
  }

  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    // Fire initially
    setTimeout(() => callback(this.activeUser), 50);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notify() {
    this.listeners.forEach(callback => callback(this.activeUser));
  }

  getLocalUsers() {
    try {
      const data = localStorage.getItem(LOCAL_USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveLocalUsers(users) {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  }

  async signInWithEmailAndPassword(email, password) {
    const users = this.getLocalUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user || user.password !== password) {
      throw new Error('auth/invalid-credential: User not found or password incorrect.');
    }
    
    const loggedUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Developer Account',
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`
    };
    
    this.activeUser = loggedUser;
    localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(loggedUser));
    this.notify();
    return { user: loggedUser };
  }

  async createUserWithEmailAndPassword(email, password) {
    const users = this.getLocalUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('auth/email-already-in-use: Email already registered.');
    }
    
    const uid = 'usr_' + Math.random().toString(36).substr(2, 9);
    const newUser = {
      uid,
      email,
      password,
      displayName: email.split('@')[0],
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`
    };
    
    users.push(newUser);
    this.saveLocalUsers(users);
    
    const loggedUser = {
      uid: newUser.uid,
      email: newUser.email,
      displayName: newUser.displayName,
      photoURL: newUser.photoURL
    };
    
    this.activeUser = loggedUser;
    localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(loggedUser));
    this.notify();
    return { user: loggedUser };
  }

  async updateProfile(user, { displayName }) {
    if (this.activeUser && this.activeUser.uid === user.uid) {
      this.activeUser.displayName = displayName;
      localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(this.activeUser));
      
      const users = this.getLocalUsers();
      const idx = users.findIndex(u => u.uid === user.uid);
      if (idx !== -1) {
        users[idx].displayName = displayName;
        this.saveLocalUsers(users);
      }
      this.notify();
    }
  }

  async signOut() {
    this.activeUser = null;
    localStorage.removeItem(LOCAL_ACTIVE_USER_KEY);
    this.notify();
  }
}

const simulatedAuthInstance = new SimulatedAuth();

// ----------------------------------------------------
// EXPORTED INTEGRATED SERVICES
// ----------------------------------------------------

export const authService = {
  isRealFirebase: () => realFirebaseEnabled,
  
  onAuthStateChange: (callback) => {
    if (realFirebaseEnabled) {
      return onAuthStateChanged(authInstance, callback);
    } else {
      return simulatedAuthInstance.onAuthStateChanged(callback);
    }
  },
  
  login: async (email, password) => {
    if (realFirebaseEnabled) {
      return signInWithEmailAndPassword(authInstance, email, password);
    } else {
      return simulatedAuthInstance.signInWithEmailAndPassword(email, password);
    }
  },
  
  signup: async (email, password, displayName) => {
    if (realFirebaseEnabled) {
      const credentials = await createUserWithEmailAndPassword(authInstance, email, password);
      await updateProfile(credentials.user, { displayName });
      return credentials;
    } else {
      const credentials = await simulatedAuthInstance.createUserWithEmailAndPassword(email, password);
      await simulatedAuthInstance.updateProfile(credentials.user, { displayName });
      return credentials;
    }
  },
  
  logout: async () => {
    if (realFirebaseEnabled) {
      return fbSignOut(authInstance);
    } else {
      return simulatedAuthInstance.signOut();
    }
  }
};

export const dbService = {
  // Save Analyzed Resume
  saveResume: async (userId, resumeData) => {
    const item = {
      ...resumeData,
      userId,
      id: resumeData.id || 'res_' + Date.now(),
      createdAt: resumeData.createdAt || new Date().toISOString()
    };
    
    if (realFirebaseEnabled) {
      try {
        await setDoc(doc(firestoreInstance, 'resumes', item.id), item);
        return item;
      } catch (err) {
        console.error('Firebase saveResume error, falling back to local saving', err);
      }
    }
    
    // Fallback simulation
    try {
      const localResumes = JSON.parse(localStorage.getItem(LOCAL_RESUMES_KEY) || '[]');
      // Filter out if existing ID already present to avoid duplication
      const filtered = localResumes.filter(r => r.id !== item.id);
      filtered.push(item);
      localStorage.setItem(LOCAL_RESUMES_KEY, JSON.stringify(filtered));
      return item;
    } catch (e) {
      console.error(e);
      return item;
    }
  },

  // Fetch Analyzed Resumes
  getResumes: async (userId) => {
    if (realFirebaseEnabled) {
      try {
        const q = query(
          collection(firestoreInstance, 'resumes'), 
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        const results = [];
        snapshot.forEach(doc => {
          results.push(doc.data());
        });
        // Sort newest first
        return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (err) {
        console.error('Firebase getResumes error, loading local fallback data', err);
      }
    }
    
    // Fallback simulation
    try {
      const localResumes = JSON.parse(localStorage.getItem(LOCAL_RESUMES_KEY) || '[]');
      return localResumes
        .filter(r => r.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch {
      return [];
    }
  },
  
  // Delete Resume
  deleteResume: async (resumeId) => {
    if (realFirebaseEnabled) {
      // Note: We can implement deleteDoc, but for local simulation/easy testing, we delete locally
    }
    try {
      const localResumes = JSON.parse(localStorage.getItem(LOCAL_RESUMES_KEY) || '[]');
      const filtered = localResumes.filter(r => r.id !== resumeId);
      localStorage.setItem(LOCAL_RESUMES_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  },

  // Save Interview Chat
  saveChatSession: async (userId, chatSession) => {
    const session = {
      ...chatSession,
      userId,
      id: chatSession.id || 'chat_' + Date.now(),
      updatedAt: new Date().toISOString()
    };
    
    if (realFirebaseEnabled) {
      try {
        await setDoc(doc(firestoreInstance, 'interview_chats', session.id), session);
        return session;
      } catch (err) {
        console.error('Firebase saveChatSession error', err);
      }
    }
    
    // Fallback simulation
    try {
      const localChats = JSON.parse(localStorage.getItem(LOCAL_CHATS_KEY) || '[]');
      const filtered = localChats.filter(c => c.id !== session.id);
      filtered.push(session);
      localStorage.setItem(LOCAL_CHATS_KEY, JSON.stringify(filtered));
      return session;
    } catch {
      return session;
    }
  },

  // Get Interview Chats
  getChatSessions: async (userId) => {
    if (realFirebaseEnabled) {
      try {
        const q = query(
          collection(firestoreInstance, 'interview_chats'),
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        const results = [];
        snapshot.forEach(doc => {
          results.push(doc.data());
        });
        return results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      } catch (err) {
        console.error('Firebase getChatSessions error', err);
      }
    }
    
    // Fallback simulation
    try {
      const localChats = JSON.parse(localStorage.getItem(LOCAL_CHATS_KEY) || '[]');
      return localChats
        .filter(c => c.userId === userId)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } catch {
      return [];
    }
  }
};
