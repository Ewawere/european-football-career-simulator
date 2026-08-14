import { GameEngine } from './engine/GameEngine';
import { Generator } from './utils/Generator';
import { WorldEngine } from './engine/WorldEngine';

async function simulateCareerLegacy() {
  console.log("⚽ EUROPEAN FOOTBALL CAREER SIMULATOR: CAREER LEGACY");
  console.log("================================================");

  const engine = new GameEngine();

  // 1. Setup World
  const clubs = [
    { id: "Arsenal", name: "Arsenal" },
    { id: "Dortmund", name: "Dortmund" }
  ].map(c => ({
    ...c, country: "Europe", leagueId: "L1", reputation: 80, budget: 100000000, 
    stadiumCapacity: 50000, trainingFacilities: 20, youthAcademy: 20, 
    firstTeamSquad: [], youthSquad: []
  } as any));

  const league = { id: "L1", name: "Super League", country: "Europe", tier: 1, teams: [] };
  engine.setupLeague(league, clubs);

  // 2. Create User
  const myPlayer = Generator.createPlayer({
    firstName: "Alex", lastName: "Hunter", nationality: "England", 
    position: "ST", isUser: true, clubId: "Arsenal", potential: 90
  });
  engine.initUserPlayer(myPlayer);
  
  // Add some teammates/opponents
  for(let i=0; i<20; i++) engine.addPlayer(Generator.createPlayer({ clubId: i < 10 ? "Arsenal" : "Dortmund" }));

  console.log(`👤 Player: ${myPlayer.firstName} ${myPlayer.lastName}`);
  console.log("🚀 Starting career journey...");
  console.log("================================================\n");

  // 3. Simulate until first goal/milestones
  console.log("📅 SIMULATING MATCHES...");
  let matchesSimulated = 0;
  while (myPlayer.milestones.length < 2 && matchesSimulated < 10) {
    engine.advanceDay();
    matchesSimulated++;
  }

  // 4. Force a Transfer for the demo
  console.log("\n📦 TRANSFER WINDOW UPDATE");
  const transferOffer = {
    id: "offer_1",
    fromClubId: "Dortmund",
    playerId: myPlayer.id,
    fee: 15000000,
    isLoan: false,
    terms: { wage: 50000, length: 4, role: 'Rotation' as any },
    expiryDate: new Date()
  };
  (engine.getState().activeOffers as any).push(transferOffer);
  
  console.log(`📑 Accepting transfer to ${transferOffer.fromClubId}...`);
  engine.acceptOffer(transferOffer.id);

  // 5. Display Career Timeline
  console.log("\n🏆 YOUR CAREER TIMELINE");
  console.log("------------------------------------------------");
  if (myPlayer.milestones.length === 0) {
    console.log("No milestones yet. Keep playing!");
  } else {
    myPlayer.milestones.forEach(m => {
      const dateStr = m.date.toDateString();
      console.log(`[${dateStr}] - ${m.title.toUpperCase()}`);
      console.log(`   Age: ${m.age} | Club: ${m.clubId}`);
      console.log(`   "${m.description}"`);
      console.log("");
    });
  }

  // 6. Career Stats Summary
  console.log("------------------------------------------------");
  console.log("📊 CAREER SUMMARY");
  console.log(`Matches: ${myPlayer.matchCount}`);
  console.log(`Goals:   ${myPlayer.totalGoals}`);
  console.log(`Assists: ${myPlayer.totalAssists}`);
  console.log(`Avg:     ${myPlayer.avgRating.toFixed(2)}`);
  console.log("================================================\n");
}

simulateCareerLegacy().catch(console.error);
