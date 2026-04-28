-- 添加房间玩家关联表
-- 用于支持玩家动态加入/退出房间，替代固定的 player1_id, player2_id, player3_id 字段

CREATE TABLE IF NOT EXISTS `ddz_room_players` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `room_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间号',
  `player_id` bigint unsigned NOT NULL COMMENT '玩家ID',
  `seat_index` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '座位号: 0-2',
  `is_creator` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '是否房主: 0-否, 1-是',
  `is_ready` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '是否准备: 0-否, 1-是',
  `is_offline` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '是否离线: 0-在线, 1-离线',
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  `left_at` datetime DEFAULT NULL COMMENT '离开时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_room_player` (`room_code`, `player_id`),
  KEY `idx_room_code` (`room_code`),
  KEY `idx_player_id` (`player_id`),
  KEY `idx_joined_at` (`joined_at`),
  CONSTRAINT `fk_room_players_room` FOREIGN KEY (`room_code`) REFERENCES `ddz_rooms` (`room_code`) ON DELETE CASCADE,
  CONSTRAINT `fk_room_players_player` FOREIGN KEY (`player_id`) REFERENCES `ddz_players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='房间玩家关联表';

-- 添加索引优化查询性能
CREATE INDEX idx_room_players_room_seat ON ddz_room_players(room_code, seat_index);
