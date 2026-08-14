import { Appearance } from './Appearance';

export type DevelopmentPlan = 'Balanced' | 'InsideForward' | 'Playmaker' | 'TargetMan' | 'DefensiveWinger';

export interface Attributes {
  finishing: number; passing: number; dribbling: number; ballControl: number;
  crossing: number; tackling: number; marking: number; pace: number;
  acceleration: number; strength: number; stamina: number; agility: number;
  positioning: number; vision: number; composure: number; decisions: number;
  workRate: number;
}

export type Position = 'GK' | 'LB' | 'CB' | 'RB' | 'LM' | 'CM' | 'RM' | 'LW' | 'ST' | 'RW';

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  nationality: string;
  position: Position;
  preferredFoot: 'Left' | 'Right' | 'Both';
  
  appearance: Appearance;
  attributes: Attributes;
  potential: number;
  developmentPlan: DevelopmentPlan;
  
  clubId: string | null;
  isUser: boolean;
  
  marketValue: number;
  wage: number;
  contractYearsRemaining: number;
  
  reputation: number;
  condition: number;
  fatigue: number;
  morale: number;
  
  // Performance tracking
  avgRating: number;
  matchCount: number;

  // Manager Relationship (User only usually, but stored here)
  managerTrust: number; // 0-100
}

export function calculateOverall(player: Player): number {
  const { attributes, position } = player;
  if (position === 'ST' || position === 'RW' || position === 'LW') {
    return Math.round((attributes.finishing * 0.4) + (attributes.pace * 0.2) + (attributes.dribbling * 0.2) + (attributes.positioning * 0.2));
  }
  if (position === 'CM' || position === 'LM' || position === 'RM') {
    return Math.round((attributes.passing * 0.4) + (attributes.ballControl * 0.2) + (attributes.vision * 0.2) + (attributes.stamina * 0.2));
  }
  if (position === 'CB' || position === 'LB' || position === 'RB') {
    return Math.round((attributes.tackling * 0.4) + (attributes.marking * 0.3) + (attributes.strength * 0.15) + (attributes.pace * 0.15));
  }
  const allAttrs = Object.values(attributes);
  return Math.round(allAttrs.reduce((a, b) => a + b, 0) / allAttrs.length);
}
