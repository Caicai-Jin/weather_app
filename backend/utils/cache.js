// backend/utils/cache.js
// Simple in-memory cache: key -> { value, expiresAt }

const store = new Map();

function getCache(key) {
  const item = store.get(key);
  if (!item) return null;

  if (Date.now() > item.expiresAt) {
    store.delete(key);
    return null;
  }
  return item.value;
}

function setCache(key, value, ttlMs) {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });
}

module.exports = { getCache, setCache };
