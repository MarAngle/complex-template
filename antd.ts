import './src/antd/style/index.less'
import { ComplexFormData } from "./src/base/data/EditForm.vue"
import AutoModal from "./src/antd/data/AutoModal.vue";
import AutoText from "./src/antd/data/AutoText.vue";
import FormView from "./src/antd/data/FormView.vue";
import TableView from "./src/antd/data/TableView.vue";

ComplexFormData.clearValidate = function(target: ComplexFormData) {
  target.ref.clearValidate()
}
ComplexFormData.validate = function(target: ComplexFormData, success: () => any, fail?: () => any) {
  target.ref.validate((valid: any) => {
    if (valid) {
      success()
    } else if(fail) {
      fail()
    }
  })
}

export const ComplexAutoModal = AutoModal
export const ComplexAutoText = AutoText
export const ComplexFormView = FormView
export const ComplexTableView = TableView

