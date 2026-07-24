const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/content/completionContent.ts');
let text = fs.readFileSync(filePath, 'utf8');

// Truncate at the end of adv-tc-04 cleanly and close the file
const idx = text.indexOf('"adv-tc-05"');
if (idx !== -1) {
  text = text.substring(0, idx);
}

// Clean closing of completionContent object
const cleanEnding = `    "adv-tc-05": {
      id: "adv-tc-05",
      title: "Identity, Culture & Belonging",
      slides: [
        "INTRO|||Identity, Culture & Belonging 🌐|||Discuss cultural roots, expat life, identity evolution, and code-switching.|||Elo: Expresse quem você é e sua experiência cultural em qualquer lugar do mundo.",
        "VOCAB|||Identity Terms 🏷️|||* **Roots** / **roots** - Cultural origin and heritage\\n* **Code-switching** / **kohd-swi-ching** - Adapting communication style\\n* **Belonging** / **be-long-ing** - Feeling accepted and at home|||Elo: 'Code-switching' é adaptar sua fala dependendo do contexto.",
        "CONCEPT|||Connected Speech: Personal Narrative 🗣️|||\\n> 🗣️ **Connected Speech Phonetics:**\\n> * *'Where I come from'* becomes **'wair-rai-kum-frum'**\\n> * *'Sense of identity'* becomes **'sen-sov-ai-den-ti-tee'**|||Elo: Narre suas origens com fluência impecável.",
        "EXAMPLE|||Intercultural Symposium 🌍|||*\\\"Where I come from, family gatherings are central to our sense of community.\\\"*\\n\\n> 🗣️ **Phonetics:**\\n> *'Sense of'* -> **'sen-sov'**.|||Elo: Compartilhamento rico e autêntico de cultura.",
        "CULTURE|||The Melting Pot & Salad Bowl 🇺🇸|||US culture celebrates both integration ('Melting Pot') and distinct heritage preservation ('Salad Bowl').|||Elo: Sua herança brasileira é vista como um diferencial valioso!",
        "DRILL|||⚡ Quick Challenge: Sharing Background|||At a global dinner, a guest asks: *\\\"How has living abroad shaped your identity?\\\"*\\n\\n> 🗣️ **Help Box (Your Response):**\\n> * *'It gave me a broader perspective while making me appreciate my roots even more.'*\\n> \\n> 🏆 **XP Multiplier:** Share with warmth!|||Elo: Compartilhe como sua trajetória te moldou!|||It gave me a broader perspective while making me appreciate my roots even more.",
        "ROLEPLAY|||🎭 Networking Event in NYC|||Fellow attendee Marcus asks about your transition from Brazil to working with US teams.\\n\\n> *\\\"How do you navigate the cultural differences between Brazil and the US?\\\"*\\n\\n> 🎭 **Challenge:** Explain using connected speech (*'wair-rai-kum-frum'*).|||Elo: Fale sobre sua bagagem cultural com orgulho!",
        "REVIEW|||Identity Unlocked 🏆|||You unlocked 4 essential skills:\\n\\n1. **Cultural Identity Vocab**\\n2. **Connected Speech**: **'sen-sov-ai-den-ti-tee'**\\n3. **Sharing Personal Narratives**\\n4. **Intercultural Code-Switching**|||Elo: Parabéns! Você sabe expressar sua identidade em nível nativo."
      ]
    },
    "adv-tc-06": {
      id: "adv-tc-06",
      title: "Navigating Ambiguity & Vagueness",
      slides: [
        "INTRO|||Navigating Ambiguity & Vagueness 🌫️|||Master hedging, diplomatic softening, and communicating when details are uncertain.|||Elo: Aprenda a lidar com incerteza e ambiguidade com elegância verbal.",
        "VOCAB|||Hedging Terms 🏷️|||* **Tentative** / **ten-tuh-tiv** - Not fixed or finalized\\n* **Ballpark figure** / **ball-park-fi-gyer** - Rough estimate\\n* **It remains to be seen** / **it-ree-maynz-tuh-bee-seen** - Uncertain outcome|||Elo: Use 'ballpark figure' para estimativas em reuniões.",
        "CONCEPT|||Connected Speech: Diplomatic Hedging 🗣️|||\\n> 🗣️ **Connected Speech Phonetics:**\\n> * *'It seems to me'* becomes **'it-seemz-tuh-mee'**\\n> * *'As far as I know'* becomes **'as-far-az-ai-noh'**|||Elo: Suavize afirmações incertas para manter o tom profissional.",
        "EXAMPLE|||Executive Briefing 📈|||*\\\"As far as I know, these numbers are tentative pending the final Q4 review.\\\"*\\n\\n> 🗣️ **Phonetics:**\\n> *'As far as'* -> **'az-far-az'**.|||Elo: Comunicação diplomática impecável quando os dados não são finais.",
        "CULTURE|||Understatement & Softening in US Corporate 🇺🇸|||Americans soft-pedal uncertain news with words like 'potentially', 'somewhat', and 'tentatively'.|||Elo: Evite absolutos quando houver incerteza.",
        "DRILL|||⚡ Quick Challenge: Giving an Estimate|||Client asks: *\\\"Can you give me the exact launch date right now?\\\"*\\n\\n> 🗣️ **Help Box (Your Response):**\\n> * *'I can give you a ballpark estimate of mid-Q3, but it's still tentative.'*\\n> \\n> 🏆 **XP Multiplier:** Deliver diplomatically!|||Elo: Forneça uma estimativa diplomática sem se comprometer!|||I can give you a ballpark estimate of mid-Q3, but it's still tentative.",
        "ROLEPLAY|||🎭 Project Update with VP|||VP Mark asks if the budget will hold for next quarter.\\n\\n> *\\\"Are you 100% sure we won't go over budget?\\\"*\\n\\n> 🎭 **Challenge:** Respond diplomatically using hedging connected speech (*'as-far-az-ai-noh'*).|||Elo: Responda ao VP com a ambiguidade profissional adequada!",
        "REVIEW|||Ambiguity Unlocked 🏆|||You unlocked 4 essential skills:\\n\\n1. **Hedging & Softening Expressions**\\n2. **Connected Speech**: **'as-far-az-ai-noh'**\\n3. **Giving Estimates Diplomatically**\\n4. **Executive Ambiguity Navigation**|||Elo: Fantástico! Você concluiu a trilha completa de curadoria da plataforma!"
      ]
    }
  }
};
`;

fs.writeFileSync(filePath, text + cleanEnding, 'utf8');
console.log('Cleaned completionContent.ts successfully!');
