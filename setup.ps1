$ErrorActionPreference = "Stop"

function Require-Command($Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "$Name is required but was not found on PATH."
    }
}

Require-Command java
Require-Command python
Require-Command node
Require-Command npm

java -version
python --version
node --version

New-Item -ItemType Directory -Force -Path "backend\uploads", "ai-service\faiss_index" | Out-Null

Push-Location backend
try {
    .\mvnw.cmd clean install -DskipTests
}
finally {
    Pop-Location
}

Push-Location ai-service
try {
    if (-not (Test-Path "venv\Scripts\python.exe")) {
        python -m venv venv
    }
    .\venv\Scripts\python.exe -m pip install --upgrade pip
    .\venv\Scripts\python.exe -m pip install -r requirements.txt
}
finally {
    Pop-Location
}

Push-Location frontend
try {
    npm install
}
finally {
    Pop-Location
}

Write-Host "QuantumMind AI setup complete."
Write-Host "Start services with: .\start.ps1"
