package com.library.lms.librario.dto;

import lombok.Data;

@Data
public class MemberUpdateRequest {
    private String name;
    private String email;
    private Long planId; // allow updating plan as well
}