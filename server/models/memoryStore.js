/**
 * In-memory store that mimics Mongoose model API.
 * Used for local testing when MongoDB is not available.
 */

class MemoryModel {
  constructor(name) {
    this.name = name;
    this.store = new Map();
  }

  async create(doc) {
    const record = {
      ...doc,
      _id: Math.random().toString(36).slice(2),
      createdAt: new Date(),
      updatedAt: new Date(),
      save: async function () {
        return this;
      },
      toObject: function () {
        return { ...this };
      }
    };
    // Use sessionId as key if available, otherwise _id
    const key = doc.sessionId || record._id;
    this.store.set(key, record);
    return record;
  }

  async findOne(query) {
    for (const record of this.store.values()) {
      if (matchesQuery(record, query)) return record;
    }
    return null;
  }

  find() {
    const records = [...this.store.values()];
    return {
      _records: records,
      sort() { return this; },
      select() { return this; },
      async lean() { return this._records; }
    };
  }
}

function matchesQuery(record, query) {
  for (const [key, value] of Object.entries(query)) {
    const recordVal = getNestedValue(record, key);

    if (value && typeof value === "object" && !Array.isArray(value)) {
      // Handle MongoDB operators like $gt
      if ("$gt" in value && !(recordVal > value.$gt)) return false;
      if ("$lt" in value && !(recordVal < value.$lt)) return false;
    } else {
      if (String(recordVal) !== String(value)) return false;
    }
  }
  return true;
}

function getNestedValue(obj, path) {
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}

function createMemoryModels() {
  const Session = new MemoryModel("Session");
  const Submission = new MemoryModel("Submission");
  return { Session, Submission };
}

module.exports = { createMemoryModels };
