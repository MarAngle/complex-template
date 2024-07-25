import { defineComponent, h, inject, nextTick, onBeforeMount, onMounted, PropType, ref, VNode } from "vue"
import LocalResizeObserver from "../LocalResizeObserver"
import config from "../config"

export interface CollapseAreaProps {
  height: number
  collapse?: boolean
  render?: (payload: { needCollapse: boolean, collapse: boolean }) => VNode | VNode[] | null
}

export default defineComponent({
  name: 'CollapseArea',
  props: {
    height: {
      type: Number,
      required: true
    },
    collapse: {
      type: Boolean,
      required: false
    },
    render: {
      type: Function as PropType<CollapseAreaProps['render']>,
      required: false
    }
  },
  setup(props) {
    const pluginLayout = inject(config.pluginLayoutKey)
    const contentRef = ref<Element>()
    const needCollapse = ref(false)
    const resizeObserver = new LocalResizeObserver(pluginLayout)
    const onResize = function(entry?: ResizeObserverEntry) {
      nextTick(() => {
        if (contentRef.value) {
          const contentHeight = (entry && entry.borderBoxSize && entry.borderBoxSize[0]) ? entry.borderBoxSize[0].blockSize : contentRef.value.getBoundingClientRect().height
          if (contentHeight <= props.height) {
            needCollapse.value = false
          } else {
            needCollapse.value = true
          }
        }
      })
    }
    onMounted(() => {
      nextTick(() => {
        resizeObserver.init(contentRef.value!, function(entry) {
          onResize(entry)
        }, function() {
          onResize()
        })
      })
    })
    onBeforeMount(() => {
      resizeObserver.destroy()
    })
    return {
      contentRef,
      needCollapse
    }
  },
  methods: {
    $renderArea() {
      if (this.render) {
        return this.render({
          needCollapse: this.needCollapse,
          collapse: this.collapse
        })
      } else if (this.$slots.default) {
        return this.$slots.default({
          needCollapse: this.needCollapse,
          collapse: this.collapse
        })
      }
      return null
    },
    renderArea() {
      const area = this.$renderArea()
      if (area) {
        return h('div', {
          class: 'complex-collapse-area-content',
          ref: 'contentRef'
        }, [
          area
        ])
      }
      return null
    }
  },
  render() {
    return h('div', {
      class: 'complex-collapse-area' + ((this.collapse && this.needCollapse) ? ' complex-collapse-area-collapsed' : ''),
      style: {
        height: (this.collapse && this.needCollapse) ? config.component.data.formatPixel(this.height) : undefined
      }
    }, [
      this.renderArea()
    ])
  }
})
