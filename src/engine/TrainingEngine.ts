import { Player, Attributes, DevelopmentPlan } from '../models/Player';

export type TrainingSession = 'Finishing' | 'Speed' | 'Playmaking' | 'Defensive' | 'Rest';

export class TrainingEngine {
  private static PLAN_MAPPINGS: Record<DevelopmentPlan, (keyof Attributes)[]> = {
    Balanced: ['finishing', 'passing', 'dribbling', 'pace', 'tackling'],
    InsideForward: ['finishing', 'pace', 'dribbling', 'acceleration'],
    Playmaker: ['passing', 'vision', 'ballControl', 'composure'],
    TargetMan: ['finishing', 'strength', 'positioning', 'ballControl'],
    DefensiveWinger: ['pace', 'stamina', 'tackling', 'workRate']
  };

  private static SESSION_MAPPINGS: Record<TrainingSession, (keyof Attributes)[]> = {
    Finishing: ['finishing', 'positioning', 'composure'],
    Speed: ['pace', 'acceleration', 'stamina'],
    Playmaking: ['passing', 'vision', 'ballControl'],
    Defensive: ['tackling', 'marking', 'positioning'],
    Rest: []
  };

  static train(player: Player, session: TrainingSession): { message: string, growth: Partial<Attributes> } {
    if (session === 'Rest') {
      const recovery = 20 + Math.floor(Math.random() * 10);
      player.fatigue = Math.max(0, player.fatigue - recovery);
      player.condition = Math.min(100, player.condition + 5);
      return { message: "You took a rest day. Fatigue decreased.", growth: {} };
    }

    // Increase fatigue
    const fatigueCost = session === 'Speed' ? 25 : 15;
    player.fatigue += fatigueCost;

    // Check for injury risk
    if (player.fatigue > 85 && Math.random() < 0.15) {
      player.condition -= 30;
      player.morale -= 10;
      return { message: "⚠️ You pushed too hard and picked up a minor strain!", growth: {} };
    }

    const focusAttributes = this.SESSION_MAPPINGS[session];
    const planAttributes = this.PLAN_MAPPINGS[player.developmentPlan];
    const allRelevant = Array.from(new Set([...focusAttributes, ...planAttributes]));

    const growth: Partial<Attributes> = {};
    const ageFactor = Math.max(0.1, (25 - player.age) / 10); // Faster growth for young players
    const potentialFactor = (player.potential / 100);

    allRelevant.forEach(attr => {
      const currentVal = (player.attributes as any)[attr];
      if (currentVal < player.potential) {
        // Calculate growth increment
        const increment = (Math.random() * 0.2 + 0.1) * ageFactor * potentialFactor;
        (player.attributes as any)[attr] += increment;
        growth[attr] = increment;
      }
    });

    return { 
      message: `Training session [${session}] completed.`, 
      growth 
    };
  }

  static processPassiveGrowth(player: Player) {
    // Small passive growth based on development plan
    const planAttributes = this.PLAN_MAPPINGS[player.developmentPlan];
    const ageFactor = Math.max(0.05, (23 - player.age) / 15);
    
    planAttributes.forEach(attr => {
      const currentVal = (player.attributes as any)[attr];
      if (currentVal < player.potential) {
        (player.attributes as any)[attr] += 0.02 * ageFactor;
      }
    });
    
    // Natural fatigue recovery over time (weekly)
    player.fatigue = Math.max(0, player.fatigue - 10);
  }
}
