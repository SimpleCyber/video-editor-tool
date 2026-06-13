export function openDB() {
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open('ClipForgeDB', 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('videos')) {
        db.createObjectStore('videos', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('clips')) {
        db.createObjectStore('clips', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveVideo(video) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('videos', 'readwrite');
    const store = tx.objectStore('videos');
    store.put(video);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteVideo(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('videos', 'readwrite');
    const store = tx.objectStore('videos');
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllVideos() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('videos', 'readonly');
    const store = tx.objectStore('videos');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Clips persistent storage
export async function saveClipToDb(clip) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('clips', 'readwrite');
    const store = tx.objectStore('clips');
    store.put(clip);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteClipFromDb(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('clips', 'readwrite');
    const store = tx.objectStore('clips');
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllClipsFromDb() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('clips', 'readonly');
    const store = tx.objectStore('clips');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
