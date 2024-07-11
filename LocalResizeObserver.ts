import { Life } from "complex-utils"
import { PluginLayout } from "complex-plugin"

const mainResizeControl = {
  layout: null as null | PluginLayout,
  life: new Life(),
  setLayout(layout: PluginLayout) {
    this.layout = layout
    layout.onLife('resize', {
      data: () => {
        this.life.trigger('resize')
      }
    })!
  }
}


class LocalResizeObserver {
  observe?: ResizeObserver
  life?: string
  constructor(pluginLayout: PluginLayout) {
    if (!window.ResizeObserver) {
      if (!mainResizeControl.layout) {
        mainResizeControl.layout = pluginLayout
      }
    }
  }
  init(target: Element, cb: (entry?: ResizeObserverEntry) => void) {
    if (window.ResizeObserver) {
      this.observe = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === target) {
            cb(entry)
          }
        }
      })
      this.observe.observe(target)
    } else {
      this.life = mainResizeControl.life.on('resize', {
        data() {
          cb()
        }
      })
    }
  }
  destroy() {
    if (this.observe) {
      this.observe.disconnect()
      this.observe = undefined
    } else if (this.life !== undefined) {
      mainResizeControl.life.off('resize', this.life)
      this.life = undefined
    }
  }
}

export default LocalResizeObserver
