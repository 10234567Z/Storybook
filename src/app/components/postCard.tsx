'use client'
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function PostCard({ post }: { post: any }) {
  const [user, setUser] = useState<any>();
  const [currentUser, setCurrentUser] = useState<any>();
  const [likes , setLikes] = useState<number>(0);
  const [comments, setComments] = useState<number>(0);
  const supabase = createClient();
  useEffect(() => {
    async function GetUser() {
      const { data, error } = await supabase.from('users').select('raw_user_meta_data').eq('id', post.user_id)
      if (error) {
        console.error(error);
      } else {
        setUser(data![0].raw_user_meta_data.name);
      }
    }
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    }
    getCurrentUser()
    GetUser()
    setLikes(post.likes)
    setComments(post.comments)
  }, [])

  async function handleLikePost() {
    const { data, error } = await supabase.from('postlikes').select('user_id').eq('post_id', post.post_id)
    if (error) {
      console.error(error);
    }
    if (data!.length === 0) {
      const { error: postLikeE } = await supabase.from('postlikes').insert([{ post_id: post.post_id, user_id: currentUser.id }])
      if (postLikeE) {
        console.error(postLikeE);
      }
      const { error: postE } = await supabase.from('posts').update({ likes: likes + 1 }).eq('post_id', post.post_id).select()
      if (postE) {
        console.error(postE);
      }
    }
    else{
      const { error: postLikeE } = await supabase.from('postlikes').delete().eq('post_id', post.post_id).eq('user_id', currentUser.id)
      if (postLikeE) {
        console.error(postLikeE);
      }
      const { error: postE } = await supabase.from('posts').update({ likes: likes - 1 }).eq('post_id', post.post_id)
      if (postE) {
        console.error(postE);
      }
    }
  }
  return (
    <div className="flex flex-col justify-center items-center p-4 bg-white rounded-lg shadow-lg w-[320px] md:w-[680px] gap-4">
      <p className="text-gray-500 text-sm self-start"><strong>{user}</strong> at {post.date}</p>
      <h1 className="text-2xl font-bold">{post.caption}</h1>
      <p className="text-gray-500 text-center w-[300px] md:w-[500px]">{post.content}</p>
      <div className="flex flex-row align-center justify-end gap-4 w-[300px] md:w-[660px]">
        <button className="flex flex-row gap-1">
          <p>{comments}</p>
          <Image src="/postCard/comment.svg" width={25} height={25} alt="CommentLogo" />
        </button>
        <button className="flex flex-row gap-1" onClick={handleLikePost}>
          <p>{likes}</p>
          <Image src="/postCard/likes.svg" width={25} height={25} alt="LikeLogo" />
        </button>
      </div>
    </div>
  );
}