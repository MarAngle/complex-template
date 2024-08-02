import { h, defineComponent, PropType, VNode } from 'vue'
import ModalView, { ModalViewProps } from './../src/ModalView'
import EditArea, { EditAreaProps } from './../src/EditArea'
import InfoArea, { InfoAreaProps } from './../src/InfoArea'

export type QuickEditTarget = 'edit' | 'info'

export interface QuickEditProps<T extends QuickEditTarget = 'edit'> {
  content: string | (() => VNode | VNode[])
  contentProps?: {
    id?: string
    class?: string
    style?: Record<string, any>
  }
  data?: Record<PropertyKey, any>
  type?: string
  target?: T
  targetProps: T extends 'edit' ? EditAreaProps : InfoAreaProps
  modalProps?: ModalViewProps
}

export default defineComponent({
  name: 'QuickEdit',
  emits: {
    submit: (_targetData: Record<string, any>, _originData: undefined | Record<string, any>, _type: string) => {
      return true
    }
  },
  props: {
    content: {
      type: [String, Function] as PropType<QuickEditProps<QuickEditTarget>['content']>,
      required: true
    },
    contentProps: {
      type: Object as PropType<QuickEditProps<QuickEditTarget>['contentProps']>
    },
    data: {
      type: Object as PropType<QuickEditProps<QuickEditTarget>['data']>
    },
    type: {
      type: String as PropType<QuickEditProps<QuickEditTarget>['type']>
    },
    target: {
      type: String as PropType<QuickEditProps<QuickEditTarget>['target']>
    },
    targetProps: {
      type: Object as PropType<QuickEditProps<QuickEditTarget>['targetProps']>,
      required: true
    },
    modalProps: {
      type: Object as PropType<QuickEditProps<QuickEditTarget>['modalProps']>,
      required: false
    }
  },
  methods: {
    showTarget() {
      (this.$refs.modal as InstanceType<typeof ModalView>).show()
      this.$nextTick(() => {
        (this.$refs.target as InstanceType<typeof EditArea | typeof InfoArea>).$show(this.type, this.data)
      })
    },
    renderContent() {
      return h('span', {
        class: 'complex-color-link',
        onClick: () => {
          this.showTarget()
        },
        ...this.contentProps
      }, typeof this.content === 'string' ? this.content : this.content())
    },
    renderPanel() {
      if (this.target !== 'info') {
        return h(ModalView, {
          ref: 'modal',
          width: 880,
          menu: ['cancel', 'submit'],
          submit: () => {
            return new Promise((resolve, reject) => {
              (this.$refs.target as InstanceType<typeof EditArea>).$submit().then(res => {
                this.$emit('submit', res.targetData, res.originData, res.type)
                resolve(res)
              }).catch(err => {
                reject(err)
              })
            })
          },
          ...this.modalProps
        }, {
          default: () => h(EditArea, {
            ref: 'target',
            ...this.targetProps
          })
        })
      } else {
        return h(ModalView, {
          ref: 'modal',
          width: 880,
          menu: ['close'],
          ...this.modalProps
        }, {
          default: () => h(InfoArea, {
            ref: 'target',
            ...this.targetProps
          })
        })
      }
    },
  },
  render() {
    return h('div', {
      class: 'complex-quick-panel'
    }, [
      this.renderContent(),
      this.renderPanel()
    ])
  }
})
