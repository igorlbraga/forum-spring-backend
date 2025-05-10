package com.example.blog.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, updatable = false)
    private LocalDateTime publicationDate;

    @ManyToOne(fetch = FetchType.EAGER) 
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "blog_post_id", nullable = false)
    private BlogPost blogPost;

    @PrePersist
    protected void onCreate() {
        publicationDate = LocalDateTime.now();
    }

    
    public Comment() {
    }

    public Comment(String content, User user, BlogPost blogPost) {
        this.content = content;
        this.user = user;
        this.blogPost = blogPost;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public BlogPost getBlogPost() {
        return blogPost;
    }

    public void setBlogPost(BlogPost blogPost) {
        this.blogPost = blogPost;
    }

    @Override
    public String toString() {
        return "Comment{" +
                "id=" + id +
                ", content='" + content + '\'' +
                ", publicationDate=" + publicationDate +
                ", user=" + (user != null ? user.getUsername() : "null") +
                ", blogPost=" + (blogPost != null ? blogPost.getId() : "null") +
                '}';
    }
}
