<template>
  <div class="landing">

    <!-- ──────────────── NAVBAR ──────────────── -->
    <nav class="navbar" :class="{ scrolled: scrolled }">
      <div class="nav-inner">
        <div class="nav-logo">
          <img src="data:image/png;base64,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" alt="InUni" style="height:44px;width:auto;display:block;" />
        </div>
        <ul class="nav-links">
          <li><a href="#features">О сети</a></li>
          <li><a href="#modes">Как работает</a></li>
          <li><a href="#hackathons">Хакатоны</a></li>
        </ul>
        <div class="nav-actions">
          <a href="/login" class="btn-ghost">Войти</a>
          <a href="/register" class="btn-primary">Вступить</a>
        </div>
        <button class="burger" @click="menuOpen = !menuOpen">
          <span></span><span></span><span></span>
        </button>
      </div>
      <div class="mobile-menu" :class="{ open: menuOpen }">
        <a href="#features" @click="menuOpen=false">О сети</a>
        <a href="#modes" @click="menuOpen=false">Как работает</a>
        <a href="#hackathons" @click="menuOpen=false">Хакатоны</a>
        <a href="/register" class="btn-primary">Вступить в inUni</a>
      </div>
    </nav>

    <!-- ──────────────── HERO ──────────────── -->
    <section class="hero">
      <div class="hero-bg">
        <div class="grid-overlay"></div>
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="blob blob-3"></div>
      </div>
      <div class="hero-inner">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            Социальная сеть университета
          </div>
          <h1 class="hero-title">
            Твой универ.<br>
            <span class="gradient-text">Твои люди.</span><br>
            Твои проекты.
          </h1>
          <p class="hero-sub">
            inUni — это студенческая социальная сеть, где ты находишь друзей,
            единомышленников и команду для проектов. Всё в одном месте — внутри твоего университета.
          </p>
          <div class="hero-cta">
            <a href="/register" class="btn-primary btn-lg">
              Вступить в сеть
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a href="#modes" class="btn-outline btn-lg">Как это работает</a>
          </div>
          <div class="hero-stats">
            <div class="stat">
              <span class="stat-num">2 400+</span>
              <span class="stat-label">студентов</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-num">380+</span>
              <span class="stat-label">новых знакомств</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-num">120+</span>
              <span class="stat-label">команд запущено</span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="card-stack">
            <div class="profile-card card-back-2">
              <div class="pc-avatar" style="background:#2d3a6e"></div>
              <div class="pc-lines"><span></span><span style="width:60%"></span></div>
            </div>
            <div class="profile-card card-back-1">
              <div class="pc-avatar" style="background:#3a2d6e"></div>
              <div class="pc-lines"><span></span><span style="width:70%"></span></div>
            </div>
            <div class="profile-card card-main">
              <div class="pc-top">
                <div class="pc-avatar-main">
                  <div class="avatar-initials">ИА</div>
                </div>
                <div class="pc-badge-role">Frontend Dev</div>
              </div>
              <div class="pc-name">Искендер Абазов</div>
              <div class="pc-sub">Vue · React · TypeScript</div>
              <div class="pc-tags">
                <span>Fintech</span>
                <span>AI</span>
                <span>Startup</span>
              </div>
              <div class="pc-actions">
                <button class="pc-btn-skip">✕</button>
                <button class="pc-btn-like">♥</button>
              </div>
              <div class="pc-match-badge">MATCH! 🎉</div>
            </div>
          </div>
        </div><!-- hero-visual -->
      </div><!-- hero-inner -->
    </section>

    <!-- ──────────────── FEATURES ──────────────── -->
    <section id="features" class="features">
      <div class="container">
        <div class="section-label">Почему inUni</div>
        <h2 class="section-title">Не просто сеть —<br>целая жизнь в универе</h2>
        <div class="features-grid">
          <div class="feature-card" v-for="f in featuresList" :key="f.icon">
            <div class="f-icon">{{ f.icon }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ──────────────── UNIVERSITY LIFE ──────────────── -->
    <section class="unilife">
      <div class="container">
        <div class="unilife-inner">
          <div class="unilife-text">
            <div class="section-label" style="text-align:left">Студенческая жизнь</div>
            <h2 class="section-title" style="text-align:left">Универ — это<br>не только пары</h2>
            <p class="unilife-desc">
              inUni создан для того, чтобы студенческие годы стали временем настоящих
              связей. Здесь ты не просто ищешь человека «с нужными скиллами» —
              ты находишь людей, с которыми тебе по пути.
            </p>
            <div class="unilife-points">
              <div class="ulp" v-for="p in unilifePoints" :key="p.title">
                <div class="ulp-icon">{{ p.icon }}</div>
                <div>
                  <div class="ulp-title">{{ p.title }}</div>
                  <div class="ulp-desc">{{ p.desc }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="unilife-visual">
            <div class="chat-preview">
              <div class="cp-header">
                <div class="cp-dot red"></div>
                <div class="cp-dot yellow"></div>
                <div class="cp-dot green"></div>
                <span class="cp-title">Общий чат inUni 💬</span>
              </div>
              <div class="cp-messages">
                <div class="cp-msg left">
                  <div class="cp-msg-avatar" style="background:#1d3a8a">АК</div>
                  <div class="cp-msg-body">
                    <span class="cp-msg-name">Сезимай М.</span>
                    <span class="cp-msg-text">Кто знает, как настроить Windows? 🙏</span>
                  </div>
                </div>
                <div class="cp-msg right">
                  <div class="cp-msg-body right">
                    <span class="cp-msg-name" style="text-align:right">Азимбай Ж.</span>
                    <span class="cp-msg-text">Я помогу! Напиши в личку</span>
                  </div>
                  <div class="cp-msg-avatar" style="background:#e63946">ИК</div>
                </div>
                <div class="cp-msg left">
                  <div class="cp-msg-avatar" style="background:#7c3aed">ЭН</div>
                  <div class="cp-msg-body">
                    <span class="cp-msg-name">Эмирхан Н.</span>
                    <span class="cp-msg-text">Собираю команду на футбол в пятницу !</span>
                  </div>
                </div>
                <div class="cp-msg left">
                  <div class="cp-msg-avatar" style="background:#2d8a4e">АС</div>
                  <div class="cp-msg-body">
                    <span class="cp-msg-name">Искендер А.</span>
                    <span class="cp-msg-text">Я свободен в пятницу! 👋</span>
                  </div>
                </div>
                <div class="cp-typing">
                  <span></span><span></span><span></span>
                  <em>Кто-то печатает…</em>
                </div>
              </div>
              <div class="cp-input">
                <div class="cp-input-field">Написать в чат…</div>
                <button class="cp-send">→</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ──────────────── MODES ──────────────── -->
    <section id="modes" class="modes">
      <div class="container">
        <div class="section-label">Три пространства</div>
        <h2 class="section-title">Общайся, знакомься<br>и строй вместе</h2>
        <div class="modes-list">
          <div
              class="mode-item"
              v-for="(m, i) in modesList"
              :key="i"
              :class="{ active: activeMode === i }"
              @click="activeMode = i"
          >
            <div class="mode-num">0{{ i + 1 }}</div>
            <div class="mode-body">
              <div class="mode-header">
                <span class="mode-icon">{{ m.icon }}</span>
                <h3>{{ m.title }}</h3>
              </div>
              <p class="mode-desc">{{ m.desc }}</p>
              <div class="mode-chips">
                <span v-for="c in m.chips" :key="c">{{ c }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ──────────────── AI SECTION ──────────────── -->
    <section class="ai-section">
      <div class="container ai-inner">
        <div class="ai-text">
          <div class="section-label" style="color:#e63946">AI внутри inUni</div>
          <h2 class="section-title" style="text-align:left">Умный алгоритм<br>находит своих</h2>
          <p class="ai-desc">
            AI в inUni анализирует не просто теги и навыки — он понимает смысл: кто ты,
            что тебя зажигает, с кем тебе будет комфортно работать и общаться.
          </p>
          <ul class="ai-features">
            <li v-for="af in aiFeatures" :key="af">
              <span class="ai-check">✦</span>{{ af }}
            </li>
          </ul>
          <a href="#" class="btn-primary">Попробовать AI-подбор</a>
        </div>
        <div class="ai-visual">
          <div class="ai-card">
            <div class="ai-card-header">
              <div class="ai-pulse"></div>
              AI анализирует профиль…
            </div>
            <div class="ai-match-row" v-for="m in aiMatches" :key="m.name">
              <div class="aim-avatar">{{ m.initials }}</div>
              <div class="aim-info">
                <span class="aim-name">{{ m.name }}</span>
                <span class="aim-role">{{ m.role }}</span>
              </div>
              <div class="aim-score">
                <div class="score-bar">
                  <div class="score-fill" :style="{ width: m.score + '%' }"></div>
                </div>
                <span>{{ m.score }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ──────────────── HACKATHONS ──────────────── -->
    <section id="hackathons" class="hackathons">
      <div class="container">
        <div class="section-label">Хакатоны</div>
        <h2 class="section-title">Актуальные соревнования</h2>
        <div class="hack-grid">
          <div class="hack-card" v-for="h in hackathons" :key="h.name">
            <div class="hack-badge" :style="{ background: h.color }">{{ h.tag }}</div>
            <h3 class="hack-name">{{ h.name }}</h3>
            <div class="hack-meta">
              <span>📅 {{ h.date }}</span>
              <span>🏆 {{ h.prize }}</span>
            </div>
            <div class="hack-footer">
              <span class="hack-spots">{{ h.spots }} мест свободно</span>
              <button class="btn-primary btn-sm">Собрать команду</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ──────────────── ROLES ──────────────── -->
    <section class="roles-section">
      <div class="container">
        <div class="section-label">Кто здесь</div>
        <h2 class="section-title">Студенты всех<br>специальностей</h2>
        <div class="roles-marquee-wrap">
          <div class="roles-marquee">
            <span v-for="r in rolesMarquee" :key="r" class="role-pill">{{ r }}</span>
            <span v-for="r in rolesMarquee" :key="'d'+r" class="role-pill" aria-hidden="true">{{ r }}</span>
          </div>
        </div>
        <div class="roles-cta">
          <a href="#" class="btn-primary btn-lg">Найти своих в универе →</a>
        </div>
      </div>
    </section>

    <!-- ──────────────── CTA ──────────────── -->
    <section class="cta-section">
      <div class="cta-bg">
        <div class="blob blob-cta1"></div>
        <div class="blob blob-cta2"></div>
      </div>
      <div class="container cta-inner">
        <h2 class="cta-title">Твой универ ждёт тебя</h2>
        <p class="cta-sub">Зарегистрируйся, создай профиль и познакомься со своими уже сегодня</p>
        <a href="/register" class="btn-primary btn-xl">Вступить в inUni</a>
      </div>
    </section>

    <!-- ──────────────── FOOTER ──────────────── -->
    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <div class="nav-logo">
            <img src="data:image/png;base64,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" alt="InUni" style="height:44px;width:auto;display:block;" />
          </div>
          <p>Студенческая социальная сеть — знакомства, общение и проекты внутри твоего университета</p>
        </div>
        <div class="footer-links">
          <div class="fl-col">
            <span class="fl-title">Платформа</span>
            <a href="#">Поиск команды</a>
            <a href="#">Нетворкинг</a>
            <a href="#">Хакатоны</a>
            <a href="#">Чат</a>
          </div>
          <div class="fl-col">
            <span class="fl-title">Компания</span>
            <a href="#">О нас</a>
            <a href="#">Блог</a>
            <a href="#">Контакты</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2025 inUni. Все права защищены.</span>
      </div>
    </footer>

  </div>
</template>

<script>
import InUniLogo from '../components/InUniLogo.vue'

export default {
  components: { InUniLogo },
  name: 'HomePage',
  data() {
    return {
      scrolled: false,
      menuOpen: false,
      activeMode: 0,
      featuresList: [
        { icon: '🎓', title: 'Только студенты', desc: 'Закрытая сеть внутри университета — здесь только свои. Никаких чужих, только те, кто учится рядом с тобой.' },
        { icon: '💘', title: 'Знакомства по интересам', desc: 'Находи людей не по факультету, а по тому, что вас объединяет: стек, хобби, проекты, взгляды на жизнь.' },
        { icon: '🚀', title: 'Команды для проектов', desc: 'Хочешь собрать команду на хакатон или стартап — создай слот и найди людей с нужными навыками внутри универа.' },
        { icon: '💬', title: 'Живой общий чат', desc: 'Задай вопрос по коду, поделись идеей, запусти обсуждение — комьюнити всегда онлайн и готово ответить.' },
        { icon: '🤝', title: 'Матчинг без неловкости', desc: 'Свайп вправо — и если симпатия взаимна, открывается чат. Больше не нужно писать вхолодную незнакомым людям.' },
        { icon: '🏆', title: 'Хакатоны и события', desc: 'Все актуальные соревнования и мероприятия в одном месте — следи за дедлайнами и собирай команду прямо здесь.' },
      ],
      modesList: [
        {
          icon: '💘',
          title: 'Знакомства и нетворкинг',
          desc: 'Листай карточки студентов с похожими интересами и взглядами. Матч — и вам открывается личный чат. Никакой неловкости первого сообщения.',
          chips: ['Свайп', 'Матч', 'Личный чат', 'По интересам'],
        },
        {
          icon: '🚀',
          title: 'Проекты и команды',
          desc: 'Есть идея стартапа или хакатон на носу? Создай командный слот, опиши задачу и получай заявки от студентов с нужными навыками из твоего универа.',
          chips: ['Стартап', 'Хакатон', 'Pet-проект', 'Open-source'],
        },
        {
          icon: '💬',
          title: 'Общий чат универа',
          desc: 'Единое пространство для всех студентов: задавай вопросы, делись инсайтами, обсуждай идеи и просто общайся с людьми, которые тебя понимают.',
          chips: ['Вопросы', 'Инсайты', 'Идеи', 'Комьюнити'],
        },
      ],
      aiFeatures: [
        'Находит студентов с похожим мышлением и интересами',
        'Рекомендует людей с взаимодополняющими навыками',
        'AI-ассистент помогает заполнить профиль через диалог',
        'Предлагает нужные роли при создании командного слота',
      ],
      aiMatches: [
        { initials: 'ИА', name: 'Искендер Абазов', role: 'Frontend Dev', score: 94 },
        { initials: 'МЭ', name: 'Айжана Тосколбековна', role: 'UX/UI Designer', score: 87 },
        { initials: 'НД', name: 'Нурдолоот Жоодаров', role: 'ML Engineer', score: 81 },
      ],
      hackathons: [], // Загружается из API
      unilifePoints: [
        { icon: '👥', title: 'Знакомься с однокурсниками', desc: 'Не только с теми, кто сидит рядом на паре' },
        { icon: '🔥', title: 'Находи людей с твоим огнём', desc: 'По интересам, проектам и амбициям' },
        { icon: '🛠️', title: 'Стройте вместе', desc: 'Стартапы, хакатоны, pet-проекты и open-source' },
      ],
      rolesMarquee: [
        'Информатика и вычислительная техника', 'Компьютерная инженерия', 'Прикладная математика',
        'Электроника и наноэлектроника', 'Промышленное проектирование', 'Искусственный интеллект',
        'Общая медицина', 'Педиатрия', 'Экономика', 'Менеджмент', 'Международные отношения',
        'Международное право', 'Бизнес-право', 'Журналистика', 'Медиа и визуальное искусство',
        'Психология', 'Педагогика', 'Лингвистика', 'Английский язык и литература',
        'Синхронный перевод', 'Китайский язык и литература', 'Тюркология',
      ],
      teamMembers: [
        { name: 'Фронтенд', role: 'UI / компонентная архитектура', initials: 'FE', color: '#1d3a8a' },
        { name: 'Бэкенд', role: 'API / матчинг / чаты', initials: 'BE', color: '#8a1d1d' },
        { name: 'AI-специалист', role: 'Рекомендации / ассистент', initials: 'AI', color: '#1d6a8a' },
        { name: 'Project Manager', role: 'Координация / backlog', initials: 'PM', color: '#4a1d8a' },
        { name: 'DevSecOps', role: 'Инфраструктура / CI/CD / безопасность', initials: 'DO', color: '#1d8a4e' },
      ],
    };
  },
  async mounted() {
    window.addEventListener('scroll', this.onScroll);
    await this.loadHackathons();
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  },
  methods: {
    onScroll() {
      this.scrolled = window.scrollY > 40;
    },
    async loadHackathons() {
      try {
        const { getHackathons } = await import('../api/admin.js')
        const apiHackathons = await getHackathons()
        // Преобразуем API данные в формат для отображения
        this.hackathons = apiHackathons
          .filter(h => h.status === 'upcoming' || h.status === 'active')
          .map(h => ({
            name: h.title,
            date: this.formatDate(h.start_date, h.end_date),
            prize: 'Призы от организаторов',
            spots: h.max_teams,
            tag: this.getTagFromTitle(h.title),
            color: this.getColorFromTag(this.getTagFromTitle(h.title))
          }))
      } catch (e) {
        console.error('Failed to load hackathons:', e)
        // Fallback to empty array
        this.hackathons = []
      }
    },
    formatDate(start, end) {
      if (!start || !end) return 'Дата уточняется'
      const s = new Date(start).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
      const e = new Date(end).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
      return `${s} — ${e}`
    },
    getTagFromTitle(title) {
      const lower = title.toLowerCase()
      if (lower.includes('ai') || lower.includes('машин')) return 'AI'
      if (lower.includes('fin') || lower.includes('фин')) return 'Fintech'
      if (lower.includes('green') || lower.includes('эко')) return 'Green'
      if (lower.includes('health') || lower.includes('мед')) return 'Health'
      if (lower.includes('edu') || lower.includes('образ')) return 'EdTech'
      return 'Tech'
    },
    getColorFromTag(tag) {
      const colors = {
        'AI': '#e63946',
        'Fintech': '#1d6fa4',
        'Green': '#2d8a4e',
        'Health': '#dc2626',
        'EdTech': '#7c3aed',
        'Tech': '#4b5563'
      }
      return colors[tag] || '#4b5563'
    }
  },
};
</script>

<style scoped>
/* ── IMPORTS ── */
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;900&family=Onest:wght@300;400;500;600&display=swap');

/* ── RESET & BASE ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.landing {
  --c-bg:      #080c1a;
  --c-surface: #0f1629;
  --c-card:    #131a30;
  --c-border:  rgba(255,255,255,0.07);
  --c-red:     #e63946;
  --c-red-dim: rgba(230,57,70,0.15);
  --c-blue:    #1d4ed8;
  --c-accent:  #3b82f6;
  --c-text:    #e8eaf2;
  --c-muted:   #7a80a0;
  --c-white:   #ffffff;
  --r:         14px;
  --r-sm:      8px;

  font-family: 'Onest', sans-serif;
  background: var(--c-bg);
  color: var(--c-text);
  overflow-x: hidden;
}

/* ── TYPOGRAPHY ── */
.section-label {
  font-family: 'Unbounded', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-red);
  margin-bottom: 12px;
  text-align: center;
}
.section-title {
  font-family: 'Unbounded', sans-serif;
  font-size: clamp(28px, 4vw, 46px);
  font-weight: 700;
  line-height: 1.15;
  text-align: center;
  color: var(--c-white);
  margin-bottom: 48px;
}
.gradient-text {
  background: linear-gradient(135deg, #e63946 0%, #f87171 50%, #fb923c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── CONTAINER ── */
.container {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── BUTTONS ── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--c-red);
  color: #fff;
  font-family: 'Onest', sans-serif;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 22px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-primary:hover { background: #c62d39; transform: translateY(-1px); }
.btn-primary.btn-lg { font-size: 15px; padding: 13px 28px; }
.btn-primary.btn-xl { font-size: 17px; padding: 16px 36px; border-radius: 10px; }
.btn-primary.btn-sm { font-size: 12px; padding: 7px 14px; }

.btn-ghost {
  display: inline-flex;
  align-items: center;
  color: var(--c-text);
  font-family: 'Onest', sans-serif;
  font-weight: 500;
  font-size: 14px;
  padding: 10px 18px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
  border: 1px solid transparent;
}
.btn-ghost:hover { background: var(--c-border); border-color: var(--c-border); }

.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--c-text);
  font-family: 'Onest', sans-serif;
  font-weight: 600;
  font-size: 15px;
  padding: 13px 28px;
  border-radius: 8px;
  border: 1.5px solid rgba(255,255,255,0.2);
  text-decoration: none;
  background: transparent;
  transition: all 0.2s;
}
.btn-outline:hover { border-color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.04); }

/* ── NAVBAR ── */
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  transition: background 0.3s, backdrop-filter 0.3s, border-color 0.3s;
  border-bottom: 1px solid transparent;
}
.navbar.scrolled {
  background: rgba(8,12,26,0.9);
  backdrop-filter: blur(16px);
  border-bottom-color: var(--c-border);
}
.nav-inner {
  width: 100%;
  padding: 0 32px;
  height: 68px;
  display: flex;
  align-items: center;
  gap: 0;
}

.nav-logo {
  margin-right: auto;
}
.nav-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
  margin-right: auto;
}
.logo-icon {
  width: 34px; height: 34px;
  background: var(--c-red);
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-family: 'Unbounded', sans-serif;
  font-size: 11px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.5px;
}
.logo-text {
  font-family: 'Unbounded', sans-serif;
  font-size: 18px;
  font-weight: 400;
  color: var(--c-white);
}
.logo-img {
  height: 44px;
  width: auto;
  display: block;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 4px;
  margin-right: 16px;
}
.nav-links a {
  color: var(--c-muted);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
}
.nav-links a:hover { color: var(--c-white); background: rgba(255,255,255,0.06); }
.nav-actions { display: flex; align-items: center; gap: 8px; }
.burger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; }
.burger span { display: block; width: 22px; height: 2px; background: var(--c-text); border-radius: 2px; transition: 0.3s; }
.mobile-menu { display: none; }

