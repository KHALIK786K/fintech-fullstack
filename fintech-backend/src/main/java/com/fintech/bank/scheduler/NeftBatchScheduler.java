package com.fintech.bank.scheduler;

import com.fintech.bank.service.TransferService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Simulates NEFT's deferred batch settlement windows. Runs on a fixed delay
 * (configurable) and settles all queued NEFT transfers. RTGS does not use this —
 * it settles inline in real time.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NeftBatchScheduler {

    private final TransferService transferService;

    @Scheduled(fixedDelayString = "${app.neft.batch-interval-ms:30000}")
    public void runBatch() {
        int settled = transferService.processNeftBatch();
        if (settled > 0) {
            log.info("NEFT scheduler completed a batch of {} transfers", settled);
        }
    }
}
