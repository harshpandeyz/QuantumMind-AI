FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /build
RUN apk add --no-cache maven
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn clean package -DskipTests -q

FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
RUN mkdir -p /app/uploads
EXPOSE 8085
ENTRYPOINT ["java", "-Xmx512m", "-jar", "app.jar"]
