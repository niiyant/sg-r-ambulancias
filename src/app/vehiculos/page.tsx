'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { VehiculoForm } from '@/components/forms/VehiculoForm';
import { VehiculosTable } from '@/components/tables/VehiculosTable';
import { 
  VehiculoConTipo, 
  NuevoVehiculo, 
  ActualizarVehiculo 
} from '@/types/database';
import { vehiculosService } from '@/services/supabase';

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<VehiculoConTipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<VehiculoConTipo | null>(null);

  // Cargar vehículos
  useEffect(() => {
    loadVehiculos();
  }, []);

  const loadVehiculos = async () => {
    try {
      setLoading(true);
      const response = await vehiculosService.getAll();
      
      if (response.success && response.data) {
        setVehiculos(response.data);
      } else {
        console.error('Error cargando vehículos:', response.error);
      }
    } catch (error) {
      console.error('Error cargando vehículos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearVehiculo = async (nuevoVehiculo: NuevoVehiculo) => {
    try {
      setFormLoading(true);
      const response = await vehiculosService.create(nuevoVehiculo);
      
      if (response.success && response.data) {
        setVehiculos(prev => [...prev, response.data!]);
        setShowFormModal(false);
        alert('Vehículo creado exitosamente');
      } else {
        alert('Error al crear vehículo: ' + response.error);
      }
    } catch (error) {
      console.error('Error creando vehículo:', error);
      alert('Error al crear vehículo');
    } finally {
      setFormLoading(false);
    }
  };

  const handleActualizarVehiculo = async (vehiculoActualizado: ActualizarVehiculo) => {
    try {
      setFormLoading(true);
      const response = await vehiculosService.update(vehiculoActualizado);
      
      if (response.success && response.data) {
        setVehiculos(prev => 
          prev.map(v => v.id === vehiculoActualizado.id ? response.data! : v)
        );
        setShowFormModal(false);
        setEditingVehiculo(null);
        alert('Vehículo actualizado exitosamente');
      } else {
        alert('Error al actualizar vehículo: ' + response.error);
      }
    } catch (error) {
      console.error('Error actualizando vehículo:', error);
      alert('Error al actualizar vehículo');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEliminarVehiculo = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este vehículo?')) {
      return;
    }

    try {
      const response = await vehiculosService.delete(id);
      
      if (response.success) {
        setVehiculos(prev => prev.filter(v => v.id !== id));
        alert('Vehículo eliminado exitosamente');
      } else {
        alert('Error al eliminar vehículo: ' + response.error);
      }
    } catch (error) {
      console.error('Error eliminando vehículo:', error);
      alert('Error al eliminar vehículo');
    }
  };

  const handleEditVehiculo = (vehiculo: VehiculoConTipo) => {
    setEditingVehiculo(vehiculo);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingVehiculo(null);
  };

  const handleSubmit = async (vehiculo: NuevoVehiculo | ActualizarVehiculo) => {
    if (editingVehiculo) {
      await handleActualizarVehiculo(vehiculo as ActualizarVehiculo);
    } else {
      await handleCrearVehiculo(vehiculo as NuevoVehiculo);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-gray-900 text-black">Vehículos</h1>
            <p className="text-gray-600 sm:text-gray-600 text-gray-700">Gestión de vehículos y ambulancias</p>
          </div>
          <Button onClick={() => setShowFormModal(true)}>
            Nuevo Vehículo
          </Button>
        </div>

        {/* Tabla de vehículos */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Vehículos</CardTitle>
          </CardHeader>
          <CardContent>
            <VehiculosTable
              vehiculos={vehiculos}
              onEdit={handleEditVehiculo}
              onDelete={handleEliminarVehiculo}
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Modal de formulario */}
        <Modal
          isOpen={showFormModal}
          onClose={handleCloseModal}
          title={editingVehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          size="lg"
        >
          <VehiculoForm
            onSubmit={handleSubmit}
            loading={formLoading}
            initialData={editingVehiculo || undefined}
            isEdit={!!editingVehiculo}
          />
        </Modal>
      </div>
    </Layout>
  );
}
