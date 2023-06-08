import { FC, useEffect } from 'react'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

interface CaptchaProps {
    action: string,
    callback: (captchaValue: string) => void;
}
/**
 * Recaptcha V3 component. Is not visible in the UI at all, works on background.
 * This component has to be wrappen by GoogleReCaptchaProvider component in order to work properly.
 * @param props.action action string connected with captcha validation (has to be verified on backend
 * @param props.callback callback function that will be executed after evaluating the user interaction
 */
export const GoogleReCaptchaV3: FC<CaptchaProps> = ({ action, callback }: CaptchaProps) => {
  const { executeRecaptcha } = useGoogleReCaptcha()

  useEffect(() => {
    if (!executeRecaptcha) {
      return
    }

    const handleReCaptchaVerify = async () => {
      const token = await executeRecaptcha(action)
      if(token) callback(token)
    }
    handleReCaptchaVerify()

  }, [executeRecaptcha])

  return null

}
