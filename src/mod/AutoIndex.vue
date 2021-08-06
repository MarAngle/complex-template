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
  data () {
    return {
    }
  },
  props: {
    index: {
      required: true
    },
    maindata: {
      required: false,
      default: null
    }
  },
  computed: {
    currentIndex() {
      let currentIndex = this.index
      if (this.maindata) {
        let pagination = this.maindata.getPageData()
        if (pagination) {
          currentIndex = currentIndex + (pagination.page - 1) * pagination.size
        }
      }
      return currentIndex
    }
  },
  mounted () {
  },
  methods: {
  }
}
</script>
