FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml mvnw mvnw.cmd ./
COPY .mvn .mvn
RUN mvn -B -DskipTests dependency:go-offline
COPY src src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 10001 newsai
RUN mkdir -p /app/uploads && chown -R newsai /app/uploads
COPY --from=build /workspace/target/*.jar app.jar
USER newsai
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
