import { openDB } from 'idb';

const DB_NAME = 'SofolKrishokDB';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('lands')) {
        db.createObjectStore('lands', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('tracks')) {
        db.createObjectStore('tracks', { keyPath: 'id' });
      }
    },
  });
};

export const cacheData = async (storeName, data) => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  
  if (Array.isArray(data)) {
    for (const item of data) {
      await store.put(item);
    }
  } else {
    await store.put(data);
  }
  await tx.done;
};

export const getCachedData = async (storeName) => {
  const db = await initDB();
  return db.getAll(storeName);
};
