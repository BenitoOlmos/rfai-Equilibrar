export type Role = 'ADMIN' | 'COORDINATOR' | 'PROFESSIONAL' | 'CLIENT';
export type ProgramType = 'CULPA' | 'ANGUSTIA';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PAUSADO' | 'SUSPENDIDO';
}

export interface ClientProfile extends User {
  currentWeek: 1 | 2 | 3 | 4;
  startDate: string;
  nextSession?: string;
  program: ProgramType; // New field to distinguish programs
  progress: {
    week1: WeekProgress;
    week2: WeekProgress;
    week3: WeekProgress;
    week4: WeekProgress;
  };
  clinicalData: {
    testScores: TestResult[]; // History of test scores
    audioUsage: AudioUsageStat[];
  }
}

export interface WeekProgress {
  isLocked: boolean;
  isCompleted: boolean;
  initialTestDone?: boolean; // Only for relevant weeks
  guideCompleted: boolean;
  audioListened: number; // Count of listens
  meetingAttended?: boolean;
}

export interface TestResult {
  date: string;
  week: number;
  scores: {
    // Dimensiones RFAI Culpa
    autojuicio?: number; // Scale 6-30
    culpaNoAdaptativa?: number; // Scale 5-25
    responsabilidadConsciente?: number; // Scale 7-35
    humanizacionError?: number; // Scale 2-10

    // Dimensiones RFAI Angustia (New from PDF)
    angustiaAnticipatoria?: number; // Rango 4-20
    autoculpabilizacionAngustia?: number; // Rango 5-25
    desconexionAmorPropio?: number; // Rango 3-15
    regulacionAmor?: number; // Rango 5-25 (Factor protector)
  };
}

export interface AudioUsageStat {
  date: string;
  minutesListened: number;
  audioId: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'text' | 'scale' | 'choice';
}

export interface GuideStep {
  title: string;
  description: string;
  questions: Question[];
}

// ============================================================================
// NEW TYPES - Cycle-Based System (v2.0)
// ============================================================================

export interface CicloTratamiento {
  id: number;
  clientId: string;
  dimension: 'ANGUSTIA' | 'CULPA';
  fechaInicio: Date;
  fechaCierre?: Date;
  estado: 'ACTIVO' | 'COMPLETADO' | 'CANCELADO';
  profesionalId?: string;
  notasCiclo?: string;
  sesionesCompletadas?: number;
  citas?: Cita[];
  materiales?: MaterialConAcceso[];
}

export interface Cita {
  id: number;
  cicloId: number;
  numeroSesion: '1' | '2';
  fechaProgramada: Date;
  fechaRealizada?: Date;
  estado: 'PROGRAMADA' | 'REALIZADO' | 'CANCELADA';
  notasSesion?: string;
}

export interface Material {
  id: number;
  tipo: 'TEST_INICIAL' | 'AUDIO' | 'TEST_INTERMEDIO' | 'GUIA_MANTENIMIENTO';
  dimension: 'ANGUSTIA' | 'CULPA' | 'AMBOS';
  titulo: string;
  descripcion?: string;
  urlRecurso?: string;
  duracionMinutos?: number;
  prerequisito: 'NINGUNO' | 'SESION_1' | 'SESION_2';
  ordenVisualizacion: number;
  activo: boolean;
}

export interface MaterialConAcceso extends Material {
  desbloqueadoEn?: Date;
  completadoEn?: Date;
  progresoPorcentaje?: number;
  desbloqueado: boolean;
}

export interface ProgressState {
  sesion1: {
    completada: boolean;
    fecha?: Date;
  };
  sesion2: {
    completada: boolean;
    fecha?: Date;
  };
  materialesDisponibles: number;
  materialesCompletados: number;
  cicloCompletado: boolean;
}