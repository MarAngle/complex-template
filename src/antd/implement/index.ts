import { DictionaryData } from 'complex-data'
import { TableColumnProps } from 'ant-design-vue'
import config from './config'
import AntdEdit, { AntdEditInitOption } from './mod/AntdEdit'
import { LayoutDataFormatData } from 'complex-data/src/lib/LayoutData'
import DictionaryConfig from "complex-data/DictionaryConfig"

export interface editType {
  $prop: string,
  label: string | undefined,
  originProp: string | undefined,
  type: string | undefined,
  layout: LayoutDataFormatData,
  edit: AntdEdit
}


export interface listType extends TableColumnProps<Record<PropertyKey, any>> {
  $prop: string,
  $auto?: boolean
  $render?: (...args: any[]) => any,
  $show?: (...args: any[]) => any,
  $tip?: any
}

const defaultOption = {
  list: {
    unformat: function (ditem: DictionaryData, modName: string) {
      const modData = ditem.$getMod(modName)!
      const pitem: listType = {
        $prop: ditem.$prop,
        dataIndex: modData.prop || ditem.$prop,
        title: modData.title || ditem.$getInterface('label', modName),
        align: modData.align || 'center',
        width: modData.width === undefined ? config.format.list.width : modData.width,
        ellipsis: modData.ellipsis === undefined ? config.format.list.ellipsis : modData.ellipsis,
        customCell: modData.$cell,
        customHeaderCell: modData.$headerCell,
        $auto: modData.$auto === undefined ? config.format.list.$auto : modData.$auto,
        $show: ditem.show,
        $render: modData.$render,
        ...(modData.$local || {})
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
        $prop: ditem.$prop,
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
  let n: keyof (typeof defaultOption)
  for (n in defaultOption) {
    DictionaryConfig.setDictionary(n, defaultOption[n])
  }
  DictionaryConfig.setDictionary('build', 'edit', true)
  DictionaryConfig.setDictionary('change', 'edit', true)
}
