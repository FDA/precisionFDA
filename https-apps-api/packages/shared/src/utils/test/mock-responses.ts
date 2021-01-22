const FILES_LIST_RES_ROOT = {
  results: [
    {
      project: 'project-FyxxYYj0f24VYQXy4QjPG2bB',
      id: 'file-Fyzv0V00f24kgVbb3zBj1Bg9',
    },
    {
      project: 'project-FyxxYYj0f24VYQXy4QjPG2bB',
      id: 'file-Fyzqyg80f24v2BJ93yq7yF4j',
    },
    {
      project: 'project-FyxxYYj0f24VYQXy4QjPG2bB',
      id: 'file-Fyzqyg00f24f3qf940Pj7pfx',
    },
    {
      project: 'project-FyxxYYj0f24VYQXy4QjPG2bB',
      id: 'file-Fyz77k80f24j1JB6332YgXKY',
    },
    // recurse = false -> should not be returned
    // {
    //   project: 'project-FyxxYYj0f24VYQXy4QjPG2bB',
    //   id: 'file-Fyz76vj0f24xqYQ01vB7KZJY',
    // },
    // {
    //   project: 'project-FyxxYYj0f24VYQXy4QjPG2bB',
    //   id: 'file-Fyz76Q80f24p444q33Fg7ggz',
    // },
  ],
  next: null,
} as const

const FILES_LIST_RES_SNAPSHOT = {
  results: [
    {
      project: 'project-FyxxYYj0f24VYQXy4QjPG2bB',
      id: 'file-Fyz76Q80f24p444q33Fg7ggz',
    },
  ],
  next: null,
} as const

const FILES_LIST_RES_TEST_FOLDER = {
  results: [
    {
      project: 'project-FyxxYYj0f24VYQXy4QjPG2bB',
      id: 'file-Fyz76vj0f24xqYQ01vB7KZJY',
    },
  ],
  next: null,
} as const

const FOLDERS_LIST_RES = {
  id: 'project-FyxxYYj0f24VYQXy4QjPG2bB',
  folders: ['/', '/.Notebook_snapshots', '/test-folder'],
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
  FILES_LIST_RES_ROOT,
  FILES_LIST_RES_SNAPSHOT,
  FILES_DESC_RES,
  FOLDERS_LIST_RES,
  FILES_LIST_RES_TEST_FOLDER,
}
