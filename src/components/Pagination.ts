import { defineComponent, h, PropType } from "vue"
import { Pagination } from "ant-design-vue"
import { AttrsValue, PaginationData } from "complex-data"
import config from "../../config"

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Pagination',
  props: {
    pagination: {
      type: Object as PropType<PaginationData>,
      required: true
    },
    auto: {
      type: Boolean,
      required: false,
      default: true
    },
    formatInfo: {
      type: Function as PropType<(payload: { pagination: PaginationData, auto: boolean }) => string>,
      required: false,
      default: config.pagination.formatInfo
    }
  },
  computed: {
    payload() {
      return {
        pagination: this.pagination,
        auto: this.auto
      }
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
      const infoRender = config.component.parseData(this.pagination.$renders, 'info')
      return h('span', {
        class: 'complex-pagination-info'
      }, {
        default: () => !infoRender ? this.formatInfo(this.payload) : infoRender(this.payload)
      })
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
            showQuickJumper: this.pagination.jumper
          },
          on: {
            change: (page: number, size: number) => {
              if (this.auto) {
                this.pagination.setPage(page)
              }
              this.$emit('page', page, size)
            },
            showSizeChange: (page: number, size: number) => {
              if (this.auto) {
                this.pagination.setPageAndSize({ page, size })
              }
              this.$emit('size', size, page)
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
