import { Player } from '../models/Player';
import { Club, League } from '../models/Club';
import { MatchResult } from '../models/Match';
import { LeagueTable, Fixture } from '../models/World';
import { MatchEngine } from './MatchEngine';
import { TrainingEngine, TrainingSession } from './TrainingEngine';
import { TransferEngine } from './TransferEngine';
import { WorldEngine } from './WorldEngine';
import { TransferOffer } from '../models/Transfer';

export interface GameState {
  currentDate: Date;
  userPlayerId: string | null;
  players: Record<string, Player>;
  clubs: Record<string, Club>;
  leagues: Record<string, League>;
  leagueTables: Record<string, LeagueTable>;
  fixtures: Fixture[];
  matchHistory: MatchResult[];
  activeOffers: TransferOffer[];
  clubInterest: Record<string, Record<string, number>>;
}

export class GameEngine {
  private state: GameState;

  constructor() {
    this.state = {
      currentDate: new Date(2024, 7, 1), // Aug 1st, Season Start
      userPlayerId: null,
      players: {},
      clubs: {},
      leagues: {},
      leagueTables: {},
      fixtures: [],
      matchHistory: [],
      activeOffers: [],
      clubInterest: {}
    };
  }

  public initUserPlayer(player: Player) {
    player.managerTrust = 50; // Initial trust
    this.state.players[player.id] = player;
    this.state.userPlayerId = player.id;
  }

  public setupLeague(league: League, clubs: Club[]) {
    this.state.leagues[league.id] = league;
    clubs.forEach(c => {
      this.state.clubs[c.id] = c;
      league.teams.push(c.id);
    });
    this.state.leagueTables[league.id] = WorldEngine.initLeagueTable(league.id, clubs.map(c => c.id));
    
    const leagueFixtures = WorldEngine.generateFixtures(league.id, clubs.map(c => c.id), this.state.currentDate);
    this.state.fixtures.push(...leagueFixtures);
  }

  public addPlayer(player: Player) {
    this.state.players[player.id] = player;
  }

  public getUserPlayer(): Player | null {
    return this.state.userPlayerId ? this.state.players[this.state.userPlayerId] : null;
  }

  public advanceDay() {
    this.state.currentDate.setDate(this.state.currentDate.getDate() + 1);
    
    // Check for fixtures today
    const todaysFixtures = this.state.fixtures.filter(f => 
      !f.isPlayed && f.date.toDateString() === this.state.currentDate.toDateString()
    );

    todaysFixtures.forEach(fixture => {
      this.runMatch(fixture);
    });

    // Weekly-ish updates
    if (this.state.currentDate.getDay() === 1) { // Every Monday
      this.processWeeklyUpdates();
    }
  }

  private processWeeklyUpdates() {
    Object.values(this.state.players).forEach(player => {
      TrainingEngine.processPassiveGrowth(player);
      player.marketValue = TransferEngine.calculateMarketValue(player);
      if (player.isUser) this.updateScoutingInterest(player);
      
      // Decay fatigue slightly
      player.fatigue = Math.max(0, player.fatigue - 15);
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
      if (interest > 75 && Math.random() > 0.7) {
        if (!this.state.activeOffers.some(o => o.fromClubId === clubId)) {
          this.state.activeOffers.push(TransferEngine.generateOffer(user, this.state.clubs[clubId], false));
        }
      }
    });
  }

  public runMatch(fixture: Fixture): MatchResult {
    const result = MatchEngine.simulate(fixture.homeClubId, fixture.awayClubId, this.state.players, this.state.userPlayerId);
    
    // Update Table
    const table = this.state.leagueTables[fixture.competitionId];
    if (table) WorldEngine.updateTable(table, result);

    // Update player stats and Manager Trust
    Object.entries(result.playerStats).forEach(([pid, stats]) => {
      const p = this.state.players[pid];
      if (p) {
        p.avgRating = ((p.avgRating * p.matchCount) + stats.rating) / (p.matchCount + 1);
        p.matchCount++;
        
        if (p.isUser) {
          // Manager Trust Logic
          if (stats.rating > 7.5) p.managerTrust = Math.min(100, p.managerTrust + 5);
          if (stats.rating < 6.0) p.managerTrust = Math.max(0, p.managerTrust - 5);
        }
      }
    });

    fixture.isPlayed = true;
    fixture.resultId = result.id;
    this.state.matchHistory.push(result);
    return result;
  }

  public trainUser(session: TrainingSession) {
    const user = this.getUserPlayer();
    if (user) {
      const result = TrainingEngine.train(user, session);
      if (session !== 'Rest') {
        user.managerTrust = Math.min(100, user.managerTrust + 1); // Reward hard work
      }
      return result;
    }
    return { message: "No user player found.", growth: {} };
  }

  public getState(): GameState {
    return this.state;
  }
}
