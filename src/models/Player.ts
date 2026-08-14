export interface Attributes {
  // Technical
  finishing: number;
  passing: number;
  dribbling: number;
  ballControl: number;
  crossing: number;
  tackling: number;
  marking: number;

  // Physical
  pace: number;
  acceleration: number;
  strength: number;
  stamina: number;
  agility: number;

  // Mental
  positioning: number;
  vision: number;
  composure: number;
  decisions: number;
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
  height: number; // in cm
  weight: number; // in kg
  
  attributes: Attributes;
  potential: number;
  
  clubId: string | null;
  isUser: boolean;
  
  marketValue: number;
  wage: number;
  
  reputation: number; // 0-100
  condition: number; // 0-100
  morale: number; // 0-100
}

export function calculateOverall(player: Player): number {
  const { attributes, position } = player;
  
  // Simplified calculation based on position
  if (position === 'ST' || position === 'RW' || position === 'LW') {
    return Math.round(
      (attributes.finishing * 0.4) + 
      (attributes.pace * 0.2) + 
      (attributes.dribbling * 0.2) + 
      (attributes.positioning * 0.2)
    );
  }
  
  if (position === 'CM' || position === 'LM' || position === 'RM') {
    return Math.round(
      (attributes.passing * 0.4) + 
      (attributes.ballControl * 0.2) + 
      (attributes.vision * 0.2) + 
      (attributes.stamina * 0.2)
    );
  }
  
  if (position === 'CB' || position === 'LB' || position === 'RB') {
    return Math.round(
      (attributes.tackling * 0.4) + 
      (attributes.marking * 0.3) + 
      (attributes.strength * 0.15) + 
      (attributes.pace * 0.15)
    );
  }

  // Fallback
  const allAttrs = Object.values(attributes);
  return Math.round(allAttrs.reduce((a, b) => a + b, 0) / allAttrs.length);
}
