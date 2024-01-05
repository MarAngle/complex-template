import { defineComponent, h, PropType } from "vue"
import { InputFile } from "complex-component"
import { InputFileProps } from "complex-component/src/type"
import { DefaultEditFileOption, uploadFileDataType } from "complex-data/src/dictionary/DefaultEditFile"
import { DefaultEditButtonOption } from "complex-data/src/dictionary/DefaultEditButton"
import { Button } from "ant-design-vue"
import { ButtonType } from "ant-design-vue/es/button"
import icon from "../icon"

export interface ImportFileProps extends InputFileProps{
  name?: string
  menuType?: string
  menuIcon?: DefaultEditButtonOption['icon']
  loading?: boolean
  upload?: DefaultEditFileOption['upload']
  render?: {
    menu?: () => unknown
    content?: () => unknown
  }
}

export interface fileDataType {
  data: File
  url?: string
  name: string
}

export type importFileDataType = uploadFileDataType | fileDataType

export default defineComponent({
  name: 'ImportFile',
  props: {
    value: {
      type: [String, Number, File, Object]
    },
    name: {
      type: String,
      required: false,
      default: '上传'
    },
    menuType: {
      type: String,
      required: false
    },
    menuIcon: {
      type: [String, Function],
      required: false,
      default: 'upload'
    },
    upload: {
      type: Object as PropType<ImportFileProps['upload']>,
      required: false
    },
    render: {
      type: Object as PropType<ImportFileProps['render']>,
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
    multiple: {
      type: Boolean,
      required: false,
      default: false
    },
    max: {
      type: Number,
      required: false
    },
    min: {
      type: Number,
      required: false
    },
    append: {
      type: Boolean,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false
    },
    size: { // MB
      type: Number,
      required: false
    }
  },
  watch: {
    value: {
      immediate: true,
      handler: function(value) {
        !this.upload ? this.syncData(value) : this.syncUploadData(value)
      }
    }
  },
  data() {
    return {
      operate: false,
      file: {
        data: undefined,
        name: undefined,
        url: undefined
      } as Partial<importFileDataType>,
      list: [] as importFileDataType[]
    }
  },
  methods: {
    clearData() {
      if (!this.multiple) {
        if (this.file.data !== undefined) {
          this.file.data = undefined
          this.file.name = undefined
          this.file.url = undefined
        }
      } else {
        if (this.list.length > 0) {
          this.list = []
        }
      }
    },
    syncData(value?: File | File[]) {
      if (!this.multiple) {
        if (value) {
          const file = value as File
          if (this.file.data !== file) {
            this.setData(file, 'watch')
          }
        } else {
          this.clearData()
        }
      } else {
        if (value) {
          for (let i = 0; i < (value as File[]).length; i++) {
            const file = (value as File[])[i]
            this.setData(file, 'watch')
          }
        } else {
          this.clearData()
        }
      }
    },
    syncUploadData(value?: string | string[]) {
      if (!this.multiple) {
        if (value) {
          const file = value as string
          if (this.file.data !== file) {
            this.setUploadData({
              data: file,
              name: file,
              url: file
            }, 'watch')
          }
        } else {
          this.clearData()
        }
      } else {
        if (value) {
          for (let i = 0; i < (value as string[]).length; i++) {
            const file = (value as string[])[i]
            this.setUploadData({
              data: file,
              name: file,
              url: file
            }, 'watch')
          }
        } else {
          this.clearData()
        }
      }
    },
    setData(file: File, from: 'change' | 'watch') {
      if (!this.multiple) {
        if (this.file.data !== file) {
          this.file.data = file
          this.file.name = file.name
          if (from === 'change') {
            this.emitData()
          }
        }
      } else {
        for (let i = 0; i < this.list.length; i++) {
          const item = this.list[i]
          if (item.data === file) {
            return
          }
        }
        const fileData = {
          data: file,
          name: file.name
        }
        this.list.push(fileData)
        if (from === 'change') {
          this.emitData()
        }
      }
    },
    setUploadData(file: uploadFileDataType, from: 'change' | 'watch') {
      if (!this.multiple) {
        if (this.file.data !== file.data) {
          this.file.data = file.data
          this.file.name = file.name
          this.file.url = file.url
          if (from === 'change') {
            this.emitData()
          }
        }
      } else {
        for (let i = 0; i < this.list.length; i++) {
          const item = this.list[i]
          if (item.data === file.data) {
            return
          }
        }
        this.list.push(file)
        if (from === 'change') {
          this.emitData()
        }
      }
    },
    emitData() {
      if (!this.multiple) {
        this.$emit('change', this.file.data)
      } else {
        this.$emit('change', this.list.map(item => item.data))
      }
    },
    renderInput() {
      return h(InputFile, {
        ref: 'file',
        accept: this.accept,
        multiple: this.multiple,
        max: this.max,
        min: this.min,
        append: this.append,
        disabled: this.disabled,
        size: this.size,
        onChange: (file: File) => {
          if (this.upload) {
            this.operate = true
            this.upload(file).then(res => {
              this.setUploadData(res.file, 'change')
            }).catch((err: unknown) => {
              console.error(err)
            }).finally(() => {
              this.operate = false
            })
          } else {
            this.setData(file, 'change')
          }
        }
      })
    },
    renderButton() {
      return h(Button, {
        loading: this.loading || this.operate,
        type: this.menuType === 'danger' ? 'primary' : this.menuType as ButtonType,
        danger: this.menuType === 'danger',
        icon: icon.parse(this.menuIcon as ImportFileProps['menuIcon']),
        disabled: this.disabled,
        onClick: () => {
          (this.$refs.file as InstanceType<typeof InputFile>).$el.click()
        }
      })
    },
    renderContent() {
      return h(InputFile)
    },
  },
  render() {
    return h('div', {
      class: 'complex-import-file'
    }, {
      default: () => [
        this.renderInput(),
        this.renderButton(),
        this.renderContent()
      ]
    })
  }
})
