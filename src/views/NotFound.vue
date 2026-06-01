<template>
  <section class="text-center py-5">
    <h1 class="h3">{{ uiSections.notFound.title }}</h1>
    <RouterLink to="/" class="btn btn-dark mt-2">{{ uiSections.notFound.backHomeLabel }}</RouterLink>
  </section>
</template>

<script setup>
import uiSections from '../data/bo-cuc/muc-giao-dien.json'
</script>
