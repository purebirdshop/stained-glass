import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 21600 }); // 6 hours = 21600 seconds

export const getCache = (key) => cache.get(key);
export const setCache = (key, data, ttl = 21600) => cache.set(key, data, ttl);
