# Script para resolver vulnerabilidades de npm (PowerShell)
# Instana Config Pilot - Frontend Security Fix

Write-Host "🔒 Resolviendo vulnerabilidades de seguridad..." -ForegroundColor Cyan
Write-Host ""

# Backup del package.json actual
Write-Host "📦 Creando backup de package.json..." -ForegroundColor Yellow
Copy-Item package.json package.json.backup
Write-Host "✅ Backup creado: package.json.backup" -ForegroundColor Green
Write-Host ""

# Ejecutar npm audit fix --force
Write-Host "🔧 Ejecutando npm audit fix --force..." -ForegroundColor Yellow
npm audit fix --force

# Verificar el resultado
Write-Host ""
Write-Host "🔍 Verificando vulnerabilidades restantes..." -ForegroundColor Yellow
npm audit

Write-Host ""
Write-Host "✅ Proceso completado!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Revisar los cambios en package.json"
Write-Host "2. Probar la aplicación: npm run dev"
Write-Host "3. Compilar: npm run build"
Write-Host "4. Si hay problemas, restaurar: Copy-Item package.json.backup package.json"
Write-Host ""

# Made with Bob
