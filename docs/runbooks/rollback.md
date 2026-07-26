# Rollback — public-safe summary

**Last verified: 2026-07-25**

> **The operational procedure is not published here.** This page previously
> carried `ssh … "sudo kubectl rollout undo …"`, a host-side `git checkout HEAD~1`
> of an application repo, and a call to a build script on the server. Removed
> 2026-07-25 — break-glass commands are Lane A, and the host-build flow does not
> exist.

## What is public: how a deploy actually reaches production

Understanding this is what makes rollback comprehensible.

1. Push to `main` triggers CI, which builds the container image.
2. The image is pushed to GHCR.
3. The image is signed with cosign keyless (Sigstore Fulcio/Rekor OIDC).
4. CI runs `kustomize edit set image` to pin the new digest.
5. CI commits the updated `kustomization.yaml` back to the app repo.
6. ArgoCD observes that commit and syncs.
7. An optional lifecycle-event callback is posted to the Enclii control plane.

*Source: `internal-devops/ecosystem/deployment-conventions.md` (steps 1–5) and
`internal-devops/roadmaps/2026-07-07-tulana-ecosystem-session-handoff.md`
(cosign step, verified end-to-end 2026-07-07).*

**Nothing pushes to the cluster. ArgoCD pulls.** Every ArgoCD Application
manifest in the platform repo sets `syncPolicy.automated` with `prune: true`
and `selfHeal: true`
(*verified by reading the manifests directly, 2026-04-24*).

## What that means for rolling back

- The durable rollback is **a git operation on the app repo** — revert the
  digest pin, let ArgoCD reconcile. A live `kubectl rollout undo` will be
  reverted by `selfHeal`, so it is a stop-gap at best and must be followed by
  the commit.
- The supported operator surface is `enclii ops apps` (sync / diff / rollback).
- Verify by health endpoint and by confirming the running digest matches the
  digest in `kustomization.yaml` at the reverted commit.

## Honest caveat on pipeline health

"The pipeline works" is a per-service claim here, not a fleet-wide one. It was
proven end-to-end (build → GHCR → cosign → digest pin → ArgoCD) for three named
platform services on **2026-07-07**. The Q2 stability retrospective separately
records auto-digest restoration as "not assessed" across the fleet. If you are
about to rely on an automatic digest pin for a specific repo, check the most
recent digest commit on that repo's production `kustomization.yaml` first.

*Sources: `internal-devops/roadmaps/2026-07-07-tulana-ecosystem-session-handoff.md`
§2; `internal-devops/roadmaps/2026-q2-stability-remediation.md`.*

## Canonical private sources

- `internal-devops/ecosystem/deployment-conventions.md`
- `internal-devops/runbooks/` for per-service rollback history
