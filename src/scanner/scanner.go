package scanner

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

type Scanner interface {
	// Runs scan on local network and discovers all lights on network
	Discover() (LightResult, error)
	// Sync light with cache/ha-bridge
	Sync(Light)
}
