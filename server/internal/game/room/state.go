package room

// RoomState 房间状态
type RoomState int

const (
	RoomStateWaiting  RoomState = iota // 等待中
	RoomStateReady                     // 准备中（所有人已准备）
	RoomStateBidding                   // 叫地主阶段
	RoomStatePlaying                   // 游戏中
	RoomStateFinished                  // 已结算
	RoomStateEnded                     // 已结束（销毁中）
)

func (s RoomState) String() string {
	switch s {
	case RoomStateWaiting:
		return "waiting"
	case RoomStateReady:
		return "ready"
	case RoomStateBidding:
		return "bidding"
	case RoomStatePlaying:
		return "playing"
	case RoomStateFinished:
		return "finished"
	case RoomStateEnded:
		return "ended"
	default:
		return "unknown"
	}
}

// PlayerState 玩家状态
type PlayerState int

const (
	PlayerStateOnline  PlayerState = iota // 在线
	PlayerStateOffline                    // 离线
	PlayerStateRobot                      // 机器人托管
)

func (s PlayerState) String() string {
	switch s {
	case PlayerStateOnline:
		return "online"
	case PlayerStateOffline:
		return "offline"
	case PlayerStateRobot:
		return "robot"
	default:
		return "unknown"
	}
}

// IsOnline 检查玩家是否在线
func (s PlayerState) IsOnline() bool {
	return s == PlayerStateOnline
}

// IsRobot 检查玩家是否机器人托管
func (s PlayerState) IsRobot() bool {
	return s == PlayerStateRobot
}

// IsOffline 检查玩家是否离线
func (s PlayerState) IsOffline() bool {
	return s == PlayerStateOffline
}
