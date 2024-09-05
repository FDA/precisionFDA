import { PlatformClient } from '@shared/platform-client'
import { PropertyKeysOfType } from '@shared/utils/types/property-keys-of-type'

export type PlatformClientFunctionKeyType = PropertyKeysOfType<
  PlatformClient,
  (...args: unknown[]) => unknown
>
