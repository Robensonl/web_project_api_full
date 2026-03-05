/**
 * Token Revocation Service (Zero-Trust pillar: IAM)
 *
 * Maintains an in-memory blacklist of revoked JWT tokens.
 * In production this should be backed by Redis or a persistent store
 * so that the blacklist survives process restarts.
 */

const blacklist = new Set();

/**
 * Add a token (its jti or raw value) to the revocation list.
 * @param {string} token - raw JWT string
 * @param {number} [expiresAt] - Unix timestamp (seconds) when the token expires.
 *   When provided, the entry will be pruned automatically once it expires.
 */
function revokeToken(token, expiresAt) {
  blacklist.add(token);

  if (expiresAt) {
    const msUntilExpiry = expiresAt * 1000 - Date.now();
    if (msUntilExpiry > 0) {
      // Schedule automatic cleanup once the token's natural expiry passes.
      // If clearBlacklist() is called first the Set.delete() below becomes
      // a no-op, which is safe — no side-effects occur.
      setTimeout(() => blacklist.delete(token), msUntilExpiry);
    }
  }
}

/**
 * Check whether a token has been revoked.
 * @param {string} token - raw JWT string
 * @returns {boolean}
 */
function isRevoked(token) {
  return blacklist.has(token);
}

/**
 * Remove all entries from the blacklist (useful in tests).
 */
function clearBlacklist() {
  blacklist.clear();
}

/**
 * Return the current size of the blacklist (for monitoring).
 * @returns {number}
 */
function blacklistSize() {
  return blacklist.size;
}

module.exports = {
  revokeToken, isRevoked, clearBlacklist, blacklistSize,
};
