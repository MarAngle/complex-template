import { defineComponent, h, PropType } from "vue"
import { Modal } from "ant-design-vue"
import { DefaultEditButtonInitOption } from "complex-data/src/dictionary/DefaultEditButton"

export default defineComponent({
  name: 'ModalView',
  props: {
    menu: {
      type: Object as PropType<string | DefaultEditButtonInitOption['option'][]>,
      required: false
    }
  },
  data() {
    return {
      visible: false,
      title: undefined as undefined | string
    }
  },
  computed: {},
  methods: {
    renderContent() {
      return null
    },
    renderFooter() {
      return null
    }
  },
  render() {
    const render = h(Modal, { class: 'complex-modal-view' }, {
      default: () => [this.renderContent(), this.renderFooter()]
    })
    return render
  }
})
