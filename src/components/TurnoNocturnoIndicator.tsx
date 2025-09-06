'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface TurnoNocturnoIndicatorProps {
  onToggleTurno: (esNocturno: boolean) => void;
}

export const TurnoNocturnoIndicator: React.FC<TurnoNocturnoIndicatorProps> = ({
  onToggleTurno
}) => {
  const [esTurnoNocturno, setEsTurnoNocturno] = useState(false);
  const [horaActual, setHoraActual] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setHoraActual(new Date());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hora = new Date().getHours();
    const esNocturno = hora >= 18 || hora < 6;
    setEsTurnoNocturno(esNocturno);
    onToggleTurno(esNocturno);
  }, [onToggleTurno]);

  const toggleTurno = () => {
    const nuevoEstado = !esTurnoNocturno;
    setEsTurnoNocturno(nuevoEstado);
    onToggleTurno(nuevoEstado);
  };

  const getTurnoInfo = () => {
    const tiempoFormateado = horaActual.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (esTurnoNocturno) {
      return {
        icon: '🌙',
        titulo: 'Turno Nocturno',
        descripcion: `Inicio del turno: ${tiempoFormateado}`,
        color: 'bg-blue-100 border-blue-400 text-blue-800'
      };
    } else {
      return {
        icon: '☀️',
        titulo: 'Turno Diurno',
        descripcion: `Hora actual: ${tiempoFormateado}`,
        color: 'bg-yellow-100 border-yellow-400 text-yellow-800'
      };
    }
  };

  const info = getTurnoInfo();

  return (
    <Card className={`border-2 ${info.color}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{info.icon}</span>
            <div>
              <h3 className="font-semibold">{info.titulo}</h3>
              <p className="text-sm opacity-80">{info.descripcion}</p>
            </div>
          </div>
          <button
            onClick={toggleTurno}
            className="px-3 py-1 text-sm font-medium rounded-md bg-white bg-opacity-50 hover:bg-opacity-75 transition-colors"
          >
            Cambiar a {esTurnoNocturno ? 'Diurno' : 'Nocturno'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
