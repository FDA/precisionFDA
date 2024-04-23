export type AlertType = 'info' | 'warning' | 'danger'

export type Alert = {
  'id': number,
  'createdAt': string,
  'updatedAt': string,
  'title': string,
  'content': string,
  'type': AlertType,
  'startTime': string,
  'endTime': string,
}
