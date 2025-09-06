// ===================================
// TIPOS DE BASE DE DATOS - SISTEMA DE AMBULANCIAS
// ===================================

// ===================================
// TABLA: Razón Social
// ===================================
export interface RazonSocial {
  id: number;
  nombre: string;
}

// ===================================
// TABLA: Tipos de Vehículo
// ===================================
export interface TipoVehiculo {
  id: number;
  nombre: string;
}

// ===================================
// TABLA: Asuntos
// ===================================
export interface Asunto {
  id: number;
  nombre: string;
}

// ===================================
// TABLA: Vehículos
// ===================================
export interface Vehiculo {
  id: number;
  numero_economico: string;
  marca: string;
  tipo_id: number;
  razon_social_id: number;
}

// ===================================
// TABLA: Conductores
// ===================================
export interface Conductor {
  id: number;
  nombre: string;
  razon_social_id: number;
}

// ===================================
// TABLA: Registros diarios
// ===================================
export interface Registro {
  id: number;
  vehiculo_id: number;
  conductor_id: number;
  asunto_id: number;
  fecha: string; // Formato ISO date (YYYY-MM-DD)
  hora_entrada: string; // Formato HH:MM:SS
  hora_salida: string | null; // Puede ser null si no ha salido
}

// ===================================
// TIPOS CON RELACIONES (JOINS)
// ===================================

// Registro con información completa del vehículo
export interface RegistroConVehiculo extends Omit<Registro, "vehiculo_id"> {
  vehiculo: Vehiculo;
}

// Registro con información completa del conductor
export interface RegistroConConductor extends Omit<Registro, "conductor_id"> {
  conductor: Conductor;
}

// Registro con información completa del asunto
export interface RegistroConAsunto extends Omit<Registro, "asunto_id"> {
  asunto: Asunto;
}

// Registro con toda la información relacionada
export interface RegistroCompleto
  extends Omit<Registro, "vehiculo_id" | "conductor_id" | "asunto_id"> {
  vehiculo: VehiculoConTipo;
  conductor: ConductorConRazonSocial;
  asunto: Asunto;
}

// Vehículo con información del tipo y razón social
export interface VehiculoConTipo
  extends Omit<Vehiculo, "tipo_id" | "razon_social_id"> {
  tipo: TipoVehiculo;
  razon_social: RazonSocial;
}

// Conductor con información de razón social
export interface ConductorConRazonSocial
  extends Omit<Conductor, "razon_social_id"> {
  razon_social: RazonSocial;
}

// ===================================
// TIPOS PARA FORMULARIOS Y CREACIÓN
// ===================================

// Tipos para crear nuevos registros (sin ID)
export interface NuevoRazonSocial {
  nombre: string;
}

export interface NuevoTipoVehiculo {
  nombre: string;
}

export interface NuevoAsunto {
  nombre: string;
}

export interface NuevoVehiculo {
  numero_economico: string;
  marca: string;
  tipo_id: number;
  razon_social_id: number;
}

export interface NuevoConductor {
  nombre: string;
  razon_social_id: number;
}

export interface NuevoRegistro {
  vehiculo_id: number;
  conductor_id: number;
  asunto_id: number;
  fecha?: string; // Opcional, por defecto será la fecha actual
  hora_entrada: string;
  hora_salida?: string | null;
}

// ===================================
// TIPOS PARA ACTUALIZACIONES
// ===================================

// Tipos para actualizar registros existentes (todos los campos opcionales excepto ID)
export interface ActualizarRazonSocial {
  id: number;
  nombre?: string;
}

export interface ActualizarTipoVehiculo {
  id: number;
  nombre?: string;
}

export interface ActualizarAsunto {
  id: number;
  nombre?: string;
}

export interface ActualizarVehiculo {
  id: number;
  numero_economico?: string;
  marca?: string;
  tipo_id?: number;
  razon_social_id?: number;
}

export interface ActualizarConductor {
  id: number;
  nombre?: string;
  razon_social_id?: number;
}

export interface ActualizarRegistro {
  id: number;
  vehiculo_id?: number;
  conductor_id?: number;
  asunto_id?: number;
  fecha?: string;
  hora_entrada?: string;
  hora_salida?: string | null;
}

// ===================================
// TIPOS PARA FILTROS Y CONSULTAS
// ===================================

export interface FiltrosRegistro {
  fecha_desde?: string;
  fecha_hasta?: string;
  vehiculo_id?: number;
  conductor_id?: number;
  asunto_id?: number;
  solo_activos?: boolean; // Solo registros sin hora_salida
}

export interface FiltrosVehiculo {
  tipo_id?: number;
  marca?: string;
  razon_social?: string;
}

// ===================================
// TIPOS PARA ESTADÍSTICAS Y REPORTES
// ===================================

export interface EstadisticasDiarias {
  fecha: string;
  total_registros: number;
  registros_activos: number; // Sin hora_salida
  registros_completados: number; // Con hora_salida
}

export interface EstadisticasVehiculo {
  vehiculo: VehiculoConTipo;
  total_registros: number;
  dias_activos: number;
  ultimo_registro: string | null;
}

export interface EstadisticasConductor {
  conductor: Conductor;
  total_registros: number;
  dias_trabajados: number;
  ultimo_registro: string | null;
}

// ===================================
// TIPOS DE RESPUESTA DE API
// ===================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ===================================
// TIPOS PARA VALIDACIÓN
// ===================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}
