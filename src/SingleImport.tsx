import { defineComponent, h, PropType, ref, watch, VNode } from "vue"
import { useInjectFormItemContext } from "ant-design-vue/es/form"
import { defaultFileOption, fileDataType } from "complex-data/type"
import { FileEditOption } from "complex-data/src/dictionary/FileEdit"
import { FileValue, fileValueType } from "complex-data/src/lib/FileValue"
import { FileView } from "complex-component"
import { FileProps } from "complex-component/type"
import config from "../config"

export interface DefaultImportProps {
  button?: defaultFileOption['button']
  complex?: defaultFileOption['complex']
  isUrl?: defaultFileOption['isUrl']
  image?: defaultFileOption['image']
  loading?: boolean
  render?: {
    menu?: () => (VNode | VNode[])
    content?: () => (VNode | VNode[])
  }
}

export interface SingleImportProps extends FileProps, DefaultImportProps {
  value?: fileValueType
  upload?: FileEditOption<false>['upload']
}

export const defaultUpload = function(file: File) {
  return Promise.resolve({ file: { value: file, name: file.name } })
} as NonNullable<SingleImportProps['upload']>

export default defineComponent({
  name: 'SingleImport',
  props: {
    value: {
      type: [String, Object] as PropType<SingleImportProps['value']>
    },
    button: {
      type: Object as PropType<SingleImportProps['button']>,
      required: false
    },
    complex: {
      type: Boolean as PropType<SingleImportProps['complex']>,
      required: false
    },
    isUrl: {
      type: Boolean as PropType<SingleImportProps['isUrl']>,
      required: false
    },
    image: {
      type: Object as PropType<SingleImportProps['image']>,
      required: false
    },
    upload: {
      type: Function as PropType<SingleImportProps['upload']>,
      required: false
    },
    render: {
      type: Object as PropType<SingleImportProps['render']>,
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
    disabled: {
      type: Boolean,
      required: false
    }
  },
  setup(props, { emit }) {
    const formItemContext = useInjectFormItemContext()
    const parseValue = function (value?: fileValueType) {
      return value ? new FileValue(value, props.isUrl) : undefined
    }
    const operate = ref(false)
    const currentValue = ref(props.value)
    const data = ref(parseValue(props.value))

    const syncValue = () => {
      if (props.value !== currentValue.value) {
        currentValue.value = props.value
      }
      data.value = parseValue(props.value)
    }

    watch(() => props.value, () => {
      syncValue()
      formItemContext.onFieldChange()
    })

    const onSelect = (file: File) => {
      operate.value = true;
      (props.upload || defaultUpload)(file).then(res => {
        onUpload(res.file, true)
      }).catch((err: unknown) => {
        console.error(err)
      }).finally(() => {
        operate.value = false
      })
    }

    const onUpload = (file: fileDataType, emit?: boolean) => {
      if (!data.value || data.value.value !== file.value) {
        currentValue.value = !props.complex ? file.value : file
        data.value = new FileValue(file, props.isUrl)
        if (emit) {
          emitData()
        }
      }
    }

    const emitData = () => {
      emit('change', currentValue.value)
    }

    const renderFile = () => {
      return h(FileView, {
        class: 'complex-import-file',
        ref: 'file',
        accept: props.accept,
        disabled: props.disabled,
        size: props.size,
        onSelect: onSelect,
        onChange(e: Event) {
          e.stopPropagation() // 阻止事件冒泡
        }
      })
    }

    const deleteData = () => {
      if (props.disabled || props.loading) {
        return
      }
      currentValue.value = undefined
      data.value = undefined
      emitData()
    }

    const renderContent = (file?: FileValue) => {
      return (file && file.value) ? config.import.renderContent(file, props.disabled, props.image, () => {
        deleteData()
      }) : null
    }

    return {
      operate,
      currentValue,
      data,
      onSelect,
      onUpload,
      emitData,
      renderFile,
      deleteData,
      renderContent
    }
  },
  render() {
    let content: null | VNode | VNode[]
    if (this.$slots.content || (this.render && this.render.content)) {
      content = (this.$slots.content || this.render!.content)!({
        props: {
          upload: this.upload,
          value: this.currentValue,
          data: this.data,
        }
      })
    } else {
      content = this.renderContent(this.data)
    }
    return h('div', {
      class: 'complex-import',
    }, {
      default: () => [
        this.renderFile(),
        config.import.renderMenu(this as any),
        content,
      ]
    })
  }
})