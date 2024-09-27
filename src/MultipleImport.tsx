import { defineComponent, h, PropType, ref, watch, VNode, computed } from "vue"
import { useInjectFormItemContext } from "ant-design-vue/es/form"
import { notice } from "complex-plugin"
import { fileDataType } from "complex-data/type"
import { FileEditOption } from "complex-data/src/dictionary/FileEdit"
import { FileMultipleValue, FileValue, fileValueType } from "complex-data/src/lib/FileValue"
import { FileView } from "complex-component"
import { FileProps, MultipleFileProps } from "complex-component/type"
import { DefaultImportProps } from "./SingleImport"
import config from "../config"

export interface MultipleImportProps extends FileProps, MultipleFileProps, DefaultImportProps{
  value?: fileValueType[]
  upload?: FileEditOption<true>['upload']
}

export const defaultMultipleUpload = function(fileList: File[]) {
  return Promise.resolve({ file: fileList.map(file => { return { value: file, name: file.name} } ) })
} as NonNullable<MultipleImportProps['upload']>

export default defineComponent({
  name: 'MultipleImport',
  props: {
    value: {
      type: Array as PropType<MultipleImportProps['value']>
    },
    button: {
      type: Object as PropType<MultipleImportProps['button']>,
      required: false
    },
    complex: {
      type: Boolean as PropType<MultipleImportProps['complex']>,
      required: false
    },
    isUrl: {
      type: Boolean as PropType<MultipleImportProps['isUrl']>,
      required: false
    },
    image: {
      type: Object as PropType<MultipleImportProps['image']>,
      required: false
    },
    upload: {
      type: Function as PropType<MultipleImportProps['upload']>,
      required: false
    },
    render: {
      type: Object as PropType<MultipleImportProps['render']>,
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
      type: Object as PropType<MultipleImportProps['multiple']>,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false
    }
  },
  setup(props, { emit }) {
    const formItemContext = useInjectFormItemContext()
    const parseValue = function (value?: fileValueType[]) {
      return new FileMultipleValue((value || []).map(valueItem => new FileValue(valueItem, props.isUrl)))
    }
    const operate = ref(false)
    const currentValue = ref(props.value)
    const data = ref(parseValue(props.value))

    const syncValue = () => {
      // 此处基于外部数据整合内部数据
      if (props.value !== currentValue.value) {
        currentValue.value = props.value
      }
      // 多选模式下，value可能存在splice的改变或者是splice后重新赋值，此时需要将额外数据删除
      if (props.value) {
        data.value.assign(parseValue(props.value))
      } else {
        data.value.reset()
      }
    }

    watch(() => props.value, () => {
      syncValue()
      formItemContext.onFieldChange()
    })

    const onSelect = (file: File[]) => {
      operate.value = true;
      (props.upload || defaultMultipleUpload)(file).then(res => {
        onUpload(res.file, true)
      }).catch((err: unknown) => {
        console.error(err)
      }).finally(() => {
        operate.value = false
      })
    }

    const max = computed(() => {
      if (props.multiple) {
        return props.multiple.max || 0
      } else {
        return 0
      }
    })

    const onUpload = (fileList: fileDataType[], emit?: boolean) => {
      if (currentValue.value) {
        fileList.forEach(file => {
          // 通过data判断，避免complex模式下的判断错误
          if (!data.value.has(file.value)) {
            currentValue.value!.push(!props.complex ? file.value : file)
            data.value.push(new FileValue(file, props.isUrl))
          }
        })
      } else {
        currentValue.value = []
        fileList.forEach(file => {
          currentValue.value!.push(!props.complex ? file.value : file)
          data.value.push(new FileValue(file, props.isUrl))
        })
      }
      if (max.value && currentValue.value.length > max.value) {
        currentValue.value.length = max.value
        data.value.truncation(max.value)
        notice.message(`当前选择的文件数量超过限制值${max.value}，超过部分已被删除！`, 'error')
      }
      if (emit) {
        emitData()
      }
    }

    const emitData = () => {
      emit('change', currentValue.value)
    }

    const renderFile = () => {
      let disabled = props.disabled
      if (max.value && currentValue.value && currentValue.value.length >= max.value) {
        disabled = true
      }
      return h(FileView, {
        class: 'complex-import-file',
        ref: 'file',
        accept: props.accept,
        multiple: props.multiple,
        disabled: disabled,
        size: props.size,
        onSelect: onSelect,
        onChange(e: Event) {
          e.stopPropagation() // 阻止事件冒泡
        }
      })
    }

    const renderList = (list: FileMultipleValue) => {
      return h('div', {
        class: !props.image ? 'complex-import-content-list' : 'complex-import-image-list'
      }, {
        default: () => list.value.map((file, index) => {
          return renderContent(file, index)
        })
      })
    }

    const deleteData = (key: any, index: number) => {
      if (props.disabled || props.loading) {
        return
      }
      currentValue.value!.splice(index, 1)
      data.value.delete(key)
      emitData()
    }

    const renderContent = (file: FileValue, index: number) => {
      return config.import.renderContent(file, props.disabled, props.image, () => {
        deleteData(file.value, index)
      })
    }

    return {
      operate,
      currentValue,
      data,
      onSelect,
      onUpload,
      emitData,
      renderFile,
      renderList,
      deleteData,
      renderContent
    }
  },
  render() {
    let content: null | VNode | VNode[]
    if (this.$slots.content || (this.render && this.render.content)) {
      content = (this.$slots.content || this.render!.content)!({
        props: {
          multiple: this.multiple,
          upload: this.upload,
          value: this.currentValue,
          data: this.data
        }
      })
    } else {
      content = this.renderList(this.data)
    }
    return h('div', {
      class: 'complex-import'
    }, {
      default: () => [
        this.renderFile(),
        config.import.renderMenu(this as any),
        content
      ]
    })
  }
})
