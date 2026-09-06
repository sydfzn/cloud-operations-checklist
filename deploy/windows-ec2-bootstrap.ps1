# Run in an elevated PowerShell window on Windows Server EC2.
$ErrorActionPreference = 'Stop'

$appRoot = 'C:\Apps\CloudOperationsChecklist'
$serviceName = 'CloudOperationsChecklist'
$nodePath = 'C:\Program Files\nodejs\node.exe'
$nssmPath = 'C:\Tools\nssm\nssm.exe'

New-Item -ItemType Directory -Force -Path "$appRoot\releases" | Out-Null
New-Item -ItemType Directory -Force -Path "$appRoot\logs" | Out-Null

# Install IIS and the reverse-proxy prerequisites.
Install-WindowsFeature Web-Server, Web-Default-Doc, Web-Http-Errors, Web-Http-Logging, Web-Request-Monitor, Web-Stat-Compression, Web-Filtering, Web-Mgmt-Console

# Install the Windows service wrapper separately before running this script:
# https://nssm.cc/download
if (-not (Test-Path $nssmPath)) {
  throw "Install NSSM first at $nssmPath"
}

if (-not (Get-Service -Name $serviceName -ErrorAction SilentlyContinue)) {
  & $nssmPath install $serviceName $nodePath "$appRoot\current\dist\index.js"
  & $nssmPath set $serviceName AppDirectory "$appRoot\current"
  & $nssmPath set $serviceName Start SERVICE_AUTO_START
  & $nssmPath set $serviceName AppExit Default Restart
  & $nssmPath set $serviceName AppStdout "$appRoot\logs\stdout.log"
  & $nssmPath set $serviceName AppStderr "$appRoot\logs\stderr.log"
}

# Set non-secret runtime values here. Set the SQL connection string through
# the Windows environment or a protected secret-management process.
[Environment]::SetEnvironmentVariable('NODE_ENV', 'production', 'Machine')
[Environment]::SetEnvironmentVariable('PORT', '3000', 'Machine')
[Environment]::SetEnvironmentVariable('DB_PROVIDER', 'mssql', 'Machine')

# Open Windows Firewall only for the reverse proxy ports.
New-NetFirewallRule -DisplayName 'Cloud Operations HTTP' -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow -ErrorAction SilentlyContinue
New-NetFirewallRule -DisplayName 'Cloud Operations HTTPS' -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow -ErrorAction SilentlyContinue

Set-Service -Name $serviceName -StartupType Automatic
Start-Service -Name $serviceName
Get-Service -Name $serviceName
