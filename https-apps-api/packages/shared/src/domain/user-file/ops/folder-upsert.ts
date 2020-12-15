import { BaseOperation } from '../../../utils/base-operation'

export class FolderUpsertOperation extends BaseOperation<> {
  // em is passed as the input, it will come from other operation
  // that way, we can achieve transactions simply, if we wanted
  async run(input) {
    // find the relevant folder based on input
    // if it does not exist, create it
  }
}
