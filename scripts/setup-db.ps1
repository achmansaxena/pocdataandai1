$ErrorActionPreference = "Stop"

$containerName = "sql_server_advworks"
$backupUrl = "https://github.com/Microsoft/sql-server-samples/releases/download/adventureworks/AdventureWorks2022.bak"
$backupFile = "AdventureWorks2022.bak"

Write-Host "1. Checking if $backupFile exists locally..."
if (-not (Test-Path -Path $backupFile)) {
    Write-Host "Downloading $backupFile from Microsoft GitHub..."
    Invoke-WebRequest -Uri $backupUrl -OutFile $backupFile
    Write-Host "Download complete."
} else {
    Write-Host "Backup file already exists locally."
}

Write-Host "2. Making sure Docker container is running..."
$containerStatus = "false"
try {
    $containerStatus = docker inspect -f '{{.State.Running}}' $containerName 2>$null
} catch {
    # Container doesn't exist yet, which is fine
}

if ($containerStatus -ne "true") {
    Write-Host "Starting Docker containers via docker-compose up -d..."
    docker-compose up -d sqlserver
    Write-Host "Waiting for SQL Server to initialize (20 seconds)..."
    Start-Sleep -Seconds 20
}

Write-Host "3. Copying backup file to SQL Server container..."
docker cp $backupFile ${containerName}:/var/opt/mssql/backup.bak

Write-Host "4. Restoring database inside container..."
$restoreSql = "RESTORE DATABASE [AdventureWorks2022] FROM DISK = N'/var/opt/mssql/backup.bak' WITH FILE = 1, NOUNLOAD, REPLACE, STATS = 5"
docker exec -it $containerName /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -C -Q $restoreSql

Write-Host "✅ Database Setup Complete! AdventureWorks2022 is ready to use."
