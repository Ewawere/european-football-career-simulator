import { GameEngine } from './engine/GameEngine';
import { Generator } from './utils/Generator';
import { WorldEngine } from './engine/WorldEngine';
import { calculateOverall } from './models/Player';

async function simulateLivingWorld() {
  console.log("⚽ EUROPEAN FOOTBALL CAREER SIMULATOR: LIVING WORLD");
  console.log("================================================");

  const engine = new GameEngine();

  // 1. Setup League and Clubs
  const clubs = [
    { id: "Arsenal", name: "Arsenal", shortName: "ARS" },
    { id: "Chelsea", name: "Chelsea", shortName: "CHE" },
    { id: "Liverpool", name: "Liverpool", shortName: "LIV" },
    { id: "ManCity", name: "Man City", shortName: "MCI" }
  ].map(c => ({
    ...c, country: "England", leagueId: "PL", reputation: 80, budget: 100000000, 
    stadiumCapacity: 50000, trainingFacilities: 20, youthAcademy: 20, 
    firstTeamSquad: [], youthSquad: []
  }));

  const league = { id: "PL", name: "Premier League", country: "England", tier: 1, teams: [] };
  engine.setupLeague(league, clubs);

  // 2. Setup User Player in Arsenal
  const myPlayer = Generator.createPlayer({
    firstName: "Alex", lastName: "Hunter", nationality: "England", 
    position: "ST", isUser: true, clubId: "Arsenal"
  });
  engine.initUserPlayer(myPlayer);

  // Fill clubs with some players
  clubs.forEach(club => {
    for(let i=0; i<15; i++) engine.addPlayer(Generator.createPlayer({ clubId: club.id }));
  });

  console.log(`👤 Player: ${myPlayer.firstName} ${myPlayer.lastName}`);
  console.log(`👕 Club: ${myPlayer.clubId}`);
  console.log(`👔 Manager Trust: ${myPlayer.managerTrust}%`);
  console.log("================================================\n");

  // 3. Simulate 10 Days of the Season
  console.log("⏳ Simulating early season (10 days)...");
  for (let i = 0; i < 10; i++) {
    const today = engine.getState().currentDate.toDateString();
    
    // Training on non-match days
    const matchToday = engine.getState().fixtures.some(f => f.date.toDateString() === today);
    if (!matchToday) {
      engine.trainUser('Finishing');
    }

    engine.advanceDay();
  }

  // 4. Show League Table
  console.log("\n📊 PREMIER LEAGUE TABLE");
  console.log("------------------------------------------------");
  console.log("Pos | Club       | P | W | D | L | Pts");
  const table = WorldEngine.sortTable(engine.getState().leagueTables["PL"]);
  table.forEach((entry, idx) => {
    const clubName = engine.getState().clubs[entry.clubId].name.padEnd(10);
    console.log(`${(idx + 1).toString().padEnd(3)} | ${clubName} | ${entry.played} | ${entry.won} | ${entry.drawn} | ${entry.lost} | ${entry.points}`);
  });
  console.log("------------------------------------------------");

  // 5. Show Career Impact
  console.log("\n📈 CAREER PROGRESSION");
  console.log(`⭐ Average Rating: ${myPlayer.avgRating.toFixed(2)}`);
  console.log(`🤝 Manager Trust: ${myPlayer.managerTrust}%`);
  
  if (myPlayer.managerTrust > 60) {
    console.log("✅ Manager: 'You're becoming a vital part of my plans, Alex.'");
  } else if (myPlayer.managerTrust < 40) {
    console.log("⚠️ Manager: 'You need to step up your game if you want to stay in the squad.'");
  }

  // 6. World News (AI Transfers)
  console.log("\n📰 WORLD NEWS FLASH");
  console.log("------------------------------------------------");
  console.log(`🔴 BREAKING: Man City have signed a new prospect for €${(Math.random() * 50).toFixed(1)}M.`);
  console.log(`🌐 SCOUTING: Several clubs are monitoring ${myPlayer.lastName}'s progress at Arsenal.`);
  console.log("================================================\n");
}

simulateLivingWorld().catch(console.error);
