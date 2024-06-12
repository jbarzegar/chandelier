package main

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jbarzegar/chandelier/src/scanner"
	"github.com/oherych/yeelight"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	s := scanner.YeelightScanner{}

	devices, err := s.Discover(ctx)
	if err != nil {
		log.Fatalf("Error running discovery", err)
	}

	// Run a sync against lights
	err = s.Sync(devices)
	if err != nil {
		log.Fatalf("Error running sync", err)
	}

	app := fiber.New()

	// app.Get("/:mapId", func(c *fiber.Ctx) error {
	// 	var light *scanner.Light
	// 	for _, d := range devices {
	// 		if d.HwID == c.Params("mapId") {
	// 			light = &d
	// 			break
	// 		}
	// 	}

	// 	if light == nil {
	// 		return c.SendStatus(404)
	// 	}

	// 	return c.SendString("Lol has the light")
	// })

	// [{ name: "<server-url>/:mapId?action=<action>" }]
	app.Get("/:mapId", func(c *fiber.Ctx) error {
		fmt.Println("Map id", c.Params("mapId"))
		if err != nil {
			log.Fatalln(err)
		}

		var light *scanner.Light
		for _, d := range devices {
			if d.HwID == c.Params("mapId") {
				light = &d
				break
			}
		}

		if light == nil {
			return c.SendStatus(404)
		}

		y := yeelight.New(light.Location)

		var power bool

		q := strings.ToUpper(c.Query("action", "OFF"))
		fmt.Println(q)
		switch q {
		case "OFF":
			power = false
		case "ON":
			power = true
		}

		fmt.Println("power", power)

		// body.Action
		y.Power(context.TODO(), power, yeelight.PowerModeDefault, yeelight.EffectSmooth, 500*time.Millisecond)

		return c.SendString("lol")
	})

	app.Listen(":5000")
}
