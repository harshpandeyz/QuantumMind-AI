$ErrorActionPreference = "Stop"

Write-Host "Starting QuantumMind AI services..."
Write-Host "Backend:    http://localhost:8080"
Write-Host "AI service: http://localhost:8000"
Write-Host "Frontend:   http://localhost:5173"

$backend = Start-Process powershell -PassThru -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$PWD\backend'; .\mvnw.cmd spring-boot:run"
)

$ai = Start-Process powershell -PassThru -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$PWD\ai-service'; if (Test-Path '.\venv\Scripts\python.exe') { .\venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 } else { python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 }"
)

$frontend = Start-Process powershell -PassThru -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$PWD\frontend'; npm run dev"
)

Write-Host "Started process IDs: backend=$($backend.Id), ai-service=$($ai.Id), frontend=$($frontend.Id)"
