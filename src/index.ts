import { GameEngine } from './engine/GameEngine';
import { Generator } from './utils/Generator';
import { calculateOverall } from './models/Player';
import { NewsEngine } from './engine/NewsEngine';

async function simulateTrainingWeek() {
  console.log("⚽ EUROPEAN FOOTBALL CAREER SIMULATOR: TRAINING & DEVELOPMENT");
  console.log("================================================");

  const engine = new GameEngine();

  // 1. Setup User with a Development Plan
  const myPlayer = Generator.createPlayer({
    firstName: "Alex",
    lastName: "Hunter",
    nationality: "England",
    position: "LW",
    isUser: true,
    clubId: "Arsenal",
    developmentPlan: "InsideForward" // Focuses on Pace, Dribbling, Finishing
  });
  engine.initUserPlayer(myPlayer);

  console.log(`👤 Player: ${myPlayer.firstName} ${myPlayer.lastName}`);
  console.log(`📈 Starting OVR: ${calculateOverall(myPlayer)}`);
  console.log(`📋 Plan: ${myPlayer.developmentPlan}`);
  console.log("------------------------------------------------\n");

  // 2. Simulate Training Days
  const schedule: any[] = ['Speed', 'Finishing', 'Rest', 'Speed', 'Finishing'];
  
  console.log("📅 WEEKLY TRAINING SCHEDULE");
  schedule.forEach((session, index) => {
    const result = engine.trainUser(session);
    console.log(`Day ${index + 1} [${session}]: ${result.message}`);
    
    // Log small attribute gains if any
    const growthKeys = Object.keys(result.growth);
    if (growthKeys.length > 0) {
      const topGrowth = growthKeys[0];
      console.log(`   📈 ${(result.growth as any)[topGrowth].toFixed(3)} increase in ${topGrowth}`);
    }
  });

  console.log("\n------------------------------------------------");
  console.log(`📊 END OF WEEK STATUS:`);
  console.log(`⭐ New OVR: ${calculateOverall(myPlayer)}`);
  console.log(`🔋 Fatigue: ${myPlayer.fatigue.toFixed(0)}%`);
  console.log(`💪 Condition: ${myPlayer.condition.toFixed(0)}%`);
  
  if (myPlayer.fatigue > 70) {
    console.log("⚠️ Manager: 'You're looking red-lined, Alex. Dial it back or you'll get injured.'");
  }

  // 3. Match Involvement with Fatigue
  console.log("\n================================================");
  console.log("📅 MATCH DAY: Arsenal vs Spurs (Academy Derby)");
  console.log("------------------------------------------------");
  
  // Create some opponents
  for(let i=0; i<11; i++) engine.addPlayer(Generator.createPlayer({ clubId: "Spurs" }));
  for(let i=0; i<11; i++) engine.addPlayer(Generator.createPlayer({ clubId: "Arsenal" }));

  const match = engine.runMatch("Arsenal", "Spurs");
  const stats = match.playerStats[myPlayer.id];

  console.log(`🏟️ Final Score: Arsenal ${match.homeScore} - ${match.awayScore} Spurs`);
  console.log(`⭐ Your Rating: ${stats.rating.toFixed(1)}`);
  
  if (myPlayer.fatigue > 60 && stats.rating < 6.5) {
    console.log("📉 Analysis: Your high fatigue levels clearly impacted your performance today.");
  }

  console.log("================================================\n");
}

simulateTrainingWeek().catch(console.error);
