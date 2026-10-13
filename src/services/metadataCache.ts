/**
 * IndexedDB & In-Memory Metadata Caching with Request Deduplication
 * 
 * Provides fast local cache lookups before network requests and avoids
 * duplicate concurrent requests for the same item or query.
 */

import { MediaItem } from '../types/movie';

const DB_NAME = 'ehsaan_metadata_store_v1';
const DB_VERSION = 1;
const STORE_MEDIA = 'media_items';
const STORE_SEARCH = 'search_queries';
const STORE_MAPPINGS = 'id_mappings';

// Default TTLs (in milliseconds)
const MEDIA_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const SEARCH_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
}

// In-memory fallback if IndexedDB is unavailable
const memoryMediaCache = new Map<string, CacheEntry<MediaItem>>();
const memorySearchCache = new Map<string, CacheEntry<MediaItem[]>>();
const memoryIdMappings = new Map<string, string>(); // omdbKey -> imdbId

// Request deduplication cache
const inFlightRequests = new Map<string, Promise<unknown>>();

let dbPromise: Promise<IDBDatabase | null> | null = null;

function getDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }

  if (!dbPromise) {
    dbPromise = new Promise(resolve => {
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE_MEDIA)) {
            db.createObjectStore(STORE_MEDIA, { keyPath: 'key' });
          }
          if (!db.objectStoreNames.contains(STORE_SEARCH)) {
            db.createObjectStore(STORE_SEARCH, { keyPath: 'key' });
          }
          if (!db.objectStoreNames.contains(STORE_MAPPINGS)) {
            db.createObjectStore(STORE_MAPPINGS, { keyPath: 'key' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          console.warn('IndexedDB failed to open, using in-memory cache.');
          resolve(null);
        };
      } catch {
        resolve(null);
      }
    });
  }

  return dbPromise;
}

/**
 * Request Deduplication helper
 */
export function deduplicateRequest<T>(cacheKey: string, fetchFn: () => Promise<T>): Promise<T> {
  const existing = inFlightRequests.get(cacheKey);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = fetchFn()
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, promise);
  return promise;
}

/**
 * Cache a MediaItem
 */
export async function cacheMediaItem(item: MediaItem, ttl = MEDIA_CACHE_TTL): Promise<void> {
  if (!item || !item.id) return;

  const key = item.id;
  const entry: CacheEntry<MediaItem> = {
    key,
    data: item,
    timestamp: Date.now(),
    ttl,
  };

  memoryMediaCache.set(key, entry);
  if (item.id) {
    memoryMediaCache.set(`omdb-${item.type}-${item.id}`, entry);
  }
  if (item.imdbId) {
    memoryMediaCache.set(`imdb-${item.imdbId}`, entry);
  }

  const db = await getDb();
  if (!db) return;

  try {
    const tx = db.transaction(STORE_MEDIA, 'readwrite');
    const store = tx.objectStore(STORE_MEDIA);
    store.put(entry);
    if (item.id) {
      store.put({ ...entry, key: `omdb-${item.type}-${item.id}` });
    }
    if (item.imdbId) {
      store.put({ ...entry, key: `imdb-${item.imdbId}` });
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Retrieve cached MediaItem by ID, OMDb ID or IMDb ID
 */
export async function getCachedMediaItem(lookupKey: string): Promise<MediaItem | null> {
  const now = Date.now();

  // 1. Check in-memory cache first
  const mem = memoryMediaCache.get(lookupKey);
  if (mem && (now - mem.timestamp < mem.ttl)) {
    return mem.data;
  }

  // 2. Check IndexedDB
  const db = await getDb();
  if (!db) return null;

  try {
    return await new Promise<MediaItem | null>(resolve => {
      const tx = db.transaction(STORE_MEDIA, 'readonly');
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.get(lookupKey);
      req.onsuccess = () => {
        const result = req.result as CacheEntry<MediaItem> | undefined;
        if (result && (now - result.timestamp < result.ttl)) {
          memoryMediaCache.set(lookupKey, result);
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Cache search query results
 */
export async function cacheSearchResults(query: string, results: MediaItem[], ttl = SEARCH_CACHE_TTL): Promise<void> {
  const key = query.trim().toLowerCase();
  if (!key) return;

  const entry: CacheEntry<MediaItem[]> = {
    key,
    data: results,
    timestamp: Date.now(),
    ttl,
  };

  memorySearchCache.set(key, entry);

  const db = await getDb();
  if (!db) return;

  try {
    const tx = db.transaction(STORE_SEARCH, 'readwrite');
    tx.objectStore(STORE_SEARCH).put(entry);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get cached search query results
 */
export async function getCachedSearchResults(query: string): Promise<MediaItem[] | null> {
  const key = query.trim().toLowerCase();
  if (!key) return null;

  const now = Date.now();
  const mem = memorySearchCache.get(key);
  if (mem && (now - mem.timestamp < mem.ttl)) {
    return mem.data;
  }

  const db = await getDb();
  if (!db) return null;

  try {
    return await new Promise<MediaItem[] | null>(resolve => {
      const tx = db.transaction(STORE_SEARCH, 'readonly');
      const store = tx.objectStore(STORE_SEARCH);
      const req = store.get(key);
      req.onsuccess = () => {
        const result = req.result as CacheEntry<MediaItem[]> | undefined;
        if (result && (now - result.timestamp < result.ttl)) {
          memorySearchCache.set(key, result);
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Verified OMDb -> IMDb ID Mapping
 */
export async function saveVerifiedIdMapping(id: number, type: string, imdbId: string): Promise<void> {
  if (!id || !imdbId || !imdbId.startsWith('tt')) return;

  const key = `mapping_${type}_${id}`;
  memoryIdMappings.set(key, imdbId);

  const db = await getDb();
  if (!db) return;

  try {
    const tx = db.transaction(STORE_MAPPINGS, 'readwrite');
    tx.objectStore(STORE_MAPPINGS).put({ key, imdbId, updatedAt: Date.now() });
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get verified IMDb ID for a OMDb ID
 */
export async function getVerifiedImdbId(id: number, type: string): Promise<string | null> {
  const key = `mapping_${type}_${id}`;
  const mem = memoryIdMappings.get(key);
  if (mem) return mem;

  const db = await getDb();
  if (!db) return null;

  try {
    return await new Promise<string | null>(resolve => {
      const tx = db.transaction(STORE_MAPPINGS, 'readonly');
      const store = tx.objectStore(STORE_MAPPINGS);
      const req = store.get(key);
      req.onsuccess = () => {
        const result = req.result as { imdbId?: string } | undefined;
        if (result && result.imdbId) {
          memoryIdMappings.set(key, result.imdbId);
          resolve(result.imdbId);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}
