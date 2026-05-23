<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePagination } from '@/composables/usePagination'
import { useDealsStore } from '@/stores/deals.store'

const { t } = useI18n()
const store = useDealsStore()
const { pagination, hasPrev, hasNext, pageNumbers, goToPage, prevPage, nextPage } = usePagination()

const showingFrom = computed(() => (pagination.value.page - 1) * pagination.value.pageSize + 1)
const showingTo = computed(() =>
  Math.min(pagination.value.page * pagination.value.pageSize, pagination.value.total),
)
</script>

<template>
  <div
    v-if="store.deals.length"
    class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
  >
    <p class="text-sm text-gray-500">
      {{ t('deals.pagination.showing', {
        from: showingFrom,
        to: showingTo,
        total: pagination.total,
      }) }}
    </p>

    <div class="flex items-center gap-1">
      <button
        :disabled="!hasPrev"
        class="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        @click="prevPage"
      >
        {{ t('deals.pagination.previous') }}
      </button>

      <template v-for="p in pageNumbers" :key="`p-${p}`">
        <span v-if="p === -1" class="px-1 text-gray-400">…</span>
        <button
          v-else
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
        class="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        @click="nextPage"
      >
        {{ t('deals.pagination.next') }}
      </button>
    </div>
  </div>
</template>
