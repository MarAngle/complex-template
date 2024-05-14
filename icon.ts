import { Component, VNode, h } from 'vue';
import { SearchOutlined, SettingOutlined, PlusOutlined, DeleteOutlined, ContainerOutlined, ReloadOutlined, CloseOutlined, StopOutlined, DownloadOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons-vue';
import { MenuValue } from 'complex-data/src/type';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const iconDict: Record<string, Component> = {
  search: SearchOutlined,
  setting: SettingOutlined,
  plus: PlusOutlined,
  delete: DeleteOutlined,
  info: ContainerOutlined,
  refresh: ReloadOutlined,
  close: CloseOutlined,
  stop: StopOutlined,
  download: DownloadOutlined,
  upload: UploadOutlined,
  link: LinkOutlined
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

