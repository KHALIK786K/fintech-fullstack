package com.fintech.bank.config;

import com.fintech.bank.entity.AuditLog;
import com.fintech.bank.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Instant;

/**
 * Writes an audit row for every mutating API call (POST/PUT/DELETE). Read calls
 * are skipped to keep the log signal-rich. Captures user, method, path, status,
 * client IP and latency.
 */
@Component
@RequiredArgsConstructor
public class AuditInterceptor implements HandlerInterceptor {

    private final AuditLogRepository auditLogRepository;
    private static final String START_ATTR = "auditStart";

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request,
                             @NonNull HttpServletResponse response,
                             @NonNull Object handler) {
        request.setAttribute(START_ATTR, System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request,
                                @NonNull HttpServletResponse response,
                                @NonNull Object handler, Exception ex) {
        String method = request.getMethod();
        if (!(method.equals("POST") || method.equals("PUT") || method.equals("DELETE"))) {
            return;
        }
        Long start = (Long) request.getAttribute(START_ATTR);
        long duration = start == null ? 0 : System.currentTimeMillis() - start;

        var auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null) ? auth.getName() : "anonymous";

        AuditLog log = AuditLog.builder()
                .username(username)
                .httpMethod(method)
                .path(request.getRequestURI())
                .statusCode(response.getStatus())
                .clientIp(request.getRemoteAddr())
                .durationMs(duration)
                .timestamp(Instant.now())
                .build();
        auditLogRepository.save(log);
    }
}
