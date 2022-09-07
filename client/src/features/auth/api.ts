import { IUser } from '../../types/user'
import { backendCall } from '../../utils/api'

export const fetchCurrentUser = async (): Promise<IUser> => {
  const res = await backendCall('/api/user', 'GET')
  return res?.payload.user
}

export const logout = async (): Promise<any> => {
  await backendCall('/logout', 'DELETE')
}
