import { createRouter, createWebHistory } from 'vue-router'
import { ROUTE_NAMES } from './routes'
import { adminGuard } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      children: [
        { path: '', redirect: { name: ROUTE_NAMES.DEALS } },
        {
          path: 'deals',
          name: ROUTE_NAMES.DEALS,
          component: () => import('@/views/DealsListView.vue'),
        },
        {
          path: 'deals/:id',
          name: ROUTE_NAMES.DEAL_DETAIL,
          component: () => import('@/views/DealDetailView.vue'),
        },
        {
          path: 'admin',
          name: ROUTE_NAMES.ADMIN,
          component: () => import('@/views/AdminView.vue'),
          meta: { requiresAdmin: true },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: ROUTE_NAMES.DEALS },
    },
  ],
})

router.beforeEach(adminGuard)

export default router
