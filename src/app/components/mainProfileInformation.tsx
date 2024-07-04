'use client'

import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function MainProfileInfo({ user }: any) {
    const [numberofPosts, setNumberofPosts] = useState<number>(0)
    const [numberofComments, setNumberofComments] = useState<number>(0)
    const [numberofFollowers, setNumberofFollowers] = useState<number>(0)
    const [numberofFollowing, setNumberofFollowing] = useState<number>(0)
    const [editing, setEditing] = useState<boolean>(false)
    const supabase = createClient()

    async function fetchFollowings() {
        const { data, error } = await supabase
            .from('following')
            .select('*')
            .eq('following_id', user.id)
        if (error) {
            console.error(error)
        } else {
            setNumberofFollowers(data.length)
        }
    }

    async function fetchFollowers() {
        const { data, error } = await supabase
            .from('following')
            .select('*')
            .eq('user_id', user.id)
        if (error) {
            console.error(error)
        } else {
            setNumberofFollowing(data.length)
        }
    }

    useEffect(() => {
        async function fetchUserStats() {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('user_id', user.id)
            if (error) {
                console.error(error)
            } else {
                setNumberofPosts(data.length)
            }
        }

        async function fetchUserComments() {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('user_id', user.id)
            if (error) {
                console.error(error)
            } else {
                setNumberofComments(data.length)
            }
        }
        fetchUserComments()
        fetchFollowers()
        fetchFollowings()
        fetchUserStats()
    }, [])

    function handleEditing() {
        setEditing(!editing)
    }

    async function handleEditSubmit(e: any) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const bio = formData.get('bio') as string
        const userMetadata = user.user_metadata;
        userMetadata.bio = bio;
        const { data, error } = await supabase
            .from('users')
            .update({ raw_user_meta_data: userMetadata })
            .eq('id', user.id)
        if (error) {
            console.error(error)
        }
        else {
            setEditing(false)
        }
    }


    const userName = user.user_metadata !== undefined ? user.user_metadata.name : user.raw_user_meta_data.name;
    const bio = user.user_metadata !== undefined ? user.user_metadata.bio : user.raw_user_meta_data.bio;
    return (
        <div className="w-screen flex flex-col sm:flex-row justify-center items-center">
            <div className="w-1/3 h-1/3 flex flex-col justify-center items-center">
                <Image src='/profile/pfp.svg' alt="Profile Picture" width={100} height={100} />
            </div>
            <div>
                <h3 className="text-lg font-bold">{userName}</h3>
                <div className="flex gap-4">
                    {
                        editing ? (
                            <form onSubmit={handleEditSubmit}>
                                <input type="text" name="bio" placeholder="bio" />
                                <button>Save</button>
                            </form>
                        )
                            :
                            <p className="text-lg">{bio === '' ? "No bio set by user yet.." : bio}</p>
                    }
                    <button onClick={handleEditing}>
                        <Image src="/postCard/edit.svg" alt="Edit" width={25} height={25} />
                    </button>
                </div>
                <div className="flex flex-row gap-4 mt-6">
                    <p className="text-lg"><strong>Posts</strong>: {numberofPosts}</p>
                    <p className="text-lg"><strong>Comments</strong>: {numberofComments}</p>
                    <p className="text-lg"><strong>Followers</strong>: {numberofFollowers}</p>
                    <p className="text-lg"><strong>Following</strong>: {numberofFollowing}</p>
                </div>
            </div>
        </div>
    )
}