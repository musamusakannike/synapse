import quizData from '@/data/swep_2025_quiz.json';

export const GUEST_MAX_QUESTIONS = 10;
export const SWEP_ENROLLMENT_KEY = 'swepEnrollment';
export const SWEP_FAB_DISMISSED_KEY = 'swepFabDismissed';
export const SWEP_SHEET_SESSION_KEY = 'swepSheetSessionDismissed';
export const SWEP_ENROLLMENT_EVENT = 'swep-enrollment-changed';

export type SwepEnrollment = 'yes' | 'no';

export interface SwepOption {
  text: string;
  isCorrect: boolean;
}

export interface SwepQuestion {
  id: number;
  questionNumber: number;
  unitNumber: number;
  unitName: string;
  type: string;
  question: string;
  formattedOptions: SwepOption[];
  explanation: string;
  xp: number;
}

export interface SwepUnit {
  unitNumber: number;
  unitName: string;
  questionRange: string;
  questionCount: number;
}

export interface SwepQuizData {
  title: string;
  preparedBy: string;
  course: string;
  totalQuestions: number;
  totalUnits: number;
  units: SwepUnit[];
  questions: SwepQuestion[];
}

export const swepQuiz = quizData as SwepQuizData;

export const COUNT_OPTIONS = [5, 10, 15, 20] as const;

export function filterQuestions(unitNumber: number | 'all'): SwepQuestion[] {
  if (unitNumber === 'all') return [...swepQuiz.questions];
  return swepQuiz.questions.filter((q) => q.unitNumber === unitNumber);
}

export function buildSession(
  unitNumber: number | 'all',
  count: number,
  random: boolean,
): SwepQuestion[] {
  const pool = filterQuestions(unitNumber);
  const ordered = random ? [...pool].sort(() => Math.random() - 0.5) : [...pool].sort((a, b) => a.questionNumber - b.questionNumber);
  if (count <= 0) return ordered;
  return ordered.slice(0, Math.min(count, ordered.length));
}

export function parseUnitParam(value: string | null): number | 'all' {
  if (!value || value === 'all') return 'all';
  const n = Number(value);
  if (!Number.isInteger(n) || !swepQuiz.units.some((u) => u.unitNumber === n)) return 'all';
  return n;
}

export function unitLabel(unitNumber: number | 'all'): string {
  if (unitNumber === 'all') return 'All units';
  const unit = swepQuiz.units.find((u) => u.unitNumber === unitNumber);
  return unit ? `Unit ${unit.unitNumber} · ${unit.unitName}` : 'All units';
}

export function swepPracticeHref(
  base: '/swep' | '/dashboard/swep',
  opts: { unit: number | 'all'; count: number; random: boolean },
): string {
  const params = new URLSearchParams();
  params.set('unit', opts.unit === 'all' ? 'all' : String(opts.unit));
  params.set('count', String(opts.count));
  params.set('random', opts.random ? '1' : '0');
  return `${base}/practice?${params.toString()}`;
}
