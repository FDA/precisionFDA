const DBCLUSTER_DESC_RES = {
  id: 'dbcluster-G6ZX5K800f2gj9zYFkBQgq63',
  project: 'project-Fyg9JX800f2qJz513yP3716y',
  class: 'dbcluster',
  sponsored: false,
  name: 'Test Db Cluster',
  types: [],
  state: 'open',
  hidden: false,
  links: [],
  folder: '/',
  tags: [],
  created: 1638474425000,
  modified: 1638474425919,
  createdBy: { user: 'user-pfda_autotest1' },
  dxInstanceClass: 'db_std1_x2',
  engine: 'aurora-mysql',
  engineVersion: '5.7.12',
  endpoint: 'dbcluster-g6zx5k800f2gj3zyfkbqgq63.cluster-cfzitlm9q1kq.us-east-1.rds.amazonaws.com',
  port: 3306,
  status: 'available',
  statusAsOf: 1638475661489,
} as const

const FILES_LIST_RES_ROOT = {
  results: [
    {
      project: 'project-FyxxYYj0f24VYQXy4QjPG2bB',
      id: 'file-Fyzv0V00f24kgVbb3zBj1Bg9',
      describe: {
        id: 'file-Fyzv0V00f24kgVbb3zBj1Bg9',
        name: 'a',
        size: 0,
      },
    },
    {
      project: 'project-FyxxYYj0f24VYQXy4QjPG2bB',
      id: 'file-Fyzqyg80f24v2BJ93yq7yF4j',
      describe: {
        id: 'file-Fyzqyg80f24v2BJ93yq7yF4j',
        name: 'b',
        size: 0,
      },
    },
    {
      project: 'project-FyxxYYj0f24VYQXy4QjPG2bB',
      id: 'file-Fyzqyg00f24f3qf940Pj7pfx',
      describe: {
        id: 'file-Fyzqyg00f24f3qf940Pj7pfx',
        name: 'c',
        size: 0,
      },
    },
    {
      project: 'project-FyxxYYj0f24VYQXy4QjPG2bB',
      id: 'file-Fyz77k80f24j1JB6332YgXKY',
      describe: {
        id: 'file-Fyz77k80f24j1JB6332YgXKY',
        name: 'd',
        size: 0,
      },
    },
  ],
  next: null,
} as const

const FILES_LIST_RES_SNAPSHOT = {
  results: [
    {
      project: 'project-FyxxYYj0f24VYQXy4QjPG2bB',
      id: 'file-Fyz76Q80f24p444q33Fg7ggz',
      describe: {
        id: 'file-Fyz76Q80f24p444q33Fg7ggz',
        name: 'snapshot',
        size: 0,
      },
    },
  ],
  next: null,
} as const

const FILES_LIST_RES_TEST_FOLDER = {
  results: [
    {
      project: 'project-FyxxYYj0f24VYQXy4QjPG2bB',
      id: 'file-Fyz76vj0f24xqYQ01vB7KZJY',
      describe: {
        id: 'file-Fyz76vj0f24xqYQ01vB7KZJY',
        name: 'test-file',
        size: 0,
      },
    },
  ],
  next: null,
} as const

const FOLDERS_LIST_RES = {
  id: 'project-FyxxYYj0f24VYQXy4QjPG2bB',
  folders: ['/', '/.Notebook_snapshots', '/test-folder'],
}

const FOLDERS_LIST_RES_MEDIUM = {
  id: 'project-FyxxYYj0f24VYQXy4QjPG2bB',
  folders: ['/', '/.Notebook_snapshots', '/test-folder', '/foo', '/foo/bar', '/foo/bar/stu'],
}

const FOLDERS_LIST_RES_LARGE = {
  id: 'project-FyxxYYj0f24VYQXy4QjPG2bB',
  folders: ['/'].concat(Array.from(Array(33).keys()).map(i => `/folder-${i}`)),
}

const FILES_DESC_RES = {
  results: [
    {
      describe: {
        id: FILES_LIST_RES_ROOT.results[0].id,
        project: 'project-foo',
        class: 'file',
        sponsored: false,
        name: 'a',
        types: [],
        state: 'closed',
        hidden: false,
        links: [],
        folder: '/.ipynb_checkpoints',
        tags: [],
        created: 1606401885000,
        modified: 1606401886627,
        media: 'text/plain',
        size: 32,
      },
    },
    {
      describe: {
        id: FILES_LIST_RES_ROOT.results[1].id,
        project: 'project-foo',
        class: 'file',
        sponsored: false,
        name: 'b',
        types: [],
        state: 'closed',
        hidden: false,
        links: [],
        folder: '/',
        tags: [],
        created: 1606401885000,
        modified: 1606401886627,
        media: 'text/plain',
        size: 32,
      },
    },
    {
      describe: {
        id: FILES_LIST_RES_ROOT.results[2].id,
        project: 'project-foo',
        class: 'file',
        sponsored: false,
        name: 'c',
        types: [],
        state: 'closed',
        hidden: false,
        links: [],
        folder: '/',
        tags: [],
        created: 1606401885000,
        modified: 1606401886627,
        media: 'text/plain',
        size: 32,
      },
    },
    {
      describe: {
        id: FILES_LIST_RES_ROOT.results[3].id,
        project: 'project-foo',
        class: 'file',
        sponsored: false,
        name: 'd',
        types: [],
        state: 'closed',
        hidden: false,
        links: [],
        folder: '/',
        tags: [],
        created: 1606401885000,
        modified: 1606401886627,
        media: 'text/plain',
        size: 32,
      },
    },
    {
      describe: {
        id: FILES_LIST_RES_TEST_FOLDER.results[0].id,
        project: 'project-foo',
        class: 'file',
        sponsored: false,
        name: 'test',
        types: [],
        state: 'closed',
        hidden: false,
        links: [],
        folder: '/test-folder',
        tags: [],
        created: 1606401885000,
        modified: 1606401886627,
        media: 'text/plain',
        size: 32,
      },
    },
    {
      describe: {
        id: FILES_LIST_RES_SNAPSHOT.results[0].id,
        project: 'project-foo',
        class: 'file',
        sponsored: false,
        name: 'snapshot',
        types: [],
        state: 'closed',
        hidden: false,
        links: [],
        folder: '/.Notebook_snapshots',
        tags: [],
        created: 1606401885000,
        modified: 1606401886627,
        media: 'text/plain',
        size: 32,
      },
    },
  ],
} as const

export {
  DBCLUSTER_DESC_RES,
  FILES_LIST_RES_ROOT,
  FILES_LIST_RES_SNAPSHOT,
  FILES_DESC_RES,
  FOLDERS_LIST_RES,
  FOLDERS_LIST_RES_MEDIUM,
  FOLDERS_LIST_RES_LARGE,
  FILES_LIST_RES_TEST_FOLDER,
}

