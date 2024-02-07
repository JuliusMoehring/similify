export default function Home() {
    return <main>asdf</main>;
}

/**

async function CrudShowcase() {
    const session = await getServerAuthSession();
    if (!session?.user) return null;

    const latestPost = await api.post.getLatest.query();

    return (
        <div className="w-full max-w-xs">
            {latestPost ? (
                <p className="truncate">
                    Your most recent post: {latestPost.name}
                </p>
            ) : (
                <p>You have no posts yet.</p>
            )}

            <CreatePost />
        </div>
    );
}

 */
