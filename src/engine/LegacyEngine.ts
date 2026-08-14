import { Player } from '../models/Player';
import { MatchResult, PlayerMatchStats } from '../models/Match';
import { CareerMilestone, MilestoneType } from '../models/Legacy';
import { v4 as uuidv4 } from 'uuid';

export class LegacyEngine {
  static checkMatchMilestones(player: Player, stats: PlayerMatchStats, match: MatchResult): CareerMilestone[] {
    const newMilestones: CareerMilestone[] = [];

    // 1. Check for Debut
    if (player.matchCount === 1) {
      newMilestones.push(this.createMilestone(player, 'Debut', 'Professional Debut', `Made professional debut for ${player.clubId} against ${match.homeClubId === player.clubId ? match.awayClubId : match.homeClubId}.`, match.timestamp));
    }

    // 2. Check for First Goal
    if (stats.goals > 0 && player.totalGoals === stats.goals) { // If total matches current match goals, it's the first time
       newMilestones.push(this.createMilestone(player, 'FirstGoal', 'First Professional Goal', `Scored first career goal against ${match.homeClubId === player.clubId ? match.awayClubId : match.homeClubId}.`, match.timestamp));
    }

    // 3. Check for Hat-trick
    if (stats.goals >= 3) {
      newMilestones.push(this.createMilestone(player, 'HatTrick', 'Match Ball Winner', `Scored a clinical hat-trick in a single match.`, match.timestamp));
    }

    // 4. Check for First Assist
    if (stats.assists > 0 && player.totalAssists === stats.assists) {
      newMilestones.push(this.createMilestone(player, 'FirstAssist', 'First Career Assist', `Provided first professional assist.`, match.timestamp));
    }

    return newMilestones;
  }

  static createTransferMilestone(player: Player, fromClub: string, toClub: string, fee: number, date: Date): CareerMilestone {
    const feeString = fee === 0 ? 'on loan' : `for a fee of €${(fee/1000000).toFixed(1)}M`;
    return this.createMilestone(
      player, 
      'Transfer', 
      `Joined ${toClub}`, 
      `Completed a move from ${fromClub} to ${toClub} ${feeString}.`, 
      date
    );
  }

  private static createMilestone(player: Player, type: MilestoneType, title: string, description: string, date: Date): CareerMilestone {
    return {
      id: uuidv4(),
      type,
      title,
      description,
      date,
      clubId: player.clubId || 'Unattached',
      age: player.age
    };
  }
}
