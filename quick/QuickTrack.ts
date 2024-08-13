import { getNum } from "complex-utils"
import { notice } from "complex-plugin"
import { Data } from "complex-data"

export type trackStatus = 'stop' | 'pause' | 'moving'
export type trackPointProp = 'start' | 'current' | 'end'
export type trackLineProp = 'total' | 'current'
export type directionProp = 'forward' | 'backward'
export type lnglatType = {
  lng: number
  lat: number
}

abstract class QuickTrack<
  VALUE extends any = Record<PropertyKey, any>,
  MAP extends Record<PropertyKey, any> = Record<PropertyKey, any>,
  LNGLAT extends Record<PropertyKey, any> = Record<PropertyKey, any>,
  ICON extends any = any,
  POINT extends Record<PropertyKey, any> = Record<PropertyKey, any>,
  LINE extends Record<PropertyKey, any> = Record<PropertyKey, any>,
  CONNECT extends any = any
> extends Data {
  static $name = 'QuickTrack'
  static $formatConfig = { name: 'QuickTrack', level: 50, recommend: true }
  static parseAngle (currentLnglat: lnglatType, nextLnglat: lnglatType) {
    if (currentLnglat && nextLnglat) {
      const rad = Math.PI / 180
      const lat1 = currentLnglat.lat * rad
      const lat2 = nextLnglat.lat * rad
      const lng1 = currentLnglat.lng * rad
      const lng2 = nextLnglat.lng * rad
      const x = Math.sin(lng2 - lng1) * Math.cos(lat2)
      const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1)
      const radians = Math.atan2(x, y)
      let angle = radians % (2 * Math.PI)
      angle = (180 * radians) / Math.PI
      return angle
    } else {
      return undefined
    }
  }
  status: {
    init: boolean
    data: boolean
    drag: boolean
    last: '' | trackStatus
    current: trackStatus
  }
  $map?: MAP
  $marker: {
    line: {
      data: LINE[]
      current: LINE[]
    }
    connect: CONNECT[]
    icon: Record<trackPointProp, undefined | ICON>
    point: Record<trackPointProp, undefined | POINT>
  }
  $index: {
    current: {
      data: number
      line: number
    }
    next: {
      data: number
      line: number
    }
  }
  speed: {
    base: number
    rate: number
    current: number
  }
  nextTimer?: number
  percent: number
  data: {
    dict: number[]
    list: VALUE[]
    lnglat: LNGLAT[]
    size: number
  }

  constructor() {
    super()
    this.status = {
      init: false,
      data: false,
      last: '',
      current: 'stop',
      drag: false
    }
    this.$index = {
      current: {
        data: 0,
        line: 0
      },
      next: {
        data: 1,
        line: 0
      }
    }
    this.speed = {
      base: 200,
      rate: 1,
      current: 200
    }
    this.$marker = {
      icon: {
        start: undefined,
        end: undefined,
        current: undefined
      },
      point: {
        start: undefined,
        end: undefined,
        current: undefined
      },
      line: {
        data: [],
        current: []
      },
      connect: [],
    }
    this.percent = 0
    this.data = {
      dict: [],
      list: [],
      lnglat: [],
      size: -1
    }
  }
  abstract checkData(value: VALUE): boolean
  abstract resetMap(map: MAP): void
  abstract clearOverlay(map: MAP, marker: LINE | POINT | CONNECT, type: 'point' | 'line' | 'connect'): LINE
  abstract autoView(map: MAP, lnglatList: LNGLAT[]): void
  abstract parseLnglat(lnglat: LNGLAT): lnglatType
  abstract buildIcon(prop: trackPointProp): ICON
  abstract buildLnglat(value: VALUE): LNGLAT
  abstract buildPoint(prop: trackPointProp, map: MAP, icon: ICON, lnglat: LNGLAT): POINT
  abstract buildLine(prop: trackLineProp, map: MAP, lnglat: LNGLAT[]): LINE
  abstract buildConnect(option: { start: LNGLAT, startIndex: number, end: LNGLAT, endIndex: number }): CONNECT
  abstract movePoint(point: POINT, option: { lastIndex: number, index: number, lnglat: LNGLAT, nextIndex: number, nextLnglat: LNGLAT, angle?: number }): void
  abstract moveLine(option: { direction: directionProp, line: LINE, list: LNGLAT[] }): void
  abstract moveConnect(option: { direction: directionProp, connect: CONNECT }): void
  $initMap(map: MAP, next?: boolean) {
    this.$map = map
    if (next) {
      this.$initLine()
    }
  }
  $resetMap() {
    if (this.$map) {
      this.resetMap(this.$map)
    }
    this.$map = undefined
  }
  initData(originList: any[], line?: boolean) {
    this.resetData()
    let list: any[] = []
    let size = 0
    for (let i = 0; i < originList.length; i++) {
      const originRoadList = originList[i]
      if (originRoadList && originRoadList.length > 0) {
        let length = 0
        originRoadList.forEach((lineValue: any) => {
          if (this.checkData(lineValue)) {
            length++
            list.push(lineValue)
          }
        })
        if (length > 0) {
          size += length
          this.data.dict.push(size - 1)
        }
      }
    }
    this.data.list = list
    this.data.size = list.length - 1
    this.status.data = true
    if (line) {
      this.$initLine()
    }
  }
  resetData() {
    this.status.data = false
    this.data.dict = []
    this.data.list = []
    this.data.lnglat = []
    this.data.size = -1
  }
  $getRoadIndex(index: number) {
    for (let i = 0; i < this.data.dict.length; i++) {
      const lineIndex = this.data.dict[i]
      if (index <= lineIndex) {
        return i
      }
    }
    return this.data.dict.length - 1
  }
  $getRoadList(index: number, endIndex?: number) {
    if (endIndex === undefined) {
      endIndex = this.data.dict[index]
    }
    const startIndex = index == 0 ? 0 : this.data.dict[index - 1] + 1
    return this.data.lnglat.slice(startIndex, endIndex + 1)
  }
  $initIcon(force?: boolean) {
    if (force) {
      this.$marker.icon.start = this.buildIcon('start')
      this.$marker.icon.end = this.buildIcon('end')
      this.$marker.icon.current = this.buildIcon('current')
    } else {
      if (!this.$marker.icon.start) {
        this.$marker.icon.start = this.buildIcon('start')
      }
      if (!this.$marker.icon.end) {
        this.$marker.icon.end = this.buildIcon('end')
      }
      if (!this.$marker.icon.current) {
        this.$marker.icon.current = this.buildIcon('current')
      }
    }
  }
  $initLine(force?: boolean) {
    if (this.$map && this.status.data) {
      this.$reset()
      if (this.data.size > 0) {
        this.$initIcon(force)
        this.data.lnglat = this.data.list.map(lineValue => {
          return this.buildLnglat(lineValue)
        })
        const startLnglat = this.data.lnglat[0]
        const endLnglat = this.data.lnglat[this.data.size]
        this.$marker.point.end = this.buildPoint('end', this.$map, this.$marker.icon.end!, endLnglat)
        this.$marker.point.start = this.buildPoint('start', this.$map, this.$marker.icon.start!, startLnglat)
        this.$marker.point.current = this.buildPoint('current', this.$map, this.$marker.icon.current!, startLnglat)
        let startIndex = 0
        for (let i = 0; i < this.data.dict.length; i++) {
          const currentIndex = this.data.dict[i]
          const lineList = this.$getRoadList(i, currentIndex)
          const line = this.buildLine('total', this.$map, lineList)
          this.$marker.line.data.push(line)
          const currentRoad = this.buildLine('current', this.$map, [])
          this.$marker.line.current.push(currentRoad)
          if (i != 0) {
            // 开始轨迹中间的连接操作
            const endIndex = startIndex - 1
            const endPoint = this.data.lnglat[endIndex]
            const startPoint = this.data.lnglat[startIndex]
            this.$marker.connect.push(this.buildConnect({
              end: endPoint,
              start: startPoint,
              endIndex: endIndex,
              startIndex: startIndex
            }))
          }
          startIndex = currentIndex + 1
        }
        this.setInitStatus(true)
        this.autoView(this.$map, this.data.lnglat)
      } else {
        this.showShortMsg(this.data.size + 1)
      }
    }
  }
  $clearOverlay() {
    if (this.$map) {
      if (this.$marker.line.data.length > 0) {
        for (let i = 0; i < this.$marker.line.data.length; i++) {
          const line = this.$marker.line.data[i];
          this.clearOverlay(this.$map, line, 'line')
        }
        this.$marker.line.data = []
      }
      if (this.$marker.line.current.length > 0) {
        for (let i = 0; i < this.$marker.line.current.length; i++) {
          const line = this.$marker.line.current[i];
          this.clearOverlay(this.$map, line, 'line')
        }
        this.$marker.line.current = []
      }
      if (this.$marker.connect.length > 0) {
        for (let i = 0; i < this.$marker.connect.length; i++) {
          const connect = this.$marker.connect[i];
          this.clearOverlay(this.$map, connect, 'connect')
        }
        this.$marker.connect = []
      }
      if (this.$marker.point.start) {
        this.clearOverlay(this.$map, this.$marker.point.start, 'point')
      }
      if (this.$marker.point.end) {
        this.clearOverlay(this.$map, this.$marker.point.end, 'point')
      }
      if (this.$marker.point.current) {
        this.clearOverlay(this.$map, this.$marker.point.current, 'point')
      }
    }
  }
  showShortMsg(num: number) {
    notice.showMsg(`当前轨迹点为${num || 0}，无法生成轨迹！`, 'error')
  }
  // 
  setInitStatus(data: boolean) {
    this.status.init = data
  }
  setCurrentStatus(data: trackStatus) {
    if (this.status.current != data) {
      this.status.last = this.status.current
      this.status.current = data
    }
  }
  getCurrentStatus() {
    return this.status.current
  }
  resetStatus() {
    this.setInitStatus(false)
    this.setCurrentStatus('stop')
    this.status.last = ''
  }
  // drag start ---
  triggerDrag(num: number, act: 'moving' | 'after') {
    if (act == 'moving') {
      if (!this.status.drag) {
        this.status.drag = true
        if (this.getCurrentStatus() == 'stop') {
          this.setCurrentStatus('pause')
        }
      }
      this.setPercent(num)
    } else if (act == 'after') {
      this.status.drag = false
      this.$start()
    }
  }
  getDragStatus() {
    return this.status.drag
  }
  // drag end ---
  moveBackward() {
    let speed = this.speed.current
    let num = 1000 / speed
    let offset = num * 5
    this.countCurrent('backward', offset)
    if (this.getCurrentStatus() == 'stop') {
      this.setCurrentStatus('pause')
    }
    this.$start()
  }
  moveForward() {
    let speed = this.speed.current
    let num = 1000 / speed
    let offset = num * 5
    this.countCurrent('forward', offset)
    if (this.getCurrentStatus() == 'stop') {
      this.setCurrentStatus('pause')
    }
    this.$start()
  }
  countCurrent (act: directionProp, num: number) {
    if (act == 'backward') {
      let index = this.$index.current.data - num
      if (index < 0) {
        index = 0
      }
      this.setIndexAndPercent(index)
    } else if (act == 'forward') {
      let index = this.$index.current.data + num
      if (index > this.data.size) {
        index = this.data.size
      }
      this.setIndexAndPercent(index)
    }
  }
  $start() {
    this.clearNext()
    if (this.$check()) {
      this.nextTimer = setTimeout(() => {
        this.$trigger()
      }, this.getSpeed()) as unknown as number
    }
  }
  clearNext () {
    if (this.nextTimer) {
      clearTimeout(this.nextTimer)
      this.nextTimer = undefined
    }
  }
  $check() {
    if (this.$isEnd(this.$index.current.data)) {
      this.setCurrentStatus('stop')
    }
    return this.getCurrentStatus() == 'moving' && !this.getDragStatus()
  }
  $next() {
    this.setIndexAndPercent()
    this.$start()
  }
  $trigger() {
    this.$next()
  }
  setIndexAndPercent(index?: number) {
    this.setIndex(index)
    this.countPercent()
  }
  setIndex(currentIndex?: number) {
    const lastIndex = this.$index.current.data
    const lastRoadIndex = this.$index.current.line
    if (currentIndex === undefined) {
      // 未传递时直接获取下一步数据
      this.$index.current.data = this.$index.next.data
      this.$index.current.line = this.$index.next.line
      this.$index.next.data = this.$index.current.data + 1
      this.$index.next.line = this.$getRoadIndex(this.$index.next.data)
      currentIndex = this.$index.current.data
    } else if (this.$isEnd(currentIndex)) {
      // 当前index值超过或为结束值时，直接进行结束赋值操作
      currentIndex = this.data.size
      this.$index.current.data = currentIndex
      this.$index.current.line = this.$getRoadIndex(currentIndex)
      // 结束后的下一个点同最后点避免BUG
      this.$index.next.data = currentIndex
      this.$index.next.line = this.$index.current.line
    } else {
      // 存在index且未结束时
      this.$index.current.data = currentIndex
      this.$index.current.line = this.$getRoadIndex(this.$index.current.data)
      this.$index.next.data = currentIndex + 1
      this.$index.next.line = this.$getRoadIndex(this.$index.next.data)
    }
    if (this.$marker.point.current && this.$marker.line.current.length > 0) {
      const direction = currentIndex > lastIndex ? 'forward' : 'backward'
      const currentLnglat = this.data.lnglat[currentIndex]
      const nextLnglat = this.data.lnglat[this.$index.next.data]
      const angle = QuickTrack.parseAngle(this.parseLnglat(currentLnglat), this.parseLnglat(nextLnglat))
      this.movePoint(this.$marker.point.current, {
        lastIndex: lastIndex,
        index: currentIndex,
        lnglat: currentLnglat,
        nextIndex: this.$index.next.data,
        nextLnglat: nextLnglat,
        angle: angle
      })
      if (direction == 'forward') {
        // 从上一个点的路线开始绘制
        for (let i = lastRoadIndex; i <= this.$index.current.line; i++) {
          if (i == this.$index.current.line) {
            this.moveLine({
              direction: direction,
              line: this.$marker.line.current[i],
              list: this.$getRoadList(i, currentIndex)
            })
          } else {
            this.moveLine({
              direction: direction,
              line: this.$marker.line.current[i],
              list: this.$getRoadList(i)
            })
            // 前进操作，对连接点进行操作
            this.moveConnect({
              direction: direction,
              connect: this.$marker.connect[i]
            })
          }  
        }
      } else {
        for (let i = this.$index.current.line; i <= lastRoadIndex; i++) {
          if (i == this.$index.current.line) {
            this.moveLine({
              direction: direction,
              line: this.$marker.line.current[i],
              list: this.$getRoadList(i, currentIndex)
            })
          } else {
            this.moveLine({
              direction: direction,
              line: this.$marker.line.current[i],
              list: []
            })
          }
          if (i != lastRoadIndex) {
            // 后退操作，对连接点进行操作
            this.moveConnect({
              direction: direction,
              connect: this.$marker.connect[i]
            })
          }        
        }
      }
    }
  }
  resetIndex (move?: boolean) {
    if (move) {
      this.setIndex(0)
    }
    this.$index.current.data = 0
    this.$index.current.line = 0
    this.$index.next.data = 1
    this.$index.next.line = 0
  }
  countPercent() {
    this.percent = getNum(this.$index.current.data * 100 / ( this.data.size), 'round', 0)
  }
  setPercent(data: number) {
    this.percent = data
    let index = getNum(this.percent / 100 * ( this.data.size), 'round', 0)
    this.setIndex(index)
  }
  resetPercent() {
    this.percent = 0
  }
  start() {
    if (this.getCurrentStatus() == 'stop') {
      this.setIndex(0)
    }
    this.setCurrentStatus('moving')
    this.$start()
  }
  pause() {
    this.setCurrentStatus('pause')
  }
  stop() {
    this.setCurrentStatus('stop')
  }

  setSpeed (rate: number) {
    this.speed.rate = rate
    this.speed.current = this.speed.base / this.speed.rate
  }
  getSpeed () {
    return this.speed.current
  }
  resetSpeed () {
    this.setSpeed(1)
  }

  $isEnd(index: number) {
    return index >= this.data.size
  }
  $reset() {
    // 清除地图覆盖物,重置index,percent,speed,status，终止计时
    // 此重置保存当前数据，作为基础重置使用
    this.$clearOverlay()
    this.clearNext()
    this.resetIndex()
    this.resetPercent()
    this.resetSpeed()
    this.resetStatus()
  }
  reset() {
    // $reset的基础上重置数据
    this.$reset()
    this.resetData()
  }
  destroy() {
    this.reset()
    this.$resetMap()
  }
}

export default QuickTrack
