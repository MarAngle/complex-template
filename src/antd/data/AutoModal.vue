<template>
  <Modal
    v-bind="currentOptionProps"
    :visible="visible"
    @cancel="onCancel"
    @ok="onOk"
  >
    <slot :show="visible" :height="height" :width="width" :modal="currentModal" />
  </Modal>
</template>

<script lang="ts">
import { Modal } from "ant-design-vue"
import { defineComponent } from "vue"
import { layout } from 'complex-plugin'
import config from "../config"

export default defineComponent({
  name: `ComplexAutoModal`,
  components: {
    Modal
  },
  data () {
    const data: {
      title?: string,
      visible: boolean,
      option: {
        props: null | Record<PropertyKey, any>,
        auto: null | Record<PropertyKey, any>
      }
    } = {
      visible: false,
      title: undefined,
      option: {
        props: null,
        auto: null
      }
    }
    return data
  },
  props: {
    optionProps: {
      type: Object,
      required: false,
      default: () => {
        return null
      }
    },
    menuType: {
      type: [String, Boolean],
      required: false,
      default: ''
    },
    auto: {
      type: Object,
      required: false,
      default: () => {
        return null
      }
    },
    onEvent: {
      type: Function,
      required: false,
      default: () => {
        return null
      }
    },
    top: {
      type: Number,
      required: false,
      default: config.AutoModal.top
    },
    bottom: {
      type: Number,
      required: false,
      default: config.AutoModal.bottom
    },
    header: {
      type: Number,
      required: false,
      default: config.AutoModal.header
    },
    menu: {
      type: Number,
      required: false,
      default: config.AutoModal.menu
    },
    padding: {
      type: Object,
      required: false,
      default: () => {
        return config.AutoModal.padding
      }
    }
  },
  computed: {
    currentOptionProps() {
      const optionProps: any = {
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
      if (this.menuType) {
        optionProps.cancelButtonProps = {
          style: {
            display: 'none'
          }
        }
        optionProps.okType = this.menuType
      } else if (this.menuType === false) {
        optionProps.footer = null
      }
      optionProps.dialogStyle.top = this.top + 'px'
      return optionProps
    },
    currentAuto() {
      let currentAuto: any = {}
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
      const mainHeight = layout.data.body.height
      let height = mainHeight - this.top - this.bottom - this.header - this.padding.height
      if (this.currentOptionProps.footer !== null) {
        height = height - this.menu
      }
      return height
    },
    width() {
      let width = config.AutoModal.defaultWidth
      if (this.currentOptionProps.width) {
        width = this.currentOptionProps.width
      }
      return width - this.padding.width
    },
    currentModal() {
      return this
    }
  },
  methods: {
    initOption(option?: Record<PropertyKey, any>) {
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
    show(title?: string, option?: Record<PropertyKey, any>) {
      this.visible = true
      this.title = title
      this.initOption(option)
      if (this.onEvent) {
        this.onEvent('show')
      }
    },
    hide(from?: string) {
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
})
</script>
