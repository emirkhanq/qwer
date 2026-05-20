<template>
  <AppShell>
    <div class="chat-page">
      <div class="page-bg">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="grid-overlay"></div>
      </div>

      <div class="chat-layout">

        <!-- LEFT: channels / DMs -->
        <div class="channels-panel">
          <div class="channels-header">
            <div class="ch-title">Пространство</div>
            <span class="online-badge">
              <span class="online-dot"></span>
              {{ onlineCount }} онлайн
            </span>
          </div>

          <div class="channels-section">
            <div class="channels-section-label">Каналы</div>
            <div
                v-for="ch in channels"
                :key="ch.id"
                class="channel-item"
                :class="{ active: activeChannel === ch.id }"
                @click="selectChannel(ch.id)"
            >
              <span class="ch-icon"><AppIcon :name="ch.icon" :size="14" /></span>
              <span class="ch-name">{{ ch.name }}</span>
              <span v-if="ch.unread" class="ch-unread">{{ ch.unread }}</span>
            </div>
          </div>

          <div class="channels-section">
            <div class="channels-section-label-row">
              <span class="channels-section-label">Мои группы</span>
              <button class="create-group-btn" @click="openCreateGroup" title="Создать группу">+</button>
            </div>
            <div v-if="groups.length === 0" class="no-groups-hint">
              Создай группу для своей команды
            </div>
            <div
                v-for="g in groups"
                :key="g.id"
                class="channel-item channel-item--group"
                :class="{ active: activeChannel === g.id }"
                @click="selectChannel(g.id)"
            >
              <span class="ch-icon ch-icon--group">{{ g.name.charAt(0).toUpperCase() }}</span>
              <span class="ch-name">{{ g.name }}</span>
              <span class="group-members-count">{{ g.members.length + 1 }}</span>
            </div>
          </div>

          <div class="channels-section">
            <div class="channels-section-label">Личные сообщения</div>
            <div
                v-for="dm in dms"
                :key="dm.name"
                class="dm-item"
                :class="{ active: activeDm === dm.name }"
                @click="selectDm(dm.name)"
            >
              <div class="dm-avatar" :style="{ background: dm.color }">{{ dm.initials }}</div>
              <div class="dm-info">
                <div class="dm-name">{{ dm.name }}</div>
                <div class="dm-preview">{{ dm.preview }}</div>
              </div>
              <span v-if="dm.unread" class="ch-unread">{{ dm.unread }}</span>
            </div>
          </div>
        </div>

        <!-- CENTER: chat feed -->
        <div class="chat-area">
          <div class="chat-header">
            <div class="chat-title-block">
              <span class="chat-channel-icon"><AppIcon :name="currentChannel?.icon || 'chat'" :size="18" /></span>
              <div>
                <div class="chat-channel-name">{{ currentChannel?.name || activeDm }}</div>
                <div class="chat-channel-sub">{{ currentChannel?.desc || activeDmContact?.role || 'Личный диалог' }}</div>
              </div>
            </div>
            <div class="chat-header-actions">
              <button class="icon-btn" title="Участники"><AppIcon name="users" :size="16" /></button>
              <button class="icon-btn" title="Поиск"><AppIcon name="search" :size="16" /></button>
            </div>
          </div>

          <!-- Messages -->
          <div class="messages-feed" ref="feed">
            <div class="messages-date-divider">Сегодня</div>

            <div
                v-for="(msg, i) in currentMessages"
                :key="i"
                class="message"
                :class="{
                'message--own': msg.own,
                'message--system': msg.system,
                'message--continued': i > 0 && currentMessages[i-1].author === msg.author && !currentMessages[i-1].system
              }"
            >
              <template v-if="msg.system">
                <div class="sys-msg">{{ msg.text }}</div>
              </template>
              <template v-else>
                <div class="msg-avatar-col" v-if="!msg.own">
                  <div
                      v-if="!(i > 0 && currentMessages[i-1].author === msg.author)"
                      class="msg-avatar"
                      :style="{ background: msg.color }"
                  >{{ msg.initials }}</div>
                  <div v-else class="msg-avatar-spacer"></div>
                </div>
                <div class="msg-body" :class="{ 'msg-body--own': msg.own }">
                  <div class="msg-meta" v-if="!msg.own && !(i > 0 && currentMessages[i-1].author === msg.author)">
                    <span class="msg-author">{{ msg.author }}</span>
                    <span class="msg-role">{{ msg.role }}</span>
                    <span class="msg-time">{{ msg.time }}</span>
                  </div>
                  <div class="msg-bubble" :class="{ 'msg-bubble--own': msg.own, 'msg-bubble--code': msg.code }">
                    <pre v-if="msg.code" class="code-block"><code>{{ msg.text }}</code></pre>
                    <template v-else>{{ msg.text }}</template>
                    <span v-if="msg.own" class="msg-time-own">{{ msg.time }}</span>
                  </div>
                  <!-- Candidate cards for AI Recruiter -->
                  <div v-if="msg.isRecruiterResult && msg.candidates" class="candidates-grid">
                    <div v-for="c in msg.candidates" :key="c.name" class="candidate-card">
                      <div class="cand-header">
                        <div class="cand-avatar" :style="{ background: c.color }">{{ c.initials }}</div>
                        <div class="cand-info">
                          <div class="cand-name">{{ c.name }}</div>
                          <div class="cand-role">{{ c.role }}</div>
                        </div>
                        <div class="cand-match" :class="{ 'match-high': c.match >= 80 }">{{ c.match }}%</div>
                      </div>
                      <div class="cand-about">{{ c.about }}</div>
                      <div class="cand-skills">{{ c.skills }}</div>
                      <div class="cand-reason">💡 {{ c.reason }}</div>
                      <button class="cand-dm-btn" @click="startDm({ name: c.name, initials: c.initials, color: c.color, role: c.role })">
                        Написать →
                      </button>
                    </div>
                  </div>
                  <div class="msg-reactions" v-if="msg.reactions && msg.reactions.length">
                     <span
                         v-for="r in msg.reactions"
                         :key="r.emoji"
                         class="reaction"
                         :class="{ reacted: r.mine }"
                         @click="toggleReaction(msg, r)"
                     >{{ r.emoji }} {{ r.count }}</span>
                  </div>
                  <!-- AI Suggestions for incoming messages -->
                  <div v-if="!msg.own && !msg.system && msg.showAiSuggestions" class="ai-suggestions-box">
                    <div class="ai-label">💡 Как ответить?</div>
                    <div class="ai-suggestions-list">
                      <button
                          v-for="(suggestion, idx) in msg.aiSuggestions"
                          :key="idx"
                          class="ai-suggestion-btn"
                          @click="insertAiSuggestion(suggestion)"
                      >
                        {{ suggestion }}
                      </button>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <!-- Typing indicator -->
            <div class="typing-indicator" v-if="someoneTyping">
              <div class="typing-dots">
                <span></span><span></span><span></span>
              </div>
              <span class="typing-text">{{ typingUser }} печатает...</span>
            </div>
          </div>

          <!-- Input -->
          <div class="chat-input-area">
            <div class="input-toolbar">
              <button class="toolbar-btn" title="Уведомления"><AppIcon name="bell" :size="15" /></button>
              <button class="toolbar-btn" title="Файл"><AppIcon name="paperclip" :size="15" /></button>
              <button class="toolbar-btn" title="Код" @click="codeMode = !codeMode" :class="{ active: codeMode }"><AppIcon name="code" :size="15" /></button>
            </div>

            <!-- Intent indicator -->
            <div v-if="currentIntent && currentIntent !== 'general'" class="intent-indicator">
              <span class="intent-emoji">{{ getIntentEmoji(currentIntent) }}</span>
              <span class="intent-label">{{ getIntentLabel(currentIntent) }}</span>
            </div>

            <!-- Auto-complete menu -->
            <div v-if="showAutoComplete && autocompleteSuggestions.length > 0" class="autocomplete-menu">
              <button
                  v-for="(suggestion, idx) in autocompleteSuggestions"
                  :key="idx"
                  class="autocomplete-item"
                  @click="inputText = suggestion; showAutoComplete = false; $refs.input?.focus()"
              >
                {{ suggestion }}
              </button>
            </div>

            <div class="input-wrapper" :class="{ 'input-code': codeMode }">
               <textarea
                   ref="input"
                   v-model="inputText"
                   :placeholder="codeMode ? 'Вставь код...' : 'Напиши что-нибудь…'"
                   @keydown.enter.exact.prevent="send"
                   @keydown.shift.enter="() => {}"
                   @input="onType"
                   rows="1"
               ></textarea>
              <button class="send-btn" :disabled="!inputText.trim()" @click="send"><AppIcon name="send" :size="16" /></button>
            </div>
            <div class="input-hint">Enter — отправить · Shift+Enter — перенос строки</div>
          </div>
        </div>

        <!-- AI ASSISTANT PANEL -->
        <div class="ai-assistant-panel" :class="{ 'ai-panel-open': showAiPanel }">
          <div class="ai-panel-header">
            <div class="ai-panel-title">
              <span class="ai-panel-icon">🤖</span>
              <div>
                <div>AI Ассистент InUni</div>
                <div class="ai-panel-sub">советник · рекрутер · помощник</div>
              </div>
            </div>
            <button class="ai-panel-close" @click="showAiPanel = false">✕</button>
          </div>

          <div class="ai-chat-feed" ref="aiFeed">
            <div v-if="aiMessages.length === 0" class="ai-empty">
              <div class="ai-empty-icon">🤖</div>
              <div class="ai-empty-title">Привет! Я твой AI ассистент</div>
              <div class="ai-empty-desc">Помогу написать сообщение, подберу кандидатов в команду или отвечу на любой вопрос</div>
            </div>
            <div v-for="(m, i) in aiMessages" :key="i" class="ai-msg" :class="{ 'ai-msg-own': m.role === 'user' }">
              <div class="ai-msg-bubble">
                <template v-if="m.candidates">
                  <div class="ai-msg-text">{{ m.text }}</div>
                  <div class="candidates-grid">
                    <div v-for="c in m.candidates" :key="c.name" class="candidate-card">
                      <div class="cand-header">
                        <div class="cand-avatar" :style="{ background: c.color }">{{ c.initials }}</div>
                        <div class="cand-info">
                          <div class="cand-name">{{ c.name }}</div>
                          <div class="cand-role">{{ c.role }}</div>
                        </div>
                        <div class="cand-match" :class="{ 'match-high': c.match >= 80 }">{{ c.match }}%</div>
                      </div>
                      <div class="cand-skills">{{ c.skills }}</div>
                      <div class="cand-reason">💡 {{ c.reason }}</div>
                      <button class="cand-dm-btn" @click="startDm({ name: c.name, initials: c.initials, color: c.color, role: c.role }); showAiPanel = false">
                        Написать →
                      </button>
                    </div>
                  </div>
                </template>
                <template v-else>{{ m.content }}</template>
              </div>
            </div>
            <div v-if="aiLoading" class="ai-msg">
              <div class="ai-msg-bubble ai-msg-loading">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>

          <div class="ai-quick-btns">
            <button class="ai-quick" @click="aiQuick('найди мне frontend разработчика в команду')">🔍 Найти Frontend</button>
            <button class="ai-quick" @click="aiQuick('найди ML инженера для AI проекта')">🤖 Найти ML</button>
            <button class="ai-quick" @click="aiQuick('помоги написать сообщение для поиска команды на хакатон')">✍️ Написать пост</button>
            <button class="ai-quick" @click="aiQuick('улучши моё сообщение: ' + (inputText || 'напиши пример для поиска команды'))">✨ Улучшить текст</button>
          </div>

          <div class="ai-panel-input">
            <textarea
                v-model="aiInput"
                placeholder="Найди дизайнера / напиши пост / помоги с ответом..."
                @keydown.enter.exact.prevent="sendToAi"
                rows="2"
            ></textarea>
            <button class="ai-send-btn" @click="sendToAi" :disabled="!aiInput.trim() || aiLoading">➤</button>
          </div>
        </div>

        <!-- AI ASSISTANT TOGGLE BUTTON -->
        <button class="ai-toggle-btn" @click="showAiPanel = !showAiPanel" :class="{ active: showAiPanel }">
          🤖
          <span class="ai-toggle-label">AI</span>
        </button>

        <!-- RIGHT: active members -->
        <div class="members-panel" v-if="!activeDm">
          <div class="mp-header">Участники онлайн</div>
          <div class="mp-section-label">🟢 В сети — {{ onlineMembers.length }}</div>
          <div class="members-list">
            <div v-for="m in onlineMembers" :key="m.name" class="member-item">
              <div class="member-avatar" :style="{ background: m.color }">{{ m.initials }}</div>
              <div class="member-info">
                <div class="member-name">{{ m.name }}</div>
                <div class="member-role">{{ m.role }}</div>
              </div>
              <button class="member-dm" @click="startDm(m)" title="Написать"><AppIcon name="chat" :size="13" /></button>
            </div>
          </div>
          <div class="mp-section-label" style="margin-top:16px">⚫ Не в сети — {{ offlineMembers.length }}</div>
          <div class="members-list">
            <div v-for="m in offlineMembers" :key="m.name" class="member-item offline">
              <div class="member-avatar" :style="{ background: m.color }">{{ m.initials }}</div>
              <div class="member-info">
                <div class="member-name">{{ m.name }}</div>
                <div class="member-role">{{ m.role }}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </AppShell>

  <!-- CREATE GROUP MODAL -->
  <teleport to="body">
    <div v-if="showCreateGroup" class="modal-overlay" @click.self="showCreateGroup = false">
      <div class="modal-box">
        <div class="modal-header">
          <div class="modal-title">🚀 Создать группу</div>
          <button class="modal-close" @click="showCreateGroup = false">✕</button>
        </div>

        <div class="modal-body">
          <div class="modal-field">
            <label class="modal-label">Название группы</label>
            <input
                v-model="newGroupName"
                class="modal-input"
                placeholder="Например: Team Alpha, HealthTech Squad..."
                @keydown.enter="createGroup"
            />
          </div>

          <div class="modal-field">
            <label class="modal-label">Добавить участников</label>
            <div class="members-picker">
              <div
                  v-for="m in [...onlineMembers, ...offlineMembers]"
                  :key="m.name"
                  class="member-pick-item"
                  :class="{ selected: isMemberSelected(m) }"
                  @click="toggleMember(m)"
              >
                <div class="pick-avatar" :style="{ background: m.color }">{{ m.initials }}</div>
                <div class="pick-info">
                  <div class="pick-name">{{ m.name }}</div>
                  <div class="pick-role">{{ m.role }}</div>
                </div>
                <div class="pick-check">{{ isMemberSelected(m) ? '✓' : '+' }}</div>
              </div>
            </div>
          </div>

          <div v-if="selectedMembers.length > 0" class="selected-summary">
            <span class="sel-label">Выбрано:</span>
            <span v-for="m in selectedMembers" :key="m.name" class="sel-chip">{{ m.name.split(' ')[0] }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-cancel" @click="showCreateGroup = false">Отмена</button>
          <button
              class="modal-create"
              :disabled="!newGroupName.trim() || selectedMembers.length === 0"
              @click="createGroup"
          >
            Создать группу →
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import AppIcon from '../components/AppIcon.vue'
import AppShell from '../components/AppShell.vue'
import { buildDmFromMatch } from '../lib/chatUtils'
import { createInitials, loadAppState } from '../lib/appState'
import { useAuthStore } from '../stores/auth.js'
import { getMessages, sendMessage } from '../api/index.js'

const MESSAGES_GENERAL = [
  { author:'Искендер А.', initials:'ИА', role:'Backend Dev', color:'linear-gradient(135deg,#e63946,#1d4ed8)', time:'10:14', text:'Всем привет! Кто-нибудь участвует в AI Cup? Собираю команду, нужен фронтендщик.', reactions:[{emoji:'🙋',count:3,mine:false},{emoji:'🔥',count:2,mine:false}] },
  { author:'Айгерим М.', initials:'АМ', role:'UI/UX', color:'linear-gradient(135deg,#7c3aed,#e63946)', time:'10:16', text:'Привет! Я дизайнер, но команда уже полная. Подписалась — буду болеть за вас 🎉' },
  { system:true, text:'Данияр С. присоединился к InUni' },
  { author:'Данияр С.', initials:'ДС', role:'ML Engineer', color:'linear-gradient(135deg,#1d4ed8,#06b6d4)', time:'10:21', text:'Привет всем! Я ML-инженер, ищу команду под хакатон или стартап-проект в сфере HealthTech. Кто занимается похожим — напишите!', reactions:[{emoji:'👋',count:5,mine:false}] },
  { author:'Зарина К.', initials:'ЗК', role:'Product Manager', color:'linear-gradient(135deg,#f97316,#e63946)', time:'10:24', text:'@Данияр у нас как раз HealthTech-стартап, написала тебе в личку!' },
  { author:'Данияр С.', initials:'ДС', role:'ML Engineer', color:'linear-gradient(135deg,#1d4ed8,#06b6d4)', time:'10:24', text:'Увидел, спасибо!' },
  { author:'Максат Б.', initials:'МБ', role:'Frontend Dev', color:'linear-gradient(135deg,#059669,#1d4ed8)', time:'10:31', text:'Народ, вопрос по Vue 3: кто-нибудь сталкивался с проблемой реактивности вложенных объектов в Composition API?' },
  { author:'Искендер А.', initials:'ИА', role:'Backend Dev', color:'linear-gradient(135deg,#e63946,#1d4ed8)', time:'10:32', text:'Да, классика. Используй reactive() вместо ref() для объектов, или явно обращайся через .value', code:false },
  { author:'Максат Б.', initials:'МБ', role:'Frontend Dev', color:'linear-gradient(135deg,#059669,#1d4ed8)', time:'10:33', text:'const state = reactive({\n  user: { name: "Макс", skills: [] }\n})\n// так реактивность работает корректно', code:true },
  { author:'Айгерим М.', initials:'АМ', role:'UI/UX', color:'linear-gradient(135deg,#7c3aed,#e63946)', time:'10:35', text:'Кстати, если кому нужна помощь с Figma-прототипом под хакатон — пишите! Мне интересно попрактиковаться в коротких спринтах.', reactions:[{emoji:'❤️',count:4,mine:false},{emoji:'🙏',count:2,mine:false}] },
  { own:true, initials:'АБ', time:'10:37', text:'Привет всем! Я ищу проект или команду под AI Cup. Frontend на Vue/React, 2 года опыта. Портфолио есть — скину в личку кому надо!' },
  { author:'Искендер А.', initials:'ИА', role:'Backend Dev', color:'linear-gradient(135deg,#e63946,#1d4ed8)', time:'10:38', text:'@Айдар отлично! Написал тебе — у нас как раз место фронтендщика открыто 🔥', reactions:[{emoji:'🔥',count:1,mine:true}] },
];


export default {
  name: 'ChatPage',
  components: {
    AppIcon,
    AppShell,
  },
  setup() {
    return { authStore: useAuthStore() }
  },
  data() {
    const { profile } = loadAppState()
    return {
      profile,
      activeChannel: 'general',
      activeDm: null,
      inputText: '',
      codeMode: false,
      someoneTyping: false,
      typingUser: 'Искендер А.',
      typingTimer: null,
      currentIntent: null,
      showAutoComplete: false,
      autocompleteSuggestions: [],
      // AI Assistant panel
      showAiPanel: false,
      aiMessages: [],
      aiInput: '',
      aiLoading: false,
      // Groups (локальные)
      showCreateGroup: false,
      newGroupName: '',
      selectedMembers: [],
      groups: [],
      userTeams: [], // Локальные команды
      loadingTeams: false,
      // Messages (локальные)
      teamMessages: {}, // { teamId: [messages] }
      messagesLoading: false,
      channels: [
        { id: 'general', icon: 'chat', name: 'Агора', desc: 'Главная площадь InUni — для всех', unread: 0, locked: false },
        { id: 'random', icon: 'sparkles', name: 'оффтоп', desc: 'Всё остальное', unread: 0, locked: false },
      ],
      dms: [
        { initials:'ИА', name:'Искендер А.', fullName:'Искендер Абазов', role:'Backend Dev', color:'linear-gradient(135deg,#e63946,#1d4ed8)', preview:'Написал тебе насчёт команды', unread: 1 },
        { initials:'АМ', name:'Айгерим М.', fullName:'Айгерим Матова', role:'UI/UX', color:'linear-gradient(135deg,#7c3aed,#e63946)', preview:'Окей, скину портфолио!', unread: 0 },
      ],
      messagesByChannel: {
        general: [...MESSAGES_GENERAL],
        random: [],
      },
      messagesByDm: {
        'Искендер А.': [
          {
            author: 'Искендер А.',
            initials: 'ИА',
            role: 'Backend Dev',
            color: 'linear-gradient(135deg,#e63946,#1d4ed8)',
            time: '10:38',
            text: 'Привет! Увидел твой профиль в знакомствах — давай обсудим команду 🔥',
          },
        ],
        'Айгерим М.': [
          {
            author: 'Айгерим М.',
            initials: 'АМ',
            role: 'UI/UX',
            color: 'linear-gradient(135deg,#7c3aed,#e63946)',
            time: '09:12',
            text: 'Окей, скину портфолио!',
          },
        ],
      },
      onlineCount: 47,
      onlineMembers: [
        { initials:'ИА', name:'Искендер А.', role:'Backend Dev', color:'linear-gradient(135deg,#e63946,#1d4ed8)' },
        { initials:'АМ', name:'Айгерим М.', role:'UI/UX', color:'linear-gradient(135deg,#7c3aed,#e63946)' },
        { initials:'ДС', name:'Данияр С.', role:'ML Engineer', color:'linear-gradient(135deg,#1d4ed8,#06b6d4)' },
        { initials:'ЗК', name:'Зарина К.', role:'PM', color:'linear-gradient(135deg,#f97316,#e63946)' },
        { initials:'МБ', name:'Максат Б.', role:'Frontend Dev', color:'linear-gradient(135deg,#059669,#1d4ed8)' },
      ],
      offlineMembers: [
        { initials:'РМ', name:'Ренат М.', role:'DevOps', color:'linear-gradient(135deg,#059669,#06b6d4)' },
        { initials:'НО', name:'Назгуль О.', role:'Mobile Dev', color:'linear-gradient(135deg,#e63946,#f97316)' },
      ],
    }
  },
  computed: {
    currentChannel() {
      return this.channels.find(c => c.id === this.activeChannel) || null;
    },
    currentMessages() {
      if (this.activeDm) return this.messagesByDm[this.activeDm] || [];
      if (this.activeChannel) {
        // Если это команда (есть в teamMessages), берем оттуда
        if (this.teamMessages[this.activeChannel]) {
          return this.teamMessages[this.activeChannel];
        }
        // Иначе берем из mock (general/random)
        return this.messagesByChannel[this.activeChannel] || [];
      }
      return [];
    },
    allChannels() {
      const groupChannels = this.groups.map(g => ({
        id: g.id,
        icon: 'users',
        name: g.name,
        desc: `Команда: ${g.members.map(m => m.name.split(' ')[0]).join(', ')}`,
        unread: 0,
        isGroup: true,
        members: g.members,
      }));
      return [...this.channels, ...groupChannels];
    },
    activeDmContact() {
      if (!this.activeDm) return null;
      return this.dms.find((dm) => dm.name === this.activeDm) || null;
    },
    ownInitials() {
      return createInitials(this.profile.firstName, this.profile.lastName)
    },
  },
  watch: {
    '$route.query.dm': {
      immediate: false,
      handler(dm) {
        if (dm) this.openDmFromRoute(this.$route.query);
      },
    },
  },
  methods: {
    // Загрузка команд пользователя (локальная)
    async loadUserTeams() {
      this.loadingTeams = true
      try {
        const state = loadAppState()
        // Используем локальные команды из teams
        this.groups = state.teams?.map(team => ({
          id: team.id,
          name: team.name,
          members: [],
          role: 'member',
        })) || []
      } catch (err) {
        console.error('Failed to load teams:', err)
      } finally {
        this.loadingTeams = false
      }
    },

    // Загрузка сообщений команды (локальная)
    async loadTeamMessages(teamId) {
      if (!teamId || this.teamMessages[teamId]) return
      
      this.messagesLoading = true
      try {
        // Локальные мок-сообщения
        this.teamMessages[teamId] = [
          { author: 'Система', initials: 'СИ', role: 'System', color: '#666', time: '10:00', text: 'Чат создан', self: false }
        ]
      } catch (err) {
        console.error('Failed to load messages:', err)
      } finally {
        this.messagesLoading = false
      }
    },

    // Подписка на сообщения (локальная - пустая заглушка)
    subscribeToTeamMessages(teamId) {
      // Локальная версия без realtime
      console.log('Subscribed to team:', teamId)
    },

    // Отправка сообщения в backend
    async sendTeamMessage() {
      if (!this.inputText.trim() || !this.activeChannel) return
      
      // Для общих каналов используем mock
      if (this.activeChannel === 'general' || this.activeChannel === 'random') {
        this.sendToGeneral()
        return
      }

      try {
        const authStore = useAuthStore()
        const userId = authStore.userId
        
        if (!userId) {
          throw new Error('Пользователь не авторизован')
        }
        
        // Отправляем в backend API
        const result = await sendMessage(this.activeChannel, userId, this.inputText.trim())
        console.log('DEBUG: Message sent:', result)
        
        // Локальное добавление сообщения
        const newMsg = {
          id: result.id || 'msg_' + Date.now(),
          author: `${this.profile.firstName} ${this.profile.lastName}`.trim(),
          initials: createInitials(this.profile.firstName, this.profile.lastName),
          role: this.profile.role || 'Участник',
          color: 'linear-gradient(135deg,#059669,#1d4ed8)',
          time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          text: this.inputText.trim(),
          isOwn: true,
        }
        
        if (!this.teamMessages[this.activeChannel]) {
          this.teamMessages[this.activeChannel] = []
        }
        this.teamMessages[this.activeChannel].push(newMsg)
        this.inputText = ''
      } catch (err) {
        console.error('Failed to send message:', err)
        this.showToast('Ошибка отправки сообщения: ' + err.message)
      }
    },

    // Отправка в общий канал (mock для демо)
    sendToGeneral() {
      if (!this.inputText.trim()) return
      const text = this.inputText.trim()
      const newMessage = {
        author: `${this.profile.firstName} ${this.profile.lastName}`,
        initials: createInitials(this.profile.firstName, this.profile.lastName),
        role: this.profile.role || 'Участник',
        color: 'linear-gradient(135deg,#059669,#1d4ed8)',
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        text: text,
      }
      if (!this.messagesByChannel[this.activeChannel]) {
        this.messagesByChannel[this.activeChannel] = []
      }
      this.messagesByChannel[this.activeChannel].push(newMessage)
      this.inputText = ''
    },

    selectChannel(channelId) {
      this.activeChannel = channelId;
      this.activeDm = null;
      
      // Загружаем сообщения если это команда
      if (channelId !== 'general' && channelId !== 'random') {
        this.loadTeamMessages(channelId)
      }
    },
    selectDm(dmName) {
      this.activeDm = dmName;
      this.activeChannel = null;
      this.clearDmUnread(dmName);
      this.$router.replace({ path: '/chat', query: { dm: this.getDmFullName(dmName) } });
    },
    getDmFullName(dmName) {
      const dm = this.dms.find((item) => item.name === dmName);
      return dm?.fullName || dmName;
    },
    clearDmUnread(dmName) {
      const dm = this.dms.find((item) => item.name === dmName);
      if (dm) dm.unread = 0;
    },
    ensureDmContact({ name, initials, color, role }) {
      const contact = buildDmFromMatch({ name, initials, color, role });
      const existing = this.dms.find(
          (dm) => dm.name === contact.name || dm.fullName === contact.fullName,
      );

      if (existing) {
        if (role) existing.role = role;
        return existing;
      }

      this.dms.unshift(contact);
      if (!this.messagesByDm[contact.name]) {
        this.messagesByDm[contact.name] = [
          {
            system: true,
            text: `Вы и ${contact.fullName} понравились друг другу — начните диалог`,
          },
        ];
      }
      return contact;
    },
    openDmFromRoute(query) {
      const fullName = decodeURIComponent(query.dm || '');
      if (!fullName) return;

      const color = query.color ? decodeURIComponent(query.color) : '';
      const contact = this.ensureDmContact({
        name: fullName,
        initials: query.initials || '',
        color,
        role: query.role || '',
      });

      this.activeDm = contact.name;
      this.activeChannel = null;
      this.clearDmUnread(contact.name);
      this.typingUser = contact.name;

      this.$nextTick(() => {
        const feed = this.$refs.feed;
        if (feed) feed.scrollTop = feed.scrollHeight;
      });
    },
    send() {
      this.sendTeamMessage();
    },

    // Legacy send для совместимости с DM и общими каналами
    sendLegacy() {
      if (!this.inputText.trim()) return;

      const message = {
        own: true,
        initials: this.ownInitials,
        time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
        text: this.inputText.trim(),
        code: this.codeMode,
      };

      if (this.activeDm) {
        if (!this.messagesByDm[this.activeDm]) {
          this.messagesByDm[this.activeDm] = [];
        }
        this.messagesByDm[this.activeDm].push(message);

        const dm = this.dms.find((item) => item.name === this.activeDm);
        if (dm) dm.preview = `Вы: ${message.text}`;
      } else if (this.activeChannel) {
        this.messagesByChannel[this.activeChannel].push(message);
      } else {
        return;
      }

      this.inputText = '';
      this.codeMode = false;
      this.currentIntent = null;
      this.showAutoComplete = false;

      this.$nextTick(() => {
        const feed = this.$refs.feed;
        if (feed) feed.scrollTop = feed.scrollHeight;
      });

      // Simulate response with AI suggestions
      setTimeout(async () => {
        const responseText = 'Спасибо за ответ! 🎉';
        const suggestions = await this.getAiSuggestions(responseText);

        const response = {
          author: this.activeDm || 'Участник',
          initials: this.activeDm?.substring(0, 2).toUpperCase() || 'П',
          role: 'Участник InUni',
          color: 'linear-gradient(135deg,#e63946,#1d4ed8)',
          time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
          text: responseText,
          showAiSuggestions: true,
          aiSuggestions: suggestions,
        };

        if (this.activeDm) {
          this.messagesByDm[this.activeDm].push(response);
        } else if (this.activeChannel) {
          this.messagesByChannel[this.activeChannel].push(response);
        }

        this.$nextTick(() => {
          const feed = this.$refs.feed;
          if (feed) feed.scrollTop = feed.scrollHeight;
        });
      }, 800);
    },
    onType() {
      // AI input analysis
      this.onMessageInput();

      // simulate someone else typing response
      if (!this.someoneTyping && this.inputText.length > 3) {
        clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => {
          this.someoneTyping = true;
          setTimeout(() => { this.someoneTyping = false; }, 2000);
        }, 800);
      }
    },
    toggleReaction(msg, r) {
      r.mine = !r.mine;
      r.count += r.mine ? 1 : -1;
    },
    startDm(m) {
      this.$router.push({
        path: '/chat',
        query: {
          dm: m.fullName || m.name,
          initials: m.initials,
          color: encodeURIComponent(m.color || ''),
          role: m.role || '',
        },
      });
    },

    // ==================== AI FUNCTIONS ====================

    /**
     * Определить интент сообщения (team_invitation, greeting, etc.)
     */
    detectMessageIntent(text) {
      const intents = {
        'team_invitation': ['приглашу', 'присоединяйся', 'нужен', 'ищу', 'ищу команду', 'в команду'],
        'greeting': ['привет', 'hi', 'hey', 'здравствуй'],
        'knowledge_sharing': ['как', 'помоги', 'подскажи', 'советует', 'вопрос'],
      }

      for (const [intent, keywords] of Object.entries(intents)) {
        for (const keyword of keywords) {
          if (text.toLowerCase().includes(keyword)) {
            return intent
          }
        }
      }
      return 'general'
    },

    /**
     * Получить эмодзи для интента
     */
    getIntentEmoji(intent) {
      const emojis = {
        'team_invitation': '🔥',
        'greeting': '👋',
        'knowledge_sharing': '💡',
      }
      return emojis[intent] || '📝'
    },

    /**
     * Получить подпись для интента
     */
    getIntentLabel(intent) {
      const labels = {
        'team_invitation': 'Приглашение в команду',
        'greeting': 'Приветствие',
        'knowledge_sharing': 'Запрос совета',
      }
      return labels[intent] || ''
    },

    /**
     * Обработать ввод текста - detect intent и autocomplete
     */
    async onMessageInput() {
      // Определяем интент
      this.currentIntent = this.detectMessageIntent(this.inputText)

      // Auto-complete suggestions
      if (this.inputText.length < 2) {
        this.showAutoComplete = false
        return
      }

      const lastWord = this.inputText.split(' ').pop().toLowerCase()

      const suggestions = {
        'ищ': ['ищу команду', 'ищу партнера'],
        'хот': ['хотел бы', 'хотела бы', 'хотим'],
        'прив': ['привет', 'приветствую'],
        'спа': ['спасибо', 'спасибо за помощь'],
        'кто': ['кто то кто нибудь'],
      }

      for (const [key, values] of Object.entries(suggestions)) {
        if (key.startsWith(lastWord)) {
          this.autocompleteSuggestions = values
          this.showAutoComplete = true
          return
        }
      }

      this.showAutoComplete = false
    },

    /**
     * Вставить AI предложение как ответ
     */
    insertAiSuggestion(suggestion) {
      this.inputText = suggestion
      this.$nextTick(() => {
        this.$refs.input?.focus()
      })
    },

    /**
     * Получить AI suggestions для сообщения
     * (Mock для демонстрации - в реальной проекте вызов к backend)
     */
    async getAiSuggestions(messageText) {
      const intent = this.detectMessageIntent(messageText)

      // Mock suggestions (в реальном проекте - вызов /api/ai/chat/suggestions)
      const suggestionsByIntent = {
        'team_invitation': [
          '✨ Спасибо за приглашение! Когда можем обсудить?',
          '🔥 Звучит интересно! Какой стек вы используете?',
          '💪 Я в деле! Расскажи подробнее!'
        ],
        'greeting': [
          'Привет! 👋 Как дела?',
          'Хей! Рад тебя видеть! 🙌',
          'Привет! Чем я могу помочь?'
        ],
        'knowledge_sharing': [
          'Отличный вопрос! Вот что я думаю...',
          'Интересный момент! Давай обсудим подробнее',
          'Согласен! Это действительно важно'
        ],
      }

      return suggestionsByIntent[intent] || [
        'Согласен с тобой 👍',
        'Интересная идея!',
        'Спасибо за информацию!'
      ]
    },
    /**
     * Единый AI ассистент — советник + рекрутер
     */
    async sendToAi() {
      if (!this.aiInput.trim() || this.aiLoading) return;
      const userMsg = this.aiInput.trim();
      this.aiMessages.push({ role: 'user', content: userMsg });
      this.aiInput = '';
      this.aiLoading = true;

      await this.$nextTick();
      const feed = this.$refs.aiFeed;
      if (feed) feed.scrollTop = feed.scrollHeight;

      const CANDIDATES = [
        { name: 'Искендер А.', initials: 'ИА', role: 'Backend Dev', skills: 'Python, Node.js, PostgreSQL, Docker', color: 'linear-gradient(135deg,#e63946,#1d4ed8)', about: '3 года опыта, участник 5+ хакатонов' },
        { name: 'Айгерим М.', initials: 'АМ', role: 'UI/UX Designer', skills: 'Figma, Adobe XD, Framer, Tailwind', color: 'linear-gradient(135deg,#7c3aed,#e63946)', about: 'Дизайнер продуктов, портфолио 12+ проектов' },
        { name: 'Данияр С.', initials: 'ДС', role: 'ML Engineer', skills: 'Python, TensorFlow, PyTorch, OpenCV', color: 'linear-gradient(135deg,#1d4ed8,#06b6d4)', about: 'ML-инженер, специализация HealthTech и CV' },
        { name: 'Зарина К.', initials: 'ЗК', role: 'Product Manager', skills: 'Agile, Jira, аналитика, roadmap', color: 'linear-gradient(135deg,#f97316,#e63946)', about: 'PM с опытом в стартапах, 2 успешных запуска' },
        { name: 'Максат Б.', initials: 'МБ', role: 'Frontend Dev', skills: 'Vue 3, React, TypeScript, Tailwind', color: 'linear-gradient(135deg,#059669,#1d4ed8)', about: 'Frontend разработчик, 2 года опыта' },
        { name: 'Ренат М.', initials: 'РМ', role: 'DevOps Engineer', skills: 'Kubernetes, Docker, CI/CD, AWS', color: 'linear-gradient(135deg,#059669,#06b6d4)', about: 'DevOps, автоматизация и облачная инфраструктура' },
        { name: 'Назгуль О.', initials: 'НО', role: 'Mobile Developer', skills: 'Flutter, React Native, iOS, Android', color: 'linear-gradient(135deg,#e63946,#f97316)', about: 'Мобильный разработчик, 3 приложения в Store' },
      ];

      const systemPrompt = `Ты AI-ассистент платформы InUni — студенческой сети для поиска команд, хакатонов и проектов в Кыргызстане.

У тебя две роли в одном:
1. РЕКРУТЕР: если пользователь ищет людей в команду — подбери подходящих из базы участников и верни JSON
2. АССИСТЕНТ: во всех остальных случаях — помоги написать сообщение, дай совет, улучши текст

База участников: ${JSON.stringify(CANDIDATES)}

ВАЖНО: если запрос про поиск людей/кандидатов/участников в команду — верни СТРОГО в таком формате (только JSON, без лишнего текста до/после):
CANDIDATES_JSON:[{"name":"...","initials":"...","role":"...","skills":"...","color":"...","about":"...","match":95,"reason":"почему подходит"}]

В остальных случаях — отвечай обычным текстом по-русски, кратко и дружелюбно.
Текущее сообщение пользователя в чате: "${this.inputText || '(пусто)'}"`;

      try {
        const historyForApi = this.aiMessages
            .filter(m => !m.candidates)
            .map(m => ({ role: m.role, content: m.content || m.text || '' }));

        const apiKey = import.meta.env.VITE_GROQ_API_KEY
        if (!apiKey) {
          throw new Error('AI API key not configured')
        }
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              ...historyForApi,
            ],
            max_tokens: 800,
            temperature: 0.4,
          }),
        });
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content || '';

        if (reply.includes('CANDIDATES_JSON:')) {
          try {
            const jsonStr = reply.split('CANDIDATES_JSON:')[1].trim();
            const candidates = JSON.parse(jsonStr);
            this.aiMessages.push({
              role: 'assistant',
              text: `Нашёл ${candidates.length} подходящих кандидата:`,
              candidates,
            });
          } catch {
            this.aiMessages.push({ role: 'assistant', content: reply.replace('CANDIDATES_JSON:', '') });
          }
        } else {
          this.aiMessages.push({ role: 'assistant', content: reply });
        }
      } catch (e) {
        this.aiMessages.push({ role: 'assistant', content: '⚠️ Ошибка соединения. Попробуй снова.' });
      } finally {
        this.aiLoading = false;
        await this.$nextTick();
        const feed = this.$refs.aiFeed;
        if (feed) feed.scrollTop = feed.scrollHeight;
      }
    },

    aiQuick(prompt) {
      this.aiInput = prompt;
      this.sendToAi();
    },

    // ==================== GROUP METHODS ====================
    openCreateGroup() {
      this.showCreateGroup = true;
      this.newGroupName = '';
      this.selectedMembers = [];
    },
    toggleMember(member) {
      const idx = this.selectedMembers.findIndex(m => m.name === member.name);
      if (idx >= 0) {
        this.selectedMembers.splice(idx, 1);
      } else {
        this.selectedMembers.push(member);
      }
    },
    isMemberSelected(member) {
      return this.selectedMembers.some(m => m.name === member.name);
    },
    createGroup() {
      if (!this.newGroupName.trim() || this.selectedMembers.length === 0) return;
      const id = 'group-' + Date.now();
      const group = {
        id,
        name: this.newGroupName.trim(),
        members: [...this.selectedMembers],
      };
      this.groups.push(group);
      this.messagesByChannel[id] = [
        { system: true, text: `Группа "${group.name}" создана. Участники: ${group.members.map(m => m.name).join(', ')}` },
      ];
      this.showCreateGroup = false;
      this.selectChannel(id);
    },
  },
  async mounted() {
    this.syncProfile = () => {
      this.profile = loadAppState().profile
    }
    window.addEventListener('inuni-state-changed', this.syncProfile)
    
    // Загружаем локальные команды
    await this.loadUserTeams()

    if (this.$route.query.dm) {
      this.openDmFromRoute(this.$route.query);
    }

    this.$nextTick(() => {
      const feed = this.$refs.feed;
      if (feed) feed.scrollTop = feed.scrollHeight;
    });
  },
  beforeUnmount() {
    window.removeEventListener('inuni-state-changed', this.syncProfile)
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;800;900&family=Onest:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

:deep(.main-content) {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.chat-page {
  --c-text: #dde3f0;
  --c-white: #f0f4ff;
  --c-muted: #7a8aaa;
  --c-bg: #0c1220;
  --c-bg2: #111827;
  --c-border: rgba(255,255,255,0.1);
  --c-red: #e63946;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  min-width: 0;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.page-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%); }
.blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12; }
.blob-1 { width: 400px; height: 400px; background: #e63946; top: -100px; right: 200px; animation: bf 8s ease-in-out infinite; }
.blob-2 { width: 350px; height: 350px; background: #1d4ed8; bottom: 50px; left: 100px; animation: bf 11s ease-in-out infinite reverse; }
@keyframes bf { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-20px) scale(1.06)} }

/* CHAT LAYOUT */
.chat-layout {
  display: flex;
  flex: 1;
  position: relative;
  z-index: 1;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
  height: 100%;
}

/* CHANNELS PANEL */
.channels-panel {
  width: 290px;
  flex-shrink: 0;
  background: rgba(12, 18, 36, 0.96);
  border-right: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 18px 0 16px 16px;
  min-width: 0;
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.02);
}
.channels-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 14px 14px 20px;
  border-bottom: 1px solid var(--c-border);
  margin-bottom: 10px;
  min-width: 0;
}
.ch-title {
  font-family: 'Unbounded', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: var(--c-white);
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}
.online-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #86efac;
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.18);
  padding: 3px 8px;
  border-radius: 100px;
  flex-shrink: 0;
  white-space: nowrap;
}
.online-dot { width: 6px; height: 6px; background: #4ade80; border-radius: 50%; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

.channels-section { padding: 0 8px 16px 14px; }
.channels-section-label { font-size: 10px; font-weight: 700; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.12em; padding: 0 8px 8px 6px; }

.channel-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 11px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease;
  border: 1px solid transparent;
  margin: 0 6px 2px;
}
.channel-item:hover { background: rgba(255, 255, 255, 0.045); }
.channel-item.active {
  background: linear-gradient(90deg, rgba(230, 57, 70, 0.16), rgba(230, 57, 70, 0.06));
  border-color: rgba(230, 57, 70, 0.22);
}
.ch-icon {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.04);
  color: var(--c-muted);
}
.channel-item.active .ch-icon {
  background: rgba(230, 57, 70, 0.18);
  color: #f4a3a9;
}
.ch-name { font-size: 14px; font-weight: 500; color: var(--c-muted); flex: 1; }
.channel-item.active .ch-name { color: var(--c-white); font-weight: 600; }
.ch-unread {
  background: var(--c-red);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px;
  text-align: center;
  padding: 2px 6px;
  border-radius: 100px;
  box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.15);
}

