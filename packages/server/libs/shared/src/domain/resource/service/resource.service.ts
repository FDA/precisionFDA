import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { ResourceRepository } from '../resource.repository'

@Injectable()
export class ResourceService {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly resourceRepository: ResourceRepository,
  ) {}

  async removeById(id: number): Promise<void> {
    await this.em.remove(this.resourceRepository.getReference(id)).flush()
  }
}
