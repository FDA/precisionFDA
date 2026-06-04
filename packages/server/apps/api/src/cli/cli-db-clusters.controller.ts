import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { DbClusterUidParamDto } from '../dbclusters/model/dbcluster-uid-param.dto'
import { CliDbClusterPasswordFacade } from '../facade/db-cluster/password-facade/cli-db-cluster-password.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

// SPECIAL ROUTES INTENDED FOR CLI USAGE ONLY. CONTAINS CLI SPECIFIC LOGIC & SPECIAL RESPONSE OBJECTS.
@Controller('/cli/dbclusters')
export class CliDbClustersController {
  constructor(private readonly cliDbClusterPasswordFacade: CliDbClusterPasswordFacade) {}

  @UseGuards(UserContextGuard)
  @Get('/:dbclusterUid/password')
  async getDbClusterPassword(@Param() params: DbClusterUidParamDto): Promise<{ password: string }> {
    const password = await this.cliDbClusterPasswordFacade.getPassword(params.dbclusterUid)
    return { password }
  }

  @UseGuards(UserContextGuard)
  @Post('/:dbclusterUid/password')
  async rotateDbClusterPassword(@Param() params: DbClusterUidParamDto): Promise<{
    password: string
  }> {
    const password = await this.cliDbClusterPasswordFacade.rotatePassword(params.dbclusterUid)
    return { password }
  }
}
