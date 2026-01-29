import { ClientProfile, GuideStep, User } from './types';

// --- MOCK USERS ---

export const MOCK_ADMIN: User = {
  id: 'u-admin', name: 'Claudio Reyes', email: 'admin@equilibrar.cl', role: 'ADMIN', avatar: 'https://picsum.photos/200/200?random=1', status: 'ACTIVE'
};

export const MOCK_COORD: User = {
  id: 'u-coord', name: 'María Coordinadora', email: 'coord@equilibrar.cl', role: 'COORDINATOR', avatar: 'https://picsum.photos/200/200?random=2', status: 'ACTIVE'
};

export const MOCK_PROF: User = {
  id: 'u-prof', name: 'Dr. Especialista', email: 'prof@equilibrar.cl', role: 'PROFESSIONAL', avatar: 'https://picsum.photos/200/200?random=3', status: 'ACTIVE'
};

// --- PROGRAMA CULPA CLIENTS ---

export const MOCK_CLIENT_W1: ClientProfile = {
  id: 'c-w1', name: 'Lucía Fernández (Sem 1)', email: 'lucia@client.com', role: 'CLIENT', avatar: 'https://picsum.photos/200/200?random=4', status: 'ACTIVE',
  currentWeek: 1, startDate: '2023-10-25', nextSession: '2023-10-28T10:00:00', program: 'CULPA',
  progress: {
    week1: { isLocked: false, isCompleted: false, initialTestDone: false, guideCompleted: false, audioListened: 0, meetingAttended: false },
    week2: { isLocked: true, isCompleted: false, guideCompleted: false, audioListened: 0 },
    week3: { isLocked: true, isCompleted: false, guideCompleted: false, audioListened: 0 },
    week4: { isLocked: true, isCompleted: false, guideCompleted: false, audioListened: 0 },
  },
  clinicalData: { testScores: [], audioUsage: [] }
};

export const MOCK_CLIENT_W2: ClientProfile = {
  id: 'c-w2', name: 'Carlos Díaz (Sem 2)', email: 'carlos@client.com', role: 'CLIENT', avatar: 'https://picsum.photos/200/200?random=6', status: 'ACTIVE',
  currentWeek: 2, startDate: '2023-10-18', program: 'CULPA',
  progress: {
    week1: { isLocked: false, isCompleted: true, initialTestDone: true, guideCompleted: true, audioListened: 6, meetingAttended: true },
    week2: { isLocked: false, isCompleted: false, guideCompleted: false, audioListened: 0 },
    week3: { isLocked: true, isCompleted: false, guideCompleted: false, audioListened: 0 },
    week4: { isLocked: true, isCompleted: false, guideCompleted: false, audioListened: 0 },
  },
  clinicalData: {
      testScores: [{ date: '2023-10-18', week: 1, scores: { autojuicio: 24, culpaNoAdaptativa: 20, responsabilidadConsciente: 12, humanizacionError: 5 } }],
      audioUsage: [{ date: '2023-10-19', minutesListened: 15, audioId: 'audio1' }]
  }
};

export const MOCK_CLIENT_W3: ClientProfile = {
  id: 'c-w3', name: 'Pedro Pascal (Sem 3)', email: 'pedro@client.com', role: 'CLIENT', avatar: 'https://picsum.photos/200/200?random=5', status: 'ACTIVE',
  currentWeek: 3, startDate: '2023-10-01', program: 'CULPA',
  progress: {
    week1: { isLocked: false, isCompleted: true, initialTestDone: true, guideCompleted: true, audioListened: 5, meetingAttended: true },
    week2: { isLocked: false, isCompleted: true, initialTestDone: true, guideCompleted: true, audioListened: 4 },
    week3: { isLocked: false, isCompleted: false, initialTestDone: false, guideCompleted: false, audioListened: 1 },
    week4: { isLocked: true, isCompleted: false, guideCompleted: false, audioListened: 0 },
  },
  clinicalData: {
    testScores: [
      { date: '2023-10-01', week: 1, scores: { autojuicio: 25, culpaNoAdaptativa: 22, responsabilidadConsciente: 10, humanizacionError: 3 } },
      { date: '2023-10-15', week: 2, scores: { autojuicio: 18, culpaNoAdaptativa: 15, responsabilidadConsciente: 18, humanizacionError: 6 } },
    ],
    audioUsage: [
      { date: '2023-10-02', minutesListened: 15, audioId: 'audio1' },
      { date: '2023-10-03', minutesListened: 15, audioId: 'audio1' },
      { date: '2023-10-16', minutesListened: 20, audioId: 'audio2' },
    ]
  }
};

