package com.igorbraga.forum.domain.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateCommentDTO {
    @NotBlank(message = "Comment cannot be blank")
    @Size(min = 3, message = "Comment content must be more than 3 characters")
    private String content;
}
