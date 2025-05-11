package com.igorbraga.forum.controller;

import java.util.List;

import com.igorbraga.forum.domain.comment.UpdateCommentDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.igorbraga.forum.domain.post.Post;
import com.igorbraga.forum.domain.comment.Comment;
import com.igorbraga.forum.domain.user.User;
import com.igorbraga.forum.repository.PostRepository;
import com.igorbraga.forum.repository.CommentRepository;
import com.igorbraga.forum.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class CommentController {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public CommentController(CommentRepository commentRepository, PostRepository postRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<Comment>> getCommentsByPostId(@PathVariable Long postId) {
        if (!postRepository.existsById(postId)) {
            return ResponseEntity.notFound().build();
        }
        List<Comment> comments = commentRepository.findByPostIdOrderByPublicationDate(postId);
        return ResponseEntity.ok(comments);
    }

    
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<Comment> createComment(@PathVariable Long postId,
            @Valid @RequestBody Comment commentDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Post post = postRepository.findById(postId)
                .orElse(null);

        if (post == null) {
            return ResponseEntity.notFound().build(); 
        }

        User user = userRepository.findByUsernameOrEmail(authentication.getName(), authentication.getName())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Comment comment = new Comment();
        comment.setContent(commentDTO.getContent());
        comment.setPost(post);
        comment.setAuthor(user);

        Comment savedComment = commentRepository.save(comment);
        return new ResponseEntity<>(savedComment, HttpStatus.CREATED);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Comment comment = commentRepository.findById(commentId)
                .orElse(null);

        if (comment == null) {
            return ResponseEntity.notFound().build();
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));
        boolean isAuthor = comment.getAuthor().getUsername().equals(authentication.getName());

        if (!isAdmin && !isAuthor) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        commentRepository.delete(comment);
        return ResponseEntity.noContent().build();
    }

    
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<Comment> updateComment(@PathVariable Long commentId,
            @Valid @RequestBody UpdateCommentDTO updateBody) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Comment comment = commentRepository.findById(commentId)
                .orElse(null);

        if (comment == null) {
            return ResponseEntity.notFound().build();
        }

        boolean isAuthor = comment.getAuthor().getUsername().equals(authentication.getName());

        if (!isAuthor) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        comment.setContent(updateBody.getContent());
        Comment updatedComment = commentRepository.save(comment);

        return ResponseEntity.ok(updatedComment);
    }
}