export const MOCK_CLIENT_W4: ClientProfile = {
  id: 'c-w4', name: 'Ana Ruiz (Sem 4)', email: 'ana@client.com', role: 'CLIENT', avatar: 'https://picsum.photos/200/200?random=7', status: 'ACTIVE',
  currentWeek: 4, startDate: '2023-09-20', nextSession: '2023-10-30T16:00:00', program: 'CULPA',
  progress: {
    week1: { isLocked: false, isCompleted: true, initialTestDone: true, guideCompleted: true, audioListened: 7, meetingAttended: true },
    week2: { isLocked: false, isCompleted: true, initialTestDone: true, guideCompleted: true, audioListened: 5 },
    week3: { isLocked: false, isCompleted: true, initialTestDone: true, guideCompleted: true, audioListened: 6 },
    week4: { isLocked: false, isCompleted: false, guideCompleted: false, audioListened: 0, meetingAttended: false },
  },
  clinicalData: {
    testScores: [
      { date: '2023-09-20', week: 1, scores: { autojuicio: 28, culpaNoAdaptativa: 24, responsabilidadConsciente: 8, humanizacionError: 2 } },
      { date: '2023-10-04', week: 2, scores: { autojuicio: 20, culpaNoAdaptativa: 18, responsabilidadConsciente: 15, humanizacionError: 5 } },
      { date: '2023-10-18', week: 3, scores: { autojuicio: 14, culpaNoAdaptativa: 10, responsabilidadConsciente: 22, humanizacionError: 8 } },
    ],
    audioUsage: []
  }
};

// --- PROGRAMA ANGUSTIA CLIENTS (NEW) ---

export const MOCK_CLIENT_ANG_W1: ClientProfile = {
  id: 'c-a1', name: 'Paula Angustia (Sem 1)', email: 'paula@angustia.com', role: 'CLIENT', avatar: 'https://picsum.photos/200/200?random=10', status: 'ACTIVE',
  currentWeek: 1, startDate: '2023-11-01', nextSession: '2023-11-05T18:00:00', program: 'ANGUSTIA',
  progress: {
    week1: { isLocked: false, isCompleted: false, initialTestDone: false, guideCompleted: false, audioListened: 0, meetingAttended: false },
    week2: { isLocked: true, isCompleted: false, guideCompleted: false, audioListened: 0 },
    week3: { isLocked: true, isCompleted: false, guideCompleted: false, audioListened: 0 },
    week4: { isLocked: true, isCompleted: false, guideCompleted: false, audioListened: 0 },
  },
  clinicalData: { testScores: [], audioUsage: [] }
};

export const MOCK_CLIENT_ANG_W2: ClientProfile = {
  id: 'c-a2', name: 'Jorge Angustia (Sem 2)', email: 'jorge@angustia.com', role: 'CLIENT', avatar: 'https://picsum.photos/200/200?random=11', status: 'ACTIVE',
  currentWeek: 2, startDate: '2023-10-25', program: 'ANGUSTIA',
  progress: {
    week1: { isLocked: false, isCompleted: true, initialTestDone: true, guideCompleted: true, audioListened: 5, meetingAttended: true },
    week2: { isLocked: false, isCompleted: false, guideCompleted: false, audioListened: 0 },
    week3: { isLocked: true, isCompleted: false, guideCompleted: false, audioListened: 0 },
    week4: { isLocked: true, isCompleted: false, guideCompleted: false, audioListened: 0 },
  },
  clinicalData: {
    testScores: [{ date: '2023-10-25', week: 1, scores: { angustiaAnticipatoria: 18, autoculpabilizacionAngustia: 22, desconexionAmorPropio: 14, regulacionAmor: 6 } }],
    audioUsage: []
  }
};

export const MOCK_CLIENT_ANG_W3: ClientProfile = {
  id: 'c-a3', name: 'Sofía Angustia (Sem 3)', email: 'sofia@angustia.com', role: 'CLIENT', avatar: 'https://picsum.photos/200/200?random=12', status: 'ACTIVE',
  currentWeek: 3, startDate: '2023-10-18', program: 'ANGUSTIA',
  progress: {
    week1: { isLocked: false, isCompleted: true, initialTestDone: true, guideCompleted: true, audioListened: 6, meetingAttended: true },
    week2: { isLocked: false, isCompleted: true, initialTestDone: true, guideCompleted: true, audioListened: 5 },
    week3: { isLocked: false, isCompleted: false, guideCompleted: false, audioListened: 0 },
    week4: { isLocked: true, isCompleted: false, guideCompleted: false, audioListened: 0 },
  },
  clinicalData: {
    testScores: [
      { date: '2023-10-18', week: 1, scores: { angustiaAnticipatoria: 19, autoculpabilizacionAngustia: 24, desconexionAmorPropio: 15, regulacionAmor: 5 } },
      { date: '2023-10-25', week: 2, scores: { angustiaAnticipatoria: 14, autoculpabilizacionAngustia: 18, desconexionAmorPropio: 12, regulacionAmor: 10 } }
    ],
    audioUsage: []
  }
};

