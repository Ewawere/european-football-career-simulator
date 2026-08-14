import { Player } from '../models/Player';
import { MatchResult } from '../models/Match';
import { SocialPost, Interview, InterviewOption } from '../models/Social';
import { v4 as uuidv4 } from 'uuid';

export class SocialEngine {
  static generateFanReactions(player: Player, match: MatchResult): SocialPost[] {
    const stats = match.playerStats[player.id];
    if (!stats) return [];

    const reactions: SocialPost[] = [];
    const handle = `@${player.lastName}Fan_${Math.floor(Math.random() * 1000)}`;

    if (stats.goals > 0) {
      reactions.push({
        id: uuidv4(),
        author: handle,
        content: `WHAT A GOAL BY ${player.lastName.toUpperCase()}! 🔥 This kid is special.`,
        likes: Math.floor(Math.random() * 500),
        isTrending: true,
        timestamp: match.timestamp
      });
    } else if (stats.rating > 8.0) {
      reactions.push({
        id: uuidv4(),
        author: handle,
        content: `${player.lastName} was absolutely everywhere today. What a performance!`,
        likes: Math.floor(Math.random() * 300),
        isTrending: false,
        timestamp: match.timestamp
      });
    } else if (stats.rating < 6.0) {
      reactions.push({
        id: uuidv4(),
        author: handle,
        content: `Tough game for ${player.lastName} today. He'll bounce back.`,
        likes: Math.floor(Math.random() * 50),
        isTrending: false,
        timestamp: match.timestamp
      });
    }

    return reactions;
  }

  static generateTrendingTopic(event: string): string {
    return `#${event.replace(/\s+/g, '')}`;
  }
}

export class InterviewEngine {
  static generatePostMatchInterview(player: Player, match: MatchResult): Interview | null {
    const stats = match.playerStats[player.id];
    if (!stats || (stats.goals === 0 && stats.rating < 8.0)) return null;

    const question = stats.goals > 0 
      ? `You scored the winner today, ${player.firstName}. How does it feel?` 
      : `An incredible performance from you today. What's the secret?`;

    const options: InterviewOption[] = [
      {
        text: "The team made it possible. I'm just happy to contribute.",
        type: 'Humble',
        consequences: {
          personalityChange: { teamPlayer: 2, ego: -1 },
          managerTrustChange: 2,
          moraleChange: 5
        }
      },
      {
        text: "I knew I was going to score. I've been working for this.",
        type: 'Confident',
        consequences: {
          personalityChange: { confidence: 3, ego: 2 },
          managerTrustChange: 1,
          moraleChange: 10
        }
      },
      {
        text: "I do it for the fans and this club. Arsenal is home.",
        type: 'Loyal',
        consequences: {
          personalityChange: { loyalty: 5, teamPlayer: 1 },
          managerTrustChange: 1,
          moraleChange: 7
        }
      }
    ];

    return {
      id: uuidv4(),
      question,
      options
    };
  }

  static applyInterviewChoice(player: Player, choice: InterviewOption) {
    // Apply Personality changes
    if (choice.consequences.personalityChange.teamPlayer) player.personality.teamPlayer = Math.min(100, player.personality.teamPlayer + choice.consequences.personalityChange.teamPlayer);
    if (choice.consequences.personalityChange.confidence) player.personality.confidence = Math.min(100, player.personality.confidence + choice.consequences.personalityChange.confidence);
    if (choice.consequences.personalityChange.loyalty) player.personality.loyalty = Math.min(100, player.personality.loyalty + choice.consequences.personalityChange.loyalty);
    if (choice.consequences.personalityChange.ego) player.personality.ego = Math.min(100, player.personality.ego + choice.consequences.personalityChange.ego);
    
    // Apply other changes
    player.managerTrust = Math.min(100, Math.max(0, player.managerTrust + choice.consequences.managerTrustChange));
    player.morale = Math.min(100, Math.max(0, player.morale + choice.consequences.moraleChange));
  }
}
