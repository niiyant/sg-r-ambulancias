'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AutoCompleteInput } from '@/components/ui/AutoCompleteInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  NuevoRegistro, 
  VehiculoConTipo, 
  ConductorConRazonSocial, 
  Asunto,
  RazonSocial,
  RegistroCompleto,
  FormErrors 
} from '@/types/database';
import { 
  vehiculosService, 
  conductoresService, 
  asuntosService, 
  registrosService,
  tiposVehiculoService,
  razonSocialService
} from '@/services/supabase';

interface FormularioSúperRapidoProps {
  onSubmit: (registro: NuevoRegistro) => Promise<void>;
  onUpdate: (registro: NuevoRegistro & { id: number }) => Promise<void>;
  loading?: boolean;
}

export const FormularioSúperRapido: React.FC<FormularioSúperRapidoProps> = ({
  onSubmit,
  onUpdate,
  loading = false
}) => {
  const [formData, setFormData] = useState<NuevoRegistro>({
    vehiculo_id: 0,
    conductor_id: 0,
    asunto_id: 0,
    fecha: new Date().toISOString().split('T')[0],
    hora_entrada: '',
    hora_salida: null
  });

  // Datos para autocompletado
  const [vehiculos, setVehiculos] = useState<VehiculoConTipo[]>([]);
  const [conductores, setConductores] = useState<ConductorConRazonSocial[]>([]);
  const [asuntos, setAsuntos] = useState<Asunto[]>([]);
  const [tiposVehiculo, setTiposVehiculo] = useState<{ id: number; nombre: string }[]>([]);
  const [razonesSociales, setRazonesSociales] = useState<RazonSocial[]>([]);
  const [conductoresFiltrados, setConductoresFiltrados] = useState<ConductorConRazonSocial[]>([]);
  
  // Estados para creación rápida (no se usan actualmente, pero se mantienen para futuras mejoras)

  const [errors, setErrors] = useState<FormErrors>({});
  const [loadingData, setLoadingData] = useState(true);
  const [esTurnoNocturno, setEsTurnoNocturno] = useState(false);
  const [registrosActivos, setRegistrosActivos] = useState<RegistroCompleto[]>([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroCompleto | null>(null);
  const [nuevoVehiculo, setNuevoVehiculo] = useState({
    numero_economico: '',
    marca: '',
    tipo_id: 0,
    razon_social_id: 0
  });
  const [nuevoTipoVehiculo, setNuevoTipoVehiculo] = useState({
    nombre: ''
  });
  const [nuevoConductor, setNuevoConductor] = useState({
    nombre: '',
    razon_social_id: 0
  });
  const [nuevaRazonSocial, setNuevaRazonSocial] = useState({
    nombre: ''
  });
  const [crearNuevoTipo, setCrearNuevoTipo] = useState(false);
  const [crearNuevaRazonSocial, setCrearNuevaRazonSocial] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        
        const [vehiculosRes, conductoresRes, asuntosRes, tiposRes, razonesRes] = await Promise.all([
          vehiculosService.getAll(),
          conductoresService.getAll(),
          asuntosService.getAll(),
          tiposVehiculoService.getAll(),
          razonSocialService.getAll()
        ]);

        if (vehiculosRes.success && vehiculosRes.data) {
          setVehiculos(vehiculosRes.data);
        }
        if (conductoresRes.success && conductoresRes.data) {
          setConductores(conductoresRes.data);
        }
        if (asuntosRes.success && asuntosRes.data) {
          setAsuntos(asuntosRes.data);
        }
        if (tiposRes.success && tiposRes.data) {
          setTiposVehiculo(tiposRes.data);
          // Inicializar el tipo_id del nuevo vehículo
          if (tiposRes.data.length > 0) {
            setNuevoVehiculo(prev => ({
              ...prev,
              tipo_id: tiposRes.data![0].id
            }));
          }
        }
        if (razonesRes.success && razonesRes.data) {
          setRazonesSociales(razonesRes.data);
          // Inicializar la razón social del nuevo vehículo
          if (razonesRes.data.length > 0) {
            setNuevoVehiculo(prev => ({
              ...prev,
              razon_social_id: razonesRes.data![0].id
            }));
            setNuevoConductor(prev => ({
              ...prev,
              razon_social_id: razonesRes.data![0].id
            }));
          }
        }

        // Cargar registros activos
        const hoy = new Date().toISOString().split('T')[0];
        const registrosRes = await registrosService.getFiltered({
          fecha_desde: hoy,
          fecha_hasta: hoy,
          solo_activos: true
        });

        if (registrosRes.success && registrosRes.data) {
          setRegistrosActivos(registrosRes.data);
        }

        // Detectar turno nocturno
        const horaActual = new Date().getHours();
        setEsTurnoNocturno(horaActual >= 18);

      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // Actualizar fecha según turno
  useEffect(() => {
    if (esTurnoNocturno) {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      setFormData(prev => ({
        ...prev,
        fecha: ayer.toISOString().split('T')[0]
      }));
    } else {
      const hoy = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        fecha: hoy
      }));
    }
  }, [esTurnoNocturno]);

  // Cargar datos del vehículo seleccionado en los campos de edición
  useEffect(() => {
    if (formData.vehiculo_id > 0) {
      const vehiculoSeleccionado = vehiculos.find(v => v.id === formData.vehiculo_id);
      if (vehiculoSeleccionado) {
        setNuevoVehiculo({
          numero_economico: vehiculoSeleccionado.numero_economico,
          marca: vehiculoSeleccionado.marca,
          tipo_id: vehiculoSeleccionado.tipo.id,
          razon_social_id: vehiculoSeleccionado.razon_social.id
        });
        
        // Filtrar conductores por la razón social del vehículo seleccionado
        const conductoresFiltrados = conductores.filter(
          c => c.razon_social.id === vehiculoSeleccionado.razon_social.id
        );
        setConductoresFiltrados(conductoresFiltrados);
      }
    } else {
      // Si no hay vehículo seleccionado, mostrar todos los conductores
      setConductoresFiltrados(conductores);
    }
  }, [formData.vehiculo_id, vehiculos, conductores]);


  // Crear vehículo completo desde el formulario
  const handleCrearVehiculoCompleto = async () => {
    try {
      // Validar campos del vehículo
      if (!nuevoVehiculo.numero_economico.trim()) {
        alert('El número económico es requerido');
        return;
      }
      if (!nuevoVehiculo.marca.trim()) {
        alert('La marca es requerida');
        return;
      }
      let tipoId = nuevoVehiculo.tipo_id;
      let razonSocialId = nuevoVehiculo.razon_social_id;

      // Si se está creando un nuevo tipo, crearlo primero
      if (crearNuevoTipo && nuevoTipoVehiculo.nombre.trim()) {
        const tipoResponse = await tiposVehiculoService.create(nuevoTipoVehiculo);
        if (tipoResponse.success && tipoResponse.data) {
          setTiposVehiculo(prev => [...prev, tipoResponse.data!]);
          tipoId = tipoResponse.data.id;
        } else {
          alert('Error al crear tipo de vehículo: ' + tipoResponse.error);
          return;
        }
      } else if (!tipoId) {
        alert('Debes seleccionar un tipo de vehículo o crear uno nuevo');
        return;
      }

      // Si se está creando una nueva razón social, crearla primero
      if (crearNuevaRazonSocial && nuevaRazonSocial.nombre.trim()) {
        const razonResponse = await razonSocialService.create(nuevaRazonSocial);
        if (razonResponse.success && razonResponse.data) {
          setRazonesSociales(prev => [...prev, razonResponse.data!]);
          razonSocialId = razonResponse.data.id;
        } else {
          alert('Error al crear razón social: ' + razonResponse.error);
          return;
        }
      } else if (crearNuevaRazonSocial && !nuevaRazonSocial.nombre.trim()) {
        alert('Debes escribir el nombre de la nueva razón social');
        return;
      } else if (!crearNuevaRazonSocial && !razonSocialId) {
        alert('Debes seleccionar una razón social o crear una nueva');
        return;
      }

      // Crear el vehículo con el tipo y razón social (existentes o nuevos)
      const vehiculoData = {
        ...nuevoVehiculo,
        tipo_id: tipoId,
        razon_social_id: razonSocialId
      };

      const response = await vehiculosService.create(vehiculoData);
      if (response.success && response.data) {
        setVehiculos(prev => [...prev, response.data!]);
        setFormData(prev => ({
          ...prev,
          vehiculo_id: response.data!.id
        }));
        
        // Limpiar campos del vehículo
        setNuevoVehiculo({
          numero_economico: '',
          marca: '',
          tipo_id: tiposVehiculo.length > 0 ? tiposVehiculo[0].id : 0,
          razon_social_id: razonesSociales.length > 0 ? razonesSociales[0].id : 0
        });
        setNuevoTipoVehiculo({ nombre: '' });
        setNuevaRazonSocial({ nombre: '' });
        setCrearNuevoTipo(false);
        setCrearNuevaRazonSocial(false);
        
        alert(`Vehículo ${nuevoVehiculo.numero_economico} creado exitosamente`);
      } else {
        alert('Error al crear vehículo: ' + response.error);
      }
    } catch (error) {
      console.error('Error creando vehículo:', error);
      alert('Error al crear vehículo');
    }
  };

  const handleNuevoVehiculoChange = (field: string, value: string | number) => {
    setNuevoVehiculo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNuevoTipoVehiculoChange = (field: string, value: string) => {
    setNuevoTipoVehiculo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNuevoConductorChange = (field: string, value: string | number) => {
    setNuevoConductor(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNuevaRazonSocialChange = (field: string, value: string) => {
    setNuevaRazonSocial(prev => ({
      ...prev,
      [field]: value
    }));
  };


  // Actualizar vehículo existente
  const handleActualizarVehiculo = async () => {
    if (!formData.vehiculo_id) {
      alert('No hay vehículo seleccionado para actualizar');
      return;
    }

    try {
      const response = await vehiculosService.update({
        id: formData.vehiculo_id,
        numero_economico: nuevoVehiculo.numero_economico,
        marca: nuevoVehiculo.marca,
        tipo_id: nuevoVehiculo.tipo_id,
        razon_social_id: nuevoVehiculo.razon_social_id
      });

      if (response.success && response.data) {
        // Actualizar la lista de vehículos
        setVehiculos(prev => 
          prev.map(v => v.id === formData.vehiculo_id ? response.data! : v)
        );
        alert('Vehículo actualizado exitosamente');
      } else {
        alert('Error al actualizar vehículo: ' + response.error);
      }
    } catch (error) {
      console.error('Error actualizando vehículo:', error);
      alert('Error al actualizar vehículo');
    }
  };

  // Crear nueva razón social
  const handleCrearRazonSocial = async () => {
    if (!nuevaRazonSocial.nombre.trim()) {
      alert('El nombre de la razón social es requerido');
      return;
    }

    try {
      const response = await razonSocialService.create(nuevaRazonSocial);
      if (response.success && response.data) {
        setRazonesSociales(prev => [...prev, response.data!]);
        setNuevoVehiculo(prev => ({
          ...prev,
          razon_social_id: response.data!.id
        }));
        setNuevoConductor(prev => ({
          ...prev,
          razon_social_id: response.data!.id
        }));
        setNuevaRazonSocial({ nombre: '' });
        setCrearNuevaRazonSocial(false);
        alert(`Razón social "${response.data!.nombre}" creada exitosamente`);
      } else {
        alert('Error al crear razón social: ' + response.error);
      }
    } catch (error) {
      console.error('Error creando razón social:', error);
      alert('Error al crear razón social');
    }
  };

  // Crear nuevo conductor
  const handleCrearConductor = async (nombre: string) => {
    try {
      const response = await conductoresService.create({ 
        nombre,
        razon_social_id: nuevoConductor.razon_social_id || razonesSociales[0]?.id || 0
      });
      if (response.success && response.data) {
        setConductores(prev => [...prev, response.data!]);
        setFormData(prev => ({
          ...prev,
          conductor_id: response.data!.id
        }));
        alert(`Conductor ${nombre} creado exitosamente`);
      }
    } catch (error) {
      console.error('Error creando conductor:', error);
      alert('Error al crear conductor');
    }
  };

  // Crear conductor completo desde el formulario
  const handleCrearConductorCompleto = async () => {
    if (!nuevoConductor.nombre.trim()) {
      alert('El nombre del conductor es requerido');
      return;
    }
    if (!nuevoConductor.razon_social_id) {
      alert('La razón social es requerida');
      return;
    }

    try {
      const response = await conductoresService.create(nuevoConductor);
      if (response.success && response.data) {
        setConductores(prev => [...prev, response.data!]);
        setFormData(prev => ({
          ...prev,
          conductor_id: response.data!.id
        }));
        
        // Limpiar campos del conductor
        setNuevoConductor({
          nombre: '',
          razon_social_id: razonesSociales.length > 0 ? razonesSociales[0].id : 0
        });
        
        alert(`Conductor ${nuevoConductor.nombre} creado exitosamente`);
      } else {
        alert('Error al crear conductor: ' + response.error);
      }
    } catch (error) {
      console.error('Error creando conductor:', error);
      alert('Error al crear conductor');
    }
  };

  // Crear nuevo asunto
  const handleCrearAsunto = async (nombre: string) => {
    try {
      const response = await asuntosService.create({ nombre });
      if (response.success && response.data) {
        setAsuntos(prev => [...prev, response.data!]);
        setFormData(prev => ({
          ...prev,
          asunto_id: response.data!.id
        }));
        alert(`Asunto ${nombre} creado exitosamente`);
      }
    } catch (error) {
      console.error('Error creando asunto:', error);
      alert('Error al crear asunto');
    }
  };

  const handleChange = (field: keyof NuevoRegistro, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSeleccionarRegistro = (registro: RegistroCompleto) => {
    setRegistroSeleccionado(registro);
    setModoEdicion(true);
    setFormData({
      vehiculo_id: registro.vehiculo.id,
      conductor_id: registro.conductor.id,
      asunto_id: registro.asunto.id,
      fecha: registro.fecha,
      hora_entrada: registro.hora_entrada,
      hora_salida: registro.hora_salida
    });
  };

  const handleNuevoRegistro = () => {
    setRegistroSeleccionado(null);
    setModoEdicion(false);
    setFormData({
      vehiculo_id: 0,
      conductor_id: 0,
      asunto_id: 0,
      fecha: esTurnoNocturno 
        ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      hora_entrada: '',
      hora_salida: null
    });
  };

  const handleHoraActual = () => {
    const hora = new Date().toTimeString().split(' ')[0];
    setFormData(prev => ({
      ...prev,
      hora_entrada: hora
    }));
  };

  const handleHoraSalida = () => {
    const hora = new Date().toTimeString().split(' ')[0];
    setFormData(prev => ({
      ...prev,
      hora_salida: hora
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.vehiculo_id) {
      newErrors.vehiculo_id = 'Selecciona o crea un vehículo';
    }
    if (!formData.conductor_id) {
      newErrors.conductor_id = 'Selecciona o crea un conductor';
    }
    if (!formData.asunto_id) {
      newErrors.asunto_id = 'Selecciona o crea un asunto';
    }
    if (!formData.hora_entrada) {
      newErrors.hora_entrada = 'La hora de entrada es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (modoEdicion && registroSeleccionado) {
        await onUpdate({ ...formData, id: registroSeleccionado.id });
      } else {
        await onSubmit(formData);
      }
      
      handleNuevoRegistro();
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    }
  };

  const handleRegistrarSalida = async (registro: RegistroCompleto) => {
    try {
      const horaSalida = new Date().toTimeString().split(' ')[0];
      await registrosService.registrarSalida(registro.id, horaSalida);
      
      // Recargar registros activos
      const hoy = new Date().toISOString().split('T')[0];
      const registrosRes = await registrosService.getFiltered({
        fecha_desde: hoy,
        fecha_hasta: hoy,
        solo_activos: true
      });

      if (registrosRes.success && registrosRes.data) {
        setRegistrosActivos(registrosRes.data);
      }
    } catch (error) {
      console.error('Error registrando salida:', error);
      alert('Error al registrar salida');
    }
  };

  if (loadingData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Cargando datos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicador de turno */}
      <div className={`p-4 rounded-lg border-2 ${
        esTurnoNocturno 
          ? 'bg-blue-100 border-blue-400 text-blue-800' 
          : 'bg-yellow-100 border-yellow-400 text-yellow-800'
      }`}>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{esTurnoNocturno ? '🌙' : '☀️'}</span>
          <div>
            <h3 className="font-semibold">
              {esTurnoNocturno ? 'Turno Nocturno' : 'Turno Diurno'}
            </h3>
            <p className="text-sm">
              {esTurnoNocturno ? 'Los registros se asignan al día anterior' : 'Registros del día actual'}
            </p>
          </div>
        </div>
      </div>

      {/* Registros activos */}
      {registrosActivos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Registros Activos ({registrosActivos.length})</span>
              <Button onClick={handleNuevoRegistro} size="sm">
                + Nuevo
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {registrosActivos.map((registro) => (
                <div
                  key={registro.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    registroSeleccionado?.id === registro.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSeleccionarRegistro(registro)}
                >
                  <div className="font-medium text-sm">
                    {registro.vehiculo.numero_economico} - {registro.vehiculo.marca}
                  </div>
                  <div className="text-xs text-gray-600">
                    {registro.conductor.nombre}
                  </div>
                  <div className="text-xs text-gray-500">
                    {registro.asunto.nombre}
                  </div>
                  <div className="text-xs text-gray-500">
                    Entrada: {new Date(`2000-01-01T${registro.hora_entrada}`).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </div>
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegistrarSalida(registro);
                      }}
                    >
                      Registrar Salida
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Atajos rápidos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Atajos Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleHoraActual}
              className="flex flex-col items-center space-y-1 h-auto py-3"
            >
              <span className="text-lg">🕐</span>
              <span className="text-xs">Hora Actual</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleHoraSalida}
              className="flex flex-col items-center space-y-1 h-auto py-3"
            >
              <span className="text-lg">🚪</span>
              <span className="text-xs">Salida</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNuevoRegistro}
              className="flex flex-col items-center space-y-1 h-auto py-3"
            >
              <span className="text-lg">➕</span>
              <span className="text-xs">Nuevo</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="flex flex-col items-center space-y-1 h-auto py-3"
            >
              <span className="text-lg">🔄</span>
              <span className="text-xs">Actualizar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Formulario principal */}
      <Card>
        <CardHeader>
          <CardTitle>
            {modoEdicion ? 'Editar Registro' : 'Nuevo Registro'}
            {registroSeleccionado && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                - {registroSeleccionado.vehiculo.numero_economico}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Selección de vehículo existente */}
              <AutoCompleteInput
                label="Vehículo *"
                value={formData.vehiculo_id}
                onChange={(value) => handleChange('vehiculo_id', value)}
                options={vehiculos.map(v => ({
                  value: v.id,
                  label: `${v.numero_economico} - ${v.marca} (${v.tipo.nombre}) - ${v.razon_social.nombre}`
                }))}
                placeholder="Selecciona un vehículo"
                error={errors.vehiculo_id}
                allowNew={false}
                helperText="Usa los campos de abajo para crear un nuevo vehículo"
              />

              {/* Campos para crear/editar vehículo */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">
                  {formData.vehiculo_id && formData.vehiculo_id > 0 ? 'Editar Vehículo Seleccionado' : 'Crear Nuevo Vehículo'}
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <Input
                    label="Número Económico"
                    value={nuevoVehiculo.numero_economico}
                    onChange={(e) => handleNuevoVehiculoChange('numero_economico', e.target.value)}
                    placeholder="Ej: AMB-003"
                  />
                  <Input
                    label="Marca"
                    value={nuevoVehiculo.marca}
                    onChange={(e) => handleNuevoVehiculoChange('marca', e.target.value)}
                    placeholder="Ej: Ford, Chevrolet"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        id="crearNuevoTipo"
                        checked={crearNuevoTipo}
                        onChange={(e) => setCrearNuevoTipo(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="crearNuevoTipo" className="text-sm text-gray-700">
                        Crear nuevo tipo de vehículo
                      </label>
                    </div>
                    
                    {crearNuevoTipo ? (
                      <Input
                        label="Nuevo Tipo de Vehículo"
                        value={nuevoTipoVehiculo.nombre}
                        onChange={(e) => handleNuevoTipoVehiculoChange('nombre', e.target.value)}
                        placeholder="Ej: Ambulancia, Rescate, Bomberos"
                      />
                    ) : (
                      <Select
                        label="Tipo de Vehículo"
                        value={nuevoVehiculo.tipo_id || ''}
                        onChange={(e) => handleNuevoVehiculoChange('tipo_id', parseInt(e.target.value))}
                        options={tiposVehiculo.map(tipo => ({
                          value: tipo.id,
                          label: tipo.nombre
                        }))}
                        placeholder="Selecciona un tipo"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        id="crearNuevaRazonSocial"
                        checked={crearNuevaRazonSocial}
                        onChange={(e) => setCrearNuevaRazonSocial(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="crearNuevaRazonSocial" className="text-sm text-gray-700">
                        Crear nueva razón social
                      </label>
                    </div>
                    
                    {crearNuevaRazonSocial ? (
                      <Input
                        label="Nueva Razón Social"
                        value={nuevaRazonSocial.nombre}
                        onChange={(e) => handleNuevaRazonSocialChange('nombre', e.target.value)}
                        placeholder="Ej: Empresa de Ambulancias S.A."
                      />
                    ) : (
                      <Select
                        label="Razón Social"
                        value={nuevoVehiculo.razon_social_id || ''}
                        onChange={(e) => handleNuevoVehiculoChange('razon_social_id', parseInt(e.target.value))}
                        options={razonesSociales.map(razon => ({
                          value: razon.id,
                          label: razon.nombre
                        }))}
                        placeholder="Selecciona una razón social"
                      />
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      onClick={handleCrearVehiculoCompleto}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Crear Vehículo
                    </Button>
                    {formData.vehiculo_id > 0 && (
                      <Button
                        type="button"
                        onClick={handleActualizarVehiculo}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Actualizar
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <AutoCompleteInput
                label="Conductor *"
                value={formData.conductor_id}
                onChange={(value) => handleChange('conductor_id', value)}
                onNewItem={handleCrearConductor}
                options={conductoresFiltrados.map(c => ({
                  value: c.id,
                  label: `${c.nombre} (${c.razon_social.nombre})`
                }))}
                placeholder="Escribe nombre o selecciona"
                error={errors.conductor_id}
                allowNew={true}
              />

              {/* Crear nuevo conductor */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  📝 Crear Nuevo Conductor
                </h4>
                <div className="space-y-3">
                  <Input
                    label="Nombre del Conductor"
                    value={nuevoConductor.nombre}
                    onChange={(e) => handleNuevoConductorChange('nombre', e.target.value)}
                    placeholder="Ej: Juan Pérez"
                  />
                  <Select
                    label="Razón Social"
                    value={nuevoConductor.razon_social_id}
                    onChange={(e) => handleNuevoConductorChange('razon_social_id', parseInt(e.target.value))}
                    options={razonesSociales.map(razon => ({
                      value: razon.id,
                      label: razon.nombre
                    }))}
                    placeholder="Selecciona una razón social"
                  />
                  <Button
                    type="button"
                    onClick={handleCrearConductorCompleto}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Crear Conductor
                  </Button>
                </div>
              </div>

              <AutoCompleteInput
                label="Asunto *"
                value={formData.asunto_id}
                onChange={(value) => handleChange('asunto_id', value)}
                onNewItem={handleCrearAsunto}
                options={asuntos.map(a => ({
                  value: a.id,
                  label: a.nombre
                }))}
                placeholder="Escribe asunto o selecciona"
                error={errors.asunto_id}
                allowNew={true}
              />

              <Input
                label="Fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => handleChange('fecha', e.target.value)}
                error={errors.fecha}
                disabled={esTurnoNocturno}
                helperText={esTurnoNocturno ? "Fecha fija para turno nocturno" : undefined}
              />

              <Input
                label="Hora de Entrada *"
                type="time"
                value={formData.hora_entrada}
                onChange={(e) => handleChange('hora_entrada', e.target.value)}
                error={errors.hora_entrada}
              />

              <Input
                label="Hora de Salida"
                type="time"
                value={formData.hora_salida || ''}
                onChange={(e) => handleChange('hora_salida', e.target.value || null)}
                error={errors.hora_salida}
                helperText="Deja vacío si aún no ha salido"
              />
            </div>

            {/* Información del vehículo seleccionado */}
            {formData.vehiculo_id && formData.vehiculo_id > 0 ? (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Información del Vehículo</h4>
                {(() => {
                  const vehiculoSeleccionado = vehiculos.find(v => v.id === formData.vehiculo_id);
                  if (!vehiculoSeleccionado) return null;
                  
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Número Económico:</span>
                        <p className="text-gray-900">{vehiculoSeleccionado.numero_economico}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Marca:</span>
                        <p className="text-gray-900">{vehiculoSeleccionado.marca}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Tipo:</span>
                        <p className="text-gray-900">{vehiculoSeleccionado.tipo.nombre}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Razón Social:</span>
                        <p className="text-gray-900">{vehiculoSeleccionado.razon_social.nombre}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : null}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleNuevoRegistro}
              >
                Nuevo Registro
              </Button>
              
              <div className="flex space-x-2">
                {modoEdicion && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setModoEdicion(false);
                      setRegistroSeleccionado(null);
                      handleNuevoRegistro();
                    }}
                  >
                    Cancelar Edición
                  </Button>
                )}
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {modoEdicion ? 'Actualizar' : 'Registrar'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

    </div>
  );
};
