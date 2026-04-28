import React from 'react'
import clsx from 'clsx'
import { Loader } from '@/components/Loader'
import { formatNumberUS } from '@/features/home/utils'
import { useCloudResourcesQuery } from '@/hooks/useCloudResourcesCondition'
import styles from './CloudResources.module.css'

export const CloudResources = () => {
  const { data: stats, isLoading, error } = useCloudResourcesQuery()

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Cloud Resources</h1>
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Cloud Resources</h1>
        <div>Error loading cloud resources</div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Cloud Resources</h1>
        <p className={styles.description}>View your current cloud resource usage and limits.</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Current Usage</h2>
        <div className={styles.usageTable}>
          <div className={styles.usageRow}>
            <span className={styles.usageLabel}>Compute</span>
            <span className={styles.usageAmount}>${formatNumberUS(stats.computeCharges)}</span>
          </div>
          <div className={styles.usageRow}>
            <span className={styles.usageLabel}>Storage</span>
            <span className={styles.usageAmount}>${formatNumberUS(stats.storageCharges)}</span>
          </div>
          <div className={styles.usageRow}>
            <span className={styles.usageLabel}>Data Egress</span>
            <span className={styles.usageAmount}>${formatNumberUS(stats.dataEgressCharges)}</span>
          </div>
          <div className={styles.usageTotalRow}>
            <span className={styles.usageLabel}>Total Charges</span>
            <span className={styles.usageAmount}>${formatNumberUS(stats.totalCharges)}</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Limits & Availability</h2>
        <div className={styles.limitsGrid}>
          <div className={styles.limitCard}>
            <span className={styles.limitLabel}>Usage Limit</span>
            <span className={styles.limitValue}>${formatNumberUS(stats.usageLimit)}</span>
          </div>
          <div className={clsx(styles.limitCard, styles.highlight)}>
            <span className={styles.limitLabel}>Usage Available</span>
            <span className={styles.limitValue}>${formatNumberUS(stats.usageAvailable)}</span>
          </div>
          <div className={clsx(styles.limitCard, styles.highlight)}>
            <span className={styles.limitLabel}>Job Limit</span>
            <span className={styles.limitValue}>${formatNumberUS(stats.jobLimit)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
