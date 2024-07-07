package actions

import (
	"context"
	"log/slog"
	"time"

	"github.com/oherych/yeelight"
)

type DeviceHandler struct {
	Light yeelight.Client
}

type DeviceHandlerResult = string

const effect = yeelight.EffectSmooth

func (h *DeviceHandler) HandleDim(currentBrightness int) {
	err := h.Light.SetBright(context.TODO(), currentBrightness, effect, 300*time.Millisecond)
	if err != nil {
		slog.Error("Error setting device brightness", err)
	}
}

func (h *DeviceHandler) HandlePower(power bool) {
	h.Light.Power(context.TODO(), power, yeelight.PowerModeDefault, effect, 500*time.Millisecond)
}
