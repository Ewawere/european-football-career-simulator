import { Player } from '../models/Player';
import { Club, League } from '../models/Club';
import { MatchResult } from '../models/Match';
import { LeagueTable, Fixture } from '../models/World';
import { Tournament } from '../models/Tournament';
import { MatchEngine } from './MatchEngine';
import { TrainingEngine, TrainingSession } from './TrainingEngine';
import { TransferEngine } from './TransferEngine';
import { WorldEngine } from './WorldEngine';
import { LegacyEngine } from './LegacyEngine';
import { TournamentEngine } from './TournamentEngine';
import { TransferOffer } from '../models/Transfer';

export interface GameState {
  currentDate: Date;
  userPlayerId: string | null;
  players: Record<string, Player>;
  clubs: Record<string, Club>;
  leagues: Record<string, League>;
  leagueTables: Record<string, LeagueTable>;
  tournaments: Record<string, Tournament>;
  fixtures: Fixture[];
  matchHistory: MatchResult[];
  activeOffers: TransferOffer[];
  clubInterest: Record<string, Record<string, number>>;
}

export class GameEngine {
  private state: GameState;

  constructor() {
    this.state = {
      currentDate: new Date(2024, 7, 1),
      userPlayerId: null,
      players: {},
      clubs: {},
      leagues: {},
      leagueTables: {},
      tournaments: {},
      fixtures: [],
      matchHistory: [],
      activeOffers: [],
      clubInterest: {}
    };
  }

  public initUserPlayer(player: Player) {
    this.state.players[player.id] = player;
    this.state.userPlayerId = player.id;
  }

  public setupLeague(league: League, clubs: Club[]) {
    this.state.leagues[league.id] = league;
    clubs.forEach(c => {
      this.state.clubs[c.id] = c;
      if (!league.teams.includes(c.id)) league.teams.push(c.id);
    });
    this.state.leagueTables[league.id] = WorldEngine.initLeagueTable(league.id, clubs.map(c => c.id));
    const leagueFixtures = WorldEngine.generateFixtures(league.id, clubs.map(c => c.id), this.state.currentDate);
    this.state.fixtures.push(...leagueFixtures);
  }

  public setupTournament(id: string, name: string, participantIds: string[]) {
    const tournament = TournamentEngine.createKnockoutTournament(id, name, participantIds, this.state.currentDate);
    this.state.tournaments[id] = tournament;
    this.state.fixtures.push(...tournament.rounds[0].fixtures);
  }

  public advanceDay() {
    this.state.currentDate.setDate(this.state.currentDate.getDate() + 1);
    const todaysFixtures = this.state.fixtures.filter(f => !f.isPlayed && f.date.toDateString() === this.state.currentDate.toDateString());
    todaysFixtures.forEach(fixture => this.runMatch(fixture));

    // Check tournaments for round advancement
    Object.values(this.state.tournaments).forEach(t => {
      const nextWeek = new Date(this.state.currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const advanced = TournamentEngine.checkRoundCompletion(t, this.state.matchHistory, nextWeek);
      if (advanced && !t.winnerId) {
        // Add new fixtures to global list
        const newFixtures = t.rounds[t.currentRoundIndex].fixtures;
        this.state.fixtures.push(...newFixtures);
      }
      
      if (t.winnerId && this.getUserPlayer()?.clubId === t.winnerId) {
        // Record Trophy Milestone if not already recorded
        const user = this.getUserPlayer();
        if (user && !user.milestones.some(m => m.type === 'Trophy' && m.description.includes(t.name))) {
          user.milestones.push({
            id: 'trophy-' + t.id,
            type: 'Trophy',
            title: `${t.name} Champions!`,
            description: `Won the ${t.name} with ${user.clubId}.`,
            date: new Date(this.state.currentDate),
            clubId: user.clubId || '',
            age: user.age
          });
        }
      }
    });

    if (this.state.currentDate.getDay() === 1) this.processWeeklyUpdates();
  }

  private processWeeklyUpdates() {
    Object.values(this.state.players).forEach(player => {
      TrainingEngine.processPassiveGrowth(player);
      player.marketValue = TransferEngine.calculateMarketValue(player);
      if (player.isUser) this.updateScoutingInterest(player);
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

  public acceptOffer(offerId: string) {
    const offer = this.state.activeOffers.find(o => o.id === offerId);
    if (!offer) return false;
    const player = this.state.players[offer.playerId];
    const oldClub = player.clubId || 'Free Agent';
    player.clubId = offer.fromClubId;
    player.wage = offer.terms.wage;
    player.contractYearsRemaining = offer.terms.length;
    if (player.isUser) {
      player.milestones.push(LegacyEngine.createTransferMilestone(player, oldClub, offer.fromClubId, offer.fee, this.state.currentDate));
    }
    this.state.activeOffers = this.state.activeOffers.filter(o => o.id !== offerId);
    return true;
  }

  public runMatch(fixture: Fixture): MatchResult {
    const result = MatchEngine.simulate(fixture.homeClubId, fixture.awayClubId, this.state.players, this.state.userPlayerId);
    const table = this.state.leagueTables[fixture.competitionId];
    if (table) WorldEngine.updateTable(table, result);

    Object.entries(result.playerStats).forEach(([pid, stats]) => {
      const p = this.state.players[pid];
      if (p) {
        if (p.isUser) {
          const newMilestones = LegacyEngine.checkMatchMilestones(p, stats, result);
          p.milestones.push(...newMilestones);
          
          // Tournament specific milestone check
          if (this.state.tournaments[fixture.competitionId]) {
            const tournament = this.state.tournaments[fixture.competitionId];
            if (!p.milestones.some(m => m.title.includes(tournament.name + " Debut"))) {
              p.milestones.push({
                id: 'debut-' + tournament.id,
                type: 'Debut',
                title: `${tournament.name} Debut`,
                description: `Made debut in ${tournament.name} against ${fixture.homeClubId === p.clubId ? fixture.awayClubId : fixture.homeClubId}.`,
                date: new Date(this.state.currentDate),
                clubId: p.clubId || '',
                age: p.age
              });
            }
          }
        }
        p.avgRating = ((p.avgRating * p.matchCount) + stats.rating) / (p.matchCount + 1);
        p.matchCount++;
        p.totalGoals += stats.goals;
        p.totalAssists += stats.assists;
        if (p.isUser) {
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
      if (session !== 'Rest') user.managerTrust = Math.min(100, user.managerTrust + 1);
      return result;
    }
    return { message: "No user player found.", growth: {} };
  }

  public getState(): GameState {
    return this.state;
  }
}
