import { registrosService } from "./supabase";
import { RegistroCompleto, FiltrosRegistro } from "@/types/database";

export const turnosService = {
  // Obtener registros por turno
  async getRegistrosPorTurno(fecha: string): Promise<{
    data: RegistroCompleto[] | null;
    error: string | null;
    success: boolean;
  }> {
    try {
      // Convertir fecha a objeto Date
      const fechaSeleccionada = new Date(fecha);
      const fechaAnterior = new Date(fechaSeleccionada);
      fechaAnterior.setDate(fechaAnterior.getDate() - 1);

      // Rango del turno: desde las 19:00 del día anterior hasta las 15:00 del día seleccionado
      const fechaDesde = fechaAnterior.toISOString().split("T")[0];
      const fechaHasta = fechaSeleccionada.toISOString().split("T")[0];

      // Obtener todos los registros del rango
      const response = await registrosService.getFiltered({
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        solo_activos: false,
      });

      if (!response.success || !response.data) {
        return response;
      }

      // Filtrar por horarios de turno
      const registrosFiltrados = response.data.filter((registro) => {
        const fechaRegistro = new Date(registro.fecha);
        const horaEntrada = registro.hora_entrada.split(":");
        const hora = parseInt(horaEntrada[0]);
        const minuto = parseInt(horaEntrada[1]);
        const horaDecimal = hora + minuto / 60;

        // Si el registro es del día anterior, debe ser después de las 19:00
        if (fechaRegistro.toISOString().split("T")[0] === fechaDesde) {
          return horaDecimal >= 19;
        }

        // Si el registro es del día seleccionado, debe ser antes de las 15:00
        if (fechaRegistro.toISOString().split("T")[0] === fechaHasta) {
          return horaDecimal <= 15;
        }

        return false;
      });

      return {
        data: registrosFiltrados,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Error al obtener registros del turno",
        success: false,
      };
    }
  },

  // Obtener estadísticas del turno
  async getEstadisticasTurno(fecha: string): Promise<{
    data: {
      totalRegistros: number;
      registrosActivos: number;
      registrosCompletados: number;
      eficiencia: number;
    } | null;
    error: string | null;
    success: boolean;
  }> {
    try {
      const response = await this.getRegistrosPorTurno(fecha);

      if (!response.success || !response.data) {
        return {
          data: null,
          error: response.error,
          success: false,
        };
      }

      const registros = response.data;
      const totalRegistros = registros.length;
      const registrosActivos = registros.filter((r) => !r.hora_salida).length;
      const registrosCompletados = registros.filter(
        (r) => r.hora_salida
      ).length;
      const eficiencia =
        totalRegistros > 0
          ? Math.round((registrosCompletados / totalRegistros) * 100)
          : 0;

      return {
        data: {
          totalRegistros,
          registrosActivos,
          registrosCompletados,
          eficiencia,
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
            : "Error al obtener estadísticas del turno",
        success: false,
      };
    }
  },

  // Obtener registros con filtros personalizados
  async getRegistrosConFiltrosPersonalizados(filtros: {
    fechaDesde: string;
    fechaHasta: string;
    horaDesde: string;
    horaHasta: string;
    usarFiltrosPersonalizados: boolean;
  }): Promise<{
    data: RegistroCompleto[] | null;
    error: string | null;
    success: boolean;
  }> {
    try {
      // Construir filtros para el servicio de registros
      const filtrosRegistro: {
        solo_activos: boolean;
        fecha_desde?: string;
        fecha_hasta?: string;
      } = {
        solo_activos: false,
      };

      // Agregar filtros de fecha si están definidos
      if (filtros.fechaDesde) {
        filtrosRegistro.fecha_desde = filtros.fechaDesde;
      }
      if (filtros.fechaHasta) {
        filtrosRegistro.fecha_hasta = filtros.fechaHasta;
      }

      // Obtener registros con filtros de fecha
      const response = await registrosService.getFiltered(filtrosRegistro);

      if (!response.success || !response.data) {
        return response;
      }

      let registrosFiltrados = response.data;

      // Aplicar filtros de hora si están definidos
      if (filtros.horaDesde || filtros.horaHasta) {
        registrosFiltrados = registrosFiltrados.filter((registro) => {
          const horaEntrada = registro.hora_entrada.split(":");
          const hora = parseInt(horaEntrada[0]);
          const minuto = parseInt(horaEntrada[1]);
          const horaDecimal = hora + minuto / 60;

          // Verificar filtro de hora desde
          if (filtros.horaDesde) {
            const [horaDesde, minutoDesde] = filtros.horaDesde
              .split(":")
              .map(Number);
            const horaDesdeDecimal = horaDesde + minutoDesde / 60;
            if (horaDecimal < horaDesdeDecimal) {
              return false;
            }
          }

          // Verificar filtro de hora hasta
          if (filtros.horaHasta) {
            const [horaHasta, minutoHasta] = filtros.horaHasta
              .split(":")
              .map(Number);
            const horaHastaDecimal = horaHasta + minutoHasta / 60;
            if (horaDecimal > horaHastaDecimal) {
              return false;
            }
          }

          return true;
        });
      }

      return {
        data: registrosFiltrados,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Error al obtener registros con filtros personalizados",
        success: false,
      };
    }
  },

  // Obtener fechas disponibles para turnos
  async getFechasDisponibles(): Promise<{
    data: string[] | null;
    error: string | null;
    success: boolean;
  }> {
    try {
      // Obtener registros de los últimos 30 días
      const fechaHasta = new Date().toISOString().split("T")[0];
      const fechaDesde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const response = await registrosService.getFiltered({
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        solo_activos: false,
      });

      if (!response.success || !response.data) {
        return {
          data: null,
          error: response.error,
          success: false,
        };
      }

      // Extraer fechas únicas y ordenarlas
      const fechas = [...new Set(response.data.map((r) => r.fecha))].sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
      );

      return {
        data: fechas,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Error al obtener fechas disponibles",
        success: false,
      };
    }
  },
};
