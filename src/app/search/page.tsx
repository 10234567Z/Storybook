"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import Navbar from "../components/navbar";
import MainProfileInfo from "../components/mainProfileInformation";
import { Drawer, useMediaQuery } from "@mui/material";
import Image from "next/image";
import moment from "moment";
import PostCard from "../components/postCard";

export default function Page() {
    const supabase = createClient();

    const [signedIn, setSignedIn] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchedUser, setSearchedUser] = useState<any>(undefined);
    const [currentUser, setCurrentUser] = useState<any>(undefined);
    const [openPostDrawer, setOpenPostDrawer] = useState<boolean>(false);
    const [posts, setPosts] = useState<any[]>([]);
    const [error, setError] = useState<string>("");
    const [updating, setUpdating] = useState<boolean>(false);
    const searchParams = useSearchParams()
    const search = searchParams.get("q")

    const router = useRouter();

    const isMobile = useMediaQuery('(max-width: 768px)');
    async function getPosts() {
        setUpdating(true)
        const { data, error } = await supabase.from("posts").select("*").eq('user_id', searchedUser.id).order("i_at", { ascending: false });
        if (error) {
            console.error(error);
            return
        }
        setPosts(data);
        setUpdating(false)
    }
    async function checkSession() {
        const {
            data: { user: session },
        } = await supabase.auth.getUser();
        if (session) {
            setSignedIn(true);
            setLoading(false);
            setCurrentUser(session);
        } else {
            setSignedIn(false);
            router.push("/login");
        }
    }

    useEffect(() => {
        setLoading(true)
        async function getSearchedUser() {
            const { data, error } = await supabase.from("users").select("*").eq("raw_user_meta_data->>name", search)
            if (error) {
                console.error(error)
                setLoading(false)
                return
            }
            if (currentUser !== undefined && data[0] !== undefined && data[0].id === currentUser.id) {
                router.push("/myprofile")
            }
            if (data[0] === undefined) {
                setError("User not found, type a valid username")
                setLoading(false)
                return
            }
            setSearchedUser(data[0])
        }

        getSearchedUser()
        setLoading(false)
    }, [search, currentUser])

    useEffect(() => {
        checkSession();
    }, []);

    useEffect(() => {
        if (searchedUser !== undefined) {
            getPosts();
        }
    }, [searchedUser])

    console.log(error)

    supabase.channel('Update User Page').on(
        'postgres_changes',
        {
            event: "UPDATE",
            schema: "public",
            table: "posts",
        },
        (payload) => {
            getPosts()
        }).subscribe()


    return loading ? (
        <div>
            <h1>Loading...</h1>
        </div>
    ) : (
        <>
            <Navbar signedIn={signedIn} />
            {error !== "" && (
                <div className="w-screen flex flex-col justify-center items-center gap-8">
                    <div className="w-screen py-3 text-2xl text-center text-black">{error}</div>
                </div>
            )}
            {searchedUser !== undefined && (
                <div className="w-screen flex flex-col justify-center items-center gap-8">
                    <MainProfileInfo user={searchedUser} />
                    <div className="w-screen py-3 font-extrabold text-2xl text-center bg-black text-white">Posts</div>
                    <div className="w-screen flex flex-col justify-center items-center gap-8">

                        {posts.length === 0 ? "Nothing here yet..." : posts.map((post) => (
                            <PostCard key={post.post_id} post={post} updating={updating} />
                        ))}
                    </div>
                </div>
            )
            }
        </>
    );
}
