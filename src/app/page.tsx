
'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { FormularioSúperRapido } from '@/components/forms/FormularioSúperRapido';
import { 
  NuevoRegistro
} from '@/types/database';
import { 
  registrosService
} from '@/services/supabase';

export default function RegistroPage() {
  const [registroLoading, setRegistroLoading] = useState(false);

  const handleCrearRegistro = async (nuevoRegistro: NuevoRegistro) => {
    try {
      setRegistroLoading(true);
      const response = await registrosService.create(nuevoRegistro);
      
      if (response.success && response.data) {
        alert('Registro creado exitosamente');
        // Recargar la página para actualizar datos
        window.location.reload();
      } else {
        alert('Error al crear registro: ' + response.error);
      }
    } catch (error) {
      console.error('Error creando registro:', error);
      alert('Error al crear registro');
    } finally {
      setRegistroLoading(false);
    }
  };

  const handleActualizarRegistro = async (registroActualizado: NuevoRegistro & { id: number }) => {
    try {
      setRegistroLoading(true);
      const response = await registrosService.update(registroActualizado);
      
      if (response.success && response.data) {
        alert('Registro actualizado exitosamente');
        // Recargar la página para actualizar datos
        window.location.reload();
      } else {
        alert('Error al actualizar registro: ' + response.error);
      }
    } catch (error) {
      console.error('Error actualizando registro:', error);
      alert('Error al actualizar registro');
    } finally {
      setRegistroLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registro de Vehículos</h1>
          <p className="text-gray-600">Sistema de gestión para turnos nocturnos y diurnos</p>
        </div>

        {/* Formulario súper rápido de registros */}
        <FormularioSúperRapido
          onSubmit={handleCrearRegistro}
          onUpdate={handleActualizarRegistro}
          loading={registroLoading}
        />
      </div>
    </Layout>
  );
}