/* ── HERO ── */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 120px 24px 80px;
}
.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 1160px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 60px;
}
.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.25;
}
.blob-1 { width: 500px; height: 500px; background: #e63946; top: -100px; right: -100px; animation: blobFloat 8s ease-in-out infinite; }
.blob-2 { width: 400px; height: 400px; background: #1d4ed8; bottom: 0; left: -100px; animation: blobFloat 11s ease-in-out infinite reverse; }
.blob-3 { width: 300px; height: 300px; background: #7c3aed; top: 40%; right: 30%; animation: blobFloat 9s ease-in-out infinite 2s; }
@keyframes blobFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -30px) scale(1.08); }
}
.hero-content {
  max-width: 560px;
  flex-shrink: 0;
  flex: 1;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(230,57,70,0.12);
  border: 1px solid rgba(230,57,70,0.3);
  color: #f87171;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 100px;
  margin-bottom: 24px;
}
.badge-dot { width: 6px; height: 6px; background: var(--c-red); border-radius: 50%; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
.hero-title {
  font-family: 'Unbounded', sans-serif;
  font-size: clamp(36px, 5.5vw, 62px);
  font-weight: 800;
  line-height: 1.1;
  color: var(--c-white);
  margin-bottom: 20px;
  letter-spacing: -1px;
}
.hero-sub {
  font-size: 17px;
  line-height: 1.65;
  color: var(--c-muted);
  margin-bottom: 36px;
  max-width: 480px;
}
.hero-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 48px;
}
.hero-stats {
  display: flex;
  align-items: center;
  gap: 24px;
}
.stat { display: flex; flex-direction: column; gap: 2px; }
.stat-num { font-family: 'Unbounded', sans-serif; font-size: 22px; font-weight: 700; color: var(--c-white); }
.stat-label { font-size: 12px; color: var(--c-muted); }
.stat-divider { width: 1px; height: 36px; background: var(--c-border); }

