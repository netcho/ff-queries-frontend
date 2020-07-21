import Vue from 'vue'
import VueRouter from 'vue-router'
import { loadLanguageAsync } from '@/plugins/i18n'
import store from '../store';

Vue.use(VueRouter);

const routes = [
  {
    path: '/:lang',
    component: { template: '<router-view></router-view>' },
    children: [
    {
      path: 'login',
      name: 'Login',
      component: () => import(/* webpackChunkName: "Login" */'@/views/Login.vue')},
    {
      path: '',
      name: 'Home',
      meta: {
        requiresAuth: true
      },
      component: () => import(/* webpackChunkName: "Home" */ '@/views/Home.vue')},
    {
      path: 'queries',
      name: 'Queries',
      meta: {
        requiresAuth: true
      },
      component: () => import(/* webpackChunkName: "Queries" */ '@/views/Queries.vue')},
    {
      path: 'queries/add/:templateQueryId?/:edit?',
      name: 'AddQuery',
      meta: {
        requiresAuth: true
      },
      component: () => import(/* webpackChunkName: "Queries" */ '@/views/AddQuery.vue')},
    {
      path: 'query/:id',
      name: 'ViewQuery',
      meta: {
        requiresAuth: true
      },
      component: () => import(/* webpackChunkName: "Queries" */ '@/views/ViewQuery.vue')},
    {
      path: 'budgets',
      name: 'Budgets',
      meta: {
        requiresAuth: true
      },
      component: () => import(/* webpackChunkName: "Budgets" */ '@/views/Budgets.vue')},
    {
      path: 'budget/:week',
      name: 'ViewBudget',
      meta: {
        requiresAuth: true
      },
      component: () => import(/* webpackChunkName: "Budgets" */ '@/views/ViewBudget.vue')
    }
    ]
  }
];

const router = new VueRouter({
  routes,
  mode: 'history'
});

router.beforeEach((to, from, next) => {
  const lang = to.params.lang;
  if (lang)
    loadLanguageAsync(lang).then(() => next());
  else
    next('/bg')
});

router.beforeEach(((to, from, next) => {
  if(to.matched.some(record => record.meta.requiresAuth)) {
    if (store.getters.isLoggedIn) {
      next();
    }
    else {
      next(to.params.lang + '/login');
    }
  }
  else {
    next();
  }
}));

export default router
