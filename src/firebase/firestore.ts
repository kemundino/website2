import { db } from './config';
import { 
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs,
  query, where, orderBy, onSnapshot, serverTimestamp
} from 'firebase/firestore';

// Generic Firestore service functions
export class FirestoreService {
  // Create a new document
  static async create(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating document:', error);
      return { success: false, error };
    }
  }

  // Update a document
  static async update(collectionName: string, docId: string, data: any) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating document:', error);
      return { success: false, error };
    }
  }

  // Delete a document
  static async delete(collectionName: string, docId: string) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { success: false, error };
    }
  }

  // Get a single document
  static async getOne(collectionName: string, docId: string) {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: 'Document not found' };
      }
    } catch (error) {
      console.error('Error getting document:', error);
      return { success: false, error };
    }
  }

  // Get all documents from a collection
  static async getAll(collectionName: string) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data: documents };
    } catch (error) {
      console.error('Error getting documents:', error);
      return { success: false, error };
    }
  }

  // Query documents with filters
  static async query(collectionName: string, constraints: any[]) {
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data: documents };
    } catch (error) {
      console.error('Error querying documents:', error);
      return { success: false, error };
    }
  }

  // Real-time listener for a collection
  static subscribe(collectionName: string, callback: (data: any[]) => void, constraints: any[] = []) {
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const documents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(documents);
      });
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up subscription:', error);
      return () => {};
    }
  }

  // Real-time listener for a single document
  static subscribeToDoc(collectionName: string, docId: string, callback: (data: any) => void) {
    try {
      const docRef = doc(db, collectionName, docId);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          callback({ id: docSnap.id, ...docSnap.data() });
        } else {
          callback(null);
        }
      });
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up document subscription:', error);
      return () => {};
    }
  }
}

// Specific service functions for different collections
export const OrderService = {
  create: (orderData: any) => FirestoreService.create('orders', orderData),
  update: (orderId: string, orderData: any) => FirestoreService.update('orders', orderId, orderData),
  delete: (orderId: string) => FirestoreService.delete('orders', orderId),
  getOne: (orderId: string) => FirestoreService.getOne('orders', orderId),
  getAll: () => FirestoreService.getAll('orders'),
  getByCustomer: (customerName: string) => 
    FirestoreService.query('orders', [where('customerName', '==', customerName), orderBy('createdAt', 'desc')]),
  subscribe: (callback: (data: any[]) => void) => 
    FirestoreService.subscribe('orders', callback, [orderBy('createdAt', 'desc')])
};

export const MenuService = {
  create: (itemData: any) => FirestoreService.create('menu', itemData),
  update: (itemId: string, itemData: any) => FirestoreService.update('menu', itemId, itemData),
  delete: (itemId: string) => FirestoreService.delete('menu', itemId),
  getOne: (itemId: string) => FirestoreService.getOne('menu', itemId),
  getAll: () => FirestoreService.getAll('menu'),
  getByTag: (tag: string) => 
    FirestoreService.query('menu', [where('tag', '==', tag), orderBy('name')]),
  subscribe: (callback: (data: any[]) => void) => 
    FirestoreService.subscribe('menu', callback, [orderBy('name')])
};

export const UserService = {
  create: (userData: any) => FirestoreService.create('users', userData),
  update: (userId: string, userData: any) => FirestoreService.update('users', userId, userData),
  getOne: (userId: string) => FirestoreService.getOne('users', userId),
  getByEmail: (email: string) => 
    FirestoreService.query('users', [where('email', '==', email)]),
  subscribe: (callback: (data: any[]) => void) => 
    FirestoreService.subscribe('users', callback)
};

export const FeedbackService = {
  create: (feedbackData: any) => FirestoreService.create('feedback', feedbackData),
  getAll: () => FirestoreService.getAll('feedback'),
  getByItem: (itemId: string) => 
    FirestoreService.query('feedback', [where('itemId', '==', itemId), orderBy('createdAt', 'desc')]),
  subscribe: (callback: (data: any[]) => void) => 
    FirestoreService.subscribe('feedback', callback, [orderBy('createdAt', 'desc')])
};

export const TableService = {
  create: (tableData: any) => FirestoreService.create('tables', tableData),
  update: (tableId: string, tableData: any) => FirestoreService.update('tables', tableId, tableData),
  delete: (tableId: string) => FirestoreService.delete('tables', tableId),
  getAll: () => FirestoreService.getAll('tables'),
  subscribe: (callback: (data: any[]) => void) => 
    FirestoreService.subscribe('tables', callback, [orderBy('number')])
};

export const ReservationService = {
  create: (reservationData: any) => FirestoreService.create('reservations', reservationData),
  update: (reservationId: string, reservationData: any) => FirestoreService.update('reservations', reservationId, reservationData),
  delete: (reservationId: string) => FirestoreService.delete('reservations', reservationId),
  getAll: () => FirestoreService.getAll('reservations'),
  getByDate: (date: string) => 
    FirestoreService.query('reservations', [where('reservationDate', '==', date), orderBy('reservationTime')]),
  subscribe: (callback: (data: any[]) => void) => 
    FirestoreService.subscribe('reservations', callback, [orderBy('reservationDate', 'desc'), orderBy('reservationTime')])
};

export const StaffService = {
  create: (staffData: any) => FirestoreService.create('staff', staffData),
  update: (staffId: string, staffData: any) => FirestoreService.update('staff', staffId, staffData),
  delete: (staffId: string) => FirestoreService.delete('staff', staffId),
  getAll: () => FirestoreService.getAll('staff'),
  getByRole: (role: string) => 
    FirestoreService.query('staff', [where('role', '==', role), orderBy('lastName')]),
  subscribe: (callback: (data: any[]) => void) => 
    FirestoreService.subscribe('staff', callback, [orderBy('lastName', 'asc'), orderBy('firstName', 'asc')])
};

export default FirestoreService;
