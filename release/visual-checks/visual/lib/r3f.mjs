export function validateR3FSnapshot(snapshot, expectations = {}) {
  if (!snapshot || typeof snapshot !== 'object') throw new Error('scene probe returned no snapshot');
  if (!Array.isArray(snapshot.objectNames) || !Number.isInteger(snapshot.objectCount) || !snapshot.camera) {
    throw new Error('scene probe returned an invalid snapshot');
  }
  for (const name of expectations.requiredObjects || []) {
    if (!snapshot.objectNames.includes(name)) throw new Error(`missing required R3F object: ${name}`);
  }
  if (expectations.minObjectCount !== undefined && snapshot.objectCount < expectations.minObjectCount) {
    throw new Error(`R3F object count ${snapshot.objectCount} is below ${expectations.minObjectCount}`);
  }
  if (expectations.cameraType && snapshot.camera.type !== expectations.cameraType) {
    throw new Error(`R3F camera type ${snapshot.camera.type} does not match ${expectations.cameraType}`);
  }
}
