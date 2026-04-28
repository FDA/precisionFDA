import React from 'react'
import { Button } from '@/components/Button'
import { KeyIcon } from '@/components/icons/KeyIcon'
import { useGenerateKeyModal } from '../auth/useGenerateKeyModal'
import styles from './ApiKeys.module.css'

export const ApiKeys = () => {
  const { modalComp, setShowModal } = useGenerateKeyModal()

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>API Keys</h1>
      <p className={styles.description}>Manage your API keys for external access.</p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>CLI Authentication Key</h2>
        <p className={styles.sectionDescription}>
          Generate a temporary authentication key for use with the precisionFDA Command Line Interface (CLI). This key
          is valid for 24 hours.
        </p>
        <Button data-variant="primary" onClick={() => setShowModal(true)}>
          <KeyIcon size={14} className={'mr-2'} />
          Generate New Key
        </Button>
      </section>
      {modalComp}
    </div>
  )
}
