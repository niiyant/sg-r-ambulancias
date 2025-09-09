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
import { formatTime24h } from '@/utils/timeFormatter';

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
    return formatTime24h(time);
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
    <div className="w-full">
      {/* Vista compacta para pantallas pequeñas y medianas */}
      <div className="block xl:hidden">
        {registros.map((registro) => (
          <div key={registro.id} className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-500 sm:text-gray-900 text-black">Vehículo:</span>
                <p className="font-medium sm:text-gray-900 text-black">{registro.vehiculo.marca} - {registro.vehiculo.numero_economico}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500 sm:text-gray-900 text-black">Tipo:</span>
                <p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {registro.vehiculo.tipo.nombre}
                  </span>
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-500 sm:text-gray-900 text-black">Conductor:</span>
                <p className="truncate sm:text-gray-900 text-black">{registro.conductor.nombre}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500 sm:text-gray-900 text-black">Estado:</span>
                <p>{getStatusBadge(registro.hora_salida)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500 sm:text-gray-900 text-black">Razón Social:</span>
                <p className="truncate sm:text-gray-900 text-black">{registro.vehiculo.razon_social.nombre}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500 sm:text-gray-900 text-black">Asunto:</span>
                <p className="truncate sm:text-gray-900 text-black">{registro.asunto.nombre}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500 sm:text-gray-900 text-black">Entrada:</span>
                <p className="font-mono sm:text-gray-900 text-black">{formatTime(registro.hora_entrada)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500 sm:text-gray-900 text-black">Salida:</span>
                <p className="font-mono sm:text-gray-900 text-black">{formatTime(registro.hora_salida)}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-end">
              {!registro.hora_salida && onRegistrarSalida && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRegistrarSalida(registro.id)}
                  className="text-xs px-3 py-1"
                >
                  Registrar Salida
                </Button>
              )}
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(registro)}
                  className="text-xs px-3 py-1"
                >
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(registro.id)}
                  className="text-xs px-3 py-1"
                >
                  Eliminar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Vista de tabla para pantallas extra grandes */}
      <div className="hidden xl:block overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Marca</TableHead>
              <TableHead className="whitespace-nowrap">Tipo Vehículo</TableHead>
              <TableHead className="whitespace-nowrap">Número Económico</TableHead>
              <TableHead className="whitespace-nowrap">Razón Social</TableHead>
              <TableHead className="whitespace-nowrap">Asunto</TableHead>
              <TableHead className="whitespace-nowrap">Hora Entrada</TableHead>
              <TableHead className="whitespace-nowrap">Hora Salida</TableHead>
              <TableHead className="whitespace-nowrap">Nombre Conductor</TableHead>
              <TableHead className="whitespace-nowrap">Estado</TableHead>
              <TableHead className="whitespace-nowrap">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros.map((registro) => (
              <TableRow key={registro.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {registro.vehiculo.marca}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {registro.vehiculo.tipo.nombre}
                  </span>
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap">
                  {registro.vehiculo.numero_economico}
                </TableCell>
                <TableCell className="whitespace-nowrap">{registro.vehiculo.razon_social.nombre}</TableCell>
                <TableCell className="whitespace-nowrap">{registro.asunto.nombre}</TableCell>
                <TableCell className="whitespace-nowrap">{formatTime(registro.hora_entrada)}</TableCell>
                <TableCell className="whitespace-nowrap">{formatTime(registro.hora_salida)}</TableCell>
                <TableCell className="font-medium whitespace-nowrap">
                  {registro.conductor.nombre}
                </TableCell>
                <TableCell className="whitespace-nowrap">{getStatusBadge(registro.hora_salida)}</TableCell>
                <TableCell className="whitespace-nowrap">
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
    </div>
  );
};
