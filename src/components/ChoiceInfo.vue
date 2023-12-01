<style scoped>
.complex-choice-info{
  padding: 10px 0px;
  line-height: 32px;
}
.complex-choice-info-menu{
  margin-left: 10px;
  cursor: pointer;
}
</style>
<template>
  <p class="complex-choice-info" v-if="auto || size > 0" >
    <span >{{ formatInfo(payload) }}</span>
    <span v-if="menu" v-show="size > 0" class="complex-choice-info-menu" @click="onCancel" >取消选择</span>
  </p>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue"
import { ChoiceData } from "complex-data"
import config from "../../config"

export default defineComponent({
  name: 'ComplexChoiceInfo',
  props: {
    choice: {
      type: Object as PropType<ChoiceData>,
      required: true
    },
    auto: {
      type: Boolean,
      required: false,
      default: () => {
        return config.choice.auto
      }
    },
    menu: {
      type: Boolean,
      required: false,
      default: () => {
        return config.choice.menu
      }
    },
    formatInfo: {
      type: Function as PropType<(payload: { choice: ChoiceData, size: number, auto: boolean, menu: boolean }) => string>,
      required: false,
      default: config.choice.formatInfo
    }
  },
  computed: {
    size() {
      return this.choice.getId().length
    },
    payload() {
      return {
        choice: this.choice,
        size: this.size,
        auto: this.auto,
        menu: this.menu
      }
    }
  },
  methods: {
    onCancel() {
      this.choice.$reset()
    }
  }
})
</script>
