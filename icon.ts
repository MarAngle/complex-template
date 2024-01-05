import { h } from 'vue';
import { SearchOutlined, SettingOutlined, PlusOutlined, DeleteOutlined, ReloadOutlined, CloseOutlined, StopOutlined, DownloadOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons-vue';
import { DefaultEditButtonOption } from 'complex-data/src/dictionary/DefaultEditButton';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const iconDict: Record<string, any> = {
  search: SearchOutlined,
  setting: SettingOutlined,
  plus: PlusOutlined,
  delete: DeleteOutlined,
  refresh: ReloadOutlined,
  close: CloseOutlined,
  stop: StopOutlined,
  download: DownloadOutlined,
  upload: UploadOutlined,
  link: LinkOutlined
}

const icon = {
  parse(name: DefaultEditButtonOption['icon']) {
    if (name) {
      if (typeof name === 'string') {
        if (iconDict[name]) {
          return h(iconDict[name])
        } else {
          console.error(`警告:${name}对应的icon未定义！`)
          return name
        }
      } else {
        return name()
      }
    } else {
      return null
    }
  }
}

export default icon

