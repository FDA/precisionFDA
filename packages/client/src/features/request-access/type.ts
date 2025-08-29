export interface RequestAccess {
  firstName: string
  lastName: string
  email: string
  duns: string
  reason: string
  participateIntent: boolean
  organizeIntent: boolean
  reqData: string
  reqSoftware: string
  researchIntent: boolean
  clinicalIntent: boolean
}

export interface RequestAccessPayload extends RequestAccess {
  captchaValue?: string
}
