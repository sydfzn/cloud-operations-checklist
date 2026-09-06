# Windows-only GitHub to EC2 Deployment

This workflow uses GitHub for source creation and editing, GitHub Actions for validation and deployment, and Windows Server on EC2 for runtime hosting. The developer computer does not need Node.js.

## 1. Create the GitHub repository

Create a private GitHub repository and upload the project ZIP. Confirm that these files exist:

```text
.github/workflows/deploy-windows-ec2.yml
deploy/windows-ec2-bootstrap.ps1
deploy/web.config
package.json
pnpm-lock.yaml
```

The developer can edit through GitHub’s web editor or GitHub Codespaces. Merge changes into `main` to trigger deployment.

## 2. Launch Windows EC2

Launch Windows Server 2022 or a current supported Windows Server AMI. Allocate an Elastic IP. Configure the EC2 security group as follows:

| Port | Source | Purpose |
|---:|---|---|
| 3389 | Administrator IP only, temporarily | RDP administration |
| 80 | Public | HTTP/IIS |
| 443 | Public | HTTPS/IIS |
| 3000 | Not public | Internal Node.js process |
| 1433 | Private database security group only | SQL Server |

Remove or restrict RDP after setup. Do not expose SQL Server or Node.js directly to the public internet.

## 3. Connect through RDP

Use the AWS console to download the Windows administrator password, then connect using Remote Desktop. Open **Windows PowerShell as Administrator**.

## 4. Install software on Windows Server

Install these components:

| Software | Purpose |
|---|---|
| Node.js 22 LTS | Runs the compiled application |
| Corepack/pnpm | Installs production dependencies |
| IIS | Public HTTP/HTTPS reverse proxy |
| IIS URL Rewrite | Routes requests to Node.js |
| IIS Application Request Routing | Enables reverse proxy |
| NSSM | Runs Node.js as a Windows service |
| SQL Server or SQL Server Express | Database, if self-hosted |
| SQL Server Management Studio | Database administration |

After installing Node.js, run:

```powershell
node --version
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm --version
```

Install IIS:

```powershell
Install-WindowsFeature Web-Server, Web-Mgmt-Console, Web-Filtering, Web-Stat-Compression
```

Install IIS URL Rewrite and Application Request Routing from Microsoft’s IIS extensions pages. In IIS Manager, open **Application Request Routing Cache → Server Proxy Settings** and enable **Proxy**.

Install NSSM from `https://nssm.cc/download` and place `nssm.exe` at:

```text
C:\Tools\nssm\nssm.exe
```

## 5. Create application directories

```powershell
New-Item -ItemType Directory -Force -Path C:\Apps\CloudOperationsChecklist\releases
New-Item -ItemType Directory -Force -Path C:\Apps\CloudOperationsChecklist\logs
```

Copy `deploy/windows-ec2-bootstrap.ps1` from the repository to Windows and run it as Administrator after Node.js, IIS, URL Rewrite, ARR, and NSSM are installed:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
.\windows-ec2-bootstrap.ps1
```

## 6. Configure SQL Server

Install SQL Server or SQL Server Express. Create the database in SSMS:

```sql
CREATE DATABASE CloudOperations;
GO
```

Open the SQL file from the repository:

```text
database/sqlserver/001_initial_schema.sql
```

Run it against `CloudOperations` in SSMS. Create a least-privilege SQL login for the application. Do not use `sa` in the application.

Create the environment variables in Windows. Use **System Properties → Environment Variables** or a protected secret-management process. Required values are:

```text
NODE_ENV=production
PORT=3000
DB_PROVIDER=mssql
MSSQL_CONNECTION_STRING=Server=localhost\SQLEXPRESS;Database=CloudOperations;User Id=cloudops_app;Password=CHANGE_ME;Encrypt=true;TrustServerCertificate=true
```

Restart the Windows service after changing environment variables.

## 7. Configure the Windows service

The bootstrap script creates this service:

```text
CloudOperationsChecklist
```

The service runs:

```text
C:\Program Files\nodejs\node.exe C:\Apps\CloudOperationsChecklist\current\dist\index.js
```

Check it with:

```powershell
Get-Service CloudOperationsChecklist
Get-Content C:\Apps\CloudOperationsChecklist\logs\stdout.log -Wait
Get-Content C:\Apps\CloudOperationsChecklist\logs\stderr.log -Wait
```

## 8. Configure IIS

Copy `deploy/web.config` into the IIS site root. Create an IIS website with a binding on port 80 and the domain name you plan to use. The configuration proxies requests to:

```text
http://127.0.0.1:3000
```

Configure HTTPS in IIS with a certificate. You can use an AWS Certificate Manager certificate through an Application Load Balancer, or install a certificate directly on IIS. For a single Windows EC2 instance, an IIS certificate imported into the Windows certificate store is the direct approach.

## 9. Configure GitHub Actions

Use the workflow:

```text
.github/workflows/deploy-windows-ec2.yml
```

This workflow must run on a self-hosted Windows EC2 runner. Install the GitHub Actions runner on the Windows server from **Repository → Settings → Actions → Runners → New self-hosted runner**. Choose Windows x64 and follow GitHub’s generated commands.

Add the runner label:

```text
windows, ec2
```

The workflow performs the following actions on the Windows EC2 runner:

```text
Checkout code
Install Node.js 22
Enable pnpm
Install dependencies
Run TypeScript checks
Run tests
Build the production application
Copy the release into a commit-specific directory
Update the current release junction
Restart the Windows service
Run a localhost health check
```

## 10. Launch the website

In GitHub:

1. Open **Actions**.
2. Select **Build and deploy to Windows EC2**.
3. Choose **Run workflow**.
4. Select the `main` branch.
5. Wait for validation and deployment to complete.
6. Open the IIS domain in a browser.

For normal updates, edit files in GitHub, create a pull request, merge into `main`, and let Actions deploy automatically.

## 11. Verify the deployment

Run on Windows PowerShell:

```powershell
Get-Service CloudOperationsChecklist
Invoke-WebRequest http://127.0.0.1:3000
Get-WinEvent -LogName Application -MaxEvents 20
```

Also verify that IIS returns the public domain over HTTPS and that the application can reach SQL Server.

## 12. Roll back

Releases are stored in:

```text
C:\Apps\CloudOperationsChecklist\releases
```

To roll back, point the `current` junction to a previous release and restart the service. Use PowerShell as Administrator:

```powershell
$previous = 'C:\Apps\CloudOperationsChecklist\releases\PREVIOUS_COMMIT_SHA'
$current = 'C:\Apps\CloudOperationsChecklist\current'
Remove-Item $current -Force
New-Item -ItemType Junction -Path $current -Target $previous
Restart-Service CloudOperationsChecklist
```

## Current limitation

The MSSQL provider is intentionally incomplete. Checklist loading/item writes and selected read operations use the provider seam. Customer CRUD, lead approval/publication writes, administration settings, and directory management still use the existing managed repository until MSSQL write parity is completed and tested.

Microsoft Entra ID and Microsoft 365 delivery remain disabled until their credentials and administrator consent are supplied.
