package com.library.lms.librario.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OfflineMembershipPaymentRequest {
    private Long membershipRequestId;
    private Double amount;
    private Long librarianId;
}
