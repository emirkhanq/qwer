<template>
  <AppShell>

    <!-- ──────────────── MAIN ──────────────── -->
    <div class="page-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
      <div class="grid-overlay"></div>
    </div>

    <!-- MATCH POPUP -->
    <transition name="match-pop">
      <div v-if="showMatch" class="match-overlay" @click="dismissMatch">
        <div class="match-modal" @click.stop>
          <div class="match-bg-blob"></div>
          <div class="match-emoji">🎉</div>
          <div class="match-title">Это мэтч!</div>
          <div class="match-sub">Вы и <strong>{{ matchedUser }}</strong> понравились друг другу</div>
          <div class="match-avatars">
            <div class="ma ma-you" :style="myAvatarStyle">
              <img v-if="myProfilePhoto" :src="myProfilePhoto" alt="" class="ma-img" />
              <span v-else>{{ myInitials }}</span>
            </div>
            <div class="ma-heart">❤️</div>
            <div class="ma ma-them">{{ cards[0]?.initials }}</div>
          </div>
          <div class="match-actions">
            <button class="btn-primary btn-lg" @click="openMatchChat()">Написать сообщение</button>
            <button class="btn-outline" @click="dismissMatch">Продолжить</button>
          </div>
        </div>
      </div>
    </transition>

    <div class="page-inner">
      <div class="swipe-layout">

        <!-- LEFT: card deck -->
        <div class="swipe-area">
          <div class="swipe-header">
            <div>
              <div class="page-label">Нетворкинг</div>
              <h1 class="page-title">Знакомства</h1>
            </div>
            <div class="swipe-counter">
              <span class="counter-num">{{ cards.length }}</span>
              <span class="counter-label">в очереди</span>
            </div>
          </div>

          <!-- Card Stack -->
          <div class="card-stack" v-if="cards.length > 0">
            <!-- back cards -->
            <div class="swipe-card swipe-card--back2" v-if="cards[2]">
              <div class="sc-avatar">{{ cards[2].initials }}</div>
            </div>
            <div class="swipe-card swipe-card--back1" v-if="cards[1]">
              <div class="sc-avatar">{{ cards[1].initials }}</div>
            </div>

            <!-- main card -->
            <div
                class="swipe-card swipe-card--main"
                :class="{ 'swiping-left': swipeDir === 'left', 'swiping-right': swipeDir === 'right' }"
                :style="dragStyle"
                @mousedown="startDrag"
                @touchstart="startDragTouch"
            >
              <!-- like/skip overlay -->
              <div class="swipe-hint like" :class="{ show: dragX > 40 }">ЛАЙК ❤️</div>
              <div class="swipe-hint skip" :class="{ show: dragX < -40 }">ПРОПУСК 👋</div>

              <div class="sc-hero">
                <div class="sc-photo-ring">
                  <div
                      class="sc-photo-circle"
                      :class="{ 'sc-photo-circle--fallback': !cardPhoto(currentCard) }"
                      :style="cardPhotoStyle(currentCard)"
                  >
                    <span v-if="!cardPhoto(currentCard)" class="sc-photo-initials">{{ currentCard.initials }}</span>
                  </div>
                </div>
                <div class="sc-top sc-top--below">
                  <div class="sc-identity">
                    <h2 class="sc-name">{{ currentCard.name }}</h2>
                    <div class="sc-role-badge">{{ currentCard.role }}</div>
                  </div>
                  <div class="sc-score">
                    <span class="score-num">{{ currentCard.score }}%</span>
                    <span class="score-label">совпадение</span>
                  </div>
                </div>
              </div>

              <div class="sc-content">
                <div class="sc-bio-block">
                  <p class="sc-bio">{{ currentCard.bio }}</p>
                  <div class="sc-meta">
                    <span class="sc-meta-item">Хакатоны: {{ currentCard.hackathons }}</span>
                    <span class="sc-meta-item">Проекты: {{ currentCard.projects }}</span>
                    <span class="sc-meta-item">Уровень: {{ currentCard.level }}</span>
                  </div>
                </div>

                <div class="sc-interests-panel">
                  <div class="interests-title">Интересы и стек</div>
                  <div class="sc-interests">
                    <span v-for="i in currentCard.interests" :key="i" class="sc-interest">{{ i }}</span>
                  </div>
                  <div class="sc-tags">
                    <span v-for="t in currentCard.stack" :key="t" class="sc-tag">{{ t }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div class="empty-state" v-else>
            <div class="empty-icon"><AppIcon name="sparkles" :size="26" /></div>
            <div class="empty-title">Все просмотрены!</div>
            <div class="empty-sub">Возвращайся завтра — каждый день новые участники</div>
            <button class="btn-primary" @click="resetCards">Начать заново</button>
          </div>

          <!-- Action buttons -->
          <div class="swipe-btns" v-if="cards.length > 0">
            <button class="swipe-btn swipe-btn--skip" @click="skip" title="Пропустить">
              <AppIcon name="x" :size="18" />
            </button>
            <button class="swipe-btn swipe-btn--super" @click="super_like" title="Супер-лайк">
              <AppIcon name="star" :size="18" />
            </button>
            <button class="swipe-btn swipe-btn--like" @click="like" title="Лайк">
              <AppIcon name="heart" :size="18" />
            </button>
          </div>

          <!-- Hint -->
          <div class="drag-hint">← свайп для пропуска · свайп для лайка →</div>
        </div>

        <!-- RIGHT: info panel -->
        <div class="info-panel">

          <!-- Filters -->
          <div class="panel-section">
            <div class="panel-title">Фильтры</div>
            <div class="filter-group">
              <div class="filter-label">Роль</div>
              <div class="filter-chips">
                  <span
                      v-for="r in roleFilters"
                      :key="r"
                      class="filter-chip"
                      :class="{ active: activeRoles.includes(r) }"
                      @click="toggleRole(r)"
                  >{{ r }}</span>
              </div>
            </div>
            <div class="filter-group">
              <div class="filter-label">Интересы</div>
              <div class="filter-chips">
                  <span
                      v-for="i in interestFilters"
                      :key="i"
                      class="filter-chip"
                      :class="{ active: activeInterests.includes(i) }"
                      @click="toggleInterest(i)"
                  >{{ i }}</span>
              </div>
            </div>
          </div>

          <!-- Matches -->
          <div class="panel-section">
            <div class="panel-title">Мэтчи <span class="match-count">{{ matches.length }}</span></div>
            <div class="matches-list">
              <div v-for="m in matches" :key="m.name" class="match-item">
                <div class="match-avatar" :style="{ background: m.color }">{{ m.initials }}</div>
                <div class="match-info">
                  <div class="match-name">{{ m.name }}</div>
                  <div class="match-role">{{ m.role }}</div>
                </div>
                <button class="match-msg-btn" title="Написать сообщение" @click="openMatchChat(m)">
                  <AppIcon name="chat" :size="14" />
                </button>
              </div>
              <div v-if="matches.length === 0" class="no-matches">
                Свайпай вправо — мэтчи появятся здесь
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="panel-section stats-section">
            <div class="panel-title">Твоя активность</div>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-num">{{ totalLikes }}</div>
                <div class="stat-label">лайков</div>
              </div>
              <div class="stat-box">
                <div class="stat-num">{{ matches.length }}</div>
                <div class="stat-label">мэтчей</div>
              </div>
              <div class="stat-box">
                <div class="stat-num">{{ totalSkips }}</div>
                <div class="stat-label">пропусков</div>
              </div>
            </div>
          </div>

          <div class="panel-section">
            <div class="panel-title">Твой профиль в знакомствах</div>
            <div class="profile-readiness">
              <div class="readiness-line">
                <span>Фото профиля</span>
                <strong>{{ userHasProfilePhoto ? "Да" : "Нет" }}</strong>
              </div>
              <div class="readiness-line">
                <span>Интересов</span>
                <strong>{{ currentUserProfile.interests.length }}</strong>
              </div>
              <div class="readiness-note">Загрузи фото в профиле — оно будет видно в знакомствах. Добавь минимум 3 навыка.</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </AppShell>
</template>

<script>
import AppIcon from '../components/AppIcon.vue'
import AppShell from '../components/AppShell.vue'
import { createInitials, loadAppState } from '../lib/appState'

const ALL_CARDS = [
  { initials:'ИА', name:'Искендер Абазов', role:'Backend Dev', score:94, bio:'Строю масштабируемые API и люблю, когда система работает как часы. Ищу команду для стартапа в fintech.', stack:['Python','FastAPI','PostgreSQL','Redis'], interests:['Fintech','B2B','SaaS'], hackathons:5, projects:8, level:'Middle', color:'linear-gradient(135deg,#e63946,#1d4ed8)', photos:['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80'], activePhoto:0 },
  { initials:'АМ', name:'Айгерим Матова', role:'UI/UX Designer', score:91, bio:'Проектирую продукты, которые меняют поведение людей. Обожаю превращать хаотичные идеи в понятные флоу.', stack:['Figma','FigJam','Principle','Lottie'], interests:['EdTech','Healthtech','Consumer'], hackathons:3, projects:12, level:'Senior', color:'linear-gradient(135deg,#7c3aed,#e63946)', photos:['https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80'], activePhoto:0 },
  { initials:'ДС', name:'Данияр Сейткали', role:'ML Engineer', score:88, bio:'Разрабатываю рекомендательные системы и NLP-модели. Хочу применить AI для решения реальных проблем в CA.', stack:['PyTorch','Transformers','FastAPI','Docker'], interests:['AI','Healthcare','Agriculture'], hackathons:7, projects:5, level:'Middle', color:'linear-gradient(135deg,#1d4ed8,#06b6d4)', photos:['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1508341591423-4347099e1f19?auto=format&fit=crop&w=1200&q=80'], activePhoto:0 },
  { initials:'ЗК', name:'Зарина Касымова', role:'Product Manager', score:85, bio:'Веду продукты от идеи до PMF. Умею собирать команды и строить roadmap, который реально выполняется.', stack:['Notion','Jira','Miro','SQL'], interests:['Marketplace','Fintech','Social'], hackathons:4, projects:9, level:'Middle', color:'linear-gradient(135deg,#f97316,#e63946)', photos:['https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80'], activePhoto:0 },
  { initials:'МБ', name:'Максат Бейсенов', role:'Frontend Dev', score:82, bio:'Создаю анимированные интерфейсы на Vue и React. Хочу попасть в продуктовый стартап и сделать что-то по-настоящему крутое.', stack:['Vue','React','TypeScript','Framer'], interests:['Consumer','SaaS','Creative'], hackathons:2, projects:6, level:'Junior', color:'linear-gradient(135deg,#059669,#1d4ed8)', photos:['https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=1200&q=80'], activePhoto:0 },
];

export default {
  name: 'SwipePage',
  components: {
    AppIcon,
    AppShell,
  },
  data() {
    const state = loadAppState()
    return {
      cards: [...ALL_CARDS],
      dismissed: [],
      matches: [],
      currentUserProfile: state.profile,
      dragX: 0, dragY: 0,
      isDragging: false,
      startX: 0, startY: 0,
      swipeDir: null,
      showMatch: false,
      matchedUser: '',
      matchedCard: null,
      totalLikes: 0,
      totalSkips: 0,
      roleFilters: ['Frontend','Backend','ML','Design','Product'],
      interestFilters: ['AI','Fintech','EdTech','Health','SaaS'],
      activeRoles: [],
      activeInterests: [],
    }
  },
  computed: {
    currentCard() {
      return this.cards[0] || null
    },
    dragStyle() {
      if (!this.isDragging) return {};
      const rotate = this.dragX * 0.08;
      return { transform: `translate(${this.dragX}px, ${this.dragY}px) rotate(${rotate}deg)`, transition: 'none' };
    },
    userHasProfilePhoto() {
      return Boolean(this.currentUserProfile.profilePhoto)
    },
    myProfilePhoto() {
      return this.currentUserProfile.profilePhoto || ''
    },
    myInitials() {
      return createInitials(this.currentUserProfile.firstName, this.currentUserProfile.lastName)
    },
    myAvatarStyle() {
      if (this.myProfilePhoto) {
        return { backgroundImage: `url(${this.myProfilePhoto})` }
      }
      return { background: 'linear-gradient(135deg, #e63946, #1d4ed8)' }
    },
  },
  methods: {
    like() {
      this.totalLikes++;
      const card = this.cards[0];
      const isMatch = Math.random() > 0.5;
      this.swipeDir = 'right';
      setTimeout(() => {
        this.cards.shift();
        this.swipeDir = null;
        if (isMatch) {
          this.matches.unshift(card);
          this.matchedUser = card.name;
          this.matchedCard = card;
          this.showMatch = true;
        }
      }, 400);
    },
    skip() {
      this.totalSkips++;
      this.swipeDir = 'left';
      setTimeout(() => { this.cards.shift(); this.swipeDir = null; }, 400);
    },
    super_like() {
      this.totalLikes++;
      const card = this.cards[0];
      this.matches.unshift(card);
      this.matchedUser = card.name;
      this.matchedCard = card;
      this.swipeDir = 'right';
      setTimeout(() => {
        this.cards.shift();
        this.swipeDir = null;
        this.showMatch = true;
      }, 400);
    },
    dismissMatch() {
      this.showMatch = false;
      this.matchedCard = null;
    },
    openMatchChat(match) {
      const person = match || this.matchedCard || this.matches[0];
      if (!person) return;

      this.showMatch = false;
      this.matchedCard = null;

      this.$router.push({
        path: '/chat',
        query: {
          dm: person.name,
          initials: person.initials,
          color: encodeURIComponent(person.color || ''),
          role: person.role || '',
        },
      });
    },
    resetCards() { this.cards = [...ALL_CARDS]; },
    cardPhoto(card) {
      if (!card) return ''
      return card.photos?.[0] || card.profilePhoto || ''
    },
    cardPhotoStyle(card) {
      const url = this.cardPhoto(card)
      if (url) {
        return {
          backgroundImage: `url(${url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      }
      return { background: card.color || 'linear-gradient(135deg, #e63946, #1d4ed8)' }
    },
    startDrag(e) {
      this.isDragging = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      const move = (e2) => {
        this.dragX = e2.clientX - this.startX;
        this.dragY = e2.clientY - this.startY;
      };
      const up = () => {
        this.isDragging = false;
        if (this.dragX > 80) this.like();
        else if (this.dragX < -80) this.skip();
        this.dragX = 0; this.dragY = 0;
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    },
    startDragTouch(e) {
      this.isDragging = true;
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
      const move = (e2) => {
        this.dragX = e2.touches[0].clientX - this.startX;
        this.dragY = e2.touches[0].clientY - this.startY;
      };
      const end = () => {
        this.isDragging = false;
        if (this.dragX > 80) this.like();
        else if (this.dragX < -80) this.skip();
        this.dragX = 0; this.dragY = 0;
        window.removeEventListener('touchmove', move);
        window.removeEventListener('touchend', end);
      };
      window.addEventListener('touchmove', move);
      window.addEventListener('touchend', end);
    },
    toggleRole(r) {
      const i = this.activeRoles.indexOf(r);
      i >= 0 ? this.activeRoles.splice(i,1) : this.activeRoles.push(r);
    },
    toggleInterest(i) {
      const idx = this.activeInterests.indexOf(i);
      idx >= 0 ? this.activeInterests.splice(idx,1) : this.activeInterests.push(i);
    },
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;800;900&family=Onest:wght@400;500;600;700&display=swap');

.page-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.grid-overlay {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}
.blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.18; }
.blob-1 { width: 500px; height: 500px; background: #e63946; top: -100px; right: 0; animation: bf 8s ease-in-out infinite; }
.blob-2 { width: 400px; height: 400px; background: #1d4ed8; bottom: 0; left: 100px; animation: bf 11s ease-in-out infinite reverse; }
.blob-3 { width: 300px; height: 300px; background: #7c3aed; top: 40%; right: 30%; animation: bf 9s ease-in-out infinite 2s; }
@keyframes bf { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-20px) scale(1.06)} }

.page-inner { position: relative; z-index: 1; padding: 40px; min-height: 100vh; }

/* LAYOUT */
.swipe-layout { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 40px; align-items: start; }
.swipe-area { min-width: 0; }

.swipe-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; }
.page-label { font-family: 'Unbounded', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--c-red); margin-bottom: 8px; }
.page-title { font-family: 'Unbounded', sans-serif; font-size: 32px; font-weight: 800; color: var(--c-white); margin: 0; letter-spacing: -0.5px; }
.swipe-counter { text-align: right; }
.counter-num { font-family: 'Unbounded', sans-serif; font-size: 28px; font-weight: 800; color: var(--c-red); display: block; }
.counter-label { font-size: 12px; color: var(--c-muted); }

/* CARD STACK */
.card-stack { position: relative; min-height: 640px; width: min(100%, 380px); margin: 0 auto; }
.swipe-card {
  position: absolute; width: 100%;
  background: var(--c-card); border: 1px solid var(--c-border);
  border-radius: 24px; padding: 28px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.5);
  transition: transform 0.4s cubic-bezier(.34,1.56,.64,1), opacity 0.4s;
  user-select: none;
}
.swipe-card--back2 { top: 20px; left: 20px; transform: rotate(5deg); opacity: 0.3; }
.swipe-card--back1 { top: 10px; left: 10px; transform: rotate(2.5deg); opacity: 0.55; }
.swipe-card--main {
  top: 0; left: 0; z-index: 3; cursor: grab;
  background: var(--c-surface); border-color: rgba(255,255,255,0.1);
}
.swipe-card--main:active { cursor: grabbing; }
.swiping-left { transform: translateX(-120%) rotate(-20deg) !important; opacity: 0 !important; }
.swiping-right { transform: translateX(120%) rotate(20deg) !important; opacity: 0 !important; }

/* SWIPE HINTS */
.swipe-hint {
  position: absolute; top: 24px; padding: 6px 18px; border-radius: 100px;
  font-family: 'Unbounded', sans-serif; font-size: 13px; font-weight: 800;
  opacity: 0; transition: opacity 0.15s; pointer-events: none;
  border: 3px solid;
}
.swipe-hint.like { right: 24px; color: #4ade80; border-color: #4ade80; }
.swipe-hint.skip { left: 24px; color: #f87171; border-color: #f87171; }
.swipe-hint.show { opacity: 1; }

/* CARD CONTENT */
.sc-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: -8px 0 8px;
  gap: 14px;
}

.sc-photo-ring {
  padding: 4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e63946, #1d4ed8, #7c3aed);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
}

.sc-photo-circle {
  width: 168px;
  height: 168px;
  border-radius: 50%;
  border: 4px solid var(--c-surface);
  background-size: cover;
  background-position: center;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.sc-photo-circle--fallback {
  border-color: rgba(255, 255, 255, 0.08);
}

.sc-photo-initials {
  font-family: 'Unbounded', sans-serif;
  font-size: 36px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
}

.sc-top--below {
  position: static;
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 0 4px;
}

.sc-identity { min-width: 0; text-align: left; }
.sc-score { text-align: right; flex-shrink: 0; }
.score-num { font-family: 'Unbounded', sans-serif; font-size: 26px; font-weight: 800; color: var(--c-red); display: block; line-height: 1; }
.score-label { font-size: 11px; color: var(--c-muted); }
.sc-name { font-family: 'Unbounded', sans-serif; font-size: 18px; font-weight: 700; color: var(--c-white); margin: 0 0 6px; }
.sc-role-badge {
  display: inline-block; font-size: 12px; font-weight: 600; padding: 4px 14px; border-radius: 100px;
  background: rgba(255, 255, 255, 0.06); color: var(--c-text); border: 1px solid var(--c-border);
}

.ma-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 18px;
}
.sc-content { display: grid; gap: 14px; }
.sc-bio-block,
.sc-interests-panel {
  padding: 14px;
  border-radius: 14px;
  border: 1px solid var(--c-border);
  background: rgba(255,255,255,0.03);
}
.sc-bio { font-size: 13px; line-height: 1.6; color: var(--c-muted); margin-bottom: 14px; }
.interests-title { font-size: 12px; font-weight: 700; color: var(--c-white); margin-bottom: 10px; }
.sc-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.sc-tag { font-size: 11px; padding: 3px 10px; border-radius: 100px; background: rgba(59,130,246,0.1); color: #93c5fd; border: 1px solid rgba(59,130,246,0.2); }
.sc-interests { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
.sc-interest { font-size: 11px; padding: 3px 10px; border-radius: 100px; background: rgba(255,255,255,0.05); color: var(--c-muted); border: 1px solid var(--c-border); }
.sc-meta { display: flex; gap: 14px; flex-wrap: wrap; }
.sc-meta-item { font-size: 12px; color: var(--c-text); }

/* BUTTONS */
.swipe-btns { display: flex; justify-content: center; align-items: center; gap: 22px; margin-top: 8px; margin-bottom: 4px; padding: 8px 0 4px; position: relative; z-index: 4; }
.swipe-btn {
  width: 68px; height: 68px;
  -webkit-tap-highlight-color: transparent; border-radius: 50%; border: none; cursor: pointer;
  font-size: 22px; display: grid; place-items: center; transition: all 0.2s;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.swipe-btn--skip { background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.12); }
.swipe-btn--skip:hover { background: rgba(248,113,113,0.1); border-color: #f87171; transform: scale(1.1); }
.swipe-btn--like { background: linear-gradient(135deg, #e63946, #f97316); }
.swipe-btn--like:hover { transform: scale(1.1); box-shadow: 0 12px 32px rgba(230,57,70,0.4); }
.swipe-btn--super { background: linear-gradient(135deg, #7c3aed, #3b82f6); }
.swipe-btn--super:hover { transform: scale(1.1); }
.drag-hint { text-align: center; font-size: 12px; color: var(--c-muted); margin-top: 16px; }

/* EMPTY STATE */
.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { width: 56px; height: 56px; margin: 0 auto 16px; border-radius: 16px; display: grid; place-items: center; background: rgba(255,255,255,0.04); color: var(--c-muted); }
.empty-title { font-family: 'Unbounded', sans-serif; font-size: 20px; font-weight: 700; color: var(--c-white); margin-bottom: 8px; }
.empty-sub { font-size: 14px; color: var(--c-muted); margin-bottom: 24px; }

/* BUTTONS SHARED */
.btn-primary {
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--c-red); color: #fff; font-family: 'Onest', sans-serif;
  font-weight: 600; font-size: 14px; padding: 10px 22px;
  border-radius: 8px; border: none; cursor: pointer; transition: all 0.2s;
}
.btn-primary:hover { background: #c62d39; }
.btn-primary.btn-lg { font-size: 15px; padding: 13px 28px; }
.btn-outline {
  display: inline-flex; align-items: center; gap: 8px;
  color: var(--c-text); font-family: 'Onest', sans-serif;
  font-weight: 600; font-size: 14px; padding: 12px 22px;
  border-radius: 8px; border: 1.5px solid rgba(255,255,255,0.15);
  background: transparent; cursor: pointer; transition: all 0.2s;
}
.btn-outline:hover { border-color: rgba(255,255,255,0.35); }

/* INFO PANEL */
.info-panel { display: flex; flex-direction: column; gap: 20px; position: sticky; top: 40px; }
.panel-section { background: var(--c-card); border: 1px solid var(--c-border); border-radius: var(--r); padding: 20px; }
.panel-title {
  font-family: 'Unbounded', sans-serif; font-size: 13px; font-weight: 700;
  color: var(--c-white); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
}
.match-count {
  background: var(--c-red); color: #fff; font-size: 11px; font-weight: 700;
  padding: 2px 8px; border-radius: 100px;
}
.filter-group { margin-bottom: 14px; }
.filter-group:last-child { margin-bottom: 0; }
.filter-label { font-size: 11px; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
.filter-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.filter-chip {
  font-size: 12px; padding: 4px 12px; border-radius: 100px;
  border: 1px solid var(--c-border); color: var(--c-muted);
  cursor: pointer; transition: all 0.2s;
}
.filter-chip:hover { color: var(--c-text); border-color: rgba(255,255,255,0.15); }
.filter-chip.active { background: var(--c-red-dim); color: var(--c-red); border-color: rgba(230,57,70,0.3); }

/* MATCHES */
.matches-list { display: flex; flex-direction: column; gap: 10px; }
.match-item { display: flex; align-items: center; gap: 10px; }
.match-avatar {
  width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
  display: grid; place-items: center;
  font-family: 'Unbounded', sans-serif; font-size: 12px; font-weight: 700; color: #fff;
}
.match-info { flex: 1; }
.match-name { font-size: 13px; font-weight: 600; color: var(--c-white); }
.match-role { font-size: 11px; color: var(--c-muted); }
.match-msg-btn {
  width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--c-border);
  background: transparent; cursor: pointer; font-size: 14px; display: grid; place-items: center;
  transition: all 0.2s;
}
.match-msg-btn:hover { border-color: rgba(230,57,70,0.3); background: var(--c-red-dim); }
.no-matches { font-size: 13px; color: var(--c-muted); text-align: center; padding: 12px 0; }

/* STATS */
.stats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
.stat-box { text-align: center; padding: 12px 8px; background: var(--c-surface); border-radius: 10px; border: 1px solid var(--c-border); }
.stat-num { font-family: 'Unbounded', sans-serif; font-size: 22px; font-weight: 800; color: var(--c-white); }
.stat-label { font-size: 11px; color: var(--c-muted); margin-top: 2px; }

/* MATCH POPUP */
.match-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.75); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
}
.match-modal {
  position: relative; overflow: hidden;
  background: var(--c-card); border: 1px solid rgba(230,57,70,0.3);
  border-radius: 24px; padding: 48px 40px; text-align: center;
  max-width: 380px; width: 90%;
  box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(230,57,70,0.15);
}
.match-bg-blob {
  position: absolute; width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(230,57,70,0.2) 0%, transparent 70%);
  top: -100px; left: 50%; transform: translateX(-50%); pointer-events: none;
}
.match-emoji { font-size: 48px; margin-bottom: 12px; animation: matchPop 0.6s cubic-bezier(.34,1.56,.64,1); }
@keyframes matchPop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.match-title { font-family: 'Unbounded', sans-serif; font-size: 28px; font-weight: 800; color: var(--c-white); margin-bottom: 8px; }
.match-sub { font-size: 15px; color: var(--c-muted); margin-bottom: 24px; }
.match-sub strong { color: var(--c-white); }
.match-avatars { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 32px; }
.ma {
  width: 64px; height: 64px; border-radius: 18px;
  display: grid; place-items: center;
  font-family: 'Unbounded', sans-serif; font-size: 18px; font-weight: 700; color: #fff;
}
.ma-you { background: linear-gradient(135deg, #e63946, #1d4ed8); }
.ma-them { background: linear-gradient(135deg, #7c3aed, #e63946); }
.ma-heart { font-size: 28px; }
.match-actions { display: flex; flex-direction: column; gap: 10px; }

/* TRANSITIONS */
.match-pop-enter-active, .match-pop-leave-active { transition: opacity 0.3s; }
.match-pop-enter-from, .match-pop-leave-to { opacity: 0; }

.profile-readiness {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.readiness-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: var(--c-text);
}

.readiness-note {
  font-size: 12px;
  color: var(--c-muted);
  line-height: 1.6;
}

@media (max-width: 1280px) {
  .swipe-layout {
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 28px;
  }
}

@media (max-width: 1080px) {
  .page-inner {
    padding: 32px 24px 40px;
  }

  .swipe-layout {
    grid-template-columns: 1fr;
  }

  .info-panel {
    position: static;
    order: -1;
  }

  .card-stack {
    min-height: 700px;
  }
}

@media (max-width: 760px) {
  .page-inner {
    padding: 24px 16px 36px;
  }

  .swipe-header {
    flex-direction: column;
    gap: 16px;
  }

  .swipe-counter {
    text-align: left;
  }

  .page-title {
    font-size: 28px;
  }

  .card-stack {
    min-height: 660px;
    width: min(100%, 100%);
  }

  .swipe-card {
    padding: 20px;
    border-radius: 20px;
  }

  .sc-photo-shell {
    height: 220px;
    margin: -20px -20px 16px;
    border-radius: 20px 20px 16px 16px;
  }

  .sc-top {
    left: 14px;
    right: 14px;
    bottom: 14px;
  }

  .sc-name {
    font-size: 18px;
  }

  .score-num {
    font-size: 24px;
  }

  .sc-meta {
    gap: 8px;
  }

  .sc-meta-item {
    width: 100%;
  }

  .photo-dot {
    width: 18px;
  }

  .swipe-btns {
    gap: 14px;
  }

  .swipe-btn {
    width: 54px;
    height: 54px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>