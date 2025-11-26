import React from 'react'
import { usePageMeta } from '../../../hooks/usePageMeta'
import { UserLayout } from '../../../layouts/UserLayout'
import {
  AdminSectionBreadcrumbDivider,
  AdminSectionBreadcrumbs,
  AdminStyledPageTable,
  Title,
  Topbox,
  TopLeft,
} from '../styles'
import { Link } from 'react-router-dom'
import Table from '../../../components/Table'
import { ContentFooter } from '../../../components/Page/ContentFooter'
import { hidePagination, Pagination } from '../../../components/Pagination'
import { HoverDNAnexusLogo } from '../../../components/icons/DNAnexusLogo'
import { useList } from '../../home/useList'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../../utils/object'
import { IFilter, MetaV2 } from '../../home/types'
import { Params, prepareListFetchV2 } from '../../home/utils'
import axios from 'axios'
import { ObjectGroupIcon } from '../../../components/icons/ObjectGroupIcon'
import { ISpaceV2 } from '../../spaces/spaces.types'
import { useSpacesColumns } from '../../spaces/useSpacesColumns'
import { SpacesListActionRow } from './SpacesListActionRow'

type AdminSpaceListType = { data: ISpaceV2[]; meta: MetaV2 }

export async function fetchSpaces(filters: IFilter[], params: Params) {
  const query = prepareListFetchV2(filters, params)
  return axios.get<AdminSpaceListType>('/api/v2/spaces', { params: new URLSearchParams(query) }).then(r => r.data)
}

export const SpacesList = () => {
  usePageMeta({ title: 'precisionFDA Admin - Spaces' })

  const {
    setPerPageParam,
    setPageParam,
    setSearchFilter,
    filterQuery,
    perPageParam,
    sortBy,
    setSortBy,
    query,
    selectedIndexes,
    setSelectedIndexes,
    saveColumnResizeWidth,
    colWidths,
  } = useList<AdminSpaceListType>({
    fetchList: fetchSpaces,
    resource: 'admin-spaces',
    params: {},
  })

  const columns = useSpacesColumns()

  const { data, isLoading, error } = query
  if (error) {
    return <div>{JSON.stringify(error)}</div>
  }

  const selectedObjects = getSelectedObjectsFromIndexes(selectedIndexes, data?.data)

  const filters = toArrayFromObject(filterQuery)

  return (
    <UserLayout innerScroll>
      <AdminSectionBreadcrumbs>
        <Link to="/admin" data-turbolinks="false">
          Admin Dashboard
        </Link>
        <AdminSectionBreadcrumbDivider>/</AdminSectionBreadcrumbDivider>
        <Link to="/admin/spaces" data-turbolinks="false">
          Spaces
        </Link>
      </AdminSectionBreadcrumbs>
      <Topbox>
        <TopLeft>
          <ObjectGroupIcon height={20} />
          <Title>Space Management</Title>
        </TopLeft>
        <SpacesListActionRow
          selectedSpaces={selectedObjects}
          setSelectedIndexes={setSelectedIndexes}
          refetchSpaces={query.refetch}
        />
      </Topbox>

      <AdminStyledPageTable>
        <Table<ISpaceV2>
          isLoading={isLoading}
          data={data?.data ?? []}
          columns={columns}
          columnSizing={colWidths}
          setColumnSizing={saveColumnResizeWidth}
          rowSelection={selectedIndexes}
          setSelectedRows={setSelectedIndexes}
          setColumnFilters={setSearchFilter}
          columnSortBy={sortBy}
          setColumnSortBy={setSortBy}
          columnFilters={filters}
        />
      </AdminStyledPageTable>

      <ContentFooter>
        <Pagination
          page={data?.meta?.page}
          totalCount={data?.meta?.total}
          totalPages={data?.meta?.totalPages}
          perPage={perPageParam}
          isHidden={hidePagination(query.isFetched, data?.data?.length, data?.meta?.totalPages)}
          setPage={setPageParam as (n: number) => void}
          onPerPageSelect={setPerPageParam as (n: number) => void}
          showListCount
        />
        <HoverDNAnexusLogo opacity height={14} />
      </ContentFooter>
    </UserLayout>
  )
}