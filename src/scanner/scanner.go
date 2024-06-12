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
)

type LightResult struct {
	Devices []Light
}

type Light struct {
	// ID set by manufacture or found when running discovery
	HwID string `json:"hwId"`
	// Name set my hardware
	HwName string `json:"hwName"`
	// Name of model hardware
	HwModel string `json:"hwModel"`
	// Firmware version of hardware
	HwFirmwareVersion string `json:"hwFirmwareVersion"`
	// Name of light
	Name string `json:"name"`
	// IP address
	Location string `json:"location"`
}

type XURL struct {
	Item        string `json:"item"`
	HttpVerb    string `json:"httpVerb"`
	ContentType string `json:"contentType"`
}

type AddDeviceRequest struct {
	Name    string `json:"name"`
	MapId   string `json:"mapId"`
	MapType string `json:"mapType"`
	// Shape of onURL JSON
	// { name: "${location}/"}
	OnURL string `json:"onUrl"`
	// Shape of offURL JSON
	// { name: "${location}/"}
	OffUrl string `json:"offUrl"`
}

type Scanner interface {
	// Runs scan on local network and discovers all lights on network
	Discover() (LightResult, error)
	// Sync light with cache/ha-bridge
	Sync(Light)
}

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
	slog.Info("Attempting to add item to habridge")

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

// Sync lights with ha-bridge
func syncBridge(l Light) error {
	result, err := cache.Redis.HGet(context.TODO(), l.HwID, "bridgeId").Result()
	if err != nil {
		return err
	}

	if result == "" {
		onUrlRaw := XURL{
			HttpVerb: "GET",
			Item:     fmt.Sprintf("http://localhost:5000/%s?action=ON", l.HwID),
		}
		offUrlRaw := XURL{
			HttpVerb: "GET",
			Item:     fmt.Sprintf("http://localhost:5000/%s?action=OFF", l.HwID),
		}
		// var onUrl, offUrl string

		onUrl, _ := json.Marshal([]XURL{onUrlRaw})
		offUrl, _ := json.Marshal([]XURL{offUrlRaw})

		payload := AddDeviceRequest{
			Name:    l.Name,
			MapId:   l.HwID,
			MapType: fmt.Sprintf("yeelight::%v", l.Name),
			OnURL:   string(onUrl),
			OffUrl:  string(offUrl),
		}
		response, err := addDeviceToBridge(payload)
		if err != nil {
			slog.Error("Error adding light to bridge")
			return err
		}

		resultN, err := cache.Redis.
			HSet(context.TODO(),
				l.HwID,
				"bridgeId",
				response[0]["id"]).Result()
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
