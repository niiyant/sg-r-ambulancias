'use client';

import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { VehiculoConTipo } from '@/types/database';

interface VehiculosTableProps {
  vehiculos: VehiculoConTipo[];
  onEdit?: (vehiculo: VehiculoConTipo) => void;
  onDelete?: (id: number) => void;
  loading?: boolean;
}

export const VehiculosTable: React.FC<VehiculosTableProps> = ({
  vehiculos,
  onEdit,
  onDelete,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando vehículos...</span>
      </div>
    );
  }

  if (vehiculos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay vehículos registrados</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número Económico</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Razón Social</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehiculos.map((vehiculo) => (
            <TableRow key={vehiculo.id}>
              <TableCell className="font-medium">
                {vehiculo.numero_economico}
              </TableCell>
              <TableCell>{vehiculo.marca}</TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {vehiculo.tipo.nombre}
                </span>
              </TableCell>
              <TableCell>{vehiculo.razon_social.nombre}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(vehiculo)}
                    >
                      Editar
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(vehiculo.id)}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
