package com.example.blog.controller;

import com.example.blog.dto.UpdatePostDto;
import com.example.blog.dto.BlogPostSummaryDTO;
import com.example.blog.model.BlogPost;
import com.example.blog.model.User;
import com.example.blog.repository.BlogPostRepository;
import com.example.blog.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:3000") 
public class BlogPostController {

    @Autowired
    private BlogPostRepository blogPostRepository;

    @Autowired
    private UserRepository userRepository; 

    
    @GetMapping
    public List<BlogPostSummaryDTO> getAllBlogPosts() {
        return blogPostRepository.findAllPostSummaries();
    }

    
    @PostMapping
    public ResponseEntity<BlogPost> createBlogPost(@Valid @RequestBody BlogPost blogPost) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User author = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + currentUsername));

        blogPost.setAuthor(author);
        blogPost.setPublicationDate(LocalDateTime.now());
        BlogPost savedPost = blogPostRepository.save(blogPost);
        return new ResponseEntity<>(savedPost, HttpStatus.CREATED);
    }

    
    @GetMapping("/{id}")
    public ResponseEntity<BlogPost> getBlogPostById(@PathVariable Long id) {
        Optional<BlogPost> blogPost = blogPostRepository.findById(id);
        return blogPost.map(ResponseEntity::ok)
                       .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlogPost(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        Optional<BlogPost> blogPostOptional = blogPostRepository.findById(id);
        if (blogPostOptional.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        BlogPost blogPostToDelete = blogPostOptional.get();

        
        if (blogPostToDelete.getAuthor() == null) {
            
             throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Post has no author, cannot verify ownership.");
        }

        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));
        
        
        if (!isAdmin && !blogPostToDelete.getAuthor().getUsername().equals(currentUsername)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); 
        }

        blogPostRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    
    @PutMapping("/{id}")
    public ResponseEntity<BlogPost> updateBlogPost(@PathVariable Long id, @Valid @RequestBody UpdatePostDto updatePostDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User authenticatedUser = userRepository.findByUsername(currentUsername)
            .orElseThrow(() -> new UsernameNotFoundException("User not found during post update: " + currentUsername));

        BlogPost blogPostToUpdate = blogPostRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found with id: " + id));

        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));

        
        if (!isAdmin && (blogPostToUpdate.getAuthor() == null || !blogPostToUpdate.getAuthor().getId().equals(authenticatedUser.getId()))) {
            
            
            return new ResponseEntity<>(HttpStatus.FORBIDDEN); 
        }

        
        blogPostToUpdate.setTitle(updatePostDto.getTitle());
        blogPostToUpdate.setContent(updatePostDto.getContent());
        
        

        BlogPost updatedPost = blogPostRepository.save(blogPostToUpdate);
        return ResponseEntity.ok(updatedPost);
    }

    
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }
    
    
    @ResponseStatus(HttpStatus.UNAUTHORIZED) 
    @ExceptionHandler(UsernameNotFoundException.class)
    public Map<String, String> handleUsernameNotFoundException(UsernameNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return error;
    }
}
