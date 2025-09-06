import { createClient } from "@/utils/supabase/client";
import {
  RazonSocial,
  TipoVehiculo,
  Asunto,
  Conductor,
  ConductorConRazonSocial,
  RegistroCompleto,
  VehiculoConTipo,
  NuevoRazonSocial,
  NuevoTipoVehiculo,
  NuevoAsunto,
  NuevoVehiculo,
  NuevoConductor,
  NuevoRegistro,
  ActualizarRazonSocial,
  ActualizarTipoVehiculo,
  ActualizarAsunto,
  ActualizarVehiculo,
  ActualizarConductor,
  ActualizarRegistro,
  FiltrosRegistro,
  FiltrosVehiculo,
  EstadisticasDiarias,
  EstadisticasVehiculo,
  EstadisticasConductor,
  ApiResponse,
  PaginatedResponse,
} from "@/types/database";

const supabase = createClient();

// ===================================
// SERVICIOS PARA TIPOS DE VEHÍCULO
// ===================================

export const tiposVehiculoService = {
  // Obtener todos los tipos de vehículo
  async getAll(): Promise<ApiResponse<TipoVehiculo[]>> {
    try {
      const { data, error } = await supabase
        .from("tipos_vehiculo")
        .select("*")
        .order("nombre");

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
        success: false,
      };
    }
  },

  // Crear nuevo tipo de vehículo
  async create(tipo: NuevoTipoVehiculo): Promise<ApiResponse<TipoVehiculo>> {
    try {
      const { data, error } = await supabase
        .from("tipos_vehiculo")
        .insert(tipo)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Error al crear tipo de vehículo",
        success: false,
      };
    }
  },

  // Actualizar tipo de vehículo
  async update(
    tipo: ActualizarTipoVehiculo
  ): Promise<ApiResponse<TipoVehiculo>> {
    try {
      const { data, error } = await supabase
        .from("tipos_vehiculo")
        .update(tipo)
        .eq("id", tipo.id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Error al actualizar tipo de vehículo",
        success: false,
      };
    }
  },

  // Eliminar tipo de vehículo
  async delete(id: number): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from("tipos_vehiculo")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return {
        data: true,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al eliminar tipo de vehículo",
        success: false,
      };
    }
  },
};

// ===================================
// SERVICIOS PARA ASUNTOS
// ===================================

export const asuntosService = {
  // Obtener todos los asuntos
  async getAll(): Promise<ApiResponse<Asunto[]>> {
    try {
      const { data, error } = await supabase
        .from("asuntos")
        .select("*")
        .order("nombre");

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
        success: false,
      };
    }
  },

  // Crear nuevo asunto
  async create(asunto: NuevoAsunto): Promise<ApiResponse<Asunto>> {
    try {
      const { data, error } = await supabase
        .from("asuntos")
        .insert(asunto)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error al crear asunto",
        success: false,
      };
    }
  },

  // Actualizar asunto
  async update(asunto: ActualizarAsunto): Promise<ApiResponse<Asunto>> {
    try {
      const { data, error } = await supabase
        .from("asuntos")
        .update(asunto)
        .eq("id", asunto.id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Error al actualizar asunto",
        success: false,
      };
    }
  },

  // Eliminar asunto
  async delete(id: number): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.from("asuntos").delete().eq("id", id);

      if (error) throw error;

      return {
        data: true,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: false,
        error:
          error instanceof Error ? error.message : "Error al eliminar asunto",
        success: false,
      };
    }
  },
};

// ===================================
// SERVICIOS PARA VEHÍCULOS
// ===================================

export const vehiculosService = {
  // Obtener todos los vehículos con información del tipo
  async getAll(): Promise<ApiResponse<VehiculoConTipo[]>> {
    try {
      const { data, error } = await supabase
        .from("vehiculos")
        .select(
          `
          *,
          tipo:tipos_vehiculo(*),
          razon_social:razon_social(*)
        `
        )
        .order("numero_economico");

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
        success: false,
      };
    }
  },

  // Obtener vehículos con filtros
  async getFiltered(
    filtros: FiltrosVehiculo
  ): Promise<ApiResponse<VehiculoConTipo[]>> {
    try {
      let query = supabase.from("vehiculos").select(`
          *,
          tipo:tipos_vehiculo(*)
        `);

      if (filtros.tipo_id) {
        query = query.eq("tipo_id", filtros.tipo_id);
      }
      if (filtros.marca) {
        query = query.ilike("marca", `%${filtros.marca}%`);
      }
      if (filtros.razon_social) {
        query = query.ilike("razon_social", `%${filtros.razon_social}%`);
      }

      const { data, error } = await query.order("numero_economico");

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Error al filtrar vehículos",
        success: false,
      };
    }
  },

  // Crear nuevo vehículo
  async create(vehiculo: NuevoVehiculo): Promise<ApiResponse<VehiculoConTipo>> {
    try {
      const { data, error } = await supabase
        .from("vehiculos")
        .insert(vehiculo)
        .select(
          `
          *,
          tipo:tipos_vehiculo(*),
          razon_social:razon_social(*)
        `
        )
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Error al crear vehículo",
        success: false,
      };
    }
  },

  // Actualizar vehículo
  async update(
    vehiculo: ActualizarVehiculo
  ): Promise<ApiResponse<VehiculoConTipo>> {
    try {
      const { data, error } = await supabase
        .from("vehiculos")
        .update(vehiculo)
        .eq("id", vehiculo.id)
        .select(
          `
          *,
          tipo:tipos_vehiculo(*),
          razon_social:razon_social(*)
        `
        )
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Error al actualizar vehículo",
        success: false,
      };
    }
  },

  // Eliminar vehículo
  async delete(id: number): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.from("vehiculos").delete().eq("id", id);

      if (error) throw error;

      return {
        data: true,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: false,
        error:
          error instanceof Error ? error.message : "Error al eliminar vehículo",
        success: false,
      };
    }
  },
};

