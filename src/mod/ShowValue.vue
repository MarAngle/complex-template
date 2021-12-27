<template>
  <span class="complex-show-value" >{{ currentValue }}</span>
</template>
<script>
import _func from 'complex-func'

export default {
  name: 'ShowValue',
  data() {
    return {}
  },
  props: {
    value: {
      required: false
    },
    isExist: {
      type: Function,
      required: false,
      default: _func.isExist
    },
    unExistText: {
      required: false,
      default: ''
    },
    format: {
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
}
</script>
