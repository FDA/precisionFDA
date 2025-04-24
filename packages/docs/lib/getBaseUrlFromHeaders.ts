import { headers } from 'next/headers';

export const getBaseUrlFromHeaders = async () => {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'http';

  const baseUrl = `${protocol}://${host}`;
  return baseUrl;
}
