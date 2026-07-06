$path = Join-Path $PSScriptRoot "..\firebase-service-account.json"

if (-not (Test-Path $path)) {
  throw "firebase-service-account.json not found in backend folder."
}

$bytes = [System.IO.File]::ReadAllBytes((Resolve-Path $path))
[Convert]::ToBase64String($bytes)
