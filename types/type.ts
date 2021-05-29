
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
}