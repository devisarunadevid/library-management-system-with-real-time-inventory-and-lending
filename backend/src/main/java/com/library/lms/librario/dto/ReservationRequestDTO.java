package com.library.lms.librario.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRequestDTO {
    private Long bookId;
    private String userEmail;
}
