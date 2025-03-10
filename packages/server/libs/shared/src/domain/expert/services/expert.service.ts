import { FilterQuery, SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { ExpertDTO } from '@shared/domain/expert/dto/expert.dto'
import { ExpertRepository } from '../expert.repository'
import { ExpertPaginationDTO } from '@shared/domain/expert/dto/expert-pagination.dto'
import { TimeUtils } from '@shared/utils/time.utils'
import { Expert } from '@shared/domain/expert/expert.entity'
import { NotFoundError } from '@shared/errors'
import { STATIC_SCOPE } from '@shared/enums'
import { User } from '@shared/domain/user/user.entity'
import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'
import { Uid } from '@shared/domain/entity/domain/uid'
import { UserFileRepository } from '@shared/domain/user-file/user-file.repository'

@Injectable()
export class ExpertService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly userCtx: UserContext,
    private readonly expertRepository: ExpertRepository,
    private readonly userFileRepository: UserFileRepository,
    private readonly removeNodesFacade: RemoveNodesFacade,
  ) {}

  async delete(expertId: number) {
    const expert = await this.expertRepository.findOne(
      { id: expertId },
      { populate: ['user', 'questions', 'answers', 'questions.comments'] },
    )
    if (!expert) {
      throw new NotFoundError('Expert does not exist')
    }

    this.logger.log(`Deleting expert: ${expert.user.getProperty('dxuser')} with id: ${expert.id}`)

    const fileIdToRemove = expert.meta._image_id as Uid<'file'>
    const fileToRemove = await this.userFileRepository.findOne({ uid: fileIdToRemove })
    await this.em.transactional(async (em) => {
      // this will remove all questions and answers associated with the expert in cascade delete
      await em.removeAndFlush(expert)
    })

    try {
      await this.removeNodesFacade.removeNodes([fileToRemove.id])
    } catch (e) {
      this.logger.error(
        `Failed to remove expert picture file with id: ${fileToRemove.id}: ${e.message}`,
      )
    }
  }

  async getExpert(expertId: number): Promise<ExpertDTO> {
    const expert = await this.expertRepository.findOne({ id: expertId }, { populate: ['user'] })
    const user = await this.em.findOne(User, { id: this.userCtx.id })

    if (!expert || !(await expert.isAccessibleBy(user))) {
      throw new NotFoundError('Expert does not exist or is not accessible by you')
    }

    return ExpertDTO.fromEntity(expert)
  }

  async listExperts(pagination: ExpertPaginationDTO) {
    const where: FilterQuery<Expert> = {}
    const { year } = pagination.filter ?? {}

    const user = await this.em.findOne(User, { id: this.userCtx.id })
    if (!user) {
      where.scope = STATIC_SCOPE.PUBLIC
    } else if (!(await user.isSiteAdmin())) {
      where.$or = [{ user: { id: user.id } }, { scope: STATIC_SCOPE.PUBLIC }]
    }

    if (year) {
      const [startOfYear, endOfYear] = TimeUtils.getTimeRangeForYear(year)
      where.createdAt = { $gte: startOfYear, $lte: endOfYear }
    }

    const result = await this.expertRepository.paginate(pagination, where, { populate: ['user'] })

    const experts = result.data.map((expert) => ExpertDTO.fromEntity(expert))
    return {
      ...result,
      data: experts,
    }
  }

  /*
   * Get a list of years that have at least one expert
   */
  async getYears() {
    const result = await this.em.execute(
      'SELECT distinct YEAR(created_at) as year FROM experts order by year desc',
    )

    return result.map((y) => y.year)
  }
}
