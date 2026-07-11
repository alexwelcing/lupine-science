# Profile skill manifest record

Verified: 2026-07-10T13:54:48-04:00

Both profiles contain the required HyperFrames skills at identical SHA-256 revisions:

| Skill | SHA-256 |
|---|---|
| hyperframes-animation | `a3cff2217f37b7a7ff82a824c480dfbf274d1e90ac0f8e69ff4c3588671ba9af` |
| hyperframes-core | `4b6a2815041fd3fd9c6c1f31195bf2e065273cbeae45abab67ffa87c6d959591` |
| hyperframes-creative | `c33245179cdfda2260f8f28cdb13bcee3d5c955c58b8bd9fc19d8a42ece437d2` |
| hyperframes-keyframes | `b0850e0e538e5b94ed03471f4e98620fe4d2863ed7b115164dda0292e83838f7` |

Updated manifests:

- `/home/alex/.hermes/profiles/director/article-video-skill-manifest.yaml`
- `/home/alex/.hermes/profiles/reviewer/article-video-skill-manifest.yaml`

During audit, the reviewer copy of `hyperframes-animation` contained two current animation-map troubleshooting rules missing from the director copy. The director copy was synchronized to that fuller revision before hashes were recorded.
