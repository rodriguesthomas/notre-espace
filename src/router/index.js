import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import AlbumView from '../views/AlbumView.vue';

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  // Si l'utilisateur est déjà connecté et essaie d'aller sur la page de login
  if (to.path === '/login' && isAuthenticated) {
    next('/home'); // Redirige directement vers l'application sans repasser par le login
  } else {
    next();
  }
});

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/home', name: 'Home', component: Home },
  { path: '/album/:owner', name: 'Album', component: AlbumView, props: true } 
  // `:owner` permettra de savoir si on ouvre l'album de 'moi' ou 'elle'
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;