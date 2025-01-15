interface Repository {
    id: number;
    name: string;
    description: string;
    url: string;
    primaryLanguage: { name: string; color: string } | null;
    forkCount: number;
    stargazers: { totalCount: number };
    diskUsage: number;
}

type Repositories = Repository[];

export type { Repository, Repositories };