// ===================================
// SERVICIOS PARA CONDUCTORES
// ===================================

export const conductoresService = {
  // Obtener todos los conductores con información de razón social
  async getAll(): Promise<ApiResponse<ConductorConRazonSocial[]>> {
    try {
      const { data, error } = await supabase
        .from("conductores")
        .select(
          `
          *,
          razon_social:razon_social(*)
        `
        )
        .order("nombre");

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
        success: false,
      };
    }
  },

  // Crear nuevo conductor
  async create(
    conductor: NuevoConductor
  ): Promise<ApiResponse<ConductorConRazonSocial>> {
    try {
      const { data, error } = await supabase
        .from("conductores")
        .insert(conductor)
        .select(
          `
          *,
          razon_social:razon_social(*)
        `
        )
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Error al crear conductor",
        success: false,
      };
    }
  },

  // Actualizar conductor
  async update(
    conductor: ActualizarConductor
  ): Promise<ApiResponse<ConductorConRazonSocial>> {
    try {
      const { data, error } = await supabase
        .from("conductores")
        .update(conductor)
        .eq("id", conductor.id)
        .select(
          `
          *,
          razon_social:razon_social(*)
        `
        )
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Error al actualizar conductor",
        success: false,
      };
    }
  },

  // Eliminar conductor
  async delete(id: number): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from("conductores")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return {
        data: true,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al eliminar conductor",
        success: false,
      };
    }
  },
};

// ===================================
// SERVICIOS PARA REGISTROS
// ===================================

