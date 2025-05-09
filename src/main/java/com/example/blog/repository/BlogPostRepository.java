package com.example.blog.repository;

import com.example.blog.dto.BlogPostSummaryDTO;
import com.example.blog.model.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {

    @Query("SELECT new com.example.blog.dto.BlogPostSummaryDTO(p.id, p.title, p.publicationDate, p.author, COUNT(c.id)) FROM BlogPost p LEFT JOIN p.comments c GROUP BY p.id, p.title, p.publicationDate, p.author.username ORDER BY p.publicationDate DESC")
    List<BlogPostSummaryDTO> findAllPostSummaries();

    // You can add custom query methods here if needed later
    // For example: List<BlogPost> findByAuthor(String author);
}
