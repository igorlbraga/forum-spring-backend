package com.igorbraga.forum.domain.post;

import com.igorbraga.forum.domain.user.Role;
import com.igorbraga.forum.domain.user.User;
import com.igorbraga.forum.domain.user.UserResponseDTO;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Data
public class PostSummary {
    private final Long id;
    private final String title;
    private final LocalDateTime publicationDate;
    private final UserResponseDTO author;
    private final long commentCount;

    public PostSummary(Long id, String title, LocalDateTime publicationDate, User author, long commentCount) {
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
        this.publicationDate = publicationDate;
        this.author = authorDTO;
        this.commentCount = commentCount;
    }
}
