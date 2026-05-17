# Security Updates - Instana Config Pilot

## Vulnerabilities Resolved

Se han actualizado las siguientes dependencias para resolver vulnerabilidades de seguridad:

### Dependencias Actualizadas

#### React Ecosystem
- **react**: `18.2.0` → `18.3.1` (última versión estable)
- **react-dom**: `18.2.0` → `18.3.1`
- **react-router-dom**: `6.20.0` → `6.26.0`

#### Build Tools
- **vite**: `5.0.8` → `5.4.6` (correcciones de seguridad)
- **typescript**: `5.3.3` → `5.6.2`
- **@vitejs/plugin-react**: `4.2.1` → `4.3.1`

#### Styling
- **tailwindcss**: `3.3.6` → `3.4.11`
- **autoprefixer**: `10.4.16` → `10.4.20`
- **postcss**: `8.4.32` → `8.4.47`

#### HTTP Client
- **axios**: `1.6.2` → `1.7.7` (correcciones de seguridad críticas)

#### UI Components
- **lucide-react**: `0.294.0` → `0.446.0`
- **react-dropzone**: `14.2.3` → `14.2.9`
- **react-diff-viewer-continued**: `3.3.1` → `3.4.0`

#### Linting (ESLint 9 Migration)
- **eslint**: `8.55.0` → `9.11.0` (nueva arquitectura flat config)
- **@eslint/js**: Nueva dependencia `9.11.0`
- **globals**: Nueva dependencia `15.9.0`
- **typescript-eslint**: `8.6.0` (reemplaza plugins antiguos)
- **eslint-plugin-react-hooks**: `4.6.0` → `5.1.0-rc.0`
- **eslint-plugin-react-refresh**: `0.4.5` → `0.4.12`

### Paquetes Deprecados Eliminados

Los siguientes paquetes deprecados han sido reemplazados:

1. **inflight** - Eliminado (causaba memory leaks)
2. **glob@7.x** - Actualizado a versión segura
3. **rimraf@3.x** - Actualizado a v4+
4. **@humanwhocodes/config-array** - Reemplazado por @eslint/config-array
5. **@humanwhocodes/object-schema** - Reemplazado por @eslint/object-schema
6. **eslint@8.x** - Actualizado a v9 con flat config

## Pasos para Actualizar

### 1. Limpiar Instalación Anterior

```bash
cd frontend

# Eliminar node_modules y lock files
rm -rf node_modules
rm package-lock.json

# En Windows PowerShell:
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
```

### 2. Instalar Dependencias Actualizadas

```bash
npm install
```

### 3. Verificar Vulnerabilidades

```bash
# Ejecutar audit
npm audit

# Si hay vulnerabilidades menores, aplicar fix automático
npm audit fix

# Verificar que no haya vulnerabilidades críticas
npm audit --audit-level=high
```

### 4. Actualizar npm (Opcional pero Recomendado)

```bash
npm install -g npm@latest
```

## Cambios en Configuración

### ESLint 9 - Flat Config

Se ha migrado de `.eslintrc.cjs` a `eslint.config.js` (flat config):

**Antes (.eslintrc.cjs):**
```javascript
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  // ...
}
```

**Ahora (eslint.config.js):**
```javascript
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    // ...
  }
)
```

### Scripts Actualizados

El script de lint ha sido simplificado:

```json
{
  "scripts": {
    "lint": "eslint ."
  }
}
```

## Verificación Post-Actualización

### 1. Compilar TypeScript

```bash
npm run build
```

Debe completarse sin errores.

### 2. Ejecutar Linter

```bash
npm run lint
```

Debe ejecutarse sin errores críticos.

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación debe iniciar correctamente en http://localhost:5173

### 4. Verificar en Docker

```bash
# Desde la raíz del proyecto
docker-compose up --build
```

Ambos servicios deben iniciar correctamente.

## Resultados Esperados

Después de la actualización, `npm audit` debe mostrar:

```
found 0 vulnerabilities
```

O vulnerabilidades de nivel bajo que no afectan la producción.

## Troubleshooting

### Error: "Cannot find module '@eslint/js'"

```bash
npm install --save-dev @eslint/js globals typescript-eslint
```

### Error: "Unexpected token 'export'"

Asegúrate de que `package.json` tenga:
```json
{
  "type": "module"
}
```

### Error de TypeScript en componentes

```bash
# Reinstalar tipos
npm install --save-dev @types/react @types/react-dom
```

### Conflictos de peer dependencies

```bash
# Forzar instalación (usar con precaución)
npm install --legacy-peer-deps
```

## Mantenimiento Continuo

### Actualizar Dependencias Regularmente

```bash
# Ver paquetes desactualizados
npm outdated

# Actualizar a versiones menores/patch
npm update

# Actualizar a versiones mayores (revisar breaking changes)
npm install <package>@latest
```

### Monitoreo de Seguridad

```bash
# Ejecutar audit regularmente
npm audit

# Configurar GitHub Dependabot (recomendado)
# Crea .github/dependabot.yml
```

### Ejemplo de dependabot.yml

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

## Notas Importantes

1. **Siempre revisar CHANGELOG** de paquetes antes de actualizar versiones mayores
2. **Probar en desarrollo** antes de desplegar a producción
3. **Mantener backups** de package-lock.json antes de actualizaciones mayores
4. **Documentar breaking changes** que afecten el código

## Referencias

- [ESLint 9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
- [React 18 Upgrade Guide](https://react.dev/blog/2022/03/08/react-18-upgrade-guide)
- [Vite Security Best Practices](https://vitejs.dev/guide/security.html)
- [npm Audit Documentation](https://docs.npmjs.com/cli/v10/commands/npm-audit)

---

**Última actualización**: 2026-05-16
**Versión del documento**: 1.0.0