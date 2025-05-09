package com.example.blog.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.blog.dto.CommentDTO;
import com.example.blog.model.BlogPost;
import com.example.blog.model.Comment;
import com.example.blog.model.User;
import com.example.blog.repository.BlogPostRepository;
import com.example.blog.repository.CommentRepository;
import com.example.blog.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Autowired
    private UserRepository userRepository;

    // Endpoint para buscar todos os comentários de um post específico
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommentDTO>> getCommentsByPostId(@PathVariable Long postId) {
        if (!blogPostRepository.existsById(postId)) {
            return ResponseEntity.notFound().build();
        }
        List<Comment> comments = commentRepository.findByBlogPostIdOrderByPublicationDateDesc(postId);
        List<CommentDTO> commentDTOs = comments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(commentDTOs);
    }

    // Endpoint para criar um novo comentário em um post
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentDTO> createComment(@PathVariable Long postId,
            @Valid @RequestBody CommentDTO commentDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        BlogPost blogPost = blogPostRepository.findById(postId)
                .orElse(null);

        if (blogPost == null) {
            return ResponseEntity.notFound().build(); // Ou ResponseEntity.badRequest().body("Post não encontrado");
        }

        User user = userRepository.findByUsername(authentication.getName())
                .orElse(null);

        if (user == null) {
            // Isso não deve acontecer se o usuário estiver autenticado, mas é uma boa
            // verificação
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Comment comment = new Comment();
        comment.setContent(commentDTO.getContent());
        comment.setBlogPost(blogPost);
        comment.setUser(user);
        // A data de publicação é definida automaticamente pelo @PrePersist na entidade
        // Comment

        Comment savedComment = commentRepository.save(comment);
        return new ResponseEntity<>(convertToDto(savedComment), HttpStatus.CREATED);
    }

    // Método utilitário para converter Entidade Comment para CommentDTO
    private CommentDTO convertToDto(Comment comment) {
        return new CommentDTO(
                comment.getId(),
                comment.getContent(),
                comment.getPublicationDate(),
                comment.getUser().getUsername(),
                comment.getUser().getId(),
                comment.getBlogPost().getId());
    }

    // Endpoint para deletar um comentário
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Comment comment = commentRepository.findById(commentId)
                .orElse(null);

        if (comment == null) {
            return ResponseEntity.notFound().build();
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));
        boolean isAuthor = comment.getUser().getUsername().equals(authentication.getName());

        if (!isAdmin && !isAuthor) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        commentRepository.delete(comment);
        return ResponseEntity.noContent().build();
    }

    // Endpoint para atualizar um comentário
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentDTO> updateComment(@PathVariable Long commentId,
            @Valid @RequestBody CommentDTO commentDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Comment comment = commentRepository.findById(commentId)
                .orElse(null);

        if (comment == null) {
            return ResponseEntity.notFound().build();
        }

        boolean isAuthor = comment.getUser().getUsername().equals(authentication.getName());

        if (!isAuthor) {
            // Apenas o autor pode editar seu próprio comentário
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Atualiza apenas o conteúdo do comentário
        comment.setContent(commentDTO.getContent());
        Comment updatedComment = commentRepository.save(comment);

        return ResponseEntity.ok(convertToDto(updatedComment));
    }
}
