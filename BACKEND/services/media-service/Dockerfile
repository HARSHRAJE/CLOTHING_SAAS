# ---- Build stage ----
FROM gradle:8-jdk17-alpine AS builder
WORKDIR /app

# 1. Copy only build config files first (cached until deps change)
COPY build.gradle settings.gradle ./
COPY gradle ./gradle

# 2. Download dependencies (cached until build.gradle changes)
RUN gradle dependencies --no-daemon || true

# 3. Copy source code (only this re-runs on code changes)
COPY src ./src
RUN gradle build -x test --no-daemon

# ---- Runtime stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
ENV HOME=/tmp

COPY --from=builder /app/build/libs/*-0.0.1-SNAPSHOT.jar app.jar
RUN rm -f /app/build/libs/*-plain.jar 2>/dev/null || true

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -Duser.home=/tmp"

EXPOSE 8089

USER appuser

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -qO- http://localhost:8089/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