export const MOCK_CLIENT_ANG_W4: ClientProfile = {
  id: 'c-a4', name: 'Miguel Angustia (Sem 4)', email: 'miguel@angustia.com', role: 'CLIENT', avatar: 'https://picsum.photos/200/200?random=13', status: 'ACTIVE',
  currentWeek: 4, startDate: '2023-10-11', program: 'ANGUSTIA',
  progress: {
    week1: { isLocked: false, isCompleted: true, initialTestDone: true, guideCompleted: true, audioListened: 8, meetingAttended: true },
    week2: { isLocked: false, isCompleted: true, initialTestDone: true, guideCompleted: true, audioListened: 6 },
    week3: { isLocked: false, isCompleted: true, initialTestDone: true, guideCompleted: true, audioListened: 7 },
    week4: { isLocked: false, isCompleted: false, guideCompleted: false, audioListened: 0 },
  },
  clinicalData: {
    testScores: [
      { date: '2023-10-11', week: 1, scores: { angustiaAnticipatoria: 16, autoculpabilizacionAngustia: 20, desconexionAmorPropio: 13, regulacionAmor: 7 } },
      { date: '2023-10-25', week: 3, scores: { angustiaAnticipatoria: 8, autoculpabilizacionAngustia: 10, desconexionAmorPropio: 6, regulacionAmor: 18 } }
    ],
    audioUsage: []
  }
};

export const ALL_USERS = [
    MOCK_ADMIN, MOCK_COORD, MOCK_PROF, 
    MOCK_CLIENT_W1, MOCK_CLIENT_W2, MOCK_CLIENT_W3, MOCK_CLIENT_W4,
    MOCK_CLIENT_ANG_W1, MOCK_CLIENT_ANG_W2, MOCK_CLIENT_ANG_W3, MOCK_CLIENT_ANG_W4
];

// --- CONTENT DATA (CULPA) ---

export const WEEKLY_CONTENT_CULPA = {
  1: {
    title: "Comprender la culpa",
    subtitle: "Sin juzgarla",
    description: "Diferenciar la culpa como señal de la culpa como castigo interno.",
    audioTitle: "Audio 1: Desactivar la Alerta",
    hasMeet: true,
  },
  2: {
    title: "Regular la culpa no adaptativa",
    subtitle: "Reducir el autoataque",
    description: "Reducir el autoataque y permitir la regulación del sistema nervioso.",
    audioTitle: "Audio 1: Desactivar la Alerta (Refuerzo)",
    hasMeet: false,
  },
  3: {
    title: "Separar identidad de experiencia",
    subtitle: "Diferenciación",
    description: "Diferenciar lo que ocurrió de quién soy. Reorganizar la respuesta.",
    audioTitle: "Audio 2: Reorganizar la Respuesta",
    hasMeet: false,
  },
  4: {
    title: "Diálogo interno saludable",
    subtitle: "Consolidación",
    description: "Consolidar una relación interna basada en responsabilidad consciente.",
    audioTitle: "Audio 2: Reorganizar la Respuesta (Consolidación)",
    hasMeet: true,
  }
};

// --- CONTENT DATA (ANGUSTIA - NEW FROM PDF) ---

export const WEEKLY_CONTENT_ANGUSTIA = {
  1: {
    title: "Comprender la angustia",
    subtitle: "Señal de miedo a la pérdida",
    description: "Reconocer la angustia como una señal de miedo a la pérdida y no como una falla personal. Objetivo: Validar la experiencia.",
    audioTitle: "Audio: Validación de la Angustia",
    hasMeet: true,
  },
  2: {
    title: "Regular desde la seguridad",
    subtitle: "Disminuir la amenaza",
    description: "Disminuir la activación del sistema de amenaza y reducir la autoculpabilización. Acompañarse en lugar de controlarse.",
    audioTitle: "Audio: Seguridad Interna",
    hasMeet: false,
  },
  3: {
    title: "Recuperar el amor propio",
    subtitle: "Restituir el vínculo",
    description: "Restituir el vínculo interno que suele romperse cuando aparece la angustia. Escuchar a la parte que se siente sola.",
    audioTitle: "Audio: Diálogo con el Niño Interno",
    hasMeet: false,
  },
  4: {
    title: "Integrar desde el amor",
    subtitle: "Consolidación",
    description: "Consolidar una forma de relación interna más segura y compasiva. Transformar el miedo a la pérdida en presencia.",
    audioTitle: "Audio: Integración Final",
    hasMeet: true,
  }
};

