<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    :stroke-width="strokeWidth"
    aria-hidden="true"
  >
    <template v-if="name === 'user'">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </template>
    <template v-else-if="name === 'trophy'">
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v4a5 5 0 0 1-10 0Z" />
      <path d="M17 5h3a2 2 0 0 1-2 2h-1" />
      <path d="M7 5H4a2 2 0 0 0 2 2h1" />
    </template>
    <template v-else-if="name === 'sparkles'">
      <path d="m12 3 1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4Z" />
      <path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8Z" />
      <path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8Z" />
    </template>
    <template v-else-if="name === 'folder'">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </template>
    <template v-else-if="name === 'chat'">
      <path d="M7 10h10" />
      <path d="M7 14h6" />
      <path d="M4 5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-9l-5 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    </template>
    <template v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </template>
    <template v-else-if="name === 'calendar'">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
    </template>
    <template v-else-if="name === 'map-pin'">
      <path d="M12 21s6-4.35 6-10a6 6 0 1 0-12 0c0 5.65 6 10 6 10Z" />
      <circle cx="12" cy="11" r="2.5" />
    </template>
    <template v-else-if="name === 'users'">
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3.5" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a3.5 3.5 0 0 1 0 6.74" />
    </template>
    <template v-else-if="name === 'wallet'">
      <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2H5a2 2 0 1 0 0 4h14v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M19 9h2v4h-2a2 2 0 0 1 0-4Z" />
    </template>
    <template v-else-if="name === 'bookmark'">
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
    </template>
    <template v-else-if="name === 'x'">
      <path d="m18 6-12 12" />
      <path d="m6 6 12 12" />
    </template>
    <template v-else-if="name === 'check'">
      <path d="m5 12 4 4L19 6" />
    </template>
    <template v-else-if="name === 'star'">
      <path d="m12 3 2.8 5.7L21 9.6l-4.5 4.4 1 6.2L12 17.2l-5.5 3 1-6.2L3 9.6l6.2-.9Z" />
    </template>
    <template v-else-if="name === 'heart'">
      <path d="m12 20-1.2-1.1C5.2 13.8 2 10.9 2 7.3A4.3 4.3 0 0 1 6.3 3 4.7 4.7 0 0 1 12 6.1 4.7 4.7 0 0 1 17.7 3 4.3 4.3 0 0 1 22 7.3c0 3.6-3.2 6.5-8.8 11.6Z" />
    </template>
    <template v-else-if="name === 'send'">
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4Z" />
    </template>
    <template v-else-if="name === 'paperclip'">
      <path d="m21.4 11.1-8.5 8.5a5 5 0 0 1-7.1-7.1L15 3.3a3.5 3.5 0 1 1 5 5l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />
    </template>
    <template v-else-if="name === 'code'">
      <path d="m8 8-4 4 4 4" />
      <path d="m16 8 4 4-4 4" />
      <path d="m14 4-4 16" />
    </template>
    <template v-else-if="name === 'bell'">
      <path d="M15 17H9" />
      <path d="M18 17V11a6 6 0 1 0-12 0v6l-2 2h16Z" />
    </template>
    <template v-else-if="name === 'briefcase'">
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </template>
    <template v-else-if="name === 'graduation'">
      <path d="m2 10 10-5 10 5-10 5Z" />
      <path d="M6 12v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4" />
    </template>
    <template v-else-if="name === 'building'">
      <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
      <path d="M2 21h20" />
      <path d="M9 7h2" />
      <path d="M9 11h2" />
      <path d="M9 15h2" />
      <path d="M15 9h4" />
      <path d="M15 13h4" />
      <path d="M10 21v-3h4v3" />
    </template>
    <template v-else-if="name === 'chevron-down'">
      <path d="m6 9 6 6 6-6" />
    </template>
    <template v-else-if="name === 'rotate-left'">
      <path d="M3 12a9 9 0 1 0 3 6.7" />
      <path d="M3 3v6h6" />
    </template>
    <template v-else-if="name === 'rotate-right'">
      <path d="M21 12a9 9 0 1 1-3 6.7" />
      <path d="M21 3v6h-6" />
    </template>
    <template v-else-if="name === 'flip'">
      <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3" />
      <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
      <path d="M12 2v20" />
    </template>
    <template v-else-if="name === 'refresh'">
      <path d="M21 12a9 9 0 0 0-15.5-6.7" />
      <path d="M3 4v6h6" />
      <path d="M3 12a9 9 0 0 0 15.5 6.7" />
      <path d="M21 20v-6h-6" />
    </template>
    <template v-else>
      <circle cx="12" cy="12" r="9" />
    </template>
  </svg>
</template>

<script>
export default {
  name: 'AppIcon',
  props: {
    name: {
      type: String,
      required: true,
    },
    size: {
      type: [Number, String],
      default: 18,
    },
    strokeWidth: {
      type: [Number, String],
      default: 1.9,
    },
  },
}
</script>
