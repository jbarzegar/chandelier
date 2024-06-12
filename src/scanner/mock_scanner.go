package scanner

import (
	"context"
	"fmt"
	"log/slog"
)

type MockScanner struct {
	Devices []Light
}

func (s MockScanner) Discover(ctx context.Context) ([]Light, error) {
	slog.Info("Looking for lights")

	lights := make([]Light, 4)

	for i := range lights {
		lights[i] = Light{
			HwID:              fmt.Sprintf("light::id::%v", i),
			HwName:            fmt.Sprintf("light::name::%v", i),
			HwModel:           "MockLight",
			HwFirmwareVersion: "999",
			Name:              "Light Name",
			Location:          "0.0.0.0",
		}
	}

	return lights, nil
}

func (s *MockScanner) Sync(lights []Light) error {
	return nil
}
