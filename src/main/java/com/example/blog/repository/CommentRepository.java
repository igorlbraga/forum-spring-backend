package com.example.blog.repository;

import com.example.blog.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByBlogPostIdOrderByPublicationDateDesc(Long blogPostId);
    
    // Se precisarmos de mais consultas personalizadas, podemos adicioná-las aqui.
    // Por exemplo, encontrar todos os comentários de um usuário específico:
    // List<Comment> findByUserId(Long userId);
}
