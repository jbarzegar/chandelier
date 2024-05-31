package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jbarzegar/chandelier/src/scanner"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	s := scanner.YeelightScanner{}

	devices, err := s.Discover(ctx)

	if err != nil {
		log.Fatalf("Error running discovery", err)
	}

	fmt.Println(s.Devices)

	// Run a sync against lights
	err = s.Sync(devices)

	if err != nil {
		log.Fatalf("Error running sync", err)
	}

}
