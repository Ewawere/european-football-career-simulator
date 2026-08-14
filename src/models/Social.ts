export interface Personality {
  teamPlayer: number; // 0-100
  confidence: number;
  ambition: number;
  loyalty: number;
  ego: number;
  professionalism: number;
}

export interface SocialPost {
  id: string;
  author: string; // Handle like @GoonerLife
  content: string;
  likes: number;
  isTrending: boolean;
  timestamp: Date;
}

export interface InterviewOption {
  text: string;
  type: 'Humble' | 'Confident' | 'Loyal' | 'Deflected';
  consequences: {
    personalityChange: Partial<Personality>;
    managerTrustChange: number;
    moraleChange: number;
  };
}

export interface Interview {
  id: string;
  question: string;
  options: InterviewOption[];
}
