'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { RegistroForm } from '@/components/forms/RegistroForm';
import { RegistrosTurnoTable } from '@/components/tables/RegistrosTurnoTable';
import { 
  RegistroCompleto, 
  NuevoRegistro
} from '@/types/database';
import { 
  registrosService
} from '@/services/supabase';
import { turnosService } from '@/services/turnosService';

export default function RegistrosPage() {
  const [registros, setRegistros] = useState<RegistroCompleto[]>([]);
  const [fechasDisponibles, setFechasDisponibles] = useState<string[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [filtrosPersonalizados, setFiltrosPersonalizados] = useState({
    fechaDesde: '',
    fechaHasta: '',
    horaDesde: '',
    horaHasta: '',
    usarFiltrosPersonalizados: false
  });
  const [estadisticas, setEstadisticas] = useState({
    totalRegistros: 0,
    registrosActivos: 0,
    registrosCompletados: 0,
    eficiencia: 0
  });
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState<RegistroCompleto | null>(null);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Cargar fechas disponibles
      const fechasRes = await turnosService.getFechasDisponibles();
      if (fechasRes.success && fechasRes.data) {
        setFechasDisponibles(fechasRes.data);
        // Seleccionar la fecha más reciente por defecto
        if (fechasRes.data.length > 0) {
          setFechaSeleccionada(fechasRes.data[0]);
        }
      }

      // Los catálogos se cargan en el formulario modal cuando se necesite
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRegistros = useCallback(async () => {
    try {
      setLoading(true);
      
      let registrosRes;
      
      if (filtrosPersonalizados.usarFiltrosPersonalizados) {
        // Usar filtros personalizados
        registrosRes = await turnosService.getRegistrosConFiltrosPersonalizados(filtrosPersonalizados);
      } else {
        // Usar filtrado por turno tradicional
        if (!fechaSeleccionada) return;
        registrosRes = await turnosService.getRegistrosPorTurno(fechaSeleccionada);
      }
      
      if (registrosRes.success && registrosRes.data) {
        setRegistros(registrosRes.data);
        
        // Calcular estadísticas
        const totalRegistros = registrosRes.data.length;
        const registrosActivos = registrosRes.data.filter((r) => !r.hora_salida).length;
        const registrosCompletados = registrosRes.data.filter((r) => r.hora_salida).length;
        const eficiencia = totalRegistros > 0 ? Math.round((registrosCompletados / totalRegistros) * 100) : 0;
        
        setEstadisticas({
          totalRegistros,
          registrosActivos,
          registrosCompletados,
          eficiencia
        });
      }
    } catch (error) {
      console.error('Error cargando registros:', error);
    } finally {
      setLoading(false);
    }
  }, [fechaSeleccionada, filtrosPersonalizados]);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Cargar registros cuando cambie la fecha seleccionada o los filtros
  useEffect(() => {
    if (fechaSeleccionada || filtrosPersonalizados.usarFiltrosPersonalizados) {
      loadRegistros();
    }
  }, [fechaSeleccionada, filtrosPersonalizados.usarFiltrosPersonalizados, loadRegistros]);

  const handleCrearRegistro = async (nuevoRegistro: NuevoRegistro) => {
    try {
      setFormLoading(true);
      const response = await registrosService.create(nuevoRegistro);
      
      if (response.success && response.data) {
        setShowFormModal(false);
        alert('Registro creado exitosamente');
        loadRegistros(); // Recargar registros
      } else {
        alert('Error al crear registro: ' + response.error);
      }
    } catch (error) {
      console.error('Error creando registro:', error);
      alert('Error al crear registro');
    } finally {
      setFormLoading(false);
    }
  };

  const handleActualizarRegistro = async (registroActualizado: NuevoRegistro & { id: number }) => {
    try {
      setFormLoading(true);
      const response = await registrosService.update(registroActualizado);
      
      if (response.success && response.data) {
        setShowFormModal(false);
        setEditingRegistro(null);
        alert('Registro actualizado exitosamente');
        loadRegistros(); // Recargar registros
      } else {
        alert('Error al actualizar registro: ' + response.error);
      }
    } catch (error) {
      console.error('Error actualizando registro:', error);
      alert('Error al actualizar registro');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEliminarRegistro = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      return;
    }

    try {
      const response = await registrosService.delete(id);
      
      if (response.success) {
        alert('Registro eliminado exitosamente');
        loadRegistros(); // Recargar registros
      } else {
        alert('Error al eliminar registro: ' + response.error);
      }
    } catch (error) {
      console.error('Error eliminando registro:', error);
      alert('Error al eliminar registro');
    }
  };

  const handleRegistrarSalida = async (id: number) => {
    try {
      const horaSalida = new Date().toTimeString().split(' ')[0];
      const response = await registrosService.registrarSalida(id, horaSalida);
      
      if (response.success && response.data) {
        alert('Salida registrada exitosamente');
        loadRegistros(); // Recargar registros
      } else {
        alert('Error al registrar salida: ' + response.error);
      }
    } catch (error) {
      console.error('Error registrando salida:', error);
      alert('Error al registrar salida');
    }
  };

  const handleEditRegistro = (registro: RegistroCompleto) => {
    setEditingRegistro(registro);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingRegistro(null);
  };

  const handleSubmit = async (registro: NuevoRegistro) => {
    if (editingRegistro) {
      await handleActualizarRegistro({ ...registro, id: editingRegistro.id });
    } else {
      await handleCrearRegistro(registro);
    }
  };

  const handleFechaChange = (fecha: string) => {
    setFechaSeleccionada(fecha);
    setFiltrosPersonalizados(prev => ({ ...prev, usarFiltrosPersonalizados: false }));
  };

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltrosPersonalizados(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const toggleFiltrosPersonalizados = () => {
    setFiltrosPersonalizados(prev => ({
      ...prev,
      usarFiltrosPersonalizados: !prev.usarFiltrosPersonalizados,
      fechaDesde: '',
      fechaHasta: '',
      horaDesde: '',
      horaHasta: ''
    }));
    setFechaSeleccionada('');
  };

  const limpiarFiltros = () => {
    setFiltrosPersonalizados({
      fechaDesde: '',
      fechaHasta: '',
      horaDesde: '',
      horaHasta: '',
      usarFiltrosPersonalizados: false
    });
    setFechaSeleccionada('');
    setRegistros([]);
    setEstadisticas({
      totalRegistros: 0,
      registrosActivos: 0,
      registrosCompletados: 0,
      eficiencia: 0
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 sm:text-gray-900 text-black">Registros por Turno</h1>
            <p className="text-sm sm:text-base text-gray-600 sm:text-gray-600 text-gray-700">Vista de registros organizados por turnos (19:00 - 06:00)</p>
          </div>
          <Button 
            onClick={() => setShowFormModal(true)}
            className="w-full sm:w-auto"
          >
            Nuevo Registro
          </Button>
        </div>

        {/* Selector de fecha y filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros de Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Toggle entre filtros de turno y personalizados */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Button
                  variant={!filtrosPersonalizados.usarFiltrosPersonalizados ? "primary" : "outline"}
                  onClick={() => setFiltrosPersonalizados(prev => ({ ...prev, usarFiltrosPersonalizados: false }))}
                  className="w-full sm:w-auto"
                >
                  Filtro por Turno
                </Button>
                <Button
                  variant={filtrosPersonalizados.usarFiltrosPersonalizados ? "primary" : "outline"}
                  onClick={toggleFiltrosPersonalizados}
                  className="w-full sm:w-auto"
                >
                  Filtros Personalizados
                </Button>
                <Button
                  variant="outline"
                  onClick={limpiarFiltros}
                  className="w-full sm:w-auto"
                >
                  Limpiar Filtros
                </Button>
              </div>

              {/* Filtro por turno */}
              {!filtrosPersonalizados.usarFiltrosPersonalizados && (
                <div className="flex items-center space-x-4">
                  <Select
                    label="Fecha del Turno"
                    value={fechaSeleccionada}
                    onChange={(e) => handleFechaChange(e.target.value)}
                    options={fechasDisponibles.map(fecha => ({
                      value: fecha,
                      label: new Date(fecha).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    }))}
                    placeholder="Selecciona una fecha"
                  />
                  <div className="text-sm text-gray-500 sm:text-gray-500 text-gray-600">
                    <p>Turno: 19:00 del día anterior a 15:00 del día seleccionado</p>
                  </div>
                </div>
              )}

              {/* Filtros personalizados */}
              {filtrosPersonalizados.usarFiltrosPersonalizados && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    label="Fecha Desde"
                    type="date"
                    value={filtrosPersonalizados.fechaDesde}
                    onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
                  />
                  <Input
                    label="Fecha Hasta"
                    type="date"
                    value={filtrosPersonalizados.fechaHasta}
                    onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
                  />
                  <Input
                    label="Hora Desde"
                    type="time"
                    value={filtrosPersonalizados.horaDesde}
                    onChange={(e) => handleFiltroChange('horaDesde', e.target.value)}
                  />
                  <Input
                    label="Hora Hasta"
                    type="time"
                    value={filtrosPersonalizados.horaHasta}
                    onChange={(e) => handleFiltroChange('horaHasta', e.target.value)}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        {(fechaSeleccionada || filtrosPersonalizados.usarFiltrosPersonalizados) && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Turno</CardTitle>
                <span className="text-xl">📊</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.totalRegistros}</div>
                <p className="text-xs text-gray-500">Registros del turno</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activos</CardTitle>
                <span className="text-xl">🚗</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{estadisticas.registrosActivos}</div>
                <p className="text-xs text-gray-500">En servicio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completados</CardTitle>
                <span className="text-xl">✅</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{estadisticas.registrosCompletados}</div>
                <p className="text-xs text-gray-500">Finalizados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
                <span className="text-xl">⚡</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.eficiencia}%</div>
                <p className="text-xs text-gray-500">Completados</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabla de registros del turno */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filtrosPersonalizados.usarFiltrosPersonalizados ? 'Registros Filtrados' : 'Registros del Turno'}
              {fechaSeleccionada && !filtrosPersonalizados.usarFiltrosPersonalizados && (
                <span className="text-sm font-normal text-gray-500 sm:text-gray-500 text-gray-600 ml-2">
                  - {new Date(fechaSeleccionada).toLocaleDateString('es-ES')}
                </span>
              )}
              {filtrosPersonalizados.usarFiltrosPersonalizados && (
                <span className="text-sm font-normal text-gray-500 sm:text-gray-500 text-gray-600 ml-2">
                  - Filtros personalizados aplicados
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <RegistrosTurnoTable
                registros={registros}
                onEdit={handleEditRegistro}
                onDelete={handleEliminarRegistro}
                onRegistrarSalida={handleRegistrarSalida}
                loading={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Modal de formulario */}
        <Modal
          isOpen={showFormModal}
          onClose={handleCloseModal}
          title={editingRegistro ? 'Editar Registro' : 'Nuevo Registro'}
          size="lg"
        >
          <RegistroForm
            onSubmit={handleSubmit}
            loading={formLoading}
            initialData={editingRegistro || undefined}
          />
        </Modal>
      </div>
    </Layout>
  );
}
