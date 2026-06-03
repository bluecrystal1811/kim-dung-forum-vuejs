<template>
  <section>
    <div class="row g-3">
      <aside class="col-lg-4">
        <div class="card mb-3">
          <div class="card-header bg-dark text-white">Danh mục</div>
          <ul class="list-group list-group-flush">
            <li
              class="list-group-item list-group-item-action"
              :class="{ active: selectedCategory === ALL_LABEL }"
              style="cursor: pointer;"
              @click="selectedCategory = ALL_LABEL"
            >
              Tất cả
              <span class="badge bg-secondary float-end">{{ approvedPosts.length }}</span>
            </li>
            <li
              v-for="cat in categoryNames"
              :key="cat"
              class="list-group-item list-group-item-action"
              :class="{ active: selectedCategory === cat }"
              style="cursor: pointer;"
              @click="selectedCategory = cat"
            >
              {{ cat }}
              <span class="badge bg-secondary float-end">{{ countByCategory(cat) }}</span>
            </li>
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
        <div class="d-flex align-items-center mb-3">
          <h1 class="h4 text-danger mb-0">
            {{ selectedCategory === ALL_LABEL ? pageSections.pageTitle : selectedCategory }}
          </h1>
          <span class="ms-2 text-muted small">({{ filteredPosts.length }} bài)</span>
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

const ALL_LABEL = 'Tất cả'
const selectedCategory = ref(ALL_LABEL)

const findPost = (postId) => approvedPosts.value.find((post) => String(post.id) === String(postId))

void ensureCategoriesLoaded()

const countByCategory = (cat) => approvedPosts.value.filter((p) => p.category === cat).length

const popularPosts = computed(() =>
  pageSections.popularPosts.items
    .map((item) => ({
      label: item.label,
      post: findPost(item.postId),
    }))
    .filter((item) => item.post)
)

const filteredPosts = computed(() => {
  if (selectedCategory.value === ALL_LABEL) return approvedPosts.value
  return approvedPosts.value.filter((item) => item.category === selectedCategory.value)
})
</script>