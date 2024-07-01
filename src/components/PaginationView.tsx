import { defineComponent, h, PropType } from "vue"
import { Pagination } from "ant-design-vue"
import { AttrsValue, PaginationData } from "complex-data"
import config from "../../config"

export default defineComponent({
  name: 'PaginationView',
  emits: {
    page: (_page: number, _size: number) => {
      return true
    },
    size: (_page: number, _size: number) => {
      return true
    },
  },
  props: {
    pagination: {
      type: Object as PropType<PaginationData>,
      required: true
    },
    assign: {
      type: Boolean,
      required: false,
      default: true
    },
    simple: {
      type: Boolean,
      required: false,
      default: false
    },
    formatInfo: {
      type: Function as PropType<(payload: { pagination: PaginationData }) => string>,
      required: false
    }
  },
  computed: {
    payload() {
      return {
        pagination: this.pagination
      }
    },
    currentFormatInfo() {
      return this.formatInfo || config.pagination.formatInfo
    }
  },
  methods: {
    renderSlot() {
      const slot = this.$slots.default || config.component.parseData(this.pagination.$renders, 'slot')
      if (slot) {
        return slot(this.payload)
      } else {
        return null
      }
    },
    renderInfo() {
      if (!this.simple) {
        const infoRender = config.component.parseData(this.pagination.$renders, 'info')
        return h('span', {
          class: 'complex-pagination-info'
        }, {
          default: () => !infoRender ? this.currentFormatInfo(this.payload) : infoRender(this.payload)
        })
      } else {
        return null
      }
    },
    renderPagination() {
      const targetRender = config.component.parseData(this.pagination.$renders, 'target')
      if (!targetRender) {
        const paginationAttrs = new AttrsValue({
          props: {
            current: this.pagination.page.data,
            total: this.pagination.count,
            pageSize: this.pagination.size.data,
            pageSizeOptions: this.pagination.size.list,
            showSizeChanger: this.pagination.size.show,
            showQuickJumper: this.pagination.jumper,
            simple: this.simple
          },
          on: {
            change: (page: number, size: number) => {
              if (this.assign !== false) {
                this.pagination.setPage(page)
              }
              this.$emit('page', page, size)
            },
            showSizeChange: (page: number, size: number) => {
              if (this.assign !== false) {
                this.pagination.setPageAndSize({ page, size })
              }
              this.$emit('size', page, size)
            }
          }
        })
        return h(Pagination, config.component.parseAttrs(paginationAttrs.merge(this.pagination.$attrs)))
      } else {
        return targetRender(this.payload)
      }
    }
  },
  /**
   * 主要模板

   * @returns {VNode}
   */
  render() {
    const render = h('div', { class: 'complex-pagination' }, {
      default: () => [this.renderSlot(), this.renderInfo(), this.renderPagination()]
    })
    return render
  }
})
