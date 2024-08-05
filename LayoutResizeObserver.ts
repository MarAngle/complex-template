import { Life } from "complex-utils"
import { PluginLayout } from "complex-plugin"

// ResizeObserver 在开始观察一个元素时，确实会立即触发回调一次，即使在观察开始时元素的尺寸没有发生变化。这个立即触发的回调提供了元素的初始尺寸信息。

class LayoutResizeObserver {
  static life = new Life()
  static init(layout: PluginLayout) {
    layout.onLife('main', {
      data: () => {
        this.life.trigger('resize')
      }
    })
  }
  static createResizeObserverEntry(target: Element, rect?: DOMRect): ResizeObserverEntry {
    if (!rect) {
      rect = target.getBoundingClientRect()
    }
    const computedStyle = getComputedStyle(target)
    const paddingWidth = parseFloat(computedStyle.paddingLeft || '0') + parseFloat(computedStyle.paddingRight || '0')
    const paddingHeight = parseFloat(computedStyle.paddingTop || '0') + parseFloat(computedStyle.paddingBottom || '0')
    const borderWidth = parseFloat(computedStyle.borderLeftWidth || '0') + parseFloat(computedStyle.borderRightWidth || '0')
    const borderHeight = parseFloat(computedStyle.borderTopWidth || '0') + parseFloat(computedStyle.borderBottomWidth || '0')
    const contentBoxSize = {
      inlineSize: rect.width - paddingWidth - borderWidth,
      blockSize: rect.height - paddingHeight - borderHeight
    }

    const borderBoxSize = {
      inlineSize: rect.width,
      blockSize: rect.height
    }
    return {
      target: target,
      contentRect: rect,
      borderBoxSize: [borderBoxSize],
      contentBoxSize: [contentBoxSize],
      devicePixelContentBoxSize: [contentBoxSize]
    }
  }

  private observer: (entries: ResizeObserverEntry[], observer: LayoutResizeObserver) => void
  private targetElements: Map<Element, DOMRect>
  private lifeEvent: string

  constructor(observer: (entries: ResizeObserverEntry[], observer: LayoutResizeObserver) => void) {
    this.observer = observer
    this.targetElements = new Map()
    this.lifeEvent = LayoutResizeObserver.life.on('resize', {
      data: () => {
        this.checkResize()
      }
    })!
  }

  observe(target: Element) {
    // 初始化目标元素的尺寸缓存
    this.targetElements.set(target, target.getBoundingClientRect())
    this.checkResize()
  }

  unobserve(target: Element) {
    this.targetElements.delete(target)
  }

  disconnect() {
    this.targetElements.clear()
    LayoutResizeObserver.life.off('resize', this.lifeEvent)
    this.lifeEvent = ''
  }

  private checkResize() {
    const entries: ResizeObserverEntry[] = []
    this.targetElements.forEach((lastRect, target) => {
      const rect = target.getBoundingClientRect()
      if (rect.width !== lastRect.width || rect.height !== lastRect.height) {
        // 尺寸变化，更新缓存并收集变更条目
        this.targetElements.set(target, rect)
        entries.push(LayoutResizeObserver.createResizeObserverEntry(target, rect))
      }
    })

    if (entries.length > 0) {
      this.observer(entries, this)
    }
  }
}

export default LayoutResizeObserver
