export type Role = 'ADMIN' | 'COORDINATOR' | 'PROFESSIONAL' | 'CLIENT';
export type ProgramType = 'CULPA' | 'ANGUSTIA';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  status: 'ACTIVE' | 'INACTIVE';
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