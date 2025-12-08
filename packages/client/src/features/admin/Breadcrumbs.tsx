import React from 'react'
import { Link } from 'react-router'
import { AdminSectionBreadcrumbDivider, AdminSectionBreadcrumbs } from './styles'

export type BreadcrumbItem = {
  path: string
  name: string
}

const Breadcrumbs = ({ breadcrumbs }: { breadcrumbs: BreadcrumbItem[] }) => {
  return (
    <AdminSectionBreadcrumbs>
      <Link to="/admin" data-turbolinks="false">
        Admin Dashboard
      </Link>
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={index}>
          <AdminSectionBreadcrumbDivider>/</AdminSectionBreadcrumbDivider>
          <Link to={breadcrumb.path} data-turbolinks="false">
            {breadcrumb.name}
          </Link>
        </React.Fragment>
      ))}
    </AdminSectionBreadcrumbs>
  )
}

export default Breadcrumbs
