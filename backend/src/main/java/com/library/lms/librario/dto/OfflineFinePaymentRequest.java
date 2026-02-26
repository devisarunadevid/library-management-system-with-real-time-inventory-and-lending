package com.library.lms.librario.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfflineFinePaymentRequest {
    private Long librarianId;
    private Long borrowId;
    private Double amount;
}
