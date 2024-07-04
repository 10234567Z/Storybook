'use client'

import { createClient } from "@/utils/supabase/client";
import { Drawer, useMediaQuery } from "@mui/material";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function MainProfileInfo({ user }: any) {
    const [numberofPosts, setNumberofPosts] = useState<number>(0)
    const [numberofComments, setNumberofComments] = useState<number>(0)
    const [numberofFollowers, setNumberofFollowers] = useState<number>(0)
    const [numberofFollowing, setNumberofFollowing] = useState<number>(0)
    const [editing, setEditing] = useState<boolean>(false)
    const [profilePic, setProfilePic] = useState<string>("");
    const [openEditProfileDrawer, setOpenEditProfileDrawer] = useState<boolean>(false);
    const [file, setFile] = useState<File | null>(null);
    const [profileSubmitted, setProfileSubmitted] = useState<boolean>(false);
    const supabase = createClient()

    const inputRef = React.useRef<HTMLInputElement>(null);


    const handleRefClick = React.useCallback(() => {
        if (inputRef.current) {
            inputRef.current.click();
        }
    }, [])

    const notAuthUser = user.user_metadata === undefined;

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

        async function fetchUserProfilePic() {
            if (notAuthUser) {
                if (user.raw_user_meta_data.profile_pic !== '') {
                    const { data, error } = await supabase.storage.from('profile_pic').download(user.raw_user_meta_data.profile_pic);
                    if (error) {
                        console.error(error)
                    }
                    else {
                        setProfilePic(URL.createObjectURL(data))
                    }
                }
                else {
                    const { data, error } = await supabase.storage.from('profile_pic').download('default_profile_pic.png');
                    if (error) {
                        console.error(error)
                    }
                    else {
                        setProfilePic(URL.createObjectURL(data))
                    }
                }
            }
            else {
                if (user.user_metadata.profile_pic !== '') {
                    const { data, error } = await supabase.storage.from('profile_pic').download(user.user_metadata.profile_pic);
                    if (error) {
                        console.error(error)
                    }
                    else {
                        setProfilePic(URL.createObjectURL(data))
                    }
                }
                else {
                    const { data, error } = await supabase.storage.from('profile_pic').download('default_profile_pic.png');
                    if (error) {
                        console.error(error)
                    }
                    else {
                        setProfilePic(URL.createObjectURL(data))
                    }
                }
            }
        }
        fetchUserProfilePic()
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

    async function handleProfilePicSubmit(e: any) {
        e.preventDefault()
        if (file === null || !profileSubmitted) return
        const formData = new FormData(e.currentTarget)
        const newFile = formData.get('profile_pic') as File
        const fileName = newFile.name;
        const fileExt = fileName.split('.').pop();

        if (user.user_metadata.profile_pic !== '') {
            const { data, error } = await supabase
                .storage
                .from('profile_pic')
                .update(`${user.id}.${fileExt}`, file, {
                    upsert: true,
                })
            if (error) {
                console.error(error)
            }
        }
        else {
            const { data, error } = await supabase
                .storage
                .from('profile_pic')
                .upload(`${user.id}.${fileExt}`, file, {
                    upsert: false,
                })
            if (error) {
                console.error(error)
            }
        }
        const userMetadata = user.user_metadata;
        userMetadata.profile_pic = `${user.id}.${fileExt}`;
        const { data, error } = await supabase
            .from('users')
            .update({ raw_user_meta_data: userMetadata })
            .eq('id', user.id)
        if (error) {
            console.error(error)
        }
        else {
            setProfileSubmitted(false)
            setOpenEditProfileDrawer(false)
            setProfilePic(URL.createObjectURL(file))
        }
    }

    function editingProfilePic(e: any) {
        const file = e.target.files[0];
        if (file === undefined) {
            return
        }
        console.log(file.name.split('.').pop())
        setFile(file)
    }

    const isMobile = useMediaQuery('(max-width: 768px)');
    const userName = user.user_metadata !== undefined ? user.user_metadata.name : user.raw_user_meta_data.name;
    const bio = user.user_metadata !== undefined ? user.user_metadata.bio : user.raw_user_meta_data.bio;
    return (
        <>
            <Drawer anchor="right" open={openEditProfileDrawer} onClose={() => setOpenEditProfileDrawer(false)} PaperProps={{
                sx: {
                    width: isMobile ? '100%' : '50%',
                }
            }}>
                <button onClick={() => setOpenEditProfileDrawer(false)} className="flex flex-row justify-start">
                    <Image src="/comments/close.svg" width={35} height={35} alt="CloseLogo" className=" m-4 hover:bg-slate-200 focus:bg-slate-400 rounded-full transition-all" />
                </button>
                <div className="flex flex-col justify-center items-center gap-4 p-4">
                    <h1 className="text-2xl font-bold">Edit Profile</h1>
                    <Image src={file === null ? profilePic : URL.createObjectURL(file!)} className="rounded-full" alt="Profile Picture" width={150} height={150} />
                    <form onSubmit={handleProfilePicSubmit} className="flex flex-row justify-center items-center gap-4">
                        <input type="file" name="profile_pic" ref={inputRef} onChange={editingProfilePic} hidden />
                        <button onClick={handleRefClick} className=" p-4 px-6 rounded-md bg-slate-800 text-white transition-all hover:bg-slate-700">Choose the picture</button>
                        {
                            file !== null && <button className=" p-4 px-6 rounded-md bg-slate-800 text-white transition-all hover:bg-slate-700" type="submit" onClick={() => setProfileSubmitted(true)}>Edit</button>
                        }
                    </form>
                </div>
            </Drawer>
            <div className="w-screen flex flex-col sm:flex-row justify-center items-center">
                <div className="w-1/3 h-1/3 flex flex-col gap-4 justify-center items-center">
                    <Image src={profilePic} className="rounded-full" alt="Profile Picture" width={150} height={150} />
                    {!notAuthUser && <button onClick={() => setOpenEditProfileDrawer(true)}>
                        <Image src="/postCard/edit.svg" alt="Edit" width={25} height={25} className="self-end" />
                    </button>}
                </div>
                <div>
                    <h3 className="text-lg font-bold">{userName}</h3>
                    <div className="flex gap-4">
                        {
                            editing ? (
                                <form onSubmit={handleEditSubmit} className="flex gap-3">
                                    <input type="text" name="bio" placeholder="bio" className="p-4 text-lg" defaultValue={bio} />
                                    <button className=" p-4 px-6 rounded-md bg-slate-800 text-white transition-all hover:bg-slate-700">Save</button>
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
        </>
    )
}