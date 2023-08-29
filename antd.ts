import { SearchData } from 'complex-data-next'
import { ComplexAutoIndex, ComplexHighText, ComplexShowValue } from "./index";
import './src/antd/style/index.less';
import AutoModal from "./src/antd/data/AutoModal.vue";
import AutoText from "./src/antd/data/AutoText.vue";
import FormView from "./src/antd/data/FormView";
import EditForm from "./src/antd/data/EditForm.vue";
import TableView from "./src/antd/data/TableView";
import AntdForm from "./src/antd/class/AntdForm";

SearchData.setForm(AntdForm)

export {
  ComplexAutoIndex,
  ComplexHighText,
  ComplexShowValue
}

export const ComplexAutoModal = AutoModal
export const ComplexAutoText = AutoText
export const ComplexFormView = FormView
export const ComplexEditForm = EditForm
export const ComplexTableView = TableView
