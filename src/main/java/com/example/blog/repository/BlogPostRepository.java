package com.example.blog.repository;

import com.example.blog.model.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    // You can add custom query methods here if needed later
    // For example: List<BlogPost> findByAuthor(String author);
}
