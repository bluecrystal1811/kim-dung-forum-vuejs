<template>
  <section>
    <div class="row g-3">
      <aside class="col-lg-4">
        <div class="card mb-3">
          <div class="card-header bg-dark text-white">{{ pageSections.factions.title }}</div>
          <ul class="list-group list-group-flush">
            <li v-for="faction in pageSections.factions.items" :key="faction" class="list-group-item">{{ faction }}</li>
          </ul>
        </div>

        <div class="card">
          <div class="card-header bg-danger text-white">{{ pageSections.popularPosts.title }}</div>
          <div class="list-group list-group-flush">
            <RouterLink
              v-for="item in popularPosts"
              :key="item.post.id"
              :to="{ name: 'post-detail', params: { id: item.post.id } }"
              class="list-group-item list-group-item-action"
            >
              {{ item.label }}
            </RouterLink>
          </div>
        </div>
      </aside>

      <div class="col-lg-8">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h1 class="h4 text-danger mb-0">{{ pageSections.pageTitle }}</h1>
          <select v-model="selectedCategory" class="form-select filter-select">
            <option v-for="category in categoriesWithAll" :key="category" :value="category">{{ category }}</option>
          </select>
        </div>

        <div class="row row-cols-1 row-cols-md-2 g-3">
          <div v-for="post in filteredPosts" :key="post.id" class="col">
            <article class="card h-100">
              <img :src="post.image" :alt="post.title" class="card-img-top post-image" />
              <div class="card-body d-flex flex-column">
                <span class="badge text-bg-dark align-self-start mb-2">{{ post.category }}</span>
                <h2 class="h5">{{ post.title }}</h2>
                <p class="flex-grow-1">{{ post.excerpt }}</p>
                <RouterLink :to="{ name: 'post-detail', params: { id: post.id } }" class="btn btn-outline-danger btn-sm mt-2">
                  Chi tiết
                </RouterLink>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import pageSections from '../data/bo-cuc/muc-danh-sach-bai-viet.json'
import { categoryNames, ensureCategoriesLoaded } from '../stores/categories'
import { approvedPosts } from '../stores/posts'

const selectedCategory = ref(pageSections.allCategoryLabel)

const findPost = (postId) => approvedPosts.value.find((post) => String(post.id) === String(postId))

void ensureCategoriesLoaded()

const categoriesWithAll = computed(() => [pageSections.allCategoryLabel, ...categoryNames.value])

const popularPosts = computed(() =>
  pageSections.popularPosts.items
    .map((item) => ({
      label: item.label,
      post: findPost(item.postId),
    }))
    .filter((item) => item.post)
)

const filteredPosts = computed(() => {
  if (selectedCategory.value === pageSections.allCategoryLabel) return approvedPosts.value
  return approvedPosts.value.filter((item) => item.category === selectedCategory.value)
})
</script>