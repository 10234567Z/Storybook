'use client'

import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function MainProfileInfo({ user }: any) {
    const [numberofPosts, setNumberofPosts] = useState<number>(0)
    const [numberofComments, setNumberofComments] = useState<number>(0)
    const [numberofFollowers, setNumberofFollowers] = useState<number>(0)
    const [numberofFollowing, setNumberofFollowing] = useState<number>(0)
    const supabase = createClient()
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

        async function fetchFollowings() {
            const { data, error } = await supabase
                .from('following')
                .select('*')
                .eq('user_id', user.id)
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
                .eq('following_id', user.id)
            if (error) {
                console.error(error)
            } else {
                setNumberofFollowing(data.length)
            }
        }

        fetchUserComments()
        fetchFollowers()
        fetchFollowings()
        fetchUserStats()
    }, [])
    return (
        <div className="w-screen flex flex-col sm:flex-row justify-center items-center">
            <div className="w-1/3 h-1/3 flex flex-col justify-center items-center">
                <Image src='/profile/pfp.svg' alt="Profile Picture" width={100} height={100} />
            </div>
            <div>
                <h3 className="text-lg font-bold">{user.user_metadata.name}</h3>
                <p className="text-lg">{user.user_metadata.bio === '' ? "No bio set-up yet by the user yet" : user.user_metadata.bio}</p>
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