'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConductorConRazonSocial, RazonSocial } from '@/types/database';
import { conductoresService, razonSocialService } from '@/services/supabase';

export default function ConductoresPage() {
  const [conductores, setConductores] = useState<ConductorConRazonSocial[]>([]);
  const [razonesSociales, setRazonesSociales] = useState<RazonSocial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', razon_social_id: 0 });
  const [editingConductor, setEditingConductor] = useState<ConductorConRazonSocial | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [conductoresRes, razonesRes] = await Promise.all([
        conductoresService.getAll(),
        razonSocialService.getAll()
      ]);
      
      if (conductoresRes.success && conductoresRes.data) {
        setConductores(conductoresRes.data);
      } else {
        console.error('Error cargando conductores:', conductoresRes.error);
      }

      if (razonesRes.success && razonesRes.data) {
        setRazonesSociales(razonesRes.data);
        // Inicializar la razón social del formulario
        if (razonesRes.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            razon_social_id: razonesRes.data![0].id
          }));
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearConductor = async () => {
    try {
      const response = await conductoresService.create(formData);
      
      if (response.success && response.data) {
        setConductores(prev => [...prev, response.data!]);
        setFormData({ nombre: '', razon_social_id: 0 });
        setShowFormModal(false);
        alert('Conductor creado exitosamente');
      } else {
        alert('Error al crear conductor: ' + response.error);
      }
    } catch (error) {
      console.error('Error creando conductor:', error);
      alert('Error al crear conductor');
    }
  };

  const handleActualizarConductor = async () => {
    if (!editingConductor) return;
    
    try {
      const response = await conductoresService.update({
        id: editingConductor.id,
        nombre: formData.nombre
      });
      
      if (response.success && response.data) {
        setConductores(prev => 
          prev.map(c => c.id === editingConductor.id ? response.data! : c)
        );
        setFormData({ nombre: '', razon_social_id: 0 });
        setEditingConductor(null);
        setShowFormModal(false);
        alert('Conductor actualizado exitosamente');
      } else {
        alert('Error al actualizar conductor: ' + response.error);
      }
    } catch (error) {
      console.error('Error actualizando conductor:', error);
      alert('Error al actualizar conductor');
    }
  };

  const handleEliminarConductor = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este conductor?')) return;
    
    try {
      const response = await conductoresService.delete(id);
      
      if (response.success) {
        setConductores(prev => prev.filter(c => c.id !== id));
        alert('Conductor eliminado exitosamente');
      } else {
        alert('Error al eliminar conductor: ' + response.error);
      }
    } catch (error) {
      console.error('Error eliminando conductor:', error);
      alert('Error al eliminar conductor');
    }
  };

  const handleEditConductor = (conductor: ConductorConRazonSocial) => {
    setEditingConductor(conductor);
    setFormData({ 
      nombre: conductor.nombre, 
      razon_social_id: conductor.razon_social.id 
    });
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingConductor(null);
    setFormData({ nombre: '', razon_social_id: 0 });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Cargando conductores...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Conductores</h1>
            <p className="text-gray-600">Gestión de conductores</p>
          </div>
          <Button onClick={() => setShowFormModal(true)}>
            Nuevo Conductor
          </Button>
        </div>

        {/* Lista de conductores */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Conductores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conductores.map((conductor) => (
                <div key={conductor.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="font-medium text-lg">{conductor.nombre}</span>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditConductor(conductor)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleEliminarConductor(conductor.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
              {conductores.length === 0 && (
                <p className="text-gray-500 text-center py-8">No hay conductores registrados</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal de formulario */}
        <Modal
          isOpen={showFormModal}
          onClose={handleCloseModal}
          title={editingConductor ? 'Editar Conductor' : 'Nuevo Conductor'}
        >
          <div className="space-y-4">
            <Input
              label="Nombre del Conductor"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Nombre completo del conductor"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razón Social
              </label>
              <select
                value={formData.razon_social_id}
                onChange={(e) => setFormData(prev => ({ ...prev, razon_social_id: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Selecciona una razón social</option>
                {razonesSociales.map(razon => (
                  <option key={razon.id} value={razon.id}>
                    {razon.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button onClick={editingConductor ? handleActualizarConductor : handleCrearConductor}>
                {editingConductor ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
