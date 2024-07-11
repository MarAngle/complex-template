<style scoped>
.complex-auto-text{
  display: block;
  width: 100%;
  margin: 0;
  word-wrap: break-word;
  word-break: break-all;
}
.complex-auto-text-auto{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.complex-auto-text-is-auto{
  cursor: pointer;
}

</style>
<template>
  <Tooltip v-bind="tipOption" >
    <p ref="mainRef" class="complex-auto-text" :class="{ 'complex-auto-text-auto': auto, 'complex-auto-text-is-auto': isEllipsis }" >
      <span ref="sizeRef" >{{ text }}</span>
    </p>
  </Tooltip>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, ref, watch } from "vue"
import { Tooltip } from "ant-design-vue"

export default defineComponent({
  name: 'ComplexAutoText',
  components: {
    Tooltip
  },
  props: {
    text: {
      required: false,
      default: ''
    },
    auto: {
      type: Boolean,
      required: false,
      default: true
    },
    tip: {
      type: [String, Boolean, Object],
      required: false
    }
  },
  setup (props) {
    const isEllipsis = ref(false)
    const mainRef = ref<HTMLElement>()
    const sizeRef = ref<HTMLElement>()
    const tipOption = computed(() => {
      let option
      if (isEllipsis.value && props.tip !== false) {
        if (typeof props.tip === 'object') {
          option = {
            title: props.tip.getData ? props.tip.getData(props.text) : props.tip.data,
            placement: props.tip.location,
            ...props.tip.localOption
          }
        } else {
          option = {
            placement: props.tip || 'top'
          }
        }
        if (option.title == undefined) {
          option.title = props.text
        }
      } else {
        option = {}
      }
      return option
    })
    const triggerObserve = function() {
      nextTick(() => {
        if (mainRef.value && sizeRef.value) {
          const mainWidth = mainRef.value.getBoundingClientRect().width
          const sizeWidth = sizeRef.value.getBoundingClientRect().width
          if (mainWidth < sizeWidth) {
            isEllipsis.value = true
          } else {
            isEllipsis.value = false
          }
        }
      })
    }
    watch(() => props.text, () => {
      triggerObserve()
    })
    onMounted(() => {
      triggerObserve()
    })
    return {
      mainRef,
      sizeRef,
      isEllipsis: isEllipsis,
      tipOption: tipOption,
      triggerObserve: triggerObserve
    }
  }
})
</script>
