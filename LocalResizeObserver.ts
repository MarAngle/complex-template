import LayoutResizeObserver from "./LayoutResizeObserver"


export type LocalResizeObserverType = (entry: ResizeObserverEntry) => void

class LocalResizeObserver {
  observer: ResizeObserver | LayoutResizeObserver
  $observer: LocalResizeObserverType
  list: Element[]
  constructor(observer: LocalResizeObserverType) {
    this.$observer = observer
    this.observer = new (window.ResizeObserver ? ResizeObserver : LayoutResizeObserver)(entries => {
      entries.forEach(entry => {
        this.trigger(entry)
      })
    })
    this.list = []
  }
  trigger(entry: ResizeObserverEntry) {
    if (this.list.indexOf(entry.target) > -1) {
      this.$observer(entry)
    }
  }
  observe(target: Element) {
    this.observer.observe(target)
    this.list.push(target)
  }
  unobserve(target: Element) {
    this.observer.unobserve(target)
    const index = this.list.indexOf(target)
    this.list.splice(index, 1)
  }
  disconnect() {
    this.observer.disconnect()
    this.list = []
  }
}

export default LocalResizeObserver
