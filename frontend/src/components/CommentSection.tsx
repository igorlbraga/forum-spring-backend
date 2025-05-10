'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { Comment } from '@/types';
import { getComments, createComment, deleteComment as deleteCommentApi } from '@/lib/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, CalendarDays, Trash2 } from 'lucide-react'; 

interface CommentSectionProps {
  postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user: authUser, isAuthenticated, isAdmin } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (postId) {
      const fetchComments = async () => {
        setCommentsLoading(true);
        setCommentsError(null);
        try {
          const fetchedComments = await getComments(postId);
          setComments(fetchedComments.sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime()));
        } catch (err: any) {
          console.error(`Failed to fetch comments for post ${postId}:`, err);
          setCommentsError(err.message || 'Could not fetch comments.');
        }
        setCommentsLoading(false);
      };
      fetchComments();
    }
  }, [postId]);

  const handleCommentSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newCommentContent.trim() || !isAuthenticated || !postId) return;

    setSubmittingComment(true);
    try {
      const newComment = await createComment(postId, { content: newCommentContent });
      setComments((prevComments) => [newComment, ...prevComments]);
      setNewCommentContent('');
    } catch (err: any) {
      console.error('Failed to submit comment:', err);
      alert(`Erro ao enviar comentário: ${err.message}`);
    }
    setSubmittingComment(false);
  };

  const handleCommentDelete = async (commentId: number) => {
    if (!confirm('Tem certeza que deseja deletar este comentário?')) return;

    try {
      await deleteCommentApi(commentId);
      setComments((prevComments) => prevComments.filter(comment => comment.id !== commentId));
    } catch (err: any) {
      console.error(`Failed to delete comment ${commentId}:`, err);
      alert(`Erro ao deletar comentário: ${err.message}`);
    }
  };

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold mb-6">Comentários ({comments.length})</h2>

      {isAuthenticated && (
        <form onSubmit={handleCommentSubmit} className="mb-8 p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
          <h3 className="text-lg font-medium mb-3">Deixe um comentário</h3>
          <Textarea
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            placeholder="Escreva seu comentário aqui..."
            rows={3}
            className="mb-3"
            required
          />
          <Button type="submit" disabled={submittingComment || !newCommentContent.trim()}>
            {submittingComment ? 'Enviando...' : 'Enviar Comentário'}
          </Button>
        </form>
      )}
      {!isAuthenticated && (
        <p className="mb-8 text-center text-gray-600 dark:text-gray-400">
          Você precisa estar <Link href="/login" className="text-blue-500 hover:underline">logado</Link> para comentar.
        </p>
      )}

      {commentsLoading && <p className="text-center">Carregando comentários...</p>}
      {commentsError && <p className="text-red-500 text-center mb-4">Erro ao carregar comentários: {commentsError}</p>}

      {!commentsLoading && !commentsError && comments.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
      )}

      {!commentsLoading && !commentsError && comments.length > 0 && (
        <div className="space-y-6">
          {comments.map((comment) => (
            <Card key={comment.id} className="shadow-sm bg-white dark:bg-gray-800">
              <CardHeader className="pb-3 flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-md flex items-center font-semibold">
                    <UserCircle size={20} className="mr-2 text-gray-700 dark:text-gray-300" />
                    {comment.authorUsername || 'Usuário Anônimo'}
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center mt-1 text-gray-500 dark:text-gray-400">
                    <CalendarDays size={14} className="mr-1.5" />
                    {new Date(comment.publicationDate).toLocaleString()}
                  </CardDescription>
                </div>
                {isAuthenticated && (authUser?.username === comment.authorUsername || isAdmin) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCommentDelete(comment.id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600"
                    title="Deletar comentário"
                  >
                    <Trash2 size={18} />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{comment.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
