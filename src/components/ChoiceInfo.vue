<style scoped>
.complex-choice-info{
  padding: 10px 0px;
  line-height: 32px;
  margin: 0;
}
.complex-choice-info-content-empty{
  color: rgba(0, 0, 0, 0.45);
}
.complex-choice-info-menu{
  margin-left: 10px;
  cursor: pointer;
}
</style>
<template>
  <p class="complex-choice-info" v-if="show" >
    <span v-show="size > 0" class="complex-choice-info-content" >{{ currentFormatInfo(payload) }}</span>
    <span v-show="size === 0" class="complex-choice-info-content-empty" >{{ emptyContent }}</span>
    <span v-if="menu" v-show="size > 0" class="complex-choice-info-menu" @click="onCancel" >取消选择</span>
  </p>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue"
import { ChoiceData } from "complex-data"
import config from "../../config"

export default defineComponent({
  name: 'ChoiceInfo',
  props: {
    choice: {
      type: Object as PropType<ChoiceData>,
      required: true
    },
    show: {
      type: Boolean,
      required: false,
      default: () => {
        return config.choice.show
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
      type: Function as PropType<(payload: { choice: ChoiceData, size: number, menu: boolean }) => string>,
      required: false
    },
    emptyContent: {
      type: String,
      required: false,
      default: () => {
        return config.choice.emptyContent
      }
    },
  },
  computed: {
    size() {
      return this.choice.getId().length
    },
    payload() {
      return {
        choice: this.choice,
        size: this.size,
        menu: this.menu
      }
    },
    currentFormatInfo() {
      return this.formatInfo || config.choice.formatInfo
    }
  },
  methods: {
    onCancel() {
      this.choice.reset()
    }
  }
})
</script>
