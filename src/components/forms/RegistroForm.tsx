'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { 
  NuevoRegistro, 
  VehiculoConTipo, 
  ConductorConRazonSocial, 
  Asunto,
  FormErrors 
} from '@/types/database';
import { vehiculosService, conductoresService, asuntosService } from '@/services/supabase';

interface RegistroFormProps {
  onSubmit: (registro: NuevoRegistro) => Promise<void>;
  loading?: boolean;
  initialData?: Partial<NuevoRegistro>;
}

export const RegistroForm: React.FC<RegistroFormProps> = ({
  onSubmit,
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
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadingData, setLoadingData] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
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
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

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
      await onSubmit(formData);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
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
    <Card>
      <CardHeader>
        <CardTitle>Registro de Entrada/Salida</CardTitle>
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              {initialData ? 'Actualizar' : 'Registrar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
