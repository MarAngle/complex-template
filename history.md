### TODOLIST
- 实现tree-select
- 实现多选的高度扩展设置项

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