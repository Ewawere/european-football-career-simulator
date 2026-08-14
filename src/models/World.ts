export interface Fixture {
  id: string;
  homeClubId: string;
  awayClubId: string;
  date: Date;
  competitionId: string;
  isPlayed: boolean;
  resultId?: string;
}

export interface TableEntry {
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface LeagueTable {
  leagueId: string;
  season: number;
  entries: Record<string, TableEntry>;
}

export interface Manager {
  id: string;
  name: string;
  clubId: string;
  personality: 'Disciplinarian' | 'YouthFocused' | 'Tactician';
  trustBase: number; // Base trust for new players
  preferredFormation: string;
}
