### TODOLIST
- 实现多选的高度扩展设置项

### 2.3.7/2.3.8/2.3.9
- complex-data依赖升级

### 2.3.6
- TableView逻辑优化
- jsx文件优化
- UploadFile优化Disabled判断
- complex-data依赖升级

### 2.3.5
- complex-data依赖升级
- TableView宽度计算优化

### 2.3.3/2.3.4
- complex-data依赖升级
- 适配数据的原型深度，优化树列表的index值

### 2.3.0/2.3.1/2.3.2
- complex-data依赖升级

### 2.2.28
- complex-data依赖升级
- 自定义item

### 2.2.27
- complex-data依赖升级
- AutoModal添加footer插槽

### 2.2.26
- complex-data依赖升级
- 模板无用函数删除

### 2.2.25
- complex-data依赖升级

### 2.2.24
- complex-data依赖升级
- git地址切换

### 2.2.23
- 添加ShowValue组件

### 2.2.22
- AutoModal将this通过插槽传递，实现插槽内对弹窗的设置
- AutoModal实现菜单模式快捷设置

### 2.2.21
- complex-data依赖升级

### 2.2.20
- AutoMenu对接page模块，添加插槽

### 2.2.19
- 添加AutoModal

### 2.2.18
- AutoText样式由inline-block调整为block，避免table状态下的高度异常问题

### 2.2.17
- complex-data依赖升级
- 同步文本域修正优化

### 2.2.16
- complex-data依赖升级
- 同步文本域修正优化

### 2.2.15
- complex-data依赖升级

### 2.2.14
- 添加文本域

### 2.2.11 / 2.2.12 / 2.2.13
- complex-data依赖升级

### 2.2.10
- complex-data依赖升级
- AutoTextHeight空判断优化

### 2.2.9
- complex-data依赖升级
- 将page模块整合到正式的complex-func中

### 2.2.8
- AutoText的complex-func的page模块依赖删除
- AutoTextHeight添加因为v-show引起的加载为空的判断

### 2.2.7
- complex-data依赖升级

### 2.2.6
- complex-data依赖升级

### 2.2.5
- complex-data依赖升级

### 2.2.3
- complex-data依赖升级

### 2.2.2
- 分页器对接新分页器数据，使用生命周期获取change事件
- 分页器回调进行的reload事件ing:true，实现因分页器当前页无数据时触发的当前页转换为最后页码时的change回调操作能正确触发

### 2.2.1
- complex-data依赖升级
- datePicker在line模式下的宽度不设置为100,设置为auto,需要根据类型在edit.width中进行设置

### 2.2.0
- complex-data依赖升级

### 2.1.34
- AutoText/AutoTextHeight的tip设置项类型和判断修复

### 2.1.33
- AutoText的tip设置项可实现取消tips显示
- AutoText的recount设置项添加，避免无page对象的情况
- AutoTextHeight的tip设置项可实现取消tips显示
- complex-data依赖升级

### 2.1.32
- FormView添加级联选择器cascader

### 2.1.31
- AutoText结构调整，修复文字过长时tip出现位置不匹配的BUG

### 2.1.30
- 修复complex-data引用，类型判断不急于此进行判断，避免双引用可能导致的问题

### 2.1.29
- 依赖升级
- FormView foot在inline模式下不能合并，Vue2不支持，因此合并FormFoot到FormView
- FormView inline模式下form-view-item添加自动的margin-bottom
- FormView class优化
- 删除AutoSearchMenu

### 2.1.28
- 删除旧版本FormView
- autoSetWidthOption函数抽离到utils
- func直接调用
- 依赖升级
- EventData参数由数组改为平铺

### 2.1.27
- FormView拆分Item和Foot，优化相关class
- FormView auto设置项添加loading/disabled

### 2.1.26
- AutoIndex BUG修复，从0开始改为从1开始
- FormView/TableView合并props设置项到auto，优化默认值判断逻辑
- 全局props类型判断和默认值优化
- 依赖项升级

### 2.1.25
- 扩展列表分页器默认插槽，实现选择和分页器数据的快速定义
- FormView实现自动zindex计算，class相关添加优化整理

### 2.1.24
- 组件默认值通过函数赋值，实现设置项的可配置
- FormView代码优化

### 2.1.23
- 依赖更新，删除func依赖，通过data获取

### 2.1.22
- 依赖版本更新

### 2.1.21
- 依赖版本修正

### 2.1.20
- FormView优化日期范围选择器的初始化判断

### 2.1.19
- TableView布局再优化，优化layout=auto/count布局，优化传参

### 2.1.18
- 高度设置完成，添加校准值
- AutoIndex从接收ListData参数到Pagination参数
- TableView实现自动AutoIndex

### 2.1.17
- TableView修复scroll默认auto的BUG
- TableView修复scroll默认0为number的BUG
- 拆分scroll中x/y定义，避免今后的y自适应时导致的设置覆盖问题
- scroll.y(height)暂未算入head
- 样式合并

### 2.1.16
- TableView优化minWidth计算
- autoLayout基本实现
- 样式通过class进行定义，优化性能

### 2.1.15
- TableView实现scroll的基本自定义

### 2.1.13
- 优化函数注释
- 调整设置项位置

### 2.1.12
- labelAlign错误引用修复
- FormView宽度设置优化
  - 删除innerWidth选项
  - 启用mainwidth/width选项
  - mainwidth将会设置到a-form-model-item，权重比从item.edit.localOption.main.style.width > mainwidth > (item.layout.type == 'width'模式下的item.layout.width）
  - width将会设置到对应的双向绑定模组上，权重比从item.edit.localOption.item.style.width > width > config.FormView.itemWidth[this.layout]
  - width不存在值的情况下，通过config获取默认值

### 2.1.10
- FormView/Grid栅格设置项BUG修复

### 2.1.9
- FormView/Grid栅格设置项BUG修复

### 2.1.8
- FormView实现Grid栅格

### 2.1.7
- UploadFile界面逻辑优化

### 2.1.6
- FormView中的footMenu的slot设置

### 2.1.5
- 修复错误的complex-data版本引用

### 2.1.4
- 同步complex-data的reloadData改动

### 2.1.3
- TableView/FormView添加默认class
- 考虑FormView的扩展,FootMenu[1.可设置单独FormModelItem或者公用FormModelItem2.设置项数据为props或者为全部3.公用时通过option进行整体设置4.单独时解析数据]
- className整理优化


### 2.1.2
- TableView 无用引用删除
- 依赖修改

### 2.1.1
- 扩展Ditem的show函数

### 2.1.0
- 版本逻辑更新，非兼容更新将会在第二位表现

### 2.0.9
- jsx=>createElement完成

### 2.0.8
- jsx改写

### 2.0.7
- FormView优化
- 更新测试依赖

### 2.0.6
- 删除开发依赖

### 2.0.5
- 添加HighText组件
- AutoTextHeight优化

### 2.0.4
- jsx组件错误修复

### 2.0.3
- 依赖版本号固定

### 2.0.2
- 使用loadContents加载
- index修改

### 2.0.1
- AutoTextHeight组件扩展优化
- complex-func的引用从Vue原型链引用改为import引用，避免挂载属性设置非默认的情况