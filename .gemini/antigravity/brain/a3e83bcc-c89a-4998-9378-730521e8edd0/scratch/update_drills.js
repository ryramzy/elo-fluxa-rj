const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\DELL I5 DE 8º\\Soft Dev\\elo-fluxa-rj\\src\\data\\content\\new-topics.ts';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  {
    target: `"DRILL|||Personality Translation|||Translate: 'Ela é muito focada no sucesso e inteligente.'|||Elo: Try using the compound adjective 'quick-witted' and the word 'driven'."`,
    replacement: `"DRILL|||Personality Translation|||Translate: 'Ela é muito focada no sucesso e inteligente.'|||Elo: Try using the compound adjective 'quick-witted' and the word 'driven'.|||She is very driven and quick-witted"`
  },
  {
    target: `"DRILL|||Culinary Translation|||Translate: 'Este bolo de chocolate é muito cremoso e doce.'|||Elo: Use the word 'rich' to describe the heavy creaminess."`,
    replacement: `"DRILL|||Culinary Translation|||Translate: 'Este bolo de chocolate é muito cremoso e doce.'|||Elo: Use the word 'rich' to describe the heavy creaminess.|||This chocolate cake is very rich and sweet"`
  },
  {
    target: `"DRILL|||Emotional Translation|||Translate: 'Eu estava me sentindo sobrecarregado de trabalho, mas agora me sinto tranquilo.'|||Elo: Use the words 'overwhelmed' and 'serene' (or 'peaceful')."`,
    replacement: `"DRILL|||Emotional Translation|||Translate: 'Eu estava me sentindo sobrecarregado de trabalho, mas agora me sinto tranquilo.'|||Elo: Use the words 'overwhelmed' and 'serene' (or 'peaceful').|||I was feeling overwhelmed with work but now I feel serene"`
  },
  {
    target: `"DRILL|||Icebreaker Translation|||Translate: 'Nós nos demos muito bem logo no primeiro dia.'|||Elo: Use the phrasal verb 'hit it off'."`,
    replacement: `"DRILL|||Icebreaker Translation|||Translate: 'Nós nos demos muito bem logo no primeiro dia.'|||Elo: Use the phrasal verb 'hit it off'.|||We hit it off on the very first day"`
  },
  {
    target: `"DRILL|||Hosting Translation|||Translate: 'Sinta-se à vontade para pegar o que quiser comer.'|||Elo: Use the phrase 'help yourself'."`,
    replacement: `"DRILL|||Hosting Translation|||Translate: 'Sinta-se à vontade para pegar o que quiser comer.'|||Elo: Use the phrase 'help yourself'.|||Feel free to help yourself to whatever you want to eat"`
  },
  {
    target: `"DRILL|||Connection Translation|||Translate: 'Eu sei que posso contar com você para qualquer coisa.'|||Elo: Use the phrasal verb 'count on'."`,
    replacement: `"DRILL|||Connection Translation|||Translate: 'Eu sei que posso contar com você para qualquer coisa.'|||Elo: Use the phrasal verb 'count on'.|||I know I can count on you for anything"`
  },
  {
    target: `"DRILL|||Conflict Translation|||Translate: 'Nós passamos por momentos difíceis e bons juntos.'|||Elo: Use the idiom 'through thick and thin'."`,
    replacement: `"DRILL|||Conflict Translation|||Translate: 'Nós passamos por momentos difíceis e bons juntos.'|||Elo: Use the idiom 'through thick and thin'.|||We have been through thick and thin together"`
  },
  {
    target: `"DRILL|||Wilderness Translation|||Translate: 'Nós vamos montar a barraca perto da trilha.'|||Elo: Use the phrase 'pitch the tent' and the word 'trail'."`,
    replacement: `"DRILL|||Wilderness Translation|||Translate: 'Nós vamos montar a barraca perto da trilha.'|||Elo: Use the phrase 'pitch the tent' and the word 'trail'.|||We are going to pitch the tent near the trail"`
  },
  {
    target: `"DRILL|||Coastal Translation|||Translate: 'A maré está subindo e as ondas estão ficando maiores.'|||Elo: Use the words 'tide' and 'swell' or 'waves'."`,
    replacement: `"DRILL|||Coastal Translation|||Translate: 'A maré está subindo e as ondas estão ficando maiores.'|||Elo: Use the words 'tide' and 'swell' or 'waves'.|||The tide is rising and the waves are getting bigger"`
  },
  {
    target: `"DRILL|||Nature Translation|||Translate: 'A vista do topo da montanha era de tirar o fôlego.'|||Elo: Use the adjective 'breathtaking' for 'de tirar o fôlego'."`,
    replacement: `"DRILL|||Nature Translation|||Translate: 'A vista do topo da montanha era de tirar o fôlego.'|||Elo: Use the adjective 'breathtaking' for 'de tirar o fôlego'.|||The view from the top of the mountain was breathtaking"`
  },
  {
    target: `"DRILL|||Green Translation|||Translate: 'Energia solar é uma fonte de energia renovável.'|||Elo: Use the words 'solar energy' and 'renewable'."`,
    replacement: `"DRILL|||Green Translation|||Translate: 'Energia solar é uma fonte de energia renovável.'|||Elo: Use the words 'solar energy' and 'renewable'.|||Solar energy is a renewable energy source"`
  },
  {
    target: `"DRILL|||Weather Idiom Translation|||Translate: 'Eu ganhei a promoção e estou extremamente feliz!'|||Elo: Use the idiom 'on cloud nine'."`,
    replacement: `"DRILL|||Weather Idiom Translation|||Translate: 'Eu ganhei a promoção e estou extremamente feliz!'|||Elo: Use the idiom 'on cloud nine'.|||I got the promotion and I am on cloud nine"`
  },
  {
    target: `"DRILL|||Sports Idiom Translation|||Translate: 'Eu vou entrar em contato com você na segunda-feira.'|||Elo: Use the sports idiom 'touch base'."`,
    replacement: `"DRILL|||Sports Idiom Translation|||Translate: 'Eu vou entrar em contato com você na segunda-feira.'|||Elo: Use the sports idiom 'touch base'.|||I will touch base with you on Monday"`
  },
  {
    target: `"DRILL|||Everyday Idiom Translation|||Translate: 'Eu preciso aceitar essa situação difícil e fazer a cirurgia.'|||Elo: Use the idiom 'bite the bullet'."`,
    replacement: `"DRILL|||Everyday Idiom Translation|||Translate: 'Eu preciso aceitar essa situação difícil e fazer a cirurgia.'|||Elo: Use the idiom 'bite the bullet'.|||I need to bite the bullet and have the surgery"`
  },
  {
    target: `"DRILL|||Streaming Translation|||Translate: 'Eu assisti a temporada inteira de uma vez só porque cada episódio terminava com suspense.'|||Elo: Use the terms 'binge-watch' and 'cliffhanger'."`,
    replacement: `"DRILL|||Streaming Translation|||Translate: 'Eu assisti a temporada inteira de uma vez só porque cada episódio terminava com suspense.'|||Elo: Use the terms 'binge-watch' and 'cliffhanger'.|||I binge-watched the entire season because every episode ended on a cliffhanger"`
  },
  {
    target: `"DRILL|||Cinema Translation|||Translate: 'O filme teve uma reviravolta incrível no final.'|||Elo: Use the term 'plot twist'."`,
    replacement: `"DRILL|||Cinema Translation|||Translate: 'O filme teve uma reviravolta incrível no final.'|||Elo: Use the term 'plot twist'.|||The movie had an incredible plot twist at the end"`
  },
  {
    target: `"DRILL|||Review Translation|||Translate: 'Eu achei o filme muito clichê e superestimado.'|||Elo: Use the words 'cheesy' (or 'corny') and 'overrated'."`,
    replacement: `"DRILL|||Review Translation|||Translate: 'Eu achei o filme muito clichê e superestimado.'|||Elo: Use the words 'cheesy' (or 'corny') and 'overrated'.|||I thought the movie was very cheesy and overrated"`
  },
  {
    target: `"DRILL|||Business Translation|||Translate: 'O estúdio finalmente deu sinal verde para a sequência do filme.'|||Elo: Use the verb 'greenlight' in your translation."`,
    replacement: `"DRILL|||Business Translation|||Translate: 'O estúdio finalmente deu sinal verde para a sequência do filme.'|||Elo: Use the verb 'greenlight' in your translation.|||The studio finally greenlit the movie sequel"`
  },
  {
    target: `"DRILL|||Music Translation|||Translate: 'Eu gosto de músicas animadas com um ritmo forte.'|||Elo: Use the words 'upbeat' and 'beat' or 'tempo'."`,
    replacement: `"DRILL|||Music Translation|||Translate: 'Eu gosto de músicas animadas com um ritmo forte.'|||Elo: Use the words 'upbeat' and 'beat' or 'tempo'.|||I like upbeat songs with a strong beat"`
  },
  {
    target: `"DRILL|||Lyrics Translation|||Translate: 'A letra da música está cheia de metáforas.'|||Elo: Use the words 'lyrics' and 'metaphors'."`,
    replacement: `"DRILL|||Lyrics Translation|||Translate: 'A letra da música está cheia de metáforas.'|||Elo: Use the words 'lyrics' and 'metaphors'.|||The song's lyrics are full of metaphors"`
  },
  {
    target: `"DRILL|||Concert Translation|||Translate: 'Todos os ingressos para o show esgotaram rapidamente.'|||Elo: Use the phrasal verb 'sell out' (or 'sold out')."`,
    replacement: `"DRILL|||Concert Translation|||Translate: 'Todos os ingressos para o show esgotaram rapidamente.'|||Elo: Use the phrasal verb 'sell out' (or 'sold out').|||All tickets for the show sold out quickly"`
  },
  {
    target: `"DRILL|||Industry Translation|||Translate: 'A nova faixa da banda viralizou no TikTok.'|||Elo: Use the words 'track' and 'went viral' (or 'viralizou')."`,
    replacement: `"DRILL|||Industry Translation|||Translate: 'A nova faixa da banda viralizou no TikTok.'|||Elo: Use the words 'track' and 'went viral' (or 'viralizou').|||The band's new track went viral on TikTok"`
  }
];

let updatedCount = 0;
for (const rep of replacements) {
  if (content.includes(rep.target)) {
    content = content.replace(rep.target, rep.replacement);
    updatedCount++;
  } else {
    console.warn(`Target not found in file: ${rep.target}`);
  }
}

if (updatedCount === replacements.length) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully updated ${updatedCount} DRILL slides.`);
} else {
  console.error(`Only updated ${updatedCount} out of ${replacements.length} slides. Aborting write!`);
}
