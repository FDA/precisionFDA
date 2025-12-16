import { formatDistanceToNow } from 'date-fns'
import React, { useEffect } from 'react'
import { useNotificationCenter } from 'react-toastify/addons/use-notification-center'
import { useFetchUnreadNotificationsQuery } from '../../api/queries/notification'
import { Notification, NOTIFICATION_ACTION } from '../../features/home/types'
import { confirmNotification } from '../../features/notifications/notifications.api'
import { useLastWSNotification } from '../../hooks/useLastWSNotification'
import { Button } from '../Button'
import { DropdownMenuItem } from '../Header/styles'
import Menu from '../Menu/Menu'
import { BasicToast, ToastWithLink } from '../Toast'
import { BellIcon } from '../icons/BellIcon'
import { TrashIcon } from '../icons/TrashIcon'
import styles from './NotificationCenter.module.css'
import { initializeToastHelper, toastHandlers } from './ToastHelper'

// List of notifications that do not show a toast
const NO_TOAST_NOTIFICATIONS = [
  NOTIFICATION_ACTION.JOB_OUTPUTS_SYNCED,
  NOTIFICATION_ACTION.JOB_RUNNABLE,
  NOTIFICATION_ACTION.FILE_CLOSED,
  NOTIFICATION_ACTION.JOB_INITIALIZING,
  NOTIFICATION_ACTION.DATA_PORTAL_CARD_IMAGE_URL_UPDATED,
  NOTIFICATION_ACTION.CHALLENGE_CARD_IMAGE_URL_UPDATED,
  NOTIFICATION_ACTION.CHALLENGE_RESOURCE_URL_UPDATED,
  NOTIFICATION_ACTION.USER_PROVISIONING_DONE,
  NOTIFICATION_ACTION.USER_PROVISIONING_ERROR,
]

// Helper function to create toast content
const createToastContent = (message: string, meta?: Notification['meta']) => {
  if (meta?.linkTitle && meta?.linkUrl) {
    return ToastWithLink({
      message,
      linkTitle: meta.linkTitle,
      linkUrl: meta.linkUrl,
      linkTarget: meta.linkTarget,
    })
  }
  return BasicToast(message)
}

export const NotificationCenter = () => {
  const { notifications, clear, markAllAsRead, markAsRead, remove, unreadCount, add } = useNotificationCenter()
  const lastJsonMessage = useLastWSNotification()

  const { data } = useFetchUnreadNotificationsQuery()

  useEffect(() => {
    initializeToastHelper(markAsRead)
  }, [markAsRead])

  // Add fetched notifications to center on mount
  useEffect(() => {
    data?.forEach(notification => {
      const toastContent = createToastContent(notification.message, notification.meta)
      add({
        createdAt: new Date(notification.createdAt).getTime(),
        read: false,
        content: toastContent,
        type: 'success',
      })
      confirmNotification(notification.id).catch(error => {
        console.error(`Failed to confirm notification ${notification.id}:`, error)
      })
    })
  }, [data])

  // Handle WebSocket notifications
  useEffect(() => {
    if (!lastJsonMessage) return

    const notification = lastJsonMessage.data as Notification
    console.log(`Received notification ${JSON.stringify(notification)}`)

    // Skip notifications that shouldn't show toasts
    if (NO_TOAST_NOTIFICATIONS.includes(notification.action)) {
      confirmNotification(notification.id).catch(error => {
        console.error(`Failed to confirm notification ${notification.id}:`, error)
      })
      return
    }

    const toastContent = createToastContent(notification.message, notification.meta)

    try {
      toastHandlers[notification.severity](toastContent)
    } catch (error) {
      console.error('Error showing toast notification:', error)
    }

    confirmNotification(notification.id).catch(error => {
      console.error(`Failed to confirm notification ${notification.id}:`, error)
    })
  }, [lastJsonMessage])

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    clear()
  }

  const handleRemove = (id: number | string) => {
    remove(id)
  }

  return (
    <Menu
      positioner={{ sideOffset: 2, side: 'bottom', align: 'end' }}
      trigger={
        <Menu.Trigger>
          <DropdownMenuItem $active={false} data-testid="notifications-menu">
            <div className={styles.wrapper}>
              <BellIcon />
              {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
              {unreadCount == 0 && notifications.length > 0 && <span className={styles.emptyBadge}></span>}
            </div>
          </DropdownMenuItem>
        </Menu.Trigger>
      }
      onOpenChange={() => markAllAsRead()}
    >
      <div className={styles.notificationPanel}>
        <div className={styles.header}>
          <h3 className={styles.title}>Notifications</h3>
          {notifications.length > 0 && (
            <Button data-variant="warning" onClick={handleClear}>
              Clear All
            </Button>
          )}
        </div>

        <div className={styles.notificationList}>
          {notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>No notifications yet</p>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`${styles.notificationItem} ${!n.read ? styles.unread : ''}`}>
                <div className={styles.notificationContent}>
                  <div className={styles.notificationBody}>
                    <div className={styles.notificationText}>{typeof n.content === 'function' ? 'Notification' : n.content}</div>
                    <p className={styles.notificationTime}>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                  </div>
                  <div className={styles.notificationActions}>
                    <button className={styles.deleteButton} onClick={() => handleRemove(n.id)} title="Remove notification">
                      <TrashIcon height={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Menu>
  )
}
