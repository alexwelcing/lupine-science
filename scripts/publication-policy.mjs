// Publication is an explicit editorial decision. Unknown, missing, draft, and
// review-only states fail closed. Released labels may carry a descriptive
// suffix after a separator, but any contradictory editorial qualifier wins.
const RELEASED_STATUS = /^(?:published|final|reviewed|verified|live(?:\s+evidence)?)(?:\s*(?:—|-|:)\s*.+)?$/i;
const EDITORIAL_HOLD = /\b(?:draft|for editor review|not for citation|pending review|in review|needs verification|unverified)\b/i;

export function isReleasedStatus(status) {
  if (typeof status !== 'string') return false;
  const normalized = status.trim();
  return !EDITORIAL_HOLD.test(normalized) && RELEASED_STATUS.test(normalized);
}