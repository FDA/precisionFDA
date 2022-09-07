import { useMemo } from "react";

export const useStroybookData = () => {
  const data = [
    {
      id: 4,
      name: 'test',
      status: 'terminated',
      description: 'test',
      created_at_date_time: '2022-02-17 12:14:57 UTC',
      scope: 'private',
    },
    {
      id: 5,
      name: 'test2',
      status: 'terminating',
      description: 'test2',
      created_at_date_time: '2022-02-17 12:16:25 UTC',
      scope: 'private',
    },
    {
      id: 6,
      name: 'test3',
      status: 'terminating',
      description: 'asdf',
      created_at_date_time: '2022-02-17 19:28:53 UTC',
      scope: 'private',
    },
  ]
  return useMemo(() => data, []);
}
