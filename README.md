# Sistema de Gestión de Ambulancias

Un sistema completo para el control y gestión de ambulancias y vehículos de emergencia, desarrollado con Next.js 15, TypeScript y Supabase.

## 🚑 Características

- **Dashboard Interactivo**: Resumen de estadísticas y registros recientes
- **Gestión de Vehículos**: Registro y administración de ambulancias y vehículos
- **Gestión de Conductores**: Control de personal conductor
- **Registros de Entrada/Salida**: Seguimiento de movimientos de vehículos
- **Catálogos**: Administración de tipos de vehículo y asuntos
- **Reportes y Estadísticas**: Análisis de datos y rendimiento
- **Interfaz Moderna**: UI responsiva con Tailwind CSS

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: Componentes personalizados
- **Estado**: React Hooks

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- Base de datos configurada (ver sección de configuración)

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd sg-r-ambulancias
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Editar `.env.local` con tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   ```

4. **Configurar la base de datos**
   - Ejecutar el script SQL proporcionado en Supabase
   - Ver archivo `SUPABASE_SETUP.md` para detalles

5. **Ejecutar el proyecto**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🗄️ Estructura de la Base de Datos

El sistema utiliza las siguientes tablas principales:

- **tipos_vehiculo**: Catálogo de tipos de vehículos
- **asuntos**: Catálogo de asuntos/motivos
- **vehiculos**: Información de vehículos y ambulancias
- **conductores**: Datos de conductores
- **registros**: Registros de entrada y salida de vehículos

## 📱 Funcionalidades Principales

### Dashboard
- Estadísticas en tiempo real
- Registros recientes
- Métricas de eficiencia
- Acceso rápido a funciones principales

### Gestión de Vehículos
- Crear, editar y eliminar vehículos
- Asignar tipos de vehículo
- Información de razón social y marca

### Gestión de Conductores
- Registro de conductores
- Edición y eliminación
- Normalización automática de nombres

### Registros
- Crear nuevos registros de entrada/salida
- Filtrar por fecha, vehículo, conductor, asunto
- Registrar salidas de vehículos
- Paginación de resultados

### Catálogos
- Gestión de tipos de vehículo
- Administración de asuntos
- Normalización automática de datos

### Reportes
- Estadísticas diarias
- Análisis por vehículo
- Análisis por conductor
- Filtros de fecha personalizables

## 🎨 Componentes UI

El sistema incluye componentes reutilizables:

- **Button**: Botones con variantes y estados
- **Input**: Campos de entrada con validación
- **Select**: Selectores con opciones
- **Card**: Tarjetas de contenido
- **Modal**: Ventanas modales
- **Table**: Tablas de datos
- **Form**: Formularios especializados

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Producción
npm run start

# Linting
npm run lint
```

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Páginas de Next.js
│   ├── catalogos/         # Gestión de catálogos
│   ├── conductores/       # Gestión de conductores
│   ├── registros/         # Gestión de registros
│   ├── reportes/          # Reportes y estadísticas
│   ├── vehiculos/         # Gestión de vehículos
│   └── page.tsx          # Dashboard principal
├── components/            # Componentes React
│   ├── forms/            # Formularios especializados
│   ├── layout/           # Componentes de layout
│   ├── tables/           # Tablas de datos
│   └── ui/               # Componentes UI base
├── services/             # Servicios de Supabase
├── types/                # Tipos TypeScript
└── utils/                # Utilidades
```

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Otras Plataformas

El proyecto es compatible con cualquier plataforma que soporte Next.js:
- Netlify
- Railway
- DigitalOcean
- AWS

## 🔒 Seguridad

- Autenticación con Supabase
- Validación de datos en frontend y backend
- Políticas RLS (Row Level Security) en Supabase
- Sanitización de entradas

## 📊 Monitoreo

El sistema incluye:
- Logs de errores en consola
- Validación de formularios
- Manejo de estados de carga
- Mensajes de confirmación

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar documentación de Supabase

## 🔄 Actualizaciones

### v1.0.0
- Sistema base completo
- Gestión de vehículos y conductores
- Registros de entrada/salida
- Dashboard con estadísticas
- Reportes básicos

---

**Desarrollado con ❤️ para la gestión eficiente de ambulancias y vehículos de emergencia.**