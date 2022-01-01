import matter from "gray-matter"
import fs from "fs"
import type { PostPageProps, Post } from "../../types/type"
import { GetStaticPropsContext } from 'next'
import { Container, Box, Heading, Icon, Link } from "@chakra-ui/react"
import 'highlight.js/styles/github.css';
import { renderMarkdown } from '../../utils/renderMarkdown'
import { useRouter } from 'next/router';
import { BaseHeader } from "../../component/BaseHead"

export default function PostPage(props: PostPageProps) {

  const HeadData = {
    title: props.data.title,
    url:"https://tosa.dev" + useRouter().asPath,
    image: "https://tosa.dev/icon.jpeg",
    description: props.data.description
  };

  return (
    <div>
        <BaseHeader {...HeadData} />
      <main>
        <PostView {...props} />
      </main>

      <footer>
        <Container height="20">
          <Link href="/">
            Home...
          </Link>
        </Container>
      </footer>
    </div>
  )
}

function PostView(props: PostPageProps) {
    return (
       <Box w="100vw">
        <Container padding="2" mx="2">
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