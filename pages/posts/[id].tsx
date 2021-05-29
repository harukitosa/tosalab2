import Head from 'next/head'
import matter from "gray-matter"
import fs from "fs"
import type { PostPageProps } from "../../types/PostPage"
import { GetStaticPropsContext } from 'next'
import { Container, Box, Heading } from "@chakra-ui/react"
import MarkdownIt from "markdown-it";
// @ts-ignore
import katex from "markdown-it-katex";
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

export default function PostPage(props: PostPageProps) {
  return (
    <div>
      <Head>
        <title>TosaLab</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css"/>
      </Head>

      <main>
        <Post {...props} />
      </main>
      <footer>

      </footer>
    </div>
  )
}

function Post(props: PostPageProps) {
    return (
       <Box w="100vw">
        <Container padding="2">
            <Heading as="h2" size="2xl">
                {props.title}
            </Heading>
            <Box pt="12">
                <div dangerouslySetInnerHTML={{ __html: props.content}} />
            </Box>
        </Container>
      </Box>
    )
}


export async function getStaticProps(context:GetStaticPropsContext) {
    if (context.params == null || typeof context.params.id !== "string") return;
    const path = "./posts/";
    const markdownIt = new MarkdownIt({html: true, highlight: function (str, lang) {
        if (!lang || !hljs.getLanguage(lang)) return '<pre class="hljs"><code>' + str + '</code></pre>';
        try {
        return '<pre class="hljs"><code>' +
                hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                '</code></pre>';
        } catch (__) {}
        return '<pre class="hljs"><code>' + str + '</code></pre>';
      }});
    markdownIt.use(katex);
    const file = fs.readFileSync(path + context.params.id + ".md", "utf-8");
    const content = matter(file);
    const post = markdownIt.render(content.content);
    const blogData: PostPageProps = {
        title: content.data.title,
        content: post,
    }

    return {
        props: blogData,
    }
}

const isUndefined = (content: any) => content == null;

export async function getStaticPaths() {
    const path = "./posts/";
    const files = fs.readdirSync(path);
    const paths = files
        .map(fileName => {
            const file = fs.readFileSync(path + fileName, "utf-8");
            const content = matter(file);
            const slug: string = content.data.slug; 
            if (!isUndefined(slug)) return {params: {id: slug}}
            return null;
        })
        .filter(v => v);
    return {
        paths: paths,
        fallback: false
    }
}