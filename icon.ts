import { Component, VNode, h } from 'vue'
import { SearchOutlined, SettingOutlined, PlusOutlined, DeleteOutlined, ContainerOutlined, ReloadOutlined, SyncOutlined, CloseOutlined, StopOutlined, DownloadOutlined, UploadOutlined, LinkOutlined, DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import { MenuValue } from 'complex-data/type'
import EmptyPic from "./src/icons/EmptyPic.vue"

export interface localIconProps {
  size?: number
  color?: string
}

export const iconDict: Record<string, () => VNode> = {
  search: () => h(SearchOutlined),
  setting: () => h(SettingOutlined),
  build: () => h(PlusOutlined),
  delete: () => h(DeleteOutlined),
  info: () => h(ContainerOutlined),
  reset: () => h(ReloadOutlined),
  refresh: () => h(SyncOutlined),
  close: () => h(CloseOutlined),
  stop: () => h(StopOutlined),
  export: () => h(DownloadOutlined),
  import: () => h(UploadOutlined),
  link: () => h(LinkOutlined),
  down: () => h(DownOutlined),
  up: () => h(UpOutlined)
}

export const localIconDict: Record<string, Component> = {
  emptyPic: EmptyPic
}

const icon = {
  parse(name: MenuValue['icon']) {
    if (name) {
      if (typeof name === 'string') {
        if (iconDict[name]) {
          return iconDict[name]()
        } else {
          console.error(`警告:${name}对应的icon未定义！`)
          return name
        }
      } else {
        return name() as VNode
      }
    } else {
      return undefined
    }
  },
  local(name: string, props: localIconProps = {}) {
    if (name) {
      if (localIconDict[name]) {
        return h(localIconDict[name], props)
      } else {
        console.error(`警告:${name}对应的localIcon未定义！`)
        return name
      }
    } else {
      return undefined
    }
  }
}

export default icon

