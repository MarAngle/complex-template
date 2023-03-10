import $func from 'complex-func'
import { DictionaryItem, dictionaryFormatOption } from 'complex-data'
import config from './config'
import AntdEdit, { AntdEditInitOption } from './mod/AntdEdit'
import { LayoutDataFormatData } from 'complex-data/src/lib/LayoutData'
import { PageData } from 'complex-data/src/lib/DictionaryItem'
import { anyFunction } from 'complex-data/ts'

console.warn('warning: data请求为测试')

export interface editType extends PageData {
  prop: string,
  label: string | undefined,
  originProp: string | undefined,
  type: string | undefined,
  $func: Record<PropertyKey, anyFunction>,
  layout: LayoutDataFormatData,
  edit: AntdEdit
}


const defaultOption = {
  list: {
    format: function (ditem: DictionaryItem, modName: string, data: any) {
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
          const type = $func.getType(data.customCell)
          if (type == 'object') {
            const customCellOption = data.customCell
            data.customCell = () => {
              return customCellOption
            }
          }
        }
        if (data.customHeaderCell) {
          const type = $func.getType(data.customHeaderCell)
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
    unformat: function (ditem: DictionaryItem, modName: string) {
      const pitem = {
        ...ditem.$mod[modName],
        $func: ditem.$func
      } as any
      if (!pitem.title) {
        pitem.title = ditem.$getInterface('label', modName)
      }
      return pitem
    }
  },
  info: {
    unformat: function (ditem: DictionaryItem, modName: string, { targetData }: any) {
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
    format: function (ditem: DictionaryItem, modName: string, data: AntdEditInitOption) {
      data.prop = ditem.$prop
      data.parent = ditem
      return new AntdEdit(data)
    },
    unformat: function (ditem: DictionaryItem, modName: string): editType {
      const pitem = {
        prop: ditem.$prop,
        label: ditem.$getInterface('label', modName),
        originProp: ditem.$getInterface('originProp', modName),
        type: ditem.$getInterface('type', modName),
        $func: ditem.$func,
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
    dictionaryFormatOption.setDictionary(n, defaultOption[n])
  }
  dictionaryFormatOption.setDictionary('build', 'edit', true)
  dictionaryFormatOption.setDictionary('change', 'edit', true)
}
