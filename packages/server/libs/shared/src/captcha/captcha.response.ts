export interface CaptchaResponse {
  tokenProperties: {
    valid: boolean
    invalidReason: string
    createTime: string
    action: string
    hostname: string
  }
  riskAnalysis: {
    score: number
    reasons: string[]
  }
}
