import { SearchData } from "complex-data"
import AntdFormValue from "./src/class/AntdFormValue"
import AutoText from "./src/AutoText.vue"
import ButtonView from "./src/ButtonView"
import SimpleTableView from "./src/SimpleTableView"
import TableView from "./src/TableView"
import ModalView from "./src/ModalView"
import FormView from "./src/FormView"
import './src/style/index.css'

SearchData.$form = AntdFormValue

export {
  AutoText,
  ButtonView,
  SimpleTableView,
  TableView,
  ModalView,
  FormView,
}

