import { Fixture } from './World';

export type TournamentType = 'Knockout' | 'GroupAndKnockout';

export interface TournamentRound {
  name: string;
  fixtures: Fixture[];
  isCompleted: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  participants: string[]; // Club IDs
  rounds: TournamentRound[];
  winnerId?: string;
  currentRoundIndex: number;
}
