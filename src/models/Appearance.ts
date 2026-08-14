export interface Appearance {
  skinTone: number; // 1-10
  hairColor: string;
  hairStyle: string;
  facialHair: string;
  eyeColor: string;
  faceShapeSeed: string; // Used for procedural generation seed
  height: number;
  weight: number;
}

export function generateAppearance(seed: string): Appearance {
  // Simple deterministic generation based on a seed string
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const hairColors = ['Black', 'Brown', 'Blonde', 'Red', 'Grey'];
  const hairStyles = ['Short', 'Buzzcut', 'Long', 'Fade', 'Curls', 'Man-Bun'];
  const facialHairs = ['None', 'Stubble', 'Full Beard', 'Goatee', 'Mustache'];
  const eyeColors = ['Brown', 'Blue', 'Green', 'Hazel'];

  return {
    skinTone: (hash % 10) + 1,
    hairColor: hairColors[hash % hairColors.length],
    hairStyle: hairStyles[(hash >> 1) % hairStyles.length],
    facialHair: facialHairs[(hash >> 2) % facialHairs.length],
    eyeColor: eyeColors[(hash >> 3) % eyeColors.length],
    faceShapeSeed: `face_${hash}`,
    height: 165 + (hash % 35),
    weight: 60 + (hash % 30)
  };
}
