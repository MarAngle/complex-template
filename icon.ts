import { Component, VNode, h } from 'vue'
import { SearchOutlined, SettingOutlined, PlusOutlined, DeleteOutlined, ContainerOutlined, EditOutlined, ReloadOutlined, SyncOutlined, CloseOutlined, StopOutlined, DownloadOutlined, UploadOutlined, LinkOutlined, DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import { MenuValue } from 'complex-data/type'
import EmptyPic from "./src/icons/EmptyPic.vue"

export interface localIconProps {
  size?: number
  color?: string
}

export const iconDict: Record<string, (props?: Record<PropertyKey, any>) => VNode> = {
  search: (props) => h(SearchOutlined, props),
  setting: (props) => h(SettingOutlined, props),
  build: (props) => h(PlusOutlined, props),
  delete: (props) => h(DeleteOutlined, props),
  info: (props) => h(ContainerOutlined, props),
  edit: (props) => h(EditOutlined, props),
  reset: (props) => h(ReloadOutlined, props),
  refresh: (props) => h(SyncOutlined, props),
  close: (props) => h(CloseOutlined, props),
  stop: (props) => h(StopOutlined, props),
  export: (props) => h(DownloadOutlined, props),
  import: (props) => h(UploadOutlined, props),
  link: (props) => h(LinkOutlined, props),
  down: (props) => h(DownOutlined, props),
  up: (props) => h(UpOutlined, props)
}

export const localIconDict: Record<string, Component> = {
  emptyPic: EmptyPic
}

const icon = {
  parse(name: MenuValue['icon']) {
    if (name) {
      if (typeof name === 'string') {
        if (iconDict[name]) {
          return iconDict[name]({
            class: 'complex-icon'
          })
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

