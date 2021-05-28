import Head from 'next/head'

export default function PostPage({ foo }) {
  return (
    <div>
      <Head>
        <title>TosaLab</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h2>{foo}</h2>
      </main>

      <footer>

      </footer>
    </div>
  )
}

export async function getStaticProps() {
    const foo = 'Hello'

    return {
        props: { foo },
    }
}


export async function getStaticPaths() {
    return {
        paths: [
            { params: { id: 'my-first-post' } },
            { params: { id: 'my-second-post' } },
            { params: { id: 'my-third-post' } }, 
        ],
        fallback: false
    }
}