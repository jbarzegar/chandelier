package cache

import "github.com/redis/go-redis/v9"

var Redis = redis.NewClient(&redis.Options{
	Addr:     "localhost:6379",
	Password: "",
	DB:       0,
})