// --- GUIDES (CULPA) ---

export const GUIDES_CULPA: Record<number, GuideStep[]> = {
  1: [
    {
      title: "Exploración Inicial",
      description: "Observa tu experiencia sin intentar cambiarla todavía.",
      questions: [
        { id: 'w1-q1', text: "¿En qué situaciones aparece con más fuerza la culpa?", type: 'text' },
        { id: 'w1-q2', text: "¿Qué frases internas la acompañan?", type: 'text' },
      ]
    },
    {
      title: "Observación Corporal",
      description: "Conecta con la sensación física.",
      questions: [
        { id: 'w1-q3', text: "¿Dónde la siento en el cuerpo?", type: 'text' },
        { id: 'w1-q4', text: "¿Qué cambia en mi respiración o tensión corporal?", type: 'text' },
      ]
    }
  ],
  2: [
    {
      title: "Exploración de Miedos",
      description: "Entendiendo la función protectora del castigo.",
      questions: [
        { id: 'w2-q1', text: "¿Qué temo que ocurra si no me castigo?", type: 'text' },
        { id: 'w2-q2', text: "¿Qué pasaría si fuera más amable conmigo?", type: 'text' },
      ]
    },
    {
      title: "Post-Audio",
      description: "Reflexión después de la práctica auditiva.",
      questions: [
        { id: 'w2-q3', text: "¿Baja la intensidad de la culpa después de escuchar?", type: 'scale' },
      ]
    }
  ],
  3: [
    {
      title: "Identidad vs Experiencia",
      description: "Separando el ser del hacer.",
      questions: [
        { id: 'w3-q1', text: "¿Qué me digo cuando me equivoco?", type: 'text' },
        { id: 'w3-q2', text: "¿Le diría esto a alguien que quiero?", type: 'choice' },
      ]
    }
  ],
  4: [
    {
      title: "Integración Final",
      description: "Hacia una responsabilidad consciente.",
      questions: [
        { id: 'w4-q1', text: "¿Qué entiendo hoy por culpa que antes no veía?", type: 'text' },
        { id: 'w4-q2', text: "Puedo hacerme responsable de ______ sin dañarme.", type: 'text' },
      ]
    }
  ]
};

// --- GUIDES (ANGUSTIA - NEW FROM PDF) ---

export const GUIDES_ANGUSTIA: Record<number, GuideStep[]> = {
  1: [
    {
      title: "Exploración de la Angustia",
      description: "Reconociendo la señal sin juicio.",
      questions: [
        { id: 'aw1-q1', text: "¿En qué momentos aparece con más fuerza la angustia?", type: 'text' },
        { id: 'aw1-q2', text: "¿Qué siento que podría perder cuando surge?", type: 'text' },
        { id: 'aw1-q3', text: "¿Qué pensamientos acompañan esa sensación?", type: 'text' },
        { id: 'aw1-q4', text: "¿Desde cuándo reconozco este tipo de angustia en mi vida?", type: 'text' },
      ]
    },
    {
      title: "Observación Corporal",
      description: "Manifestación física.",
      questions: [
        { id: 'aw1-q5', text: "¿Dónde se manifiesta la angustia en mi cuerpo?", type: 'text' },
        { id: 'aw1-q6', text: "¿Qué ocurre con mi respiración y tensión muscular?", type: 'text' },
      ]
    }
  ],
  2: [
    {
      title: "Diálogo Interno",
      description: "Explorando la autoconversación.",
      questions: [
        { id: 'aw2-q1', text: "¿Qué me digo a mí mismo/a cuando siento angustia?", type: 'text' },
        { id: 'aw2-q2', text: "¿Me culpo por sentirla?", type: 'choice' },
        { id: 'aw2-q3', text: "¿Qué cambia cuando intento acompañarme en lugar de controlarme?", type: 'text' },
      ]
    },
    {
      title: "Regulación",
      description: "Después de escuchar el audio terapéutico.",
      questions: [
        { id: 'aw2-q4', text: "¿Se modifica la intensidad de la angustia?", type: 'scale' },
        { id: 'aw2-q5', text: "¿Aparece alivio, cansancio, tristeza o calma?", type: 'text' },
      ]
    }
  ],
  3: [
    {
      title: "Vínculo Interno",
      description: "Restituyendo la relación contigo mismo.",
      questions: [
        { id: 'aw3-q1', text: "¿Qué parte de mí se siente sola o abandonada cuando estoy angustiado/a?", type: 'text' },
        { id: 'aw3-q2', text: "¿Cómo suelo tratarme internamente en esos momentos?", type: 'text' },
        { id: 'aw3-q3', text: "¿Qué necesitaría escuchar de mí para sentirme acompañado/a?", type: 'text' },
      ]
    },
    {
      title: "Ejercicio de Diálogo",
      description: "Completa las frases.",
      questions: [
        { id: 'aw3-q4', text: "Cuando siento angustia, una parte de mí teme que...", type: 'text' },
        { id: 'aw3-q5', text: "Esa parte necesita...", type: 'text' },
        { id: 'aw3-q6', text: "Puedo ofrecerme...", type: 'text' },
      ]
    }
  ],
  4: [
    {
      title: "Integración desde el Amor",
      description: "Consolidando el proceso.",
      questions: [
        { id: 'aw4-q1', text: "¿Qué aprendí sobre mi angustia durante este proceso?", type: 'text' },
        { id: 'aw4-q2', text: "¿Qué señales indican que estoy entrando en miedo?", type: 'text' },
        { id: 'aw4-q3', text: "¿Qué recursos puedo activar para sostenerme?", type: 'text' },
      ]
    },
    {
      title: "Cierre",
      description: "Afirmación final.",
      questions: [
        { id: 'aw4-q4', text: "Puedo sentir angustia sin abandonarme (Reflexión)", type: 'text' },
      ]
    }
  ]
};


