<template>
  <span class="complex-show-value" >{{ currentValue }}</span>
</template>
<script lang="ts">
import { defineComponent } from "vue"
import { isExist } from "complex-utils"

export default defineComponent({
  name: 'ComplexShowValue',
  props: {
    value: {
      required: false
    },
    isExist: {
      type: Function,
      required: false,
      default: isExist
    },
    unExistText: {
      required: false,
      default: ''
    },
    format: {
      type: Function,
      required: false
    }
  },
  computed: {
    currentValue() {
      let currentValue = this.format ? this.format(this.value) : this.value
      if (!this.isExist(currentValue)) {
        currentValue = this.unExistText
      }
      return currentValue
    }
  }
})
</script>
