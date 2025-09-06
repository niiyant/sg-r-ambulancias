'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { 
  NuevoVehiculo, 
  ActualizarVehiculo,
  TipoVehiculo,
  RazonSocial,
  FormErrors 
} from '@/types/database';
import { tiposVehiculoService, razonSocialService } from '@/services/supabase';

interface VehiculoFormProps {
  onSubmit: (vehiculo: NuevoVehiculo | ActualizarVehiculo) => Promise<void>;
  loading?: boolean;
  initialData?: Partial<NuevoVehiculo | ActualizarVehiculo>;
  isEdit?: boolean;
}

export const VehiculoForm: React.FC<VehiculoFormProps> = ({
  onSubmit,
  loading = false,
  initialData,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<NuevoVehiculo>({
    numero_economico: initialData?.numero_economico || '',
    marca: initialData?.marca || '',
    tipo_id: initialData?.tipo_id || 0,
    razon_social_id: initialData?.razon_social_id || 0
  });

  const [tiposVehiculo, setTiposVehiculo] = useState<TipoVehiculo[]>([]);
  const [razonesSociales, setRazonesSociales] = useState<RazonSocial[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadingData, setLoadingData] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [tiposRes, razonesRes] = await Promise.all([
          tiposVehiculoService.getAll(),
          razonSocialService.getAll()
        ]);
        
        if (tiposRes.success && tiposRes.data) {
          setTiposVehiculo(tiposRes.data);
        }
        
        if (razonesRes.success && razonesRes.data) {
          setRazonesSociales(razonesRes.data);
          // Inicializar la razón social si no hay una seleccionada
          if (!formData.razon_social_id && razonesRes.data.length > 0) {
            setFormData(prev => ({
              ...prev,
              razon_social_id: razonesRes.data![0].id
            }));
          }
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (field: keyof NuevoVehiculo, value: string | number) => {
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

    if (!formData.numero_economico.trim()) {
      newErrors.numero_economico = 'El número económico es requerido';
    }
    if (!formData.marca.trim()) {
      newErrors.marca = 'La marca es requerida';
    }
    if (!formData.tipo_id) {
      newErrors.tipo_id = 'Selecciona un tipo de vehículo';
    }
    if (!formData.razon_social_id) {
      newErrors.razon_social_id = 'La razón social es requerida';
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
      const dataToSubmit = isEdit && initialData && 'id' in initialData
        ? { ...formData, id: (initialData as ActualizarVehiculo).id } as ActualizarVehiculo
        : formData;
      
      await onSubmit(dataToSubmit);
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
        <CardTitle>{isEdit ? 'Editar Vehículo' : 'Nuevo Vehículo'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Número Económico *"
              value={formData.numero_economico}
              onChange={(e) => handleChange('numero_economico', e.target.value)}
              placeholder="Ej: AMB-001"
              error={errors.numero_economico}
            />

            <Input
              label="Marca *"
              value={formData.marca}
              onChange={(e) => handleChange('marca', e.target.value)}
              placeholder="Ej: Ford, Chevrolet"
              error={errors.marca}
            />

            <Select
              label="Tipo de Vehículo *"
              value={formData.tipo_id}
              onChange={(e) => handleChange('tipo_id', parseInt(e.target.value))}
              options={tiposVehiculo.map(t => ({
                value: t.id,
                label: t.nombre
              }))}
              placeholder="Selecciona un tipo"
              error={errors.tipo_id}
            />

            <Select
              label="Razón Social *"
              value={formData.razon_social_id}
              onChange={(e) => handleChange('razon_social_id', parseInt(e.target.value))}
              options={razonesSociales.map(razon => ({
                value: razon.id,
                label: razon.nombre
              }))}
              placeholder="Selecciona una razón social"
              error={errors.razon_social_id}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              {isEdit ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
