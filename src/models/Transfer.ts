export interface ScoutingProfile {
  preferredPositions: string[];
  minPotential: number;
  maxAge: number;
  budget: number;
  style: 'Growth' | 'WinNow' | 'Balanced';
}

export interface ClubInterest {
  clubId: string;
  interestLevel: number; // 0-100
  scoutReport: string;
}

export interface ContractTerms {
  wage: number;
  length: number; // years
  role: 'Prospect' | 'Backup' | 'Rotation' | 'Important' | 'Star';
}

export interface TransferOffer {
  id: string;
  fromClubId: string;
  playerId: string;
  fee: number;
  isLoan: boolean;
  terms: ContractTerms;
  expiryDate: Date;
}
