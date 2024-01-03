import { defineComponent, h, PropType } from "vue"
import { Button } from "ant-design-vue"
import { ButtonType } from "ant-design-vue/es/button"
import { isPromise } from "complex-utils"
import { DefaultEditButtonOption } from "complex-data/src/dictionary/DefaultEditButton"
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
  render() {
    if (!this.data.render) {
      const type = this.data.type
      const render = h(Button, {
        loading: !!this.data.loading || this.operate,
        type: type === 'danger' ? 'primary' : type as ButtonType,
        danger: type === 'danger',
        icon: icon.parse(this.data.icon),
        uploader: this.data.uploader,
        disabled: this.data.disabled,
        onClick: this.data.click ? e => {
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
        } : e => {
          this.$emit('click', e)
        }
      }, {
        default: () => this.data.name
      })
      return render
    } else {
      return this.data.render({
        data: this.data
      })
    }
  }
})
