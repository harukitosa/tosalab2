
export type PostPageProps = Post;

export interface Post {
    content: string;
    data: {
        title: string;
        date: string;
        draft: boolean;
        slug: string;
        category: string;
        tags: string[];
        description: string;
    }
}

export interface HomePageProps {
    contents: Post[]
    tags: string[]
}

export interface HeadData {
    title: string;
    url: string;
    image: string;
    description: string;
}