export const registrosService = {
  // Obtener todos los registros con información completa
  async getAll(): Promise<ApiResponse<RegistroCompleto[]>> {
    try {
      const { data, error } = await supabase
        .from("registros")
        .select(
          `
          *,
          vehiculo:vehiculos(*, tipo:tipos_vehiculo(*), razon_social:razon_social(*)),
          conductor:conductores(*, razon_social:razon_social(*) ),
          asunto:asuntos(*)
        `
        )
        .order("fecha", { ascending: false })
        .order("hora_entrada", { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
        success: false,
      };
    }
  },

  // Obtener registros con filtros
  async getFiltered(
    filtros: FiltrosRegistro
  ): Promise<ApiResponse<RegistroCompleto[]>> {
    try {
      let query = supabase.from("registros").select(`
          *,
          vehiculo:vehiculos(*, tipo:tipos_vehiculo(*), razon_social:razon_social(*) ),
          conductor:conductores(*, razon_social:razon_social(*) ),
          asunto:asuntos(*)
        `);

      if (filtros.fecha_desde) {
        query = query.gte("fecha", filtros.fecha_desde);
      }
      if (filtros.fecha_hasta) {
        query = query.lte("fecha", filtros.fecha_hasta);
      }
      if (filtros.vehiculo_id) {
        query = query.eq("vehiculo_id", filtros.vehiculo_id);
      }
      if (filtros.conductor_id) {
        query = query.eq("conductor_id", filtros.conductor_id);
      }
      if (filtros.asunto_id) {
        query = query.eq("asunto_id", filtros.asunto_id);
      }
      if (filtros.solo_activos) {
        query = query.is("hora_salida", null);
      }

      const { data, error } = await query
        .order("fecha", { ascending: false })
        .order("hora_entrada", { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Error al filtrar registros",
        success: false,
      };
    }
  },

  // Obtener registros paginados
  async getPaginated(
    page: number = 1,
    limit: number = 10,
    filtros?: FiltrosRegistro
  ): Promise<ApiResponse<PaginatedResponse<RegistroCompleto>>> {
    try {
      const offset = (page - 1) * limit;

      let query = supabase.from("registros").select(
        `
          *,
          vehiculo:vehiculos(*, tipo:tipos_vehiculo(*), razon_social:razon_social(*) ),
          conductor:conductores(*, razon_social:razon_social(*) ),
          asunto:asuntos(*)
        `,
        { count: "exact" }
      );

      if (filtros) {
        if (filtros.fecha_desde) {
          query = query.gte("fecha", filtros.fecha_desde);
        }
        if (filtros.fecha_hasta) {
          query = query.lte("fecha", filtros.fecha_hasta);
        }
        if (filtros.vehiculo_id) {
          query = query.eq("vehiculo_id", filtros.vehiculo_id);
        }
        if (filtros.conductor_id) {
          query = query.eq("conductor_id", filtros.conductor_id);
        }
        if (filtros.asunto_id) {
          query = query.eq("asunto_id", filtros.asunto_id);
        }
        if (filtros.solo_activos) {
          query = query.is("hora_salida", null);
        }
      }

      const { data, error, count } = await query
        .order("fecha", { ascending: false })
        .order("hora_entrada", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const hasMore = offset + limit < total;

      return {
        data: {
          data: data || [],
          total,
          page,
          limit,
          hasMore,
        },
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Error al obtener registros paginados",
        success: false,
      };
    }
  },

  // Crear nuevo registro
  async create(
    registro: NuevoRegistro
  ): Promise<ApiResponse<RegistroCompleto>> {
    try {
      const { data, error } = await supabase
        .from("registros")
        .insert(registro)
        .select(
          `
          *,
          vehiculo:vehiculos(*, tipo:tipos_vehiculo(*), razon_social:razon_social(*) ),
          conductor:conductores(*, razon_social:razon_social(*) ),
          asunto:asuntos(*)
        `
        )
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Error al crear registro",
        success: false,
      };
    }
  },

  // Actualizar registro
  async update(
    registro: ActualizarRegistro
  ): Promise<ApiResponse<RegistroCompleto>> {
    try {
      const { data, error } = await supabase
        .from("registros")
        .update(registro)
        .eq("id", registro.id)
        .select(
          `
          *,
          vehiculo:vehiculos(*, tipo:tipos_vehiculo(*), razon_social:razon_social(*) ),
          conductor:conductores(*, razon_social:razon_social(*) ),
          asunto:asuntos(*)
        `
        )
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Error al actualizar registro",
        success: false,
      };
    }
  },

  // Eliminar registro
  async delete(id: number): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.from("registros").delete().eq("id", id);

      if (error) throw error;

      return {
        data: true,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: false,
        error:
          error instanceof Error ? error.message : "Error al eliminar registro",
        success: false,
      };
    }
  },

  // Registrar salida de vehículo
  async registrarSalida(
    id: number,
    hora_salida: string
  ): Promise<ApiResponse<RegistroCompleto>> {
    try {
      const { data, error } = await supabase
        .from("registros")
        .update({ hora_salida })
        .eq("id", id)
        .select(
          `
          *,
          vehiculo:vehiculos(*, tipo:tipos_vehiculo(*)),
          conductor:conductores(*),
          asunto:asuntos(*)
        `
        )
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Error al registrar salida",
        success: false,
      };
    }
  },
};

// ===================================
// SERVICIOS PARA ESTADÍSTICAS
// ===================================

