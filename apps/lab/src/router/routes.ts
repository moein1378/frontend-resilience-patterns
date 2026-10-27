import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('@/pages/IndexPage.vue') },
      { path: 'simulator', component: () => import('@/pages/SimulatorPage.vue') },
      { path: 'patterns', component: () => import('@/pages/PatternsPage.vue') },
      {
        path: 'patterns/circuit-breaker/unprotected',
        component: () => import('@/pages/CircuitBreakerPreviewPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
];

export default routes;
