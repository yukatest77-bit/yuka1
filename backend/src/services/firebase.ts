import admin from 'firebase-admin';
import { Pharmacy } from '../types';

class FirebaseService {
  private db: admin.database.Database;
  private initialized = false;

  constructor() {
    this.initializeApp();
    this.db = admin.database();
  }

  private initializeApp(): void {
    if (this.initialized) {
      return;
    }

    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });

      this.initialized = true;
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
      throw error;
    }
  }

  async savePharmacy(pharmacy: Pharmacy): Promise<string> {
    try {
      const pharmacyRef = this.db.ref('pharmacies').push();
      const pharmacyId = pharmacyRef.key;

      if (!pharmacyId) {
        throw new Error('Failed to generate pharmacy ID');
      }

      const pharmacyData = {
        ...pharmacy,
        id: pharmacyId,
        updatedAt: Date.now(),
      };

      await pharmacyRef.set(pharmacyData);
      return pharmacyId;
    } catch (error) {
      console.error('Error saving pharmacy:', error);
      throw error;
    }
  }

  async savePharmacies(pharmacies: Pharmacy[]): Promise<void> {
    try {
      const updates: { [key: string]: Pharmacy } = {};

      pharmacies.forEach((pharmacy) => {
        const pharmacyRef = this.db.ref('pharmacies').push();
        const pharmacyId = pharmacyRef.key;

        if (pharmacyId) {
          updates[`pharmacies/${pharmacyId}`] = {
            ...pharmacy,
            id: pharmacyId,
            updatedAt: Date.now(),
          };
        }
      });

      await this.db.ref().update(updates);
      console.log(`✅ Saved ${pharmacies.length} pharmacies to Firebase`);
    } catch (error) {
      console.error('Error saving pharmacies:', error);
      throw error;
    }
  }

  async getAllPharmacies(): Promise<Pharmacy[]> {
    try {
      const snapshot = await this.db.ref('pharmacies').once('value');
      const pharmacies: Pharmacy[] = [];

      snapshot.forEach((childSnapshot) => {
        const pharmacy = childSnapshot.val();
        pharmacies.push({
          id: childSnapshot.key || undefined,
          ...pharmacy,
        });
      });

      return pharmacies;
    } catch (error) {
      console.error('Error getting all pharmacies:', error);
      throw error;
    }
  }

  async getOpenPharmacies(): Promise<Pharmacy[]> {
    try {
      const snapshot = await this.db
        .ref('pharmacies')
        .orderByChild('isOpen')
        .equalTo(true)
        .once('value');

      const pharmacies: Pharmacy[] = [];

      snapshot.forEach((childSnapshot) => {
        const pharmacy = childSnapshot.val();
        pharmacies.push({
          id: childSnapshot.key || undefined,
          ...pharmacy,
        });
      });

      return pharmacies;
    } catch (error) {
      console.error('Error getting open pharmacies:', error);
      throw error;
    }
  }

  async getPharmacyById(id: string): Promise<Pharmacy | null> {
    try {
      const snapshot = await this.db.ref(`pharmacies/${id}`).once('value');

      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.key || undefined,
        ...snapshot.val(),
      };
    } catch (error) {
      console.error('Error getting pharmacy by ID:', error);
      throw error;
    }
  }

  async updatePharmacy(id: string, updates: Partial<Pharmacy>): Promise<void> {
    try {
      await this.db.ref(`pharmacies/${id}`).update({
        ...updates,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error updating pharmacy:', error);
      throw error;
    }
  }

  async deletePharmacy(id: string): Promise<void> {
    try {
      await this.db.ref(`pharmacies/${id}`).remove();
    } catch (error) {
      console.error('Error deleting pharmacy:', error);
      throw error;
    }
  }

  async clearAllPharmacies(): Promise<void> {
    try {
      await this.db.ref('pharmacies').remove();
      console.log('✅ Cleared all pharmacies from Firebase');
    } catch (error) {
      console.error('Error clearing pharmacies:', error);
      throw error;
    }
  }

  async updatePharmaciesOpenStatus(): Promise<void> {
    try {
      const currentDay = new Date().getDay();
      const pharmacies = await this.getAllPharmacies();

      const updates: { [key: string]: boolean | number } = {};

      pharmacies.forEach((pharmacy) => {
        if (pharmacy.id) {
          const isOpen = pharmacy.dayOfWeek === currentDay;
          updates[`pharmacies/${pharmacy.id}/isOpen`] = isOpen;
          updates[`pharmacies/${pharmacy.id}/updatedAt`] = Date.now();
        }
      });

      await this.db.ref().update(updates);
      console.log(`✅ Updated open status for ${pharmacies.length} pharmacies`);
    } catch (error) {
      console.error('Error updating pharmacies open status:', error);
      throw error;
    }
  }
}

const firebaseService = new FirebaseService();
export default firebaseService;
