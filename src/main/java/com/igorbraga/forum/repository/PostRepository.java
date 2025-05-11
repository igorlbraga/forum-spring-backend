package com.igorbraga.forum.repository;

import com.igorbraga.forum.domain.post.PostSummary;
import com.igorbraga.forum.domain.post.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("SELECT new com.igorbraga.forum.domain.post.PostSummary(p.id, p.title, p.publicationDate, p.author, COUNT(c.id)) FROM Post p INNER JOIN p.author LEFT JOIN p.comments c GROUP BY p.id, p.title, p.publicationDate, p.author ORDER BY p.publicationDate DESC")
    List<PostSummary> findAllPostSummaries();

    
    
}
