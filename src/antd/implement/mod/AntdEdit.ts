import DefaultEdit, { DefaultEditInitOption } from 'complex-data/src/lib/DefaultEdit'
// import $func from 'complex-func'


export interface AntdEditInitOption extends DefaultEditInitOption {
  hideLabel?: boolean,
  colon?: boolean
}

class AntdEdit extends DefaultEdit {
  static $name = 'AntdEdit'
  hideLabel: boolean
  colon: boolean
  constructor(initOption: AntdEditInitOption) {
    super(initOption)
    this.$triggerCreateLife('AntdEdit', 'beforeCreate', initOption)
    this.hideLabel = initOption.hideLabel === undefined ? false : initOption.hideLabel
    this.colon = initOption.colon === undefined ? true : initOption.colon // label属性：显示判断值
    // 触发操作，暂时隐藏考虑其他实现方案=>同步comp注释操作
    // this.eventTriggerList = defaultOption.eventList
    this.$triggerCreateLife('AntdEdit', 'created')
  }
  // $initLocalOption(initOption: AntdEditInitOption) {
  //   if (!initOption.option) {
  //     initOption.option = {}
  //   }
  // }
}

export default AntdEdit
