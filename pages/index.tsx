import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";


import { useEffect } from "react";


import { games } from "../games.config";


const Home: NextPage = () => {

    useEffect(() => {

    }, []);

    return (
        <>
            <Head>
                <title>Unusual Games</title>
            </Head>
            <main className="mx-auto max-w-[1960px] p-4">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {games.map(({ id, name, description, lastUpdatedDate, displayImageURL, animationPageURL, isEnabled }) => (
                        isEnabled && (
                            <Link
                                key={id}
                                target="_blank"
                                rel="noopener noreferrer"
                                href={animationPageURL}
                                className="group relative w-full overflow-hidden rounded-2xl border border-white/20 shadow-lg transition-transform duration-300 hover:scale-[1.03]"
                            >
                                {/* Main Image */}
                                <Image
                                    alt="Animation Display Image"
                                    className="h-[320px] w-full object-cover brightness-90 transition duration-500 group-hover:blur-sm group-hover:brightness-75"
                                    src={displayImageURL}
                                    width={720}
                                    height={480}
                                    sizes="(max-width: 640px) 100vw,
                                            (max-width: 1280px) 50vw,
                                            (max-width: 1536px) 33vw,
                                            25vw"
                                />

                                {/* Overlay Text Content */}
                                <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                    <h2 className="text-2xl font-semibold text-white drop-shadow-lg">{name}</h2>
                                    <p className="mt-2 max-w-[80%] text-sm text-white/80">{description}</p>
                                </div>

                                {/* Name Tag - always visible */}
                                <div className="absolute bottom-2 right-3 z-20 rounded-full bg-white/10 px-3 py-1 text-xs font-mono text-white backdrop-blur-md">
                                    {name}
                                </div>

                                {/* Update Date badge on hover bottom-left */}
                                <div className="absolute bottom-3 left-4 z-10 rounded bg-white/10 px-3 py-1 text-xs font-mono text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    {lastUpdatedDate}
                                </div>
                            </Link>
                        )
                    ))}
                </div>
            </main>


        </>
    );
};

export default Home;