# ---- Build stage ----
FROM gradle:8-jdk17-alpine AS builder
WORKDIR /app

# 1. Copy only build config files first — this layer is cached until deps change
COPY build.gradle settings.gradle ./
COPY gradle ./gradle

# 2. Download dependencies (cached until build.gradle changes)
RUN gradle dependencies --no-daemon || true

# 3. Copy source code (changes frequently — only this layer + build re-runs)
COPY src ./src
RUN gradle build -x test --no-daemon

# ---- Runtime stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the built JAR
COPY --from=builder /app/build/libs/*-0.0.1-SNAPSHOT.jar app.jar
RUN rm -f /app/build/libs/*-plain.jar 2>/dev/null || true

# JVM tuning for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"

# Expose service port
EXPOSE 8083

# Switch to non-root
USER appuser

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -qO- http://localhost:8083/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
