import { Life } from "complex-utils"
import { PluginLayout } from "complex-plugin"

export const resizeControl = {
  life: new Life(),
  init(layout: PluginLayout) {
    layout.onLife('main', {
      data: () => {
        this.life.trigger('resize')
      }
    })!
  }
}

// ResizeObserver 在开始观察一个元素时，确实会立即触发回调一次，即使在观察开始时元素的尺寸没有发生变化。这个立即触发的回调提供了元素的初始尺寸信息。

class LocalResizeObserver {
  observe?: ResizeObserver
  life?: string
  init(target: Element, cb: (entry?: ResizeObserverEntry) => void, otherObserver?: () => void) {
    if (window.ResizeObserver) {
      this.observe = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === target) {
            cb(entry)
            break
          }
        }
      })
      this.observe.observe(target)
    } else {
      this.life = resizeControl.life.on('resize', {
        immediate: true, // 模拟ResizeObserver立即触发回调操作
        data() {
          cb()
        }
      })
      if (otherObserver) {
        otherObserver()
      }
    }
  }
  destroy() {
    if (this.observe) {
      this.observe.disconnect()
      this.observe = undefined
    } else if (this.life !== undefined) {
      resizeControl.life.off('resize', this.life)
      this.life = undefined
    }
  }
}

export default LocalResizeObserver
