# Operations

`lupine.science` is a static nginx site deployed to Cloud Run.

## Local Checks

Use Git Bash for Node commands on Windows.

```bash
npm run verify
python -m http.server 8080 -d public
```

Open:

- `http://localhost:8080/`
- `http://localhost:8080/robots.txt`
- `http://localhost:8080/sitemap.xml`
- `http://localhost:8080/llms.txt`

Container check:

```bash
docker build -t lupine-science .
docker run --rm -p 8080:8080 lupine-science
curl -fsS http://localhost:8080/health
```

## Static Verifier

`npm run verify` checks:

- required public files exist
- old `library.lupine.science` links are gone
- canonical links point to `library.lupine.site`, `lupi.live`, and the repo
- the homepage keeps conservative public paper status
- nginx exposes `GET /health -> ok`

The verifier is intentionally narrow. It does not replace reading the public
page before deploy.

## Deploy

Workflow:

```text
.github/workflows/deploy.yml
```

Required secrets:

- `GCP_PROJECT_ID`
- `GCP_REGION`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT`
- `GCP_SERVICE_NAME_SITE`

Deploy path:

1. check out repo
2. set up Node 20
3. run `npm run verify`
4. authenticate to GCP
5. build and push Docker image
6. deploy to Cloud Run
7. route traffic to latest revision
8. smoke-test homepage copy
9. report status to `glim-think` `/ops/report`

## Live Checks

Keep these truths separate:

- GitHub Actions workflow result
- Docker image push
- Cloud Run revision and traffic
- public domain content
- `glim-think` deploy report

Manual smoke:

```bash
curl -fsS https://lupine.science/health
curl -fsS https://lupine.science/robots.txt
curl -fsS https://lupine.science/sitemap.xml
curl -fsS https://lupine.science/llms.txt
```

Then open the site and verify:

- hero loads
- Library link opens `library.lupine.site`
- LUPI link opens `lupi.live`
- repository link opens the source repo
- live MLIP status either loads or degrades gracefully

## Rollback

Use Cloud Run revision traffic rather than editing the public page in a panic:

```bash
gcloud run revisions list --service=SERVICE --region=REGION
gcloud run services update-traffic SERVICE \
  --region=REGION \
  --to-revisions=REVISION=100
```

After rollback, verify `https://lupine.science/` itself, not only Cloud Run.
