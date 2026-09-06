# GitHub-Only Development and EC2 Deployment

This project can be created and edited from GitHub without installing Node.js on the developer computer. GitHub Actions runs the install, typecheck, tests, and production build. A successful workflow deploys the built release to EC2 over SSH.

## GitHub editing workflow

Use GitHub’s web editor for small changes. For larger changes, open the repository in GitHub Codespaces. Codespaces provides the development environment inside GitHub; the local computer only needs a browser.

The production deployment workflow is located at `.github/workflows/deploy-ec2.yml`. It runs on pushes to `main` and can also be started manually with **Actions → Build and deploy to EC2 → Run workflow**.

Protect the `main` branch and require the workflow to pass before merging. Keep the repository private because customer and operations code should not be public.

## Required GitHub Actions secrets

Create these repository or production-environment secrets under **Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|---|---|
| `EC2_HOST` | EC2 Elastic IP or DNS hostname |
| `EC2_USER` | Usually the deployment account, for example `cloudops` |
| `EC2_APP_DIR` | Usually `/opt/cloud-operations-checklist` |
| `EC2_SSH_PRIVATE_KEY` | Private key matching the EC2 deployment user’s authorized key |
| `EC2_KNOWN_HOSTS` | Output from `ssh-keyscan -H YOUR_EC2_HOST` collected from a trusted network |

Do not store `MSSQL_CONNECTION_STRING`, Entra secrets, or Microsoft 365 secrets in the repository. Keep runtime secrets in `/etc/cloud-operations-checklist.env` on EC2 or in AWS Secrets Manager.

## EC2 one-time bootstrap

Run this once on a fresh Ubuntu EC2 instance using an administrator SSH session:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx curl build-essential
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo corepack enable
sudo corepack prepare pnpm@10.4.1 --activate
sudo useradd --system --create-home --shell /usr/sbin/nologin cloudops || true
sudo mkdir -p /opt/cloud-operations-checklist/releases
sudo chown -R cloudops:cloudops /opt/cloud-operations-checklist
sudo mkdir -p /etc/cloud-operations-checklist.env.d
sudo install -m 0644 deploy/cloud-operations-checklist.service /etc/systemd/system/cloud-operations-checklist.service
sudo systemctl daemon-reload
sudo systemctl enable cloud-operations-checklist
```

The GitHub Actions deploy user must be able to write to `/opt/cloud-operations-checklist` and restart the service. Prefer a narrowly scoped `sudoers` rule for the service restart rather than unrestricted sudo.

## Runtime environment on EC2

Create the runtime environment file directly on EC2:

```bash
sudo install -m 0600 /dev/null /etc/cloud-operations-checklist.env
sudo nano /etc/cloud-operations-checklist.env
```

Example:

```env
NODE_ENV=production
PORT=3000
DB_PROVIDER=mssql
MSSQL_CONNECTION_STRING=Server=YOUR_SQL_SERVER,1433;Database=CloudOperations;User Id=cloudops_app;Password=REPLACE_ME;Encrypt=true;TrustServerCertificate=false
```

Microsoft Entra ID and Microsoft 365 remain disabled until their credentials and administrator consent are intentionally added.

## Nginx

Keep Node.js listening on localhost. Do not expose port 3000 publicly. Configure Nginx to proxy HTTPS traffic to `http://127.0.0.1:3000`, then use a trusted TLS certificate for the public domain.

## Deployment behavior

Each successful GitHub Actions run creates a release directory under `/opt/cloud-operations-checklist/releases/<commit-sha>`, installs production dependencies there, points `/opt/cloud-operations-checklist/current` to the new release, and restarts the systemd service. To roll back, point `current` to the previous release directory and restart the service.

## Database boundary

The application’s MSSQL adapter is optional. The current provider boundary supports customer listing, checklist run loading and item writes, review status reads, and publication-history reads. Customer CRUD, approval/publication writes, administration settings, and directory-management writes remain on the existing managed repository until SQL Server write parity is completed and tested.

## No-local-Node workflow

The developer workflow is:

```text
GitHub web editor or Codespaces → pull request → protected main branch → GitHub Actions tests/builds → SSH release to EC2 → systemd restart
```

No `node`, `pnpm`, or local build command is required on the developer’s personal computer.
