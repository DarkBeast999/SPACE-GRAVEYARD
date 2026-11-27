// ============================================================================
// SPACE GRAVEYARD ARCADE — SHARED GAME TYPES & INTERFACES
// ============================================================================

export type ActiveGameId = 'hub' | 'quiz' | 'defender' | 'repair' | 'lander';

export interface GameMetadata {
  id: ActiveGameId;
  title: string;
  subtitle: string;
  genre: string;
  difficulty: 'Casual' | 'Moderate' | 'Challenging' | 'Expert';
  estimatedTime: string;
  description: string;
  instructions: string[];
  controls: { key: string; action: string }[];
  accentColor: string; // Tailwind color token or hex
  icon: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'Moon' | 'Mars' | 'Deep Space' | 'Saturn' | 'Space History';
  difficulty?: 'Standard' | 'Advanced';
}

export interface ArcadeScores {
  quizHighScore: number;
  defenderHighScore: number;
  repairCompleted: boolean;
  landerStagesCleared: number;
}
