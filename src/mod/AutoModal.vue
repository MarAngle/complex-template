<template>
  <a-modal
    v-bind="currentOptionProps"
    @cancel="onCancel"
    @ok="onOk"
  >
    <slot :show="visible" :height="height" :width="width" />
  </a-modal>
</template>

<script>

export default {
  name: `AutoModal`,
  data () {
    return {
      visible: false,
      title: undefined,
      option: {
        props: null,
        auto: null
      }
    }
  },
  props: {
    auto: {
      type: Object,
      required: false,
      default: function() {
        return null
      }
    },
    optionProps: {
      type: Object,
      required: false,
      default: function() {
        return null
      }
    },
    onEvent: {
      type: Function,
      required: false,
      default: function() {
        return null
      }
    },
    top: {
      type: Number,
      required: false,
      default: 100
    },
    bottom: {
      type: Number,
      required: false,
      default: 100
    },
    header: {
      type: Number,
      required: false,
      default: 55
    },
    menu: {
      type: Number,
      required: false,
      default: 53
    }
  },
  computed: {
    currentOptionProps() {
      let optionProps = {
        dialogStyle: {}
      }
      if (this.optionProps) {
        for (const prop in this.optionProps) {
          optionProps[prop] = this.optionProps[prop]
        }
      }
      if (this.option.props) {
        for (const prop in this.option.props) {
          optionProps[prop] = this.option.props[prop]
        }
      }
      if (this.title !== undefined) {
        optionProps.title = this.title
      }
      optionProps.dialogStyle.top = this.top + 'px'
      optionProps.visible = this.visible
      return optionProps
    },
    currentAuto() {
      let currentAuto = {}
      if (this.auto) {
        currentAuto = this.auto
      }
      if (this.option.auto) {
        for (const prop in this.option.auto) {
          currentAuto[prop] = this.option.auto[prop]
        }
      }
      if (currentAuto.cancel === undefined) {
        currentAuto.cancel = true
      }
      if (currentAuto.ok === undefined) {
        currentAuto.ok = true
      }
      return currentAuto
    },
    height() {
      let mainHeight = this._func.page.data.body.height
      return mainHeight - this.top - this.bottom - this.header - this.menu
    },
    width() {
      let width = 520
      if (this.currentOptionProps.width) {
        width = this.currentOptionProps.width
      }
      return width
    }
  },
  mounted() {
    this.pageLoad()
  },
  methods: {
    pageLoad() {
    },
    initOption(option) {
      this.resetOption()
      if (option) {
        if (option.props) {
          this.option.props = option.props
        }
        if (option.auto) {
          this.option.auto = option.auto
        }
      }
    },
    resetOption() {
      this.option.props = null
      this.option.auto = null
    },
    show(title, option) {
      this.visible = true
      this.title = title
      this.initOption(option)
      if (this.onEvent) {
        this.onEvent('show')
      }
    },
    hide(from) {
      this.visible = false
      if (this.onEvent) {
        this.onEvent('hide', from)
      }
      this.resetOption()
    },
    onCancel() {
      if (this.currentAuto.cancel) {
        this.hide('cancel')
      }
      if (this.onEvent) {
        this.onEvent('cancel')
      }
    },
    onOk() {
      if (this.currentAuto.ok) {
        this.hide('ok')
      }
      if (this.onEvent) {
        this.onEvent('ok')
      }
    }
  }
}
</script>
