package com.example.blog.dto;

import java.time.LocalDateTime;

public class CommentDTO {
    private Long id;
    private String content;
    private LocalDateTime publicationDate;
    private String authorUsername;
    private Long authorId;
    private Long postId;

    
    public CommentDTO() {
    }

    public CommentDTO(Long id, String content, LocalDateTime publicationDate, String authorUsername, Long authorId, Long postId) {
        this.id = id;
        this.content = content;
        this.publicationDate = publicationDate;
        this.authorUsername = authorUsername;
        this.authorId = authorId;
        this.postId = postId;
    }

    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getPublicationDate() {
        return publicationDate;
    }

    public void setPublicationDate(LocalDateTime publicationDate) {
        this.publicationDate = publicationDate;
    }

    public String getAuthorUsername() {
        return authorUsername;
    }

    public void setAuthorUsername(String authorUsername) {
        this.authorUsername = authorUsername;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }
}