export const estadisticasService = {
  // Obtener estadísticas diarias
  async getDiarias(
    fecha_desde?: string,
    fecha_hasta?: string
  ): Promise<ApiResponse<EstadisticasDiarias[]>> {
    try {
      let query = supabase.from("registros").select("fecha, hora_salida");

      if (fecha_desde) {
        query = query.gte("fecha", fecha_desde);
      }
      if (fecha_hasta) {
        query = query.lte("fecha", fecha_hasta);
      }

      const { data, error } = await query.order("fecha");

      if (error) throw error;

      // Procesar datos para estadísticas
      const estadisticas: { [key: string]: EstadisticasDiarias } = {};

      data?.forEach((registro) => {
        const fecha = registro.fecha;
        if (!estadisticas[fecha]) {
          estadisticas[fecha] = {
            fecha,
            total_registros: 0,
            registros_activos: 0,
            registros_completados: 0,
          };
        }

        estadisticas[fecha].total_registros++;
        if (registro.hora_salida) {
          estadisticas[fecha].registros_completados++;
        } else {
          estadisticas[fecha].registros_activos++;
        }
      });

      return {
        data: Object.values(estadisticas),
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Error al obtener estadísticas diarias",
        success: false,
      };
    }
  },

  // Obtener estadísticas por vehículo
  async getPorVehiculo(): Promise<ApiResponse<EstadisticasVehiculo[]>> {
    try {
      const { data, error } = await supabase.from("registros").select(`
          vehiculo_id,
          fecha,
          hora_salida,
          vehiculo:vehiculos(*, tipo:tipos_vehiculo(*))
        `);

      if (error) throw error;

      // Procesar datos para estadísticas
      const estadisticas: { [key: number]: EstadisticasVehiculo } = {};

      data?.forEach((registro) => {
        const vehiculoId = registro.vehiculo_id;
        if (!estadisticas[vehiculoId]) {
          estadisticas[vehiculoId] = {
            vehiculo: registro.vehiculo as unknown as VehiculoConTipo,
            total_registros: 0,
            dias_activos: 0,
            ultimo_registro: null,
          };
        }

        estadisticas[vehiculoId].total_registros++;
      });

      // Calcular días únicos y último registro para cada vehículo
      Object.keys(estadisticas).forEach((vehiculoIdStr) => {
        const vehiculoId = parseInt(vehiculoIdStr);
        const fechasUnicas = new Set<string>();
        let ultimoRegistro: { fecha: string } | null = null;

        data?.forEach((r) => {
          if (r.vehiculo_id === vehiculoId) {
            fechasUnicas.add(r.fecha);
            if (
              !ultimoRegistro ||
              new Date(r.fecha) > new Date(ultimoRegistro.fecha)
            ) {
              ultimoRegistro = { fecha: r.fecha };
            }
          }
        });

        estadisticas[vehiculoId].dias_activos = fechasUnicas.size;
        if (ultimoRegistro) {
          estadisticas[vehiculoId].ultimo_registro = (
            ultimoRegistro as { fecha: string }
          ).fecha;
        }
      });

      return {
        data: Object.values(estadisticas),
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Error al obtener estadísticas por vehículo",
        success: false,
      };
    }
  },

  // Obtener estadísticas por conductor
  async getPorConductor(): Promise<ApiResponse<EstadisticasConductor[]>> {
    try {
      const { data, error } = await supabase.from("registros").select(`
          conductor_id,
          fecha,
          conductor:conductores(*)
        `);

      if (error) throw error;

      // Procesar datos para estadísticas
      const estadisticas: { [key: number]: EstadisticasConductor } = {};

      data?.forEach((registro) => {
        const conductorId = registro.conductor_id;
        if (!estadisticas[conductorId]) {
          estadisticas[conductorId] = {
            conductor: registro.conductor as unknown as Conductor,
            total_registros: 0,
            dias_trabajados: 0,
            ultimo_registro: null,
          };
        }

        estadisticas[conductorId].total_registros++;
      });

      // Calcular días únicos y último registro para cada conductor
      Object.keys(estadisticas).forEach((conductorIdStr) => {
        const conductorId = parseInt(conductorIdStr);
        const fechasUnicas = new Set<string>();
        let ultimoRegistro: { fecha: string } | null = null;

        data?.forEach((r) => {
          if (r.conductor_id === conductorId) {
            fechasUnicas.add(r.fecha);
            if (
              !ultimoRegistro ||
              new Date(r.fecha) > new Date(ultimoRegistro.fecha)
            ) {
              ultimoRegistro = { fecha: r.fecha };
            }
          }
        });

        estadisticas[conductorId].dias_trabajados = fechasUnicas.size;
        if (ultimoRegistro) {
          estadisticas[conductorId].ultimo_registro = (
            ultimoRegistro as { fecha: string }
          ).fecha;
        }
      });

      return {
        data: Object.values(estadisticas),
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Error al obtener estadísticas por conductor",
        success: false,
      };
    }
  },
};

// ===================================
// SERVICIO: Razón Social
// ===================================
export const razonSocialService = {
  // Obtener todas las razones sociales
  async getAll(): Promise<ApiResponse<RazonSocial[]>> {
    try {
      const { data, error } = await supabase
        .from("razon_social")
        .select("*")
        .order("nombre");

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Error al obtener razones sociales",
        success: false,
      };
    }
  },

  // Crear nueva razón social
  async create(
    razonSocial: NuevoRazonSocial
  ): Promise<ApiResponse<RazonSocial>> {
    try {
      const { data, error } = await supabase
        .from("razon_social")
        .insert([razonSocial])
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Error al crear razón social",
        success: false,
      };
    }
  },

  // Actualizar razón social
  async update(
    id: number,
    razonSocial: ActualizarRazonSocial
  ): Promise<ApiResponse<RazonSocial>> {
    try {
      const { data, error } = await supabase
        .from("razon_social")
        .update(razonSocial)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Error al actualizar razón social",
        success: false,
      };
    }
  },

  // Eliminar razón social
  async delete(id: number): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from("razon_social")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return {
        data: null,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Error al eliminar razón social",
        success: false,
      };
    }
  },
};
