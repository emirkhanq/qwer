<template>
  <div class="profile-ai-card">
    <!-- Header -->
    <div class="ai-card-header">
      <div class="ai-badge">
        <span class="ai-badge-icon">🤖</span>
        <span>AI помощник</span>
      </div>
      <button class="ai-close-btn" @click="$emit('close')">✕</button>
    </div>

    <!-- Content -->
    <div class="ai-card-content">
      <!-- Title -->
      <h3 class="ai-title">{{ title }}</h3>
      <p class="ai-description">{{ description }}</p>

      <!-- Suggestions List -->
      <div class="suggestions-container">
        <div
          v-for="(suggestion, idx) in suggestions"
          :key="idx"
          class="suggestion-item"
          :class="{ 'priority-high': suggestion.priority === 'high' }"
        >
          <div class="suggestion-header">
            <span class="suggestion-priority">{{ getPriorityLabel(suggestion.priority) }}</span>
            <span class="suggestion-icon">{{ getSuggestionIcon(suggestion.type) }}</span>
          </div>
          <p class="suggestion-message">{{ suggestion.message }}</p>
          <p class="suggestion-help">💡 {{ suggestion.suggestion }}</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="ai-card-actions">
        <button
          v-if="hasAction"
          class="btn-action btn-primary"
          @click="handleAction"
        >
          {{ actionLabel }}
        </button>
        <button
          class="btn-action btn-ghost"
          @click="$emit('close')"
        >
          Закрыть
        </button>
      </div>
    </div>

    <!-- Completion Bar -->
    <div v-if="completenessScore !== undefined" class="ai-completion-bar">
      <div class="completion-label">Полнота профиля</div>
      <div class="completion-track">
        <div class="completion-fill" :style="{ width: completenessScore + '%' }"></div>
      </div>
      <div class="completion-percent">{{ completenessScore }}%</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileAiCard',
  props: {
    type: {
      type: String,
      default: 'improvement', // improvement, bio, interests
    },
    title: {
      type: String,
      default: 'Улучши свой профиль',
    },
    description: {
      type: String,
      default: 'AI анализирует твой профиль и предлагает улучшения для увеличения шанса найти идеальную команду.',
    },
    suggestions: {
      type: Array,
      default: () => [],
    },
    completenessScore: {
      type: Number,
      default: undefined,
    },
    actionLabel: {
      type: String,
      default: 'Применить',
    },
    hasAction: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'action'],
  methods: {
    getPriorityLabel(priority) {
      const labels = {
        high: '🔴 Срочно',
        medium: '🟡 Важно',
        low: '🟢 Заметка',
      }
      return labels[priority] || 'Предложение'
    },
    getSuggestionIcon(type) {
      const icons = {
        text: '📝',
        photo: '📸',
        portfolio: '💼',
        interests: '✨',
        role: '🎯',
        contacts: '🔗',
      }
      return icons[type] || '💡'
    },
    handleAction() {
      this.$emit('action')
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;900&family=Onest:wght@300;400;500;600&display=swap');

:root {
  --c-bg: #080c1a;
  --c-surface: #0f1629;
  --c-card: #131a30;
  --c-border: rgba(255,255,255,0.07);
  --c-red: #e63946;
  --c-text: #e8eaf2;
  --c-muted: #7a80a0;
  --c-white: #ffffff;
}

.profile-ai-card {
  background: linear-gradient(135deg, rgba(230, 57, 70, 0.08), rgba(29, 78, 216, 0.04));
  border: 1px solid rgba(230, 57, 70, 0.2);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 32px rgba(230, 57, 70, 0.1);
}

.ai-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(230, 57, 70, 0.15);
  background: rgba(230, 57, 70, 0.06);
}

.ai-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #f87171;
  font-family: 'Unbounded', sans-serif;
}

.ai-badge-icon {
  font-size: 16px;
}

.ai-close-btn {
  background: none;
  border: none;
  color: var(--c-muted);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 4px 8px;
}

.ai-close-btn:hover {
  color: var(--c-red);
  transform: scale(1.1);
}

.ai-card-content {
  padding: 20px;
}

.ai-title {
  font-family: 'Unbounded', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--c-white);
  margin-bottom: 6px;
}

.ai-description {
  font-size: 13px;
  color: var(--c-muted);
  margin-bottom: 16px;
  line-height: 1.5;
}

.suggestions-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.suggestion-item {
  background: rgba(19, 26, 48, 0.6);
  border: 1px solid rgba(230, 57, 70, 0.1);
  border-radius: 10px;
  padding: 12px;
  transition: all 0.2s;
}

.suggestion-item:hover {
  background: rgba(19, 26, 48, 0.8);
  border-color: rgba(230, 57, 70, 0.2);
}

.suggestion-item.priority-high {
  border-color: rgba(230, 57, 70, 0.3);
  background: rgba(230, 57, 70, 0.08);
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.suggestion-priority {
  font-size: 11px;
  font-weight: 600;
  color: var(--c-red);
}

.suggestion-icon {
  font-size: 14px;
}

.suggestion-message {
  font-size: 13px;
  color: var(--c-text);
  margin: 0 0 6px 0;
  font-weight: 500;
}

.suggestion-help {
  font-size: 12px;
  color: var(--c-muted);
  margin: 0;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.ai-card-actions {
  display: flex;
  gap: 10px;
}

.btn-action {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Onest', sans-serif;
}

.btn-primary {
  background: var(--c-red);
  color: white;
}

.btn-primary:hover {
  background: #c62d39;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(230, 57, 70, 0.3);
}

.btn-ghost {
  background: transparent;
  color: var(--c-muted);
  border: 1px solid var(--c-border);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--c-text);
}

.ai-completion-bar {
  padding: 12px 20px;
  background: rgba(230, 57, 70, 0.06);
  border-top: 1px solid rgba(230, 57, 70, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
}

.completion-label {
  font-size: 11px;
  color: var(--c-muted);
  font-weight: 600;
  white-space: nowrap;
}

.completion-track {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  overflow: hidden;
}

.completion-fill {
  height: 100%;
  background: linear-gradient(90deg, #e63946, #f87171);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.completion-percent {
  font-size: 12px;
  font-weight: 700;
  color: #f87171;
  min-width: 32px;
  text-align: right;
}
</style>

