import { GameEngine } from './engine/GameEngine';
import { Generator } from './utils/Generator';

async function simulateSocialAndPersonality() {
  console.log("⚽ EUROPEAN FOOTBALL CAREER SIMULATOR: SOCIAL & PERSONALITY");
  console.log("================================================");

  const engine = new GameEngine();

  // 1. Setup World
  const clubs = [{ id: "Arsenal", name: "Arsenal" }, { id: "Chelsea", name: "Chelsea" }].map(c => ({
    ...c, country: "England", leagueId: "PL", reputation: 80, budget: 100, 
    stadiumCapacity: 50000, trainingFacilities: 20, youthAcademy: 20, 
    firstTeamSquad: [], youthSquad: []
  } as any));

  const league = { id: "PL", name: "Premier League", country: "England", tier: 1, teams: [] };
  engine.setupLeague(league, clubs);

  // 2. Setup User with default personality
  const myPlayer = Generator.createPlayer({
    firstName: "Alex", lastName: "Hunter", nationality: "England", 
    position: "RW", isUser: true, clubId: "Arsenal"
  });
  engine.initUserPlayer(myPlayer);
  
  // Fill clubs
  for(let i=0; i<20; i++) engine.addPlayer(Generator.createPlayer({ clubId: i < 10 ? "Arsenal" : "Chelsea" }));

  console.log(`👤 Player: ${myPlayer.firstName} ${myPlayer.lastName}`);
  console.log(`🎭 Personality: Team Player (${myPlayer.personality.teamPlayer}), Ambition (${myPlayer.personality.ambition})`);
  console.log("================================================\n");

  // 3. Simulate a match that triggers an interview
  console.log("📅 MATCH DAY: Arsenal vs Chelsea");
  let interviewFound = false;
  let safetyBreak = 0;

  while (!interviewFound && safetyBreak < 10) {
    engine.advanceDay();
    if (engine.getState().pendingInterview) {
      interviewFound = true;
    }
    safetyBreak++;
  }

  // 4. Display Social Feed
  console.log("\n📱 SOCIAL MEDIA FEED");
  console.log("------------------------------------------------");
  const feed = engine.getState().socialFeed;
  feed.slice(-3).forEach(post => {
    console.log(`${post.author}: "${post.content}" [❤️ ${post.likes}]`);
  });

  // 5. Post-Match Interview
  const interview = engine.getState().pendingInterview;
  if (interview) {
    console.log("\n🎤 POST-MATCH INTERVIEW");
    console.log("------------------------------------------------");
    console.log(`Reporter: "${interview.question}"`);
    
    // Simulate picking the "Loyal" option (index 2)
    const choiceIdx = 2;
    const choice = interview.options[choiceIdx];
    console.log(`\nSelection: > ${choice.text} (${choice.type})`);
    
    engine.answerInterview(choiceIdx);

    console.log("\n📈 CONSEQUENCES:");
    console.log(`🤝 Manager Trust: ${myPlayer.managerTrust}%`);
    console.log(`🎭 New Loyalty: ${myPlayer.personality.loyalty}`);
    console.log(`🎭 New Ego: ${myPlayer.personality.ego}`);
    console.log(`😊 Morale: ${myPlayer.morale}%`);
  } else {
    console.log("\nNo interview today. The media is focusing elsewhere.");
  }

  console.log("\n================================================");
}

simulateSocialAndPersonality().catch(console.error);
