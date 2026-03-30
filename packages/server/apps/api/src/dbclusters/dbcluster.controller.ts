import { Body, Controller, Get, HttpCode, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { CreateDbClusterDTO } from '@shared/domain/db-cluster/dto/create-db-cluster.dto'
import { DbClusterActionDTO } from '@shared/domain/db-cluster/dto/db-cluster-action.dto'
import { DbClusterPaginationDTO } from '@shared/domain/db-cluster/dto/db-cluster-pagination.dto'
import { DbClusterDTO } from '@shared/domain/db-cluster/dto/db-cluster.dto'
import { SyncDbClusterDTO } from '@shared/domain/db-cluster/dto/sync-db-cluster.dto'
import { UpdateDbClusterDTO } from '@shared/domain/db-cluster/dto/update-db-cluster.dto'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { Uid } from '@shared/domain/entity/domain/uid'
import { DbClusterActionFacade } from '../facade/db-cluster/action-facade/db-cluster-action.facade'
import { DbClusterCreateFacade } from '../facade/db-cluster/create-facade/db-cluster-create.facade'
import { DbClusterGetFacade } from '../facade/db-cluster/get-facade/db-cluster-get.facade'
import { DbClusterListFacade } from '../facade/db-cluster/list-facade/db-cluster-list.facade'
import { DbClusterSynchronizeFacade } from '../facade/db-cluster/synchronize-facade/db-cluster-synchronize.facade'
import { DbClusterUpdateFacade } from '../facade/db-cluster/update-facade/db-cluster-update.facade'
import { InternalRouteGuard } from '../internal/guard/internal.guard'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { DbClusterUidParamDto } from './model/dbcluster-uid-param.dto'

@ApiTags('dbclusters')
@UseGuards(UserContextGuard)
@Controller('/dbclusters')
export class DbClusterController {
  constructor(
    private readonly dbClusterSynchronizeFacade: DbClusterSynchronizeFacade,
    private readonly dbClusterCreateFacade: DbClusterCreateFacade,
    private readonly dbClusterUpdateFacade: DbClusterUpdateFacade,
    private readonly dbClusterActionFacade: DbClusterActionFacade,
    private readonly dbClusterGetFacade: DbClusterGetFacade,
    private readonly dbClusterListFacade: DbClusterListFacade,
  ) {}

  @ApiOperation({ summary: 'List db clusters' })
  @ApiOkResponse({ description: 'Paginated list of db clusters' })
  @Get()
  async list(@Query() query: DbClusterPaginationDTO): Promise<PaginatedResult<DbClusterDTO>> {
    return await this.dbClusterListFacade.listDbClusters(query)
  }

  @ApiOperation({ summary: 'Get db cluster by uid' })
  @ApiOkResponse({ description: 'Db cluster details' })
  @HttpCode(200)
  @Get(':uid')
  async get(@Param('uid') uid: Uid<'dbcluster'>): Promise<DbClusterDTO> {
    return await this.dbClusterGetFacade.getDbCluster(uid)
  }

  @ApiOperation({ summary: 'Start db cluster(s)' })
  @ApiNoContentResponse({ description: 'Start operation triggered' })
  @HttpCode(204)
  @Post('/start')
  async startDbCluster(@Body() body: DbClusterActionDTO): Promise<void> {
    await Promise.all(body.dxids.map(dxid => this.dbClusterActionFacade.startDbCluster(dxid)))
  }

  @ApiOperation({ summary: 'Stop db cluster(s)' })
  @ApiNoContentResponse({ description: 'Stop operation triggered' })
  @HttpCode(204)
  @Post('/stop')
  async stopDbCluster(@Body() body: DbClusterActionDTO): Promise<void> {
    await Promise.all(body.dxids.map(dxid => this.dbClusterActionFacade.stopDbCluster(dxid)))
  }

  @ApiOperation({ summary: 'Terminate db cluster(s)' })
  @ApiNoContentResponse({ description: 'Terminate operation triggered' })
  @HttpCode(204)
  @Post('/terminate')
  async terminateDbCluster(@Body() body: DbClusterActionDTO): Promise<void> {
    await Promise.all(body.dxids.map(dxid => this.dbClusterActionFacade.terminateDbCluster(dxid)))
  }

  @ApiOperation({ summary: 'Create a db cluster' })
  @ApiCreatedResponse({ description: 'Db cluster created' })
  @HttpCode(201)
  @Post()
  async createDbCluster(@Body() body: CreateDbClusterDTO): Promise<DbCluster> {
    return await this.dbClusterCreateFacade.createDbCluster(body)
  }

  @ApiOperation({ summary: 'Update db cluster metadata' })
  @ApiOkResponse({ description: 'Db cluster updated' })
  @HttpCode(200)
  @Put(':dbclusterUid')
  async updateDbCluster(@Param() params: DbClusterUidParamDto, @Body() body: UpdateDbClusterDTO): Promise<void> {
    return await this.dbClusterUpdateFacade.updateDbCluster(params.dbclusterUid, body)
  }

  @ApiOperation({ summary: 'Synchronize db clusters in a space (internal)' })
  @ApiCreatedResponse({ description: 'Synchronization task executed' })
  @UseGuards(InternalRouteGuard)
  @HttpCode(201)
  @Post('/sync')
  async sync(@Body() body: SyncDbClusterDTO): Promise<void> {
    await this.dbClusterSynchronizeFacade.synchronizeInSpace(body.spaceId)
  }
}
