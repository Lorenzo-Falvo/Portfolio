$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Find-Ruby {
    $ruby = Get-Command ruby -ErrorAction SilentlyContinue
    if ($ruby) { return $ruby.Source }

    $candidates = @(
        "$env:LOCALAPPDATA\Microsoft\WindowsApps\ruby.exe",
        "C:\Ruby33-x64\bin\ruby.exe",
        "C:\Ruby32-x64\bin\ruby.exe",
        "C:\Ruby31-x64\bin\ruby.exe"
    )
    foreach ($path in $candidates) {
        if (Test-Path $path) { return $path }
    }
    return $null
}

$rubyPath = Find-Ruby
if (-not $rubyPath) {
    Write-Host ""
    Write-Host "Ruby non trovato. Installalo con:" -ForegroundColor Yellow
    Write-Host "  winget install RubyInstallerTeam.Ruby.3.3" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Dopo l'installazione, riapri Cursor e rilancia la preview." -ForegroundColor Yellow
    exit 1
}

$rubyDir = Split-Path -Parent $rubyPath
$env:Path = "$rubyDir;$rubyDir\msys64\usr\bin;$env:Path"

if (-not (Get-Command bundle -ErrorAction SilentlyContinue)) {
    Write-Host "Installazione di Bundler..." -ForegroundColor Cyan
    & gem install bundler:2.7.2
}

$bundle = "bundle"
if (Get-Command bundle -ErrorAction SilentlyContinue) {
    $bundle = "bundle _2.7.2_"
}

if (-not (Test-Path "Gemfile.lock")) {
    Write-Host "Installazione dipendenze Jekyll (prima volta, puo' richiedere qualche minuto)..." -ForegroundColor Cyan
    Invoke-Expression "$bundle install"
}

Write-Host ""
Write-Host "Preview locale: http://127.0.0.1:4000" -ForegroundColor Green
Write-Host "Modifica i file e il browser si aggiornera' automaticamente (LiveReload)." -ForegroundColor Green
Write-Host "Premi Ctrl+C per fermare il server." -ForegroundColor DarkGray
Write-Host ""

Invoke-Expression "$bundle exec jekyll serve --livereload --config _config.yml,_config_dev.yml --host 127.0.0.1 --port 4000"
