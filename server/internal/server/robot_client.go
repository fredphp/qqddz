package server

import (
        "log"
        "strconv"

        "github.com/palemoky/fight-the-landlord/internal/game/database"
        "github.com/palemoky/fight-the-landlord/internal/protocol"
)

// RobotClient 机器人客户端（用于竞技场机器人加入房间）
type RobotClient struct {
        ID        string // 玩家唯一 ID
        Name      string // 玩家昵称
        PlayerID  uint64 // 数据库玩家ID
        Gold      int64  // 金币数量
        Avatar    string // 🔧【新增】头像URL
        server    *Server
        roomCode  string // 当前所在房间
        callIndex int64  // 请求索引
}

// NewRobotClient 创建机器人客户端
func NewRobotClient(playerID uint64, server *Server) *RobotClient {
        // 从数据库获取机器人信息
        player, err := database.GetPlayerByID(playerID)
        if err != nil {
                log.Printf("[RobotClient] 获取机器人信息失败: playerID=%d, err=%v", playerID, err)
                return nil
        }

        // 🔧【新增】获取头像URL
        avatar := player.Avatar
        if avatar == "" {
                // 如果没有设置头像，使用默认头像
                avatar = "avatar_1"
        }

        return &RobotClient{
                ID:       strconv.FormatUint(playerID, 10),
                Name:     player.Nickname,
                PlayerID: playerID,
                Gold:     player.Gold,
                Avatar:   avatar, // 🔧【新增】设置头像
                server:   server,
        }
}

// GetID 获取客户端ID
func (c *RobotClient) GetID() string {
        return c.ID
}

// GetName 获取客户端名称
func (c *RobotClient) GetName() string {
        return c.Name
}

// SetName 设置客户端名称
func (c *RobotClient) SetName(name string) {
        c.Name = name
}

// GetRoom 获取当前房间
func (c *RobotClient) GetRoom() string {
        return c.roomCode
}

// SetRoom 设置当前房间
func (c *RobotClient) SetRoom(code string) {
        c.roomCode = code
}

// SendMessage 发送消息（机器人不需要实际发送）
func (c *RobotClient) SendMessage(msg *protocol.Message) {
        // 机器人不需要实际发送消息，但需要实现接口
        log.Printf("[RobotClient] 机器人 %s 忽略消息: type=%s", c.Name, msg.Type)
}

// Close 关闭连接（机器人不需要）
func (c *RobotClient) Close() {
        // 机器人不需要关闭连接
}

// GetCallIndex 获取请求索引
func (c *RobotClient) GetCallIndex() int64 {
        return c.callIndex
}

// SetCallIndex 设置请求索引
func (c *RobotClient) SetCallIndex(index int64) {
        c.callIndex = index
}

// GetPlayerID 获取数据库玩家ID
func (c *RobotClient) GetPlayerID() uint64 {
        return c.PlayerID
}

// SetPlayerID 设置数据库玩家ID
func (c *RobotClient) SetPlayerID(id uint64) {
        c.PlayerID = id
}

// GetGold 获取金币数量
func (c *RobotClient) GetGold() int64 {
        return c.Gold
}

// SetGold 设置金币数量
func (c *RobotClient) SetGold(gold int64) {
        c.Gold = gold
}

// IsRobot 是否是机器人
func (c *RobotClient) IsRobot() bool {
        return true
}

// GetAvatar 获取头像URL
func (c *RobotClient) GetAvatar() string {
        return c.Avatar
}
