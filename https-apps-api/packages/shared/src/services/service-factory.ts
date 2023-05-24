import { AxiosInstance } from 'axios'
import { SqlEntityManager } from '@mikro-orm/mysql'
import type { Logger } from 'pino'
import {
  INotificationService,
  NotificationService,
  RedisClientType,
} from '../domain/notification/services/notification.service'
import { IPlatformAuthClient, PlatformAuthClient } from '../platform-client/platform-auth-client'
import { IWorkstationClient, WorkstationClient } from '../workstation-client/workstation-client'
import { emailClient, IEmailService, saveEmailToFileClient } from './smtp.service'
import { config } from '../config'

/**
 * A simple factory for services, so that we can inject different implementations depending on environment
 *
 * N.B. Important: This is a temporary solution to get us at least some notion of context-dependent consturction of services
 *      so that we move away from overriding prototypes in tests
 *      It is to be replaced by a proper IOC container.
 *
 */
interface IServiceFactory {
  getEmailService: () => IEmailService
  getNotificationService: (
    em: SqlEntityManager,
    redisClient?: RedisClientType,
  ) => INotificationService
  getPlatformAuthClient(
    accessToken: string,
    logger?: Logger,
    axiosInstance?: AxiosInstance,
  ): IPlatformAuthClient
  getWorkstationClient: (
    url: string,
    axiosInstance?: AxiosInstance,
    logger?: Logger,
  ) => IWorkstationClient
}

export class ServiceFactory implements IServiceFactory {
  getEmailService(): IEmailService {
    if (config.emails.smtp.saveEmailToFile) {
      return saveEmailToFileClient
    }
    return emailClient
  }

  getNotificationService(
    em: SqlEntityManager,
    redisClient?: RedisClientType,
  ): INotificationService {
    return new NotificationService(em, redisClient)
  }

  getPlatformAuthClient(
    accessToken: string,
    logger?: Logger,
    axiosInstance?: AxiosInstance,
  ): IPlatformAuthClient {
    return new PlatformAuthClient(accessToken, logger, axiosInstance)
  }

  getWorkstationClient(
    url: string,
    axiosInstance?: AxiosInstance,
    logger?: Logger,
  ): IWorkstationClient {
    return new WorkstationClient(url, axiosInstance, logger)
  }
}

let serviceFactory: IServiceFactory = new ServiceFactory()

export const setServiceFactory = (newFactory: IServiceFactory) => {
  serviceFactory = newFactory
}

// TODO: In the future, we'll use an IOC framework to inject dependencies into services, but for now
//       getServiceFactory() can be used for that purpose
export const getServiceFactory = (): IServiceFactory => {
  return serviceFactory
}
