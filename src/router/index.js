import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import PostList from '../views/PostList.vue'
import PostDetail from '../views/PostDetail.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import CreatePost from '../views/CreatePost.vue'
import EditPost from '../views/EditPost.vue'
import ManagePosts from '../views/ManagePosts.vue'
import ManageUsers from '../views/ManageUsers.vue'
import ManageCategories from '../views/ManageCategories.vue'
import Profile from '../views/Profile.vue'
import NotFound from '../views/NotFound.vue'
import appShell from '../data/bo-cuc/khung-ung-dung.json'
import uiSections from '../data/bo-cuc/muc-giao-dien.json'
import { isLoggedIn, isModerator } from '../stores/auth'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/bai-viet', name: 'posts', component: PostList },
    { path: '/bai-viet/:id', name: 'post-detail', component: PostDetail },
    { path: '/dang-nhap', name: 'login', component: Login },
    { path: '/dang-ky', name: 'register', component: Register },
    {
      path: '/tao-bai-viet',
      name: 'create-post',
      component: CreatePost,
      meta: { requiresAuth: true },
    },
    {
      path: '/sua-bai-viet/:id',
      name: 'edit-post',
      component: EditPost,
      meta: { requiresAuth: true },
    },
    {
      path: '/quan-ly-bai-viet',
      name: 'manage-posts',
      component: ManagePosts,
      meta: { requiresAuth: true },
    },
    {
      path: '/trang-ca-nhan',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true },
    },
    {
      path: '/quan-ly-nguoi-dung',
      name: 'manage-users',
      component: ManageUsers,
      meta: { requiresAuth: true, requiresModerator: true },
    },
    {
      path: '/quan-ly-danh-muc',
      name: 'manage-categories',
      component: ManageCategories,
      meta: { requiresAuth: true, requiresModerator: true },
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound },
  ],
})

// router.beforeEach((to) => {
//   if (to.meta.requiresAuth && !isLoggedIn.value) {
//     return { name: 'login', query: { redirect: to.fullPath } }
//   }

//   if (to.meta.requiresModerator && !isModerator.value) {
//     return { name: 'home' }
//   }

//   const routeName = to.name ? String(to.name) : ''
//   const routeTitle = uiSections.routeTitles[routeName]
//   document.title = routeTitle ? `${routeTitle} | ${appShell.brand}` : appShell.brand

//   return true
// })

export default router
