'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface AtajosRapidosProps {
  onHoraActual: () => void;
  onHoraEntrada: () => void;
  onHoraSalida: () => void;
  onLimpiarFormulario: () => void;
}

export const AtajosRapidos: React.FC<AtajosRapidosProps> = ({
  onHoraActual,
  onHoraEntrada,
  onHoraSalida,
  onLimpiarFormulario
}) => {

  const atajos = [
    {
      label: 'Hora Actual',
      icon: '🕐',
      onClick: onHoraActual,
      description: 'Establecer hora actual'
    },
    {
      label: 'Entrada Rápida',
      icon: '🚪',
      onClick: onHoraEntrada,
      description: 'Marcar entrada con hora actual'
    },
    {
      label: 'Salida Rápida',
      icon: '🚪',
      onClick: onHoraSalida,
      description: 'Marcar salida con hora actual'
    },
    {
      label: 'Nuevo',
      icon: '➕',
      onClick: onLimpiarFormulario,
      description: 'Limpiar formulario'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Atajos Rápidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {atajos.map((atajo, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={atajo.onClick}
              className="flex flex-col items-center space-y-1 h-auto py-3"
              title={atajo.description}
            >
              <span className="text-lg">{atajo.icon}</span>
              <span className="text-xs">{atajo.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
