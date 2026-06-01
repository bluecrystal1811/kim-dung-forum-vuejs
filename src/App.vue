<template>
  <div class="app-shell bg-light min-vh-100">
    <div class="container my-3 p-0 border bg-white">
      <nav class="navbar navbar-expand-lg navbar-light bg-warning-subtle border-bottom px-3">
        <RouterLink class="navbar-brand fw-bold text-danger" to="/">{{ appShell.brand }}</RouterLink>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div id="navbarMain" class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li v-for="item in visibleNavItems" :key="item.to" class="nav-item">
              <RouterLink class="nav-link" :to="item.to">{{ item.label }}</RouterLink>
            </li>
          </ul>

          <div class="d-flex gap-2">
            <template v-if="!isLoggedIn">
              <RouterLink to="/dang-nhap" class="btn btn-outline-dark btn-sm">{{ appShell.guestActions.loginLabel }}</RouterLink>
              <RouterLink to="/dang-ky" class="btn btn-danger btn-sm">{{ appShell.guestActions.registerLabel }}</RouterLink>
            </template>
            <template v-else>
              <span class="small align-self-center">{{ appShell.userActions.greetingPrefix }} {{ currentUser?.penName }}</span>
              <button type="button" class="btn btn-outline-danger btn-sm" @click="quickLogout">{{ appShell.userActions.logoutLabel }}</button>
            </template>
          </div>
        </div>
      </nav>

      <main class="p-4">
        <RouterView />
      </main>

      <footer class="bg-dark text-white text-center py-3">{{ appShell.footer }}</footer>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import appShell from './data/bo-cuc/khung-ung-dung.json'
import { currentUser, isLoggedIn, loadUsers, logout } from './stores/auth'
import { loadCategories } from './stores/categories'
import { loadComments } from './stores/comments'
import { loadPosts } from './stores/posts'

const router = useRouter()

const visibleNavItems = computed(() =>
  appShell.navItems.filter((item) => !item.requiresModerator || currentUser.value?.role === 'moderator')
)

onMounted(() => {
  void Promise.all([loadUsers(), loadPosts(), loadComments(), loadCategories()])
})

const quickLogout = () => {
  logout()
  router.push('/dang-nhap')
}
</script>