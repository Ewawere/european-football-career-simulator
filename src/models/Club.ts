export interface Club {
  id: string;
  name: string;
  shortName: string;
  country: string;
  leagueId: string;
  reputation: number; // 0-100
  budget: number;
  stadiumCapacity: number;
  trainingFacilities: number; // 1-20
  youthAcademy: number; // 1-20
  firstTeamSquad: string[]; // Player IDs
  youthSquad: string[]; // Player IDs
}

export interface League {
  id: string;
  name: string;
  country: string;
  tier: number;
  teams: string[]; // Club IDs
}
