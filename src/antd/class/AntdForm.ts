import { BaseForm } from 'complex-data-next'

class AntdForm extends BaseForm{
  clearValidate(...args: any[]) {
    this.ref.clearValidate(...args)
  }
  validate(...args: any[]) {
    return this.ref.validate() as Promise<unknown>
  }
}

export default AntdForm
