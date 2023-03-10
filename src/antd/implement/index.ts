import { getType } from "complex-utils"
import { DictionaryData } from 'complex-data'
import config from './config'
import AntdEdit, { AntdEditInitOption } from './mod/AntdEdit'
import { LayoutDataFormatData } from 'complex-data/src/lib/LayoutData'
// import { PageData } from 'complex-data/src/lib/DictionaryData'
import DictionaryConfig from "complex-data/DictionaryConfig"

console.warn('warning: data请求为测试')

export interface editType {
  prop: string,
  label: string | undefined,
  originProp: string | undefined,
  type: string | undefined,
  // $func: Record<PropertyKey, ((...args: any[]) => any)>,
  layout: LayoutDataFormatData,
  edit: AntdEdit
}

const defaultOption = {
  list: {
    format: function (ditem: DictionaryData, modName: string, data: any) {
      if (data) {
        if (!data.dataIndex) {
          data.dataIndex = ditem.$prop
        }
        if (!data.align) {
          data.align = 'center'
        }
        if (data.width === undefined) {
          data.width = config.format.list.width
        }
        if (!data.scrollWidth) {
          if (data.width && typeof data.width == 'number') {
            data.scrollWidth = data.width
          } else {
            data.scrollWidth = config.format.list.width
          }
        }
        if (data.ellipsis === undefined) {
          data.ellipsis = config.format.list.ellipsis
        }
        if (data.$auto === undefined) {
          data.$auto = config.format.list.$auto
        }
        if (data.customCell) {
          const type = getType(data.customCell)
          if (type == 'object') {
            const customCellOption = data.customCell
            data.customCell = () => {
              return customCellOption
            }
          }
        }
        if (data.customHeaderCell) {
          const type = getType(data.customHeaderCell)
          if (type == 'object') {
            const customHeaderCellOption = data.customHeaderCell
            data.customHeaderCell = () => {
              return customHeaderCellOption
            }
          }
        }
        return data
      }
    },
    unformat: function (ditem: DictionaryData, modName: string) {
      const pitem = {
        ...ditem.$mod[modName],
        $func: {
          show: ditem.show
        }
      } as any
      if (!pitem.title) {
        pitem.title = ditem.$getInterface('label', modName)
      }
      return pitem
    }
  },
  info: {
    unformat: function (ditem: DictionaryData, modName: string, { targetData }: any) {
      const target = ditem.$triggerFunc('show', targetData[ditem.$prop], {
        targetData: targetData,
        type: modName
      })
      const pitem = {
        prop: ditem.$prop,
        label: ditem.$getInterface('label', modName),
        showType: ditem.$getInterface('showType', modName),
        layout: ditem.$getLayout(modName),
        data: target,
        option: {
          ...ditem.$mod[modName]
        }
      }
      return pitem
    }
  },
  edit: {
    format: function (ditem: DictionaryData, modName: string, data: AntdEditInitOption) {
      data.prop = ditem.$prop
      data.parent = ditem
      return new AntdEdit(data)
    },
    unformat: function (ditem: DictionaryData, modName: string): editType {
      const pitem = {
        prop: ditem.$prop,
        label: ditem.$getInterface('label', modName),
        originProp: ditem.$getInterface('originProp', modName),
        type: ditem.$getInterface('type', modName),
        // $func: ditem.$func,
        layout: ditem.$getLayout(modName),
        edit: ditem.$mod[modName] as AntdEdit
      }
      return pitem
    }
  }
}

export const init = function() {
  let n: 'list' | 'info' | 'edit'
  for (n in defaultOption) {
    DictionaryConfig.setDictionary(n, defaultOption[n])
  }
  DictionaryConfig.setDictionary('build', 'edit', true)
  DictionaryConfig.setDictionary('change', 'edit', true)
}
