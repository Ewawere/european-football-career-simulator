import { GameEngine } from './engine/GameEngine';
import { Generator } from './utils/Generator';
import { calculateOverall } from './models/Player';
import { NewsEngine } from './engine/NewsEngine';

async function simulateTransferPipeline() {
  console.log("⚽ EUROPEAN FOOTBALL CAREER SIMULATOR: TRANSFERS & CONTRACTS");
  console.log("================================================");

  const engine = new GameEngine();

  // 1. Setup User and Clubs
  const myPlayer = Generator.createPlayer({
    firstName: "Alex",
    lastName: "Hunter",
    nationality: "England",
    position: "ST",
    isUser: true,
    clubId: "Arsenal_Academy",
    potential: 88
  });
  engine.initUserPlayer(myPlayer);

  // Add potential suitor clubs
  engine.addClub({ id: "Arsenal_Academy", name: "Arsenal Academy", shortName: "ARS", country: "England", leagueId: "PL", reputation: 70, budget: 1000000, stadiumCapacity: 5000, trainingFacilities: 18, youthAcademy: 20, firstTeamSquad: [], youthSquad: [] });
  engine.addClub({ id: "Dortmund", name: "Borussia Dortmund", shortName: "BVB", country: "Germany", leagueId: "BND", reputation: 85, budget: 50000000, stadiumCapacity: 80000, trainingFacilities: 19, youthAcademy: 19, firstTeamSquad: [], youthSquad: [] });
  engine.addClub({ id: "Ajax", name: "Ajax Amsterdam", shortName: "AJX", country: "Netherlands", leagueId: "ERD", reputation: 80, budget: 30000000, stadiumCapacity: 55000, trainingFacilities: 20, youthAcademy: 20, firstTeamSquad: [], youthSquad: [] });

  console.log(`👤 Player: ${myPlayer.firstName} ${myPlayer.lastName}`);
  console.log(`🏠 Current Club: ${myPlayer.clubId}`);
  console.log(`💰 Initial Market Value: €${(myPlayer.marketValue / 1000000).toFixed(1)}M`);
  console.log("================================================\n");

  // 2. Perform well in matches to build reputation and interest
  console.log("📅 MONTH 1: Dominating the Youth League...");
  for (let matchDay = 1; matchDay <= 4; matchDay++) {
    // Add some random players for simulation
    for(let i=0; i<22; i++) engine.addPlayer(Generator.createPlayer({ clubId: i < 11 ? "Arsenal_Academy" : "Opponent" }));
    
    const match = engine.runMatch("Arsenal_Academy", "Opponent");
    const stats = match.playerStats[myPlayer.id];
    console.log(`Match ${matchDay} Rating: ${stats.rating.toFixed(1)} ${stats.goals > 0 ? `(⚽ ${stats.goals} Goal)` : ''}`);
    
    engine.advanceWeek();
  }

  console.log("\n------------------------------------------------");
  console.log(`📊 FORM CHECK:`);
  console.log(`⭐ Average Rating: ${myPlayer.avgRating.toFixed(2)}`);
  console.log(`📈 New Market Value: €${(myPlayer.marketValue / 1000000).toFixed(1)}M`);
  
  // 3. Check Interest
  console.log("\n🔎 SCOUTING REPORTS:");
  const interests = engine.getState().clubInterest;
  Object.entries(interests).forEach(([clubId, playerInterests]) => {
    const level = playerInterests[myPlayer.id] || 0;
    if (level > 0) {
      console.log(`👀 ${clubId}: Interest Level ${level}%`);
    }
  });

  // 4. Simulate more weeks until an offer arrives
  console.log("\n⏳ Advancing time to Transfer Window...");
  let offerReceived = null;
  for (let i = 0; i < 4; i++) {
    engine.advanceWeek();
    const offers = engine.getState().activeOffers;
    if (offers.length > 0) {
      offerReceived = offers[0];
      break;
    }
  }

  if (offerReceived) {
    const fromClub = engine.getState().clubs[offerReceived.fromClubId];
    console.log("\n📩 TRANSFER OFFER RECEIVED!");
    console.log("------------------------------------------------");
    console.log(`From: ${fromClub.name}`);
    console.log(`Type: ${offerReceived.isLoan ? 'Loan' : 'Permanent Transfer'}`);
    console.log(`Fee: €${(offerReceived.fee / 1000000).toFixed(1)}M`);
    console.log(`Proposed Wage: €${offerReceived.terms.wage.toLocaleString()}/week`);
    console.log(`Role: ${offerReceived.terms.role}`);
    console.log(`Contract: ${offerReceived.terms.length} Years`);
    console.log("------------------------------------------------");

    console.log(`\n✅ Accepting offer from ${fromClub.name}...`);
    engine.acceptOffer(offerReceived.id);
    
    console.log(`\n🎉 WELCOME TO ${fromClub.name.toUpperCase()}!`);
    console.log(`👤 ${myPlayer.firstName} ${myPlayer.lastName} has officially joined.`);
    console.log(`💰 Weekly Wage: €${myPlayer.wage.toLocaleString()}`);
  } else {
    console.log("\n📅 No formal offers this window. Keep performing!");
  }

  console.log("\n================================================");
}

simulateTransferPipeline().catch(console.error);
