/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80045 (8.0.45-0ubuntu0.24.04.1)
 Source Host           : localhost:3306
 Source Schema         : ddz_game

 Target Server Type    : MySQL
 Target Server Version : 80045 (8.0.45-0ubuntu0.24.04.1)
 File Encoding         : 65001

 Date: 26/04/2026 09:11:24
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ddz_bid_logs
-- ----------------------------
DROP TABLE IF EXISTS `ddz_bid_logs`;
CREATE TABLE `ddz_bid_logs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `game_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '游戏唯一标识',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `bid_order` bigint NOT NULL COMMENT '叫地主顺序(1-3)',
  `bid_type` bigint NULL DEFAULT NULL COMMENT '叫地主类型 0不叫 1叫地主 2抢地主',
  `bid_score` bigint NOT NULL DEFAULT 0 COMMENT '叫分(1-3分)',
  `is_success` tinyint NOT NULL DEFAULT 0 COMMENT '是否成功成为地主',
  `created_at` datetime(3) NULL DEFAULT NULL,
  `updated_at` datetime(3) NULL DEFAULT NULL,
  `deleted_at` datetime(3) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_bid_logs_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_ddz_bid_logs_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_ddz_bid_logs_bid_order`(`bid_order` ASC) USING BTREE,
  INDEX `idx_ddz_bid_logs_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_ddz_bid_logs_deleted_at`(`deleted_at` ASC) USING BTREE,
  CONSTRAINT `fk_ddz_bid_logs_player` FOREIGN KEY (`player_id`) REFERENCES `ddz_players` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_bid_logs
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_daily_stats
-- ----------------------------
DROP TABLE IF EXISTS `ddz_daily_stats`;
CREATE TABLE `ddz_daily_stats`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` datetime(3) NULL DEFAULT NULL,
  `updated_at` datetime(3) NULL DEFAULT NULL,
  `deleted_at` datetime(3) NULL DEFAULT NULL,
  `date` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '统计日期 YYYY-MM-DD',
  `total_players` bigint NULL DEFAULT 0 COMMENT '总玩家数',
  `new_players` bigint NULL DEFAULT 0 COMMENT '新增玩家数',
  `active_players` bigint NULL DEFAULT 0 COMMENT '活跃玩家数',
  `total_games` bigint NULL DEFAULT 0 COMMENT '总游戏场次',
  `avg_game_duration` double NULL DEFAULT 0 COMMENT '平均游戏时长(秒)',
  `max_online` bigint NULL DEFAULT 0 COMMENT '最高在线人数',
  `total_online_time` bigint NULL DEFAULT 0 COMMENT '总在线时长(秒)',
  `peak_time` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '高峰时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_ddz_daily_stats_date`(`date` ASC) USING BTREE,
  INDEX `idx_ddz_daily_stats_deleted_at`(`deleted_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_daily_stats
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_deal_logs
-- ----------------------------
DROP TABLE IF EXISTS `ddz_deal_logs`;
CREATE TABLE `ddz_deal_logs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `game_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '游戏唯一标识',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `player_role` bigint NULL DEFAULT NULL COMMENT '玩家角色 1地主 2农民',
  `hand_cards` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手牌(逗号分隔的牌编码)',
  `cards_count` bigint NOT NULL DEFAULT 0 COMMENT '手牌数量',
  `landlord_cards` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '底牌(仅地主有)',
  `created_at` datetime(3) NULL DEFAULT NULL,
  `updated_at` datetime(3) NULL DEFAULT NULL,
  `deleted_at` datetime(3) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_deal_logs_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_ddz_deal_logs_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_ddz_deal_logs_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_ddz_deal_logs_deleted_at`(`deleted_at` ASC) USING BTREE,
  CONSTRAINT `fk_ddz_deal_logs_player` FOREIGN KEY (`player_id`) REFERENCES `ddz_players` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_deal_logs
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_deal_records
-- ----------------------------
DROP TABLE IF EXISTS `ddz_deal_records`;
CREATE TABLE `ddz_deal_records`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` datetime(3) NULL DEFAULT NULL,
  `updated_at` datetime(3) NULL DEFAULT NULL,
  `deleted_at` datetime(3) NULL DEFAULT NULL,
  `game_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '游戏记录ID',
  `player0_cards` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '玩家0手牌',
  `player1_cards` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '玩家1手牌',
  `player2_cards` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '玩家2手牌',
  `dizhu_cards` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '地主牌(三张底牌)',
  `first_player` bigint NULL DEFAULT NULL COMMENT '首发玩家位置',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_ddz_deal_records_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_ddz_deal_records_deleted_at`(`deleted_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_deal_records
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_game_configs
-- ----------------------------
DROP TABLE IF EXISTS `ddz_game_configs`;
CREATE TABLE `ddz_game_configs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` datetime(3) NULL DEFAULT NULL,
  `updated_at` datetime(3) NULL DEFAULT NULL,
  `deleted_at` datetime(3) NULL DEFAULT NULL,
  `config_key` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '配置键',
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '配置值',
  `config_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '配置类型 string/int/json',
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '配置描述',
  `status` bigint NULL DEFAULT 1 COMMENT '状态 1启用 2禁用',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_ddz_game_configs_config_key`(`config_key` ASC) USING BTREE,
  INDEX `idx_ddz_game_configs_deleted_at`(`deleted_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_game_configs
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_game_play_records
-- ----------------------------
DROP TABLE IF EXISTS `ddz_game_play_records`;
CREATE TABLE `ddz_game_play_records`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` datetime(3) NULL DEFAULT NULL,
  `updated_at` datetime(3) NULL DEFAULT NULL,
  `deleted_at` datetime(3) NULL DEFAULT NULL,
  `game_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '游戏记录ID',
  `player_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '玩家ID',
  `player_index` bigint NULL DEFAULT NULL COMMENT '玩家位置',
  `turn_index` bigint NULL DEFAULT NULL COMMENT '回合序号',
  `action_type` bigint NULL DEFAULT NULL COMMENT '操作类型 1出牌 2不出 3叫地主 4不叫 5抢地主 6不抢',
  `cards` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '出的牌(序列化)',
  `timestamp` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '操作时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_game_play_records_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_ddz_game_play_records_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_ddz_game_play_records_deleted_at`(`deleted_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_game_play_records
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_game_player_records
-- ----------------------------
DROP TABLE IF EXISTS `ddz_game_player_records`;
CREATE TABLE `ddz_game_player_records`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` datetime(3) NULL DEFAULT NULL,
  `updated_at` datetime(3) NULL DEFAULT NULL,
  `deleted_at` datetime(3) NULL DEFAULT NULL,
  `game_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '游戏记录ID',
  `player_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '玩家ID',
  `player_index` bigint NULL DEFAULT NULL COMMENT '玩家位置 0-2',
  `is_landlord` bigint NULL DEFAULT NULL COMMENT '是否地主 0否 1是',
  `is_winner` bigint NULL DEFAULT NULL COMMENT '是否赢家 0否 1是',
  `score` bigint NULL DEFAULT NULL COMMENT '得分(负数为扣分)',
  `coins_before` bigint NULL DEFAULT NULL COMMENT '变化前金币',
  `coins_after` bigint NULL DEFAULT NULL COMMENT '变化后金币',
  `cards` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '手牌(序列化)',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_game_player_records_deleted_at`(`deleted_at` ASC) USING BTREE,
  INDEX `idx_ddz_game_player_records_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_ddz_game_player_records_player_id`(`player_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_game_player_records
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_game_records
-- ----------------------------
DROP TABLE IF EXISTS `ddz_game_records`;
CREATE TABLE `ddz_game_records`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '游戏记录ID',
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `room_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '房间ID',
  `room_type` bigint NULL DEFAULT NULL COMMENT '房间类型 1普通 2VIP',
  `landlord_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '地主玩家ID',
  `farmer1_id` bigint UNSIGNED NOT NULL COMMENT '农民1玩家ID',
  `farmer2_id` bigint UNSIGNED NOT NULL COMMENT '农民2玩家ID',
  `base_score` bigint NULL DEFAULT NULL COMMENT '底分',
  `multiplier` bigint NOT NULL DEFAULT 1 COMMENT '最终倍数',
  `bomb_count` bigint NOT NULL DEFAULT 0 COMMENT '炸弹数量',
  `spring` bigint NULL DEFAULT 0 COMMENT '春天 0否 1春天 2反春天',
  `result` tinyint NOT NULL COMMENT '结果:1-地主胜,2-农民胜',
  `landlord_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '地主输赢金币',
  `farmer1_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '农民1输赢金币',
  `farmer2_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '农民2输赢金币',
  `started_at` datetime NOT NULL COMMENT '开始时间',
  `ended_at` datetime NULL DEFAULT NULL COMMENT '结束时间',
  `duration_seconds` bigint NOT NULL DEFAULT 0 COMMENT '游戏时长(秒)',
  `created_at` datetime(3) NULL DEFAULT NULL,
  `updated_at` datetime(3) NULL DEFAULT NULL,
  `deleted_at` datetime(3) NULL DEFAULT NULL,
  `room_level` bigint NULL DEFAULT NULL COMMENT '房间等级',
  `multiple` bigint NULL DEFAULT NULL COMMENT '倍数',
  `winner` bigint NULL DEFAULT NULL COMMENT '赢家 1地主 2农民',
  `game_duration` bigint NULL DEFAULT NULL COMMENT '游戏时长(秒)',
  `game_time` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '游戏时间',
  `game_status` bigint NULL DEFAULT 1 COMMENT '游戏状态 1进行中 2已结束',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_ddz_game_records_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_ddz_game_records_room_id`(`room_id` ASC) USING BTREE,
  INDEX `idx_ddz_game_records_landlord_id`(`landlord_id` ASC) USING BTREE,
  INDEX `idx_ddz_game_records_farmer1_id`(`farmer1_id` ASC) USING BTREE,
  INDEX `idx_ddz_game_records_farmer2_id`(`farmer2_id` ASC) USING BTREE,
  INDEX `idx_ddz_game_records_result`(`result` ASC) USING BTREE,
  INDEX `idx_ddz_game_records_started_at`(`started_at` ASC) USING BTREE,
  INDEX `idx_ddz_game_records_deleted_at`(`deleted_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_game_records
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_leaderboard
-- ----------------------------
DROP TABLE IF EXISTS `ddz_leaderboard`;
CREATE TABLE `ddz_leaderboard`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` datetime(3) NULL DEFAULT NULL,
  `updated_at` datetime(3) NULL DEFAULT NULL,
  `deleted_at` datetime(3) NULL DEFAULT NULL,
  `rank_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '排行类型 winrate/coins/level/wins',
  `player_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '玩家ID',
  `score` bigint NULL DEFAULT NULL COMMENT '分数',
  `rank` bigint NULL DEFAULT NULL COMMENT '排名',
  `update_time` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_leaderboard_deleted_at`(`deleted_at` ASC) USING BTREE,
  INDEX `idx_ddz_leaderboard_rank_type`(`rank_type` ASC) USING BTREE,
  INDEX `idx_ddz_leaderboard_player_id`(`player_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_leaderboard
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_login_logs
-- ----------------------------
DROP TABLE IF EXISTS `ddz_login_logs`;
CREATE TABLE `ddz_login_logs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `account_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '账户ID',
  `login_type` bigint NULL DEFAULT NULL COMMENT '登录类型 1手机号 2微信 3游客',
  `login_result` bigint NULL DEFAULT NULL COMMENT '登录结果 0失败 1成功',
  `fail_reason` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '失败原因',
  `ip` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '登录IP',
  `device_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备ID',
  `device_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备类型',
  `user_agent` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'User-Agent',
  `location` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '登录地点',
  `created_at` datetime(3) NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_login_logs_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_ddz_login_logs_account_id`(`account_id` ASC) USING BTREE,
  INDEX `idx_ddz_login_logs_created_at`(`created_at` ASC) USING BTREE,
  CONSTRAINT `fk_ddz_login_logs_account` FOREIGN KEY (`account_id`) REFERENCES `ddz_user_accounts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ddz_login_logs_player` FOREIGN KEY (`player_id`) REFERENCES `ddz_players` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 28 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_login_logs
-- ----------------------------
INSERT INTO `ddz_login_logs` VALUES (1, 1, 1, 1, 1, '', '[::1]', '', 'Unknown', 'curl/8.5.0', '', '2026-04-25 12:10:45.000');
INSERT INTO `ddz_login_logs` VALUES (2, 2, 2, 1, 1, '', '[::1]', '', 'Unknown', 'curl/8.5.0', '', '2026-04-25 12:11:06.000');
INSERT INTO `ddz_login_logs` VALUES (3, 2, 2, 1, 1, '', '[::1]', '', 'Unknown', 'curl/8.5.0', '', '2026-04-25 12:11:15.000');
INSERT INTO `ddz_login_logs` VALUES (4, 3, 3, 1, 1, '', '[::1]', '', 'Unknown', 'curl/8.5.0', '', '2026-04-25 12:11:20.000');
INSERT INTO `ddz_login_logs` VALUES (5, 4, 4, 1, 1, '', '127.0.0.1', 'web_1777103633483', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 15:53:53.000');
INSERT INTO `ddz_login_logs` VALUES (6, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104357220', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:05:57.000');
INSERT INTO `ddz_login_logs` VALUES (7, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104487562', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:08:07.000');
INSERT INTO `ddz_login_logs` VALUES (8, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104498108', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:08:18.000');
INSERT INTO `ddz_login_logs` VALUES (9, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104632583', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:10:32.000');
INSERT INTO `ddz_login_logs` VALUES (10, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104633147', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:10:32.000');
INSERT INTO `ddz_login_logs` VALUES (11, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104634187', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:10:33.000');
INSERT INTO `ddz_login_logs` VALUES (12, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104634851', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:10:34.000');
INSERT INTO `ddz_login_logs` VALUES (13, 4, 4, 1, 1, '', '127.0.0.1', 'web_1777104646972', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:10:47.000');
INSERT INTO `ddz_login_logs` VALUES (14, 4, 4, 1, 1, '', '127.0.0.1', 'web_1777104648916', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:10:49.000');
INSERT INTO `ddz_login_logs` VALUES (15, 4, 4, 1, 1, '', '127.0.0.1', 'web_1777104649404', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:10:50.000');
INSERT INTO `ddz_login_logs` VALUES (16, 4, 4, 1, 1, '', '127.0.0.1', 'web_1777104649621', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:10:50.000');
INSERT INTO `ddz_login_logs` VALUES (17, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104873979', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:14:34.000');
INSERT INTO `ddz_login_logs` VALUES (18, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104878203', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:14:37.000');
INSERT INTO `ddz_login_logs` VALUES (19, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104878852', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:14:38.000');
INSERT INTO `ddz_login_logs` VALUES (20, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104879069', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:14:38.000');
INSERT INTO `ddz_login_logs` VALUES (21, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104879259', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:14:38.000');
INSERT INTO `ddz_login_logs` VALUES (22, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104879453', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:14:38.000');
INSERT INTO `ddz_login_logs` VALUES (23, 4, 4, 1, 1, '', '127.0.0.1', 'web_1777106609797', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:43:29.000');
INSERT INTO `ddz_login_logs` VALUES (24, 4, 4, 1, 1, '', '127.0.0.1', 'web_1777107796118', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 17:03:17.000');
INSERT INTO `ddz_login_logs` VALUES (25, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777108631556', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 17:17:11.000');
INSERT INTO `ddz_login_logs` VALUES (26, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 18:21:55.000');
INSERT INTO `ddz_login_logs` VALUES (27, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 19:22:12.000');

-- ----------------------------
-- Table structure for ddz_play_logs
-- ----------------------------
DROP TABLE IF EXISTS `ddz_play_logs`;
CREATE TABLE `ddz_play_logs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `game_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '游戏唯一标识',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `player_role` bigint NULL DEFAULT NULL COMMENT '玩家角色 1地主 2农民',
  `round_num` bigint NOT NULL COMMENT '回合数',
  `play_order` bigint NOT NULL COMMENT '本回合出牌顺序',
  `play_type` bigint NULL DEFAULT NULL COMMENT '出牌类型 1出牌 2不出 3超时自动出牌',
  `cards` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '出的牌',
  `cards_count` bigint NOT NULL DEFAULT 0 COMMENT '出牌数量',
  `card_pattern` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '牌型',
  `is_bomb` tinyint NOT NULL DEFAULT 0 COMMENT '是否炸弹',
  `is_rocket` tinyint NOT NULL DEFAULT 0 COMMENT '是否火箭',
  `created_at` datetime(3) NULL DEFAULT NULL,
  `updated_at` datetime(3) NULL DEFAULT NULL,
  `deleted_at` datetime(3) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_play_logs_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_ddz_play_logs_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_ddz_play_logs_round_num`(`round_num` ASC) USING BTREE,
  INDEX `idx_ddz_play_logs_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_ddz_play_logs_deleted_at`(`deleted_at` ASC) USING BTREE,
  CONSTRAINT `fk_ddz_play_logs_player` FOREIGN KEY (`player_id`) REFERENCES `ddz_players` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_play_logs
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_player_online
-- ----------------------------
DROP TABLE IF EXISTS `ddz_player_online`;
CREATE TABLE `ddz_player_online`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` datetime(3) NULL DEFAULT NULL,
  `updated_at` datetime(3) NULL DEFAULT NULL,
  `deleted_at` datetime(3) NULL DEFAULT NULL,
  `player_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '玩家ID',
  `login_ip` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '登录IP',
  `device_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备ID',
  `server_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '服务器ID',
  `login_time` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '登录时间',
  `logout_time` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '登出时间',
  `online_time` bigint NULL DEFAULT NULL COMMENT '在线时长(秒)',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_player_online_deleted_at`(`deleted_at` ASC) USING BTREE,
  INDEX `idx_ddz_player_online_player_id`(`player_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_player_online
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_player_stats
-- ----------------------------
DROP TABLE IF EXISTS `ddz_player_stats`;
CREATE TABLE `ddz_player_stats`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '统计ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `stat_date` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '统计日期',
  `total_games` bigint NOT NULL DEFAULT 0 COMMENT '总场次',
  `win_games` bigint NOT NULL DEFAULT 0 COMMENT '胜场',
  `lose_games` bigint NOT NULL DEFAULT 0 COMMENT '负场',
  `win_rate` double NULL DEFAULT 0 COMMENT '胜率(%)',
  `landlord_games` bigint NOT NULL DEFAULT 0 COMMENT '当地主场次',
  `landlord_wins` bigint NOT NULL DEFAULT 0 COMMENT '当地主胜场',
  `farmer_games` bigint NOT NULL DEFAULT 0 COMMENT '当农民场次',
  `farmer_wins` bigint NULL DEFAULT 0,
  `total_gold_change` bigint NOT NULL DEFAULT 0 COMMENT '总金币变化',
  `max_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '单局最大赢金',
  `max_lose_gold` bigint NOT NULL DEFAULT 0 COMMENT '单局最大输金',
  `total_bombs` bigint NOT NULL DEFAULT 0 COMMENT '炸弹总数',
  `total_rockets` bigint NOT NULL DEFAULT 0 COMMENT '火箭总数',
  `spring_count` bigint NOT NULL DEFAULT 0 COMMENT '春天次数',
  `anti_spring_count` bigint NOT NULL DEFAULT 0 COMMENT '反春天次数',
  `avg_game_duration` bigint NOT NULL DEFAULT 0 COMMENT '平均游戏时长(秒)',
  `created_at` datetime(3) NULL DEFAULT NULL,
  `updated_at` datetime(3) NULL DEFAULT NULL,
  `deleted_at` datetime(3) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_player_date`(`player_id` ASC, `stat_date` ASC) USING BTREE,
  INDEX `idx_ddz_player_stats_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_ddz_player_stats_stat_date`(`stat_date` ASC) USING BTREE,
  INDEX `idx_ddz_player_stats_win_rate`(`win_rate` ASC) USING BTREE,
  INDEX `idx_ddz_player_stats_deleted_at`(`deleted_at` ASC) USING BTREE,
  CONSTRAINT `fk_ddz_player_stats_player` FOREIGN KEY (`player_id`) REFERENCES `ddz_players` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_player_stats
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_players
-- ----------------------------
DROP TABLE IF EXISTS `ddz_players`;
CREATE TABLE `ddz_players`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '玩家ID',
  `username` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户名',
  `nickname` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '昵称',
  `avatar` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '头像URL',
  `gender` tinyint UNSIGNED NULL DEFAULT 0 COMMENT '性别:0-未知,1-男,2-女',
  `gold` bigint NOT NULL DEFAULT 0 COMMENT '金币余额',
  `diamond` bigint NOT NULL DEFAULT 0 COMMENT '钻石余额',
  `experience` bigint NOT NULL DEFAULT 0 COMMENT '经验值',
  `level` bigint NOT NULL DEFAULT 1 COMMENT '等级',
  `v_ip_level` bigint NOT NULL DEFAULT 0 COMMENT 'VIP等级',
  `win_count` bigint NOT NULL DEFAULT 0 COMMENT '胜场数',
  `lose_count` bigint NOT NULL DEFAULT 0 COMMENT '负场数',
  `landlord_count` bigint NOT NULL DEFAULT 0 COMMENT '当地主次数',
  `farmer_count` bigint NOT NULL DEFAULT 0 COMMENT '当农民次数',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态:0-禁用,1-正常,2-封禁',
  `last_login_at` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '最后登录IP',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` datetime NULL DEFAULT NULL COMMENT '删除时间',
  `vip_level` bigint NOT NULL DEFAULT 0 COMMENT 'VIP等级',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_ddz_players_nickname`(`nickname` ASC) USING BTREE,
  UNIQUE INDEX `idx_ddz_players_username`(`username` ASC) USING BTREE,
  INDEX `idx_ddz_players_status`(`status` ASC) USING BTREE,
  INDEX `idx_ddz_players_deleted_at`(`deleted_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_players
-- ----------------------------
INSERT INTO `ddz_players` VALUES (1, 'phone_13800138000', '用户80000147', '', 0, 1000, 0, 0, 1, 0, 0, 0, 0, 0, 1, '2026-04-25 12:10:45', '[::1]', '2026-04-25 12:10:45', '2026-04-25 12:10:45', NULL, 0);
INSERT INTO `ddz_players` VALUES (2, 'phone_13800138001', '用户80018735', '', 0, 1000, 0, 0, 1, 0, 0, 0, 0, 0, 1, '2026-04-25 12:11:15', '[::1]', '2026-04-25 12:11:06', '2026-04-25 12:11:15', NULL, 0);
INSERT INTO `ddz_players` VALUES (3, 'phone_13800138003', '用户80032758', '', 0, 1000, 0, 0, 1, 0, 0, 0, 0, 0, 1, '2026-04-25 12:11:20', '[::1]', '2026-04-25 12:11:20', '2026-04-25 12:11:20', NULL, 0);
INSERT INTO `ddz_players` VALUES (4, 'phone_15888888888', '用户88884491', '', 0, 1000, 0, 0, 1, 0, 0, 0, 0, 0, 1, '2026-04-25 19:22:12', '127.0.0.1', '2026-04-25 15:53:53', '2026-04-25 19:22:12', NULL, 0);
INSERT INTO `ddz_players` VALUES (5, 'phone_15208384146', '用户41461120', '', 0, 1000, 0, 0, 1, 0, 0, 0, 0, 0, 1, '2026-04-25 17:17:11', '127.0.0.1', '2026-04-25 16:05:56', '2026-04-25 17:17:11', NULL, 0);

-- ----------------------------
-- Table structure for ddz_room_config
-- ----------------------------
DROP TABLE IF EXISTS `ddz_room_config`;
CREATE TABLE `ddz_room_config`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `room_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间名称',
  `room_type` tinyint NOT NULL DEFAULT 1 COMMENT '房间类型:1-普通场,2-高级场,3-富豪场,4-至尊场',
  `base_score` bigint NOT NULL DEFAULT 1 COMMENT '底分',
  `multiplier` bigint NOT NULL DEFAULT 1 COMMENT '初始倍数',
  `min_gold` bigint NOT NULL DEFAULT 0 COMMENT '最低入场金币',
  `max_gold` bigint NOT NULL DEFAULT 0 COMMENT '最高入场金币(0表示无限制)',
  `bot_enabled` tinyint NOT NULL DEFAULT 1 COMMENT '是否允许机器人:0-否,1-是',
  `bot_count` bigint NOT NULL DEFAULT 0 COMMENT '房间机器人数量',
  `fee_rate` decimal(5, 4) NOT NULL DEFAULT 0.0000 COMMENT '手续费率',
  `max_round` bigint NOT NULL DEFAULT 20 COMMENT '最大回合数',
  `timeout_seconds` bigint NOT NULL DEFAULT 30 COMMENT '操作超时时间(秒)',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态:0-关闭,1-开启',
  `sort_order` bigint NOT NULL DEFAULT 0 COMMENT '排序权重',
  `description` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '房间描述',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` datetime NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_ddz_room_config_room_type`(`room_type` ASC) USING BTREE,
  INDEX `idx_ddz_room_config_status`(`status` ASC) USING BTREE,
  INDEX `idx_ddz_room_config_deleted_at`(`deleted_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_room_config
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_room_configs
-- ----------------------------
DROP TABLE IF EXISTS `ddz_room_configs`;
CREATE TABLE `ddz_room_configs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` datetime(3) NULL DEFAULT NULL,
  `updated_at` datetime(3) NULL DEFAULT NULL,
  `deleted_at` datetime(3) NULL DEFAULT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '房间名称',
  `room_type` bigint NULL DEFAULT NULL COMMENT '房间类型 1普通 2VIP',
  `room_level` bigint NULL DEFAULT NULL COMMENT '房间等级',
  `base_score` bigint NULL DEFAULT NULL COMMENT '底分',
  `min_coins` bigint NULL DEFAULT NULL COMMENT '最低金币准入',
  `max_coins` bigint NULL DEFAULT NULL COMMENT '最高金币上限(0为无上限)',
  `service_fee` bigint NULL DEFAULT 0 COMMENT '服务费比例(百分比)',
  `max_multiple` bigint NULL DEFAULT 20 COMMENT '最大倍数',
  `timeout` bigint NULL DEFAULT 30 COMMENT '出牌超时时间(秒)',
  `allow_spring` bigint NULL DEFAULT 1 COMMENT '是否允许春天 0否 1是',
  `allow_bomb` bigint NULL DEFAULT 1 COMMENT '是否允许炸弹 0否 1是',
  `allow_rocket` bigint NULL DEFAULT 1 COMMENT '是否允许王炸 0否 1是',
  `status` bigint NULL DEFAULT 1 COMMENT '状态 1启用 2禁用',
  `sort` bigint NULL DEFAULT 0 COMMENT '排序',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '房间描述',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_room_configs_deleted_at`(`deleted_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_room_configs
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_sms_codes
-- ----------------------------
DROP TABLE IF EXISTS `ddz_sms_codes`;
CREATE TABLE `ddz_sms_codes`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `phone` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号',
  `code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '验证码',
  `type` bigint NULL DEFAULT 1 COMMENT '类型 1登录 2注册 3绑定手机 4修改密码',
  `is_used` bigint NULL DEFAULT 0 COMMENT '是否已使用 0否 1是',
  `expire_at` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '过期时间',
  `used_at` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '使用时间',
  `ip` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '请求IP',
  `created_at` datetime(3) NULL DEFAULT NULL,
  `updated_at` datetime(3) NULL DEFAULT NULL,
  `deleted_at` datetime(3) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_sms_codes_phone`(`phone` ASC) USING BTREE,
  INDEX `idx_ddz_sms_codes_deleted_at`(`deleted_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_sms_codes
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_user_accounts
-- ----------------------------
DROP TABLE IF EXISTS `ddz_user_accounts`;
CREATE TABLE `ddz_user_accounts`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '账户ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '关联玩家ID',
  `phone` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号',
  `password` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '密码(加密存储)',
  `wx_open_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信OpenID',
  `wx_union_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信UnionID',
  `wx_session_key` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信会话密钥',
  `wx_nickname` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信昵称',
  `wx_avatar` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信头像URL',
  `login_type` bigint NULL DEFAULT 1 COMMENT '登录类型 1手机号 2微信 3游客',
  `token` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '登录Token',
  `token_expire_at` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'Token过期时间',
  `refresh_token` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '刷新Token',
  `refresh_token_expire_at` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '刷新Token过期时间',
  `device_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备ID',
  `device_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备类型 ios/android/web',
  `last_login_at` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '最后登录IP',
  `login_count` bigint NOT NULL DEFAULT 0 COMMENT '登录次数',
  `status` bigint NULL DEFAULT 1 COMMENT '状态 0禁用 1正常 2封禁',
  `created_at` datetime(3) NULL DEFAULT NULL,
  `updated_at` datetime(3) NULL DEFAULT NULL,
  `deleted_at` datetime(3) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_user_accounts_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_ddz_user_accounts_phone`(`phone` ASC) USING BTREE,
  INDEX `idx_ddz_user_accounts_wx_open_id`(`wx_open_id` ASC) USING BTREE,
  INDEX `idx_ddz_user_accounts_wx_union_id`(`wx_union_id` ASC) USING BTREE,
  INDEX `idx_ddz_user_accounts_token`(`token` ASC) USING BTREE,
  INDEX `idx_ddz_user_accounts_status`(`status` ASC) USING BTREE,
  INDEX `idx_ddz_user_accounts_deleted_at`(`deleted_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_user_accounts
-- ----------------------------
INSERT INTO `ddz_user_accounts` VALUES (1, 1, '13800138000', '', NULL, NULL, '', '', '', 1, 'FTjEHwU8zmhXdKAwCicJOhtDfiN7l8PR', '2026-05-02 12:10:45', '', NULL, '', 'Unknown', '2026-04-25 12:10:45', '[::1]', 1, 1, '2026-04-25 12:10:45.000', '2026-04-25 12:10:45.000', NULL);
INSERT INTO `ddz_user_accounts` VALUES (2, 2, '13800138001', '', NULL, NULL, '', '', '', 1, 'qA7bInyI9iVJeJ4ZTA5fjIaMrVwbFKTQ', '2026-05-02 12:11:15', '', NULL, '', 'Unknown', '2026-04-25 12:11:15', '[::1]', 2, 1, '2026-04-25 12:11:06.000', '2026-04-25 12:11:15.000', NULL);
INSERT INTO `ddz_user_accounts` VALUES (3, 3, '13800138003', '', NULL, NULL, '', '', '', 1, 'jNNq8rDPAs7MyuxqymDEJpMPlk8Fl5Nk', '2026-05-02 12:11:20', '', NULL, '', 'Unknown', '2026-04-25 12:11:20', '[::1]', 1, 1, '2026-04-25 12:11:20.000', '2026-04-25 12:11:20.000', NULL);
INSERT INTO `ddz_user_accounts` VALUES (4, 4, '15888888888', '', NULL, NULL, '', '', '', 1, 'H7gU6XTgnfW8jMHQwwFkltU3ewwS8cMb', '2026-05-02 19:22:12', '', NULL, '', 'iPhone', '2026-04-25 19:22:12', '127.0.0.1', 9, 1, '2026-04-25 15:53:53.000', '2026-04-25 19:22:12.000', NULL);
INSERT INTO `ddz_user_accounts` VALUES (5, 5, '15208384146', '', NULL, NULL, '', '', '', 1, 'V6wdWhWDGf7a2AfA5cO49CtCkE4U2dGj', '2026-05-02 17:17:11', '', NULL, 'web_1777108631556', 'Web Browser', '2026-04-25 17:17:11', '127.0.0.1', 14, 1, '2026-04-25 16:05:56.000', '2026-04-25 17:17:11.000', NULL);

-- ----------------------------
-- View structure for v_player_overall_stats
-- ----------------------------
DROP VIEW IF EXISTS `v_player_overall_stats`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_player_overall_stats` AS select `p`.`id` AS `player_id`,`p`.`nickname` AS `nickname`,`p`.`avatar` AS `avatar`,`p`.`gold` AS `gold`,`p`.`level` AS `level`,`p`.`win_count` AS `win_count`,`p`.`lose_count` AS `lose_count`,`p`.`landlord_count` AS `landlord_count`,`p`.`farmer_count` AS `farmer_count`,(case when ((`p`.`win_count` + `p`.`lose_count`) = 0) then 0 else round(((`p`.`win_count` * 100.0) / (`p`.`win_count` + `p`.`lose_count`)),2) end) AS `win_rate`,(`p`.`win_count` + `p`.`lose_count`) AS `total_games` from `ddz_players` `p` where (`p`.`deleted_at` is null);

-- ----------------------------
-- View structure for v_recent_games
-- ----------------------------
DROP VIEW IF EXISTS `v_recent_games`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_recent_games` AS select `gr`.`game_id` AS `game_id`,`gr`.`room_id` AS `room_id`,`gr`.`room_type` AS `room_type`,`rc`.`room_name` AS `room_name`,`gr`.`landlord_id` AS `landlord_id`,`p1`.`nickname` AS `landlord_nickname`,`gr`.`farmer1_id` AS `farmer1_id`,`p2`.`nickname` AS `farmer1_nickname`,`gr`.`farmer2_id` AS `farmer2_id`,`p3`.`nickname` AS `farmer2_nickname`,`gr`.`base_score` AS `base_score`,`gr`.`multiplier` AS `multiplier`,`gr`.`bomb_count` AS `bomb_count`,`gr`.`spring` AS `spring`,`gr`.`result` AS `result`,`gr`.`landlord_win_gold` AS `landlord_win_gold`,`gr`.`farmer1_win_gold` AS `farmer1_win_gold`,`gr`.`farmer2_win_gold` AS `farmer2_win_gold`,`gr`.`started_at` AS `started_at`,`gr`.`ended_at` AS `ended_at`,`gr`.`duration_seconds` AS `duration_seconds` from ((((`ddz_game_records` `gr` left join `ddz_room_config` `rc` on((`gr`.`room_type` = `rc`.`room_type`))) left join `ddz_players` `p1` on((`gr`.`landlord_id` = `p1`.`id`))) left join `ddz_players` `p2` on((`gr`.`farmer1_id` = `p2`.`id`))) left join `ddz_players` `p3` on((`gr`.`farmer2_id` = `p3`.`id`))) order by `gr`.`started_at` desc;

-- ----------------------------
-- View structure for v_user_info
-- ----------------------------
DROP VIEW IF EXISTS `v_user_info`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_user_info` AS select `ua`.`id` AS `account_id`,`ua`.`player_id` AS `player_id`,`p`.`username` AS `username`,`p`.`nickname` AS `nickname`,`p`.`avatar` AS `avatar`,`p`.`gender` AS `gender`,`p`.`gold` AS `gold`,`p`.`diamond` AS `diamond`,`p`.`experience` AS `experience`,`p`.`level` AS `level`,`p`.`vip_level` AS `vip_level`,`p`.`win_count` AS `win_count`,`p`.`lose_count` AS `lose_count`,`p`.`landlord_count` AS `landlord_count`,`p`.`farmer_count` AS `farmer_count`,`ua`.`phone` AS `phone`,`ua`.`wx_openid` AS `wx_openid`,`ua`.`wx_nickname` AS `wx_nickname`,`ua`.`wx_avatar` AS `wx_avatar`,`ua`.`login_type` AS `login_type`,`ua`.`token` AS `token`,`ua`.`token_expire_at` AS `token_expire_at`,`ua`.`last_login_at` AS `last_login_at`,`ua`.`last_login_ip` AS `last_login_ip`,`p`.`status` AS `status`,`p`.`created_at` AS `player_created_at`,`ua`.`created_at` AS `account_created_at` from (`ddz_user_accounts` `ua` left join `ddz_players` `p` on((`ua`.`player_id` = `p`.`id`))) where ((`ua`.`deleted_at` is null) and (`p`.`deleted_at` is null));

-- ----------------------------
-- Procedure structure for sp_clean_expired_sms_codes
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_clean_expired_sms_codes`;
delimiter ;;
CREATE PROCEDURE `sp_clean_expired_sms_codes`()
BEGIN
    DELETE FROM ddz_sms_codes
    WHERE expire_at < DATE_SUB(NOW(), INTERVAL 7 DAY);

    SELECT ROW_COUNT() AS deleted_count;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_clean_old_login_logs
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_clean_old_login_logs`;
delimiter ;;
CREATE PROCEDURE `sp_clean_old_login_logs`()
BEGIN
    DELETE FROM ddz_login_logs
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

    SELECT ROW_COUNT() AS deleted_count;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_update_player_stats
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_update_player_stats`;
delimiter ;;
CREATE PROCEDURE `sp_update_player_stats`(IN p_player_id BIGINT,
    IN p_stat_date DATE)
BEGIN
    DECLARE v_total_games INT DEFAULT 0;
    DECLARE v_win_games INT DEFAULT 0;
    DECLARE v_lose_games INT DEFAULT 0;
    DECLARE v_landlord_games INT DEFAULT 0;
    DECLARE v_landlord_wins INT DEFAULT 0;
    DECLARE v_farmer_games INT DEFAULT 0;
    DECLARE v_farmer_wins INT DEFAULT 0;
    DECLARE v_total_gold BIGINT DEFAULT 0;
    DECLARE v_max_win BIGINT DEFAULT 0;
    DECLARE v_max_lose BIGINT DEFAULT 0;
    DECLARE v_avg_duration INT DEFAULT 0;
    DECLARE v_win_rate DECIMAL(5,2) DEFAULT 0.00;
    
    -- 统计当天作为地主的场次
    SELECT 
        COUNT(*),
        SUM(CASE WHEN gr.result = 1 THEN 1 ELSE 0 END)
    INTO v_landlord_games, v_landlord_wins
    FROM ddz_game_records gr
    WHERE gr.landlord_id = p_player_id
    AND DATE(gr.started_at) = p_stat_date;
    
    -- 统计当天作为农民的场次
    SELECT 
        COUNT(*),
        SUM(CASE WHEN gr.result = 2 THEN 1 ELSE 0 END)
    INTO v_farmer_games, v_farmer_wins
    FROM ddz_game_records gr
    WHERE (gr.farmer1_id = p_player_id OR gr.farmer2_id = p_player_id)
    AND DATE(gr.started_at) = p_stat_date;
    
    -- 计算总场次和胜负
    SET v_total_games = v_landlord_games + v_farmer_games;
    SET v_win_games = v_landlord_wins + v_farmer_wins;
    SET v_lose_games = v_total_games - v_win_games;
    
    -- 计算胜率
    IF v_total_games > 0 THEN
        SET v_win_rate = ROUND(v_win_games * 100.0 / v_total_games, 2);
    END IF;
    
    -- 计算金币变化
    SELECT 
        COALESCE(SUM(
            CASE 
                WHEN gr.landlord_id = p_player_id THEN gr.landlord_win_gold
                WHEN gr.farmer1_id = p_player_id THEN gr.farmer1_win_gold
                ELSE gr.farmer2_win_gold
            END
        ), 0)
    INTO v_total_gold
    FROM ddz_game_records gr
    WHERE (gr.landlord_id = p_player_id OR gr.farmer1_id = p_player_id OR gr.farmer2_id = p_player_id)
    AND DATE(gr.started_at) = p_stat_date;
    
    -- 插入或更新统计记录
    INSERT INTO ddz_player_stats (
        player_id, stat_date, total_games, win_games, lose_games, win_rate,
        landlord_games, landlord_wins, farmer_games, farmer_wins,
        total_gold_change
    ) VALUES (
        p_player_id, p_stat_date, v_total_games, v_win_games, v_lose_games, v_win_rate,
        v_landlord_games, v_landlord_wins, v_farmer_games, v_farmer_wins,
        v_total_gold
    )
    ON DUPLICATE KEY UPDATE
        total_games = v_total_games,
        win_games = v_win_games,
        lose_games = v_lose_games,
        win_rate = v_win_rate,
        landlord_games = v_landlord_games,
        landlord_wins = v_landlord_wins,
        farmer_games = v_farmer_games,
        farmer_wins = v_farmer_wins,
        total_gold_change = v_total_gold,
        updated_at = CURRENT_TIMESTAMP;
END
;;
delimiter ;

-- ----------------------------
-- Event structure for evt_clean_login_logs
-- ----------------------------
DROP EVENT IF EXISTS `evt_clean_login_logs`;
delimiter ;;
CREATE EVENT `evt_clean_login_logs`
ON SCHEDULE
EVERY '1' WEEK STARTS '2026-05-01 03:00:00'
DO CALL sp_clean_old_login_logs()
;;
delimiter ;

-- ----------------------------
-- Event structure for evt_clean_sms_codes
-- ----------------------------
DROP EVENT IF EXISTS `evt_clean_sms_codes`;
delimiter ;;
CREATE EVENT `evt_clean_sms_codes`
ON SCHEDULE
EVERY '1' DAY STARTS '2026-04-25 02:00:00'
DO CALL sp_clean_expired_sms_codes()
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
