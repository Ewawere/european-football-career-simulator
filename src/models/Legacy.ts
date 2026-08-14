export type MilestoneType = 
  | 'Debut' 
  | 'FirstGoal' 
  | 'FirstAssist' 
  | 'HatTrick' 
  | 'Trophy' 
  | 'Transfer' 
  | 'InternationalDebut' 
  | 'Captaincy' 
  | 'Award';

export interface CareerMilestone {
  id: string;
  type: MilestoneType;
  title: string;
  description: string;
  date: Date;
  clubId: string;
  age: number;
}
