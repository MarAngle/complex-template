import { defineComponent, h, PropType } from "vue"
import { Pagination } from "ant-design-vue"
import { AttributeValue, PaginationData } from "complex-data"
import config from "../../config"

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
      type: Function as PropType<(data: PaginationData) => string>,
      required: false,
      default: config.pagination.formatInfo
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
      const paginationAttributes = new AttributeValue({
        props: {
          current: this.data.page.data,
          total: this.data.count,
          pageSize: this.data.size.data,
          pageSizeOptions: this.data.size.list,
          showSizeChanger: this.data.size.show,
          showQuickJumper: this.data.jumper
        },
        on: {
          change: (page: number, size: number) => {
            if (this.auto) {
              this.data.setPage(page)
            }
            this.$emit('page', page, size)
          },
          showSizeChange: (page: number, size: number) => {
            if (this.auto) {
              this.data.setPageAndSize({ page, size })
            }
            this.$emit('size', size, page)
          }
        }
      })
      if (this.data.$local) {
        paginationAttributes.merge(this.data.$local)
      }
      const render = h(Pagination, config.component.parseAttributes(paginationAttributes))
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
