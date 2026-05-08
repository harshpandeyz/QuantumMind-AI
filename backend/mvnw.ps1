param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $MavenArgs
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$wrapperProps = Join-Path $scriptDir ".mvn\wrapper\maven-wrapper.properties"
$mavenHome = Join-Path $scriptDir ".mvn\apache-maven-3.9.6"
$mavenZip = Join-Path $scriptDir ".mvn\apache-maven-3.9.6-bin.zip"
$mavenCmd = Join-Path $mavenHome "bin\mvn.cmd"

if (-not (Test-Path $mavenCmd)) {
    if (-not (Test-Path $wrapperProps)) {
        throw "Missing Maven wrapper properties: $wrapperProps"
    }

    $distributionUrl = (Get-Content $wrapperProps | Where-Object { $_ -match '^distributionUrl=' }) -replace '^distributionUrl=', ''
    if (-not $distributionUrl) {
        throw "distributionUrl is missing from $wrapperProps"
    }

    New-Item -ItemType Directory -Force -Path (Join-Path $scriptDir ".mvn") | Out-Null
    Write-Host "Downloading Maven from $distributionUrl"
    Invoke-WebRequest -Uri $distributionUrl -OutFile $mavenZip
    Expand-Archive -Path $mavenZip -DestinationPath (Join-Path $scriptDir ".mvn") -Force
}

& $mavenCmd @MavenArgs
exit $LASTEXITCODE
