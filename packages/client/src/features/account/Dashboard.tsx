import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Bolt, Box, FileText, MessageSquare } from 'lucide-react'
import styles from './Dashboard.module.css'

interface CounterRequest {
  apps: string
  assets: string
  dbclusters: string
  jobs: string
  files: string
  workflows: string
  reports: string
  discussions: string
}

const fetchCounters = async (): Promise<CounterRequest> => {
  return axios.get('/api/v2/counters').then(d => d.data)
}

export const Dashboard = () => {
  const { data: counters, isLoading } = useQuery({
    queryKey: ['counters', 'me'],
    queryFn: fetchCounters,
  })

  const stats = [
    { label: 'Private Files', value: counters?.files, icon: FileText, color: '#3b82f6' },
    { label: 'Apps', value: counters?.apps, icon: Box, color: '#10b981' },
    { label: 'Executions', value: counters?.jobs, icon: Bolt, color: '#f59e0b' },
    { label: 'Discussions', value: counters?.discussions, icon: MessageSquare, color: '#8b5cf6' },
  ]

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>
      <div className={styles.grid}>
        {stats.map(stat => (
          <div key={stat.label} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{stat.label}</span>
              <stat.icon size={20} color={stat.color} />
            </div>
            <div className={styles.cardValue}>{isLoading ? '...' : stat.value || 0}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
