/**
 * Formatea una hora en formato de 24 horas
 * Garantiza el formato HH:MM en todos los dispositivos
 */
export const formatTime24h = (time: string | null): string => {
  if (!time) return "-";

  try {
    // Crear un objeto Date con la hora
    const date = new Date(`2000-01-01T${time}`);

    // Obtener horas y minutos directamente
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formateando hora:", error);
    return "-";
  }
};

/**
 * Formatea la hora actual en formato de 24 horas
 */
export const formatCurrentTime24h = (): string => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};
