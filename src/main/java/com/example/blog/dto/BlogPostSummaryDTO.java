package com.example.blog.dto;

import com.example.blog.model.User;

import java.time.LocalDateTime;

public class BlogPostSummaryDTO {
    private Long id;
    private String title;
    private LocalDateTime publicationDate;
    private User author;
    private long commentCount;

    
    public BlogPostSummaryDTO(Long id, String title, LocalDateTime publicationDate, User author, long commentCount) {
        this.id = id;
        this.title = title;
        this.publicationDate = publicationDate;
        this.author = author;
        this.commentCount = commentCount;
    }

    
    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public LocalDateTime getPublicationDate() {
        return publicationDate;
    }

    public User getAuthor() {
        return author;
    }

    public long getCommentCount() {
        return commentCount;
    }

    
    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setPublicationDate(LocalDateTime publicationDate) {
        this.publicationDate = publicationDate;
    }

    public void setAuthorUsername(User author) {
        this.author = author;
    }

    public void setCommentCount(long commentCount) {
        this.commentCount = commentCount;
    }
}
