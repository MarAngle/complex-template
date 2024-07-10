import { Component, VNode, h } from 'vue';
import { SearchOutlined, SettingOutlined, PlusOutlined, DeleteOutlined, ContainerOutlined, ReloadOutlined, SyncOutlined, CloseOutlined, StopOutlined, DownloadOutlined, UploadOutlined, LinkOutlined, DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import { MenuValue } from 'complex-data/type';

export const iconDict: Record<string, Component> = {
  search: SearchOutlined,
  setting: SettingOutlined,
  plus: PlusOutlined,
  delete: DeleteOutlined,
  info: ContainerOutlined,
  reset: ReloadOutlined,
  refresh: SyncOutlined,
  close: CloseOutlined,
  stop: StopOutlined,
  download: DownloadOutlined,
  upload: UploadOutlined,
  link: LinkOutlined,
  down: DownOutlined,
  up: UpOutlined
}

const icon = {
  parse(name: MenuValue['icon']) {
    if (name) {
      if (typeof name === 'string') {
        if (iconDict[name]) {
          return h(iconDict[name])
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
  }
}

export default icon

