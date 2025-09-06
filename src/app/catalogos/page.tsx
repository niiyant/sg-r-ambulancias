'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { 
  TipoVehiculo, 
  Asunto, 
  ConductorConRazonSocial,
  RazonSocial
} from '@/types/database';
import { 
  tiposVehiculoService, 
  asuntosService, 
  conductoresService,
  razonSocialService
} from '@/services/supabase';

export default function CatalogosPage() {
  const [tiposVehiculo, setTiposVehiculo] = useState<TipoVehiculo[]>([]);
  const [asuntos, setAsuntos] = useState<Asunto[]>([]);
  const [conductores, setConductores] = useState<ConductorConRazonSocial[]>([]);
  const [razonesSociales, setRazonesSociales] = useState<RazonSocial[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para modales
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [showAsuntoModal, setShowAsuntoModal] = useState(false);
  const [showConductorModal, setShowConductorModal] = useState(false);
  
  // Estados para formularios
  const [tipoForm, setTipoForm] = useState({ nombre: '' });
  const [asuntoForm, setAsuntoForm] = useState({ nombre: '' });
  const [conductorForm, setConductorForm] = useState({ nombre: '', razon_social_id: 0 });
  
  const [editingTipo, setEditingTipo] = useState<TipoVehiculo | null>(null);
  const [editingAsunto, setEditingAsunto] = useState<Asunto | null>(null);
  const [editingConductor, setEditingConductor] = useState<ConductorConRazonSocial | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [tiposRes, asuntosRes, conductoresRes, razonesRes] = await Promise.all([
        tiposVehiculoService.getAll(),
        asuntosService.getAll(),
        conductoresService.getAll(),
        razonSocialService.getAll()
      ]);

      if (tiposRes.success && tiposRes.data) {
        setTiposVehiculo(tiposRes.data);
      }
      if (asuntosRes.success && asuntosRes.data) {
        setAsuntos(asuntosRes.data);
      }
      if (conductoresRes.success && conductoresRes.data) {
        setConductores(conductoresRes.data);
      }
      if (razonesRes.success && razonesRes.data) {
        setRazonesSociales(razonesRes.data);
        // Inicializar la razón social del formulario
        if (razonesRes.data.length > 0) {
          setConductorForm(prev => ({
            ...prev,
            razon_social_id: razonesRes.data![0].id
          }));
        }
      }
    } catch (error) {
      console.error('Error cargando catálogos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para tipos de vehículo
  const handleCrearTipo = async () => {
    try {
      const response = await tiposVehiculoService.create(tipoForm);
      if (response.success && response.data) {
        setTiposVehiculo(prev => [...prev, response.data!]);
        setTipoForm({ nombre: '' });
        setShowTipoModal(false);
        alert('Tipo de vehículo creado exitosamente');
      } else {
        alert('Error al crear tipo: ' + response.error);
      }
    } catch (error) {
      console.error('Error creando tipo:', error);
      alert('Error al crear tipo');
    }
  };

  const handleActualizarTipo = async () => {
    if (!editingTipo) return;
    
    try {
      const response = await tiposVehiculoService.update({
        id: editingTipo.id,
        nombre: tipoForm.nombre
      });
      if (response.success && response.data) {
        setTiposVehiculo(prev => 
          prev.map(t => t.id === editingTipo.id ? response.data! : t)
        );
        setTipoForm({ nombre: '' });
        setEditingTipo(null);
        setShowTipoModal(false);
        alert('Tipo de vehículo actualizado exitosamente');
      } else {
        alert('Error al actualizar tipo: ' + response.error);
      }
    } catch (error) {
      console.error('Error actualizando tipo:', error);
      alert('Error al actualizar tipo');
    }
  };

  const handleEliminarTipo = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este tipo de vehículo?')) return;
    
    try {
      const response = await tiposVehiculoService.delete(id);
      if (response.success) {
        setTiposVehiculo(prev => prev.filter(t => t.id !== id));
        alert('Tipo de vehículo eliminado exitosamente');
      } else {
        alert('Error al eliminar tipo: ' + response.error);
      }
    } catch (error) {
      console.error('Error eliminando tipo:', error);
      alert('Error al eliminar tipo');
    }
  };

  // Funciones para asuntos
  const handleCrearAsunto = async () => {
    try {
      const response = await asuntosService.create(asuntoForm);
      if (response.success && response.data) {
        setAsuntos(prev => [...prev, response.data!]);
        setAsuntoForm({ nombre: '' });
        setShowAsuntoModal(false);
        alert('Asunto creado exitosamente');
      } else {
        alert('Error al crear asunto: ' + response.error);
      }
    } catch (error) {
      console.error('Error creando asunto:', error);
      alert('Error al crear asunto');
    }
  };

  const handleActualizarAsunto = async () => {
    if (!editingAsunto) return;
    
    try {
      const response = await asuntosService.update({
        id: editingAsunto.id,
        nombre: asuntoForm.nombre
      });
      if (response.success && response.data) {
        setAsuntos(prev => 
          prev.map(a => a.id === editingAsunto.id ? response.data! : a)
        );
        setAsuntoForm({ nombre: '' });
        setEditingAsunto(null);
        setShowAsuntoModal(false);
        alert('Asunto actualizado exitosamente');
      } else {
        alert('Error al actualizar asunto: ' + response.error);
      }
    } catch (error) {
      console.error('Error actualizando asunto:', error);
      alert('Error al actualizar asunto');
    }
  };

  const handleEliminarAsunto = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este asunto?')) return;
    
    try {
      const response = await asuntosService.delete(id);
      if (response.success) {
        setAsuntos(prev => prev.filter(a => a.id !== id));
        alert('Asunto eliminado exitosamente');
      } else {
        alert('Error al eliminar asunto: ' + response.error);
      }
    } catch (error) {
      console.error('Error eliminando asunto:', error);
      alert('Error al eliminar asunto');
    }
  };

  // Funciones para conductores
  const handleCrearConductor = async () => {
    try {
      const response = await conductoresService.create(conductorForm);
      if (response.success && response.data) {
        setConductores(prev => [...prev, response.data!]);
        setConductorForm({ nombre: '', razon_social_id: razonesSociales.length > 0 ? razonesSociales[0].id : 0 });
        setShowConductorModal(false);
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
        nombre: conductorForm.nombre
      });
      if (response.success && response.data) {
        setConductores(prev => 
          prev.map(c => c.id === editingConductor.id ? response.data! : c)
        );
        setConductorForm({ nombre: '', razon_social_id: razonesSociales.length > 0 ? razonesSociales[0].id : 0 });
        setEditingConductor(null);
        setShowConductorModal(false);
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

  // Funciones para abrir modales de edición
  const openEditTipo = (tipo: TipoVehiculo) => {
    setEditingTipo(tipo);
    setTipoForm({ nombre: tipo.nombre });
    setShowTipoModal(true);
  };

  const openEditAsunto = (asunto: Asunto) => {
    setEditingAsunto(asunto);
    setAsuntoForm({ nombre: asunto.nombre });
    setShowAsuntoModal(true);
  };

  const openEditConductor = (conductor: ConductorConRazonSocial) => {
    setEditingConductor(conductor);
    setConductorForm({ 
      nombre: conductor.nombre, 
      razon_social_id: conductor.razon_social.id 
    });
    setShowConductorModal(true);
  };

  // Funciones para cerrar modales
  const closeTipoModal = () => {
    setShowTipoModal(false);
    setEditingTipo(null);
    setTipoForm({ nombre: '' });
  };

  const closeAsuntoModal = () => {
    setShowAsuntoModal(false);
    setEditingAsunto(null);
    setAsuntoForm({ nombre: '' });
  };

  const closeConductorModal = () => {
    setShowConductorModal(false);
    setEditingConductor(null);
    setConductorForm({ nombre: '', razon_social_id: razonesSociales.length > 0 ? razonesSociales[0].id : 0 });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Cargando catálogos...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catálogos</h1>
          <p className="text-gray-600">Gestión de tipos de vehículo, asuntos y conductores</p>
        </div>

        {/* Tipos de Vehículo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tipos de Vehículo</CardTitle>
            <Button onClick={() => setShowTipoModal(true)}>
              Nuevo Tipo
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tiposVehiculo.map((tipo) => (
                <div key={tipo.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{tipo.nombre}</span>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditTipo(tipo)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleEliminarTipo(tipo.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
              {tiposVehiculo.length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay tipos de vehículo registrados</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Asuntos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Asuntos</CardTitle>
            <Button onClick={() => setShowAsuntoModal(true)}>
              Nuevo Asunto
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {asuntos.map((asunto) => (
                <div key={asunto.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{asunto.nombre}</span>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditAsunto(asunto)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleEliminarAsunto(asunto.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
              {asuntos.length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay asuntos registrados</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Conductores */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Conductores</CardTitle>
            <Button onClick={() => setShowConductorModal(true)}>
              Nuevo Conductor
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conductores.map((conductor) => (
                <div key={conductor.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{conductor.nombre}</span>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditConductor(conductor)}
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
                <p className="text-gray-500 text-center py-4">No hay conductores registrados</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal Tipo de Vehículo */}
        <Modal
          isOpen={showTipoModal}
          onClose={closeTipoModal}
          title={editingTipo ? 'Editar Tipo de Vehículo' : 'Nuevo Tipo de Vehículo'}
        >
          <div className="space-y-4">
            <Input
              label="Nombre del Tipo"
              value={tipoForm.nombre}
              onChange={(e) => setTipoForm({ nombre: e.target.value })}
              placeholder="Ej: Ambulancia, Patrulla, Bomberos"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={closeTipoModal}>
                Cancelar
              </Button>
              <Button onClick={editingTipo ? handleActualizarTipo : handleCrearTipo}>
                {editingTipo ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal Asunto */}
        <Modal
          isOpen={showAsuntoModal}
          onClose={closeAsuntoModal}
          title={editingAsunto ? 'Editar Asunto' : 'Nuevo Asunto'}
        >
          <div className="space-y-4">
            <Input
              label="Nombre del Asunto"
              value={asuntoForm.nombre}
              onChange={(e) => setAsuntoForm({ nombre: e.target.value })}
              placeholder="Ej: Emergencia Médica, Rescate, Traslado"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={closeAsuntoModal}>
                Cancelar
              </Button>
              <Button onClick={editingAsunto ? handleActualizarAsunto : handleCrearAsunto}>
                {editingAsunto ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal Conductor */}
        <Modal
          isOpen={showConductorModal}
          onClose={closeConductorModal}
          title={editingConductor ? 'Editar Conductor' : 'Nuevo Conductor'}
        >
          <div className="space-y-4">
            <Input
              label="Nombre del Conductor"
              value={conductorForm.nombre}
              onChange={(e) => setConductorForm(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Nombre completo del conductor"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razón Social
              </label>
              <select
                value={conductorForm.razon_social_id}
                onChange={(e) => setConductorForm(prev => ({ ...prev, razon_social_id: parseInt(e.target.value) }))}
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
              <Button variant="outline" onClick={closeConductorModal}>
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
