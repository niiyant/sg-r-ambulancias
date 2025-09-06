'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  RegistroCompleto
} from '@/types/database';
import { registrosService } from '@/services/supabase';

export default function ReportesPage() {
  const [registros, setRegistros] = useState<RegistroCompleto[]>([]);
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
      
      const response = await registrosService.getAll();
      
      if (response.success && response.data) {
        setRegistros(response.data);
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
          <h1 className="text-3xl font-bold text-gray-900 sm:text-gray-900 text-black">Reportes y Estadísticas</h1>
          <p className="text-gray-600 sm:text-gray-600 text-gray-700">Análisis de datos del sistema de ambulancias</p>
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
                {registros.length}
              </div>
              <p className="text-sm text-gray-500 sm:text-gray-500 text-gray-600">Registros en el sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registros Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {registros.filter(r => !r.hora_salida).length}
              </div>
              <p className="text-sm text-gray-500 sm:text-gray-500 text-gray-600">Sin hora de salida</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registros Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {registros.filter(r => r.hora_salida).length}
              </div>
              <p className="text-sm text-gray-500 sm:text-gray-500 text-gray-600">Con hora de salida</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de registros recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Registros Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {registros.slice(0, 10).map((registro) => (
                <div key={registro.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        {registro.vehiculo.marca} - {registro.vehiculo.numero_economico}
                      </h3>
                      <p className="text-sm text-gray-600 sm:text-gray-600 text-gray-700">
                        {registro.conductor.nombre} • {registro.asunto.nombre}
                      </p>
                      <p className="text-xs text-gray-500 sm:text-gray-500 text-gray-600">
                        {formatDate(registro.fecha)} • Entrada: {registro.hora_entrada}
                        {registro.hora_salida && ` • Salida: ${registro.hora_salida}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        registro.hora_salida 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {registro.hora_salida ? 'Completado' : 'Activo'}
                      </span>
                    </div>
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
