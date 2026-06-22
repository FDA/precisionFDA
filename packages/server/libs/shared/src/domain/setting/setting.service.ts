import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { SettingRepository } from './setting.repository'

const COMPARISON_APP_KEY = 'comparison_app'
const COMPARATOR_APPS_KEY = 'comparator_apps'

@Injectable()
export class SettingService {
  constructor(private readonly settingRepository: SettingRepository) {}

  /**
   * Returns the default comparison app dxid.
   */
  async getComparisonApp(): Promise<string> {
    const value = await this.settingRepository.findValueByKey(COMPARISON_APP_KEY)
    return (value as string) || config.platform.defaultComparisonApp
  }

  /**
   * Returns the list of comparator app dxids.
   */
  async getComparatorApps(): Promise<string[]> {
    const value = await this.settingRepository.findValueByKey(COMPARATOR_APPS_KEY)
    if (Array.isArray(value)) {
      return value
    }
    return []
  }

  /**
   * Checks if an app is added to the comparators list.
   */
  async isComparatorApp(dxid: string): Promise<boolean> {
    const comparatorApps = await this.getComparatorApps()
    return comparatorApps.includes(dxid)
  }

  /**
   * Checks if an app is the default comparison app.
   */
  async isDefaultComparator(dxid: string): Promise<boolean> {
    const comparisonApp = await this.getComparisonApp()
    return comparisonApp === dxid
  }
}
