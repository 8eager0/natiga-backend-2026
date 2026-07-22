// Native IndexedDB storage wrapper to store unlimited Excel student records safely across page refreshes
const DB_NAME = 'NatigaDB';
const DB_VERSION = 1;
const STORE_NAME = 'students';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

export const saveStudentsToIDB = async (students) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(students, 'current_sheet');
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
    });
  } catch (err) {
    console.error('Failed to save to IndexedDB', err);
    return false;
  }
};

export const getStudentsFromIDB = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get('current_sheet');
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    console.error('Failed to read from IndexedDB', err);
    return [];
  }
};

export const clearStudentsIDB = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete('current_sheet');
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(true);
    });
  } catch (err) {
    console.error('Failed to clear IndexedDB', err);
    return false;
  }
};
