import * as jsforce from 'jsforce'
import { config } from '../config'

class EmailClient {
  connection: jsforce.Connection
  constructor() {
    this.connection = new jsforce.Connection({ loginUrl: config.emails.salesforce.apiUrl })
  }

  async login(): Promise<jsforce.UserInfo> {
    // todo: try/catch, logs
    return await this.connection.loginBySoap(
      config.emails.salesforce.username,
      `${config.emails.salesforce.password}${config.emails.salesforce.secretToken}`,
    )
  }
}

const emailClient = new EmailClient()

export { emailClient }
