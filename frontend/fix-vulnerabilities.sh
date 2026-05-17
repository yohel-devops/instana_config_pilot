#!/bin/bash

# Script para resolver vulnerabilidades de npm
# Instana Config Pilot - Frontend Security Fix

echo "🔒 Resolviendo vulnerabilidades de seguridad..."
echo ""

# Backup del package.json actual
echo "📦 Creando backup de package.json..."
cp package.json package.json.backup
echo "✅ Backup creado: package.json.backup"
echo ""

# Ejecutar npm audit fix --force
echo "🔧 Ejecutando npm audit fix --force..."
npm audit fix --force

# Verificar el resultado
echo ""
echo "🔍 Verificando vulnerabilidades restantes..."
npm audit

echo ""
echo "✅ Proceso completado!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Revisar los cambios en package.json"
echo "2. Probar la aplicación: npm run dev"
echo "3. Compilar: npm run build"
echo "4. Si hay problemas, restaurar: cp package.json.backup package.json"
echo ""

# Made with Bob