// --- TEST QUESTIONS ---

export const TEST_QUESTIONS_CULPA = [
  { id: 1, text: "Cuando cometo un error, siento que soy una mala persona.", category: 'Autojuicio' },
  { id: 2, text: "Siento culpa incluso cuando no he hecho nada malo objetivamente.", category: 'Culpa no adaptativa' },
  { id: 3, text: "Puedo reconocer mis errores y buscar formas de repararlos.", category: 'Responsabilidad consciente' },
  { id: 4, text: "Me critico duramente por cosas que ocurrieron hace mucho tiempo.", category: 'Autojuicio' },
  { id: 6, text: "Entiendo que equivocarme es parte de ser humano.", category: 'Humanización' },
  { id: 19, text: "Siento que merezco castigo cuando las cosas salen mal.", category: 'Autojuicio' },
  { id: 20, text: "Asumo las consecuencias de mis actos sin atacarme.", category: 'Responsabilidad consciente' },
];

export const TEST_QUESTIONS_ANGUSTIA = [
  { id: 1, text: "Vivo con una sensación constante de que algo importante podría perderse.", category: 'Angustia anticipatoria' },
  { id: 2, text: "Cuando siento angustia, pienso que algo anda mal conmigo.", category: 'Autoculpabilización' },
  { id: 3, text: "Puedo sentir angustia sin perder completamente la calma.", category: 'Regulación desde el amor' },
  { id: 4, text: "La incertidumbre del futuro me genera mucha tensión.", category: 'Angustia anticipatoria' },
  { id: 5, text: "Me culpo por no ser capaz de controlar mi angustia.", category: 'Autoculpabilización' },
  { id: 6, text: "Cuando estoy angustiado/a, me trato con dureza.", category: 'Autoculpabilización' },
  { id: 7, text: "Puedo acompañarme internamente cuando aparece la angustia.", category: 'Regulación desde el amor' },
  { id: 8, text: "Siento que la angustia me deja solo/a por dentro.", category: 'Desconexión del amor propio' },
  { id: 9, text: "La angustia interfiere con mi capacidad de disfrutar el presente.", category: 'Angustia anticipatoria' },
  { id: 10, text: "Puedo recordarme que sentir angustia es una experiencia humana.", category: 'Regulación desde el amor' },
  { id: 11, text: "Temo perder el amor o el valor personal cuando me siento angustiado/a.", category: 'Angustia anticipatoria' },
  { id: 12, text: "Me resulta difícil ser amable conmigo cuando estoy angustiado/a.", category: 'Desconexión/Autoculpabilización' },
  { id: 13, text: "Puedo sostener la angustia sin entrar en pánico.", category: 'Regulación desde el amor' },
  { id: 14, text: "Cuando aparece la angustia, siento que debo exigirme más.", category: 'Autoculpabilización' },
  { id: 15, text: "Logro regular la angustia conectando con el cuidado hacia mí.", category: 'Regulación desde el amor' },
];