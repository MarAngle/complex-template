# 功能
- 基于complex-data的模板
## 基本功能
- 基于complex-data的antd模板实现

### 文件结构

---

### TabelView
自动scroll实现
1.未定义tableOption.props.scroll
2.定义scrollOption，基于scrollOption格式化为参数，大类型分为'auto'和'number'，
  auto通过获取tabel宽度进行，number则指定tabel宽度，其中auto时可通过传递对象并scrollOption.recount的值的监控进行宽度的重新获取=>下一个tick中获取
3.columnList中width数字格式则进行计算，非数字格式且存在数字格式scrollWith则可参与计算，最终计算值和tableWidth进行比较，超过tabelWidth则将scroll.x设置为width
4.scrollWidth不参与缩放比例，仅作为剩余空间判断值进行计算，现在来看剩余空间会平均分配
5.choiceWidth=60/expandWidth=50，可单独定义
6.额外宽度extraWidth:3
7.默认不启用，启用需要额外设置
8.解析
  scroll.x 指定宽，true则在尽可能小的地方自适应
  通过改写table.ant-table-fixed的width值由auto(此时不定义x)到max-content理论上能实现最小宽度的实现，此项不兼容IE，不用此项处理


[更新历史](./history.md)