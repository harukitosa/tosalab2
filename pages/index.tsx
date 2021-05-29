import Head from 'next/head'
import matter from "gray-matter"
import fs from "fs"
import { GetStaticPropsContext } from 'next'
import { Container, Box, Heading, Text, Tag } from "@chakra-ui/react";
import Link from 'next/link';

export default function Home(props: HomePageProps) {
  console.log(props);
  return (
    <div>
      <Head>
        <title>TosaLab</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {props.contents.map(item => {
            return PostList(item);
        })}
      </main>
      <footer>

      </footer>
    </div>
  )
}

function PostList(props: Post) {
  return (
    <Box w="100vw">
      <Link href={"/posts/" + props.id}>
        <Container padding="2">
          <Text color="gray.600">{props.date}</Text>
          <Text fontWeight="bold" _hover={{ color: "#1A0DAB"}}>{props.title}</Text>
          {props.tags != null && props.tags.map(item => {
            return <Tag marginRight="1">{item}</Tag>
          })}
        </Container>           
      </Link>
    </Box>
  );
}

interface Post {
  id: string;
  title: string;
  date: string;
  tags: string[];
}

interface HomePageProps {
  contents: ({
    id: string;
    title: string;
    date: string;
    tags: string[];
  })[]
}

export async function getStaticProps(context:GetStaticPropsContext) {
  const path = "./posts/";
  const files = fs.readdirSync(path);
  const contents = files
      .map(fileName => {
          const file = fs.readFileSync(path + fileName, "utf-8");
          const content = matter(file);
          const slug: string = content.data.slug; 
          if (slug != null) return {
            id: slug, 
            title: content.data.title, 
            date: content.data.date,
            tags: content.data.tags,
          }
          return null;
      })
      .filter(v => v)
      .sort((a, b) => {
        const date = new Date(a?.date);
        const date1 = new Date(b?.date);
        if (date > date1) return -1;
        else return 1;
      })
      console.log(contents);

  return {
      props: {
        contents
      },
  }
}