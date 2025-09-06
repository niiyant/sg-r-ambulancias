'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  NuevoRegistro, 
  VehiculoConTipo, 
  ConductorConRazonSocial, 
  Asunto,
  RegistroCompleto,
  FormErrors 
} from '@/types/database';
import { formatTime24h } from '@/utils/timeFormatter';
import { vehiculosService, conductoresService, asuntosService, registrosService } from '@/services/supabase';
import { TurnoNocturnoIndicator } from '@/components/TurnoNocturnoIndicator';
import { EstadisticasTurno } from '@/components/EstadisticasTurno';
import { AtajosRapidos } from '@/components/AtajosRapidos';

interface RegistroRapidoFormProps {
  onSubmit: (registro: NuevoRegistro) => Promise<void>;
  onUpdate: (registro: NuevoRegistro & { id: number }) => Promise<void>;
  loading?: boolean;
  initialData?: Partial<NuevoRegistro>;
}

export const RegistroRapidoForm: React.FC<RegistroRapidoFormProps> = ({
  onSubmit,
  onUpdate,
  loading = false,
  initialData
}) => {
  const [formData, setFormData] = useState<NuevoRegistro>({
    vehiculo_id: initialData?.vehiculo_id || 0,
    conductor_id: initialData?.conductor_id || 0,
    asunto_id: initialData?.asunto_id || 0,
    fecha: initialData?.fecha || new Date().toISOString().split('T')[0],
    hora_entrada: initialData?.hora_entrada || '',
    hora_salida: initialData?.hora_salida || null
  });

  const [vehiculos, setVehiculos] = useState<VehiculoConTipo[]>([]);
  const [conductores, setConductores] = useState<ConductorConRazonSocial[]>([]);
  const [asuntos, setAsuntos] = useState<Asunto[]>([]);
  const [registrosActivos, setRegistrosActivos] = useState<RegistroCompleto[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadingData, setLoadingData] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroCompleto | null>(null);
  const [esTurnoNocturno, setEsTurnoNocturno] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        
        // Cargar catálogos
        const [vehiculosRes, conductoresRes, asuntosRes] = await Promise.all([
          vehiculosService.getAll(),
          conductoresService.getAll(),
          asuntosService.getAll()
        ]);

        if (vehiculosRes.success && vehiculosRes.data) {
          setVehiculos(vehiculosRes.data);
        }
        if (conductoresRes.success && conductoresRes.data) {
          setConductores(conductoresRes.data);
        }
        if (asuntosRes.success && asuntosRes.data) {
          setAsuntos(asuntosRes.data);
        }

        // Cargar registros activos del día actual
        const hoy = new Date().toISOString().split('T')[0];
        const registrosRes = await registrosService.getFiltered({
          fecha_desde: hoy,
          fecha_hasta: hoy,
          solo_activos: true
        });

        if (registrosRes.success && registrosRes.data) {
          setRegistrosActivos(registrosRes.data);
        }

        // Detectar si es turno nocturno (después de las 18:00)
        const horaActual = new Date().getHours();
        setEsTurnoNocturno(horaActual >= 18);

      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // Actualizar fecha cuando cambia el turno nocturno
  useEffect(() => {
    if (esTurnoNocturno) {
      // Si es turno nocturno, usar el día anterior para el inicio del turno
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      setFormData(prev => ({
        ...prev,
        fecha: ayer.toISOString().split('T')[0]
      }));
    } else {
      // Si es turno diurno, usar el día actual
      const hoy = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        fecha: hoy
      }));
    }
  }, [esTurnoNocturno]);

  const handleChange = (field: keyof NuevoRegistro, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSeleccionarRegistro = (registro: RegistroCompleto) => {
    setRegistroSeleccionado(registro);
    setModoEdicion(true);
    setFormData({
      vehiculo_id: registro.vehiculo.id,
      conductor_id: registro.conductor.id,
      asunto_id: registro.asunto.id,
      fecha: registro.fecha,
      hora_entrada: registro.hora_entrada,
      hora_salida: registro.hora_salida
    });
  };

  const handleNuevoRegistro = () => {
    setRegistroSeleccionado(null);
    setModoEdicion(false);
    setFormData({
      vehiculo_id: 0,
      conductor_id: 0,
      asunto_id: 0,
      fecha: esTurnoNocturno 
        ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      hora_entrada: '',
      hora_salida: null
    });
  };

  const handleHoraActual = () => {
    const hora = new Date().toTimeString().split(' ')[0];
    setFormData(prev => ({
      ...prev,
      hora_entrada: hora
    }));
  };

  const handleHoraEntrada = () => {
    const hora = new Date().toTimeString().split(' ')[0];
    setFormData(prev => ({
      ...prev,
      hora_entrada: hora
    }));
  };

  const handleHoraSalida = () => {
    const hora = new Date().toTimeString().split(' ')[0];
    setFormData(prev => ({
      ...prev,
      hora_salida: hora
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.vehiculo_id) {
      newErrors.vehiculo_id = 'Selecciona un vehículo';
    }
    if (!formData.conductor_id) {
      newErrors.conductor_id = 'Selecciona un conductor';
    }
    if (!formData.asunto_id) {
      newErrors.asunto_id = 'Selecciona un asunto';
    }
    if (!formData.hora_entrada) {
      newErrors.hora_entrada = 'La hora de entrada es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (modoEdicion && registroSeleccionado) {
        await onUpdate({ ...formData, id: registroSeleccionado.id });
      } else {
        await onSubmit(formData);
      }
      
      // Limpiar formulario después de enviar
      handleNuevoRegistro();
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    }
  };

  const handleRegistrarSalida = async (registro: RegistroCompleto) => {
    try {
      const horaSalida = new Date().toTimeString().split(' ')[0];
      await registrosService.registrarSalida(registro.id, horaSalida);
      
      // Recargar registros activos
      const hoy = new Date().toISOString().split('T')[0];
      const registrosRes = await registrosService.getFiltered({
        fecha_desde: hoy,
        fecha_hasta: hoy,
        solo_activos: true
      });

      if (registrosRes.success && registrosRes.data) {
        setRegistrosActivos(registrosRes.data);
      }
    } catch (error) {
      console.error('Error registrando salida:', error);
      alert('Error al registrar salida');
    }
  };

  if (loadingData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Cargando datos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicador de turno */}
      <TurnoNocturnoIndicator onToggleTurno={setEsTurnoNocturno} />

      {/* Estadísticas del turno */}
      <EstadisticasTurno 
        esTurnoNocturno={esTurnoNocturno} 
        fechaTurno={formData.fecha || new Date().toISOString().split('T')[0]} 
      />

      {/* Registros activos */}
      {registrosActivos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Registros Activos del Día</span>
              <Button onClick={handleNuevoRegistro} size="sm">
                + Nuevo Registro
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {registrosActivos.map((registro) => (
                <div
                  key={registro.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    registroSeleccionado?.id === registro.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSeleccionarRegistro(registro)}
                >
                  <div className="font-medium text-sm">
                    {registro.vehiculo.numero_economico} - {registro.vehiculo.marca}
                  </div>
                  <div className="text-xs text-gray-600">
                    {registro.conductor.nombre}
                  </div>
                  <div className="text-xs text-gray-500">
                    {registro.asunto.nombre}
                  </div>
                  <div className="text-xs text-gray-500">
                    Entrada: {formatTime24h(registro.hora_entrada)}
                  </div>
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegistrarSalida(registro);
                      }}
                    >
                      Registrar Salida
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Atajos rápidos */}
      <AtajosRapidos
        onHoraActual={handleHoraActual}
        onHoraEntrada={handleHoraEntrada}
        onHoraSalida={handleHoraSalida}
        onLimpiarFormulario={handleNuevoRegistro}
      />

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>
            {modoEdicion ? 'Editar Registro' : 'Nuevo Registro'}
            {registroSeleccionado && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                - {registroSeleccionado.vehiculo.numero_economico}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Vehículo *"
                value={formData.vehiculo_id}
                onChange={(e) => handleChange('vehiculo_id', parseInt(e.target.value))}
                options={vehiculos.map(v => ({
                  value: v.id,
                  label: `${v.numero_economico} - ${v.marca}`
                }))}
                placeholder="Selecciona un vehículo"
                error={errors.vehiculo_id}
              />

              <Select
                label="Conductor *"
                value={formData.conductor_id}
                onChange={(e) => handleChange('conductor_id', parseInt(e.target.value))}
                options={conductores.map(c => ({
                  value: c.id,
                  label: c.nombre
                }))}
                placeholder="Selecciona un conductor"
                error={errors.conductor_id}
              />

              <Select
                label="Asunto *"
                value={formData.asunto_id}
                onChange={(e) => handleChange('asunto_id', parseInt(e.target.value))}
                options={asuntos.map(a => ({
                  value: a.id,
                  label: a.nombre
                }))}
                placeholder="Selecciona un asunto"
                error={errors.asunto_id}
              />

              <Input
                label="Fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => handleChange('fecha', e.target.value)}
                error={errors.fecha}
                disabled={esTurnoNocturno}
                helperText={esTurnoNocturno ? "Fecha fija para turno nocturno" : undefined}
              />

              <Input
                label="Hora de Entrada *"
                type="time"
                value={formData.hora_entrada}
                onChange={(e) => handleChange('hora_entrada', e.target.value)}
                error={errors.hora_entrada}
              />

              <Input
                label="Hora de Salida"
                type="time"
                value={formData.hora_salida || ''}
                onChange={(e) => handleChange('hora_salida', e.target.value || null)}
                error={errors.hora_salida}
                helperText="Deja vacío si el vehículo aún no ha salido"
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleNuevoRegistro}
              >
                Nuevo Registro
              </Button>
              
              <div className="flex space-x-2">
                {modoEdicion && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setModoEdicion(false);
                      setRegistroSeleccionado(null);
                      handleNuevoRegistro();
                    }}
                  >
                    Cancelar Edición
                  </Button>
                )}
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  {modoEdicion ? 'Actualizar' : 'Registrar'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
