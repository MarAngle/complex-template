import LayoutResizeObserver, { LayoutResizeObserverSupplement } from "./LayoutResizeObserver"


export type LocalResizeObserverType = (entry: ResizeObserverEntry) => void

class LocalResizeObserver {
  observer: ResizeObserver | LayoutResizeObserver
  $observer: LocalResizeObserverType
  targetElements: Element[]
  constructor(observer: LocalResizeObserverType, supplement?: LayoutResizeObserverSupplement) {
    this.$observer = observer
    const observers = (entries: ResizeObserverEntry[]) => {
      entries.forEach(entry => {
        this.trigger(entry)
      })
    }
    if (window.ResizeObserver) {
      this.observer = new ResizeObserver(observers)
    } else {
      this.observer = new LayoutResizeObserver(observers, supplement)
    }
    this.targetElements = []
  }
  trigger(entry: ResizeObserverEntry) {
    if (this.targetElements.indexOf(entry.target) > -1) {
      this.$observer(entry)
    }
  }
  observe(target: Element) {
    this.observer.observe(target)
    this.targetElements.push(target)
  }
  unobserve(target: Element) {
    this.observer.unobserve(target)
    const index = this.targetElements.indexOf(target)
    this.targetElements.splice(index, 1)
  }
  disconnect() {
    this.observer.disconnect()
    this.targetElements = []
  }
}

export default LocalResizeObserver