/* Hero visual */
.hero-visual {
  position: relative;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
.card-stack {
  position: relative;
  width: 400px;
  height: 500px;
}
.profile-card {
  position: absolute;
  width: 370px;
  border-radius: 24px;
  padding: 32px;
  background: var(--c-card);
  border: 1px solid var(--c-border);
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
.card-back-2 { top: 36px; left: 36px; transform: rotate(6deg); opacity: 0.4; }
.card-back-1 { top: 18px; left: 18px; transform: rotate(3deg); opacity: 0.6; }
.card-main {
  top: 0; left: 0;
  background: var(--c-surface);
  border-color: rgba(255,255,255,0.12);
  z-index: 3;
  animation: cardFloat 4s ease-in-out infinite;
}
@keyframes cardFloat {
  0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)}
}
.pc-avatar { width: 70px; height: 70px; border-radius: 16px; }
.pc-lines { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
.pc-lines span { display: block; height: 12px; background: rgba(255,255,255,0.08); border-radius: 4px; }
.pc-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.pc-avatar-main {
  width: 80px; height: 80px;
  background: linear-gradient(135deg, #e63946, #1d4ed8);
  border-radius: 20px;
  display: grid; place-items: center;
}
.avatar-initials { font-family:'Unbounded',sans-serif; font-size:20px; font-weight:700; color:#fff; }
.pc-badge-role {
  background: var(--c-red-dim);
  color: var(--c-red);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 100px;
  border: 1px solid rgba(230,57,70,0.3);
}
.pc-name { font-family:'Unbounded',sans-serif; font-size:22px; font-weight:700; color:#fff; margin-bottom:6px; }
.pc-sub { font-size:14px; color:var(--c-muted); margin-bottom:20px; }
.pc-tags { display:flex; gap:8px; margin-bottom:28px; flex-wrap:wrap; }
.pc-tags span {
  font-size:13px; padding:5px 14px; border-radius:100px;
  background:rgba(59,130,246,0.1); color:#93c5fd; border:1px solid rgba(59,130,246,0.2);
}
.pc-actions { display:flex; justify-content:center; gap:24px; }
.pc-btn-skip, .pc-btn-like {
  width:64px; height:64px; border-radius:50%; border:none; cursor:pointer;
  font-size:22px; display:grid; place-items:center; transition:transform 0.2s;
}
.pc-btn-skip { background:rgba(255,255,255,0.06); color:#9ca3af; }
.pc-btn-like { background:linear-gradient(135deg,#e63946,#f97316); color:#fff; }
.pc-btn-skip:hover,.pc-btn-like:hover { transform:scale(1.1); }
.pc-match-badge {
  position:absolute; top:-16px; right:16px;
  background:linear-gradient(135deg,#e63946,#f97316);
  color:#fff; font-size:13px; font-weight:700; padding:6px 18px; border-radius:100px;
  font-family:'Unbounded',sans-serif; letter-spacing:0.05em;
  animation: matchPop 1.5s ease-in-out infinite;
}
@keyframes matchPop {
  0%,100%{transform:scale(1)} 50%{transform:scale(1.08)}
}

/* ── FEATURES ── */
.features { padding: 100px 0; }
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
.feature-card {
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: var(--r);
  padding: 28px;
  transition: border-color 0.2s, transform 0.2s;
}
.feature-card:hover { border-color: rgba(230,57,70,0.4); transform: translateY(-4px); }
.f-icon { font-size: 32px; margin-bottom: 14px; }
.feature-card h3 { font-family:'Unbounded',sans-serif; font-size:15px; font-weight:700; color:var(--c-white); margin-bottom:10px; }
.feature-card p { font-size:14px; line-height:1.6; color:var(--c-muted); }

/* ── MODES ── */
.modes { padding: 100px 0; background: var(--c-surface); }
.modes-list { display: flex; flex-direction: column; gap: 12px; }
.mode-item {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  padding: 24px 28px;
  border-radius: var(--r);
  border: 1.5px solid var(--c-border);
  background: transparent;
  cursor: pointer;
  transition: all 0.25s;
}
.mode-item:hover { border-color: rgba(230,57,70,0.3); background: rgba(230,57,70,0.03); }
.mode-item.active { border-color: var(--c-red); background: rgba(230,57,70,0.06); }
.mode-num {
  font-family: 'Unbounded', sans-serif;
  font-size: 36px;
  font-weight: 900;
  color: var(--c-border);
  line-height: 1;
  flex-shrink: 0;
  width: 60px;
  transition: color 0.25s;
}
.mode-item.active .mode-num { color: var(--c-red); }
.mode-body { flex: 1; }
.mode-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.mode-icon { font-size: 22px; }
.mode-body h3 { font-family:'Unbounded',sans-serif; font-size:18px; font-weight:700; color:var(--c-white); }
.mode-desc { font-size:14px; line-height:1.65; color:var(--c-muted); margin-bottom:14px; max-height: 0; overflow:hidden; transition: max-height 0.3s; }
.mode-item.active .mode-desc { max-height: 100px; }
.mode-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.mode-chips span {
  font-size: 11px; padding: 4px 12px; border-radius: 100px;
  background: rgba(255,255,255,0.06); color: var(--c-muted);
  border: 1px solid var(--c-border);
}
.mode-item.active .mode-chips span { background: rgba(230,57,70,0.1); color: #f87171; border-color: rgba(230,57,70,0.2); }

/* ── AI SECTION ── */
.ai-section { padding: 100px 0; }
.ai-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.ai-text .section-title { margin-bottom: 20px; }
.ai-desc { font-size: 15px; line-height: 1.65; color: var(--c-muted); margin-bottom: 24px; }
.ai-features { list-style: none; margin-bottom: 32px; display: flex; flex-direction: column; gap: 12px; }
.ai-features li { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: var(--c-text); }
.ai-check { color: var(--c-red); font-size: 12px; margin-top: 2px; flex-shrink: 0; }

.ai-card {
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: var(--r);
  padding: 24px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.4);
}
.ai-card-header {
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; color: var(--c-muted); margin-bottom: 20px;
  font-weight: 500;
}
.ai-pulse {
  width: 10px; height: 10px; border-radius: 50%;
  background: #34d399;
  animation: pulse 2s infinite;
}
.ai-match-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--c-border);
}
.ai-match-row:last-child { border-bottom: none; }
.aim-avatar {
  width: 40px; height: 40px; border-radius: 10px;
  background: linear-gradient(135deg, #e63946, #1d4ed8);
  display: grid; place-items: center;
  font-family:'Unbounded',sans-serif; font-size:11px; font-weight:700; color:#fff;
  flex-shrink: 0;
}
.aim-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.aim-name { font-size: 13px; font-weight: 600; color: var(--c-white); }
.aim-role { font-size: 11px; color: var(--c-muted); }
.aim-score { display: flex; align-items: center; gap: 8px; }
.score-bar { width: 70px; height: 4px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; }
.score-fill { height: 100%; background: linear-gradient(90deg, #e63946, #f97316); border-radius: 4px; transition: width 0.6s ease; }
.aim-score span { font-size: 12px; font-weight: 600; color: var(--c-red); width: 32px; text-align: right; }

/* ── HACKATHONS ── */
.hackathons { padding: 100px 0; background: var(--c-surface); }
.hack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}
.hack-card {
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: var(--r);
  padding: 24px;
  position: relative;
  transition: transform 0.2s, border-color 0.2s;
}
.hack-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.15); }
.hack-badge {
  display: inline-block;
  font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
  color: #fff; padding: 3px 10px; border-radius: 4px; margin-bottom: 14px;
  font-family: 'Unbounded', sans-serif;
}
.hack-name { font-family:'Unbounded',sans-serif; font-size:15px; font-weight:700; color:var(--c-white); margin-bottom:12px; }
.hack-meta { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
.hack-meta span { font-size: 13px; color: var(--c-muted); }
.hack-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.hack-spots { font-size: 12px; color: #34d399; font-weight: 500; }

/* ── ROLES MARQUEE ── */
.roles-section { padding: 80px 0; overflow: hidden; }
.roles-section .section-title { margin-bottom: 32px; }
.roles-marquee-wrap { overflow: hidden; margin-bottom: 40px; }
.roles-marquee {
  display: flex;
  gap: 12px;
  animation: marquee 25s linear infinite;
  width: max-content;
}
.role-pill {
  flex-shrink: 0;
  font-size: 13px; font-weight: 500;
  padding: 10px 20px;
  border-radius: 100px;
  border: 1px solid var(--c-border);
  background: var(--c-card);
  color: var(--c-muted);
  white-space: nowrap;
}
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.roles-cta { text-align: center; }

/* ── TEAM ── */
.team-section { padding: 100px 0; background: var(--c-surface); }
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}
.team-card {
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: var(--r);
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: border-color 0.2s;
}
.team-card:hover { border-color: rgba(230,57,70,0.3); }
.team-avatar {
  width: 46px; height: 46px; border-radius: 12px;
  display: grid; place-items: center;
  flex-shrink: 0;
}
.team-avatar span { font-family:'Unbounded',sans-serif; font-size:12px; font-weight:700; color:#fff; }
.team-info { display: flex; flex-direction: column; gap: 3px; }
.team-name { font-family:'Unbounded',sans-serif; font-size:13px; font-weight:700; color:var(--c-white); }
.team-role { font-size:11px; line-height:1.4; color:var(--c-muted); }

/* ── CTA ── */
.cta-section { padding: 120px 0; position: relative; overflow: hidden; text-align: center; }
.cta-bg { position: absolute; inset: 0; pointer-events: none; }
.blob-cta1 { position:absolute; width:500px;height:500px;background:#e63946;top:-200px;left:-100px;filter:blur(100px);opacity:0.12;border-radius:50%; }
.blob-cta2 { position:absolute; width:400px;height:400px;background:#1d4ed8;bottom:-200px;right:-100px;filter:blur(100px);opacity:0.12;border-radius:50%; }
.cta-inner { position: relative; z-index: 1; }
.cta-title { font-family:'Unbounded',sans-serif; font-size:clamp(28px,5vw,52px); font-weight:800; color:var(--c-white); margin-bottom:16px; }
.cta-sub { font-size:17px; color:var(--c-muted); margin-bottom:36px; }

/* ── FOOTER ── */
.footer { background: var(--c-surface); border-top: 1px solid var(--c-border); padding: 60px 0 0; }
.footer-inner { display: flex; justify-content: space-between; gap: 48px; flex-wrap: wrap; padding-bottom: 48px; }
.footer-brand { max-width: 260px; }
.footer-brand .nav-logo { margin-bottom: 12px; }
.footer-brand p { font-size: 13px; line-height: 1.6; color: var(--c-muted); }
.footer-links { display: flex; gap: 48px; }
.fl-col { display: flex; flex-direction: column; gap: 10px; }
.fl-title { font-family:'Unbounded',sans-serif; font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--c-muted); margin-bottom:4px; }
.fl-col a { font-size:14px; color:var(--c-muted); text-decoration:none; transition:color 0.2s; }
.fl-col a:hover { color:var(--c-white); }
.footer-bottom {
  border-top: 1px solid var(--c-border);
  padding: 20px 24px;
  max-width: 1160px; margin: 0 auto;
  font-size: 13px; color: var(--c-muted);
}

/* ── UNIVERSITY LIFE ── */
.unilife { padding: 100px 0; background: var(--c-surface); }
.unilife-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.unilife-desc { font-size: 15px; line-height: 1.7; color: var(--c-muted); margin-bottom: 32px; }
.unilife-points { display: flex; flex-direction: column; gap: 20px; }
.ulp { display: flex; gap: 14px; align-items: flex-start; }
.ulp-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
.ulp-title { font-family:'Unbounded',sans-serif; font-size:13px; font-weight:700; color:var(--c-white); margin-bottom:3px; }
.ulp-desc { font-size:13px; color:var(--c-muted); }

/* Chat Preview */
.chat-preview {
  background: var(--c-card);
  border: 1px solid var(--c-border);
  border-radius: var(--r);
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0,0,0,0.4);
}
.cp-header {
  display: flex; align-items: center; gap: 6px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--c-border);
  background: rgba(255,255,255,0.02);
}
.cp-dot { width: 10px; height: 10px; border-radius: 50%; }
.cp-dot.red { background: #e63946; }
.cp-dot.yellow { background: #f59e0b; }
.cp-dot.green { background: #34d399; }
.cp-title { font-size: 13px; font-weight: 600; color: var(--c-muted); margin-left: 8px; }
.cp-messages { padding: 16px; display: flex; flex-direction: column; gap: 12px; min-height: 220px; }
.cp-msg { display: flex; align-items: flex-end; gap: 8px; }
.cp-msg.right { flex-direction: row-reverse; }
.cp-msg-avatar {
  width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
  display: grid; place-items: center;
  font-family:'Unbounded',sans-serif; font-size:9px; font-weight:700; color:#fff;
}
.cp-msg-body { display: flex; flex-direction: column; gap: 3px; max-width: 75%; }
.cp-msg-body.right { align-items: flex-end; }
.cp-msg-name { font-size: 10px; color: var(--c-muted); font-weight: 600; }
.cp-msg-text {
  font-size: 13px; color: var(--c-text); line-height: 1.45;
  background: rgba(255,255,255,0.05); padding: 8px 12px;
  border-radius: 10px; border: 1px solid var(--c-border);
}
.cp-msg.right .cp-msg-text {
  background: rgba(230,57,70,0.12); border-color: rgba(230,57,70,0.2);
}
.cp-typing {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; color: var(--c-muted); padding-left: 40px;
}
.cp-typing span {
  width: 5px; height: 5px; border-radius: 50%; background: var(--c-muted);
  animation: typingBounce 1.2s ease-in-out infinite;
}
.cp-typing span:nth-child(2) { animation-delay: 0.2s; }
.cp-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typingBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
.cp-typing em { font-style:normal; margin-left:4px; }
.cp-input {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--c-border);
}
.cp-input-field {
  flex: 1; font-size: 13px; color: rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--c-border);
  border-radius: 8px; padding: 8px 12px;
}
.cp-send {
  width: 34px; height: 34px; border-radius: 8px;
  background: var(--c-red); color: #fff; border: none;
  cursor: pointer; font-size: 15px; font-weight: 700;
}

/* ── RESPONSIVE ── */
@media (max-width: 1100px) {
  .hero { padding: 100px 24px 60px; }
  .hero-inner { gap: 40px; }
  .hero-content { max-width: 100%; }
  .ai-inner { grid-template-columns: 1fr; }
  .unilife-inner { grid-template-columns: 1fr; }
}

@media (max-width: 900px) {
  .hero-inner { flex-direction: column; text-align: center; }
  .hero-content { max-width: 100%; display: flex; flex-direction: column; align-items: center; }
  .hero-sub { margin: 0 auto 36px; max-width: 480px; }
  .hero-cta { justify-content: center; }
  .hero-stats { justify-content: center; }
  .hero-visual { margin-top: 24px; width: 100%; }
  .unilife-inner { grid-template-columns: 1fr; }
  .unilife-text .section-title { text-align: center; }
  .unilife-text .section-label { text-align: center; }
  .unilife-text { display: flex; flex-direction: column; align-items: center; text-align: center; }
  .ulp { text-align: left; }
  .ai-text .section-title { text-align: center; }
  .ai-text .section-label { text-align: center; }
  .ai-features { align-items: flex-start; }
  .ai-text { display: flex; flex-direction: column; align-items: center; text-align: center; }
}

@media (max-width: 768px) {
  .nav-links, .nav-actions { display: none; }
  .burger { display: flex; }
  .mobile-menu {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px 24px;
    background: rgba(8,12,26,0.98);
    backdrop-filter: blur(16px);
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s, padding 0.3s;
  }
  .mobile-menu.open { max-height: 400px; padding: 16px 24px; }
  .mobile-menu a {
    color: var(--c-text); text-decoration: none; font-size: 15px;
    padding: 10px 4px; border-bottom: 1px solid var(--c-border);
  }
  .mobile-menu .btn-primary { margin-top: 8px; text-align: center; justify-content: center; }
  .footer-inner { flex-direction: column; }
  .footer-links { flex-direction: column; gap: 24px; }
  .mode-item { flex-direction: column; }
  .mode-num { font-size: 24px; width: auto; }
}

@media (max-width: 600px) {
  .hero-title { font-size: 28px; }
  .section-title { font-size: 22px; }
  .hero-stats { flex-direction: column; gap: 12px; }
  .stat-divider { display: none; }
  .features-grid { grid-template-columns: 1fr; }
  .hack-grid { grid-template-columns: 1fr; }
  .team-grid { grid-template-columns: 1fr 1fr; }
  .container { padding: 0 16px; }
  .hero { padding: 90px 16px 48px; }
  .card-stack { width: 320px; height: 420px; }
  .profile-card { width: 290px; }
}
</style>