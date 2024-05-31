package scanner

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"log/slog"
	"net/http"
	"time"

	"github.com/fatih/structs"
	"github.com/jbarzegar/chandelier/src/cache"
	"github.com/oherych/yeelight"
)

// TODO
// See if device already exists
// If not add the device

//  - How do we map the device?
//  -- Maybe use `mapID`
// Shape of onURL JSON
//  { name: "${location}/"}

type XURL struct {
	Name string `json:"name"`
}
type AddDeviceRequest struct {
	Name    string `json:"name"`
	MapId   string `json:"mapId"`
	MapType string `json:"mapType"`
	OnURL   string `json:"onUrl"`
	OffUrl  string `json:"offUrl"`
}

type YeelightScanner struct {
	Devices []Light
}

// Scan network for yeelights
func (s YeelightScanner) Discover(ctx context.Context) ([]Light, error) {
	slog.Info("Looking for lights")
	devices, err := yeelight.Discovery(ctx)
	ctx.Done()

	if len(devices) == 0 {
		slog.Warn("No devices")
		return []Light{}, nil
	}

	slog.Info(fmt.Sprintf("Found %v devices", len(devices)))

	if err != nil && !errors.Is(err, context.DeadlineExceeded) {
		return []Light{}, err
	}

	var result = LightResult{
		Devices: []Light{},
	}

	for _, d := range devices {
		if d.Name == "" {
			d.Name = "<UNSPECIFIED>"
		}

		result.Devices = append(result.Devices, Light{
			HwID:              d.ID,
			HwName:            d.Name,
			HwModel:           d.Model,
			HwFirmwareVersion: d.FirmwareVersion,
			Name:              fmt.Sprintf("yeelight::%s", d.Model),
			Location:          d.Location,
		})
	}

	s.Devices = result.Devices

	return s.Devices, nil
}

// Sync yeelights with redis
func syncCache(l Light) error {
	slog.Info("Syncing with redis")

	key := l.HwID
	// check if light exists in cache (rn use hwid even tho it may suck to)
	result, err := cache.Redis.Exists(context.TODO(), key).Result()
	if err != nil {
		slog.Error("Error checking light in redis")
		log.Fatal(err)
	}

	// Light is missing
	if result == 0 {
		slog.Info("Light does not exist in cache")

		// Create JSON payload for value
		// payload, err := json.Marshal(l)
		// if err != nil {
		// 	return err
		// }

		slog.Info("Saving light")

		// Set hash in redis
		s := structs.Map(l)
		// We set the bridgeId to nil to denote that it hasn't been set yet
		s["bridgeId"] = nil

		result, err := cache.Redis.HSet(context.TODO(), key, s).Result()
		if err != nil {
			return err
		}

		slog.Info(fmt.Sprintf("Light saved::result: %v", result))

	} else {
		slog.Info("Light exists already")
	}

	return nil
}

// Sync yeelights with ha-bridge
func syncBridge(l Light) error {
	payload := AddDeviceRequest{
		Name:    l.Name,
		MapId:   l.HwID,
		MapType: fmt.Sprintf("yeelight::%v", l.Name),
	}

	result, err := cache.Redis.HGet(context.TODO(), l.HwID, "bridgeId").Result()
	if err != nil {
		return err
	}

	if result == "" {

		slog.Info("Attempting to add item to habridg")
		reqUrl := fmt.Sprintf("http://localhost:%d/api/devices", 8080)
		jsonPayload, err := json.Marshal(payload)
		if err != nil {
			slog.Error("Error creating json payload", err)
		}

		body := bytes.NewBuffer(jsonPayload)

		client := http.Client{
			Timeout: 30 * time.Second,
		}

		resp, err := client.Post(reqUrl, "application/json", body)
		if err != err {
			slog.Error("Error adding a device", err)
			return err
		}

		defer resp.Body.Close()

		respBody, err := io.ReadAll(resp.Body)

		if err != err {
			slog.Error("Error reading body", err)
			return err
		}

		var response []map[string]any

		err = json.Unmarshal(respBody, &response)

		if err != nil {
			return err
		}

		// TODO: Set the bridgeID in redis
		resultN, err := cache.Redis.HSet(context.TODO(), l.HwID, "bridgeId", response[0]["id"]).Result()

		if err != nil {
			return err
		}

		fmt.Println(resultN)

	} else {
		// TODO VALIDATE THAT THE Light still exists in the bridge
		// GET by id and if it's not there resync it
	}

	return nil
}

func (s *YeelightScanner) Sync(lights []Light) error {

	for _, light := range lights {
		err := syncCache(light)
		if err != nil {
			return err
		}

		err = syncBridge(light)
		if err != nil {
			return err
		}

	}

	// If they are in redis but not habridge sync em up

	// ????

	return nil
}
