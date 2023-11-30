import { Pagination } from "ant-design-vue"
import { AttributesData, PaginationData } from "complex-data"
import { defineComponent, h, PropType } from "vue"
import { parseAttributes } from "../utils"
import config from "../config"

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Pagination',
  props: {
    data: {
      type: Object as PropType<PaginationData>,
      required: true
    },
    auto: {
      type: Boolean,
      required: false,
      default: true
    },
    formatInfo: {
      type: Function,
      required: false,
      default: config.Pagination.formatInfo
    }
  },
  methods: {
    renderSlot() {
      const slot = this.$slots.default
      if (slot) {
        return slot({
          pagination: this.data
        })
      } else {
        return null
      }
    },
    renderInfo() {
      return h('span', {
        class: 'complex-pagination-info'
      }, {
        default: () => this.formatInfo(this.data)
      })
    },
    renderPagination() {
      const paginationAttributes = new AttributesData({
        props: {
          current: this.data.current,
          total: this.data.num,
          pageSize: this.data.size.current,
          pageSizeOptions: this.data.size.list,
          showSizeChanger: this.data.size.change,
          showQuickJumper: this.data.jumper.change
        },
        on: {
          change: (current: number, size: number) => {
            if (this.auto) {
              this.data.setCurrent(current)
            }
            this.$emit('current', current)
          },
          showSizeChange: (current: number, size: number) => {
            if (this.auto) {
              this.data.setCurrentAndSize({ current, size })
            }
            this.$emit('size', size, current)
          }
        }
      })
      const render = h(Pagination, parseAttributes(paginationAttributes))
      return render
    }
  },
  /**
   * 主要模板
   * @param {*} h createElement
   * @returns {VNode}
   */
  render() {
    const render = h('div', { class: 'complex-pagination' }, {
      default: () => [this.renderSlot(), this.renderInfo(), this.renderPagination()]
    })
    return render
  }
})
