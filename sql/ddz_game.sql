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

 Date: 06/05/2026 15:19:46
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ddz_ad_rewards
-- ----------------------------
DROP TABLE IF EXISTS `ddz_ad_rewards`;
CREATE TABLE `ddz_ad_rewards`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `ad_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '广告类型:bean/arena_coin',
  `reward_amount` bigint NOT NULL COMMENT '奖励数量',
  `currency_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '货币类型:gold/arena_coin',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_ad_rewards_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_ddz_ad_rewards_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_ad_rewards
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_arena_coin_logs
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_coin_logs`;
CREATE TABLE `ddz_arena_coin_logs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `change_amount` bigint NOT NULL COMMENT '变化金额(正数为获得,负数为消耗)',
  `balance_after` bigint NOT NULL COMMENT '变化后余额',
  `change_type` tinyint NOT NULL COMMENT '变化类型:1-游戏结算,2-系统赠送,3-兑换,4-其他',
  `related_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '关联ID(游戏ID等)',
  `remark` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_change_type`(`change_type` ASC) USING BTREE,
  INDEX `idx_ddz_arena_coin_logs_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_ddz_arena_coin_logs_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '竞技币流水记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_coin_logs
-- ----------------------------
INSERT INTO `ddz_arena_coin_logs` VALUES (1, 4, 1000, 1000, 4, '', '增加竞技币', '2026-05-06 09:43:54');

-- ----------------------------
-- Table structure for ddz_arena_coin_logs_202604
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_coin_logs_202604`;
CREATE TABLE `ddz_arena_coin_logs_202604`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `change_amount` bigint NOT NULL COMMENT '变化金额',
  `balance_after` bigint NOT NULL COMMENT '变化后余额',
  `change_type` tinyint UNSIGNED NOT NULL COMMENT '变化类型',
  `related_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '关联ID',
  `remark` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技币流水表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_coin_logs_202604
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_arena_coin_logs_202605
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_coin_logs_202605`;
CREATE TABLE `ddz_arena_coin_logs_202605`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `change_amount` bigint NOT NULL COMMENT '变化金额',
  `balance_after` bigint NOT NULL COMMENT '变化后余额',
  `change_type` tinyint UNSIGNED NOT NULL COMMENT '变化类型',
  `related_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '关联ID',
  `remark` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技币流水表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_coin_logs_202605
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_arena_coin_logs_202606
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_coin_logs_202606`;
CREATE TABLE `ddz_arena_coin_logs_202606`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `change_amount` bigint NOT NULL COMMENT '变化金额',
  `balance_after` bigint NOT NULL COMMENT '变化后余额',
  `change_type` tinyint UNSIGNED NOT NULL COMMENT '变化类型',
  `related_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '关联ID',
  `remark` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技币流水表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_coin_logs_202606
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_arena_match_config
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_match_config`;
CREATE TABLE `ddz_arena_match_config`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `room_config_id` bigint UNSIGNED NOT NULL COMMENT '关联房间配置ID',
  `match_time_ranges` json NULL COMMENT '开赛时间段',
  `match_round_duration` int NOT NULL DEFAULT 5 COMMENT '每场时长(分钟)',
  `match_round_count` int NOT NULL DEFAULT 3 COMMENT '比赛轮次',
  `signup_fee` bigint NOT NULL DEFAULT 0 COMMENT '报名费(竞技币)',
  `max_players` int NOT NULL DEFAULT 9 COMMENT '最大参赛人数',
  `min_players` int NOT NULL DEFAULT 3 COMMENT '最小开赛人数',
  `champion_reward_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '冠军奖励ID',
  `runner_up_reward_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '亚军奖励ID',
  `third_reward_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '季军奖励ID',
  `signup_start_time` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '00:00' COMMENT '报名开始时间',
  `signup_end_time` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '23:59' COMMENT '报名结束时间',
  `auto_start` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '是否自动开赛:0-否,1-是',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态:0-关闭,1-开启',
  `description` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '比赛描述',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` datetime NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_room_config_id`(`room_config_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_deleted_at`(`deleted_at` ASC) USING BTREE,
  INDEX `idx_ddz_arena_match_config_room_config_id`(`room_config_id` ASC) USING BTREE,
  INDEX `idx_ddz_arena_match_config_status`(`status` ASC) USING BTREE,
  INDEX `idx_ddz_arena_match_config_deleted_at`(`deleted_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场比赛配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_match_config
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_arena_participations
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_participations`;
CREATE TABLE `ddz_arena_participations`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `session_id` bigint UNSIGNED NOT NULL COMMENT '比赛会话ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `signup_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
  `signup_fee` bigint NOT NULL DEFAULT 0 COMMENT '报名费(竞技币)',
  `match_coin` bigint NOT NULL DEFAULT 0 COMMENT '比赛金币(临时，仅用于排名)',
  `current_round` int NOT NULL DEFAULT 0 COMMENT '当前所在轮次',
  `rank` int NULL DEFAULT NULL COMMENT '最终排名',
  `is_eliminated` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否淘汰:0-否,1-是',
  `eliminated_round` int NULL DEFAULT NULL COMMENT '淘汰轮次',
  `eliminated_reason` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '淘汰原因:lose-输掉比赛,disconnect-掉线,forfeit-弃权',
  `is_champion` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否冠军',
  `is_online` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '是否在线:0-离线,1-在线',
  `last_table_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '最后所在桌号',
  `reward_claimed` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '奖励是否已领取:0-否,1-是',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_session_player`(`session_id` ASC, `player_id` ASC) USING BTREE,
  INDEX `idx_session_id`(`session_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_rank`(`rank` ASC) USING BTREE,
  INDEX `idx_match_coin`(`match_coin` ASC) USING BTREE,
  INDEX `idx_participations_session_rank`(`session_id` ASC, `rank` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '参赛记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_participations
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_arena_period_players
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_period_players`;
CREATE TABLE `ddz_arena_period_players`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `period_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '期号',
  `period_id` bigint UNSIGNED NOT NULL COMMENT '期号记录ID',
  `room_id` bigint UNSIGNED NOT NULL COMMENT '房间ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `signup_time` datetime NOT NULL COMMENT '报名时间',
  `signup_order` bigint NOT NULL DEFAULT 0 COMMENT '报名顺序',
  `signup_fee` bigint NOT NULL DEFAULT 0 COMMENT '报名费',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态:1-正常,2-取消,3-超时未进入',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_arena_period_players_period_no`(`period_no` ASC) USING BTREE,
  INDEX `idx_ddz_arena_period_players_period_id`(`period_id` ASC) USING BTREE,
  INDEX `idx_ddz_arena_period_players_room_id`(`room_id` ASC) USING BTREE,
  INDEX `idx_ddz_arena_period_players_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_ddz_arena_period_players_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_period_players
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_arena_period_players_202605
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_period_players_202605`;
CREATE TABLE `ddz_arena_period_players_202605`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `period_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '期号',
  `period_id` bigint UNSIGNED NOT NULL COMMENT '期号记录ID',
  `room_id` bigint UNSIGNED NOT NULL COMMENT '房间ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `signup_time` datetime NOT NULL COMMENT '报名时间',
  `signup_order` int NOT NULL DEFAULT 0 COMMENT '报名顺序',
  `signup_fee` bigint NOT NULL DEFAULT 0 COMMENT '报名费',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态:1-正常,2-取消,3-超时未进入',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_period_no`(`period_no` ASC) USING BTREE,
  INDEX `idx_period_id`(`period_id` ASC) USING BTREE,
  INDEX `idx_room_id`(`room_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场期号玩家表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_period_players_202605
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_arena_period_players_202606
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_period_players_202606`;
CREATE TABLE `ddz_arena_period_players_202606`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `period_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '期号',
  `period_id` bigint UNSIGNED NOT NULL COMMENT '期号记录ID',
  `room_id` bigint UNSIGNED NOT NULL COMMENT '房间ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `signup_time` datetime NOT NULL COMMENT '报名时间',
  `signup_order` int NOT NULL DEFAULT 0 COMMENT '报名顺序',
  `signup_fee` bigint NOT NULL DEFAULT 0 COMMENT '报名费',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态:1-正常,2-取消,3-超时未进入',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_period_no`(`period_no` ASC) USING BTREE,
  INDEX `idx_period_id`(`period_id` ASC) USING BTREE,
  INDEX `idx_room_id`(`room_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场期号玩家表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_period_players_202606
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_arena_periods
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_periods`;
CREATE TABLE `ddz_arena_periods`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `period_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '期号(格式J202605060001,14位)',
  `room_id` bigint UNSIGNED NOT NULL COMMENT '房间ID',
  `room_config_id` bigint UNSIGNED NOT NULL COMMENT '房间配置ID',
  `period_index` bigint NOT NULL DEFAULT 1 COMMENT '当日场次号(1-9999)',
  `start_time` datetime NOT NULL COMMENT '期号开始时间',
  `signup_start_time` datetime NOT NULL COMMENT '报名开始时间',
  `signup_end_time` datetime NOT NULL COMMENT '报名截止时间',
  `end_time` datetime NOT NULL COMMENT '期号结束时间',
  `total_signup` bigint NOT NULL DEFAULT 0 COMMENT '报名总人数',
  `total_cancel` bigint NOT NULL DEFAULT 0 COMMENT '取消报名人数',
  `final_players` bigint NOT NULL DEFAULT 0 COMMENT '最终参赛人数',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '状态',
  `session_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '关联会话ID(开赛后填写)',
  `processed_at` datetime NULL DEFAULT NULL COMMENT '数据处理完成时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` datetime NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_ddz_arena_periods_period_no`(`period_no` ASC) USING BTREE,
  INDEX `idx_ddz_arena_periods_room_id`(`room_id` ASC) USING BTREE,
  INDEX `idx_ddz_arena_periods_room_config_id`(`room_config_id` ASC) USING BTREE,
  INDEX `idx_ddz_arena_periods_status`(`status` ASC) USING BTREE,
  INDEX `idx_ddz_arena_periods_deleted_at`(`deleted_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 112 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_periods
-- ----------------------------
INSERT INTO `ddz_arena_periods` VALUES (1, 'M2605050091', 1, 1, 91, '2026-05-05 18:30:00', '2026-05-05 18:31:00', '2026-05-05 18:35:00', '2026-05-05 18:35:00', 0, 0, 0, 2, NULL, '2026-05-05 18:35:00', '2026-05-05 18:30:00', '2026-05-05 18:35:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (2, 'M2605050092', 1, 1, 92, '2026-05-05 18:35:00', '2026-05-05 18:36:00', '2026-05-05 18:40:00', '2026-05-05 18:40:00', 0, 0, 0, 2, NULL, '2026-05-05 18:40:01', '2026-05-05 18:35:00', '2026-05-05 18:40:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (3, 'M2605050093', 1, 1, 93, '2026-05-05 18:40:00', '2026-05-05 18:41:00', '2026-05-05 18:45:00', '2026-05-05 18:45:00', 0, 0, 0, 2, NULL, '2026-05-05 18:45:01', '2026-05-05 18:40:00', '2026-05-05 18:45:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (4, 'M2605050094', 1, 1, 94, '2026-05-05 18:45:00', '2026-05-05 18:46:00', '2026-05-05 18:50:00', '2026-05-05 18:50:00', 0, 0, 0, 2, NULL, '2026-05-05 18:50:01', '2026-05-05 18:45:00', '2026-05-05 18:50:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (7, 'M2605050095', 1, 1, 95, '2026-05-05 18:50:00', '2026-05-05 18:51:00', '2026-05-05 18:55:00', '2026-05-05 18:55:00', 0, 0, 0, 2, NULL, '2026-05-05 18:55:00', '2026-05-05 18:50:00', '2026-05-05 18:55:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (8, 'M2605050096', 1, 1, 96, '2026-05-05 18:55:00', '2026-05-05 18:56:00', '2026-05-05 19:00:00', '2026-05-05 19:00:00', 0, 0, 0, 1, NULL, NULL, '2026-05-05 18:55:00', '2026-05-05 18:56:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (9, 'M2605050098', 1, 1, 98, '2026-05-05 19:05:00', '2026-05-05 19:06:00', '2026-05-05 19:10:00', '2026-05-05 19:10:00', 0, 0, 0, 2, NULL, '2026-05-05 19:10:01', '2026-05-05 19:05:00', '2026-05-05 19:10:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (10, 'M2605050099', 1, 1, 99, '2026-05-05 19:10:00', '2026-05-05 19:11:00', '2026-05-05 19:15:00', '2026-05-05 19:15:00', 0, 0, 0, 2, NULL, '2026-05-05 19:15:01', '2026-05-05 19:10:00', '2026-05-05 19:15:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (11, 'M2605050100', 1, 1, 100, '2026-05-05 19:15:00', '2026-05-05 19:16:00', '2026-05-05 19:20:00', '2026-05-05 19:20:00', 0, 0, 0, 2, NULL, '2026-05-05 19:20:00', '2026-05-05 19:15:00', '2026-05-05 19:20:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (12, 'M2605050101', 1, 1, 101, '2026-05-05 19:20:00', '2026-05-05 19:21:00', '2026-05-05 19:25:00', '2026-05-05 19:25:00', 0, 0, 0, 2, NULL, '2026-05-05 19:25:00', '2026-05-05 19:20:00', '2026-05-05 19:25:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (13, 'M2605050102', 1, 1, 102, '2026-05-05 19:25:00', '2026-05-05 19:26:00', '2026-05-05 19:30:00', '2026-05-05 19:30:00', 0, 0, 0, 2, NULL, '2026-05-05 19:30:01', '2026-05-05 19:25:00', '2026-05-05 19:30:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (14, 'M2605050103', 1, 1, 103, '2026-05-05 19:30:00', '2026-05-05 19:31:00', '2026-05-05 19:35:00', '2026-05-05 19:35:00', 0, 0, 0, 2, NULL, '2026-05-05 19:35:00', '2026-05-05 19:30:00', '2026-05-05 19:35:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (15, 'M2605050104', 1, 1, 104, '2026-05-05 19:35:00', '2026-05-05 19:36:00', '2026-05-05 19:40:00', '2026-05-05 19:40:00', 0, 0, 0, 2, NULL, '2026-05-05 19:40:01', '2026-05-05 19:35:00', '2026-05-05 19:40:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (16, 'M2605050105', 1, 1, 105, '2026-05-05 19:40:00', '2026-05-05 19:41:00', '2026-05-05 19:45:00', '2026-05-05 19:45:00', 0, 0, 0, 2, NULL, '2026-05-05 19:45:00', '2026-05-05 19:40:00', '2026-05-05 19:45:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (19, 'M2605050106', 1, 1, 106, '2026-05-05 19:45:00', '2026-05-05 19:46:00', '2026-05-05 19:50:00', '2026-05-05 19:50:00', 0, 0, 0, 2, NULL, '2026-05-05 19:50:00', '2026-05-05 19:45:00', '2026-05-05 19:50:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (20, 'M2605050107', 1, 1, 107, '2026-05-05 19:50:00', '2026-05-05 19:51:00', '2026-05-05 19:55:00', '2026-05-05 19:55:00', 0, 0, 0, 2, NULL, '2026-05-05 19:55:01', '2026-05-05 19:50:00', '2026-05-05 19:55:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (21, 'M2605050108', 1, 1, 108, '2026-05-05 19:55:00', '2026-05-05 19:56:00', '2026-05-05 20:00:00', '2026-05-05 20:00:00', 0, 0, 0, 2, NULL, '2026-05-05 20:00:01', '2026-05-05 19:55:00', '2026-05-05 20:00:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (22, 'M2605050109', 1, 1, 109, '2026-05-05 20:00:00', '2026-05-05 20:01:00', '2026-05-05 20:05:00', '2026-05-05 20:05:00', 0, 0, 0, 2, NULL, '2026-05-05 20:05:00', '2026-05-05 20:00:00', '2026-05-05 20:05:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (23, 'M2605050110', 1, 1, 110, '2026-05-05 20:05:00', '2026-05-05 20:06:00', '2026-05-05 20:10:00', '2026-05-05 20:10:00', 0, 0, 0, 2, NULL, '2026-05-05 20:10:01', '2026-05-05 20:05:00', '2026-05-05 20:10:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (24, 'M2605050111', 1, 1, 111, '2026-05-05 20:10:00', '2026-05-05 20:11:00', '2026-05-05 20:15:00', '2026-05-05 20:15:00', 0, 0, 0, 2, NULL, '2026-05-05 20:15:00', '2026-05-05 20:10:00', '2026-05-05 20:15:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (25, 'M2605050112', 1, 1, 112, '2026-05-05 20:15:00', '2026-05-05 20:16:00', '2026-05-05 20:20:00', '2026-05-05 20:20:00', 0, 0, 0, 2, NULL, '2026-05-05 20:20:01', '2026-05-05 20:15:00', '2026-05-05 20:20:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (26, 'M2605050113', 1, 1, 113, '2026-05-05 20:20:00', '2026-05-05 20:21:00', '2026-05-05 20:25:00', '2026-05-05 20:25:00', 0, 0, 0, 2, NULL, '2026-05-05 20:25:01', '2026-05-05 20:20:00', '2026-05-05 20:25:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (27, 'M2605050114', 1, 1, 114, '2026-05-05 20:25:00', '2026-05-05 20:26:00', '2026-05-05 20:30:00', '2026-05-05 20:30:00', 0, 0, 0, 2, NULL, '2026-05-05 20:30:01', '2026-05-05 20:25:00', '2026-05-05 20:30:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (28, 'M2605050115', 1, 1, 115, '2026-05-05 20:30:00', '2026-05-05 20:31:00', '2026-05-05 20:35:00', '2026-05-05 20:35:00', 0, 0, 0, 2, NULL, '2026-05-05 20:35:00', '2026-05-05 20:30:00', '2026-05-05 20:35:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (29, 'M2605050116', 1, 1, 116, '2026-05-05 20:35:00', '2026-05-05 20:36:00', '2026-05-05 20:40:00', '2026-05-05 20:40:00', 0, 0, 0, 2, NULL, '2026-05-05 20:40:01', '2026-05-05 20:35:00', '2026-05-05 20:40:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (30, 'M2605050117', 1, 1, 117, '2026-05-05 20:40:00', '2026-05-05 20:41:00', '2026-05-05 20:45:00', '2026-05-05 20:45:00', 0, 0, 0, 2, NULL, '2026-05-05 20:45:00', '2026-05-05 20:40:00', '2026-05-05 20:45:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (31, 'M2605050118', 1, 1, 118, '2026-05-05 20:45:00', '2026-05-05 20:46:00', '2026-05-05 20:50:00', '2026-05-05 20:50:00', 0, 0, 0, 2, NULL, '2026-05-05 20:50:01', '2026-05-05 20:45:00', '2026-05-05 20:50:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (32, 'M2605050119', 1, 1, 119, '2026-05-05 20:50:00', '2026-05-05 20:51:00', '2026-05-05 20:55:00', '2026-05-05 20:55:00', 0, 0, 0, 2, NULL, '2026-05-05 20:55:00', '2026-05-05 20:50:00', '2026-05-05 20:55:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (33, 'M2605050120', 1, 1, 120, '2026-05-05 20:55:00', '2026-05-05 20:56:00', '2026-05-05 21:00:00', '2026-05-05 21:00:00', 0, 0, 0, 2, NULL, '2026-05-05 21:00:01', '2026-05-05 20:55:00', '2026-05-05 21:00:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (34, 'M2605050121', 1, 1, 121, '2026-05-05 21:00:00', '2026-05-05 21:01:00', '2026-05-05 21:05:00', '2026-05-05 21:05:00', 0, 0, 0, 2, NULL, '2026-05-05 21:05:00', '2026-05-05 21:00:00', '2026-05-05 21:05:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (35, 'M2605050122', 1, 1, 122, '2026-05-05 21:05:00', '2026-05-05 21:06:00', '2026-05-05 21:10:00', '2026-05-05 21:10:00', 0, 0, 0, 2, NULL, '2026-05-05 21:10:01', '2026-05-05 21:05:00', '2026-05-05 21:10:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (36, 'M2605050123', 1, 1, 123, '2026-05-05 21:10:00', '2026-05-05 21:11:00', '2026-05-05 21:15:00', '2026-05-05 21:15:00', 0, 0, 0, 2, NULL, '2026-05-05 21:15:00', '2026-05-05 21:10:00', '2026-05-05 21:15:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (37, 'M2605050124', 1, 1, 124, '2026-05-05 21:15:00', '2026-05-05 21:16:00', '2026-05-05 21:20:00', '2026-05-05 21:20:00', 0, 0, 0, 2, NULL, '2026-05-05 21:20:00', '2026-05-05 21:15:00', '2026-05-05 21:20:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (38, 'M2605050125', 1, 1, 125, '2026-05-05 21:20:00', '2026-05-05 21:21:00', '2026-05-05 21:25:00', '2026-05-05 21:25:00', 0, 0, 0, 2, NULL, '2026-05-05 21:25:00', '2026-05-05 21:20:00', '2026-05-05 21:25:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (39, 'M2605050126', 1, 1, 126, '2026-05-05 21:25:00', '2026-05-05 21:26:00', '2026-05-05 21:30:00', '2026-05-05 21:30:00', 0, 0, 0, 2, NULL, '2026-05-05 21:30:00', '2026-05-05 21:25:00', '2026-05-05 21:30:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (40, 'M2605050127', 1, 1, 127, '2026-05-05 21:30:00', '2026-05-05 21:31:00', '2026-05-05 21:35:00', '2026-05-05 21:35:00', 0, 0, 0, 2, NULL, '2026-05-05 21:35:00', '2026-05-05 21:30:00', '2026-05-05 21:35:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (41, 'M2605050128', 1, 1, 128, '2026-05-05 21:35:00', '2026-05-05 21:36:00', '2026-05-05 21:40:00', '2026-05-05 21:40:00', 0, 0, 0, 2, NULL, '2026-05-05 21:40:00', '2026-05-05 21:35:00', '2026-05-05 21:40:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (42, 'M2605050129', 1, 1, 129, '2026-05-05 21:40:00', '2026-05-05 21:41:00', '2026-05-05 21:45:00', '2026-05-05 21:45:00', 0, 0, 0, 2, NULL, '2026-05-05 21:45:00', '2026-05-05 21:40:00', '2026-05-05 21:45:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (43, 'M2605050130', 1, 1, 130, '2026-05-05 21:45:00', '2026-05-05 21:46:00', '2026-05-05 21:50:00', '2026-05-05 21:50:00', 0, 0, 0, 2, NULL, '2026-05-05 21:50:00', '2026-05-05 21:45:00', '2026-05-05 21:50:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (44, 'M2605050131', 1, 1, 131, '2026-05-05 21:50:00', '2026-05-05 21:51:00', '2026-05-05 21:55:00', '2026-05-05 21:55:00', 0, 0, 0, 2, NULL, '2026-05-05 21:55:01', '2026-05-05 21:50:00', '2026-05-05 21:55:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (45, 'M2605050132', 1, 1, 132, '2026-05-05 21:55:00', '2026-05-05 21:56:00', '2026-05-05 22:00:00', '2026-05-05 22:00:00', 0, 0, 0, 2, NULL, '2026-05-05 22:00:01', '2026-05-05 21:55:00', '2026-05-05 22:00:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (46, 'M2605050133', 1, 1, 133, '2026-05-05 22:00:00', '2026-05-05 22:01:00', '2026-05-05 22:05:00', '2026-05-05 22:05:00', 0, 0, 0, 2, NULL, '2026-05-05 22:05:01', '2026-05-05 22:00:00', '2026-05-05 22:05:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (47, 'M2605050134', 1, 1, 134, '2026-05-05 22:05:00', '2026-05-05 22:06:00', '2026-05-05 22:10:00', '2026-05-05 22:10:00', 0, 0, 0, 2, NULL, '2026-05-05 22:10:01', '2026-05-05 22:05:00', '2026-05-05 22:10:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (48, 'M2605050135', 1, 1, 135, '2026-05-05 22:10:00', '2026-05-05 22:11:00', '2026-05-05 22:15:00', '2026-05-05 22:15:00', 0, 0, 0, 2, NULL, '2026-05-05 22:15:01', '2026-05-05 22:10:00', '2026-05-05 22:15:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (49, 'M2605050136', 1, 1, 136, '2026-05-05 22:15:00', '2026-05-05 22:16:00', '2026-05-05 22:20:00', '2026-05-05 22:20:00', 0, 0, 0, 2, NULL, '2026-05-05 22:20:01', '2026-05-05 22:15:00', '2026-05-05 22:20:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (50, 'M2605050137', 1, 1, 137, '2026-05-05 22:20:00', '2026-05-05 22:21:00', '2026-05-05 22:25:00', '2026-05-05 22:25:00', 0, 0, 0, 2, NULL, '2026-05-05 22:25:01', '2026-05-05 22:20:00', '2026-05-05 22:25:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (51, 'M2605050138', 1, 1, 138, '2026-05-05 22:25:00', '2026-05-05 22:26:00', '2026-05-05 22:30:00', '2026-05-05 22:30:00', 0, 0, 0, 2, NULL, '2026-05-05 22:30:01', '2026-05-05 22:25:00', '2026-05-05 22:30:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (52, 'M2605050139', 1, 1, 139, '2026-05-05 22:30:00', '2026-05-05 22:31:00', '2026-05-05 22:35:00', '2026-05-05 22:35:00', 0, 0, 0, 2, NULL, '2026-05-05 22:35:01', '2026-05-05 22:30:00', '2026-05-05 22:35:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (53, 'M2605050140', 1, 1, 140, '2026-05-05 22:35:00', '2026-05-05 22:36:00', '2026-05-05 22:40:00', '2026-05-05 22:40:00', 0, 0, 0, 2, NULL, '2026-05-05 22:40:01', '2026-05-05 22:35:00', '2026-05-05 22:40:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (54, 'M2605050141', 1, 1, 141, '2026-05-05 22:40:00', '2026-05-05 22:41:00', '2026-05-05 22:45:00', '2026-05-05 22:45:00', 0, 0, 0, 2, NULL, '2026-05-05 22:45:01', '2026-05-05 22:40:00', '2026-05-05 22:45:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (55, 'M2605050142', 1, 1, 142, '2026-05-05 22:45:00', '2026-05-05 22:46:00', '2026-05-05 22:50:00', '2026-05-05 22:50:00', 0, 0, 0, 2, NULL, '2026-05-05 22:50:01', '2026-05-05 22:45:00', '2026-05-05 22:50:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (56, 'M2605050143', 1, 1, 143, '2026-05-05 22:50:00', '2026-05-05 22:51:00', '2026-05-05 22:55:00', '2026-05-05 22:55:00', 0, 0, 0, 2, NULL, '2026-05-05 22:55:01', '2026-05-05 22:50:00', '2026-05-05 22:55:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (57, 'M2605050144', 1, 1, 144, '2026-05-05 22:55:00', '2026-05-05 22:56:00', '2026-05-05 23:00:00', '2026-05-05 23:00:00', 0, 0, 0, 2, NULL, '2026-05-05 23:00:01', '2026-05-05 22:55:00', '2026-05-05 23:00:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (58, 'M2605050145', 1, 1, 145, '2026-05-05 23:00:00', '2026-05-05 23:01:00', '2026-05-05 23:05:00', '2026-05-05 23:05:00', 0, 0, 0, 2, NULL, '2026-05-05 23:05:01', '2026-05-05 23:00:00', '2026-05-05 23:05:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (59, 'M2605050146', 1, 1, 146, '2026-05-05 23:05:00', '2026-05-05 23:06:00', '2026-05-05 23:10:00', '2026-05-05 23:10:00', 0, 0, 0, 2, NULL, '2026-05-05 23:10:01', '2026-05-05 23:05:00', '2026-05-05 23:10:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (60, 'M2605050147', 1, 1, 147, '2026-05-05 23:10:00', '2026-05-05 23:11:00', '2026-05-05 23:15:00', '2026-05-05 23:15:00', 0, 0, 0, 2, NULL, '2026-05-05 23:15:01', '2026-05-05 23:10:00', '2026-05-05 23:15:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (61, 'M2605050148', 1, 1, 148, '2026-05-05 23:15:00', '2026-05-05 23:16:00', '2026-05-05 23:20:00', '2026-05-05 23:20:00', 0, 0, 0, 2, NULL, '2026-05-05 23:20:01', '2026-05-05 23:15:00', '2026-05-05 23:20:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (62, 'M2605050149', 1, 1, 149, '2026-05-05 23:20:00', '2026-05-05 23:21:00', '2026-05-05 23:25:00', '2026-05-05 23:25:00', 0, 0, 0, 2, NULL, '2026-05-05 23:25:01', '2026-05-05 23:20:00', '2026-05-05 23:25:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (63, 'M2605050150', 1, 1, 150, '2026-05-05 23:25:00', '2026-05-05 23:26:00', '2026-05-05 23:30:00', '2026-05-05 23:30:00', 0, 0, 0, 2, NULL, '2026-05-05 23:30:01', '2026-05-05 23:25:00', '2026-05-05 23:30:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (64, 'M2605050151', 1, 1, 151, '2026-05-05 23:30:00', '2026-05-05 23:31:00', '2026-05-05 23:35:00', '2026-05-05 23:35:00', 0, 0, 0, 2, NULL, '2026-05-05 23:35:01', '2026-05-05 23:30:00', '2026-05-05 23:35:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (65, 'M2605050152', 1, 1, 152, '2026-05-05 23:35:00', '2026-05-05 23:36:00', '2026-05-05 23:40:00', '2026-05-05 23:40:00', 0, 0, 0, 2, NULL, '2026-05-05 23:40:01', '2026-05-05 23:35:00', '2026-05-05 23:40:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (66, 'M2605050153', 1, 1, 153, '2026-05-05 23:40:00', '2026-05-05 23:41:00', '2026-05-05 23:45:00', '2026-05-05 23:45:00', 0, 0, 0, 2, NULL, '2026-05-05 23:45:01', '2026-05-05 23:40:00', '2026-05-05 23:45:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (67, 'M2605050154', 1, 1, 154, '2026-05-05 23:45:00', '2026-05-05 23:46:00', '2026-05-05 23:50:00', '2026-05-05 23:50:00', 0, 0, 0, 2, NULL, '2026-05-05 23:50:01', '2026-05-05 23:45:00', '2026-05-05 23:50:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (68, 'M2605050155', 1, 1, 155, '2026-05-05 23:50:00', '2026-05-05 23:51:00', '2026-05-05 23:55:00', '2026-05-05 23:55:00', 0, 0, 0, 1, NULL, NULL, '2026-05-05 23:50:00', '2026-05-05 23:51:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (69, 'H2605060008', 2, 2, 8, '2026-05-06 10:35:00', '2026-05-06 10:36:00', '2026-05-06 10:40:00', '2026-05-06 10:40:00', 0, 0, 0, 2, NULL, '2026-05-06 10:40:01', '2026-05-06 10:35:00', '2026-05-06 10:40:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (70, 'M2605060001', 1, 1, 1, '2026-05-06 10:40:00', '2026-05-06 10:41:00', '2026-05-06 10:45:00', '2026-05-06 10:45:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 10:40:00', '2026-05-06 10:41:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (71, 'H2605060009', 2, 2, 9, '2026-05-06 10:40:00', '2026-05-06 10:41:00', '2026-05-06 10:45:00', '2026-05-06 10:45:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 10:40:00', '2026-05-06 10:41:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (72, 'M202605060003', 1, 1, 3, '2026-05-06 10:50:00', '2026-05-06 10:51:00', '2026-05-06 10:55:00', '2026-05-06 10:55:00', 0, 0, 0, 2, NULL, '2026-05-06 10:55:00', '2026-05-06 10:50:00', '2026-05-06 10:55:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (73, 'H202605060011', 2, 2, 11, '2026-05-06 10:50:00', '2026-05-06 10:51:00', '2026-05-06 10:55:00', '2026-05-06 10:55:00', 0, 0, 0, 2, NULL, '2026-05-06 10:55:00', '2026-05-06 10:50:00', '2026-05-06 10:55:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (74, 'M202605060004', 1, 1, 4, '2026-05-06 10:55:00', '2026-05-06 10:56:00', '2026-05-06 11:00:00', '2026-05-06 11:00:00', 0, 0, 0, 2, NULL, '2026-05-06 11:00:01', '2026-05-06 10:55:00', '2026-05-06 11:00:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (75, 'H202605060012', 2, 2, 12, '2026-05-06 10:55:00', '2026-05-06 10:56:00', '2026-05-06 11:00:00', '2026-05-06 11:00:00', 0, 0, 0, 2, NULL, '2026-05-06 11:00:01', '2026-05-06 10:55:00', '2026-05-06 11:00:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (76, 'M202605060005', 1, 1, 5, '2026-05-06 11:00:00', '2026-05-06 11:01:00', '2026-05-06 11:05:00', '2026-05-06 11:05:00', 0, 0, 0, 2, NULL, '2026-05-06 11:05:00', '2026-05-06 11:00:00', '2026-05-06 11:05:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (77, 'H202605060013', 2, 2, 13, '2026-05-06 11:00:00', '2026-05-06 11:01:00', '2026-05-06 11:05:00', '2026-05-06 11:05:00', 0, 0, 0, 2, NULL, '2026-05-06 11:05:00', '2026-05-06 11:00:00', '2026-05-06 11:05:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (78, 'M202605060006', 1, 1, 6, '2026-05-06 11:05:00', '2026-05-06 11:06:00', '2026-05-06 11:10:00', '2026-05-06 11:10:00', 0, 0, 0, 2, NULL, '2026-05-06 11:10:01', '2026-05-06 11:05:00', '2026-05-06 11:10:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (79, 'H202605060014', 2, 2, 14, '2026-05-06 11:05:00', '2026-05-06 11:06:00', '2026-05-06 11:10:00', '2026-05-06 11:10:00', 0, 0, 0, 2, NULL, '2026-05-06 11:10:01', '2026-05-06 11:05:00', '2026-05-06 11:10:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (80, 'M202605060007', 1, 1, 7, '2026-05-06 11:10:00', '2026-05-06 11:11:00', '2026-05-06 11:15:00', '2026-05-06 11:15:00', 0, 0, 0, 2, NULL, '2026-05-06 11:15:00', '2026-05-06 11:10:00', '2026-05-06 11:15:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (81, 'H202605060015', 2, 2, 15, '2026-05-06 11:10:00', '2026-05-06 11:11:00', '2026-05-06 11:15:00', '2026-05-06 11:15:00', 0, 0, 0, 2, NULL, '2026-05-06 11:15:00', '2026-05-06 11:10:00', '2026-05-06 11:15:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (82, 'M202605060008', 1, 1, 8, '2026-05-06 11:15:00', '2026-05-06 11:16:00', '2026-05-06 11:20:00', '2026-05-06 11:20:00', 0, 0, 0, 2, NULL, '2026-05-06 11:20:01', '2026-05-06 11:15:00', '2026-05-06 11:20:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (83, 'H202605060016', 2, 2, 16, '2026-05-06 11:15:00', '2026-05-06 11:16:00', '2026-05-06 11:20:00', '2026-05-06 11:20:00', 0, 0, 0, 2, NULL, '2026-05-06 11:20:01', '2026-05-06 11:15:00', '2026-05-06 11:20:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (84, 'M202605060009', 1, 1, 9, '2026-05-06 11:20:00', '2026-05-06 11:21:00', '2026-05-06 11:25:00', '2026-05-06 11:25:00', 0, 0, 0, 2, NULL, '2026-05-06 11:25:01', '2026-05-06 11:20:00', '2026-05-06 11:25:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (85, 'H202605060017', 2, 2, 17, '2026-05-06 11:20:00', '2026-05-06 11:21:00', '2026-05-06 11:25:00', '2026-05-06 11:25:00', 0, 0, 0, 2, NULL, '2026-05-06 11:25:01', '2026-05-06 11:20:00', '2026-05-06 11:25:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (86, 'M202605060010', 1, 1, 10, '2026-05-06 11:25:00', '2026-05-06 11:26:00', '2026-05-06 11:30:00', '2026-05-06 11:30:00', 0, 0, 0, 2, NULL, '2026-05-06 11:30:00', '2026-05-06 11:25:00', '2026-05-06 11:30:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (87, 'H202605060018', 2, 2, 18, '2026-05-06 11:25:00', '2026-05-06 11:26:00', '2026-05-06 11:30:00', '2026-05-06 11:30:00', 0, 0, 0, 2, NULL, '2026-05-06 11:30:00', '2026-05-06 11:25:00', '2026-05-06 11:30:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (88, 'M202605060011', 1, 1, 11, '2026-05-06 11:30:00', '2026-05-06 11:31:00', '2026-05-06 11:35:00', '2026-05-06 11:35:00', 0, 0, 0, 2, NULL, '2026-05-06 11:35:01', '2026-05-06 11:30:00', '2026-05-06 11:35:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (89, 'H202605060019', 2, 2, 19, '2026-05-06 11:30:00', '2026-05-06 11:31:00', '2026-05-06 11:35:00', '2026-05-06 11:35:00', 0, 0, 0, 2, NULL, '2026-05-06 11:35:01', '2026-05-06 11:30:00', '2026-05-06 11:35:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (90, 'M202605060012', 1, 1, 12, '2026-05-06 11:35:00', '2026-05-06 11:36:00', '2026-05-06 11:40:00', '2026-05-06 11:40:00', 0, 0, 0, 2, NULL, '2026-05-06 11:40:01', '2026-05-06 11:35:00', '2026-05-06 11:40:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (91, 'H202605060020', 2, 2, 20, '2026-05-06 11:35:00', '2026-05-06 11:36:00', '2026-05-06 11:40:00', '2026-05-06 11:40:00', 0, 0, 0, 2, NULL, '2026-05-06 11:40:01', '2026-05-06 11:35:00', '2026-05-06 11:40:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (92, 'M202605060013', 1, 1, 13, '2026-05-06 11:40:00', '2026-05-06 11:41:00', '2026-05-06 11:45:00', '2026-05-06 11:45:00', 0, 0, 0, 2, NULL, '2026-05-06 11:45:00', '2026-05-06 11:40:00', '2026-05-06 11:45:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (93, 'H202605060021', 2, 2, 21, '2026-05-06 11:40:00', '2026-05-06 11:41:00', '2026-05-06 11:45:00', '2026-05-06 11:45:00', 0, 0, 0, 2, NULL, '2026-05-06 11:45:00', '2026-05-06 11:40:00', '2026-05-06 11:45:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (94, 'M202605060014', 1, 1, 14, '2026-05-06 11:45:00', '2026-05-06 11:46:00', '2026-05-06 11:50:00', '2026-05-06 11:50:00', 0, 0, 0, 2, NULL, '2026-05-06 11:50:00', '2026-05-06 11:45:00', '2026-05-06 11:50:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (95, 'H202605060022', 2, 2, 22, '2026-05-06 11:45:00', '2026-05-06 11:46:00', '2026-05-06 11:50:00', '2026-05-06 11:50:00', 0, 0, 0, 2, NULL, '2026-05-06 11:50:00', '2026-05-06 11:45:00', '2026-05-06 11:50:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (96, 'M202605060015', 1, 1, 15, '2026-05-06 11:50:00', '2026-05-06 11:51:00', '2026-05-06 11:55:00', '2026-05-06 11:55:00', 0, 0, 0, 2, NULL, '2026-05-06 11:55:00', '2026-05-06 11:50:00', '2026-05-06 11:55:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (97, 'H202605060023', 2, 2, 23, '2026-05-06 11:50:00', '2026-05-06 11:51:00', '2026-05-06 11:55:00', '2026-05-06 11:55:00', 0, 0, 0, 2, NULL, '2026-05-06 11:55:00', '2026-05-06 11:50:00', '2026-05-06 11:55:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (98, 'M202605060016', 1, 1, 16, '2026-05-06 11:55:00', '2026-05-06 11:56:00', '2026-05-06 12:00:00', '2026-05-06 12:00:00', 0, 0, 0, 2, NULL, '2026-05-06 12:00:00', '2026-05-06 11:55:00', '2026-05-06 12:00:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (99, 'H202605060024', 2, 2, 24, '2026-05-06 11:55:00', '2026-05-06 11:56:00', '2026-05-06 12:00:00', '2026-05-06 12:00:00', 0, 0, 0, 2, NULL, '2026-05-06 12:00:00', '2026-05-06 11:55:00', '2026-05-06 12:00:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (100, 'M202605060017', 1, 1, 17, '2026-05-06 12:00:00', '2026-05-06 12:01:00', '2026-05-06 12:05:00', '2026-05-06 12:05:00', 0, 0, 0, 2, NULL, '2026-05-06 12:05:00', '2026-05-06 12:00:00', '2026-05-06 12:05:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (101, 'H202605060025', 2, 2, 25, '2026-05-06 12:00:00', '2026-05-06 12:01:00', '2026-05-06 12:05:00', '2026-05-06 12:05:00', 0, 0, 0, 2, NULL, '2026-05-06 12:05:00', '2026-05-06 12:00:01', '2026-05-06 12:05:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (102, 'M202605060018', 1, 1, 18, '2026-05-06 12:05:00', '2026-05-06 12:06:00', '2026-05-06 12:10:00', '2026-05-06 12:10:00', 0, 0, 0, 2, NULL, '2026-05-06 12:10:01', '2026-05-06 12:05:00', '2026-05-06 12:10:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (103, 'H202605060026', 2, 2, 26, '2026-05-06 12:05:00', '2026-05-06 12:06:00', '2026-05-06 12:10:00', '2026-05-06 12:10:00', 0, 0, 0, 2, NULL, '2026-05-06 12:10:01', '2026-05-06 12:05:00', '2026-05-06 12:10:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (104, 'M202605060019', 1, 1, 19, '2026-05-06 12:10:00', '2026-05-06 12:11:00', '2026-05-06 12:15:00', '2026-05-06 12:15:00', 0, 0, 0, 2, NULL, '2026-05-06 12:15:01', '2026-05-06 12:10:00', '2026-05-06 12:15:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (105, 'H202605060027', 2, 2, 27, '2026-05-06 12:10:00', '2026-05-06 12:11:00', '2026-05-06 12:15:00', '2026-05-06 12:15:00', 0, 0, 0, 2, NULL, '2026-05-06 12:15:01', '2026-05-06 12:10:00', '2026-05-06 12:15:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (106, 'M202605060020', 1, 1, 20, '2026-05-06 12:15:00', '2026-05-06 12:16:00', '2026-05-06 12:20:00', '2026-05-06 12:20:00', 0, 0, 0, 2, NULL, '2026-05-06 12:20:01', '2026-05-06 12:15:00', '2026-05-06 12:20:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (107, 'H202605060028', 2, 2, 28, '2026-05-06 12:15:00', '2026-05-06 12:16:00', '2026-05-06 12:20:00', '2026-05-06 12:20:00', 0, 0, 0, 2, NULL, '2026-05-06 12:20:01', '2026-05-06 12:15:00', '2026-05-06 12:20:01', NULL);
INSERT INTO `ddz_arena_periods` VALUES (108, 'M202605060021', 1, 1, 21, '2026-05-06 12:20:00', '2026-05-06 12:21:00', '2026-05-06 12:25:00', '2026-05-06 12:25:00', 0, 0, 0, 2, NULL, '2026-05-06 12:25:00', '2026-05-06 12:20:00', '2026-05-06 12:25:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (109, 'H202605060029', 2, 2, 29, '2026-05-06 12:20:00', '2026-05-06 12:21:00', '2026-05-06 12:25:00', '2026-05-06 12:25:00', 0, 0, 0, 2, NULL, '2026-05-06 12:25:00', '2026-05-06 12:20:00', '2026-05-06 12:25:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (110, 'M202605060022', 1, 1, 22, '2026-05-06 12:25:00', '2026-05-06 12:26:00', '2026-05-06 12:30:00', '2026-05-06 12:30:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 12:25:00', '2026-05-06 12:25:00', NULL);
INSERT INTO `ddz_arena_periods` VALUES (111, 'H202605060030', 2, 2, 30, '2026-05-06 12:25:00', '2026-05-06 12:26:00', '2026-05-06 12:30:00', '2026-05-06 12:30:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 12:25:00', '2026-05-06 12:25:00', NULL);

-- ----------------------------
-- Table structure for ddz_arena_periods_202605
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_periods_202605`;
CREATE TABLE `ddz_arena_periods_202605`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `period_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '期号(格式J202605060001,14位)',
  `room_id` bigint UNSIGNED NOT NULL COMMENT '房间ID',
  `room_config_id` bigint UNSIGNED NOT NULL COMMENT '房间配置ID',
  `period_index` int NOT NULL DEFAULT 1 COMMENT '当日场次号(1-9999)',
  `start_time` datetime NOT NULL COMMENT '期号开始时间',
  `signup_start_time` datetime NOT NULL COMMENT '报名开始时间',
  `signup_end_time` datetime NOT NULL COMMENT '报名截止时间',
  `end_time` datetime NOT NULL COMMENT '期号结束时间',
  `total_signup` int NOT NULL DEFAULT 0 COMMENT '报名总人数',
  `total_cancel` int NOT NULL DEFAULT 0 COMMENT '取消报名人数',
  `final_players` int NOT NULL DEFAULT 0 COMMENT '最终参赛人数',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '状态:0-准备中,1-报名中,2-等待开赛,3-比赛进行中,4-已结束,5-已取消',
  `session_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '关联会话ID(开赛后填写)',
  `processed_at` datetime NULL DEFAULT NULL COMMENT '数据处理完成时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_period_no`(`period_no` ASC) USING BTREE,
  INDEX `idx_room_id`(`room_id` ASC) USING BTREE,
  INDEX `idx_room_config_id`(`room_config_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_start_time`(`start_time` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 38 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场期号表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_periods_202605
-- ----------------------------
INSERT INTO `ddz_arena_periods_202605` VALUES (1, 'H202605060033', 2, 2, 33, '2026-05-06 12:40:00', '2026-05-06 12:41:00', '2026-05-06 12:45:00', '2026-05-06 12:45:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 12:40:00', '2026-05-06 12:41:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (2, 'M202605060025', 1, 1, 25, '2026-05-06 12:40:00', '2026-05-06 12:41:00', '2026-05-06 12:45:00', '2026-05-06 12:45:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 12:40:00', '2026-05-06 12:41:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (3, 'M202605060026', 1, 1, 26, '2026-05-06 12:45:00', '2026-05-06 12:46:00', '2026-05-06 12:50:00', '2026-05-06 12:50:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 12:45:00', '2026-05-06 12:46:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (4, 'H202605060034', 2, 2, 34, '2026-05-06 12:45:00', '2026-05-06 12:46:00', '2026-05-06 12:50:00', '2026-05-06 12:50:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 12:45:00', '2026-05-06 12:46:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (5, 'M202605060027', 1, 1, 27, '2026-05-06 12:50:00', '2026-05-06 12:51:00', '2026-05-06 12:55:00', '2026-05-06 12:55:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 12:50:00', '2026-05-06 12:51:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (6, 'H202605060035', 2, 2, 35, '2026-05-06 12:50:00', '2026-05-06 12:51:00', '2026-05-06 12:55:00', '2026-05-06 12:55:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 12:50:00', '2026-05-06 12:51:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (7, 'M202605060028', 1, 1, 28, '2026-05-06 12:55:00', '2026-05-06 12:56:00', '2026-05-06 13:00:00', '2026-05-06 13:00:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 12:55:00', '2026-05-06 12:56:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (8, 'M202605060029', 1, 1, 29, '2026-05-06 13:00:00', '2026-05-06 13:01:00', '2026-05-06 13:05:00', '2026-05-06 13:05:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 13:00:00', '2026-05-06 13:01:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (9, 'M202605060030', 1, 1, 30, '2026-05-06 13:05:00', '2026-05-06 13:06:00', '2026-05-06 13:10:00', '2026-05-06 13:10:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 13:05:00', '2026-05-06 13:06:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (10, 'M202605060031', 1, 1, 31, '2026-05-06 13:10:00', '2026-05-06 13:11:00', '2026-05-06 13:15:00', '2026-05-06 13:15:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 13:10:00', '2026-05-06 13:11:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (11, 'M202605060032', 1, 1, 32, '2026-05-06 13:15:00', '2026-05-06 13:16:00', '2026-05-06 13:20:00', '2026-05-06 13:20:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 13:15:00', '2026-05-06 13:16:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (12, 'M202605060033', 1, 1, 33, '2026-05-06 13:20:00', '2026-05-06 13:21:00', '2026-05-06 13:25:00', '2026-05-06 13:25:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 13:20:00', '2026-05-06 13:21:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (13, 'M202605060034', 1, 1, 34, '2026-05-06 13:25:00', '2026-05-06 13:26:00', '2026-05-06 13:30:00', '2026-05-06 13:30:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 13:25:00', '2026-05-06 13:26:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (14, 'M202605060035', 1, 1, 35, '2026-05-06 13:30:00', '2026-05-06 13:31:00', '2026-05-06 13:35:00', '2026-05-06 13:35:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 13:30:00', '2026-05-06 13:31:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (15, 'M202605060036', 1, 1, 36, '2026-05-06 13:35:00', '2026-05-06 13:36:00', '2026-05-06 13:40:00', '2026-05-06 13:40:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 13:35:00', '2026-05-06 13:36:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (16, 'M202605060037', 1, 1, 37, '2026-05-06 13:40:00', '2026-05-06 13:41:00', '2026-05-06 13:45:00', '2026-05-06 13:45:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 13:40:00', '2026-05-06 13:41:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (17, 'M202605060038', 1, 1, 38, '2026-05-06 13:45:00', '2026-05-06 13:46:00', '2026-05-06 13:50:00', '2026-05-06 13:50:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 13:45:00', '2026-05-06 13:46:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (18, 'M202605060039', 1, 1, 39, '2026-05-06 13:50:00', '2026-05-06 13:51:00', '2026-05-06 13:55:00', '2026-05-06 13:55:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 13:50:00', '2026-05-06 13:51:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (19, 'M202605060040', 1, 1, 40, '2026-05-06 13:55:00', '2026-05-06 13:56:00', '2026-05-06 14:00:00', '2026-05-06 14:00:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 13:55:00', '2026-05-06 13:56:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (20, 'M202605060041', 1, 1, 41, '2026-05-06 14:00:00', '2026-05-06 14:01:00', '2026-05-06 14:05:00', '2026-05-06 14:05:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 14:00:00', '2026-05-06 14:01:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (21, 'M202605060042', 1, 1, 42, '2026-05-06 14:05:00', '2026-05-06 14:06:00', '2026-05-06 14:10:00', '2026-05-06 14:10:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 14:05:00', '2026-05-06 14:06:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (22, 'M202605060043', 1, 1, 43, '2026-05-06 14:10:00', '2026-05-06 14:11:00', '2026-05-06 14:15:00', '2026-05-06 14:15:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 14:10:00', '2026-05-06 14:11:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (23, 'M202605060044', 1, 1, 44, '2026-05-06 14:15:00', '2026-05-06 14:16:00', '2026-05-06 14:20:00', '2026-05-06 14:20:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 14:15:00', '2026-05-06 14:16:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (24, 'M202605060045', 1, 1, 45, '2026-05-06 14:20:00', '2026-05-06 14:21:00', '2026-05-06 14:25:00', '2026-05-06 14:25:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 14:20:00', '2026-05-06 14:21:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (25, 'M202605060046', 1, 1, 46, '2026-05-06 14:25:00', '2026-05-06 14:26:00', '2026-05-06 14:30:00', '2026-05-06 14:30:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 14:25:00', '2026-05-06 14:26:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (26, 'M202605060047', 1, 1, 47, '2026-05-06 14:30:00', '2026-05-06 14:31:00', '2026-05-06 14:35:00', '2026-05-06 14:35:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 14:30:00', '2026-05-06 14:31:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (27, 'M202605060048', 1, 1, 48, '2026-05-06 14:35:00', '2026-05-06 14:36:00', '2026-05-06 14:40:00', '2026-05-06 14:40:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 14:35:00', '2026-05-06 14:36:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (28, 'M202605060049', 1, 1, 49, '2026-05-06 14:40:00', '2026-05-06 14:41:00', '2026-05-06 14:45:00', '2026-05-06 14:45:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 14:40:00', '2026-05-06 14:41:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (29, 'M202605060050', 1, 1, 50, '2026-05-06 14:45:00', '2026-05-06 14:46:00', '2026-05-06 14:50:00', '2026-05-06 14:50:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 14:45:00', '2026-05-06 14:46:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (30, 'M202605060051', 1, 1, 51, '2026-05-06 14:50:00', '2026-05-06 14:51:00', '2026-05-06 14:55:00', '2026-05-06 14:55:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 14:50:00', '2026-05-06 14:51:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (31, 'M202605060052', 1, 1, 52, '2026-05-06 14:55:00', '2026-05-06 14:56:00', '2026-05-06 15:00:00', '2026-05-06 15:00:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 14:55:00', '2026-05-06 14:56:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (32, 'M202605060053', 1, 1, 53, '2026-05-06 15:00:00', '2026-05-06 15:01:00', '2026-05-06 15:05:00', '2026-05-06 15:05:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 15:00:00', '2026-05-06 15:01:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (33, 'M202605060054', 1, 1, 54, '2026-05-06 15:05:00', '2026-05-06 15:06:00', '2026-05-06 15:10:00', '2026-05-06 15:10:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 15:05:00', '2026-05-06 15:06:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (36, 'M202605060055', 1, 1, 55, '2026-05-06 15:10:00', '2026-05-06 15:11:00', '2026-05-06 15:15:00', '2026-05-06 15:15:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 15:10:00', '2026-05-06 15:11:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (37, 'M202605060056', 1, 1, 56, '2026-05-06 15:15:00', '2026-05-06 15:16:00', '2026-05-06 15:20:00', '2026-05-06 15:20:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 15:15:00', '2026-05-06 15:16:00');

-- ----------------------------
-- Table structure for ddz_arena_periods_202606
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_periods_202606`;
CREATE TABLE `ddz_arena_periods_202606`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `period_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '期号(格式J202605060001,14位)',
  `room_id` bigint UNSIGNED NOT NULL COMMENT '房间ID',
  `room_config_id` bigint UNSIGNED NOT NULL COMMENT '房间配置ID',
  `period_index` int NOT NULL DEFAULT 1 COMMENT '当日场次号(1-9999)',
  `start_time` datetime NOT NULL COMMENT '期号开始时间',
  `signup_start_time` datetime NOT NULL COMMENT '报名开始时间',
  `signup_end_time` datetime NOT NULL COMMENT '报名截止时间',
  `end_time` datetime NOT NULL COMMENT '期号结束时间',
  `total_signup` int NOT NULL DEFAULT 0 COMMENT '报名总人数',
  `total_cancel` int NOT NULL DEFAULT 0 COMMENT '取消报名人数',
  `final_players` int NOT NULL DEFAULT 0 COMMENT '最终参赛人数',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '状态:0-准备中,1-报名中,2-等待开赛,3-比赛进行中,4-已结束,5-已取消',
  `session_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '关联会话ID(开赛后填写)',
  `processed_at` datetime NULL DEFAULT NULL COMMENT '数据处理完成时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_period_no`(`period_no` ASC) USING BTREE,
  INDEX `idx_room_id`(`room_id` ASC) USING BTREE,
  INDEX `idx_room_config_id`(`room_config_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_start_time`(`start_time` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场期号表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_periods_202606
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_arena_registrations
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_registrations`;
CREATE TABLE `ddz_arena_registrations`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `created_at` datetime(3) NULL DEFAULT NULL COMMENT '创建时间',
  `updated_at` datetime(3) NULL DEFAULT NULL COMMENT '更新时间',
  `deleted_at` datetime(3) NULL DEFAULT NULL COMMENT '删除时间',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `arena_level` tinyint NOT NULL COMMENT '竞技场等级:1-初级场,2-中级场,3-高级场',
  `arena_coin_cost` bigint NOT NULL COMMENT '消耗的竞技币',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态:1-已报名,2-已取消,3-已参赛',
  `registered_at` datetime NOT NULL COMMENT '报名时间',
  `cancelled_at` datetime NULL DEFAULT NULL COMMENT '取消时间',
  `operate_ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '操作IP',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_ddz_arena_registrations_deleted_at`(`deleted_at` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场报名记录' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_registrations
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_arena_round_records
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_round_records`;
CREATE TABLE `ddz_arena_round_records`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `session_id` bigint UNSIGNED NOT NULL COMMENT '比赛会话ID',
  `table_id` bigint UNSIGNED NOT NULL COMMENT '比赛桌ID',
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏ID',
  `round_num` int NOT NULL COMMENT '轮次',
  `landlord_id` bigint UNSIGNED NOT NULL COMMENT '地主玩家ID',
  `farmer1_id` bigint UNSIGNED NOT NULL COMMENT '农民1玩家ID',
  `farmer2_id` bigint UNSIGNED NOT NULL COMMENT '农民2玩家ID',
  `landlord_win` tinyint UNSIGNED NOT NULL COMMENT '地主是否获胜:0-否,1-是',
  `landlord_coin_change` bigint NOT NULL DEFAULT 0 COMMENT '地主比赛金币变化',
  `farmer1_coin_change` bigint NOT NULL DEFAULT 0 COMMENT '农民1比赛金币变化',
  `farmer2_coin_change` bigint NOT NULL DEFAULT 0 COMMENT '农民2比赛金币变化',
  `multiplier` int NOT NULL DEFAULT 1 COMMENT '倍数',
  `started_at` datetime NOT NULL COMMENT '开始时间',
  `ended_at` datetime NULL DEFAULT NULL COMMENT '结束时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_session_id`(`session_id` ASC) USING BTREE,
  INDEX `idx_table_id`(`table_id` ASC) USING BTREE,
  INDEX `idx_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_round_num`(`round_num` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '比赛轮次记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_round_records
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_arena_sessions
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_sessions`;
CREATE TABLE `ddz_arena_sessions`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '会话ID',
  `session_code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '会话编码',
  `room_config_id` bigint UNSIGNED NOT NULL COMMENT '关联房间配置ID',
  `match_config_id` bigint UNSIGNED NOT NULL COMMENT '关联比赛配置ID',
  `scheduled_start_time` datetime NOT NULL COMMENT '计划开始时间',
  `actual_start_time` datetime NULL DEFAULT NULL COMMENT '实际开始时间',
  `end_time` datetime NULL DEFAULT NULL COMMENT '结束时间',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '状态',
  `current_round` int NOT NULL DEFAULT 0 COMMENT '当前轮次',
  `total_rounds` int NOT NULL DEFAULT 3 COMMENT '总轮次',
  `total_players` int NOT NULL DEFAULT 0 COMMENT '参赛人数',
  `active_players` int NOT NULL DEFAULT 0 COMMENT '剩余人数',
  `signup_fee` bigint NOT NULL DEFAULT 0 COMMENT '报名费(竞技币)',
  `champion_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '冠军玩家ID',
  `runner_up_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '亚军玩家ID',
  `third_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '季军玩家ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `period_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '期号(格式J202605060001)',
  `signup_deadline` datetime NULL DEFAULT NULL COMMENT '报名截止时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_room_config_id`(`room_config_id` ASC) USING BTREE,
  INDEX `idx_match_config_id`(`match_config_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_scheduled_start_time`(`scheduled_start_time` ASC) USING BTREE,
  INDEX `idx_arena_sessions_status_time`(`status` ASC, `scheduled_start_time` ASC) USING BTREE,
  UNIQUE INDEX `idx_ddz_arena_sessions_session_code`(`session_code` ASC) USING BTREE,
  INDEX `idx_ddz_arena_sessions_period_no`(`period_no` ASC) USING BTREE,
  INDEX `idx_ddz_arena_sessions_room_config_id`(`room_config_id` ASC) USING BTREE,
  INDEX `idx_ddz_arena_sessions_match_config_id`(`match_config_id` ASC) USING BTREE,
  INDEX `idx_ddz_arena_sessions_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '比赛会话表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_sessions
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_arena_signup_logs
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_signup_logs`;
CREATE TABLE `ddz_arena_signup_logs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `period_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '期号',
  `period_id` bigint UNSIGNED NOT NULL COMMENT '期号记录ID',
  `room_id` bigint UNSIGNED NOT NULL COMMENT '房间ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `action_type` tinyint UNSIGNED NOT NULL COMMENT '操作类型:1-报名,2-取消',
  `signup_fee` bigint NOT NULL DEFAULT 0 COMMENT '报名费',
  `balance_before` bigint NOT NULL DEFAULT 0 COMMENT '操作前竞技币余额',
  `balance_after` bigint NOT NULL DEFAULT 0 COMMENT '操作后竞技币余额',
  `remark` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_arena_signup_logs_period_no`(`period_no` ASC) USING BTREE,
  INDEX `idx_ddz_arena_signup_logs_period_id`(`period_id` ASC) USING BTREE,
  INDEX `idx_ddz_arena_signup_logs_room_id`(`room_id` ASC) USING BTREE,
  INDEX `idx_ddz_arena_signup_logs_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_ddz_arena_signup_logs_action_type`(`action_type` ASC) USING BTREE,
  INDEX `idx_ddz_arena_signup_logs_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_signup_logs
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_arena_signup_logs_202605
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_signup_logs_202605`;
CREATE TABLE `ddz_arena_signup_logs_202605`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `period_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '期号',
  `period_id` bigint UNSIGNED NOT NULL COMMENT '期号记录ID',
  `room_id` bigint UNSIGNED NOT NULL COMMENT '房间ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `action_type` tinyint UNSIGNED NOT NULL COMMENT '操作类型:1-报名,2-取消',
  `signup_fee` bigint NOT NULL DEFAULT 0 COMMENT '报名费',
  `balance_before` bigint NOT NULL DEFAULT 0 COMMENT '操作前竞技币余额',
  `balance_after` bigint NOT NULL DEFAULT 0 COMMENT '操作后竞技币余额',
  `remark` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_period_no`(`period_no` ASC) USING BTREE,
  INDEX `idx_period_id`(`period_id` ASC) USING BTREE,
  INDEX `idx_room_id`(`room_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_action_type`(`action_type` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场报名日志表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_signup_logs_202605
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_arena_signup_logs_202606
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_signup_logs_202606`;
CREATE TABLE `ddz_arena_signup_logs_202606`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `period_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '期号',
  `period_id` bigint UNSIGNED NOT NULL COMMENT '期号记录ID',
  `room_id` bigint UNSIGNED NOT NULL COMMENT '房间ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `action_type` tinyint UNSIGNED NOT NULL COMMENT '操作类型:1-报名,2-取消',
  `signup_fee` bigint NOT NULL DEFAULT 0 COMMENT '报名费',
  `balance_before` bigint NOT NULL DEFAULT 0 COMMENT '操作前竞技币余额',
  `balance_after` bigint NOT NULL DEFAULT 0 COMMENT '操作后竞技币余额',
  `remark` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_period_no`(`period_no` ASC) USING BTREE,
  INDEX `idx_period_id`(`period_id` ASC) USING BTREE,
  INDEX `idx_room_id`(`room_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_action_type`(`action_type` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场报名日志表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_signup_logs_202606
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_arena_tables
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_tables`;
CREATE TABLE `ddz_arena_tables`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '桌ID',
  `table_code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '桌编码(唯一)',
  `session_id` bigint UNSIGNED NOT NULL COMMENT '比赛会话ID',
  `round_num` int NOT NULL DEFAULT 1 COMMENT '轮次',
  `player1_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '玩家1 ID',
  `player2_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '玩家2 ID',
  `player3_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '玩家3 ID',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '状态:0-等待玩家,1-游戏中,2-已结束',
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '当前游戏ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_table_code`(`table_code` ASC) USING BTREE,
  INDEX `idx_session_id`(`session_id` ASC) USING BTREE,
  INDEX `idx_round_num`(`round_num` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '比赛桌表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_tables
-- ----------------------------

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_bid_logs
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_bid_logs_202604
-- ----------------------------
DROP TABLE IF EXISTS `ddz_bid_logs_202604`;
CREATE TABLE `ddz_bid_logs_202604`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `bid_order` int NOT NULL COMMENT '叫地主顺序',
  `bid_type` tinyint UNSIGNED NOT NULL COMMENT '叫地主类型:0-不叫,1-叫,2-抢',
  `bid_score` int NOT NULL DEFAULT 0 COMMENT '叫分',
  `is_success` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否成功',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '叫地主日志表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_bid_logs_202604
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_bid_logs_202605
-- ----------------------------
DROP TABLE IF EXISTS `ddz_bid_logs_202605`;
CREATE TABLE `ddz_bid_logs_202605`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `bid_order` int NOT NULL COMMENT '叫地主顺序',
  `bid_type` tinyint UNSIGNED NOT NULL COMMENT '叫地主类型:0-不叫,1-叫,2-抢',
  `bid_score` int NOT NULL DEFAULT 0 COMMENT '叫分',
  `is_success` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否成功',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '叫地主日志表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_bid_logs_202605
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_bid_logs_202606
-- ----------------------------
DROP TABLE IF EXISTS `ddz_bid_logs_202606`;
CREATE TABLE `ddz_bid_logs_202606`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `bid_order` int NOT NULL COMMENT '叫地主顺序',
  `bid_type` tinyint UNSIGNED NOT NULL COMMENT '叫地主类型:0-不叫,1-叫,2-抢',
  `bid_score` int NOT NULL DEFAULT 0 COMMENT '叫分',
  `is_success` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否成功',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '叫地主日志表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_bid_logs_202606
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
) ENGINE = InnoDB AUTO_INCREMENT = 354 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_deal_logs
-- ----------------------------
INSERT INTO `ddz_deal_logs` VALUES (324, 'e186aeb1-cb87-4155-8f50-fe99999b91bd', 7, 2, 'BJ,♦A,♥K,♣K,♣Q,♦J,♣10,♦10,♦8,♠7,♥7,♦7,♥6,♠5,♠4,♥4,♦3', 17, '', '2026-05-03 15:58:52.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (325, 'e186aeb1-cb87-4155-8f50-fe99999b91bd', 5, 2, '♣2,♦2,♥A,♠Q,♦Q,♠J,♥J,♠10,♥9,♣9,♦9,♣8,♥5,♣5,♦5,♦4,♣3', 17, '', '2026-05-03 15:58:52.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (326, 'e186aeb1-cb87-4155-8f50-fe99999b91bd', 4, 1, 'RJ,♠2,♥2,♠A,♣A,♠K,♥Q,♣J,♥10,♠9,♠8,♥8,♣7,♠6,♦6,♣4,♥3', 17, '♣8,♣K,♥5', '2026-05-03 15:58:52.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (327, 'e186aeb1-cb87-4155-8f50-fe99999b91bd', 7, 2, '♥2,♦2,♠A,♥A,♦A,♥Q,♥9,♦8,♠7,♣7,♦7,♥6,♣6,♠5,♠4,♥4,♣4', 17, '', '2026-05-03 15:58:52.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (328, 'e186aeb1-cb87-4155-8f50-fe99999b91bd', 5, 2, 'BJ,♠Q,♣Q,♥J,♣J,♦J,♠10,♣10,♠9,♣9,♦9,♥8,♦6,♦5,♠3,♥3,♦3', 17, '', '2026-05-03 15:58:52.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (329, 'e186aeb1-cb87-4155-8f50-fe99999b91bd', 4, 1, 'RJ,♠2,♣2,♣A,♠K,♥K,♦K,♦Q,♠J,♥10,♦10,♠8,♥7,♠6,♣5,♦4,♣3', 17, '♣8,♣K,♥5', '2026-05-03 15:58:52.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (330, '7d22378f-611a-4734-ab3a-b3ead343abc3', 5, 2, '♥2,♣2,♠A,♣A,♠K,♣K,♦K,♥Q,♥J,♣J,♠10,♥10,♥9,♣9,♥7,♠6,♠3', 17, '', '2026-05-03 16:06:20.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (331, '7d22378f-611a-4734-ab3a-b3ead343abc3', 7, 1, 'BJ,♠2,♦2,♦A,♥K,♠J,♦J,♦10,♦9,♥8,♣8,♦8,♠7,♦7,♦6,♠5,♦3', 17, '♣7,♥A,♠8', '2026-05-03 16:06:20.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (332, '7d22378f-611a-4734-ab3a-b3ead343abc3', 4, 2, 'RJ,♠Q,♣Q,♦Q,♣10,♠9,♥6,♣6,♥5,♣5,♦5,♠4,♥4,♣4,♦4,♥3,♣3', 17, '', '2026-05-03 16:06:20.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (333, '43367ac3-124e-44e6-b969-17533f6a5919', 7, 2, '♣2,♠A,♥K,♥Q,♦Q,♥J,♦10,♠9,♥9,♥7,♣7,♠6,♣6,♦6,♠5,♣5,♦5', 17, '', '2026-05-03 16:57:24.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (334, '43367ac3-124e-44e6-b969-17533f6a5919', 5, 2, '♥2,♥A,♣A,♦A,♠K,♠Q,♥10,♣10,♦9,♥8,♣8,♠7,♥5,♠4,♥4,♣4,♠3', 17, '', '2026-05-03 16:57:24.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (335, '43367ac3-124e-44e6-b969-17533f6a5919', 4, 1, 'RJ,BJ,♠2,♦2,♣K,♦K,♣Q,♠J,♣J,♦J,♠8,♦8,♦7,♥6,♦4,♥3,♣3', 17, '♠10,♦3,♣9', '2026-05-03 16:57:24.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (336, '1596baf7-5ee5-4386-9f67-1b52c7e70d42', 4, 2, '♦2,♣A,♥K,♣Q,♦Q,♥J,♦J,♠10,♣10,♦10,♣8,♥7,♠6,♥6,♦5,♠4,♦4', 17, '', '2026-05-03 17:09:00.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (337, '1596baf7-5ee5-4386-9f67-1b52c7e70d42', 5, 2, 'BJ,♥2,♠A,♦A,♣K,♦K,♠Q,♣J,♥9,♦9,♠8,♠7,♣7,♥5,♥4,♥3,♣3', 17, '', '2026-05-03 17:09:00.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (338, '1596baf7-5ee5-4386-9f67-1b52c7e70d42', 7, 1, 'RJ,♠2,♣2,♠K,♥Q,♥10,♠9,♣9,♥8,♦8,♦7,♦6,♠5,♣5,♣4,♠3,♦3', 17, '♥A,♣6,♠J', '2026-05-03 17:09:00.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (339, '501e74a7-8797-4b4a-a408-58c42472e050', 7, 2, '♥2,♠A,♠K,♦K,♠Q,♥Q,♦Q,♥J,♥10,♠9,♥9,♣9,♠8,♣6,♦4,♥3,♣3', 17, '', '2026-05-03 17:45:40.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (340, '501e74a7-8797-4b4a-a408-58c42472e050', 4, 2, 'BJ,♥A,♣A,♦A,♣K,♦J,♣10,♦9,♥8,♦8,♥7,♣7,♠6,♦6,♠4,♠3,♦3', 17, '', '2026-05-03 17:45:40.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (341, '501e74a7-8797-4b4a-a408-58c42472e050', 5, 1, 'RJ,♠2,♣2,♦2,♥K,♠J,♣J,♦10,♣8,♠7,♦7,♥6,♠5,♥5,♦5,♥4,♣4', 17, '♠10,♣5,♣Q', '2026-05-03 17:45:40.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (342, 'c900cd1d-eabc-4fdd-8583-c343e329e018', 7, 2, '♦A,♥K,♣K,♦K,♥J,♣J,♥10,♣10,♦10,♣9,♣8,♠7,♣7,♥6,♦6,♥3,♣3', 17, '', '2026-05-03 18:20:25.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (343, 'c900cd1d-eabc-4fdd-8583-c343e329e018', 4, 2, 'BJ,♦2,♥A,♠Q,♣Q,♦Q,♠9,♥9,♦8,♥7,♣6,♠5,♣5,♥4,♣4,♦4,♠3', 17, '', '2026-05-03 18:20:25.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (344, 'c900cd1d-eabc-4fdd-8583-c343e329e018', 5, 1, 'RJ,♥2,♣2,♠A,♣A,♠K,♥Q,♠J,♦J,♦9,♠8,♥8,♦7,♥5,♦5,♠4,♦3', 17, '♠6,♠10,♠2', '2026-05-03 18:20:25.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (345, 'c56e3967-fad4-42cd-90e7-a5ed8f5a094d', 4, 1, 'BJ,♠K,♥K,♣K,♦K,♠J,♦J,♦10,♥9,♦9,♣8,♠7,♥7,♣7,♣6,♦6,♥4', 17, '♦2,♠10,♥10', '2026-05-03 18:48:00.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (346, 'c56e3967-fad4-42cd-90e7-a5ed8f5a094d', 5, 2, '♠2,♥2,♠A,♥A,♣A,♣Q,♥J,♣J,♣10,♣9,♦7,♥6,♠5,♥5,♠3,♥3,♣3', 17, '', '2026-05-03 18:48:00.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (347, 'c56e3967-fad4-42cd-90e7-a5ed8f5a094d', 7, 2, 'RJ,♣2,♦A,♠Q,♥Q,♦Q,♠9,♠8,♥8,♦8,♠6,♣5,♦5,♠4,♣4,♦4,♦3', 17, '', '2026-05-03 18:48:00.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (348, '84915987-21e0-44f1-98bf-f22c025aba8d', 4, 2, '♠A,♦K,♠Q,♥Q,♦Q,♠J,♠8,♥8,♣8,♦8,♠7,♥7,♥6,♣6,♠4,♣4,♠3', 17, '', '2026-05-03 18:57:21.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (349, '84915987-21e0-44f1-98bf-f22c025aba8d', 7, 2, '♠2,♥2,♣2,♦A,♠K,♥K,♣K,♦J,♣10,♠9,♠6,♦6,♣5,♥4,♦4,♣3,♦3', 17, '', '2026-05-03 18:57:21.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (350, '84915987-21e0-44f1-98bf-f22c025aba8d', 5, 1, 'RJ,BJ,♦2,♣A,♣Q,♥J,♣J,♠10,♥10,♦10,♣9,♣7,♦7,♠5,♥5,♦5,♥3', 17, '♥9,♥A,♦9', '2026-05-03 18:57:21.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (351, '3ad5d0d0-6f10-4012-91f7-82ad7b4e56b8', 5, 2, '♣2,♦2,♠A,♥A,♣K,♦K,♥J,♣J,♥10,♣9,♣8,♥7,♥6,♦6,♥4,♣4,♣3', 17, '', '2026-05-03 19:04:17.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (352, '3ad5d0d0-6f10-4012-91f7-82ad7b4e56b8', 4, 2, '♥2,♦A,♠K,♥Q,♦Q,♠J,♦J,♣10,♦9,♦8,♣7,♦7,♠6,♠5,♣5,♦5,♦4', 17, '', '2026-05-03 19:04:17.000', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (353, '3ad5d0d0-6f10-4012-91f7-82ad7b4e56b8', 7, 1, 'BJ,♠2,♥K,♠Q,♣Q,♠10,♦10,♠9,♥9,♥8,♠7,♣6,♥5,♠4,♠3,♥3,♦3', 17, 'RJ,♠8,♣A', '2026-05-03 19:04:17.000', NULL, NULL);

-- ----------------------------
-- Table structure for ddz_deal_logs_202604
-- ----------------------------
DROP TABLE IF EXISTS `ddz_deal_logs_202604`;
CREATE TABLE `ddz_deal_logs_202604`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `player_role` tinyint UNSIGNED NOT NULL COMMENT '玩家角色:1-地主,2-农民',
  `hand_cards` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '手牌',
  `cards_count` int NOT NULL DEFAULT 0 COMMENT '手牌数量',
  `landlord_cards` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '底牌',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '发牌日志表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_deal_logs_202604
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_deal_logs_202605
-- ----------------------------
DROP TABLE IF EXISTS `ddz_deal_logs_202605`;
CREATE TABLE `ddz_deal_logs_202605`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `player_role` tinyint UNSIGNED NOT NULL COMMENT '玩家角色:1-地主,2-农民',
  `hand_cards` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '手牌',
  `cards_count` int NOT NULL DEFAULT 0 COMMENT '手牌数量',
  `landlord_cards` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '底牌',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '发牌日志表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_deal_logs_202605
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_deal_logs_202606
-- ----------------------------
DROP TABLE IF EXISTS `ddz_deal_logs_202606`;
CREATE TABLE `ddz_deal_logs_202606`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `player_role` tinyint UNSIGNED NOT NULL COMMENT '玩家角色:1-地主,2-农民',
  `hand_cards` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '手牌',
  `cards_count` int NOT NULL DEFAULT 0 COMMENT '手牌数量',
  `landlord_cards` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '底牌',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '发牌日志表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_deal_logs_202606
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
  `game_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '游戏唯一标识',
  `room_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '房间ID',
  `room_type` bigint NULL DEFAULT NULL COMMENT '房间类型',
  `room_category` bigint NULL DEFAULT NULL COMMENT '房间分类 1普通场 2竞技场',
  `landlord_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '地主玩家ID',
  `farmer1_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '农民1玩家ID',
  `farmer2_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '农民2玩家ID',
  `base_score` bigint NULL DEFAULT NULL COMMENT '底分',
  `multiplier` bigint NULL DEFAULT NULL COMMENT '倍数',
  `bomb_count` bigint NOT NULL DEFAULT 0 COMMENT '炸弹数量',
  `spring` bigint NULL DEFAULT 0 COMMENT '春天 0否 1春天 2反春天',
  `result` bigint NULL DEFAULT NULL COMMENT '结果 1地主胜 2农民胜',
  `landlord_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '地主输赢金币',
  `landlord_win_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '地主输赢竞技币',
  `farmer1_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '农民1输赢金币',
  `farmer1_win_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '农民1输赢竞技币',
  `farmer2_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '农民2输赢金币',
  `farmer2_win_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '农民2输赢竞技币',
  `started_at` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '开始时间',
  `ended_at` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '结束时间',
  `duration_seconds` bigint NULL DEFAULT NULL COMMENT '游戏时长(秒)',
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
) ENGINE = InnoDB AUTO_INCREMENT = 116 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_game_records
-- ----------------------------
INSERT INTO `ddz_game_records` VALUES (107, 'e186aeb1-cb87-4155-8f50-fe99999b91bd', '122883', 1, 1, '4', '7', '5', 10, 8, 1, 1, 1, 160, 160, -80, -80, -80, -80, '2026-05-03 15:57:16', '2026-05-03 15:58:52', 102, '2026-05-03 15:58:52.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO `ddz_game_records` VALUES (108, '7d22378f-611a-4734-ab3a-b3ead343abc3', '133037', 1, 1, '7', '5', '4', 10, 16, 0, 1, 1, 320, 320, -160, -160, -160, -160, '2026-05-03 16:05:01', '2026-05-03 16:06:21', 85, '2026-05-03 16:06:20.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO `ddz_game_records` VALUES (109, '43367ac3-124e-44e6-b969-17533f6a5919', '780254', 1, 1, '4', '7', '5', 10, 2, 0, 0, 1, 40, 40, -20, -20, -20, -20, '2026-05-03 16:54:13', '2026-05-03 16:57:24', 204, '2026-05-03 16:57:24.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO `ddz_game_records` VALUES (110, '1596baf7-5ee5-4386-9f67-1b52c7e70d42', '305270', 1, 1, '7', '4', '5', 10, 8, 0, 0, 1, 160, 160, -80, -80, -80, -80, '2026-05-03 17:07:17', '2026-05-03 17:09:01', 108, '2026-05-03 17:09:00.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO `ddz_game_records` VALUES (111, '501e74a7-8797-4b4a-a408-58c42472e050', '320067', 1, 1, '5', '7', '4', 10, 8, 1, 1, 1, 160, 160, -80, -80, -80, -80, '2026-05-03 17:44:13', '2026-05-03 17:45:40', 92, '2026-05-03 17:45:40.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO `ddz_game_records` VALUES (112, 'c900cd1d-eabc-4fdd-8583-c343e329e018', '125886', 1, 1, '5', '7', '4', 10, 16, 0, 0, 1, 320, 320, -160, -160, -160, -160, '2026-05-03 18:19:08', '2026-05-03 18:20:26', 82, '2026-05-03 18:20:25.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO `ddz_game_records` VALUES (113, 'c56e3967-fad4-42cd-90e7-a5ed8f5a094d', '657624', 1, 1, '4', '5', '7', 10, 16, 1, 0, 1, 320, 320, -160, -160, -160, -160, '2026-05-03 18:44:44', '2026-05-03 18:48:00', 210, '2026-05-03 18:48:00.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO `ddz_game_records` VALUES (114, '84915987-21e0-44f1-98bf-f22c025aba8d', '465832', 1, 1, '5', '4', '7', 10, 8, 1, 0, 1, 160, 160, -80, -80, -80, -80, '2026-05-03 18:55:50', '2026-05-03 18:57:22', 100, '2026-05-03 18:57:21.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO `ddz_game_records` VALUES (115, '3ad5d0d0-6f10-4012-91f7-82ad7b4e56b8', '753739', 1, 1, '7', '5', '4', 10, 16, 0, 0, 2, -320, -320, 160, 160, 160, 160, '2026-05-03 19:02:24', '2026-05-03 19:04:18', 120, '2026-05-03 19:04:17.000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1);

-- ----------------------------
-- Table structure for ddz_game_records_202604
-- ----------------------------
DROP TABLE IF EXISTS `ddz_game_records_202604`;
CREATE TABLE `ddz_game_records_202604`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '游戏记录ID',
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `room_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间ID',
  `room_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间号',
  `room_type` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '房间类型',
  `room_category` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '房间分类',
  `landlord_id` bigint UNSIGNED NOT NULL COMMENT '地主玩家ID',
  `farmer1_id` bigint UNSIGNED NOT NULL COMMENT '农民1玩家ID',
  `farmer2_id` bigint UNSIGNED NOT NULL COMMENT '农民2玩家ID',
  `base_score` int NOT NULL DEFAULT 1 COMMENT '底分',
  `multiplier` int NOT NULL DEFAULT 1 COMMENT '最终倍数',
  `bomb_count` int NOT NULL DEFAULT 0 COMMENT '炸弹数量',
  `spring` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否春天:0-否,1-地主春天,2-反春天',
  `result` tinyint UNSIGNED NOT NULL COMMENT '结果:1-地主胜,2-农民胜',
  `landlord_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '地主输赢金币',
  `farmer1_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '农民1输赢金币',
  `farmer2_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '农民2输赢金币',
  `landlord_win_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '地主输赢竞技币',
  `farmer1_win_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '农民1输赢竞技币',
  `farmer2_win_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '农民2输赢竞技币',
  `started_at` datetime NOT NULL COMMENT '开始时间',
  `ended_at` datetime NULL DEFAULT NULL COMMENT '结束时间',
  `duration_seconds` int NOT NULL DEFAULT 0 COMMENT '游戏时长(秒)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_room_id`(`room_id` ASC) USING BTREE,
  INDEX `idx_room_code`(`room_code` ASC) USING BTREE,
  INDEX `idx_landlord_id`(`landlord_id` ASC) USING BTREE,
  INDEX `idx_farmer1_id`(`farmer1_id` ASC) USING BTREE,
  INDEX `idx_farmer2_id`(`farmer2_id` ASC) USING BTREE,
  INDEX `idx_started_at`(`started_at` ASC) USING BTREE,
  INDEX `idx_result`(`result` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '游戏记录表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_game_records_202604
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_game_records_202605
-- ----------------------------
DROP TABLE IF EXISTS `ddz_game_records_202605`;
CREATE TABLE `ddz_game_records_202605`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '游戏记录ID',
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `room_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间ID',
  `room_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间号',
  `room_type` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '房间类型',
  `room_category` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '房间分类',
  `landlord_id` bigint UNSIGNED NOT NULL COMMENT '地主玩家ID',
  `farmer1_id` bigint UNSIGNED NOT NULL COMMENT '农民1玩家ID',
  `farmer2_id` bigint UNSIGNED NOT NULL COMMENT '农民2玩家ID',
  `base_score` int NOT NULL DEFAULT 1 COMMENT '底分',
  `multiplier` int NOT NULL DEFAULT 1 COMMENT '最终倍数',
  `bomb_count` int NOT NULL DEFAULT 0 COMMENT '炸弹数量',
  `spring` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否春天:0-否,1-地主春天,2-反春天',
  `result` tinyint UNSIGNED NOT NULL COMMENT '结果:1-地主胜,2-农民胜',
  `landlord_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '地主输赢金币',
  `farmer1_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '农民1输赢金币',
  `farmer2_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '农民2输赢金币',
  `landlord_win_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '地主输赢竞技币',
  `farmer1_win_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '农民1输赢竞技币',
  `farmer2_win_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '农民2输赢竞技币',
  `started_at` datetime NOT NULL COMMENT '开始时间',
  `ended_at` datetime NULL DEFAULT NULL COMMENT '结束时间',
  `duration_seconds` int NOT NULL DEFAULT 0 COMMENT '游戏时长(秒)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_room_id`(`room_id` ASC) USING BTREE,
  INDEX `idx_room_code`(`room_code` ASC) USING BTREE,
  INDEX `idx_landlord_id`(`landlord_id` ASC) USING BTREE,
  INDEX `idx_farmer1_id`(`farmer1_id` ASC) USING BTREE,
  INDEX `idx_farmer2_id`(`farmer2_id` ASC) USING BTREE,
  INDEX `idx_started_at`(`started_at` ASC) USING BTREE,
  INDEX `idx_result`(`result` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '游戏记录表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_game_records_202605
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_game_records_202606
-- ----------------------------
DROP TABLE IF EXISTS `ddz_game_records_202606`;
CREATE TABLE `ddz_game_records_202606`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '游戏记录ID',
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `room_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间ID',
  `room_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间号',
  `room_type` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '房间类型',
  `room_category` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '房间分类',
  `landlord_id` bigint UNSIGNED NOT NULL COMMENT '地主玩家ID',
  `farmer1_id` bigint UNSIGNED NOT NULL COMMENT '农民1玩家ID',
  `farmer2_id` bigint UNSIGNED NOT NULL COMMENT '农民2玩家ID',
  `base_score` int NOT NULL DEFAULT 1 COMMENT '底分',
  `multiplier` int NOT NULL DEFAULT 1 COMMENT '最终倍数',
  `bomb_count` int NOT NULL DEFAULT 0 COMMENT '炸弹数量',
  `spring` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否春天:0-否,1-地主春天,2-反春天',
  `result` tinyint UNSIGNED NOT NULL COMMENT '结果:1-地主胜,2-农民胜',
  `landlord_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '地主输赢金币',
  `farmer1_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '农民1输赢金币',
  `farmer2_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '农民2输赢金币',
  `landlord_win_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '地主输赢竞技币',
  `farmer1_win_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '农民1输赢竞技币',
  `farmer2_win_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '农民2输赢竞技币',
  `started_at` datetime NOT NULL COMMENT '开始时间',
  `ended_at` datetime NULL DEFAULT NULL COMMENT '结束时间',
  `duration_seconds` int NOT NULL DEFAULT 0 COMMENT '游戏时长(秒)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_room_id`(`room_id` ASC) USING BTREE,
  INDEX `idx_room_code`(`room_code` ASC) USING BTREE,
  INDEX `idx_landlord_id`(`landlord_id` ASC) USING BTREE,
  INDEX `idx_farmer1_id`(`farmer1_id` ASC) USING BTREE,
  INDEX `idx_farmer2_id`(`farmer2_id` ASC) USING BTREE,
  INDEX `idx_started_at`(`started_at` ASC) USING BTREE,
  INDEX `idx_result`(`result` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '游戏记录表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_game_records_202606
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_gold_logs
-- ----------------------------
DROP TABLE IF EXISTS `ddz_gold_logs`;
CREATE TABLE `ddz_gold_logs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `change_amount` bigint NOT NULL COMMENT '变化金额(正数为获得,负数为消耗)',
  `balance_after` bigint NOT NULL COMMENT '变化后余额',
  `change_type` tinyint NOT NULL COMMENT '变化类型:1-游戏结算,2-系统赠送,3-广告奖励,4-其他',
  `related_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '关联ID(游戏ID等)',
  `remark` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_gold_logs_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_ddz_gold_logs_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_gold_logs
-- ----------------------------
INSERT INTO `ddz_gold_logs` VALUES (1, 4, 1000, 10960, 4, '', '增加金币', '2026-05-06 09:43:21');

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
) ENGINE = InnoDB AUTO_INCREMENT = 44 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

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
INSERT INTO `ddz_login_logs` VALUES (29, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-26 12:14:56.000');
INSERT INTO `ddz_login_logs` VALUES (30, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-26 12:21:30.000');
INSERT INTO `ddz_login_logs` VALUES (31, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-26 12:21:55.000');
INSERT INTO `ddz_login_logs` VALUES (32, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-26 12:26:06.000');
INSERT INTO `ddz_login_logs` VALUES (33, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-26 13:10:39.000');
INSERT INTO `ddz_login_logs` VALUES (34, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-26 13:30:26.000');
INSERT INTO `ddz_login_logs` VALUES (35, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-26 13:44:03.000');
INSERT INTO `ddz_login_logs` VALUES (36, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-26 19:27:17.000');
INSERT INTO `ddz_login_logs` VALUES (37, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-26 20:38:50.000');
INSERT INTO `ddz_login_logs` VALUES (40, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-26 21:12:17.000');
INSERT INTO `ddz_login_logs` VALUES (41, 5, 5, 1, 1, '', '127.0.0.1', '', 'Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '', '2026-04-27 21:16:37.000');
INSERT INTO `ddz_login_logs` VALUES (42, 7, 6, 1, 1, '', '127.0.0.1', '', 'Android', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36', '', '2026-04-29 10:42:23.000');
INSERT INTO `ddz_login_logs` VALUES (43, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-05-03 21:18:24.000');

-- ----------------------------
-- Table structure for ddz_login_logs_202604
-- ----------------------------
DROP TABLE IF EXISTS `ddz_login_logs_202604`;
CREATE TABLE `ddz_login_logs_202604`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `account_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '账户ID',
  `login_type` tinyint UNSIGNED NOT NULL COMMENT '登录类型',
  `login_result` tinyint UNSIGNED NOT NULL COMMENT '登录结果',
  `fail_reason` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '失败原因',
  `ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '登录IP',
  `device_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备ID',
  `device_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备类型',
  `user_agent` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'User-Agent',
  `location` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '登录地点',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_account_id`(`account_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '登录日志表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_login_logs_202604
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_login_logs_202605
-- ----------------------------
DROP TABLE IF EXISTS `ddz_login_logs_202605`;
CREATE TABLE `ddz_login_logs_202605`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `account_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '账户ID',
  `login_type` tinyint UNSIGNED NOT NULL COMMENT '登录类型',
  `login_result` tinyint UNSIGNED NOT NULL COMMENT '登录结果',
  `fail_reason` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '失败原因',
  `ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '登录IP',
  `device_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备ID',
  `device_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备类型',
  `user_agent` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'User-Agent',
  `location` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '登录地点',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_account_id`(`account_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '登录日志表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_login_logs_202605
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_login_logs_202606
-- ----------------------------
DROP TABLE IF EXISTS `ddz_login_logs_202606`;
CREATE TABLE `ddz_login_logs_202606`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `account_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '账户ID',
  `login_type` tinyint UNSIGNED NOT NULL COMMENT '登录类型',
  `login_result` tinyint UNSIGNED NOT NULL COMMENT '登录结果',
  `fail_reason` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '失败原因',
  `ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '登录IP',
  `device_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备ID',
  `device_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备类型',
  `user_agent` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'User-Agent',
  `location` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '登录地点',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_account_id`(`account_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '登录日志表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_login_logs_202606
-- ----------------------------

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
) ENGINE = InnoDB AUTO_INCREMENT = 290 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_play_logs
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_play_logs_202604
-- ----------------------------
DROP TABLE IF EXISTS `ddz_play_logs_202604`;
CREATE TABLE `ddz_play_logs_202604`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `player_role` tinyint UNSIGNED NOT NULL COMMENT '玩家角色:1-地主,2-农民',
  `round_num` int NOT NULL COMMENT '回合数',
  `play_order` int NOT NULL COMMENT '本回合出牌顺序',
  `play_type` tinyint UNSIGNED NOT NULL COMMENT '出牌类型:1-出牌,2-不出,3-超时',
  `cards` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '出的牌',
  `cards_count` int NOT NULL DEFAULT 0 COMMENT '出牌数量',
  `card_pattern` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '牌型',
  `is_bomb` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否炸弹',
  `is_rocket` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否火箭',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_round_num`(`round_num` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '出牌日志表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_play_logs_202604
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_play_logs_202605
-- ----------------------------
DROP TABLE IF EXISTS `ddz_play_logs_202605`;
CREATE TABLE `ddz_play_logs_202605`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `player_role` tinyint UNSIGNED NOT NULL COMMENT '玩家角色:1-地主,2-农民',
  `round_num` int NOT NULL COMMENT '回合数',
  `play_order` int NOT NULL COMMENT '本回合出牌顺序',
  `play_type` tinyint UNSIGNED NOT NULL COMMENT '出牌类型:1-出牌,2-不出,3-超时',
  `cards` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '出的牌',
  `cards_count` int NOT NULL DEFAULT 0 COMMENT '出牌数量',
  `card_pattern` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '牌型',
  `is_bomb` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否炸弹',
  `is_rocket` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否火箭',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_round_num`(`round_num` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '出牌日志表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_play_logs_202605
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_play_logs_202606
-- ----------------------------
DROP TABLE IF EXISTS `ddz_play_logs_202606`;
CREATE TABLE `ddz_play_logs_202606`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `player_role` tinyint UNSIGNED NOT NULL COMMENT '玩家角色:1-地主,2-农民',
  `round_num` int NOT NULL COMMENT '回合数',
  `play_order` int NOT NULL COMMENT '本回合出牌顺序',
  `play_type` tinyint UNSIGNED NOT NULL COMMENT '出牌类型:1-出牌,2-不出,3-超时',
  `cards` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '出的牌',
  `cards_count` int NOT NULL DEFAULT 0 COMMENT '出牌数量',
  `card_pattern` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '牌型',
  `is_bomb` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否炸弹',
  `is_rocket` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否火箭',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_round_num`(`round_num` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '出牌日志表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_play_logs_202606
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
  `total_arena_coin_change` bigint NOT NULL DEFAULT 0 COMMENT '总竞技币变化',
  `max_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '单局最大赢金',
  `max_win_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '单局最大赢竞技币',
  `max_lose_gold` bigint NOT NULL DEFAULT 0 COMMENT '单局最大输金',
  `max_lose_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '单局最大输竞技币',
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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

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
  `arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '竞技币余额',
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
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_players
-- ----------------------------
INSERT INTO `ddz_players` VALUES (1, 'phone_13800138000', '用户80000147', '', 0, 1000, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, '2026-04-25 12:10:45', '[::1]', '2026-04-25 12:10:45', '2026-04-25 12:10:45', NULL, 0);
INSERT INTO `ddz_players` VALUES (2, 'phone_13800138001', '用户80018735', '', 0, 1000, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, '2026-04-25 12:11:15', '[::1]', '2026-04-25 12:11:06', '2026-04-25 12:11:15', NULL, 0);
INSERT INTO `ddz_players` VALUES (3, 'phone_13800138003', '用户80032758', '', 0, 1000, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, '2026-04-25 12:11:20', '[::1]', '2026-04-25 12:11:20', '2026-04-25 12:11:20', NULL, 0);
INSERT INTO `ddz_players` VALUES (4, 'phone_15888888888', '用户88884491', 'uploads/file/2026/05/06/b6f61982-aae1-4d61-afd2-fbab61193356.jpg', 0, 10960, 1000, 0, 0, 1, 0, 4, 5, 3, 6, 1, '2026-05-03 21:18:24', '127.0.0.1', '2026-04-25 15:53:53', '2026-05-06 14:22:10', NULL, 0);
INSERT INTO `ddz_players` VALUES (5, 'phone_15208384146', '用户41461120', '', 0, 10380, 0, 0, 0, 1, 0, 4, 5, 3, 6, 1, '2026-04-27 21:16:37', '127.0.0.1', '2026-04-25 16:05:56', '2026-05-03 19:04:18', NULL, 0);
INSERT INTO `ddz_players` VALUES (7, 'phone_13999999999', '用户99995055', 'uploads/file/2026/05/06/b6f61982-aae1-4d61-afd2-fbab61193356.jpg', 2, 9660, 0, 0, 0, 1, 0, 2, 7, 3, 6, 1, '2026-04-29 10:42:23', '127.0.0.1', '2026-04-29 10:42:23', '2026-05-06 14:25:18', NULL, 0);

-- ----------------------------
-- Table structure for ddz_reward_goods
-- ----------------------------
DROP TABLE IF EXISTS `ddz_reward_goods`;
CREATE TABLE `ddz_reward_goods`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '商品名称',
  `image` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '商品图片URL',
  `detail_richtext` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '富文本详情',
  `reward_type` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '奖励类型',
  `reward_value` bigint NOT NULL DEFAULT 0 COMMENT '奖励价值',
  `stock` int NOT NULL DEFAULT -1 COMMENT '库存(-1表示无限制)',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序权重',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` datetime NULL DEFAULT NULL COMMENT '删除时间',
  `room_config_ids` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '绑定房间配置ID列表(JSON数组)',
  `room_config_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '绑定房间配置ID',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_deleted_at`(`deleted_at` ASC) USING BTREE,
  INDEX `idx_ddz_reward_goods_room_config_id`(`room_config_id` ASC) USING BTREE,
  INDEX `idx_ddz_reward_goods_status`(`status` ASC) USING BTREE,
  INDEX `idx_ddz_reward_goods_deleted_at`(`deleted_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '奖励商品表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_reward_goods
-- ----------------------------
INSERT INTO `ddz_reward_goods` VALUES (1, '冠军奖杯', 'https://qmplusimg.henrongyi.top/1576554439myAvatar.png', '<p>精美冠军奖杯一个</p><ul><li>高度：30cm</li><li>材质：水晶+金属底座</li></ul>', 1, 0, 100, 1, 1, '2026-05-04 11:11:40', '2026-05-04 16:09:05', NULL, '[1,2,3]', NULL);
INSERT INTO `ddz_reward_goods` VALUES (2, '欢乐豆礼包', 'https://qmplusimg.henrongyi.top/1576554439myAvatar.png', '<p>包含10000欢乐豆</p>', 2, 10000, 0, 1, 2, '2026-05-04 11:11:40', '2026-05-04 16:09:21', NULL, '[1]', NULL);
INSERT INTO `ddz_reward_goods` VALUES (3, '竞技币礼包', 'https://qmplusimg.henrongyi.top/1576554439myAvatar.png', '<p>包含500竞技币</p>', 2, 500, 0, 1, 3, '2026-05-04 11:11:40', '2026-05-04 16:09:31', NULL, '', NULL);

-- ----------------------------
-- Table structure for ddz_reward_orders
-- ----------------------------
DROP TABLE IF EXISTS `ddz_reward_orders`;
CREATE TABLE `ddz_reward_orders`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '订单编号',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `reward_id` bigint UNSIGNED NOT NULL COMMENT '奖励商品ID',
  `room_config_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '房间配置ID',
  `session_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '比赛会话ID',
  `rank` int NULL DEFAULT NULL COMMENT '获得排名',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '状态:0-待填写,1-待发货,2-已发货,3-已完成,4-已取消',
  `receiver_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '收货人姓名',
  `receiver_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '收货人手机',
  `receiver_address` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '收货地址',
  `express_company` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '快递公司',
  `express_no` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '快递单号',
  `shipped_at` datetime NULL DEFAULT NULL COMMENT '发货时间',
  `completed_at` datetime NULL DEFAULT NULL COMMENT '完成时间',
  `remark` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_order_no`(`order_no` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_reward_id`(`reward_id` ASC) USING BTREE,
  INDEX `idx_session_id`(`session_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '奖励订单表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_reward_orders
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_room_config
-- ----------------------------
DROP TABLE IF EXISTS `ddz_room_config`;
CREATE TABLE `ddz_room_config`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `room_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间名称',
  `room_type` tinyint NOT NULL DEFAULT 1 COMMENT '房间类型:1-新手场,2-普通场,3-高级场,4-富豪场,5-至尊场',
  `room_category` tinyint NOT NULL DEFAULT 1 COMMENT '房间分类:1-普通场,2-竞技场',
  `base_score` bigint NOT NULL DEFAULT 1 COMMENT '底分',
  `multiplier` bigint NOT NULL DEFAULT 1 COMMENT '初始倍数',
  `min_gold` bigint NOT NULL DEFAULT 0 COMMENT '最低入场金币',
  `min_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '报名费(竞技场房间使用)',
  `max_gold` bigint NOT NULL DEFAULT 0 COMMENT '最高入场金币(0表示无限制)',
  `max_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '最高入场竞技币(竞技场房间使用,0表示无限制)',
  `match_time_ranges` json NULL COMMENT '开赛时间段',
  `match_round_duration` int NOT NULL DEFAULT 5 COMMENT '每场时长(分钟)',
  `match_round_count` bigint NOT NULL DEFAULT 3 COMMENT '轮次',
  `signup_fee` bigint NOT NULL DEFAULT 0 COMMENT '报名费(竞技币)',
  `max_players` bigint NOT NULL DEFAULT 9 COMMENT '最大人数',
  `min_players` int NOT NULL DEFAULT 3 COMMENT '最小开赛人数',
  `champion_reward_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '冠军奖励ID',
  `bot_enabled` tinyint NOT NULL DEFAULT 1 COMMENT '是否允许机器人:0-否,1-是',
  `bot_count` bigint NOT NULL DEFAULT 0 COMMENT '房间机器人数量',
  `fee_rate` decimal(5, 4) NOT NULL DEFAULT 0.0000 COMMENT '手续费率',
  `max_round` bigint NOT NULL DEFAULT 20 COMMENT '最大回合数',
  `timeout_seconds` bigint NOT NULL DEFAULT 30 COMMENT '操作超时时间(秒)',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态:0-关闭,1-开启',
  `sort_order` bigint NOT NULL DEFAULT 0 COMMENT '排序权重',
  `description` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '房间描述',
  `created_at` datetime(3) NULL DEFAULT NULL,
  `updated_at` datetime(3) NULL DEFAULT NULL,
  `deleted_at` datetime(3) NULL DEFAULT NULL,
  `bg_image_num` tinyint NOT NULL DEFAULT 2 COMMENT '背景图编号(对应btn_happy_{编号}.png,如:2->btn_happy_2.png)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_ddz_room_config_room_type`(`room_type` ASC) USING BTREE,
  INDEX `idx_ddz_room_config_status`(`status` ASC) USING BTREE,
  INDEX `idx_ddz_room_config_deleted_at`(`deleted_at` ASC) USING BTREE,
  INDEX `idx_ddz_room_config_room_category`(`room_category` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_room_config
-- ----------------------------
INSERT INTO `ddz_room_config` VALUES (1, '新手场', 2, 2, 1, 1, 1000, 100, 50000, 0, '[{\"end\": \"23:59\", \"start\": \"10:40\"}]', 5, 3, 0, 90, 30, NULL, 1, 5, 0.0000, 20, 30, 1, 1, '适合新手玩家,底分1,最低1000金币入场', '2026-04-26 09:27:51.000', '2026-05-06 10:31:33.000', NULL, 2);
INSERT INTO `ddz_room_config` VALUES (2, '普通场', 3, 2, 2, 1, 50000, 500, 200000, 0, '[{\"end\": \"12:59\", \"start\": \"10:00\"}]', 10, 3, 0, 9, 3, NULL, 1, 3, 0.0100, 20, 25, 1, 2, '底分2,适合有一定经验的玩家', '2026-04-26 09:27:51.000', '2026-05-06 09:44:54.000', NULL, 3);
INSERT INTO `ddz_room_config` VALUES (3, '高级场', 4, 2, 5, 2, 200000, 1000, 1000000, 0, NULL, 5, 3, 0, 9, 3, NULL, 1, 2, 0.0200, 20, 20, 1, 3, '底分5,倍数2,高手对决', '2026-04-26 09:27:51.000', '2026-04-28 10:01:52.000', NULL, 4);
INSERT INTO `ddz_room_config` VALUES (4, '富豪场', 5, 1, 10, 3, 1000, 0, 0, 0, NULL, 5, 3, 0, 9, 3, NULL, 0, 0, 0.0300, 20, 20, 1, 4, '底分10,倍数3,富豪专属', '2026-04-26 09:27:51.000', '2026-04-28 10:00:53.000', NULL, 5);
INSERT INTO `ddz_room_config` VALUES (5, '至尊场', 6, 2, 20, 5, 5000000, 0, 0, 0, NULL, 5, 3, 0, 9, 3, NULL, 0, 0, 0.0500, 20, 15, 0, 5, '底分20,倍数5,顶级玩家对决,无上限', '2026-04-26 09:27:51.000', '2026-04-27 18:18:14.000', '2026-04-28 10:01:05.000', 2);

-- ----------------------------
-- Table structure for ddz_room_players
-- ----------------------------
DROP TABLE IF EXISTS `ddz_room_players`;
CREATE TABLE `ddz_room_players`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `room_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间号',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `seat_index` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '座位号:0-2',
  `is_creator` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否房主:0-否,1-是',
  `is_ready` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否准备:0-否,1-是',
  `is_offline` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否离线:0-在线,1-离线',
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  `left_at` datetime NULL DEFAULT NULL COMMENT '离开时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_room_player`(`room_code` ASC, `player_id` ASC) USING BTREE,
  INDEX `idx_room_code`(`room_code` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_joined_at`(`joined_at` ASC) USING BTREE,
  INDEX `idx_room_players_room_seat`(`room_code` ASC, `seat_index` ASC) USING BTREE,
  INDEX `idx_ddz_room_players_room_code`(`room_code` ASC) USING BTREE,
  INDEX `idx_ddz_room_players_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_ddz_room_players_seat_index`(`seat_index` ASC) USING BTREE,
  CONSTRAINT `fk_room_players_player` FOREIGN KEY (`player_id`) REFERENCES `ddz_players` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_room_players_room` FOREIGN KEY (`room_code`) REFERENCES `ddz_rooms` (`room_code`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '房间玩家关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_room_players
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_rooms
-- ----------------------------
DROP TABLE IF EXISTS `ddz_rooms`;
CREATE TABLE `ddz_rooms`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `room_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间唯一标识',
  `room_config_id` bigint UNSIGNED NOT NULL DEFAULT 0 COMMENT '房间配置ID',
  `room_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '房间名称',
  `room_type` tinyint NOT NULL DEFAULT 1 COMMENT '房间类型:1-普通场,2-高级场,3-富豪场,4-至尊场',
  `room_category` tinyint NOT NULL DEFAULT 1 COMMENT '房间分类:1-普通场,2-竞技场',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态:0-已关闭,1-等待中,2-游戏中,3-已结束',
  `player_count` bigint NOT NULL DEFAULT 0 COMMENT '当前玩家数量',
  `max_players` bigint NOT NULL DEFAULT 3 COMMENT '最大玩家数量',
  `creator_id` bigint UNSIGNED NOT NULL COMMENT '创建者玩家ID',
  `players` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '玩家列表(JSON格式)',
  `base_score` int NOT NULL DEFAULT 1 COMMENT '底分',
  `multiplier` bigint NOT NULL DEFAULT 1 COMMENT '倍数',
  `current_game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '当前游戏ID',
  `started_at` datetime NULL DEFAULT NULL COMMENT '游戏开始时间',
  `ended_at` datetime NULL DEFAULT NULL COMMENT '结束时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` datetime NULL DEFAULT NULL COMMENT '删除时间(软删除)',
  `room_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间号',
  `player1_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '玩家1 ID',
  `player2_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '玩家2 ID',
  `player3_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '玩家3 ID',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_room_id`(`room_id` ASC) USING BTREE,
  UNIQUE INDEX `idx_ddz_rooms_room_code`(`room_code` ASC) USING BTREE,
  INDEX `idx_room_config_id`(`room_config_id` ASC) USING BTREE,
  INDEX `idx_room_type`(`room_type` ASC) USING BTREE,
  INDEX `idx_room_category`(`room_category` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_creator_id`(`creator_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_deleted_at`(`deleted_at` ASC) USING BTREE,
  INDEX `fk_ddz_rooms_player1`(`player1_id` ASC) USING BTREE,
  INDEX `fk_ddz_rooms_player2`(`player2_id` ASC) USING BTREE,
  INDEX `fk_ddz_rooms_player3`(`player3_id` ASC) USING BTREE,
  INDEX `idx_ddz_rooms_room_type`(`room_type` ASC) USING BTREE,
  INDEX `idx_ddz_rooms_creator_id`(`creator_id` ASC) USING BTREE,
  INDEX `idx_ddz_rooms_status`(`status` ASC) USING BTREE,
  INDEX `idx_ddz_rooms_room_config_id`(`room_config_id` ASC) USING BTREE,
  CONSTRAINT `fk_ddz_rooms_creator` FOREIGN KEY (`creator_id`) REFERENCES `ddz_players` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ddz_rooms_player1` FOREIGN KEY (`player1_id`) REFERENCES `ddz_players` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ddz_rooms_player2` FOREIGN KEY (`player2_id`) REFERENCES `ddz_players` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ddz_rooms_player3` FOREIGN KEY (`player3_id`) REFERENCES `ddz_players` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '游戏房间实例表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_rooms
-- ----------------------------
INSERT INTO `ddz_rooms` VALUES (2, '', 0, '房966879', 1, 1, 1, 1, 3, 4, NULL, 1, 1, NULL, NULL, NULL, '2026-04-28 12:45:42', '2026-04-28 13:43:04', NULL, '966879', 4, NULL, NULL);

-- ----------------------------
-- Table structure for ddz_rooms_202604
-- ----------------------------
DROP TABLE IF EXISTS `ddz_rooms_202604`;
CREATE TABLE `ddz_rooms_202604`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '房间ID',
  `room_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间号',
  `room_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '房间名称',
  `room_config_id` bigint UNSIGNED NOT NULL DEFAULT 0 COMMENT '房间配置ID',
  `room_type` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '房间类型',
  `room_category` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '房间分类',
  `creator_id` bigint UNSIGNED NOT NULL COMMENT '创建者玩家ID',
  `player_count` int NOT NULL DEFAULT 0 COMMENT '当前玩家数量',
  `max_players` int NOT NULL DEFAULT 3 COMMENT '最大玩家数量',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态:0-已关闭,1-等待中,2-游戏中,3-已结束',
  `base_score` int NOT NULL DEFAULT 1 COMMENT '底分',
  `multiplier` int NOT NULL DEFAULT 1 COMMENT '倍数',
  `player1_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '玩家1 ID',
  `player2_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '玩家2 ID',
  `player3_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '玩家3 ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `ended_at` datetime NULL DEFAULT NULL COMMENT '结束时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_room_code`(`room_code` ASC) USING BTREE,
  INDEX `idx_creator_id`(`creator_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 135 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '房间表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_rooms_202604
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_rooms_202605
-- ----------------------------
DROP TABLE IF EXISTS `ddz_rooms_202605`;
CREATE TABLE `ddz_rooms_202605`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '房间ID',
  `room_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间号',
  `room_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '房间名称',
  `room_config_id` bigint UNSIGNED NOT NULL DEFAULT 0 COMMENT '房间配置ID',
  `room_type` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '房间类型',
  `room_category` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '房间分类',
  `creator_id` bigint UNSIGNED NOT NULL COMMENT '创建者玩家ID',
  `player_count` int NOT NULL DEFAULT 0 COMMENT '当前玩家数量',
  `max_players` int NOT NULL DEFAULT 3 COMMENT '最大玩家数量',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态:0-已关闭,1-等待中,2-游戏中,3-已结束',
  `base_score` int NOT NULL DEFAULT 1 COMMENT '底分',
  `multiplier` int NOT NULL DEFAULT 1 COMMENT '倍数',
  `player1_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '玩家1 ID',
  `player2_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '玩家2 ID',
  `player3_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '玩家3 ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `ended_at` datetime NULL DEFAULT NULL COMMENT '结束时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_room_code`(`room_code` ASC) USING BTREE,
  INDEX `idx_creator_id`(`creator_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 136 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '房间表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_rooms_202605
-- ----------------------------
INSERT INTO `ddz_rooms_202605` VALUES (132, '368493', '房368493', 0, 1, 1, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-04 16:43:03', '2026-05-04 16:43:09', '2026-05-04 16:43:09');
INSERT INTO `ddz_rooms_202605` VALUES (133, '871191', '房871191', 0, 1, 1, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-04 21:30:13', '2026-05-04 21:30:15', '2026-05-04 21:30:15');
INSERT INTO `ddz_rooms_202605` VALUES (134, '650933', '房650933', 0, 1, 1, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-05 10:57:17', '2026-05-05 10:57:18', '2026-05-05 10:57:19');
INSERT INTO `ddz_rooms_202605` VALUES (135, '162790', '房162790', 0, 1, 1, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-06 10:06:44', '2026-05-06 10:06:45', '2026-05-06 10:06:46');

-- ----------------------------
-- Table structure for ddz_rooms_202606
-- ----------------------------
DROP TABLE IF EXISTS `ddz_rooms_202606`;
CREATE TABLE `ddz_rooms_202606`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '房间ID',
  `room_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间号',
  `room_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '房间名称',
  `room_config_id` bigint UNSIGNED NOT NULL DEFAULT 0 COMMENT '房间配置ID',
  `room_type` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '房间类型',
  `room_category` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '房间分类',
  `creator_id` bigint UNSIGNED NOT NULL COMMENT '创建者玩家ID',
  `player_count` int NOT NULL DEFAULT 0 COMMENT '当前玩家数量',
  `max_players` int NOT NULL DEFAULT 3 COMMENT '最大玩家数量',
  `status` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态:0-已关闭,1-等待中,2-游戏中,3-已结束',
  `base_score` int NOT NULL DEFAULT 1 COMMENT '底分',
  `multiplier` int NOT NULL DEFAULT 1 COMMENT '倍数',
  `player1_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '玩家1 ID',
  `player2_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '玩家2 ID',
  `player3_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '玩家3 ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `ended_at` datetime NULL DEFAULT NULL COMMENT '结束时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_room_code`(`room_code` ASC) USING BTREE,
  INDEX `idx_creator_id`(`creator_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '房间表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_rooms_202606
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
  `expire_at` datetime NULL DEFAULT NULL COMMENT '过期时间',
  `used_at` datetime NULL DEFAULT NULL COMMENT '使用时间',
  `ip` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '请求IP',
  `created_at` datetime(3) NULL DEFAULT NULL,
  `updated_at` datetime(3) NULL DEFAULT NULL,
  `deleted_at` datetime(3) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_sms_codes_phone`(`phone` ASC) USING BTREE,
  INDEX `idx_ddz_sms_codes_deleted_at`(`deleted_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

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
  `token_expire_at` datetime NULL DEFAULT NULL COMMENT 'Token过期时间',
  `refresh_token` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '刷新Token',
  `refresh_token_expire_at` datetime NULL DEFAULT NULL COMMENT '刷新Token过期时间',
  `device_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备ID',
  `device_type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备类型 ios/android/web',
  `last_login_at` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '最后登录IP',
  `login_count` bigint NOT NULL DEFAULT 0 COMMENT '登录次数',
  `status` bigint NULL DEFAULT 1 COMMENT '状态 0禁用 1正常 2封禁',
  `created_at` datetime(3) NULL DEFAULT NULL,
  `updated_at` datetime(3) NULL DEFAULT NULL,
  `deleted_at` datetime(3) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_user_accounts_wx_union_id`(`wx_union_id` ASC) USING BTREE,
  INDEX `idx_ddz_user_accounts_token`(`token` ASC) USING BTREE,
  INDEX `idx_ddz_user_accounts_status`(`status` ASC) USING BTREE,
  INDEX `idx_ddz_user_accounts_deleted_at`(`deleted_at` ASC) USING BTREE,
  INDEX `idx_ddz_user_accounts_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_ddz_user_accounts_phone`(`phone` ASC) USING BTREE,
  INDEX `idx_ddz_user_accounts_wx_open_id`(`wx_open_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_user_accounts
-- ----------------------------
INSERT INTO `ddz_user_accounts` VALUES (1, 1, '13800138000', '', NULL, NULL, '', '', '', 1, 'FTjEHwU8zmhXdKAwCicJOhtDfiN7l8PR', '2026-05-02 12:10:45', '', NULL, '', 'Unknown', '2026-04-25 12:10:45', '[::1]', 1, 1, '2026-04-25 12:10:45.000', '2026-04-25 12:10:45.000', NULL);
INSERT INTO `ddz_user_accounts` VALUES (2, 2, '13800138001', '', NULL, NULL, '', '', '', 1, 'qA7bInyI9iVJeJ4ZTA5fjIaMrVwbFKTQ', '2026-05-02 12:11:15', '', NULL, '', 'Unknown', '2026-04-25 12:11:15', '[::1]', 2, 1, '2026-04-25 12:11:06.000', '2026-04-25 12:11:15.000', NULL);
INSERT INTO `ddz_user_accounts` VALUES (3, 3, '13800138003', '', NULL, NULL, '', '', '', 1, 'jNNq8rDPAs7MyuxqymDEJpMPlk8Fl5Nk', '2026-05-02 12:11:20', '', NULL, '', 'Unknown', '2026-04-25 12:11:20', '[::1]', 1, 1, '2026-04-25 12:11:20.000', '2026-04-25 12:11:20.000', NULL);
INSERT INTO `ddz_user_accounts` VALUES (4, 4, '15888888888', '', NULL, NULL, '', '', '', 1, 'tv9uIUW1L9CKc0i2IXcIQoQXBYMQ3EB4', '2026-05-10 21:18:24', '', NULL, '', 'iPhone', '2026-05-03 21:18:24', '127.0.0.1', 20, 1, '2026-04-25 15:53:53.000', '2026-05-03 21:18:24.000', NULL);
INSERT INTO `ddz_user_accounts` VALUES (5, 5, '15208384146', '', NULL, NULL, '', '', '', 1, 'K0fLKImDSNABfVAv5HNgf8CZ3AOwj80A', '2026-05-04 21:16:37', '', NULL, '', 'Windows', '2026-04-27 21:16:37', '127.0.0.1', 15, 1, '2026-04-25 16:05:56.000', '2026-04-27 21:16:37.000', NULL);
INSERT INTO `ddz_user_accounts` VALUES (6, 7, '13999999999', '', NULL, NULL, '', '', '', 1, 'tTPp0v2CJkFVxEjGnn1L4KYxIdwWJga3', '2026-05-06 10:42:23', '', NULL, '', 'Android', '2026-04-29 10:42:23', '127.0.0.1', 1, 1, '2026-04-29 10:42:23.000', '2026-04-29 10:42:23.000', NULL);

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
