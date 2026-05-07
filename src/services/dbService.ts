import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { UserProfile, Transaction, Task, Memory, TransactionType, TaskPriority, TaskStatus } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const dbService = {
  // User Profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const path = `users/${userId}`;
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as UserProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async createUserProfile(profile: Omit<UserProfile, 'id' | 'createdAt'>): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("No user authenticated");
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...profile,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      // If doc doesn't exist, use setDoc/addDoc equivalent via update or just try to create
      // For user profiles, it's often better to use setDoc
      try {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'users', userId), {
          ...profile,
          createdAt: serverTimestamp(),
        });
      } catch (innerError) {
         handleFirestoreError(innerError, OperationType.WRITE, path);
      }
    }
  },

  // Transactions
  async getTransactions(userId: string): Promise<Transaction[]> {
    const path = 'transactions';
    try {
      const q = query(
        collection(db, path),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      })) as Transaction[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
    const path = 'transactions';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...transaction,
        date: Timestamp.fromDate(transaction.date),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return '';
    }
  },

  // Tasks
  async getTasks(userId: string): Promise<Task[]> {
    const path = 'tasks';
    try {
      const q = query(
        collection(db, path),
        where('userId', '==', userId),
        orderBy('dueDate', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate() || new Date(),
      })) as Task[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async addTask(task: Omit<Task, 'id'>): Promise<string> {
    const path = 'tasks';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...task,
        dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return '';
    }
  },

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    const path = `tasks/${taskId}`;
    try {
      await updateDoc(doc(db, 'tasks', taskId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Memories
  async getMemories(userId: string): Promise<Memory[]> {
    const path = 'memories';
    try {
      const q = query(
        collection(db, path),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      })) as Memory[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async addMemory(memory: Omit<Memory, 'id'>): Promise<string> {
    const path = 'memories';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...memory,
        date: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return '';
    }
  }
};
