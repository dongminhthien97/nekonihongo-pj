# ===============================
# 1. Build stage
# ===============================
FROM gradle:8.5-jdk17 AS build

WORKDIR /app

# Copy toàn bộ source backend
COPY . .

# Fix quyền cho gradlew (QUAN TRỌNG)
RUN chmod +x gradlew

# Build Spring Boot jar
RUN ./gradlew clean bootJar -x test


# ===============================
# 2. Runtime stage
# ===============================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy jar từ build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Port Spring Boot (Render dùng biến PORT)
EXPOSE 8080

# Run app
ENTRYPOINT ["java", "-jar", "app.jar"]
