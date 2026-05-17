const navLinks = document.querySelectorAll("[data-nav-link]");
const sections = document.querySelectorAll("[data-section]");
const scrollButtons = document.querySelectorAll("[data-scroll-target]");

const dailyMessageTitle = document.querySelector("#daily-message-title");
const dailyMessageCopy = document.querySelector("#daily-message-copy");
const dailyVerseText = document.querySelector("#daily-verse-text");
const dailyVerseReference = document.querySelector("#daily-verse-reference");

const inspirations = [
  {
    title: "Seu cuidado de hoje pode transformar completamente o dia de alguém.",
    copy: "Comece com leveza, priorize o que está na sua frente e confie no processo que você está construindo.",
    verse: "Entregue o seu caminho ao Senhor; confie nele, e ele agirá.",
    reference: "Salmos 37:5",
  },
  {
    title: "Pequenos passos bem feitos constroem um atendimento memorável.",
    copy: "Nem tudo precisa acontecer de uma vez. Clareza, constância e atenção aos detalhes já levam muito longe.",
    verse: "Tudo posso naquele que me fortalece.",
    reference: "Filipenses 4:13",
  },
  {
    title: "Organização também é uma forma de carinho com quem chega até você.",
    copy: "Quando o dia está bem estruturado, sobra mais energia para atender com presença e excelência.",
    verse: "Os que esperam no Senhor renovam as suas forças.",
    reference: "Isaías 40:31",
  },
  {
    title: "Seu trabalho tem valor, propósito e impacto real na vida das clientes.",
    copy: "Mantenha o foco no essencial e deixe que a consistência fortaleça cada etapa da rotina.",
    verse: "Seja forte e corajosa. Não se apavore, nem desanime.",
    reference: "Josué 1:9",
  },
  {
    title: "Um dia bem conduzido começa com paz, direção e intenção.",
    copy: "Olhe para as prioridades de hoje, siga com serenidade e resolva uma coisa de cada vez.",
    verse: "Lâmpada para os meus pés é a tua palavra e luz para o meu caminho.",
    reference: "Salmos 119:105",
  },
  {
    title: "Disciplina com leveza cria uma rotina mais bonita e sustentável.",
    copy: "Você não precisa correr para fazer bem feito. Ritmo, atenção e presença já mudam tudo.",
    verse: "O coração da mulher sábia edifica a sua casa.",
    reference: "Provérbios 14:1",
  },
  {
    title: "Hoje é um bom dia para servir com excelência e terminar com sensação de avanço.",
    copy: "Cuide do presente, mantenha a agenda organizada e deixe que o restante vá se alinhando ao longo do dia.",
    verse: "Este é o dia que o Senhor fez; regozijemo-nos e alegremo-nos nele.",
    reference: "Salmos 118:24",
  },
];

function setActiveLink(sectionId) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("is-active", isActive);
  });
}

function getDailySeed() {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  return today.getFullYear() * 1000 + dayOfYear;
}

function renderDailyInspiration() {
  const item = inspirations[getDailySeed() % inspirations.length];

  if (!item) {
    return;
  }

  dailyMessageTitle.textContent = item.title;
  dailyMessageCopy.textContent = item.copy;
  dailyVerseText.textContent = `"${item.verse}"`;
  dailyVerseReference.textContent = item.reference;
}

const observer = new IntersectionObserver(
  (entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visibleEntry) {
      setActiveLink(visibleEntry.target.id);
    }
  },
  {
    rootMargin: "-20% 0px -55% 0px",
    threshold: [0.2, 0.4, 0.6],
  }
);

sections.forEach((section) => observer.observe(section));

scrollButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.scrollTarget;
    const target = document.getElementById(targetId);

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveLink(targetId);
    }
  });
});

renderDailyInspiration();
setActiveLink("resumo");
