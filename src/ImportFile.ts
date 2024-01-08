import { defineComponent, h, PropType } from "vue"
import { InputFile } from "complex-component"
import { InputFileProps } from "complex-component/src/type"
import { DefaultEditFileOption, uploadFileDataType } from "complex-data/src/dictionary/DefaultEditFile"
import { DefaultEditButtonOption } from "complex-data/src/dictionary/DefaultEditButton"
import { Button } from "ant-design-vue"
import { ButtonType } from "ant-design-vue/es/button"
import icon, { iconDict } from "../icon"
import { downloadFile } from "complex-utils"

export interface ImportProps extends InputFileProps{
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

export type importDataType = uploadFileDataType | fileDataType

export default defineComponent({
  name: 'ImportView',
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
      } as Partial<importDataType>,
      list: [] as importDataType[]
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
    removeData(index?: number) {
      if (index === undefined) {
        this.clearData()
      } else {
        this.list.splice(index, 1)
      }
      this.emitData()
    },
    emitData() {
      if (!this.multiple) {
        this.$emit('change', this.file.data)
      } else {
        this.$emit('change', this.list.map(item => item.data))
      }
    },
    renderFile() {
      return h(InputFile, {
        class: 'complex-import-file',
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
    renderMenu() {
      return h(Button, {
        class: 'complex-import-menu',
        loading: this.loading || this.operate,
        type: this.menuType === 'danger' ? 'primary' : this.menuType as ButtonType,
        danger: this.menuType === 'danger',
        icon: icon.parse(this.menuIcon as ImportProps['menuIcon']),
        disabled: this.disabled,
        onClick: () => {
          (this.$refs.file as InstanceType<typeof InputFile>).$el.click()
        }
      })
    },
    renderList() {
      if (!this.multiple) {
        if (this.file.data) {
          return h('div', {
            class: 'complex-import-list'
          }, {
            default: () => this.renderItem(this.file as importDataType)
          })
        }
      } else {
        return h('div', {
          class: 'complex-import-list'
        }, {
          default: () => this.list.map((item, index) => {
            return this.renderItem(item, index)
          })
        })
      }
      return null
    },
    renderItem(data: importDataType, index?: number) {
      return h('div', {
        class: 'complex-import-item'
      }, {
        default: [
          h('span', {
            class: 'complex-import-item-name',
            onClick: () => {
              if (data.url) {
                downloadFile(data.url, data.name)
              }
            }
          }, {
            default: () => data.name
          }),
          h('span', {
            class: 'complex-import-item-delete',
            onClick: () => {
              this.removeData(index)
            }
          }, {
            default: () => iconDict.parse('close')
          }),
        ]
      })
    }
  },
  render() {
    return h('div', {
      class: 'complex-import'
    }, {
      default: () => [
        this.renderFile(),
        this.renderMenu(),
        this.renderList()
      ]
    })
  }
})
