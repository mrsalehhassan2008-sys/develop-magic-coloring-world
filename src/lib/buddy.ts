/**
 * Buddy companion phrase engine.
 * Every line is localized to 9 languages and may include a {name} placeholder
 * so the app talks to the child directly, by name.
 */

export type BuddyEvent =
  | "welcome"
  | "welcomeBack"
  | "greetMorning"
  | "greetAfternoon"
  | "greetEvening"
  | "idle"
  | "encourage"
  | "praise"
  | "pageDone"
  | "wrong"
  | "pickColor"
  | "letsPlay"
  | "goodbye"
  | "askName"
  | "tapHint";

type L10n = Record<string, string[]>;

const P: Record<BuddyEvent, L10n> = {
  welcome: {
    en: ["Hi {name}! I'm Pip. Let's make magic today!", "Hello {name}! Ready to color with me?"],
    ar: ["أهلاً {name}! أنا بِب. هيا نصنع السحر اليوم!", "مرحباً {name}! جاهز نلوّن سوا؟"],
    fr: ["Salut {name}! Je suis Pip. On fait de la magie?", "Bonjour {name}! Prêt à colorier avec moi?"],
    de: ["Hallo {name}! Ich bin Pip. Lass uns zaubern!", "Hi {name}! Bereit zum Malen mit mir?"],
    es: ["¡Hola {name}! Soy Pip. ¡Hagamos magia hoy!", "¡Hola {name}! ¿List@ para colorear conmigo?"],
    it: ["Ciao {name}! Sono Pip. Facciamo magia oggi!", "Ciao {name}! Pronto a colorare con me?"],
    tr: ["Merhaba {name}! Ben Pip. Hadi bugün sihir yapalım!", "Selam {name}! Benimle boyamaya hazır mısın?"],
    ru: ["Привет, {name}! Я Пип. Давай творить волшебство!", "Привет, {name}! Готов раскрашивать со мной?"],
    pt: ["Oi {name}! Eu sou o Pip. Vamos fazer mágica hoje!", "Olá {name}! Pronto para colorir comigo?"],
  },
  welcomeBack: {
    en: ["Yay, you're back {name}! I missed you!", "There you are {name}! Let's play again!"],
    ar: ["يا سلام رجعت يا {name}! وحشتني!", "أهلاً برجوعك يا {name}! هيا نلعب تاني!"],
    fr: ["Youpi, te revoilà {name}! Tu m'as manqué!", "Te voilà {name}! On rejoue?"],
    de: ["Juhu, du bist zurück {name}! Ich hab dich vermisst!", "Da bist du ja, {name}! Spielen wir wieder!"],
    es: ["¡Volviste {name}! ¡Te extrañé!", "¡Ahí estás {name}! ¡Juguemos otra vez!"],
    it: ["Evviva, sei tornato {name}! Mi sei mancato!", "Eccoti {name}! Giochiamo ancora!"],
    tr: ["Yaşasın, geri döndün {name}! Seni özledim!", "İşte buradasın {name}! Yine oynayalım!"],
    ru: ["Ура, ты вернулся, {name}! Я скучал!", "Вот и ты, {name}! Давай играть снова!"],
    pt: ["Eba, você voltou {name}! Senti sua falta!", "Aí está você {name}! Vamos brincar de novo!"],
  },
  greetMorning: {
    en: ["Good morning {name}! Sunny day for colors!"],
    ar: ["صباح الخير يا {name}! يوم مشمس للألوان!"],
    fr: ["Bonjour {name}! Belle journée pour colorier!"],
    de: ["Guten Morgen {name}! Ein sonniger Maltag!"],
    es: ["¡Buenos días {name}! ¡Día soleado para colores!"],
    it: ["Buongiorno {name}! Giornata di sole per i colori!"],
    tr: ["Günaydın {name}! Renkler için güneşli bir gün!"],
    ru: ["Доброе утро, {name}! Солнечный день для красок!"],
    pt: ["Bom dia {name}! Dia de sol para colorir!"],
  },
  greetAfternoon: {
    en: ["Good afternoon {name}! Let's color something fun!"],
    ar: ["مساء الخير يا {name}! هيا نلوّن حاجة حلوة!"],
    fr: ["Bon après-midi {name}! Colorions un truc rigolo!"],
    de: ["Guten Tag {name}! Malen wir etwas Lustiges!"],
    es: ["¡Buenas tardes {name}! ¡Coloreemos algo divertido!"],
    it: ["Buon pomeriggio {name}! Coloriamo qualcosa di bello!"],
    tr: ["İyi günler {name}! Eğlenceli bir şey boyayalım!"],
    ru: ["Добрый день, {name}! Раскрасим что-то весёлое!"],
    pt: ["Boa tarde {name}! Vamos colorir algo divertido!"],
  },
  greetEvening: {
    en: ["Good evening {name}! Cozy time to color!"],
    ar: ["مساء الخير يا {name}! وقت هادي للتلوين!"],
    fr: ["Bonsoir {name}! Moment cocooning pour colorier!"],
    de: ["Guten Abend {name}! Gemütliche Malzeit!"],
    es: ["¡Buenas noches {name}! ¡Hora tranquila de colorear!"],
    it: ["Buonasera {name}! Momento tranquillo per colorare!"],
    tr: ["İyi akşamlar {name}! Boyamak için huzurlu zaman!"],
    ru: ["Добрый вечер, {name}! Уютное время для красок!"],
    pt: ["Boa noite {name}! Hora aconchegante de colorir!"],
  },
  idle: {
    en: ["Need some help {name}?", "What shall we color, {name}?", "Pick a color {name}!"],
    ar: ["محتاج مساعدة يا {name}؟", "نلوّن إيه يا {name}؟", "اختار لون يا {name}!"],
    fr: ["Besoin d'aide {name}?", "On colorie quoi, {name}?", "Choisis une couleur {name}!"],
    de: ["Brauchst du Hilfe {name}?", "Was malen wir, {name}?", "Wähl eine Farbe {name}!"],
    es: ["¿Necesitas ayuda {name}?", "¿Qué coloreamos, {name}?", "¡Elige un color {name}!"],
    it: ["Hai bisogno di aiuto {name}?", "Cosa coloriamo, {name}?", "Scegli un colore {name}!"],
    tr: ["Yardım ister misin {name}?", "Ne boyayalım {name}?", "Bir renk seç {name}!"],
    ru: ["Нужна помощь, {name}?", "Что раскрасим, {name}?", "Выбери цвет, {name}!"],
    pt: ["Precisa de ajuda {name}?", "O que vamos colorir, {name}?", "Escolha uma cor {name}!"],
  },
  encourage: {
    en: ["You can do it {name}!", "Keep going {name}!", "Looking great {name}!"],
    ar: ["تقدر يا {name}!", "كمّل يا {name}!", "شكلها حلو يا {name}!"],
    fr: ["Tu peux le faire {name}!", "Continue {name}!", "C'est super {name}!"],
    de: ["Du schaffst das {name}!", "Weiter so {name}!", "Sieht toll aus {name}!"],
    es: ["¡Tú puedes {name}!", "¡Sigue así {name}!", "¡Se ve genial {name}!"],
    it: ["Ce la puoi fare {name}!", "Continua {name}!", "Bellissimo {name}!"],
    tr: ["Yapabilirsin {name}!", "Devam et {name}!", "Harika görünüyor {name}!"],
    ru: ["Ты справишься, {name}!", "Продолжай, {name}!", "Отлично, {name}!"],
    pt: ["Você consegue {name}!", "Continue {name}!", "Está lindo {name}!"],
  },
  praise: {
    en: ["Wow {name}, beautiful!", "Amazing job {name}!", "You're an artist {name}!"],
    ar: ["واو يا {name}، جميلة!", "شغل رائع يا {name}!", "أنت فنان يا {name}!"],
    fr: ["Waouh {name}, magnifique!", "Super travail {name}!", "Tu es un artiste {name}!"],
    de: ["Wow {name}, wunderschön!", "Tolle Arbeit {name}!", "Du bist ein Künstler {name}!"],
    es: ["¡Guau {name}, precioso!", "¡Gran trabajo {name}!", "¡Eres un artista {name}!"],
    it: ["Wow {name}, bellissimo!", "Ottimo lavoro {name}!", "Sei un artista {name}!"],
    tr: ["Vay {name}, çok güzel!", "Harika iş {name}!", "Sen bir sanatçısın {name}!"],
    ru: ["Ух ты, {name}, красиво!", "Отличная работа, {name}!", "Ты художник, {name}!"],
    pt: ["Uau {name}, lindo!", "Ótimo trabalho {name}!", "Você é um artista {name}!"],
  },
  pageDone: {
    en: ["You finished it {name}! Hooray!", "All done {name}! I'm so proud!"],
    ar: ["خلّصتها يا {name}! يييي!", "تمام يا {name}! أنا فخور بيك!"],
    fr: ["Tu as fini {name}! Hourra!", "Terminé {name}! Je suis fier!"],
    de: ["Fertig {name}! Hurra!", "Alles fertig {name}! Ich bin so stolz!"],
    es: ["¡Lo terminaste {name}! ¡Bravo!", "¡Listo {name}! ¡Estoy orgulloso!"],
    it: ["Hai finito {name}! Evviva!", "Tutto fatto {name}! Sono fiero!"],
    tr: ["Bitirdin {name}! Yaşasın!", "Tamamdır {name}! Seninle gurur duyuyorum!"],
    ru: ["Ты закончил, {name}! Ура!", "Готово, {name}! Я так горжусь!"],
    pt: ["Você terminou {name}! Viva!", "Tudo pronto {name}! Que orgulho!"],
  },
  wrong: {
    en: ["Try another spot {name}!", "Almost {name}, try again!"],
    ar: ["جرّب مكان تاني يا {name}!", "قريّب يا {name}، حاول تاني!"],
    fr: ["Essaie ailleurs {name}!", "Presque {name}, réessaie!"],
    de: ["Versuch eine andere Stelle {name}!", "Fast {name}, nochmal!"],
    es: ["¡Prueba otro lugar {name}!", "¡Casi {name}, inténtalo!"],
    it: ["Prova un altro punto {name}!", "Quasi {name}, riprova!"],
    tr: ["Başka yeri dene {name}!", "Az kaldı {name}, tekrar dene!"],
    ru: ["Попробуй другое место, {name}!", "Почти, {name}, ещё разок!"],
    pt: ["Tente outro lugar {name}!", "Quase {name}, tente de novo!"],
  },
  pickColor: {
    en: ["Which color, {name}?", "Choose your favorite color {name}!"],
    ar: ["أنهي لون يا {name}؟", "اختار لونك المفضل يا {name}!"],
    fr: ["Quelle couleur, {name}?", "Choisis ta couleur préférée {name}!"],
    de: ["Welche Farbe, {name}?", "Wähl deine Lieblingsfarbe {name}!"],
    es: ["¿Qué color, {name}?", "¡Elige tu color favorito {name}!"],
    it: ["Quale colore, {name}?", "Scegli il tuo colore preferito {name}!"],
    tr: ["Hangi renk, {name}?", "En sevdiğin rengi seç {name}!"],
    ru: ["Какой цвет, {name}?", "Выбери любимый цвет, {name}!"],
    pt: ["Qual cor, {name}?", "Escolha sua cor favorita {name}!"],
  },
  letsPlay: {
    en: ["What do you want to play, {name}?", "So many games, {name}! Pick one!"],
    ar: ["عايز تلعب إيه يا {name}؟", "ألعاب كتير يا {name}! اختار واحدة!"],
    fr: ["À quoi veux-tu jouer, {name}?", "Tant de jeux {name}! Choisis!"],
    de: ["Was möchtest du spielen, {name}?", "So viele Spiele {name}! Wähl eins!"],
    es: ["¿A qué quieres jugar, {name}?", "¡Tantos juegos {name}! ¡Elige uno!"],
    it: ["A cosa vuoi giocare, {name}?", "Tanti giochi {name}! Scegline uno!"],
    tr: ["Ne oynamak istersin, {name}?", "Çok oyun var {name}! Birini seç!"],
    ru: ["Во что поиграем, {name}?", "Столько игр, {name}! Выбирай!"],
    pt: ["No que quer brincar, {name}?", "Tantos jogos {name}! Escolha um!"],
  },
  goodbye: {
    en: ["Bye {name}! Come back soon!", "See you later {name}!"],
    ar: ["باي يا {name}! ارجع بسرعة!", "أشوفك بعدين يا {name}!"],
    fr: ["Au revoir {name}! Reviens vite!", "À bientôt {name}!"],
    de: ["Tschüss {name}! Komm bald wieder!", "Bis später {name}!"],
    es: ["¡Adiós {name}! ¡Vuelve pronto!", "¡Hasta luego {name}!"],
    it: ["Ciao {name}! Torna presto!", "A dopo {name}!"],
    tr: ["Güle güle {name}! Yakında gel!", "Görüşürüz {name}!"],
    ru: ["Пока, {name}! Возвращайся скорее!", "До встречи, {name}!"],
    pt: ["Tchau {name}! Volte logo!", "Até mais {name}!"],
  },
  askName: {
    en: ["What's your name? Ask a grown-up to type it!"],
    ar: ["ما اسمك؟ اطلب من الكبار يكتبوه!"],
    fr: ["Comment tu t'appelles? Demande à un adulte de l'écrire!"],
    de: ["Wie heißt du? Ein Erwachsener kann es eintippen!"],
    es: ["¿Cómo te llamas? ¡Pide a un adulto que lo escriba!"],
    it: ["Come ti chiami? Chiedi a un adulto di scriverlo!"],
    tr: ["Adın ne? Bir büyükten yazmasını iste!"],
    ru: ["Как тебя зовут? Попроси взрослого напечатать!"],
    pt: ["Qual seu nome? Peça a um adulto para digitar!"],
  },
  tapHint: {
    en: ["Tap me anytime {name}, I love to chat!"],
    ar: ["دوس عليّ في أي وقت يا {name}، أحب أتكلم!"],
    fr: ["Touche-moi quand tu veux {name}, j'adore papoter!"],
    de: ["Tipp mich jederzeit an {name}, ich plaudere gern!"],
    es: ["¡Tócame cuando quieras {name}, me encanta charlar!"],
    it: ["Toccami quando vuoi {name}, adoro chiacchierare!"],
    tr: ["İstediğin zaman bana dokun {name}, sohbeti severim!"],
    ru: ["Нажми на меня в любой момент, {name}, я люблю болтать!"],
    pt: ["Toque em mim quando quiser {name}, adoro conversar!"],
  },
};

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** get a buddy line, localized, with the child's name interpolated */
export function buddyLine(event: BuddyEvent, name: string, lang = "en-US"): string {
  const base = lang.split("-")[0].toLowerCase();
  const table = P[event];
  const list = table[base] ?? table.en;
  const cleanName = (name || "").trim();
  const line = pick(list);
  // if there's no name, drop the placeholder + surrounding punctuation gracefully
  if (!cleanName) {
    return line.replace(/[,،]?\s*\{name\}/g, "").replace(/\{name\}\s*[,،]?/g, "").trim();
  }
  return line.replace(/\{name\}/g, cleanName);
}

/** choose a greeting based on the local time of day */
export function timeGreeting(): BuddyEvent {
  const h = new Date().getHours();
  if (h < 12) return "greetMorning";
  if (h < 18) return "greetAfternoon";
  return "greetEvening";
}

export const BUDDY_FACES = ["🦊", "🐨", "🐵", "🐼", "🐰", "🐱", "🐸", "🦁"];
