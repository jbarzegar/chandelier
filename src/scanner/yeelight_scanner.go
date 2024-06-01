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
	"net/url"
	"strconv"
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

var bridgeApiURL = fmt.Sprintf("http://localhost:%d/api", 8080)

func addDeviceToBridge(payload AddDeviceRequest) ([]map[string]any, error) {
	slog.Info("Attempting to add item to habridg")

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		slog.Error("Error creating json payload", err)
	}

	body := bytes.NewBuffer(jsonPayload)

	client := http.Client{
		Timeout: 30 * time.Second,
	}

	u, _ := url.JoinPath(bridgeApiURL, "/devices")
	// Adding device
	resp, err := client.Post(u, "application/json", body)
	if err != err {
		slog.Error("Error adding a device", err)
		return nil, err
	}

	respBody, err := io.ReadAll(resp.Body)
	resp.Body.Close()

	if err != err {
		slog.Error("Error reading body", err)
		return nil, err
	}

	if resp.StatusCode > 299 {
		slog.Error(fmt.Sprintf("Create device failed with status: %v \n body: %s", resp.StatusCode, string(respBody)))
		return nil, errors.New("create device failed")
	}

	var response []map[string]any

	err = json.Unmarshal(respBody, &response)

	if err != nil {
		return nil, err
	}

	return response, nil
}

var ErrorNoLightFound = errors.New("no light found")

func hasDeviceInBridge(id int) (bool, error) {
	slog.Info(fmt.Sprintf("Fetching light with ID: %s", strconv.Itoa(id)))
	u, _ := url.JoinPath(bridgeApiURL, "/devices/", strconv.Itoa(id))
	fmt.Println(u)

	client := http.Client{
		Timeout: 30 * time.Second,
	}

	req, err := http.NewRequest("GET", u, nil)

	if err != nil {
		return false, err
	}

	// resp, err := client.Get(u)
	resp, err := client.Do(req)

	if err != nil {
		return false, err
	}

	body, err := io.ReadAll(resp.Body)
	resp.Body.Close()

	if resp.StatusCode > 299 {
		log.Fatal(fmt.Printf("getDevice failed with status code: %v and \n body: %v", resp.StatusCode, string(body)))
	}

	if resp.StatusCode == 404 {
		return false, ErrorNoLightFound
	}

	if err != nil {
		return false, err
	}

	return true, nil
}

// Sync yeelights with ha-bridge
func syncBridge(l Light) error {
	result, err := cache.Redis.HGet(context.TODO(), l.HwID, "bridgeId").Result()
	if err != nil {
		return err
	}

	if result == "" {
		payload := AddDeviceRequest{
			Name:    l.Name,
			MapId:   l.HwID,
			MapType: fmt.Sprintf("yeelight::%v", l.Name),
		}
		response, err := addDeviceToBridge(payload)

		if err != nil {
			slog.Error("Error adding light to bridge")
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
		fmt.Println(result)
		id, err := strconv.Atoi(result)
		if err != nil {
			slog.Error("Could not convert bridgeId into int")
			return err
		}

		_, err = hasDeviceInBridge(id)

		if err == ErrorNoLightFound {
			slog.Error("Failed to get light in bridge")
			cache.Redis.HDel(context.TODO(), l.HwID, "bridgeId").Result()
			return err
		}

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

	return nil
}
