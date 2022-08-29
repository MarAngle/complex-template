<style scoped>
.complex-auto-index{
  cursor: default;
}
</style>
<template>
  <span class="complex-auto-index" v-bind="$attrs" v-on="$listeners">{{ currentIndex }}</span>
</template>

<script>

export default {
  name: 'AutoIndex',
  props: {
    index: {
      required: true
    },
    format: {
      required: false
    },
    pagination: {
      type: Object,
      required: false,
      default: null
    }
  },
  computed: {
    currentIndex() {
      let currentIndex = this.index + 1
      if (this.pagination) {
        let page = this.pagination.getPage()
        let size = this.pagination.getSize()
        currentIndex = currentIndex + (page - 1) * size
      }
      if (this.format) {
        currentIndex = this.format(currentIndex, this.pagination)
      }
      return currentIndex
    }
  }
}
</script>
