package com.example.blog.controller;

import com.example.blog.model.BlogPost;
import com.example.blog.repository.BlogPostRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:3000") // Allow frontend requests
public class BlogPostController {

    @Autowired
    private BlogPostRepository blogPostRepository;

    // Get all blog posts
    @GetMapping
    public List<BlogPost> getAllBlogPosts() {
        return blogPostRepository.findAll();
    }

    // Create a new blog post
    @PostMapping
    public ResponseEntity<BlogPost> createBlogPost(@Valid @RequestBody BlogPost blogPost) { // Added @Valid
        blogPost.setPublicationDate(LocalDateTime.now()); // Set current time as publication date
        BlogPost savedPost = blogPostRepository.save(blogPost);
        return new ResponseEntity<>(savedPost, HttpStatus.CREATED);
    }

    // Get a single blog post by ID
    @GetMapping("/{id}")
    public ResponseEntity<BlogPost> getBlogPostById(@PathVariable Long id) {
        Optional<BlogPost> blogPost = blogPostRepository.findById(id);
        return blogPost.map(ResponseEntity::ok)
                       .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Delete a blog post by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlogPost(@PathVariable Long id) {
        if (!blogPostRepository.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        blogPostRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT); // Or HttpStatus.OK if you prefer
    }

    // Exception handler for validation errors
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
}
