import { UserModel, TripModel } from './mongooseModels.js';
import { getIsMongoConnected } from '../config/db.js';

// In-memory fallback stores
const memoryUsers = new Map();
const memoryTrips = new Map();

export const UserStore = {
  async findByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    if (getIsMongoConnected()) {
      try {
        const doc = await UserModel.findOne({ email: cleanEmail }).lean();
        if (doc) {
          return {
            id: doc._id.toString(),
            name: doc.name,
            email: doc.email,
            passwordHash: doc.passwordHash,
            preferences: doc.preferences,
            createdAt: doc.createdAt,
          };
        }
        return null;
      } catch (err) {
        console.error('[UserStore] Mongo findByEmail error, falling back to memory:', err);
      }
    }

    for (const user of memoryUsers.values()) {
      if (user.email.toLowerCase() === cleanEmail) {
        return { ...user };
      }
    }
    return null;
  },

  async findById(id) {
    if (getIsMongoConnected()) {
      try {
        const doc = await UserModel.findById(id).lean();
        if (doc) {
          return {
            id: doc._id.toString(),
            name: doc.name,
            email: doc.email,
            passwordHash: doc.passwordHash,
            preferences: doc.preferences,
            createdAt: doc.createdAt,
          };
        }
        return null;
      } catch (err) {
        console.error('[UserStore] Mongo findById error, falling back to memory:', err);
      }
    }

    const user = memoryUsers.get(id);
    return user ? { ...user } : null;
  },

  async create(userData) {
    const cleanEmail = userData.email.toLowerCase().trim();
    if (getIsMongoConnected()) {
      try {
        const doc = await UserModel.create({
          ...userData,
          email: cleanEmail,
        });
        return {
          id: doc._id.toString(),
          name: doc.name,
          email: doc.email,
          passwordHash: doc.passwordHash,
          preferences: doc.preferences,
          createdAt: doc.createdAt,
        };
      } catch (err) {
        console.error('[UserStore] Mongo create error, falling back to memory:', err);
      }
    }

    const id = 'usr_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    const newUser = {
      id,
      name: userData.name,
      email: cleanEmail,
      passwordHash: userData.passwordHash,
      preferences: userData.preferences || { defaultCurrency: 'INR', preferredTravelStyle: 'budget' },
      createdAt: new Date(),
    };
    memoryUsers.set(id, newUser);
    return { ...newUser };
  },
};

export const TripStore = {
  async create(tripData) {
    if (getIsMongoConnected()) {
      try {
        const doc = await TripModel.create(tripData);
        return {
          id: doc._id.toString(),
          ...doc.toObject(),
        };
      } catch (err) {
        console.error('[TripStore] Mongo create error, falling back to memory:', err);
      }
    }

    const id = 'trp_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    const now = new Date().toISOString();
    const newTrip = {
      ...tripData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    memoryTrips.set(id, newTrip);
    return { ...newTrip };
  },

  async findByUser(userId) {
    if (getIsMongoConnected()) {
      try {
        const docs = await TripModel.find({ userId }).sort({ updatedAt: -1 }).lean();
        return docs.map((doc) => ({
          id: doc._id.toString(),
          ...doc,
        }));
      } catch (err) {
        console.error('[TripStore] Mongo findByUser error, falling back to memory:', err);
      }
    }

    const userTrips = [];
    for (const trip of memoryTrips.values()) {
      if (trip.userId === userId) {
        userTrips.push({ ...trip });
      }
    }
    return userTrips.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  },

  async findById(id) {
    if (getIsMongoConnected()) {
      try {
        const doc = await TripModel.findById(id).lean();
        if (doc) {
          return {
            id: doc._id.toString(),
            ...doc,
          };
        }
        return null;
      } catch (err) {
        console.error('[TripStore] Mongo findById error, falling back to memory:', err);
      }
    }

    const trip = memoryTrips.get(id);
    return trip ? { ...trip } : null;
  },

  async update(id, updateData) {
    if (getIsMongoConnected()) {
      try {
        const doc = await TripModel.findByIdAndUpdate(
          id,
          { ...updateData, updatedAt: new Date() },
          { new: true }
        ).lean();
        if (doc) {
          return {
            id: doc._id.toString(),
            ...doc,
          };
        }
        return null;
      } catch (err) {
        console.error('[TripStore] Mongo update error, falling back to memory:', err);
      }
    }

    const existing = memoryTrips.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    memoryTrips.set(id, updated);
    return { ...updated };
  },

  async delete(id) {
    if (getIsMongoConnected()) {
      try {
        const res = await TripModel.findByIdAndDelete(id);
        return !!res;
      } catch (err) {
        console.error('[TripStore] Mongo delete error, falling back to memory:', err);
      }
    }

    return memoryTrips.delete(id);
  },
};
