import fs from 'fs'
import path from 'path'
import { EmailSendInput } from './email.config'

const saveEmailToFile = async (email: EmailSendInput, customFilename?: string): Promise<void> => {
  const filename = customFilename ?? 'test-email'
  const html = `<pre>email: ${email.to}\nsubject: ${email.subject}\n</pre>${email.body}`
  // todo: move path to config
  const targetPath = path.join(process.cwd(), 'test-emails', `${filename}.html`)
  await new Promise(done => fs.writeFile(targetPath, html, done))
}

export { saveEmailToFile }
