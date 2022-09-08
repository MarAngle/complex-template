<style scoped>
.complex-form-item{

}
</style>
<template>
  <a-form-item>
    
  </a-form-item>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"

export default defineComponent({
  name: 'ComplexFormItem',
  data () {
    return {}
  },
  props: {
    data: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    target: {
      type: Object,
      required: true
    }
  },
  mounted() {
    //
  },
  methods: {
  }
})
</script>
