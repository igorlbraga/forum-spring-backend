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

    
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommentDTO>> getCommentsByPostId(@PathVariable Long postId) {
        if (!blogPostRepository.existsById(postId)) {
            return ResponseEntity.notFound().build();
        }
        List<Comment> comments = commentRepository.findByBlogPost_IdOrderByPublicationDate(postId);
        List<CommentDTO> commentDTOs = comments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(commentDTOs);
    }

    
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
            return ResponseEntity.notFound().build(); 
        }

        User user = userRepository.findByUsername(authentication.getName())
                .orElse(null);

        if (user == null) {
            
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Comment comment = new Comment();
        comment.setContent(commentDTO.getContent());
        comment.setBlogPost(blogPost);
        comment.setUser(user);
        
        

        Comment savedComment = commentRepository.save(comment);
        return new ResponseEntity<>(convertToDto(savedComment), HttpStatus.CREATED);
    }

    
    private CommentDTO convertToDto(Comment comment) {
        return new CommentDTO(
                comment.getId(),
                comment.getContent(),
                comment.getPublicationDate(),
                comment.getUser().getUsername(),
                comment.getUser().getId(),
                comment.getBlogPost().getId());
    }

    
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
            
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        
        comment.setContent(commentDTO.getContent());
        Comment updatedComment = commentRepository.save(comment);

        return ResponseEntity.ok(convertToDto(updatedComment));
    }
}
