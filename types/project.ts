interface Project {
    id: number;
    name: string;
    description: string;
    tools: string[];
    role: string;
    code: string;
    demo: string;
}

interface DetailProject {
    name: string;
    description: string;
    tags: string[];
    code: string;
    demo: string;
    image?: { src: string };
    features: string[];
}

export type { Project, DetailProject };