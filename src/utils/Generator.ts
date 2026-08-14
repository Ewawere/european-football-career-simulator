import { v4 as uuidv4 } from 'uuid';
import { Player, Position, Attributes } from '../models/Player';

const FIRST_NAMES = ['Lamine', 'Jude', 'Kylian', 'Bukayo', 'Erling', 'Phil', 'Marcus', 'Gavi', 'Pedri', 'Jamal'];
const LAST_NAMES = ['Yamal', 'Bellingham', 'Mbappé', 'Saka', 'Haaland', 'Foden', 'Rashford', 'Musiala', 'Wirtz', 'Simons'];
const NATIONALITIES = ['England', 'Spain', 'Germany', 'France', 'Italy', 'Portugal', 'Netherlands'];

export class Generator {
  static generateRandomName(): { firstName: string, lastName: string } {
    return {
      firstName: FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)],
      lastName: LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
    };
  }

  static generateAttributes(base: number, variance: number): Attributes {
    const gen = () => Math.min(99, Math.max(1, Math.floor(base + (Math.random() * variance * 2 - variance))));
    return {
      finishing: gen(),
      passing: gen(),
      dribbling: gen(),
      ballControl: gen(),
      crossing: gen(),
      tackling: gen(),
      marking: gen(),
      pace: gen(),
      acceleration: gen(),
      strength: gen(),
      stamina: gen(),
      agility: gen(),
      positioning: gen(),
      vision: gen(),
      composure: gen(),
      decisions: gen(),
      workRate: gen()
    };
  }

  static createPlayer(overrides: Partial<Player> = {}): Player {
    const { firstName, lastName } = this.generateRandomName();
    const position: Position = 'ST';
    
    return {
      id: uuidv4(),
      firstName,
      lastName,
      age: 16,
      nationality: NATIONALITIES[Math.floor(Math.random() * NATIONALITIES.length)],
      position,
      preferredFoot: Math.random() > 0.8 ? 'Left' : 'Right',
      height: 170 + Math.floor(Math.random() * 30),
      weight: 65 + Math.floor(Math.random() * 25),
      attributes: this.generateAttributes(50, 15),
      potential: 70 + Math.floor(Math.random() * 25),
      clubId: null,
      isUser: false,
      marketValue: 500000,
      wage: 500,
      reputation: 10,
      condition: 100,
      morale: 70,
      ...overrides
    };
  }
}
