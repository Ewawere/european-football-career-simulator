import { GameEngine } from './engine/GameEngine';
import { Generator } from './utils/Generator';
import { calculateOverall } from './models/Player';
import { NewsEngine } from './engine/NewsEngine';

async function simulateCareerSeason() {
  console.log("⚽ EUROPEAN FOOTBALL CAREER SIMULATOR");
  console.log("================================================");

  const engine = new GameEngine();

  // 1. Setup User
  const myPlayer = Generator.createPlayer({
    firstName: "Alex",
    lastName: "Hunter",
    nationality: "England",
    position: "RW",
    isUser: true,
    clubId: "Arsenal"
  });
  engine.initUserPlayer(myPlayer);

  // 2. Setup Teammates & Opponents
  const arsenalPlayers = Array.from({ length: 15 }, () => Generator.createPlayer({ clubId: "Arsenal" }));
  const chelseaPlayers = Array.from({ length: 11 }, () => Generator.createPlayer({ clubId: "Chelsea" }));
  
  arsenalPlayers.forEach(p => engine.addPlayer(p));
  chelseaPlayers.forEach(p => engine.addPlayer(p));

  console.log(`👤 Player: ${myPlayer.firstName} ${myPlayer.lastName}`);
  console.log(`👕 Club: ${myPlayer.clubId} Academy`);
  console.log(`📈 Overall: ${calculateOverall(myPlayer)} | Potential: ${myPlayer.potential}`);
  console.log(`🧬 Appearance: ${myPlayer.appearance.hairStyle} ${myPlayer.appearance.hairColor} hair, ${myPlayer.appearance.height}cm`);
  console.log("================================================\n");

  // 3. Match Day
  console.log("📅 MATCH DAY: Arsenal vs Chelsea (Youth League)");
  console.log("------------------------------------------------");
  
  const match = engine.runMatch("Arsenal", "Chelsea");

  // Print Match Events
  match.events.forEach(event => {
    console.log(`[${event.minute}'] ${event.description}`);
  });

  console.log("------------------------------------------------");
  console.log(`🏟️ FINAL SCORE: Arsenal ${match.homeScore} - ${match.awayScore} Chelsea`);
  
  const stats = match.playerStats[myPlayer.id];
  console.log(`\n📊 YOUR STATS:`);
  console.log(`⭐ Rating: ${stats.rating.toFixed(1)}`);
  console.log(`⚽ Goals: ${stats.goals} | 🎯 Assists: ${stats.assists}`);
  console.log(`👞 Shots: ${stats.shots} | 🔑 Key Passes: ${stats.keyPasses}`);
  console.log(`🟨 Cards: ${stats.yellowCards} Yellow, ${stats.redCards} Red`);
  console.log("================================================\n");

  // 4. News & Media
  console.log("📰 LATEST NEWS");
  const report = NewsEngine.generateMatchReport(match, engine.getState().players, myPlayer.id);
  const worldNews = NewsEngine.generateWorldNews(engine.getState().currentDate);

  console.log(`🔴 ${report.headline}`);
  console.log(`   "${report.content}"`);
  console.log(`\n🌐 ${worldNews.headline}`);
  console.log(`   "${worldNews.content}"`);
  console.log("================================================\n");
}

simulateCareerSeason().catch(console.error);
