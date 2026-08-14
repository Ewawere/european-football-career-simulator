import { Player, calculateOverall } from '../models/Player';
import { Club } from '../models/Club';
import { TransferOffer, ContractTerms, ClubInterest, ScoutingProfile } from '../models/Transfer';
import { v4 as uuidv4 } from 'uuid';

export class TransferEngine {
  static calculateMarketValue(player: Player): number {
    const ovr = calculateOverall(player);
    const potentialFactor = (player.potential - ovr) * 2;
    const ageFactor = Math.max(1, (30 - player.age) / 2);
    const performanceFactor = player.avgRating > 0 ? (player.avgRating / 7.0) : 1;
    
    // Base value based on OVR
    let base = Math.pow(ovr / 10, 4) * 10000;
    
    let total = base * ageFactor * performanceFactor;
    total += potentialFactor * 500000;

    return Math.round(total / 1000) * 1000; // Round to nearest 1000
  }

  static updateInterest(player: Player, club: Club, currentInterest: number): number {
    let newInterest = currentInterest || 0;
    const ovr = calculateOverall(player);
    
    // Clubs check if player fits their profile
    // This is simplified for the demo
    if (player.potential > 80) newInterest += 5;
    if (player.avgRating > 7.5) newInterest += 10;
    if (player.avgRating < 6.0) newInterest -= 5;
    
    return Math.min(100, Math.max(0, newInterest));
  }

  static generateOffer(player: Player, club: Club, isLoan: boolean): TransferOffer {
    const value = this.calculateMarketValue(player);
    const fee = isLoan ? 0 : Math.round(value * (0.9 + Math.random() * 0.4));
    
    const terms: ContractTerms = {
      wage: Math.round((value / 500) * (0.8 + Math.random() * 0.4)),
      length: isLoan ? 1 : 3 + Math.floor(Math.random() * 3),
      role: player.age < 20 ? 'Prospect' : 'Rotation'
    };

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 14);

    return {
      id: uuidv4(),
      fromClubId: club.id,
      playerId: player.id,
      fee,
      isLoan,
      terms,
      expiryDate: expiry
    };
  }
}
