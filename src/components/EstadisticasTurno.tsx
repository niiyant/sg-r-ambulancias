'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { registrosService } from '@/services/supabase';

interface EstadisticasTurnoProps {
  esTurnoNocturno: boolean;
  fechaTurno: string;
}

export const EstadisticasTurno: React.FC<EstadisticasTurnoProps> = ({
  esTurnoNocturno,
  fechaTurno
}) => {
  const [estadisticas, setEstadisticas] = useState({
    totalRegistros: 0,
    registrosActivos: 0,
    registrosCompletados: 0,
    ultimoRegistro: null as string | null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEstadisticas = async () => {
      try {
        setLoading(true);
        
        // Cargar registros del turno
        const fechaHasta = esTurnoNocturno 
          ? new Date().toISOString().split('T')[0] // Si es nocturno, incluir hasta hoy
          : fechaTurno;
          
        const registrosRes = await registrosService.getFiltered({
          fecha_desde: fechaTurno,
          fecha_hasta: fechaHasta,
          solo_activos: false
        });

        if (registrosRes.success && registrosRes.data) {
          const registros = registrosRes.data;
          const activos = registros.filter(r => !r.hora_salida);
          const completados = registros.filter(r => r.hora_salida);
          
          // Encontrar último registro
          const ultimoRegistro = registros
            .sort((a, b) => new Date(`${b.fecha}T${b.hora_entrada}`).getTime() - new Date(`${a.fecha}T${a.hora_entrada}`).getTime())[0];

          setEstadisticas({
            totalRegistros: registros.length,
            registrosActivos: activos.length,
            registrosCompletados: completados.length,
            ultimoRegistro: ultimoRegistro ? `${ultimoRegistro.vehiculo.numero_economico} - ${new Date(`2000-01-01T${ultimoRegistro.hora_entrada}`).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` : null
          });
        }
      } catch (error) {
        console.error('Error cargando estadísticas del turno:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEstadisticas();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadEstadisticas, 30000);
    return () => clearInterval(interval);
  }, [fechaTurno, esTurnoNocturno]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Cargando estadísticas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const eficiencia = estadisticas.totalRegistros > 0 
    ? Math.round((estadisticas.registrosCompletados / estadisticas.totalRegistros) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Turno</CardTitle>
          <span className="text-xl">📊</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estadisticas.totalRegistros}</div>
          <p className="text-xs text-gray-500">
            {esTurnoNocturno ? 'Registros nocturnos' : 'Registros diurnos'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activos</CardTitle>
          <span className="text-xl">🚗</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{estadisticas.registrosActivos}</div>
          <p className="text-xs text-gray-500">
            En servicio
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completados</CardTitle>
          <span className="text-xl">✅</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{estadisticas.registrosCompletados}</div>
          <p className="text-xs text-gray-500">
            Finalizados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
          <span className="text-xl">⚡</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{eficiencia}%</div>
          <p className="text-xs text-gray-500">
            {estadisticas.ultimoRegistro && `Último: ${estadisticas.ultimoRegistro}`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