.dm-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 11px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease;
  border: 1px solid transparent;
  margin: 0 6px 2px;
  min-width: 0;
  overflow: hidden;
}
.dm-item:hover { background: rgba(255, 255, 255, 0.045); }
.dm-item.active {
  background: linear-gradient(90deg, rgba(230, 57, 70, 0.16), rgba(230, 57, 70, 0.06));
  border-color: rgba(230, 57, 70, 0.22);
}
.dm-avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  font-family: 'Unbounded', sans-serif;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22);
}
.dm-info { flex: 1; min-width: 0; overflow: hidden; }
.dm-name { font-size: 13px; font-weight: 600; color: var(--c-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.dm-preview { font-size: 11px; color: var(--c-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

/* CHAT AREA */
.chat-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
.chat-header {
  padding: 14px 22px;
  border-bottom: 1px solid var(--c-border);
  background: rgba(8, 12, 26, 0.82);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
.chat-title-block { display: flex; align-items: center; gap: 12px; }
.chat-title-block > div { min-width: 0; }
.chat-channel-icon { font-size: 20px; }
.chat-channel-name { font-family: 'Unbounded',sans-serif; font-size: 15px; font-weight: 700; color: var(--c-white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chat-channel-sub { font-size: 12px; color: var(--c-muted); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chat-header-actions { display: flex; gap: 4px; }
.icon-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--c-border); background: transparent; cursor: pointer; font-size: 16px; display: grid; place-items: center; transition: all 0.2s; }
.icon-btn:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); }

/* MESSAGES */
.messages-feed {
  flex: 1;
  overflow-y: auto;
  padding: 18px 22px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  scroll-behavior: smooth;
}
.messages-feed::-webkit-scrollbar { width: 4px; }
.messages-feed::-webkit-scrollbar-track { background: transparent; }
.messages-feed::-webkit-scrollbar-thumb { background: var(--c-border); border-radius: 2px; }

.messages-date-divider {
  text-align: center; font-size: 11px; color: var(--c-muted); font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.1em;
  padding: 8px 0 16px; position: relative;
}
.messages-date-divider::before, .messages-date-divider::after {
  content: ''; position: absolute; top: 50%; height: 1px; background: var(--c-border); width: 35%;
}
.messages-date-divider::before { left: 0; }
.messages-date-divider::after { right: 0; }

.sys-msg { text-align: center; font-size: 12px; color: var(--c-muted); padding: 4px 0 8px; }

.message { display: flex; gap: 10px; padding: 2px 0; }
.message--continued { padding-top: 1px; }

.msg-avatar-col { width: 36px; flex-shrink: 0; padding-top: 2px; }
.msg-avatar { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; font-family: 'Unbounded',sans-serif; font-size: 11px; font-weight: 700; color: #fff; }
.msg-avatar-spacer { width: 36px; height: 36px; }

.msg-body { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.msg-body--own { align-items: flex-end; }

.msg-meta { display: flex; align-items: baseline; gap: 8px; }
.msg-author { font-size: 13px; font-weight: 700; color: var(--c-white); }
.msg-role { font-size: 11px; color: var(--c-muted); background: rgba(255,255,255,0.05); padding: 1px 7px; border-radius: 4px; }
.msg-time { font-size: 11px; color: var(--c-muted); }

.msg-bubble {
  max-width: min(560px, 78%);
  padding: 11px 14px;
  border-radius: 14px 14px 14px 6px;
  background: rgba(19, 26, 48, 0.95);
  border: 1px solid var(--c-border);
  font-size: 14px;
  line-height: 1.58;
  color: var(--c-text);
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
}
.msg-bubble--own {
  background: linear-gradient(135deg, rgba(230, 57, 70, 0.2), rgba(230, 57, 70, 0.08));
  border-color: rgba(230, 57, 70, 0.28);
  border-radius: 14px 14px 6px 14px;
  color: var(--c-text);
}
.msg-bubble--code { background: #0d1117; border-color: rgba(255,255,255,0.1); padding: 14px 16px; }

.code-block {
  font-family: 'JetBrains Mono', monospace; font-size: 13px;
  color: #e2e8f0; margin: 0; white-space: pre-wrap; word-break: break-all;
}

.msg-time-own { display: block; font-size: 10px; color: rgba(248,113,113,0.6); text-align: right; margin-top: 4px; }

.msg-reactions { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; }
.reaction {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; padding: 2px 8px; border-radius: 100px;
  background: rgba(255,255,255,0.05); border: 1px solid var(--c-border);
  cursor: pointer; transition: all 0.15s;
}
.reaction:hover { background: rgba(255,255,255,0.08); }
.reaction.reacted { background: rgba(230,57,70,0.12); border-color: rgba(230,57,70,0.3); color: #f87171; }

/* AI SUGGESTIONS */
.ai-suggestions-box {
  margin-top: 10px;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ai-label {
  font-size: 11px;
  color: #f87171;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ai-suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ai-suggestion-btn {
  background: rgba(230, 57, 70, 0.08);
  border: 1px solid rgba(230, 57, 70, 0.22);
  color: #f4a3a9;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-family: 'Onest', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  line-height: 1.4;
}

.ai-suggestion-btn:hover {
  background: rgba(230, 57, 70, 0.15);
  border-color: rgba(230, 57, 70, 0.35);
  color: #f87171;
  transform: translateX(2px);
}

/* INTENT INDICATOR */
.intent-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #f4a3a9;
  margin-bottom: 8px;
  padding: 6px 10px;
  background: rgba(230, 57, 70, 0.08);
  border: 1px solid rgba(230, 57, 70, 0.2);
  border-radius: 6px;
  width: fit-content;
  font-weight: 500;
}

.intent-emoji {
  font-size: 13px;
}

.intent-label {
  letter-spacing: 0.02em;
}

/* AUTOCOMPLETE MENU */
.autocomplete-menu {
  position: absolute;
  bottom: 70px;
  left: 24px;
  right: 24px;
  background: rgba(19, 26, 48, 0.95);
  border: 1px solid rgba(230, 57, 70, 0.2);
  border-radius: 10px;
  overflow: hidden;
  z-index: 100;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
}

.autocomplete-item {
  width: 100%;
  text-align: left;
  padding: 10px 14px;
  background: none;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: var(--c-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Onest', sans-serif;
}

.autocomplete-item:last-child {
  border-bottom: none;
}

.autocomplete-item:hover {
  background: rgba(230, 57, 70, 0.1);
  color: #f87171;
  padding-left: 16px;
}

/* TYPING */
.typing-indicator { display: flex; align-items: center; gap: 8px; padding: 8px 0; }
.typing-dots { display: flex; gap: 3px; }
.typing-dots span { width: 6px; height: 6px; background: var(--c-muted); border-radius: 50%; animation: typingBounce 1.2s ease-in-out infinite; }
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typingBounce { 0%,80%,100%{transform:scale(0.8);opacity:0.5} 40%{transform:scale(1.1);opacity:1} }
.typing-text { font-size: 12px; color: var(--c-muted); font-style: italic; }

/* INPUT */
.chat-input-area {
  padding: 16px 24px; border-top: 1px solid var(--c-border);
  background: rgba(8,12,26,0.7); backdrop-filter: blur(12px); flex-shrink: 0;
}
.input-toolbar { display: flex; gap: 4px; margin-bottom: 10px; }
.toolbar-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--c-border); background: transparent; cursor: pointer; font-size: 15px; display: grid; place-items: center; transition: all 0.2s; color: var(--c-muted); }
.toolbar-btn:hover { background: rgba(255,255,255,0.05); color: var(--c-text); }
.toolbar-btn.active { background: var(--c-red-dim); border-color: rgba(230,57,70,0.3); color: var(--c-red); }

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  background: rgba(19, 26, 48, 0.92);
  border: 1.5px solid var(--c-border);
  border-radius: 14px;
  padding: 10px 10px 10px 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.input-wrapper:focus-within {
  border-color: rgba(230, 57, 70, 0.45);
  box-shadow: 0 0 0 4px rgba(230, 57, 70, 0.08);
}
.input-code { border-color: rgba(59,130,246,0.3) !important; background: #0d1117; }
.input-wrapper textarea {
  flex: 1; background: none; border: none; outline: none; resize: none;
  font-family: 'Onest', sans-serif; font-size: 14px; color: var(--c-text);
  max-height: 120px; overflow-y: auto; line-height: 1.5;
}
.input-code textarea { font-family: 'JetBrains Mono', monospace; font-size: 13px; }
.input-wrapper textarea::placeholder { color: var(--c-muted); }

.send-btn {
  width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0;
  background: var(--c-red); border: none; cursor: pointer;
  font-size: 18px; color: #fff; display: grid; place-items: center;
  transition: all 0.2s;
}
.send-btn:hover:not(:disabled) { background: #c62d39; }
.send-btn:disabled { background: rgba(255,255,255,0.06); color: var(--c-muted); cursor: not-allowed; }

.input-hint { font-size: 11px; color: var(--c-muted); margin-top: 6px; }

/* MEMBERS PANEL */
.members-panel {
  width: 220px; flex-shrink: 0; background: rgba(15,22,41,0.8);
  border-left: 1px solid var(--c-border); padding: 20px 12px; overflow-y: auto;
  min-width: 0;
}
.mp-header { font-family: 'Unbounded',sans-serif; font-size: 12px; font-weight: 700; color: var(--c-white); margin-bottom: 16px; padding: 0 4px; }
.mp-section-label { font-size: 10px; font-weight: 700; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; padding: 0 4px; }
.members-list { display: flex; flex-direction: column; gap: 4px; }
.member-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 8px; transition: background 0.15s; }
.member-item:hover { background: rgba(255,255,255,0.04); }
.member-item.offline { opacity: 0.5; }
.member-avatar { width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0; display: grid; place-items: center; font-family: 'Unbounded',sans-serif; font-size: 9px; font-weight: 700; color: #fff; }
.member-info { flex: 1; min-width: 0; }
.member-name { font-size: 12px; font-weight: 600; color: var(--c-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.member-role { font-size: 10px; color: var(--c-muted); }
.member-dm { width: 26px; height: 26px; border-radius: 6px; border: 1px solid var(--c-border); background: transparent; cursor: pointer; font-size: 12px; display: grid; place-items: center; opacity: 0; transition: all 0.15s; }
.member-item:hover .member-dm { opacity: 1; }
.member-dm:hover { background: var(--c-red-dim); border-color: rgba(230,57,70,0.3); }

@media (max-width: 1280px) {
  .channels-panel {
    width: 240px;
  }

  .members-panel {
    display: none;
  }
}

@media (max-width: 980px) {
  .chat-layout {
    flex-direction: column;
    min-height: auto;
  }

  .channels-panel {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--c-border);
    padding: 16px 0 10px;
    max-height: 290px;
  }

  .chat-header,
  .messages-feed,
  .chat-input-area {
    padding-left: 18px;
    padding-right: 18px;
  }

  .msg-bubble {
    max-width: min(100%, 620px);
  }
}

@media (max-width: 760px) {
  .channels-header,
  .chat-header {
    padding-left: 14px;
    padding-right: 14px;
  }

  .messages-feed,
  .chat-input-area {
    padding-left: 14px;
    padding-right: 14px;
  }

  .chat-header {
    gap: 12px;
  }

  .chat-channel-name {
    font-size: 14px;
  }

  .chat-channel-sub {
    font-size: 11px;
  }

  .messages-date-divider::before,
  .messages-date-divider::after {
    width: 26%;
  }

  .message {
    gap: 8px;
  }

  .msg-avatar-col,
  .msg-avatar,
  .msg-avatar-spacer {
    width: 30px;
  }

  .msg-avatar,
  .msg-avatar-spacer {
    height: 30px;
  }

  .msg-bubble {
    max-width: 100%;
    font-size: 13px;
    padding: 9px 12px;
  }

  .input-toolbar {
    flex-wrap: wrap;
  }

  .input-wrapper {
    padding: 8px;
  }
}

/* ===== AI ASSISTANT PANEL ===== */
.ai-assistant-panel {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 320px;
  background: rgba(10, 14, 30, 0.97);
  border-left: 1px solid rgba(124, 58, 237, 0.25);
  display: flex;
  flex-direction: column;
  z-index: 50;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  box-shadow: -8px 0 32px rgba(0,0,0,0.4);
}
.ai-assistant-panel.ai-panel-open {
  transform: translateX(0);
}

.ai-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(124, 58, 237, 0.2);
  background: rgba(124, 58, 237, 0.08);
  flex-shrink: 0;
}
.ai-panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Unbounded', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #c4b5fd;
  letter-spacing: 0.02em;
}
.ai-panel-sub {
  font-size: 10px;
  font-weight: 400;
  color: #7c5fc4;
  font-family: 'Onest', sans-serif;
  letter-spacing: 0.01em;
  margin-top: 1px;
}
.ai-panel-icon { font-size: 18px; }
.ai-panel-close {
  width: 28px; height: 28px; border-radius: 6px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  color: var(--c-muted); cursor: pointer; font-size: 12px;
  display: grid; place-items: center; transition: all 0.2s;
}
.ai-panel-close:hover { background: rgba(230,57,70,0.15); color: #f87171; }

.ai-panel-context {
  margin: 10px 12px 0;
  padding: 8px 10px;
  background: rgba(124,58,237,0.08);
  border: 1px solid rgba(124,58,237,0.18);
  border-radius: 8px;
  flex-shrink: 0;
}
.ai-ctx-label { font-size: 9px; font-weight: 700; color: #a78bfa; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 3px; }
.ai-ctx-text { font-size: 12px; color: var(--c-text); line-height: 1.4; max-height: 48px; overflow: hidden; text-overflow: ellipsis; }

.ai-chat-feed {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ai-chat-feed::-webkit-scrollbar { width: 3px; }
.ai-chat-feed::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 2px; }

.ai-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; flex: 1; text-align: center;
  font-size: 12px; color: var(--c-muted); padding: 24px 16px;
}
.ai-empty-icon { font-size: 36px; margin-bottom: 4px; }
.ai-empty-title { font-size: 13px; font-weight: 700; color: #c4b5fd; font-family: 'Unbounded', sans-serif; }
.ai-empty-desc { font-size: 12px; color: var(--c-muted); line-height: 1.5; }

.ai-msg { display: flex; }
.ai-msg-own { justify-content: flex-end; }
.ai-msg-bubble {
  max-width: 85%;
  padding: 9px 12px;
  background: rgba(19,26,48,0.95);
  border: 1px solid var(--c-border);
  border-radius: 12px 12px 12px 4px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--c-text);
  white-space: pre-wrap;
}
.ai-msg-own .ai-msg-bubble {
  background: rgba(124,58,237,0.15);
  border-color: rgba(124,58,237,0.3);
  border-radius: 12px 12px 4px 12px;
  color: #ddd6fe;
}
.ai-msg-text { margin-bottom: 10px; font-size: 13px; line-height: 1.5; }
.ai-msg-bubble .candidates-grid { margin-top: 0; }
.ai-msg-bubble .candidate-card { background: rgba(10,14,30,0.8); }
.ai-msg-loading {
  display: flex; gap: 4px; align-items: center; padding: 12px 16px;
}
.ai-msg-loading span {
  width: 6px; height: 6px; background: #a78bfa; border-radius: 50%;
  animation: typingBounce 1.2s ease-in-out infinite;
}
.ai-msg-loading span:nth-child(2) { animation-delay: 0.2s; }
.ai-msg-loading span:nth-child(3) { animation-delay: 0.4s; }

.ai-panel-input {
  padding: 10px 12px;
  border-top: 1px solid rgba(124,58,237,0.15);
  display: flex;
  gap: 8px;
  align-items: flex-end;
  flex-shrink: 0;
}
.ai-panel-input textarea {
  flex: 1;
  background: rgba(19,26,48,0.9);
  border: 1.5px solid rgba(124,58,237,0.25);
  border-radius: 10px;
  padding: 8px 10px;
  color: var(--c-text);
  font-family: 'Onest', sans-serif;
  font-size: 13px;
  resize: none;
  outline: none;
  line-height: 1.4;
}
.ai-panel-input textarea:focus { border-color: rgba(124,58,237,0.5); }
.ai-panel-input textarea::placeholder { color: var(--c-muted); }
.ai-send-btn {
  width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0;
  background: linear-gradient(135deg,#7c3aed,#6d28d9);
  border: none; cursor: pointer; color: #fff; font-size: 14px;
  display: grid; place-items: center; transition: all 0.2s;
}
.ai-send-btn:hover:not(:disabled) { background: #6d28d9; transform: scale(1.05); }
.ai-send-btn:disabled { background: rgba(255,255,255,0.06); color: var(--c-muted); cursor: not-allowed; }

.ai-quick-btns {
  display: flex; flex-wrap: wrap; gap: 5px;
  padding: 8px 12px 12px; flex-shrink: 0;
}
.ai-quick {
  font-size: 11px; padding: 5px 10px; border-radius: 100px;
  background: rgba(124,58,237,0.1);
  border: 1px solid rgba(124,58,237,0.22);
  color: #c4b5fd; cursor: pointer; transition: all 0.2s;
  font-family: 'Onest', sans-serif;
}
.ai-quick:hover { background: rgba(124,58,237,0.2); color: #ddd6fe; }

/* AI TOGGLE BUTTON */
.ai-toggle-btn {
  position: absolute;
  right: 16px;
  bottom: 90px;
  width: 44px; height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg,#7c3aed,#6d28d9);
  border: none; cursor: pointer;
  font-size: 18px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;
  z-index: 60;
  box-shadow: 0 8px 24px rgba(124,58,237,0.4);
  transition: all 0.2s;
}
.ai-toggle-btn:hover { transform: scale(1.08); box-shadow: 0 10px 28px rgba(124,58,237,0.5); }
.ai-toggle-btn.active { background: linear-gradient(135deg,#e63946,#c62d39); }
.ai-toggle-label { font-size: 8px; font-family: 'Unbounded',sans-serif; font-weight: 700; color: #fff; line-height: 1; }

/* ===== CANDIDATE CARDS ===== */
.candidates-grid {
  display: flex; flex-direction: column; gap: 10px;
  margin-top: 10px;
}
.candidate-card {
  background: rgba(19,26,48,0.95);
  border: 1px solid rgba(124,58,237,0.2);
  border-radius: 12px;
  padding: 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.candidate-card:hover {
  border-color: rgba(124,58,237,0.4);
  box-shadow: 0 4px 16px rgba(124,58,237,0.15);
}
.cand-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.cand-avatar {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  display: grid; place-items: center;
  font-family: 'Unbounded',sans-serif; font-size: 10px; font-weight: 700; color: #fff;
}
.cand-info { flex: 1; }
.cand-name { font-size: 13px; font-weight: 700; color: var(--c-white); }
.cand-role { font-size: 11px; color: var(--c-muted); }
.cand-match {
  font-size: 12px; font-weight: 800; color: #a78bfa;
  font-family: 'Unbounded',sans-serif;
}
.cand-match.match-high { color: #4ade80; }
.cand-about { font-size: 12px; color: var(--c-muted); margin-bottom: 5px; }
.cand-skills {
  font-size: 11px; color: #93c5fd;
  background: rgba(29,78,216,0.1);
  border: 1px solid rgba(29,78,216,0.2);
  border-radius: 6px; padding: 4px 8px; margin-bottom: 6px;
}
.cand-reason { font-size: 11px; color: #fbbf24; margin-bottom: 8px; }
.cand-dm-btn {
  width: 100%; padding: 7px 0;
  background: rgba(124,58,237,0.12);
  border: 1px solid rgba(124,58,237,0.28);
  border-radius: 8px;
  color: #c4b5fd; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
  font-family: 'Onest', sans-serif;
}
.cand-dm-btn:hover {
  background: rgba(124,58,237,0.22);
  border-color: rgba(124,58,237,0.4);
  color: #ddd6fe;
}

/* ===== GROUPS ===== */
.channels-section-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 8px;
}
.channels-section-label-row .channels-section-label {
  padding: 0;
}
.create-group-btn {
  width: 20px; height: 20px; border-radius: 6px;
  background: rgba(230,57,70,0.15);
  border: 1px solid rgba(230,57,70,0.3);
  color: #f87171; font-size: 16px; line-height: 1;
  display: grid; place-items: center;
  cursor: pointer; transition: all 0.2s;
  flex-shrink: 0;
}
.create-group-btn:hover {
  background: rgba(230,57,70,0.25);
  border-color: rgba(230,57,70,0.5);
  transform: scale(1.1);
}
.no-groups-hint {
  font-size: 11px; color: var(--c-muted);
  padding: 6px 14px 10px;
  font-style: italic;
}
.channel-item--group .ch-icon--group {
  width: 22px; height: 22px; border-radius: 7px;
  background: linear-gradient(135deg, rgba(230,57,70,0.3), rgba(29,78,216,0.3));
  border: 1px solid rgba(230,57,70,0.2);
  display: grid; place-items: center;
  font-size: 10px; font-weight: 800;
  color: #f4a3a9;
  font-family: 'Unbounded', sans-serif;
}
.group-members-count {
  font-size: 10px; color: var(--c-muted);
  background: rgba(255,255,255,0.06);
  border-radius: 100px; padding: 1px 6px;
  border: 1px solid var(--c-border);
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(5,10,24,0.55);
  backdrop-filter: blur(14px);
  z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.modal-box {
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(32px);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 24px;
  width: 100%; max-width: 480px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12);
  display: flex; flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 24px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.09);
}
.modal-title {
  font-family: 'Unbounded', sans-serif;
  font-size: 15px; font-weight: 800;
  color: #ffffff;
  text-shadow: 0 1px 8px rgba(0,0,0,0.3);
}
.modal-close {
  width: 30px; height: 30px; border-radius: 8px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.6); cursor: pointer; font-size: 12px;
  display: grid; place-items: center; transition: all 0.2s;
}
.modal-close:hover { background: rgba(230,57,70,0.25); color: #fff; border-color: rgba(230,57,70,0.4); }

.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 18px;
  flex: 1;
}
.modal-field { display: flex; flex-direction: column; gap: 8px; }
.modal-label {
  font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.5);
  text-transform: uppercase; letter-spacing: 0.1em;
}
.modal-input {
  background: rgba(255,255,255,0.08);
  border: 1.5px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 11px 14px;
  color: #fff;
  font-family: 'Onest', sans-serif;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
}
.modal-input:focus {
  border-color: rgba(230,57,70,0.55);
  background: rgba(255,255,255,0.11);
}
.modal-input::placeholder { color: rgba(255,255,255,0.3); }

.members-picker {
  display: flex; flex-direction: column; gap: 3px;
  max-height: 260px; overflow-y: auto;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  padding: 6px;
  background: rgba(255,255,255,0.03);
}
.members-picker::-webkit-scrollbar { width: 3px; }
.members-picker::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }

.member-pick-item {
  display: flex; align-items: center; gap: 11px;
  padding: 9px 11px; border-radius: 10px;
  cursor: pointer; transition: all 0.15s;
  border: 1px solid transparent;
}
.member-pick-item:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.08);
}
.member-pick-item.selected {
  background: rgba(230,57,70,0.14);
  border-color: rgba(230,57,70,0.3);
}
.pick-avatar {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  display: grid; place-items: center;
  font-family: 'Unbounded', sans-serif; font-size: 10px; font-weight: 700; color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.pick-info { flex: 1; }
.pick-name { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.92); }
.pick-role { font-size: 11px; color: rgba(255,255,255,0.42); margin-top: 1px; }
.pick-check {
  width: 22px; height: 22px; border-radius: 6px;
  border: 1.5px solid rgba(255,255,255,0.18);
  display: grid; place-items: center;
  font-size: 12px; color: rgba(255,255,255,0.35);
  transition: all 0.15s; flex-shrink: 0;
  background: rgba(255,255,255,0.04);
}
.member-pick-item.selected .pick-check {
  background: #e63946;
  border-color: #e63946;
  color: #fff;
  box-shadow: 0 2px 8px rgba(230,57,70,0.4);
}

.selected-summary {
  display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
}
.sel-label { font-size: 11px; color: rgba(255,255,255,0.4); }
.sel-chip {
  font-size: 11px; padding: 3px 10px; border-radius: 100px;
  background: rgba(230,57,70,0.18);
  border: 1px solid rgba(230,57,70,0.32);
  color: #fca5a5; font-weight: 600;
}

.modal-footer {
  display: flex; gap: 10px;
  padding: 16px 24px 20px;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.modal-cancel {
  flex: 1; padding: 11px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.13);
  border-radius: 12px;
  color: rgba(255,255,255,0.55); font-size: 13px;
  cursor: pointer; transition: all 0.2s;
  font-family: 'Onest', sans-serif;
}
.modal-cancel:hover { background: rgba(255,255,255,0.11); color: rgba(255,255,255,0.8); }
.modal-create {
  flex: 2; padding: 11px;
  background: linear-gradient(135deg, #e63946 0%, #c62d39 100%);
  border: none; border-radius: 12px;
  color: #fff; font-size: 13px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  font-family: 'Onest', sans-serif;
  box-shadow: 0 4px 20px rgba(230,57,70,0.45), inset 0 1px 0 rgba(255,255,255,0.15);
  letter-spacing: 0.01em;
}
.modal-create:hover:not(:disabled) {
  background: linear-gradient(135deg, #f04452 0%, #d63040 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(230,57,70,0.55);
}
.modal-create:disabled { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.25); cursor: not-allowed; box-shadow: none; transform: none; }
</style>