import { Player } from '../models/Player';
import { Club, League } from '../models/Club';
import { MatchResult } from '../models/Match';
import { MatchEngine } from './MatchEngine';

export interface GameState {
  currentDate: Date;
  userPlayerId: string | null;
  players: Record<string, Player>;
  clubs: Record<string, Club>;
  leagues: Record<string, League>;
  matchHistory: MatchResult[];
}

export class GameEngine {
  private state: GameState;

  constructor() {
    this.state = {
      currentDate: new Date(2024, 6, 1),
      userPlayerId: null,
      players: {},
      clubs: {},
      leagues: {},
      matchHistory: []
    };
  }

  public initUserPlayer(player: Player) {
    this.state.players[player.id] = player;
    this.state.userPlayerId = player.id;
  }

  public addClub(club: Club) {
    this.state.clubs[club.id] = club;
  }

  public addPlayer(player: Player) {
    this.state.players[player.id] = player;
  }

  public getUserPlayer(): Player | null {
    return this.state.userPlayerId ? this.state.players[this.state.userPlayerId] : null;
  }

  public advanceWeek() {
    const nextDate = new Date(this.state.currentDate);
    nextDate.setDate(nextDate.getDate() + 7);
    this.state.currentDate = nextDate;
    this.processWeeklyUpdates();
  }

  private processWeeklyUpdates() {
    Object.values(this.state.players).forEach(player => {
      if (player.age < 21) {
        const attrs = player.attributes as any;
        const keys = Object.keys(attrs);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        if (attrs[randomKey] < player.potential) {
          attrs[randomKey] += 0.05; 
        }
      }
    });
  }

  public runMatch(homeClubId: string, awayClubId: string): MatchResult {
    const result = MatchEngine.simulate(
      homeClubId, 
      awayClubId, 
      this.state.players, 
      this.state.userPlayerId
    );
    this.state.matchHistory.push(result);
    return result;
  }

  public getState(): GameState {
    return this.state;
  }
}
