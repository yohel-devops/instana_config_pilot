# Setup Final - Instana Config Pilot

## 🎯 Estado Actual del Proyecto

### ✅ Completado
- Backend FastAPI con todos los endpoints
- Tipos TypeScript completos
- Estructura de componentes React
- Docker configurado
- Endpoint para cargar configuración default

### ⚠️ Pendiente (UI)
- Ajustar interfaz para que coincida exactamente con el diseño
- Implementar formulario dinámico de configuración de sensores
- Actualización en tiempo real del preview YAML

## 🚀 Pasos para Completar

### 1. Reinstalar Dependencias del Frontend

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### 2. Compilar y Probar Localmente

```bash
# Compilar TypeScript
npm run build

# Si hay errores, ejecutar:
npm run dev
# Y revisar en http://localhost:5173
```

### 3. Levantar con Docker

```bash
cd ..
docker-compose down
docker-compose up --build
```

## 📝 Volúmenes de Docker

El `docker-compose.yml` ya tiene configurados los volúmenes necesarios:

```yaml
services:
  backend:
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/temp:/app/temp
```

**Crear directorios si no existen:**

```bash
mkdir -p backend/uploads backend/temp
```

## 🎨 Ajustes de UI Pendientes

### Componente SensorCatalog.tsx

La interfaz debe tener DOS secciones lado a lado:

**Izquierda: "Available sensors from template"**
- Lista de todos los sensores del archivo
- Botón "Add" (gris) para sensores no seleccionados
- Botón "On" (verde) para sensores ya seleccionados
- Mostrar: nombre, key, categoría, número de env vars

**Derecha: "Enabled sensors in generated YAML"**
- Solo sensores seleccionados
- Botón "Edit" para abrir configuración
- Estado: "Ready" (verde) o "Missing X" (amarillo)
- Botón "×" para remover
- Texto "Written to YAML"

### Sección Inferior: "Sensor configuration"

Cuando se hace clic en "Edit":
- Mostrar formulario con campos del sensor
- Campos comunes: Host, Port, Channel, User env var, Password env var
- Dropdowns: TLS (Enabled/Disabled), Poll rate (10s, 30s, 60s)
- Botón "Save" para guardar cambios

### Preview en Tiempo Real

El componente `OutputPreview.tsx` debe:
- Actualizar automáticamente cuando cambian los sensores
- Mostrar el YAML generado con los sensores seleccionados
- Mostrar validaciones y findings
- Permitir descargar configuration.yaml y .env.example

## 🔧 Comandos Útiles

### Ver logs de Docker
```bash
docker-compose logs -f
docker-compose logs backend
docker-compose logs frontend
```

### Reiniciar solo un servicio
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Reconstruir sin cache
```bash
docker-compose build --no-cache
docker-compose up
```

## 📊 Verificación

1. **Backend funcionando**: http://localhost:8000/health
2. **API Docs**: http://localhost:8000/api/docs
3. **Frontend**: http://localhost:80
4. **Default config cargado**: Debe mostrar sensores al iniciar

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
cd frontend
npm install
```

### Error: "Port already in use"
```bash
# Cambiar puertos en docker-compose.yml
ports:
  - "8001:8000"  # backend
  - "8080:80"    # frontend
```

### Error: TypeScript compilation
```bash
cd frontend
npm run build -- --mode development
```

## 📦 Estructura Final

```
instana_config_pilot/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── default_config.py  ← Nuevo
│   │   │   ├── upload.py
│   │   │   ├── sensors.py
│   │   │   ├── compare.py
│   │   │   └── generate.py
│   │   ├── services/
│   │   ├── models/
│   │   └── main.py
│   ├── uploads/  ← Crear este directorio
│   ├── temp/     ← Crear este directorio
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TemplateSection.tsx
│   │   │   ├── SensorCatalog.tsx
│   │   │   └── OutputPreview.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── instana.ts
│   │   ├── App.tsx
│   │   └── vite-env.d.ts
│   └── Dockerfile
├── instana_docs/
│   └── configuration.yaml
└── docker-compose.yml
```

## ✅ Checklist Final

- [ ] Directorios `backend/uploads` y `backend/temp` creados
- [ ] `npm install` ejecutado en frontend
- [ ] `npm run build` exitoso
- [ ] `docker-compose up --build` funciona
- [ ] Frontend carga configuración default automáticamente
- [ ] Se pueden seleccionar/deseleccionar sensores
- [ ] Preview YAML se actualiza en tiempo real
- [ ] Se puede descargar configuration.yaml
- [ ] Se puede descargar .env.example

## 🎯 Prioridades para la Hackathon

1. **UI funcional** - Que se vea como el diseño
2. **Carga default** - Archivo precargado al iniciar
3. **Selección de sensores** - Add/On/Remove
4. **Preview en tiempo real** - Ver YAML generado
5. **Descarga de archivos** - YAML y .env

---

**Nota**: El backend ya está completo y funcional. El foco debe estar en ajustar la UI del frontend para que coincida con el diseño y todas las interacciones funcionen correctamente.