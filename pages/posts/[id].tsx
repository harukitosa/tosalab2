import Head from 'next/head'
import matter from "gray-matter"
import fs from "fs"
import type { PostPageProps, Post } from "../../types/type"
import { GetStaticPropsContext } from 'next'
import { Container, Box, Heading } from "@chakra-ui/react"
import 'highlight.js/styles/github.css';
import { renderMarkdown } from '../../utils/renderMarkdown'



export default function PostPage(props: PostPageProps) {
  return (
    <div>
      <Head>
        <title>TosaLab</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css"/>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="description" content="サイトの説明文"/>
        <link rel="canonical" href="https://tosa.dev"/>
        <meta property="og:title" content={props.data.title}/>
        <meta property="og:type" content="blog"/>
        {/* <meta property="og:url" content="http://xxx.xxx"/> */}
        {/* <meta property="og:image" content="images/xxx.png"/> */}
        <meta property="og:site_name" content="tosa.dev"/>
        <meta property="og:description" content={props.data.description}/>
      </Head>

      <main>
        <PostView {...props} />
      </main>

      <footer>

      </footer>
    </div>
  )
}

function PostView(props: PostPageProps) {
    return (
       <Box w="100vw">
        <Container padding="2">
            <Heading as="h2" size="2xl">
                {props.data.title}
            </Heading>
            <Box pt="12">
                <div dangerouslySetInnerHTML={{ __html: props.content}} />
            </Box>
        </Container>
      </Box>
    )
}


const baseName = (str:string) => {
    const base = new String(str).substring(str.lastIndexOf('/') + 1); 
     if(base.lastIndexOf(".") != -1) 
         return base.substring(0, base.lastIndexOf("."));
    return base;
 }

export async function getStaticProps(context:GetStaticPropsContext) {
    if (context.params == null || typeof context.params.id !== "string") return;
    const path = "./posts/";
    const file = fs.readFileSync(path + context.params.id + ".md", "utf-8");
    const content = matter(file);
    const post = renderMarkdown(content.content);
    const blogData = {
        ...content,
        content: post,
        orig: "",
    };
    return {
        props: blogData,
    }
}

export async function getStaticPaths() {
    const path = "./posts/";
    const files = fs.readdirSync(path);
    const paths = files
        .map(fileName => {
            return {params: {id: baseName(fileName)}}
         })
        .filter(v => v);
    return {
        paths: paths,
        fallback: false
    }
}