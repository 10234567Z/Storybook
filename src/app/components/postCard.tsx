'use client'
import { createClient } from "@/utils/supabase/client";
import { Drawer, useMediaQuery } from "@mui/material";
import moment from "moment";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";

export default function PostCard({ post, updating }: { post: any, updating: boolean }) {
  const [loading, setLoading] = useState<boolean>(true)
  const [user, setUser] = useState<any>();
  const [currentUser, setCurrentUser] = useState<any>(undefined);
  const [liked, setLiked] = useState<boolean>(false);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentUser, setCommentUser] = useState<string[]>([]);
  const supabase = createClient();
  async function getLikedStatus() {
    const { data, error } = await supabase.from('postlikes').select('post_id').eq('user_id', currentUser.id).eq('post_id', post.post_id)
    if (error) {
      console.error(error);
    }
    if (data!.length > 0) {
      setLiked(true);
    }
    else {
      setLiked(false);
    }
  }
  async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  }

  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    async function GetUser() {
      const { data, error } = await supabase.from('users').select('raw_user_meta_data').eq('id', post.user_id)
      if (error) {
        console.error(error);
      } else {
        setUser(data![0].raw_user_meta_data.name);
      }
    }
    getCurrentUser()
    GetUser()
    setLoading(false)
  }, [])

  useEffect(() => {
    if (currentUser === undefined) return;
    getLikedStatus()
  }, [currentUser])

  useEffect(() => {
    if (currentUser === undefined) return;
    getLikedStatus()
  }, [post])


  async function handleLikePost() {
    if (!liked) {
      const { error: postLikeE } = await supabase.from('postlikes').insert([{ post_id: post.post_id, user_id: currentUser.id }])
      if (postLikeE) {
        console.error(postLikeE);
      }
      const { error: postE } = await supabase.from('posts').update({ likes: post.likes + 1 }).eq('post_id', post.post_id).select()
      if (postE) {
        console.error(postE);
      }
      setLiked(true)
    }
    else {
      const { error: postLikeE } = await supabase.from('postlikes').delete().eq('post_id', post.post_id).eq('user_id', currentUser.id)
      if (postLikeE) {
        console.error(postLikeE);
      }
      const { error: postE } = await supabase.from('posts').update({ likes: post.likes - 1 }).eq('post_id', post.post_id)
      if (postE) {
        console.error(postE);
      }
      setLiked(false)
    }
  }

  async function getComments() {
    const { data, error } = await supabase.from('comments').select(`comment_id, post_id , content , users(raw_user_meta_data), replied_to , i_at, user_id`).eq('post_id', post.post_id)
    if (error) {
      console.error(error);
    }
    setComments(data!);
  }

  async function handleCommentOpen() {
    setShowDrawer(true)
    if (post.comments === 0) return;
    getComments()
  }

  async function handleCommentsPost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const comment = formData.get('comment');
    const { data, error } = await supabase.from('comments').insert({ post_id: post.post_id, user_id: currentUser.id, content: comment, replied_to: null, i_at: new Date() }).select(`comment_id, post_id , content , users(raw_user_meta_data), replied_to , i_at, user_id`)
    if (error) {
      console.error(error);
    }

    const { error: updateE } = await supabase.from('posts').update({ comments: post.comments + 1 }).eq('post_id', post.post_id)
    if (updateE) {
      console.error(updateE);
    }
    setComments([...comments, data![0]]);
  }

  async function handleDeleteComment(comment_id: string){
    const { error: deleteE } = await supabase.from('comments').delete().eq('comment_id', comment_id)
    if (deleteE) {
      console.error(deleteE);
    }
    const { error: updateE } = await supabase.from('posts').update({ comments: post.comments - 1 }).eq('post_id', post.post_id)
    if (updateE) {
      console.error(updateE);
    }
    const newComments = comments.filter(comment => comment.comment_id !== comment_id)
    setComments(newComments);
  }

  return (
    <>
      <Drawer anchor="right" open={showDrawer} onClose={() => setShowDrawer(false)} PaperProps={{
        sx: {
          width: isMobile ? '100%' : '50%',
        }
      }}>
        <button onClick={() => setShowDrawer(false)} className="flex flex-row justify-start">
          <Image src="/comments/close.svg" width={35} height={35} alt="CloseLogo" className=" m-4 hover:bg-slate-200 focus:bg-slate-400 rounded-full transition-all" />
        </button>
        <form className="flex flex-col gap-4 p-4" onSubmit={handleCommentsPost}>
          <input type="text" placeholder="Add a comment..." className="w-full p-4 border-b-2 border-slate-200 outline-none" name="comment" />
          <button type="submit" className="bg-slate-800 hover:bg-slate-700 transition-all text-white p-4 rounded-lg">Comment</button>
        </form>
        {
          comments.length === 0 ? <div className="text-center flex justify-center items-center h-screen font-extrabold text-slate-600 text-xl">Nothing here yet...</div>
            :
            <div className="flex flex-col gap-4 p-4">
              {comments.map((comment) => (
                <div key={comment.comment_id} className="flex flex-col gap-4 p-4 bg-slate-200 rounded-lg">
                  <p className="text-slate-800 text-lg">{comment.content}</p>
                  <p className="text-slate-600 text-sm font-bold">{comment.users.raw_user_meta_data.name}</p>
                  <div className="flex flex-row gap-4 justify-end items-center">
                    <p className="text-slate-600 text-sm">{moment(comment.i_at).startOf('hour').fromNow()}</p>
                    <button className="flex flex-row gap-1">
                      <p>{comment.replied_to}</p>
                      <Image src="/comments/reply.svg" width={35} height={35} alt="ReplyLogo" className="hover:bg-slate-400 focus:bg-slate-700 rounded-full transition-all" />
                    </button>
                    <button >
                      <Image src="/postCard/likes.svg" width={35} height={35} alt="LikeLogo" className="hover:bg-slate-400 focus:bg-slate-700 rounded-full transition-all" />
                    </button>
                    {comment.user_id === currentUser.id
                      ?
                      <button onClick={() => {handleDeleteComment(comment.comment_id)}}>
                        <Image src="/comments/delete.svg" width={35} height={35} alt="DeleteLogo" className="hover:bg-slate-400 focus:bg-slate-700 rounded-full transition-all" />
                      </button> : null}
                  </div>
                </div>
              ))
              }
            </div>
        }
      </Drawer>
      {
        loading ? <h1>Loading...</h1>
          :
          <div className="flex flex-col justify-center items-center p-4 bg-white rounded-lg shadow-lg w-[320px] md:w-[680px] gap-4">
            <p className="text-gray-500 text-sm self-start"><strong>{user}</strong> at {post.date}</p>
            <h1 className="text-2xl font-bold">{post.caption}</h1>
            <p className="text-gray-500 text-center w-[300px] md:w-[500px]">{post.content}</p>
            <div className="flex flex-row align-center justify-end gap-4 w-[300px] md:w-[660px] text-lg">
              <button className="flex flex-row gap-1" onClick={handleCommentOpen}>
                <p>{post.comments}</p>
                <Image src="/postCard/comment.svg" width={35} height={35} alt="CommentLogo" />
              </button>
              <button className="flex flex-row gap-1" onClick={handleLikePost} disabled={updating}>
                <p>{post.likes}</p>
                {
                  liked ? <Image src="/postCard/liked.svg" width={35} height={35} alt="LikeLogo" /> : <Image src="/postCard/likes.svg" width={35} height={35} alt="LikeLogo" />
                }
              </button>
            </div>
          </div>
      }
    </>
  );
}