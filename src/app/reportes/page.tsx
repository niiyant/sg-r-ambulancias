'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  EstadisticasDiarias,
  EstadisticasVehiculo,
  EstadisticasConductor 
} from '@/types/database';
import { estadisticasService } from '@/services/supabase';

export default function ReportesPage() {
  const [estadisticasDiarias, setEstadisticasDiarias] = useState<EstadisticasDiarias[]>([]);
  const [estadisticasVehiculos, setEstadisticasVehiculos] = useState<EstadisticasVehiculo[]>([]);
  const [estadisticasConductores, setEstadisticasConductores] = useState<EstadisticasConductor[]>([]);
  const [loading, setLoading] = useState(true);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useEffect(() => {
    // Establecer fechas por defecto (últimos 30 días)
    const hoy = new Date();
    const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    setFechaHasta(hoy.toISOString().split('T')[0]);
    setFechaDesde(hace30Dias.toISOString().split('T')[0]);
    
    loadReportes();
  }, []);

  const loadReportes = async () => {
    try {
      setLoading(true);
      
      const [diariasRes, vehiculosRes, conductoresRes] = await Promise.all([
        estadisticasService.getDiarias(fechaDesde, fechaHasta),
        estadisticasService.getPorVehiculo(),
        estadisticasService.getPorConductor()
      ]);

      if (diariasRes.success && diariasRes.data) {
        setEstadisticasDiarias(diariasRes.data);
      }
      if (vehiculosRes.success && vehiculosRes.data) {
        setEstadisticasVehiculos(vehiculosRes.data);
      }
      if (conductoresRes.success && conductoresRes.data) {
        setEstadisticasConductores(conductoresRes.data);
      }
    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarReporte = () => {
    loadReportes();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Generando reportes...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <p className="text-gray-600">Análisis de datos del sistema de ambulancias</p>
        </div>

        {/* Filtros de fecha */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros de Fecha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 items-end">
              <Input
                label="Fecha Desde"
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
              <Input
                label="Fecha Hasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
              <Button onClick={handleGenerarReporte}>
                Generar Reporte
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resumen general */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total de Registros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {estadisticasDiarias.reduce((sum, stat) => sum + stat.total_registros, 0)}
              </div>
              <p className="text-sm text-gray-500">En el período seleccionado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registros Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {estadisticasDiarias.reduce((sum, stat) => sum + stat.registros_activos, 0)}
              </div>
              <p className="text-sm text-gray-500">Sin hora de salida</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registros Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {estadisticasDiarias.reduce((sum, stat) => sum + stat.registros_completados, 0)}
              </div>
              <p className="text-sm text-gray-500">Con hora de salida</p>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas diarias */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas Diarias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-right p-2">Total</th>
                    <th className="text-right p-2">Activos</th>
                    <th className="text-right p-2">Completados</th>
                    <th className="text-right p-2">% Eficiencia</th>
                  </tr>
                </thead>
                <tbody>
                  {estadisticasDiarias.map((stat) => (
                    <tr key={stat.fecha} className="border-b">
                      <td className="p-2">{formatDate(stat.fecha)}</td>
                      <td className="text-right p-2">{stat.total_registros}</td>
                      <td className="text-right p-2">{stat.registros_activos}</td>
                      <td className="text-right p-2">{stat.registros_completados}</td>
                      <td className="text-right p-2">
                        {stat.total_registros > 0 
                          ? Math.round((stat.registros_completados / stat.total_registros) * 100)
                          : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas por vehículo */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas por Vehículo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {estadisticasVehiculos.map((stat) => (
                <div key={stat.vehiculo.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{stat.vehiculo.numero_economico}</h3>
                      <p className="text-sm text-gray-600">
                        {stat.vehiculo.marca} - {stat.vehiculo.tipo.nombre}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{stat.total_registros}</div>
                      <div className="text-sm text-gray-500">registros</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span>{stat.dias_activos} días activos</span>
                    {stat.ultimo_registro && (
                      <span className="ml-4">
                        Último: {formatDate(stat.ultimo_registro)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas por conductor */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas por Conductor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {estadisticasConductores.map((stat) => (
                <div key={stat.conductor.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{stat.conductor.nombre}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{stat.total_registros}</div>
                      <div className="text-sm text-gray-500">registros</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span>{stat.dias_trabajados} días trabajados</span>
                    {stat.ultimo_registro && (
                      <span className="ml-4">
                        Último: {formatDate(stat.ultimo_registro)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
