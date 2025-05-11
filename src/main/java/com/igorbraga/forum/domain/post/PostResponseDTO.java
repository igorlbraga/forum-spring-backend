package com.igorbraga.forum.domain.post;

import com.igorbraga.forum.domain.comment.Comment;
import com.igorbraga.forum.domain.user.Role;
import com.igorbraga.forum.domain.user.User;
import com.igorbraga.forum.domain.user.UserResponseDTO;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class PostResponseDTO {
    private final Long id;
    private final String title;
    private final String content;
    private final LocalDateTime publicationDate;
    private final UserResponseDTO author;
    private final List<Comment> comments;

    public PostResponseDTO(Long id, String title, String content, LocalDateTime publicationDate, User author, List<Comment> comments) {
        final UserResponseDTO authorDTO = new UserResponseDTO(
                author.getId(),
                author.getUsername(),
                author.getEmail(),
                author.getRoles()
                        .stream()
                        .map(Role::getName)
                        .collect(Collectors.toUnmodifiableSet()));
        this.id = id;
        this.title = title;
        this.content = content;
        this.publicationDate = publicationDate;
        this.author = authorDTO;
        this.comments = comments;
    }
}
