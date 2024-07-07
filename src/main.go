package main

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jbarzegar/chandelier/src/actions"
	"github.com/jbarzegar/chandelier/src/scanner"
	"github.com/oherych/yeelight"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	s := scanner.YeelightScanner{}

	devices, err := s.Discover(ctx)
	if err != nil {
		log.Fatal("Error running discovery", err)
	}

	// Run a sync against lights
	err = s.Sync(devices)
	if err != nil {
		log.Fatal("Error running sync", err)
	}

	app := fiber.New()

	app.Get("/:mapId", func(c *fiber.Ctx) error {
		fmt.Println("Map id", c.Params("mapId"))
		if err != nil {
			log.Fatalln(err)
		}

		var sL *scanner.Light
		for _, l := range devices {
			if l.HwID == c.Params("mapId") {
				sL = &l
				break
			}
		}

		// If no light light exists
		if sL == nil {
			return c.SendStatus(404)
		}

		// connect to yeelight instance
		y := yeelight.New(sL.Location)
		handler := actions.DeviceHandler{
			Light: y,
		}

		action := strings.ToUpper(c.Query("action"))

		slog.Info(fmt.Sprintf("action=%s", action))

		switch action {
		case "ON":
			handler.HandlePower(true)
		case "OFF":
			handler.HandlePower(false)
		case "DIM":
			brightness := c.Query("brightness")
			slog.Info(fmt.Sprintf("dim intensity=%s", brightness))
			i, err := strconv.Atoi(brightness)
			if err != nil {
				slog.Error("TODO", err)
				return c.SendStatus(400)
			}
			handler.HandleDim(i)
		}

		return c.SendString("lol")
	})

	app.Listen(":5000")
}
