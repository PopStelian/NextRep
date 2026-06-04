# Pasul 1: Compilarea
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Pasul 2: Rularea
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/demo-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080

# Sintaxă tip Shell - îi forțează interpretarea corectă a parametrilor de Spring Boot
ENTRYPOINT java -jar app.jar --spring.datasource.url=jdbc:postgresql://stelian:CZYqy2EpWVz6Rmr1LS42sN7FQZFAbfsv@dpg-d8ggqartqb8s73bj7kag-a/nextrep --spring.datasource.username=stelian --spring.datasource.password=CZYqy2EpWVz6Rmr1LS42sN7FQZFAbfsv --spring.datasource.driverClassName=org.postgresql.Driver
