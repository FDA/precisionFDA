import { useSelector } from "react-redux"
import { contextUserSelector } from "../../reducers/context/selectors"
import { IUser } from "../../types/user"

export const useAuthUser = () => {
  let user: IUser = useSelector(contextUserSelector)
  user.isGovUser = user?.email?.includes('fda.hhs.gov') || false
  user.isAdmin = user?.can_administer_site || false
  return user
}
