package com.igorbraga.forum.controller;

import com.igorbraga.forum.domain.post.Post;
import com.igorbraga.forum.domain.post.PostResponseDTO;
import com.igorbraga.forum.domain.post.PostSummary;
import com.igorbraga.forum.domain.post.UpdatePostDTO;
import com.igorbraga.forum.domain.user.User;
import com.igorbraga.forum.repository.PostRepository;
import com.igorbraga.forum.repository.UserRepository;
import jakarta.validation.Valid;
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
@CrossOrigin("http://localhost:3000")
@RequestMapping("/api/posts")
public class PostController {
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostController(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<PostSummary> getAllPosts() {
        return postRepository.findAllPostSummaries();
    }


    @PostMapping
    public ResponseEntity<Post> createBlogPost(@Valid @RequestBody Post post) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String currentUsername = authentication.getName();
        User author = userRepository.findByUsernameOrEmail(currentUsername, currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + currentUsername));

        post.setAuthor(author);
        post.setPublicationDate(LocalDateTime.now());
        Post savedPost = postRepository.save(post);
        return new ResponseEntity<>(savedPost, HttpStatus.CREATED);
    }


    @GetMapping("/{id}")
    public ResponseEntity<PostResponseDTO> getPostById(@PathVariable Long id) {
        Optional<Post> postOptional = postRepository.findById(id);
        return postOptional
                .map(post -> ResponseEntity.ok(
                        new PostResponseDTO(post.getId(), post.getTitle(), post.getContent(), post.getPublicationDate(), post.getAuthor(), post.getComments()
                        )))
                .orElse(ResponseEntity.notFound().build());
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlogPost(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        Optional<Post> blogPostOptional = postRepository.findById(id);
        if (blogPostOptional.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Post postToDelete = blogPostOptional.get();

        if (postToDelete.getAuthor() == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Post has no author, cannot verify ownership.");
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !postToDelete.getAuthor().getUsername().equals(currentUsername)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        postRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }


    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @Valid @RequestBody UpdatePostDTO updatePostDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        User authenticatedUser = userRepository.findByUsernameOrEmail(currentUsername, currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found during post update: " + currentUsername));

        Post postToUpdate = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found with id: " + id));

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));


        if (!isAdmin && (postToUpdate.getAuthor() == null || !postToUpdate.getAuthor().getId().equals(authenticatedUser.getId()))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        postToUpdate.setTitle(updatePostDto.getTitle());
        postToUpdate.setContent(updatePostDto.getContent());

        Post updatedPost = postRepository.save(postToUpdate);
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
