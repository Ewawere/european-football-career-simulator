import { Tournament, TournamentRound } from '../models/Tournament';
import { Fixture } from '../models/World';
import { MatchResult } from '../models/Match';
import { v4 as uuidv4 } from 'uuid';

export class TournamentEngine {
  static createKnockoutTournament(id: string, name: string, participants: string[], startDate: Date): Tournament {
    const tournament: Tournament = {
      id,
      name,
      type: 'Knockout',
      participants,
      rounds: [],
      currentRoundIndex: 0
    };

    // Initialize first round
    tournament.rounds.push(this.generateKnockoutRound("First Round", participants, startDate, id));
    return tournament;
  }

  static generateKnockoutRound(name: string, teams: string[], startDate: Date, tournamentId: string): TournamentRound {
    const fixtures: Fixture[] = [];
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    
    let currentDate = new Date(startDate);

    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        fixtures.push({
          id: uuidv4(),
          homeClubId: shuffled[i],
          awayClubId: shuffled[i + 1],
          date: new Date(currentDate),
          competitionId: tournamentId,
          isPlayed: false
        });
        currentDate.setDate(currentDate.getDate() + 2); // Space out cup games
      }
    }

    return { name, fixtures, isCompleted: false };
  }

  static checkRoundCompletion(tournament: Tournament, matchHistory: MatchResult[], startDateForNextRound: Date): boolean {
    const currentRound = tournament.rounds[tournament.currentRoundIndex];
    if (currentRound.isCompleted) return false;

    const allPlayed = currentRound.fixtures.every(f => f.isPlayed);
    if (allPlayed) {
      currentRound.isCompleted = true;
      
      // Get winners
      const winners: string[] = [];
      currentRound.fixtures.forEach(f => {
        const result = matchHistory.find(m => m.id === f.resultId);
        if (result) {
          if (result.homeScore > result.awayScore) winners.push(result.homeClubId);
          else if (result.homeScore < result.awayScore) winners.push(result.awayClubId);
          else {
            // Simple random winner for draws in this prototype
            winners.push(Math.random() > 0.5 ? result.homeClubId : result.awayClubId);
          }
        }
      });

      if (winners.length === 1) {
        tournament.winnerId = winners[0];
      } else if (winners.length > 1) {
        // Generate next round
        const nextRoundName = winners.length === 2 ? "Final" : winners.length === 4 ? "Semi-Final" : "Next Round";
        tournament.rounds.push(this.generateKnockoutRound(nextRoundName, winners, startDateForNextRound, tournament.id));
        tournament.currentRoundIndex++;
      }
      return true;
    }
    return false;
  }
}
