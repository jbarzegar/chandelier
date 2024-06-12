package scanner

import (
	"context"
	"errors"
	"fmt"
	"log/slog"

	"github.com/oherych/yeelight"
)

// TODO
// See if device already exists
// If not add the device

//  - How do we map the device?
//  -- Maybe use `mapID`

type YeelightScanner struct {
	Devices []Light
}

// Scan network for yeelights
func (s YeelightScanner) Discover(ctx context.Context) ([]Light, error) {
	slog.Info("YeelightScanner: Looking for lights")
	devices, err := yeelight.Discovery(ctx)
	ctx.Done()

	if err != nil && !errors.Is(err, context.DeadlineExceeded) {
		slog.Error("Oh no")
		return []Light{}, err
	}

	if len(devices) == 0 {
		slog.Warn("No devices")
		return []Light{}, nil
	}

	slog.Info(fmt.Sprintf("Found %v devices", len(devices)))

	result := LightResult{
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
