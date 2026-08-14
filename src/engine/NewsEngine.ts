import { MatchResult } from '../models/Match';
import { Player } from '../models/Player';

export interface NewsArticle {
  id: string;
  headline: string;
  content: string;
  date: Date;
  importance: number; // 1-10
  category: 'MatchReport' | 'Transfer' | 'Injury' | 'Academy';
}

export class NewsEngine {
  static generateMatchReport(match: MatchResult, players: Record<string, Player>, userPlayerId: string | null): NewsArticle {
    const userStats = userPlayerId ? match.playerStats[userPlayerId] : null;
    const userPlayer = userPlayerId ? players[userPlayerId] : null;
    
    let headline = `${match.homeClubId} vs ${match.awayClubId} ends ${match.homeScore}-${match.awayScore}`;
    let content = `A thrilling match at the stadium.`;

    if (userStats && userPlayer) {
      if (userStats.goals > 0) {
        headline = `🌟 ACADEMY STAR ${userPlayer.lastName.toUpperCase()} SCORES!`;
        content = `${userPlayer.firstName} ${userPlayer.lastName} scored a vital goal in today's match, proving why he is one of the most exciting prospects.`;
      } else if (userStats.rating > 8.0) {
        headline = `🔥 ${userPlayer.lastName.toUpperCase()} DOMINATES THE PITCH`;
        content = `Despite not scoring, ${userPlayer.lastName} was everywhere today. A masterclass performance with a rating of ${userStats.rating.toFixed(1)}.`;
      } else if (userStats.rating < 5.5) {
        headline = `📉 TOUGH DAY FOR YOUNG ${userPlayer.lastName.toUpperCase()}`;
        content = `It was a performance to forget for the youngster. He struggled to find his rhythm today.`;
      }
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      headline,
      content,
      date: match.timestamp,
      importance: 7,
      category: 'MatchReport'
    };
  }

  static generateWorldNews(date: Date): NewsArticle {
    const scenarios = [
      { h: "Real Madrid monitoring Brazilian market", c: "The Spanish giants are looking for the next big thing." },
      { h: "Heavy rain causes fixture backlog in England", c: "Multiple matches have been postponed due to waterlogged pitches." },
      { h: "Record breaking TV deal for European football", c: "The new broadcasting rights are set to reach billions." }
    ];
    const pick = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      headline: pick.h,
      content: pick.c,
      date,
      importance: 4,
      category: 'Academy'
    };
  }
}
