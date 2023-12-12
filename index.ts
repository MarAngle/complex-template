import { SearchData } from "complex-data"
import AntdFormValue from "./src/class/AntdFormValue"
import AutoRender from "./src/components/AutoRender"
import AutoText from "./src/AutoText.vue"
import SimpleTable from "./src/SimpleTable"
import TableView from "./src/TableView"
import './src/style/index.css'

SearchData.$form = AntdFormValue

export {
  AutoRender,
  AutoText,
  SimpleTable,
  TableView
}
