import { defineComponent, h, PropType } from "vue"
import { Button } from "ant-design-vue"
import { ButtonType } from "ant-design-vue/es/button"
import { isPromise } from "complex-utils"
import { DefaultEditButtonGroupOption } from "complex-data/src/dictionary/DefaultEditButtonGroup"
import icon from "../icon"

export default defineComponent({
  name: 'ButtonView',
  props: {
    data: {
      type: Object as PropType<DefaultEditButtonGroupOption>,
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
      const render = h(Button, {
        loading: !!this.data.loading || this.operate,
        type: this.data.type as ButtonType,
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
          this.$emit('click', e, this.data.prop)
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
