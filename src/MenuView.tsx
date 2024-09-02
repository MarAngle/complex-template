import { defineComponent, h, PropType } from "vue"
import { Button } from "ant-design-vue"
import { ButtonType } from "ant-design-vue/es/button"
import { isPromise } from "complex-utils"
import { MenuValue } from "complex-data/type"
import icon from "../icon"
import config from "../config"

export default defineComponent({
  name: 'MenuView',
  props: {
    data: {
      type: Object as PropType<MenuValue<any>>,
      required: true
    },
    disabled: {
      type: Boolean,
      required: false
    },
    loading: {
      type: Boolean,
      required: false
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
      let loading = this.operate
      if (!loading) {
        loading = this.loading || (typeof this.data.loading === 'function' ? this.data.loading() : (this.data.loading || false))
      }
      const disabled = this.disabled || (typeof this.data.disabled === 'function' ? this.data.disabled() : (this.data.disabled || false))
      const render = h(Button, {
        class: 'complex-menu',
        loading: loading,
        type: type === 'danger' ? 'primary' : type as ButtonType,
        danger: type === 'danger',
        icon: icon.parse(this.data.icon),
        disabled: disabled,
        onClick: (e: Event) => {
          config.parseMenuConfirm(this.data.confirm, () => {
            this.$emit('click', e)
            if (this.data.click) {
              const res = this.data.click(e)
              if (isPromise(res)) {
                this.operate = true
                res.finally(() => {
                  if (this.data.debounce) {
                    setTimeout(() => {
                      this.operate = false
                    }, this.data.debounce)
                  } else {
                    this.operate = false
                  }
                })
              } else {
                if (this.data.debounce) {
                  this.operate = true
                  setTimeout(() => {
                    this.operate = false
                  }, this.data.debounce)
                }
              }
            }
          })
        },
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
  }
})
