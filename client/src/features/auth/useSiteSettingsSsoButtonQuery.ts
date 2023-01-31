import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

type SsoButtonResponse =
  | {
      isEnabled: true
      data: {
        fdaSsoUrl: string
      }
    }
  | {
      isEnabled: false
    }

export const onLogInWithSSO = (ssoButtonResponse: any) => {
  if (ssoButtonResponse?.isEnabled) {
    window.location.assign(ssoButtonResponse.data.fdaSsoUrl)
  }
}

export const useSiteSettingsSsoButtonQuery = () =>
  useQuery<SsoButtonResponse>(['site_settings', 'sso_button'], {
    queryFn: () =>
      axios.get('/api/site_settings/sso_button').then((r: any) => r.data),
  })
