
### Tips

### ToDo
- ListView的TableMenu实现级联
- 通过antd实现基础主题色的设置:全局样式
- EditView实现一键禁用?具体需求是实现Info?
- table布局考虑计算准确性
- SimpleTableView的插槽和菜单逻辑同步
- Import的complex属性适配，接收一个复杂对象实现，具体的名称和URL解析考虑单独参数或者额外包装
### Doing

### 4.3.12/13/14
- 拆分上传组件
- 优化上传组件类型
- 适配上传组件的complex属性

### 4.3.11
- QuickList的事件由menu拆分成search/table
- 升级依赖，适配时间范围限制

### 4.3.8/9/10
- 按钮适配防抖
- Cascader名称统一
- 修正ImportView的文件判断BUG

### 4.3.5/6/7
- 优化代码
- ImportView的文件下载逻辑实现

### 4.3.1/2/3/4
- 适配4.3版本data
- 删除无用输出

### 4.2.10/11
- ListView => QuickList
- 添加QuickPanel
- 全局添加emits-持续优化中

### 4.2.9
- EditArea: data生成完成后再进行list赋值，避免list提前赋值导致的EditView提前加载导致的数据为空的加载

### 4.2.6/7/8
- 升级data依赖
- 修正class生成

### 4.2.5
- ListView添加reset/destory

### 4.2.4
- 升级data依赖,适配select

### 4.2.3
- 升级依赖，修正错误引用

### 4.2.2
- 优化layout传值逻辑，更新插件

### 4.2.1
- 适配新版data
- Table的滚动跟随列表而非检索和分页器
- 实现InfoView的展示，接收观察函数
- 实现InfoItem/EditItem两个组件，form中不交互的值通过InfoItem实现
- InfoItem的lable样式还原
- 简化Attrs调用

### 4.1.4
- Select的分页和插槽实现

### 4.1.3
- 升级data依赖,适配非编辑模块
- 修正样式和类型

### 4.1.2
- 升级plugin依赖,适配新版layout
- 优化ModalView的菜单属性

### 4.1.1
- 基于v4版本的ant-design和complex-component构建模板
