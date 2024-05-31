FROM golang:1.22.3

WORKDIR /dist

COPY go.mod go.sum ./
RUN go mod download

COPY ./src ./src

RUN go build -o ./chandelier-sync ./src/main.go

RUN chmod +x ./chandelier-sync

CMD ./chandelier-sync

# FROM golang:1.22.3 as app

# WORKDIR /app

# COPY --from=build /dist/chandelier-sync ./bin

# RUN ls /app/bin

# EXPOSE 8080

# CMD ['/app/bin']