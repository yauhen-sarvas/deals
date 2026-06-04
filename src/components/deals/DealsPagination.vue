<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePagination } from '@/composables/usePagination'
import { useDealsStore } from '@/stores/deals.store'

const { t } = useI18n()
const store = useDealsStore()
const { pagination, totalPages, hasPrev, hasNext, pageNumbers, goToPage, prevPage, nextPage } = usePagination()

const showingFrom = computed(() => (pagination.value.page - 1) * pagination.value.pageSize + 1)
const showingTo = computed(() =>
  Math.min(pagination.value.page * pagination.value.pageSize, pagination.value.total),
)

const goToInput = ref('')

function commitGoTo() {
  const page = parseInt(goToInput.value, 10)
  if (!isNaN(page) && page >= 1 && page <= totalPages.value) {
    goToPage(page)
  }
  goToInput.value = ''
}
</script>

<template>
  <div
    v-if="store.deals.length"
    class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
  >
    <p class="text-sm text-gray-500">
      {{ t('deals.pagination.showing', { from: showingFrom, to: showingTo, total: pagination.total }) }}
      <span class="ml-1 text-gray-400">·</span>
      {{ t('deals.pagination.page', { page: pagination.page, total: totalPages }) }}
    </p>

    <nav :aria-label="t('deals.pagination.nav')" class="flex items-center gap-1">
      <button
        :disabled="!hasPrev"
        :aria-label="t('deals.pagination.previous')"
        class="rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        @click="prevPage"
      >
        {{ t('deals.pagination.previous') }}
      </button>

      <template v-for="p in pageNumbers" :key="`p-${p}`">
        <span
          v-if="p === -1"
          class="px-1 text-gray-400"
          role="separator"
          :aria-label="t('deals.pagination.ellipsis')"
        >…</span>
        <button
          v-else
          :aria-label="t('deals.pagination.goToPageN', { page: p })"
          :aria-current="p === pagination.page ? 'page' : undefined"
          :class="[
            'min-w-[2rem] rounded px-2 py-1 text-sm transition-colors',
            p === pagination.page
              ? 'bg-blue-600 text-white font-medium'
              : 'text-gray-600 hover:bg-gray-100',
          ]"
          @click="goToPage(p)"
        >
          {{ p }}
        </button>
      </template>

      <button
        :disabled="!hasNext"
        :aria-label="t('deals.pagination.next')"
        class="rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        @click="nextPage"
      >
        {{ t('deals.pagination.next') }}
      </button>

      <span class="mx-1 text-gray-300" aria-hidden="true">|</span>

      <label class="flex items-center gap-1.5 text-sm text-gray-500">
        {{ t('deals.pagination.goTo') }}
        <input
          v-model="goToInput"
          type="number"
          :min="1"
          :max="totalPages"
          :aria-label="t('deals.pagination.goTo')"
          class="w-16 rounded border border-gray-300 px-1.5 py-1 text-center text-sm text-gray-700 focus:border-blue-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          @keydown.enter="commitGoTo"
        />
      </label>
    </nav>
  </div>
</template>
