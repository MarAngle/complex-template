import { defineComponent, h, PropType } from "vue"
import { FileProps } from "complex-component/src/type"
import { DefaultEditFileOption } from "complex-data/src/dictionary/DefaultEditFile"

export interface ImportProps extends FileProps{
  name?: NonNullable<DefaultEditFileOption['button']>['name']
  type?: NonNullable<DefaultEditFileOption['button']>['type']
  icon?: NonNullable<DefaultEditFileOption['button']>['icon']
  upload?: DefaultEditFileOption['upload']
  loading?: boolean
  render?: {
    menu?: () => unknown
    content?: () => unknown
  }
}

export default defineComponent({
  name: 'ImportView',
  props: {
    value: {
      type: [String, Object]
    },
    name: {
      type: String,
      required: false,
      default: '上传'
    },
    type: {
      type: String,
      required: false
    },
    icon: {
      type: [String, Function],
      required: false,
      default: 'upload'
    },
    upload: {
      type: Object as PropType<ImportProps['upload']>,
      required: false
    },
    render: {
      type: Object as PropType<ImportProps['render']>,
      required: false
    },
    loading: {
      type: Boolean,
      required: false
    },
    accept: {
      type: String,
      required: false
    },
    size: { // MB
      type: Number,
      required: false
    },
    multiple: {
      type: Object as PropType<ImportProps['multiple']>,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false
    }
  },
  render() {
    return h('div', {
      class: 'complex-import'
    }, {
      // default: () => [
      //   this.renderFile(),
      //   this.renderMenu(),
      //   this.renderList()
      // ]
    })
  }
})
