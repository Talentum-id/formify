import { createRouter, createWebHashHistory } from 'vue-router';
import App from '@/pages/index.vue';
import Responces from '@/pages/Responces.vue';
import login from '@/pages/login.vue';
import signUp from '@/pages/sign-up.vue';

const routes = [
  {
    path: '/',
    name: 'app',
    component: App,
    meta: {
      title: `Q&A List`,
      requiresAuth: true,
    },
  },
  {
    path: '/responces',
    name: 'responces',
    component: Responces,
    meta: {
      title: `Responces`,
      requiresAuth: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
  {
    path: '/login',
    name: '/login',
    component: login,
    meta: {
      title: `Login`,
      requiresAuth: false,
    },
  },
  {
    path: '/sign-up',
    name: '/sign-up',
    component: signUp,
    meta: {
      title: `Register`,
      requiresAuth: true,
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const isAuthenticated = () => {
  return sessionStorage.getItem('account');
};

function setPageTitleMiddleware(to, from, next) {
  const pageTitle = to.matched.find((record) => record.meta.title);
  if (pageTitle) {
    window.document.title = pageTitle.meta.title;
  }
}

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthenticated()) {
    console.log('Redirecting to /login');
    next('/login');
  } else {
    console.log('Allowing navigation');
    next();
  }
  await setPageTitleMiddleware(to, from, next);
});

export default router;
