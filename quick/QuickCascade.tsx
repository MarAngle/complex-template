import { defineComponent, h, PropType, VNode } from "vue"
import { AutoItemPayloadType } from "../src/dictionary/AutoItem"
import { tablePayload } from "../src/TableView"
import ModalView, { ModalViewProps } from "../src/ModalView"
import QuickList, { QuickListProps } from "./QuickList"

export interface QuickCascadeProps {
  list: QuickListProps
  sublist: {
    name: string
    props: QuickListProps
    show?: (payload: tablePayload) => void
    modal?: Partial<ModalViewProps> // 子列表弹窗配置
    render?: (props: QuickListProps) => VNode
  }
}

export default defineComponent({
  name: 'QuickCascade',
  emits: {
    search: (prop: string, _payload: AutoItemPayloadType<'edit'>)  => {
      return !!prop
    },
    table: (prop: string, _payload: tablePayload)  => {
      return !!prop
    },
    subSearch: (prop: string, _payload: AutoItemPayloadType<'edit'>)  => {
      return !!prop
    },
    subTable: (prop: string, _payload: tablePayload)  => {
      return !!prop
    },
  },
  props: {
    list: {
      type: Object as PropType<QuickCascadeProps['list']>,
      required: true
    },
    sublist: {
      type: Object as PropType<QuickCascadeProps['sublist']>,
      required: true
    }
  },
  methods: {
    renderList() {
      return h(QuickList, {
        ref: 'list',
        onSearch: (prop, payload) => {
          this.$emit('search', prop, payload)
        },
        onTable: (prop, payload) => {
          this.$emit('table', prop, payload)
          if (prop === '$sublist') {
            this.openSublist(payload)
          }
        },
        ...this.list
      })
    },
    renderSublist() {
      return h(
        ModalView,
        {
          ref: 'sublist-modal',
          menu: ['close'],
          ...this.sublist.modal
        },
        {
          default: () => this.$renderSublist()
        }
      )
    },
    $renderSublist() {
      if (!this.sublist.render) {
        return h(QuickList, {
          ref: 'sublist',
          onSearch: (prop, payload) => {
            this.$emit('subSearch', prop, payload)
          },
          onTable: (prop, payload) => {
            this.$emit('subTable', prop, payload)
          },
          ...this.sublist.props
        })
      } else {
        return this.sublist.render(this.sublist.props)
      }
    },
    openSublist(payload: tablePayload) {
      (this.$refs['sublist-modal'] as InstanceType<typeof ModalView>).show(this.sublist.name)
      if (this.sublist.show) {
        this.sublist.show(payload)
      }
    },
  },

  /**
   * 主要模板

   * @returns {VNode}
   */
  render() {
    return [this.renderList(), this.renderSublist()]
  }
})
