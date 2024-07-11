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
import { computed, defineComponent, inject, nextTick, onBeforeMount, onMounted, reactive, ref, watch } from "vue"
import { Tooltip } from "ant-design-vue"
import LocalResizeObserver from "../LocalResizeObserver"
import config from "../config"

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
    const pluginLayout = inject(config.pluginLayoutKey)
    const isEllipsis = ref(false)
    const mainRef = ref<HTMLElement>()
    const sizeRef = ref<HTMLElement>()
    const tipOption = computed(() => {
      if (isEllipsis.value && props.tip !== false) {
        return typeof props.tip === 'object' ? {
          title: props.tip.getData ? props.tip.getData(props.text) : (props.tip.data || props.text),
          placement: props.tip.location,
          ...props.tip.localOption
        } : {
          placement: props.tip || 'top',
          title: props.text
        }
      } else {
        return {}
      }
    })
    const resizeObserver = reactive(new LocalResizeObserver(pluginLayout))
    const triggerObserve = function(entry?: ResizeObserverEntry) {
      nextTick(() => {
        if (mainRef.value && sizeRef.value) {
          const mainWidth = (entry && entry.borderBoxSize && entry.borderBoxSize[0]) ? entry.borderBoxSize[0].inlineSize : mainRef.value.getBoundingClientRect().width
          const sizeWidth = sizeRef.value.getBoundingClientRect().width
          if (mainWidth < sizeWidth) {
            isEllipsis.value = true
          } else {
            isEllipsis.value = false
          }
        }
      })
    }
    onMounted(() => {
      nextTick(() => {
        resizeObserver.init(mainRef.value!, function(entry) {
          triggerObserve(entry)
        }, function() {
          triggerObserve()
          watch(() => props.text, function() {
            triggerObserve()
          })
        })
      })
    })
    onBeforeMount(() => {
      resizeObserver.destroy()
    })
    return {
      mainRef,
      sizeRef,
      isEllipsis: isEllipsis,
      tipOption: tipOption
    }
  }
})
</script>
