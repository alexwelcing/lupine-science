export function assertBaselineUpdateAllowed(env = process.env) {
  if (env.VISUAL_UPDATE_BASELINES === '1' && env.VISUAL_APPROVE_BASELINES !== 'reviewed') {
    throw new Error('baseline updates require VISUAL_APPROVE_BASELINES=reviewed');
  }
}
