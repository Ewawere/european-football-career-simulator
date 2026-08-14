import { LeagueTable, TableEntry, Fixture } from '../models/World';
import { MatchResult } from '../models/Match';
import { v4 as uuidv4 } from 'uuid';

export class WorldEngine {
  static initLeagueTable(leagueId: string, clubIds: string[]): LeagueTable {
    const entries: Record<string, TableEntry> = {};
    clubIds.forEach(id => {
      entries[id] = {
        clubId: id, played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, points: 0
      };
    });
    return { leagueId, season: 2024, entries };
  }

  static updateTable(table: LeagueTable, match: MatchResult) {
    const homeEntry = table.entries[match.homeClubId];
    const awayEntry = table.entries[match.awayClubId];

    if (!homeEntry || !awayEntry) return;

    homeEntry.played++;
    awayEntry.played++;
    homeEntry.goalsFor += match.homeScore;
    homeEntry.goalsAgainst += match.awayScore;
    awayEntry.goalsFor += match.awayScore;
    awayEntry.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      homeEntry.won++;
      homeEntry.points += 3;
      awayEntry.lost++;
    } else if (match.homeScore < match.awayScore) {
      awayEntry.won++;
      awayEntry.points += 3;
      homeEntry.lost++;
    } else {
      homeEntry.drawn++;
      awayEntry.drawn++;
      homeEntry.points += 1;
      awayEntry.points += 1;
    }
  }

  static generateFixtures(leagueId: string, clubIds: string[], startDate: Date): Fixture[] {
    const fixtures: Fixture[] = [];
    let currentDate = new Date(startDate);

    // Simple round-robin (not perfect scheduler, but works for prototype)
    for (let i = 0; i < clubIds.length; i++) {
      for (let j = i + 1; j < clubIds.length; j++) {
        fixtures.push({
          id: uuidv4(),
          homeClubId: clubIds[i],
          awayClubId: clubIds[j],
          date: new Date(currentDate),
          competitionId: leagueId,
          isPlayed: false
        });
        currentDate.setDate(currentDate.getDate() + 1); // Spread them out
      }
    }
    return fixtures;
  }

  static sortTable(table: LeagueTable): TableEntry[] {
    return Object.values(table.entries).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const gdA = a.goalsFor - a.goalsAgainst;
      const gdB = b.goalsFor - b.goalsAgainst;
      return gdB - gdA;
    });
  }
}
