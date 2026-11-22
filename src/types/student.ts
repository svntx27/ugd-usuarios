export interface ExpedienteDoctoralReal {
    id: string;
    estado: string; // 'EN_ESTUDIOS' | 'GRADUADO' | 'EN_DEVENGAMIENTO' | 'DEVENGADO' | 'EN_COBRO' | 'DESTITUIDO' | 'RENUNCIA' | 'SUSPENDIDO'
    programa?: string | null;
    programaDoctoral?: {
        id: string;
        nombre: string;
        codigo?: string;
        descripcion?: string;
        tituloAObtener?: string | null;
    } | null;
    institucionDestino?: {
        nombre: string;
        pais?: string | null;
    } | null;
    tituloInvestigacion?: string | null;
    oficioRegistroProyecto?: string | null;
    fechaOficioRegistro?: string | null;
    tipoFinanciamiento?: string | null;
    tieneApoyoProyecto?: boolean;
    contratoInicio?: string | null;
    contratoFin?: string | null;
    contratoMeses?: number | null;
    convenio?: string | null;
    convenioObj?: {
        id: string;
        nombre: string;
        fechaInicio?: string | null;
        fechaFin?: string | null;
    } | null;
    adendas?: Array<{
        id: string;
        numeroAdenda: number;
        tipoModificacion?: string | null;
        meses?: number | null;
        fechaInicio?: string | null;
        fechaFin?: string | null;
    }>;
    devengamiento?: {
        id: string;
        estado: string; // 'PENDIENTE' | 'EN_CURSO' | 'FINALIZADO'
        fechaInicio?: string | null;
        fechaFinEstimada?: string | null;
        tiempoTexto?: string | null;
        registroSenescyt?: string | null;
        oficioNotificacion?: string | null;
    } | null;
    tieneAlertaLegal?: boolean;
    observaciones?: string | null;
}

export interface DoctorandoProfile {
    id: string;
    carpeta?: string | null;
    numeroOrden?: number | null;
    cedula: string;
    nombres: string;
    apellidos: string;
    nombreCompleto?: string;
    sexo?: string | null;
    fechaNacimiento?: string | null;
    correoInstitucional: string;
    telefono?: string | null;
    tituloTercerNivel?: string | null;
    tituloCuartoNivel?: string | null;
    facultad?: string | null;
    facultadObj?: {
        id: string;
        nombre: string;
        codigo?: string;
    } | null;
    carrera?: string | null;
    carreraObj?: {
        id: string;
        nombre: string;
        codigo?: string;
    } | null;
    expedientes: ExpedienteDoctoralReal[];
}
