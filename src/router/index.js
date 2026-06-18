import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import AlbumView from '../views/AlbumView.vue';

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