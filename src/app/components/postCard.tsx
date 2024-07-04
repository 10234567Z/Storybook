'use client'
import { createClient } from "@/utils/supabase/client";
import { Drawer, useMediaQuery } from "@mui/material";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type CommentLiked = {
  comment_id: string,
  user_id: string
}

export default function PostCard({ post, updating }: { post: any, updating: boolean }) {
  const [loading, setLoading] = useState<boolean>(true)
  const [user, setUser] = useState<any>();
  const [currentUser, setCurrentUser] = useState<any>(undefined);
  const [liked, setLiked] = useState<boolean>(false);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentLiked, setCommentLiked] = useState<CommentLiked[]>([]);
  const [replyingTo, setReplyingTo] = useState<string>("")
  const [replies, setReplies] = useState<any[]>([])
  const [editing, setEditing] = useState<string>("")
  const [openEditDrawer, setOpenEditDrawer] = useState<boolean>(false);
  const supabase = createClient();
  async function getLikedStatus() {
    const { data, error } = await supabase.from('postlikes').select('post_id').eq('user_id', currentUser.id).eq('post_id', post.post_id)
    if (error) {
      console.error(error);
      return
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

  async function getLikedComments() {
    const { data, error } = await supabase.from('commentlikes').select('*').eq('user_id', currentUser.id)
    if (error) {
      console.error(error);
      return
    }
    setCommentLiked(data!);
  }

  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    async function GetUser() {
      const { data, error } = await supabase.from('users').select('raw_user_meta_data').eq('id', post.user_id)
      if (error) {
        console.error(error);
        return
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
        return
      }
      const { error: postE } = await supabase.from('posts').update({ likes: post.likes + 1 }).eq('post_id', post.post_id).select()
      if (postE) {
        console.error(postE);
        return
      }
      setLiked(true)
    }
    else {
      const { error: postLikeE } = await supabase.from('postlikes').delete().eq('post_id', post.post_id).eq('user_id', currentUser.id)
      if (postLikeE) {
        console.error(postLikeE);
        return
      }
      const { error: postE } = await supabase.from('posts').update({ likes: post.likes - 1 }).eq('post_id', post.post_id)
      if (postE) {
        console.error(postE);
        return
      }
      setLiked(false)
    }
  }

  async function deletePost() {
    const { error: postE } = await supabase.from('posts').delete().eq('post_id', post.post_id)
    if (postE) {
      console.error(postE);
      return
    }
    location.reload()
  }

  async function getComments() {
    const { data, error } = await supabase.from('comments').select(`comment_id, post_id , content , users(raw_user_meta_data), replied_to , i_at, user_id`).eq('post_id', post.post_id)
    if (error) {
      console.error(error);
      return
    }
    setComments(data!);
  }

  async function handleCommentOpen() {
    setShowDrawer(true)
    if (post.comments === 0) return;
    getComments()
    getLikedComments()
  }

  async function handleCommentsPost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const comment = formData.get('comment');
    const { data, error } = await supabase.from('comments').insert({ post_id: post.post_id, user_id: currentUser.id, content: comment, replied_to: null, i_at: new Date() }).select(`comment_id, post_id , content , users(raw_user_meta_data), replied_to , i_at, user_id`)
    if (error) {
      console.error(error);
      return
    }

    const { error: updateE } = await supabase.from('posts').update({ comments: post.comments + 1 }).eq('post_id', post.post_id)
    if (updateE) {
      console.error(updateE);
      return
    }
    setComments([...comments, data![0]]);
  }

  async function handleReplyPost(e: FormEvent<HTMLFormElement>, comment_id: string) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const comment = formData.get('comment');
    const { data, error } = await supabase.from('comments').insert({ post_id: post.post_id, user_id: currentUser.id, content: comment, replied_to: comment_id, i_at: new Date() }).select(`comment_id, post_id , content , users(raw_user_meta_data), replied_to , i_at, user_id`)
    if (error) {
      console.error(error);
      return
    }
    const { error: updateE } = await supabase.from('posts').update({ comments: post.comments + 1 }).eq('post_id', post.post_id)
    if (updateE) {
      console.error(updateE);
      return
    }
    setComments([...comments, data![0]]);
    setReplyingTo("")
    showReplies(comment_id)
  }

  async function handleDeleteComment(comment_id: string) {
    const { error: deleteE } = await supabase.from('comments').delete().eq('comment_id', comment_id)
    if (deleteE) {
      console.error(deleteE);
      return
    }
    const { error: updateE } = await supabase.from('posts').update({ comments: post.comments - 1 }).eq('post_id', post.post_id)
    if (updateE) {
      console.error(updateE);
      return
    }
    const newComments = comments.filter(comment => comment.comment_id !== comment_id)
    setComments(newComments);
    setReplies([])
  }

  async function handleLikeComment(comment_id: string) {
    if (commentLiked.find(like => like.comment_id === comment_id && like.user_id === currentUser.id)) {
      const { error: likeE } = await supabase.from('commentlikes').delete().eq('comment_id', comment_id).eq('user_id', currentUser.id)
      if (likeE) {
        console.error(likeE);
        return
      }
      const newCommentLiked = commentLiked.filter(like => like.comment_id !== comment_id)
      setCommentLiked(newCommentLiked)
      getComments()
      return
    }
    const { error: likeE } = await supabase.from('commentlikes').insert({ comment_id: comment_id, user_id: currentUser.id, i_at: new Date })
    if (likeE) {
      console.error(likeE);
      return
    }
    setCommentLiked([...commentLiked, { comment_id, user_id: currentUser.id }])
    getComments()
  }

  async function handleReplyTo(comment_id: string) {
    if (replyingTo === comment_id) {
      setReplyingTo("")
      return
    }
    setReplyingTo(comment_id)
  }
  async function showReplies(comment_id: string) {
    if (replies.length !== 0 && replies[0].replied_to === comment_id) {
      setReplies([])
      return;
    }
    const { data: commentsData, error: fetchError } = await supabase.from('comments').select(`comment_id, post_id , content , users(raw_user_meta_data), replied_to , i_at, user_id`).eq('post_id', post.post_id).eq('replied_to', comment_id)
    if (fetchError) {
      console.error(fetchError);
      return
    }
    setReplies(commentsData!)
  }

  async function editComment(comment_id: string, comment: string) {
    const { error } = await supabase.from('comments').update({ content: comment }).eq('comment_id', comment_id)
    if (error) {
      console.error(error);
      return
    }
    setEditing("")
    setReplies([])
    getComments()
  }


  async function editPost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const caption = formData.get('caption');
    const content = formData.get('content');
    const { error } = await supabase.from('posts').update({ caption, content }).eq('post_id', post.post_id)
    if (error) {
      console.error(error);
      return
    }
    handleOpenEditDrawer()
  }

  async function handleOpenEditDrawer() {
    setOpenEditDrawer(!openEditDrawer)
  }


  return (
    <>
      <Drawer anchor="right" open={openEditDrawer} onClose={() => setOpenEditDrawer(false)} PaperProps={{
        sx: {
          width: isMobile ? '100%' : '50%',
        }
      }}>
        <form className="flex flex-col gap-4 p-4" onSubmit={editPost}>
          <input type="text" defaultValue={post.caption} className="w-full p-4 border-b-2 border-slate-200 outline-none" name="caption" />
          <textarea defaultValue={post.content} className="w-full p-4 border-b-2 border-slate-200 outline-none h-[500px] resize-none" name="content" />
          <button type="submit" className="bg-slate-800 hover:bg-slate-700 transition-all text-white p-4 rounded-lg">Edit</button>
        </form>
      </Drawer>
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
                comment.replied_to === null &&
                <div key={comment.comment_id} className="flex flex-col gap-4 p-4 bg-slate-200 rounded-lg">
                  {
                    editing === comment.comment_id
                      ?
                      <form onSubmit={(e) => { e.preventDefault(), editComment(comment.comment_id, e.currentTarget.comment.value) }} className="flex flex-row gap-4 p-4">
                        <input type="text" defaultValue={comment.content} className="w-full p-4 border-b-2 border-slate-200 outline-none rounded-lg" name="comment" />
                        <button type="submit" className="bg-slate-800 hover:bg-slate-700 transition-all text-white p-4 rounded-lg">Edit</button>
                        <button onClick={() => setEditing("")} className="bg-slate-800 hover:bg-slate-700 transition-all text-white p-4 rounded-lg">Cancel</button>
                      </form>
                      :
                      <p className="text-slate-800 text-lg">{comment.content}</p>
                  }
                  <Link href={`/search?q=${comment.users.raw_user_meta_data.name}`}>
                    <p className="text-slate-600 text-sm font-bold">{comment.users.raw_user_meta_data.name}</p>
                  </Link>
                  <div className="flex flex-row gap-4 justify-end items-center">
                    <p className="text-slate-600 text-sm">{moment(comment.i_at).startOf('hour').fromNow()}</p>
                    <button className="flex flex-row gap-1" onClick={() => { handleReplyTo(comment.comment_id) }}>
                      <p>{comment.replied_to}</p>
                      <Image src="/comments/reply.svg" width={35} height={35} alt="ReplyLogo" className="hover:bg-slate-400 focus:bg-slate-700 rounded-full transition-all" />
                    </button>
                    <button onClick={() => { handleLikeComment(comment.comment_id) }} >
                      {
                        commentLiked.find(like => like.comment_id === comment.comment_id && like.user_id === currentUser.id) ? <Image src="/postCard/liked.svg" width={35} height={35} alt="LikeLogo" className="hover:bg-slate-400 focus:bg-slate-700 rounded-full transition-all" /> : <Image src="/postCard/likes.svg" width={35} height={35} alt="LikeLogo" className="hover:bg-slate-400 focus:bg-slate-700 rounded-full transition-all" />
                      }
                    </button>
                    {comment.user_id === currentUser.id
                      ?
                      <>
                        <button onClick={() => { handleDeleteComment(comment.comment_id) }}>
                          <Image src="/comments/delete.svg" width={35} height={35} alt="DeleteLogo" className="hover:bg-slate-400 focus:bg-slate-700 rounded-full transition-all" />
                        </button>
                        <button onClick={() => { setEditing(comment.comment_id) }}>
                          <Image src="/comments/edit.svg" width={35} height={35} alt="EditLogo" className="hover:bg-slate-400 focus:bg-slate-700 rounded-lg transition-all" />
                        </button>
                      </>
                      : null}
                  </div>
                  {
                    replyingTo === comment.comment_id
                      ?
                      <form className="flex flex-row gap-4 p-4" onSubmit={(e) => { handleReplyPost(e, comment.comment_id) }}>
                        <input type="text" placeholder="Add a reply..." className="w-full p-4 border-b-2 border-slate-200 outline-none rounded-lg" name="comment" />
                        <button type="submit" className="bg-slate-800 hover:bg-slate-700 transition-all text-white p-4 rounded-lg">Comment</button>
                        <button onClick={() => setReplyingTo("")} className="bg-slate-800 hover:bg-slate-700 transition-all text-white p-4 rounded-lg">Cancel</button>
                      </form>
                      :
                      null
                  }
                  {
                    comments.find(reply => reply.replied_to === comment.comment_id) !== undefined &&
                    <button onClick={() => { showReplies(comment.comment_id) }}>
                      <p className="text-blue-600 font-semibold" >View Replies</p>
                    </button>
                  }
                  {
                    replies.length !== 0 && replies.map(reply => (
                      reply.replied_to === comment.comment_id &&
                      <div key={reply.comment_id} className="flex flex-col gap-4 p-4 bg-slate-100 rounded-lg">
                        {
                          editing === reply.comment_id
                            ?
                            <form onSubmit={(e) => { e.preventDefault(), editComment(reply.comment_id, e.currentTarget.comment.value) }} className="flex flex-row gap-4 p-4">
                              <input type="text" defaultValue={reply.content} className="w-full p-4 border-b-2 border-slate-200 outline-none rounded-lg" name="comment" />
                              <button type="submit" className="bg-slate-800 hover:bg-slate-700 transition-all text-white p-4 rounded-lg">Edit</button>
                              <button onClick={() => setEditing("")} className="bg-slate-800 hover:bg-slate-700 transition-all text-white p-4 rounded-lg">Cancel</button>
                            </form>
                            :
                            <p className="text-slate-800 text-lg">{reply.content}</p>
                        }
                        <p className="text-slate-600 text-sm font-bold">{reply.users.raw_user_meta_data.name}</p>
                        <div className="flex flex-row gap-4 justify-end items-center">
                          <p className="text-slate-600 text-sm">{moment(reply.i_at).startOf('minutes').fromNow()}</p>
                          <button onClick={() => { handleLikeComment(reply.comment_id) }} >
                            {
                              commentLiked.find(like => like.comment_id === reply.comment_id && like.user_id === currentUser.id) ? <Image src="/postCard/liked.svg" width={35} height={35} alt="LikeLogo" className="hover:bg-slate-400 focus:bg-slate-700 rounded-full transition-all" /> : <Image src="/postCard/likes.svg" width={35} height={35} alt="LikeLogo" className="hover:bg-slate-400 focus:bg-slate-700 rounded-full transition-all" />
                            }
                          </button>
                          {
                            reply.user_id === currentUser.id
                              ?
                              <>
                                <button onClick={() => { handleDeleteComment(reply.comment_id) }}>
                                  <Image src="/comments/delete.svg" width={35} height={35} alt="DeleteLogo" className="hover:bg-slate-400 focus:bg-slate-700 rounded-full transition-all" />
                                </button>
                                <button onClick={() => { setEditing(reply.comment_id) }}>
                                  <Image src="/comments/edit.svg" width={35} height={35} alt="EditLogo" className="hover:bg-slate-400 focus:bg-slate-700 rounded-lg transition-all" />
                                </button>
                              </>
                              : null
                          }
                        </div>
                      </div>
                    ))
                  }
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
            <Link href={`/search?q=${user}`}>
              <p className="text-gray-500 text-sm self-start"><strong>{user}</strong> at {post.date}</p>
            </Link>
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
              <button onClick={handleOpenEditDrawer}>
                {
                  currentUser !== undefined && post.user_id === currentUser.id ? <Image src="/postCard/edit.svg" width={35} height={35} alt="EditLogo" /> : null
                }
              </button>
              <button onClick={deletePost}>
                {
                  currentUser !== undefined && post.user_id === currentUser.id ? <Image src="/postCard/delete.svg" width={35} height={35} alt="DeleteLogo" /> : null
                }
              </button>
            </div>
          </div>
      }
    </>
  );
}