import { GameEngine } from './engine/GameEngine';
import { Generator } from './utils/Generator';
import { calculateOverall } from './models/Player';

async function startNewCareer() {
  console.log("⚽ Welcome to European Football Career Simulator!");
  console.log("------------------------------------------------");

  const engine = new GameEngine();

  // 1. Create User Player
  const myPlayer = Generator.createPlayer({
    firstName: "Alex",
    lastName: "Hunter",
    nationality: "England",
    position: "RW",
    isUser: true
  });

  engine.initUserPlayer(myPlayer);

  console.log(`👤 Player Created: ${myPlayer.firstName} ${myPlayer.lastName}`);
  console.log(`📍 Position: ${myPlayer.position}`);
  console.log(`📊 Starting Overall: ${calculateOverall(myPlayer)}`);
  console.log(`🎯 Potential: ${myPlayer.potential}`);
  console.log("------------------------------------------------");

  // 2. Start in Academy
  console.log("🏠 You have joined the Arsenal Academy.");
  myPlayer.clubId = "arsenal-fc"; // Placeholder ID

  // 3. Simulate first few weeks
  console.log("⏳ Training for 3 weeks...");
  for (let i = 0; i < 3; i++) {
    engine.advanceWeek();
    console.log(`📅 Date: ${engine.getState().currentDate.toDateString()}`);
  }

  // 4. First Match Involvement
  console.log("------------------------------------------------");
  console.log("📋 Match Day: Arsenal U21 vs Chelsea U21");
  console.log("📢 Manager: 'You're starting on the bench today. Be ready.'");
  
  console.log("⏳ Match simulated until 65'...");
  const matchResult = engine.simulateMatch("arsenal-fc", "chelsea-fc");
  
  console.log(`🔄 65' - SUBSTITUTION: You are coming on!`);
  console.log(`📈 Performance Rating: ${matchResult.playerRating}`);
  console.log(`🏟️ Final Score: ${matchResult.score}`);
  
  if (parseFloat(matchResult.playerRating) > 7.5) {
    console.log("🌟 Manager: 'Excellent impact, kid. You've earned more minutes.'");
  } else {
    console.log("💪 Manager: 'Keep working hard on the training ground.'");
  }

  console.log("------------------------------------------------");
  console.log("🏆 End of Prologue. Your career has just begun.");
}

startNewCareer().catch(console.error);
