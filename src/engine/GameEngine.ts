import { Player } from '../models/Player';
import { Club, League } from '../models/Club';
import { MatchResult } from '../models/Match';
import { MatchEngine } from './MatchEngine';
import { TrainingEngine, TrainingSession } from './TrainingEngine';
import { TransferEngine } from './TransferEngine';
import { TransferOffer } from '../models/Transfer';

export interface GameState {
  currentDate: Date;
  userPlayerId: string | null;
  players: Record<string, Player>;
  clubs: Record<string, Club>;
  leagues: Record<string, League>;
  matchHistory: MatchResult[];
  activeOffers: TransferOffer[];
  clubInterest: Record<string, Record<string, number>>; // clubId -> playerId -> interestLevel
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
      matchHistory: [],
      activeOffers: [],
      clubInterest: {}
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
    
    // Process passive growth & market value updates
    Object.values(this.state.players).forEach(player => {
      TrainingEngine.processPassiveGrowth(player);
      player.marketValue = TransferEngine.calculateMarketValue(player);
      
      // Randomly update scouting interest for user
      if (player.isUser) {
        this.updateScoutingInterest(player);
      }
    });

    this.checkOffers();
  }

  private updateScoutingInterest(player: Player) {
    Object.values(this.state.clubs).forEach(club => {
      if (club.id === player.clubId) return;
      
      if (!this.state.clubInterest[club.id]) this.state.clubInterest[club.id] = {};
      
      const current = this.state.clubInterest[club.id][player.id] || 0;
      this.state.clubInterest[club.id][player.id] = TransferEngine.updateInterest(player, club, current);
    });
  }

  private checkOffers() {
    const user = this.getUserPlayer();
    if (!user) return;

    Object.entries(this.state.clubInterest).forEach(([clubId, interests]) => {
      const interest = interests[user.id] || 0;
      // If interest is high enough, chance of an offer
      if (interest > 70 && Math.random() > 0.5) {
        const alreadyHasOffer = this.state.activeOffers.some(o => o.fromClubId === clubId && o.playerId === user.id);
        if (!alreadyHasOffer) {
          const offer = TransferEngine.generateOffer(user, this.state.clubs[clubId], interest < 85);
          this.state.activeOffers.push(offer);
        }
      }
    });
  }

  public acceptOffer(offerId: string) {
    const offer = this.state.activeOffers.find(o => o.id === offerId);
    if (!offer) return false;

    const player = this.state.players[offer.playerId];
    player.clubId = offer.fromClubId;
    player.wage = offer.terms.wage;
    player.contractYearsRemaining = offer.terms.length;
    
    this.state.activeOffers = this.state.activeOffers.filter(o => o.id !== offerId);
    return true;
  }

  public runMatch(homeClubId: string, awayClubId: string): MatchResult {
    const result = MatchEngine.simulate(homeClubId, awayClubId, this.state.players, this.state.userPlayerId);
    
    // Update player form stats
    Object.entries(result.playerStats).forEach(([pid, stats]) => {
      const p = this.state.players[pid];
      if (p) {
        p.avgRating = ((p.avgRating * p.matchCount) + stats.rating) / (p.matchCount + 1);
        p.matchCount++;
      }
    });

    this.state.matchHistory.push(result);
    return result;
  }

  public getState(): GameState {
    return this.state;
  }
}
