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
import { RegistroCompleto } from '@/types/database';

interface RegistrosTurnoTableProps {
  registros: RegistroCompleto[];
  onEdit?: (registro: RegistroCompleto) => void;
  onDelete?: (id: number) => void;
  onRegistrarSalida?: (id: number) => void;
  loading?: boolean;
}

export const RegistrosTurnoTable: React.FC<RegistrosTurnoTableProps> = ({
  registros,
  onEdit,
  onDelete,
  onRegistrarSalida,
  loading = false
}) => {
  const formatTime = (time: string | null) => {
    if (!time) return '-';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (horaSalida: string | null) => {
    if (horaSalida) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Completado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Activo
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando registros...</span>
      </div>
    );
  }

  if (registros.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay registros para este turno</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Marca</TableHead>
            <TableHead>Tipo Vehículo</TableHead>
            <TableHead>Número Económico</TableHead>
            <TableHead>Razón Social</TableHead>
            <TableHead>Asunto</TableHead>
            <TableHead>Hora Entrada</TableHead>
            <TableHead>Hora Salida</TableHead>
            <TableHead>Nombre Conductor</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registros.map((registro) => (
            <TableRow key={registro.id}>
              <TableCell className="font-medium">
                {registro.vehiculo.marca}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {registro.vehiculo.tipo.nombre}
                </span>
              </TableCell>
              <TableCell className="font-medium">
                {registro.vehiculo.numero_economico}
              </TableCell>
              <TableCell>{registro.vehiculo.razon_social.nombre}</TableCell>
              <TableCell>{registro.asunto.nombre}</TableCell>
              <TableCell>{formatTime(registro.hora_entrada)}</TableCell>
              <TableCell>{formatTime(registro.hora_salida)}</TableCell>
              <TableCell className="font-medium">
                {registro.conductor.nombre}
              </TableCell>
              <TableCell>{getStatusBadge(registro.hora_salida)}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {!registro.hora_salida && onRegistrarSalida && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRegistrarSalida(registro.id)}
                    >
                      Registrar Salida
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(registro)}
                    >
                      Editar
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(registro.id)}
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
