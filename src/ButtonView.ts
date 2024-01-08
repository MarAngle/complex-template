import { defineComponent, h, PropType } from "vue"
import { Button } from "ant-design-vue"
import { ButtonType } from "ant-design-vue/es/button"
import { isPromise } from "complex-utils"
import { DefaultEditButtonOption } from "complex-data/src/dictionary/DefaultEditButton"
import { InputFile } from "complex-component"
import icon from "../icon"

export default defineComponent({
  name: 'ButtonView',
  props: {
    data: {
      type: Object as PropType<DefaultEditButtonOption>,
      required: true
    }
  },
  data() {
    return {
      operate: false
    }
  },
  methods: {
    renderFile() {
      return h(InputFile, {
        class: 'complex-button-file',
        ref: 'file',
        ...this.data.uploadOption,
        onChange: (file: File) => {
          this.operate = true
          this.data.upload!(file).finally(() => {
            this.operate = false
          })
        }
      })
    },
    renderButton(upload: boolean) {
      if (!this.data.render) {
        const type = this.data.type
        let loading = this.operate
        if (!loading) {
          loading = typeof this.data.loading === 'function' ? this.data.loading() : (this.data.loading || false)
        }
        const disabled = typeof this.data.disabled === 'function' ? this.data.disabled() : (this.data.disabled || false)
        const render = h(Button, {
          class: 'complex-button',
          loading: loading,
          type: type === 'danger' ? 'primary' : type as ButtonType,
          danger: type === 'danger',
          icon: icon.parse(this.data.icon),
          upload: this.data.upload,
          disabled: disabled,
          onClick: this.getClick(upload),
          ...this.$attrs
        }, {
          default: () => this.data.name
        })
        return render
      } else {
        return this.data.render({
          data: this.data
        })
      }
    },
    getClick(upload: boolean) {
      if (!upload) {
        return this.data.click ? (e: Event) => {
          const res = this.data.click!({
            targetData: this.data as unknown as Record<PropertyKey, unknown>,
            type: 'click',
            payload: {
              event: e
            }
          })
          if (isPromise(res)) {
            this.operate = true
            res.finally(() => {
              this.operate = false
            })
          }
        } : (e: Event) => {
          this.$emit('click', e)
        }
      } else {
        return () => {
          (this.$refs.file as InstanceType<typeof InputFile>).$el.click()
        }
      }
    }
  },
  render() {
    if (this.data.upload) {
      return [this.renderFile(), this.renderButton(true)]
    } else {
      return this.renderButton(false)
    }
  }
})
