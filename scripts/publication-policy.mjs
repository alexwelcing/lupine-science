// Article publication and video-index promotion are independent policy axes.
// A public article may honestly retain a Draft label, but the video index only
// promotes work with an explicit reviewed/released status. The allowlist is
// deliberately exact: a new qualified status must be reviewed and added here,
// rather than inheriting permission from a released-looking prefix.
const PROMOTABLE_STATUSES = new Set([
  'published',
  'final',
  'reviewed',
  'verified',
  'live',
  'live evidence',
  'live evidence — every number reported is sealed as a machine-checked theorem over provenance-hashed data; kills and corrections are preserved in the record',
]);

export function isVideoIndexPromotable(status) {
  if (typeof status !== 'string') return false;
  return PROMOTABLE_STATUSES.has(status.trim().toLowerCase());
}
