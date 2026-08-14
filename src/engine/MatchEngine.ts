import { v4 as uuidv4 } from 'uuid';
import { Player, calculateOverall } from '../models/Player';
import { MatchResult, MatchEvent, PlayerMatchStats, MatchEventType } from '../models/Match';

export class MatchEngine {
  static simulate(homeClubId: string, awayClubId: string, players: Record<string, Player>, userPlayerId: string | null): MatchResult {
    const homePlayers = Object.values(players).filter(p => p.clubId === homeClubId);
    const awayPlayers = Object.values(players).filter(p => p.clubId === awayClubId);

    const homeStrength = this.calculateTeamStrength(homePlayers);
    const awayStrength = this.calculateTeamStrength(awayPlayers);

    const events: MatchEvent[] = [];
    const playerStats: Record<string, PlayerMatchStats> = {};

    // Initialize stats for all players
    [...homePlayers, ...awayPlayers].forEach(p => {
      playerStats[p.id] = this.initPlayerStats(p.id);
    });

    let homeScore = 0;
    let awayScore = 0;

    // Simulate 90 minutes
    for (let min = 1; min <= 90; min++) {
      // Chance of an event happening
      if (Math.random() < 0.15) {
        const attackingHome = Math.random() * homeStrength > Math.random() * awayStrength;
        const attackingTeam = attackingHome ? homePlayers : awayPlayers;
        const defendingTeam = attackingHome ? awayPlayers : homePlayers;
        const attackingClubId = attackingHome ? homeClubId : awayClubId;

        const eventType = this.rollEventType();
        const mainPlayer = attackingTeam[Math.floor(Math.random() * attackingTeam.length)];

        if (eventType === 'Goal') {
          if (attackingHome) homeScore++; else awayScore++;
          
          const assistant = attackingTeam.find(p => p.id !== mainPlayer.id && Math.random() > 0.5);
          
          events.push({
            minute: min,
            type: 'Goal',
            playerId: mainPlayer.id,
            assistantId: assistant?.id,
            description: `⚽ GOAL! ${mainPlayer.lastName} scores for ${attackingClubId}!${assistant ? ` (Assisted by ${assistant.lastName})` : ''}`
          });

          this.updateStats(playerStats, mainPlayer.id, 'goals');
          if (assistant) this.updateStats(playerStats, assistant.id, 'assists');
        } else {
          // Other events (Shot, KeyPass, YellowCard, etc.)
          events.push({
            minute: min,
            type: eventType,
            playerId: mainPlayer.id,
            description: `${eventType} by ${mainPlayer.lastName}`
          });
          this.updateStats(playerStats, mainPlayer.id, this.mapEventToStat(eventType));
        }
      }
    }

    // Finalize ratings
    Object.keys(playerStats).forEach(pid => {
      playerStats[pid].rating = this.calculateRating(playerStats[pid], players[pid]);
      playerStats[pid].minutesPlayed = 90; // Simplified for now
    });

    return {
      id: uuidv4(),
      homeClubId,
      awayClubId,
      homeScore,
      awayScore,
      events,
      playerStats,
      attendance: 15000 + Math.floor(Math.random() * 40000),
      timestamp: new Date()
    };
  }

  private static calculateTeamStrength(players: Player[]): number {
    if (players.length === 0) return 50;
    return players.reduce((acc, p) => acc + calculateOverall(p), 0) / players.length;
  }

  private static initPlayerStats(playerId: string): PlayerMatchStats {
    return {
      playerId, minutesPlayed: 0, goals: 0, assists: 0, shots: 0, shotsOnTarget: 0,
      passesAttempted: 0, passesCompleted: 0, keyPasses: 0, tackles: 0, fouls: 0,
      yellowCards: 0, redCards: 0, rating: 6.0
    };
  }

  private static rollEventType(): MatchEventType {
    const rand = Math.random();
    if (rand < 0.1) return 'Goal';
    if (rand < 0.4) return 'Shot';
    if (rand < 0.7) return 'KeyPass';
    if (rand < 0.9) return 'YellowCard';
    return 'Foul';
  }

  private static mapEventToStat(type: MatchEventType): keyof PlayerMatchStats {
    switch (type) {
      case 'Shot': return 'shots';
      case 'KeyPass': return 'keyPasses';
      case 'YellowCard': return 'yellowCards';
      case 'Foul': return 'fouls';
      default: return 'minutesPlayed';
    }
  }

  private static updateStats(stats: Record<string, PlayerMatchStats>, pid: string, key: keyof PlayerMatchStats) {
    if (stats[pid]) {
      (stats[pid][key] as number)++;
    }
  }

  private static calculateRating(stats: PlayerMatchStats, player: Player): number {
    let rating = 6.0;
    rating += stats.goals * 1.5;
    rating += stats.assists * 0.8;
    rating += stats.keyPasses * 0.3;
    rating += stats.shotsOnTarget * 0.2;
    rating -= stats.yellowCards * 0.5;
    rating -= stats.redCards * 2.0;
    return Math.min(10, Math.max(0, rating + (Math.random() * 0.5 - 0.25)));
  }
}
