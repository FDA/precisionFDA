import axios from 'axios';
import { User } from './types';

export async function bulkEnableResource(
  ids: number[],
  resource: User['cloudResourceSettings']['resources'][number],
) {
  const resp = await axios.post('/admin/bulk_enable_resource', { ids, resource })
  return resp.data
}

export async function bulkEnableAllResources(ids: number[]) {
  const resp = await axios.post('/admin/bulk_enable_all_resources', { ids })
  return resp.data
}

export async function bulkDisableResource(
  ids: number[],
  resource: User['cloudResourceSettings']['resources'][number],
) {
  const resp = await axios.post('/admin/bulk_disable_resource', { ids, resource })
  return resp.data
}

export async function bulkDisableAllResources(ids: number[]) {
  const resp = await axios.post('/admin/bulk_disable_all_resources', { ids })
  return resp.data
}
