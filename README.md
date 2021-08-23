# 功能
- 基于complex-data的模板
## 基本功能
- 基于complex-data的antd模板实现

### 文件结构

---

### TabelView
#### minWidth
- 通过pitem.width || pitem.scrollWidth实现计算出最小宽度定义，其中scrollWidth不参与缩放比例，仅作为剩余空间判断值进行计算，现在来看剩余空间会平均分配
- choiceWidth=60/expandWidth=50，可单独定义
- 额外宽度extraWidth:3
- scrollWidth必须存在并定义
- 其他判断基本上基于minWidth实现

#### 自动scroll实现
- 未定义tableOption.props.scroll时生效
- 非对象格式参数默认设置width,number类型使用number模式，字符串类型直接赋值到type
- width的type存在auto和number，auto通过获取tabel宽度进行，number则指定tabel宽度，其中auto时可通过传递对象并scrollOption.recount的值的监控进行宽度的重新获取=>下一个tick中获取
- minWidth和tableWidth进行比较，超过tabelWidth则将scroll.x设置为width
- height的type仅使用number
- 默认不启用，启用需要额外设置
- height暂时未计算标题高度，考虑实现方案


#### scrollOption.width.layout == 'count'实现
- 基于自动scroll基础之上，对整体宽度已知情况下
- 自动布局，通过minWidth实现最小宽度的设置，统一page实现scroll
- 此时分页器将跟table整体进行滑动
- 考虑实现分页器和table的拆分

#### scroll解析
- scroll.x 指定宽，true则在尽可能小的地方自适应
- 存在fixed时，table.ant-table-fixed的width值由auto(此时不定义x)变更到max-content
- 通过改写table.ant-table-fixed的width值到max-content(x:max-content)理论上能实现最小宽度的实现，此项不兼容IE，不用此项处理


[更新历史](./history.md)