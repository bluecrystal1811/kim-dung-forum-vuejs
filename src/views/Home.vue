<template>
  <section>
    <div id="heroBanner" class="carousel slide mb-4" data-bs-ride="carousel">
      <div class="carousel-indicators">
        <button
          v-for="(slide, index) in slides"
          :key="slide.image"
          type="button"
          data-bs-target="#heroBanner"
          :data-bs-slide-to="index"
          :class="{ active: index === 0 }"
          :aria-current="index === 0 ? 'true' : undefined"
          :aria-label="`Slide ${index + 1}`"
        ></button>
      </div>

      <div class="carousel-inner rounded overflow-hidden">
        <div v-for="(slide, index) in slides" :key="slide.image" class="carousel-item" :class="{ active: index === 0 }">
          <img :src="slide.image" :alt="slide.alt" class="d-block w-100 hero-image" />
          <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-2">
            <h5 class="mb-1">{{ slide.title }}</h5>
            <p class="mb-0">{{ slide.description }}</p>
          </div>
        </div>
      </div>

      <button class="carousel-control-prev" type="button" data-bs-target="#heroBanner" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#heroBanner" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>

    <div class="row g-3">
      <div class="col-lg-8">
        <h1 class="h4 text-danger mb-3">Bài viết nổi bật</h1>
        <div class="row row-cols-1 row-cols-md-2 g-3">
          <div v-for="post in featuredPosts" :key="post.id" class="col">
            <article class="card h-100">
              <img :src="post.image" :alt="post.title" class="card-img-top post-image" />
              <div class="card-body">
                <h2 class="h5">{{ post.title }}</h2>
                <p>{{ post.excerpt }}</p>
                <RouterLink :to="{ name: 'post-detail', params: { id: post.id } }" class="btn btn-outline-danger btn-sm mt-2">
                  Đọc chi tiết
                </RouterLink>
              </div>
            </article>
          </div>
        </div>
      </div>

      <aside class="col-lg-4">
        <div class="card mb-3">
          <div class="card-header bg-danger text-white">{{ homeSections.recentlyViewed.title }}</div>
          <ul class="list-group list-group-flush">
            <li v-for="item in recentlyViewed" :key="item.post.id" class="list-group-item">
              <RouterLink :to="{ name: 'post-detail', params: { id: item.post.id } }" class="text-decoration-none text-dark d-block">
                {{ item.post.title }}
              </RouterLink>
              <small class="text-muted">Đã xem: {{ item.viewedText }}</small>
            </li>
          </ul>
        </div>

        <div class="card">
          <div class="card-header bg-dark text-white">{{ homeSections.continueReading.title }}</div>
          <div class="list-group list-group-flush">
            <RouterLink
              v-for="post in continueReading"
              :key="post.id"
              :to="{ name: 'post-detail', params: { id: post.id } }"
              class="list-group-item list-group-item-action"
            >
              {{ post.title }}
            </RouterLink>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import homeSections from '../data/bo-cuc/muc-trang-chu.json'
import slides from '../data/bo-cuc/trinh-chieu.json'
import { approvedPosts } from '../stores/posts'

const findPost = (postId) => approvedPosts.value.find((post) => String(post.id) === String(postId))

const featuredPosts = computed(() => homeSections.featuredPostIds.map(findPost).filter(Boolean))

const recentlyViewed = computed(() =>
  homeSections.recentlyViewed.items
    .map((item) => ({
      post: findPost(item.postId),
      viewedText: item.viewedText,
    }))
    .filter((item) => item.post)
)

const continueReading = computed(() => homeSections.continueReading.postIds.map(findPost).filter(Boolean))
</script>