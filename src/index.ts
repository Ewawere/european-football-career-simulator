import { GameEngine } from './engine/GameEngine';
import { Generator } from './utils/Generator';

async function simulateTournamentRun() {
  console.log("⚽ EUROPEAN FOOTBALL CAREER SIMULATOR: TOURNAMENT EXPANSION");
  console.log("================================================");

  const engine = new GameEngine();

  // 1. Setup World with League and Cup
  const clubs = ["Arsenal", "Chelsea", "Liverpool", "ManCity", "Spurs", "ManUtd", "Newcastle", "AstonVilla"].map(name => ({
    id: name, name, shortName: name.substring(0, 3).toUpperCase(),
    country: "England", leagueId: "PL", reputation: 85, budget: 100000000, 
    stadiumCapacity: 50000, trainingFacilities: 20, youthAcademy: 20, 
    firstTeamSquad: [], youthSquad: []
  } as any));

  const league = { id: "PL", name: "Premier League", country: "England", tier: 1, teams: [] };
  engine.setupLeague(league, clubs);
  
  // Setup FA Cup
  engine.setupTournament("FACup", "FA Cup", clubs.map(c => c.id));

  // 2. Setup User
  const myPlayer = Generator.createPlayer({
    firstName: "Alex", lastName: "Hunter", nationality: "England", 
    position: "ST", isUser: true, clubId: "Arsenal", potential: 95
  });
  engine.initUserPlayer(myPlayer);
  
  // Fill clubs with players
  clubs.forEach(club => {
    for(let i=0; i<15; i++) engine.addPlayer(Generator.createPlayer({ clubId: club.id }));
  });

  console.log(`👤 Player: ${myPlayer.firstName} ${myPlayer.lastName}`);
  console.log(`👕 Club: ${myPlayer.clubId}`);
  console.log("🏆 Competitions: Premier League & FA Cup");
  console.log("================================================\n");

  // 3. Simulate Month of Football
  console.log("⏳ Simulating Month 1 (League + Cup Rounds)...");
  for (let i = 0; i < 30; i++) {
    engine.advanceDay();
  }

  // 4. Show Tournament Status
  const faCup = engine.getState().tournaments["FACup"];
  console.log(`\n🏆 ${faCup.name} Status`);
  console.log("------------------------------------------------");
  faCup.rounds.forEach((round, idx) => {
    console.log(`Round: ${round.name} | Completed: ${round.isCompleted}`);
  });
  
  if (faCup.winnerId) {
    console.log(`👑 WINNER: ${faCup.winnerId}`);
  }

  // 5. Display Milestones (Look for Tournament Debuts)
  console.log("\n📜 RECENT CAREER MILESTONES");
  console.log("------------------------------------------------");
  const recentMilestones = myPlayer.milestones.slice(-3);
  if (recentMilestones.length === 0) {
    console.log("Keep grinding for that big moment!");
  } else {
    recentMilestones.forEach(m => {
      console.log(`⭐ [${m.type}] ${m.title}`);
      console.log(`   "${m.description}"`);
    });
  }

  // 6. Fatigue Check (Due to fixture congestion)
  console.log("\n🩹 PHYSICAL STATUS");
  console.log(`🔋 Fatigue: ${myPlayer.fatigue.toFixed(0)}%`);
  console.log(`💪 Condition: ${myPlayer.condition.toFixed(0)}%`);
  if (myPlayer.fatigue > 50) {
    console.log("⚠️ Fixture congestion is taking its toll. Rotation may be needed.");
  }

  console.log("\n================================================");
}

simulateTournamentRun().catch(console.error);
