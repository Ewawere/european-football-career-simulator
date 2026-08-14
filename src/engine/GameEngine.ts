import { Player } from '../models/Player';
import { Club, League } from '../models/Club';

export interface GameState {
  currentDate: Date;
  userPlayerId: string | null;
  players: Record<string, Player>;
  clubs: Record<string, Club>;
  leagues: Record<string, League>;
}

export class GameEngine {
  private state: GameState;

  constructor() {
    this.state = {
      currentDate: new Date(2024, 6, 1), // July 1st, 2024
      userPlayerId: null,
      players: {},
      clubs: {},
      leagues: {}
    };
  }

  public initUserPlayer(player: Player) {
    this.state.players[player.id] = player;
    this.state.userPlayerId = player.id;
  }

  public getUserPlayer(): Player | null {
    return this.state.userPlayerId ? this.state.players[this.state.userPlayerId] : null;
  }

  public advanceWeek() {
    const nextDate = new Date(this.state.currentDate);
    nextDate.setDate(nextDate.getDate() + 7);
    this.state.currentDate = nextDate;
    
    // Logic for weekly updates (training, recovery, etc.)
    this.processWeeklyUpdates();
  }

  private processWeeklyUpdates() {
    // Basic attribute growth for young players
    Object.values(this.state.players).forEach(player => {
      if (player.age < 21) {
        // Randomly improve an attribute slightly
        const attrs = player.attributes as any;
        const keys = Object.keys(attrs);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        if (attrs[randomKey] < player.potential) {
          attrs[randomKey] += 0.1; // Slow progression
        }
      }
    });
  }

  public simulateMatch(homeClubId: string, awayClubId: string) {
    // This would eventually be a complex simulation.
    // For now, a simple random result.
    const homeScore = Math.floor(Math.random() * 4);
    const awayScore = Math.floor(Math.random() * 3);
    
    const userPlayer = this.getUserPlayer();
    let playerRating = 0;
    
    if (userPlayer && (userPlayer.clubId === homeClubId || userPlayer.clubId === awayClubId)) {
      // Simulate user performance
      playerRating = 5 + (Math.random() * 5); // 5.0 to 10.0
    }

    return {
      score: `${homeScore} - ${awayScore}`,
      playerRating: playerRating.toFixed(1),
      timestamp: this.state.currentDate
    };
  }

  public getState(): GameState {
    return this.state;
  }
}
