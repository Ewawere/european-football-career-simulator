export type MatchEventType = 'Goal' | 'Assist' | 'YellowCard' | 'RedCard' | 'Shot' | 'KeyPass' | 'Foul' | 'Injury' | 'Substitution';

export interface MatchEvent {
  minute: number;
  type: MatchEventType;
  playerId: string;
  assistantId?: string; // For assists
  description: string;
}

export interface PlayerMatchStats {
  playerId: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  passesAttempted: number;
  passesCompleted: number;
  keyPasses: number;
  tackles: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  rating: number;
}

export interface MatchResult {
  id: string;
  homeClubId: string;
  awayClubId: string;
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  playerStats: Record<string, PlayerMatchStats>;
  attendance: number;
  timestamp: Date;
}
