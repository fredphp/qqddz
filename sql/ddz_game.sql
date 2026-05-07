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

 Date: 07/05/2026 22:47:46
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
) ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '竞技币流水记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_coin_logs
-- ----------------------------
INSERT INTO `ddz_arena_coin_logs` VALUES (1, 4, 1000, 1000, 4, '', '增加竞技币', '2026-05-06 09:43:54');
INSERT INTO `ddz_arena_coin_logs` VALUES (2, 4, -100, 500, 5, '260507010211', '竞技场报名扣除', '2026-05-07 17:33:43');
INSERT INTO `ddz_arena_coin_logs` VALUES (3, 4, 100, 600, 6, '260507010211', '进入阶段超时返还，期号:260507010211', '2026-05-07 17:35:57');
INSERT INTO `ddz_arena_coin_logs` VALUES (4, 4, -100, 500, 5, '260507010213', '竞技场报名扣除', '2026-05-07 17:41:14');
INSERT INTO `ddz_arena_coin_logs` VALUES (5, 4, 100, 600, 6, '260507010213', '进入阶段超时返还，期号:260507010213', '2026-05-07 17:45:56');
INSERT INTO `ddz_arena_coin_logs` VALUES (6, 4, -100, 500, 5, '260507010231', '竞技场报名扣除', '2026-05-07 19:12:19');
INSERT INTO `ddz_arena_coin_logs` VALUES (7, 4, 100, 600, 6, '260507010231', '进入阶段超时返还，期号:260507010231', '2026-05-07 19:15:57');
INSERT INTO `ddz_arena_coin_logs` VALUES (8, 4, -100, 500, 5, '260507010240', '竞技场报名扣除', '2026-05-07 19:56:03');
INSERT INTO `ddz_arena_coin_logs` VALUES (9, 4, 100, 600, 6, '260507010240', '进入阶段超时返还，期号:260507010240', '2026-05-07 20:00:55');
INSERT INTO `ddz_arena_coin_logs` VALUES (10, 4, -100, 500, 5, '260507010249', '竞技场报名扣除', '2026-05-07 20:41:06');
INSERT INTO `ddz_arena_coin_logs` VALUES (11, 4, 100, 600, 6, '260507010249', '进入阶段超时返还，期号:260507010249', '2026-05-07 20:45:57');
INSERT INTO `ddz_arena_coin_logs` VALUES (12, 4, -100, 500, 5, '260507010253', '竞技场报名扣除', '2026-05-07 21:02:03');
INSERT INTO `ddz_arena_coin_logs` VALUES (13, 4, -100, 400, 5, '260507010255', '竞技场报名扣除', '2026-05-07 21:12:22');
INSERT INTO `ddz_arena_coin_logs` VALUES (14, 4, 100, 500, 6, '260507010255', '进入阶段超时返还，期号:260507010255', '2026-05-07 21:15:56');
INSERT INTO `ddz_arena_coin_logs` VALUES (15, 4, -100, 400, 5, '260507010259', '竞技场报名扣除', '2026-05-07 21:34:51');
INSERT INTO `ddz_arena_coin_logs` VALUES (16, 4, 100, 500, 6, '260507010259', '进入阶段超时返还，期号:260507010259', '2026-05-07 21:35:56');
INSERT INTO `ddz_arena_coin_logs` VALUES (17, 4, -100, 400, 5, '260507010261', '竞技场报名扣除', '2026-05-07 21:42:39');
INSERT INTO `ddz_arena_coin_logs` VALUES (18, 4, 100, 500, 6, '260507010261', '进入阶段超时返还，期号:260507010261', '2026-05-07 21:45:56');
INSERT INTO `ddz_arena_coin_logs` VALUES (19, 4, -100, 400, 5, '260507010268', '竞技场报名扣除', '2026-05-07 22:18:25');
INSERT INTO `ddz_arena_coin_logs` VALUES (20, 4, -100, 300, 5, '260507010269', '竞技场报名扣除', '2026-05-07 22:24:21');

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
  `is_robot` tinyint NOT NULL DEFAULT 0 COMMENT '是否机器人:0-否,1-是',
  `let_win_enabled` tinyint NOT NULL DEFAULT 0 COMMENT '是否启用让牌策略(决赛阶段)',
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
  INDEX `idx_participations_session_rank`(`session_id` ASC, `rank` ASC) USING BTREE,
  INDEX `idx_is_robot`(`session_id` ASC, `is_robot` ASC) USING BTREE
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
) ENGINE = InnoDB AUTO_INCREMENT = 44 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场期号玩家表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_period_players_202605
-- ----------------------------
INSERT INTO `ddz_arena_period_players_202605` VALUES (1, 'H202605060001', 65, 2, 4, '2026-05-06 17:05:53', 0, 0, 2, '2026-05-06 17:05:53');
INSERT INTO `ddz_arena_period_players_202605` VALUES (2, 'E202605060004', 81, 3, 4, '2026-05-06 18:49:31', 0, 0, 2, '2026-05-06 18:49:30');
INSERT INTO `ddz_arena_period_players_202605` VALUES (3, 'E202605060004', 81, 3, 4, '2026-05-06 18:49:37', 0, 0, 2, '2026-05-06 18:49:37');
INSERT INTO `ddz_arena_period_players_202605` VALUES (4, 'E202605060004', 81, 3, 4, '2026-05-06 18:50:50', 0, 0, 1, '2026-05-06 18:50:50');
INSERT INTO `ddz_arena_period_players_202605` VALUES (5, 'E202605060026', 135, 3, 4, '2026-05-06 19:09:54', 0, 0, 1, '2026-05-06 19:09:54');
INSERT INTO `ddz_arena_period_players_202605` VALUES (6, 'E202605060028', 141, 3, 4, '2026-05-06 19:18:38', 0, 0, 1, '2026-05-06 19:18:38');
INSERT INTO `ddz_arena_period_players_202605` VALUES (7, 'E202605060030', 147, 3, 4, '2026-05-06 19:26:41', 0, 0, 1, '2026-05-06 19:26:40');
INSERT INTO `ddz_arena_period_players_202605` VALUES (8, 'E202605060032', 153, 3, 4, '2026-05-06 19:39:03', 0, 0, 1, '2026-05-06 19:39:02');
INSERT INTO `ddz_arena_period_players_202605` VALUES (9, '260506030007', 0, 3, 4, '2026-05-06 20:10:08', 0, 0, 1, '2026-05-06 20:10:07');
INSERT INTO `ddz_arena_period_players_202605` VALUES (10, '260506020020', 0, 2, 4, '2026-05-06 20:17:37', 0, 0, 1, '2026-05-06 20:17:36');
INSERT INTO `ddz_arena_period_players_202605` VALUES (11, '260506020021', 0, 2, 4, '2026-05-06 20:28:43', 0, 0, 1, '2026-05-06 20:28:42');
INSERT INTO `ddz_arena_period_players_202605` VALUES (12, '260506030008', 0, 3, 4, '2026-05-06 20:42:18', 0, 0, 1, '2026-05-06 20:42:18');
INSERT INTO `ddz_arena_period_players_202605` VALUES (13, '260506020025', 186, 2, 4, '2026-05-06 21:06:27', 0, 0, 1, '2026-05-06 21:06:27');
INSERT INTO `ddz_arena_period_players_202605` VALUES (14, '260506020027', 192, 2, 4, '2026-05-06 21:25:41', 0, 0, 1, '2026-05-06 21:25:41');
INSERT INTO `ddz_arena_period_players_202605` VALUES (15, '260506020028', 194, 2, 4, '2026-05-06 21:37:12', 0, 0, 1, '2026-05-06 21:37:12');
INSERT INTO `ddz_arena_period_players_202605` VALUES (16, '260506020029', 197, 2, 4, '2026-05-06 21:48:28', 0, 0, 1, '2026-05-06 21:41:07');
INSERT INTO `ddz_arena_period_players_202605` VALUES (17, '260506020030', 200, 2, 4, '2026-05-06 21:56:55', 0, 0, 1, '2026-05-06 21:56:55');
INSERT INTO `ddz_arena_period_players_202605` VALUES (18, '260506020033', 209, 2, 4, '2026-05-06 22:26:23', 0, 0, 2, '2026-05-06 22:22:15');
INSERT INTO `ddz_arena_period_players_202605` VALUES (19, '260507010169', 259, 1, 4, '2026-05-07 14:01:10', 0, 0, 1, '2026-05-07 14:01:09');
INSERT INTO `ddz_arena_period_players_202605` VALUES (20, '260507010179', 0, 1, 4, '2026-05-07 14:51:34', 0, 100, 1, '2026-05-07 14:51:34');
INSERT INTO `ddz_arena_period_players_202605` VALUES (21, '260507010181', 266, 1, 4, '2026-05-07 15:01:29', 0, 100, 1, '2026-05-07 15:01:01');
INSERT INTO `ddz_arena_period_players_202605` VALUES (22, '260507010193', 278, 1, 4, '2026-05-07 16:02:09', 0, 100, 1, '2026-05-07 16:02:09');
INSERT INTO `ddz_arena_period_players_202605` VALUES (23, '260507010202', 289, 1, 4, '2026-05-07 16:48:52', 0, 100, 1, '2026-05-07 16:48:52');
INSERT INTO `ddz_arena_period_players_202605` VALUES (24, '260507010202', 289, 1, 12, '2026-05-07 16:50:01', 2, 0, 1, '2026-05-07 16:50:00');
INSERT INTO `ddz_arena_period_players_202605` VALUES (25, '260507010202', 289, 1, 13, '2026-05-07 16:50:01', 3, 0, 1, '2026-05-07 16:50:00');
INSERT INTO `ddz_arena_period_players_202605` VALUES (26, '260507010205', 293, 1, 4, '2026-05-07 17:03:22', 0, 100, 1, '2026-05-07 17:03:22');
INSERT INTO `ddz_arena_period_players_202605` VALUES (27, '260507010205', 293, 1, 9, '2026-05-07 17:05:01', 2, 0, 1, '2026-05-07 17:05:00');
INSERT INTO `ddz_arena_period_players_202605` VALUES (28, '260507010205', 293, 1, 17, '2026-05-07 17:05:01', 3, 0, 1, '2026-05-07 17:05:00');
INSERT INTO `ddz_arena_period_players_202605` VALUES (29, '260507010211', 304, 1, 4, '2026-05-07 17:33:43', 0, 100, 1, '2026-05-07 17:33:43');
INSERT INTO `ddz_arena_period_players_202605` VALUES (30, '260507010211', 304, 1, 11, '2026-05-07 17:35:00', 2, 0, 1, '2026-05-07 17:35:00');
INSERT INTO `ddz_arena_period_players_202605` VALUES (31, '260507010211', 304, 1, 18, '2026-05-07 17:35:00', 3, 0, 1, '2026-05-07 17:35:00');
INSERT INTO `ddz_arena_period_players_202605` VALUES (32, '260507010213', 308, 1, 4, '2026-05-07 17:41:14', 0, 100, 1, '2026-05-07 17:41:13');
INSERT INTO `ddz_arena_period_players_202605` VALUES (33, '260507010213', 308, 1, 10, '2026-05-07 17:45:00', 2, 0, 1, '2026-05-07 17:45:00');
INSERT INTO `ddz_arena_period_players_202605` VALUES (34, '260507010213', 308, 1, 16, '2026-05-07 17:45:00', 3, 0, 1, '2026-05-07 17:45:00');
INSERT INTO `ddz_arena_period_players_202605` VALUES (35, '260507010231', 0, 1, 4, '2026-05-07 19:12:19', 0, 100, 1, '2026-05-07 19:12:19');
INSERT INTO `ddz_arena_period_players_202605` VALUES (36, '260507010240', 0, 1, 4, '2026-05-07 19:56:03', 0, 100, 1, '2026-05-07 19:56:03');
INSERT INTO `ddz_arena_period_players_202605` VALUES (37, '260507010249', 371, 1, 4, '2026-05-07 20:41:06', 0, 100, 1, '2026-05-07 20:41:05');
INSERT INTO `ddz_arena_period_players_202605` VALUES (38, '260507010253', 0, 1, 4, '2026-05-07 21:02:03', 0, 100, 1, '2026-05-07 21:02:02');
INSERT INTO `ddz_arena_period_players_202605` VALUES (39, '260507010255', 378, 1, 4, '2026-05-07 21:12:22', 0, 100, 1, '2026-05-07 21:12:22');
INSERT INTO `ddz_arena_period_players_202605` VALUES (40, '260507010259', 384, 1, 4, '2026-05-07 21:34:51', 0, 100, 1, '2026-05-07 21:34:50');
INSERT INTO `ddz_arena_period_players_202605` VALUES (41, '260507010261', 387, 1, 4, '2026-05-07 21:42:39', 0, 100, 1, '2026-05-07 21:42:39');
INSERT INTO `ddz_arena_period_players_202605` VALUES (42, '260507010268', 402, 1, 4, '2026-05-07 22:18:25', 0, 100, 1, '2026-05-07 22:18:24');
INSERT INTO `ddz_arena_period_players_202605` VALUES (43, '260507010269', 403, 1, 4, '2026-05-07 22:24:21', 0, 100, 1, '2026-05-07 22:24:20');

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场期号玩家表(月份分表)' ROW_FORMAT = Dynamic;

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
) ENGINE = InnoDB AUTO_INCREMENT = 412 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场期号表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_periods_202605
-- ----------------------------
INSERT INTO `ddz_arena_periods_202605` VALUES (1, 'H202605060033', 2, 2, 33, '2026-05-06 12:40:00', '2026-05-06 12:41:00', '2026-05-06 12:45:00', '2026-05-06 12:45:00', 0, 0, 0, 2, NULL, '2026-05-06 19:45:01', '2026-05-06 12:40:00', '2026-05-06 19:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (2, 'M202605060025', 1, 1, 25, '2026-05-06 12:40:00', '2026-05-06 12:41:00', '2026-05-06 12:45:00', '2026-05-06 12:45:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 12:40:00', '2026-05-06 12:41:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (3, 'M202605060026', 1, 1, 26, '2026-05-06 12:45:00', '2026-05-06 12:46:00', '2026-05-06 12:50:00', '2026-05-06 12:50:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 12:45:00', '2026-05-06 12:46:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (4, 'H202605060034', 2, 2, 34, '2026-05-06 12:45:00', '2026-05-06 12:46:00', '2026-05-06 12:50:00', '2026-05-06 12:50:00', 0, 0, 0, 2, NULL, '2026-05-06 19:50:00', '2026-05-06 12:45:00', '2026-05-06 19:50:00');
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
INSERT INTO `ddz_arena_periods_202605` VALUES (38, 'M202605060057', 1, 1, 57, '2026-05-06 15:20:00', '2026-05-06 15:21:00', '2026-05-06 15:25:00', '2026-05-06 15:25:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 15:20:00', '2026-05-06 15:21:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (39, 'M202605060058', 1, 1, 58, '2026-05-06 15:25:00', '2026-05-06 15:26:00', '2026-05-06 15:30:00', '2026-05-06 15:30:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 15:25:00', '2026-05-06 15:26:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (40, 'M202605060059', 1, 1, 59, '2026-05-06 15:30:00', '2026-05-06 15:31:00', '2026-05-06 15:35:00', '2026-05-06 15:35:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 15:30:00', '2026-05-06 15:31:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (41, 'M202605060060', 1, 1, 60, '2026-05-06 15:35:00', '2026-05-06 15:36:00', '2026-05-06 15:40:00', '2026-05-06 15:40:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 15:35:00', '2026-05-06 15:36:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (42, 'M202605060061', 1, 1, 61, '2026-05-06 15:40:00', '2026-05-06 15:41:00', '2026-05-06 15:45:00', '2026-05-06 15:45:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 15:40:00', '2026-05-06 15:41:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (43, 'M202605060062', 1, 1, 62, '2026-05-06 15:45:00', '2026-05-06 15:46:00', '2026-05-06 15:50:00', '2026-05-06 15:50:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 15:45:00', '2026-05-06 15:46:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (44, 'M202605060063', 1, 1, 63, '2026-05-06 15:50:00', '2026-05-06 15:51:00', '2026-05-06 15:55:00', '2026-05-06 15:55:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 15:50:00', '2026-05-06 15:51:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (45, 'M202605060064', 1, 1, 64, '2026-05-06 15:55:00', '2026-05-06 15:56:00', '2026-05-06 16:00:00', '2026-05-06 16:00:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 15:55:00', '2026-05-06 15:56:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (46, 'M202605060065', 1, 1, 65, '2026-05-06 16:00:00', '2026-05-06 16:01:00', '2026-05-06 16:05:00', '2026-05-06 16:05:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 16:00:00', '2026-05-06 16:01:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (47, 'M202605060066', 1, 1, 66, '2026-05-06 16:05:00', '2026-05-06 16:06:00', '2026-05-06 16:10:00', '2026-05-06 16:10:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 16:05:00', '2026-05-06 16:06:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (48, 'M202605060067', 1, 1, 67, '2026-05-06 16:10:00', '2026-05-06 16:11:00', '2026-05-06 16:15:00', '2026-05-06 16:15:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 16:10:00', '2026-05-06 16:11:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (49, 'M202605060068', 1, 1, 68, '2026-05-06 16:15:00', '2026-05-06 16:16:00', '2026-05-06 16:20:00', '2026-05-06 16:20:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 16:15:00', '2026-05-06 16:16:01');
INSERT INTO `ddz_arena_periods_202605` VALUES (50, 'M202605060069', 1, 1, 69, '2026-05-06 16:20:00', '2026-05-06 16:21:00', '2026-05-06 16:25:00', '2026-05-06 16:25:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 16:20:00', '2026-05-06 16:21:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (51, 'M202605060070', 1, 1, 70, '2026-05-06 16:25:00', '2026-05-06 16:26:00', '2026-05-06 16:30:00', '2026-05-06 16:30:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 16:25:00', '2026-05-06 16:26:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (52, 'M202605060071', 1, 1, 71, '2026-05-06 16:30:00', '2026-05-06 16:31:00', '2026-05-06 16:35:00', '2026-05-06 16:35:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 16:30:00', '2026-05-06 16:31:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (53, 'M202605060072', 1, 1, 72, '2026-05-06 16:35:00', '2026-05-06 16:36:00', '2026-05-06 16:40:00', '2026-05-06 16:40:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 16:35:00', '2026-05-06 16:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (54, 'M202605060073', 1, 1, 73, '2026-05-06 16:40:00', '2026-05-06 16:41:00', '2026-05-06 16:45:00', '2026-05-06 16:45:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 16:40:00', '2026-05-06 16:41:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (55, 'M202605060074', 1, 1, 74, '2026-05-06 16:45:00', '2026-05-06 16:46:00', '2026-05-06 16:50:00', '2026-05-06 16:50:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 16:45:00', '2026-05-06 16:46:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (60, 'M202605060075', 1, 1, 75, '2026-05-06 16:50:00', '2026-05-06 16:51:00', '2026-05-06 16:55:00', '2026-05-06 16:55:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 16:50:00', '2026-05-06 16:51:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (63, 'M202605060076', 1, 1, 76, '2026-05-06 16:55:00', '2026-05-06 16:56:00', '2026-05-06 17:00:00', '2026-05-06 17:00:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 16:55:00', '2026-05-06 16:56:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (64, 'M202605060077', 1, 1, 77, '2026-05-06 17:00:00', '2026-05-06 17:01:00', '2026-05-06 17:05:00', '2026-05-06 17:05:00', 0, 0, 0, 2, NULL, '2026-05-06 17:05:01', '2026-05-06 17:00:00', '2026-05-06 17:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (65, 'H202605060001', 2, 2, 1, '2026-05-06 17:00:00', '2026-05-06 17:01:00', '2026-05-06 17:05:00', '2026-05-06 17:05:00', 1, 1, 0, 2, NULL, '2026-05-06 17:05:01', '2026-05-06 17:00:00', '2026-05-06 17:09:25');
INSERT INTO `ddz_arena_periods_202605` VALUES (66, 'E202605060001', 3, 3, 1, '2026-05-06 17:00:00', '2026-05-06 17:01:00', '2026-05-06 17:05:00', '2026-05-06 17:05:00', 0, 0, 0, 2, NULL, '2026-05-06 17:05:01', '2026-05-06 17:00:00', '2026-05-06 17:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (67, 'M202605060078', 1, 1, 78, '2026-05-06 17:05:00', '2026-05-06 17:06:00', '2026-05-06 17:10:00', '2026-05-06 17:10:00', 0, 0, 0, 2, NULL, '2026-05-06 17:10:01', '2026-05-06 17:05:00', '2026-05-06 17:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (68, 'H202605060002', 2, 2, 2, '2026-05-06 17:05:00', '2026-05-06 17:06:00', '2026-05-06 17:10:00', '2026-05-06 17:10:00', 0, 0, 0, 2, NULL, '2026-05-06 17:10:01', '2026-05-06 17:05:00', '2026-05-06 17:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (69, 'E202605060002', 3, 3, 2, '2026-05-06 17:05:00', '2026-05-06 17:06:00', '2026-05-06 17:10:00', '2026-05-06 17:10:00', 0, 0, 0, 2, NULL, '2026-05-06 17:10:01', '2026-05-06 17:05:00', '2026-05-06 17:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (76, 'M202605060079', 1, 1, 79, '2026-05-06 17:10:00', '2026-05-06 17:11:00', '2026-05-06 17:15:00', '2026-05-06 17:15:00', 0, 0, 0, 2, NULL, '2026-05-06 17:15:00', '2026-05-06 17:10:00', '2026-05-06 17:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (77, 'H202605060003', 2, 2, 3, '2026-05-06 17:10:00', '2026-05-06 17:11:00', '2026-05-06 17:15:00', '2026-05-06 17:15:00', 0, 0, 0, 2, NULL, '2026-05-06 17:15:00', '2026-05-06 17:10:00', '2026-05-06 17:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (78, 'E202605060003', 3, 3, 3, '2026-05-06 17:10:00', '2026-05-06 17:11:00', '2026-05-06 17:15:00', '2026-05-06 17:15:00', 0, 0, 0, 2, NULL, '2026-05-06 17:15:00', '2026-05-06 17:10:00', '2026-05-06 17:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (79, 'M202605060080', 1, 1, 80, '2026-05-06 17:15:00', '2026-05-06 17:16:00', '2026-05-06 17:20:00', '2026-05-06 17:20:00', 0, 0, 0, 2, NULL, '2026-05-06 17:20:01', '2026-05-06 17:15:00', '2026-05-06 17:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (80, 'H202605060004', 2, 2, 4, '2026-05-06 17:15:00', '2026-05-06 17:16:00', '2026-05-06 17:20:00', '2026-05-06 17:20:00', 0, 0, 0, 2, NULL, '2026-05-06 17:20:01', '2026-05-06 17:15:00', '2026-05-06 17:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (81, 'E202605060004', 3, 3, 4, '2026-05-06 17:15:00', '2026-05-06 17:16:00', '2026-05-06 17:20:00', '2026-05-06 17:20:00', 3, 2, 0, 2, NULL, '2026-05-06 17:20:01', '2026-05-06 17:15:00', '2026-05-06 18:50:50');
INSERT INTO `ddz_arena_periods_202605` VALUES (82, 'M202605060081', 1, 1, 81, '2026-05-06 17:20:00', '2026-05-06 17:21:00', '2026-05-06 17:25:00', '2026-05-06 17:25:00', 0, 0, 0, 2, NULL, '2026-05-06 17:25:01', '2026-05-06 17:20:00', '2026-05-06 17:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (83, 'H202605060005', 2, 2, 5, '2026-05-06 17:20:00', '2026-05-06 17:21:00', '2026-05-06 17:25:00', '2026-05-06 17:25:00', 0, 0, 0, 2, NULL, '2026-05-06 17:25:01', '2026-05-06 17:20:00', '2026-05-06 17:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (84, 'E202605060005', 3, 3, 5, '2026-05-06 17:20:00', '2026-05-06 17:21:00', '2026-05-06 17:25:00', '2026-05-06 17:25:00', 0, 0, 0, 2, NULL, '2026-05-06 17:25:01', '2026-05-06 17:20:00', '2026-05-06 17:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (85, 'M202605060082', 1, 1, 82, '2026-05-06 17:25:00', '2026-05-06 17:26:00', '2026-05-06 17:30:00', '2026-05-06 17:30:00', 0, 0, 0, 2, NULL, '2026-05-06 18:02:56', '2026-05-06 17:25:00', '2026-05-06 18:02:55');
INSERT INTO `ddz_arena_periods_202605` VALUES (86, 'H202605060006', 2, 2, 6, '2026-05-06 17:25:00', '2026-05-06 17:26:00', '2026-05-06 17:30:00', '2026-05-06 17:30:00', 0, 0, 0, 2, NULL, '2026-05-06 18:02:56', '2026-05-06 17:25:00', '2026-05-06 18:02:55');
INSERT INTO `ddz_arena_periods_202605` VALUES (87, 'E202605060006', 3, 3, 6, '2026-05-06 17:25:00', '2026-05-06 17:26:00', '2026-05-06 17:30:00', '2026-05-06 17:30:00', 0, 0, 0, 2, NULL, '2026-05-06 18:02:56', '2026-05-06 17:25:00', '2026-05-06 18:02:55');
INSERT INTO `ddz_arena_periods_202605` VALUES (88, 'M202605060089', 1, 1, 89, '2026-05-06 18:00:00', '2026-05-06 18:01:00', '2026-05-06 18:05:00', '2026-05-06 18:05:00', 0, 0, 0, 2, NULL, '2026-05-06 18:05:01', '2026-05-06 18:02:55', '2026-05-06 18:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (89, 'H202605060013', 2, 2, 13, '2026-05-06 18:00:00', '2026-05-06 18:01:00', '2026-05-06 18:05:00', '2026-05-06 18:05:00', 0, 0, 0, 2, NULL, '2026-05-06 18:05:01', '2026-05-06 18:02:55', '2026-05-06 18:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (90, 'E202605060013', 3, 3, 13, '2026-05-06 18:00:00', '2026-05-06 18:01:00', '2026-05-06 18:05:00', '2026-05-06 18:05:00', 0, 0, 0, 2, NULL, '2026-05-06 18:05:01', '2026-05-06 18:02:55', '2026-05-06 18:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (91, 'M202605060090', 1, 1, 90, '2026-05-06 18:05:00', '2026-05-06 18:06:00', '2026-05-06 18:10:00', '2026-05-06 18:10:00', 0, 0, 0, 2, NULL, '2026-05-06 18:10:00', '2026-05-06 18:05:00', '2026-05-06 18:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (92, 'H202605060014', 2, 2, 14, '2026-05-06 18:05:00', '2026-05-06 18:06:00', '2026-05-06 18:10:00', '2026-05-06 18:10:00', 0, 0, 0, 2, NULL, '2026-05-06 18:10:00', '2026-05-06 18:05:00', '2026-05-06 18:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (93, 'E202605060014', 3, 3, 14, '2026-05-06 18:05:00', '2026-05-06 18:06:00', '2026-05-06 18:10:00', '2026-05-06 18:10:00', 0, 0, 0, 2, NULL, '2026-05-06 18:10:00', '2026-05-06 18:05:00', '2026-05-06 18:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (94, 'M202605060091', 1, 1, 91, '2026-05-06 18:10:00', '2026-05-06 18:11:00', '2026-05-06 18:15:00', '2026-05-06 18:15:00', 0, 0, 0, 2, NULL, '2026-05-06 18:15:00', '2026-05-06 18:10:00', '2026-05-06 18:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (95, 'H202605060015', 2, 2, 15, '2026-05-06 18:10:00', '2026-05-06 18:11:00', '2026-05-06 18:15:00', '2026-05-06 18:15:00', 0, 0, 0, 2, NULL, '2026-05-06 18:15:00', '2026-05-06 18:10:00', '2026-05-06 18:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (96, 'E202605060015', 3, 3, 15, '2026-05-06 18:10:00', '2026-05-06 18:11:00', '2026-05-06 18:15:00', '2026-05-06 18:15:00', 0, 0, 0, 2, NULL, '2026-05-06 18:15:00', '2026-05-06 18:10:00', '2026-05-06 18:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (97, 'M202605060092', 1, 1, 92, '2026-05-06 18:15:00', '2026-05-06 18:16:00', '2026-05-06 18:20:00', '2026-05-06 18:20:00', 0, 0, 0, 2, NULL, '2026-05-06 18:20:00', '2026-05-06 18:15:00', '2026-05-06 18:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (98, 'H202605060016', 2, 2, 16, '2026-05-06 18:15:00', '2026-05-06 18:16:00', '2026-05-06 18:20:00', '2026-05-06 18:20:00', 0, 0, 0, 2, NULL, '2026-05-06 18:20:00', '2026-05-06 18:15:00', '2026-05-06 18:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (99, 'E202605060016', 3, 3, 16, '2026-05-06 18:15:00', '2026-05-06 18:16:00', '2026-05-06 18:20:00', '2026-05-06 18:20:00', 0, 0, 0, 2, NULL, '2026-05-06 18:20:00', '2026-05-06 18:15:00', '2026-05-06 18:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (100, 'M202605060093', 1, 1, 93, '2026-05-06 18:20:00', '2026-05-06 18:21:00', '2026-05-06 18:25:00', '2026-05-06 18:25:00', 0, 0, 0, 2, NULL, '2026-05-06 18:25:01', '2026-05-06 18:20:00', '2026-05-06 18:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (101, 'H202605060017', 2, 2, 17, '2026-05-06 18:20:00', '2026-05-06 18:21:00', '2026-05-06 18:25:00', '2026-05-06 18:25:00', 0, 0, 0, 2, NULL, '2026-05-06 18:25:01', '2026-05-06 18:20:00', '2026-05-06 18:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (102, 'E202605060017', 3, 3, 17, '2026-05-06 18:20:00', '2026-05-06 18:21:00', '2026-05-06 18:25:00', '2026-05-06 18:25:00', 0, 0, 0, 2, NULL, '2026-05-06 18:25:01', '2026-05-06 18:20:00', '2026-05-06 18:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (103, 'M202605060094', 1, 1, 94, '2026-05-06 18:25:00', '2026-05-06 18:26:00', '2026-05-06 18:30:00', '2026-05-06 18:30:00', 0, 0, 0, 2, NULL, '2026-05-06 18:30:01', '2026-05-06 18:25:00', '2026-05-06 18:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (104, 'H202605060018', 2, 2, 18, '2026-05-06 18:25:00', '2026-05-06 18:26:00', '2026-05-06 18:30:00', '2026-05-06 18:30:00', 0, 0, 0, 2, NULL, '2026-05-06 18:30:01', '2026-05-06 18:25:00', '2026-05-06 18:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (105, 'E202605060018', 3, 3, 18, '2026-05-06 18:25:00', '2026-05-06 18:26:00', '2026-05-06 18:30:00', '2026-05-06 18:30:00', 0, 0, 0, 2, NULL, '2026-05-06 18:30:01', '2026-05-06 18:25:00', '2026-05-06 18:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (106, 'M202605060095', 1, 1, 95, '2026-05-06 18:30:00', '2026-05-06 18:31:00', '2026-05-06 18:35:00', '2026-05-06 18:35:00', 0, 0, 0, 2, NULL, '2026-05-06 18:35:01', '2026-05-06 18:30:00', '2026-05-06 18:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (107, 'H202605060019', 2, 2, 19, '2026-05-06 18:30:00', '2026-05-06 18:31:00', '2026-05-06 18:35:00', '2026-05-06 18:35:00', 0, 0, 0, 2, NULL, '2026-05-06 18:35:01', '2026-05-06 18:30:00', '2026-05-06 18:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (108, 'E202605060019', 3, 3, 19, '2026-05-06 18:30:00', '2026-05-06 18:31:00', '2026-05-06 18:35:00', '2026-05-06 18:35:00', 0, 0, 0, 2, NULL, '2026-05-06 18:35:01', '2026-05-06 18:30:00', '2026-05-06 18:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (115, 'M202605060096', 1, 1, 96, '2026-05-06 18:35:00', '2026-05-06 18:36:00', '2026-05-06 18:40:00', '2026-05-06 18:40:00', 0, 0, 0, 2, NULL, '2026-05-06 18:40:00', '2026-05-06 18:35:00', '2026-05-06 18:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (116, 'H202605060020', 2, 2, 20, '2026-05-06 18:35:00', '2026-05-06 18:36:00', '2026-05-06 18:40:00', '2026-05-06 18:40:00', 0, 0, 0, 2, NULL, '2026-05-06 18:40:00', '2026-05-06 18:35:00', '2026-05-06 18:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (117, 'E202605060020', 3, 3, 20, '2026-05-06 18:35:00', '2026-05-06 18:36:00', '2026-05-06 18:40:00', '2026-05-06 18:40:00', 0, 0, 0, 2, NULL, '2026-05-06 18:40:00', '2026-05-06 18:35:00', '2026-05-06 18:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (118, 'M202605060097', 1, 1, 97, '2026-05-06 18:40:00', '2026-05-06 18:41:00', '2026-05-06 18:45:00', '2026-05-06 18:45:00', 0, 0, 0, 2, NULL, '2026-05-06 18:45:01', '2026-05-06 18:40:00', '2026-05-06 18:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (119, 'H202605060021', 2, 2, 21, '2026-05-06 18:40:00', '2026-05-06 18:41:00', '2026-05-06 18:45:00', '2026-05-06 18:45:00', 0, 0, 0, 2, NULL, '2026-05-06 18:45:01', '2026-05-06 18:40:00', '2026-05-06 18:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (120, 'E202605060021', 3, 3, 21, '2026-05-06 18:40:00', '2026-05-06 18:41:00', '2026-05-06 18:45:00', '2026-05-06 18:45:00', 0, 0, 0, 2, NULL, '2026-05-06 18:45:01', '2026-05-06 18:40:00', '2026-05-06 18:45:01');
INSERT INTO `ddz_arena_periods_202605` VALUES (121, 'M202605060098', 1, 1, 98, '2026-05-06 18:45:00', '2026-05-06 18:46:00', '2026-05-06 18:50:00', '2026-05-06 18:50:00', 0, 0, 0, 2, NULL, '2026-05-06 18:50:00', '2026-05-06 18:45:00', '2026-05-06 18:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (122, 'H202605060022', 2, 2, 22, '2026-05-06 18:45:00', '2026-05-06 18:46:00', '2026-05-06 18:50:00', '2026-05-06 18:50:00', 0, 0, 0, 2, NULL, '2026-05-06 18:50:00', '2026-05-06 18:45:01', '2026-05-06 18:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (123, 'E202605060022', 3, 3, 22, '2026-05-06 18:45:00', '2026-05-06 18:46:00', '2026-05-06 18:50:00', '2026-05-06 18:50:00', 0, 0, 0, 2, NULL, '2026-05-06 18:50:01', '2026-05-06 18:45:01', '2026-05-06 18:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (124, 'M202605060099', 1, 1, 99, '2026-05-06 18:50:00', '2026-05-06 18:51:00', '2026-05-06 18:55:00', '2026-05-06 18:55:00', 0, 0, 0, 2, NULL, '2026-05-06 18:55:00', '2026-05-06 18:50:00', '2026-05-06 18:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (125, 'H202605060023', 2, 2, 23, '2026-05-06 18:50:00', '2026-05-06 18:51:00', '2026-05-06 18:55:00', '2026-05-06 18:55:00', 0, 0, 0, 2, NULL, '2026-05-06 18:55:00', '2026-05-06 18:50:00', '2026-05-06 18:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (126, 'E202605060023', 3, 3, 23, '2026-05-06 18:50:00', '2026-05-06 18:51:00', '2026-05-06 18:55:00', '2026-05-06 18:55:00', 0, 0, 0, 2, NULL, '2026-05-06 18:55:00', '2026-05-06 18:50:00', '2026-05-06 18:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (127, 'M202605060100', 1, 1, 100, '2026-05-06 18:55:00', '2026-05-06 18:56:00', '2026-05-06 19:00:00', '2026-05-06 19:00:00', 0, 0, 0, 2, NULL, '2026-05-06 19:00:00', '2026-05-06 18:55:00', '2026-05-06 19:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (128, 'H202605060024', 2, 2, 24, '2026-05-06 18:55:00', '2026-05-06 18:56:00', '2026-05-06 19:00:00', '2026-05-06 19:00:00', 0, 0, 0, 2, NULL, '2026-05-06 19:00:00', '2026-05-06 18:55:00', '2026-05-06 19:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (129, 'E202605060024', 3, 3, 24, '2026-05-06 18:55:00', '2026-05-06 18:56:00', '2026-05-06 19:00:00', '2026-05-06 19:00:00', 0, 0, 0, 2, NULL, '2026-05-06 19:00:00', '2026-05-06 18:55:00', '2026-05-06 19:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (130, 'M202605060101', 1, 1, 101, '2026-05-06 19:00:00', '2026-05-06 19:01:00', '2026-05-06 19:05:00', '2026-05-06 19:05:00', 0, 0, 0, 2, NULL, '2026-05-06 19:05:01', '2026-05-06 19:00:00', '2026-05-06 19:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (131, 'H202605060025', 2, 2, 25, '2026-05-06 19:00:00', '2026-05-06 19:01:00', '2026-05-06 19:05:00', '2026-05-06 19:05:00', 0, 0, 0, 2, NULL, '2026-05-06 19:05:01', '2026-05-06 19:00:00', '2026-05-06 19:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (132, 'E202605060025', 3, 3, 25, '2026-05-06 19:00:00', '2026-05-06 19:01:00', '2026-05-06 19:05:00', '2026-05-06 19:05:00', 0, 0, 0, 2, NULL, '2026-05-06 19:05:01', '2026-05-06 19:00:00', '2026-05-06 19:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (133, 'M202605060102', 1, 1, 102, '2026-05-06 19:05:00', '2026-05-06 19:06:00', '2026-05-06 19:10:00', '2026-05-06 19:10:00', 0, 0, 0, 2, NULL, '2026-05-06 19:10:01', '2026-05-06 19:05:00', '2026-05-06 19:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (134, 'H202605060026', 2, 2, 26, '2026-05-06 19:05:00', '2026-05-06 19:06:00', '2026-05-06 19:10:00', '2026-05-06 19:10:00', 0, 0, 0, 2, NULL, '2026-05-06 19:10:01', '2026-05-06 19:05:00', '2026-05-06 19:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (135, 'E202605060026', 3, 3, 26, '2026-05-06 19:05:00', '2026-05-06 19:06:00', '2026-05-06 19:10:00', '2026-05-06 19:10:00', 1, 0, 1, 2, NULL, '2026-05-06 19:10:01', '2026-05-06 19:05:00', '2026-05-06 19:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (136, 'M202605060103', 1, 1, 103, '2026-05-06 19:10:00', '2026-05-06 19:11:00', '2026-05-06 19:15:00', '2026-05-06 19:15:00', 0, 0, 0, 2, NULL, '2026-05-06 19:15:00', '2026-05-06 19:10:00', '2026-05-06 19:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (137, 'H202605060027', 2, 2, 27, '2026-05-06 19:10:00', '2026-05-06 19:11:00', '2026-05-06 19:15:00', '2026-05-06 19:15:00', 0, 0, 0, 2, NULL, '2026-05-06 19:15:00', '2026-05-06 19:10:00', '2026-05-06 19:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (138, 'E202605060027', 3, 3, 27, '2026-05-06 19:10:00', '2026-05-06 19:11:00', '2026-05-06 19:15:00', '2026-05-06 19:15:00', 0, 0, 0, 2, NULL, '2026-05-06 19:15:00', '2026-05-06 19:10:00', '2026-05-06 19:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (139, 'M202605060104', 1, 1, 104, '2026-05-06 19:15:00', '2026-05-06 19:16:00', '2026-05-06 19:20:00', '2026-05-06 19:20:00', 0, 0, 0, 2, NULL, '2026-05-06 19:20:01', '2026-05-06 19:15:00', '2026-05-06 19:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (140, 'H202605060028', 2, 2, 28, '2026-05-06 19:15:00', '2026-05-06 19:16:00', '2026-05-06 19:20:00', '2026-05-06 19:20:00', 0, 0, 0, 2, NULL, '2026-05-06 19:20:01', '2026-05-06 19:15:00', '2026-05-06 19:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (141, 'E202605060028', 3, 3, 28, '2026-05-06 19:15:00', '2026-05-06 19:16:00', '2026-05-06 19:20:00', '2026-05-06 19:20:00', 1, 0, 1, 2, NULL, '2026-05-06 19:20:01', '2026-05-06 19:15:00', '2026-05-06 19:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (142, 'M202605060105', 1, 1, 105, '2026-05-06 19:20:00', '2026-05-06 19:21:00', '2026-05-06 19:25:00', '2026-05-06 19:25:00', 0, 0, 0, 2, NULL, '2026-05-06 19:25:00', '2026-05-06 19:20:00', '2026-05-06 19:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (143, 'H202605060029', 2, 2, 29, '2026-05-06 19:20:00', '2026-05-06 19:21:00', '2026-05-06 19:25:00', '2026-05-06 19:25:00', 0, 0, 0, 2, NULL, '2026-05-06 19:25:00', '2026-05-06 19:20:00', '2026-05-06 19:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (144, 'E202605060029', 3, 3, 29, '2026-05-06 19:20:00', '2026-05-06 19:21:00', '2026-05-06 19:25:00', '2026-05-06 19:25:00', 0, 0, 0, 2, NULL, '2026-05-06 19:25:00', '2026-05-06 19:20:00', '2026-05-06 19:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (145, 'M202605060106', 1, 1, 106, '2026-05-06 19:25:00', '2026-05-06 19:26:00', '2026-05-06 19:30:00', '2026-05-06 19:30:00', 0, 0, 0, 2, NULL, '2026-05-06 19:30:00', '2026-05-06 19:25:00', '2026-05-06 19:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (146, 'H202605060030', 2, 2, 30, '2026-05-06 19:25:00', '2026-05-06 19:26:00', '2026-05-06 19:30:00', '2026-05-06 19:30:00', 0, 0, 0, 2, NULL, '2026-05-06 19:30:00', '2026-05-06 19:25:00', '2026-05-06 19:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (147, 'E202605060030', 3, 3, 30, '2026-05-06 19:25:00', '2026-05-06 19:26:00', '2026-05-06 19:30:00', '2026-05-06 19:30:00', 1, 0, 1, 2, NULL, '2026-05-06 19:30:00', '2026-05-06 19:25:00', '2026-05-06 19:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (148, 'M202605060107', 1, 1, 107, '2026-05-06 19:30:00', '2026-05-06 19:31:00', '2026-05-06 19:35:00', '2026-05-06 19:35:00', 0, 0, 0, 2, NULL, '2026-05-06 19:35:01', '2026-05-06 19:30:00', '2026-05-06 19:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (149, 'E202605060031', 3, 3, 31, '2026-05-06 19:30:00', '2026-05-06 19:31:00', '2026-05-06 19:35:00', '2026-05-06 19:35:00', 0, 0, 0, 2, NULL, '2026-05-06 19:35:01', '2026-05-06 19:30:00', '2026-05-06 19:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (150, 'H202605060031', 2, 2, 31, '2026-05-06 19:30:00', '2026-05-06 19:31:00', '2026-05-06 19:35:00', '2026-05-06 19:35:00', 0, 0, 0, 2, NULL, '2026-05-06 19:35:01', '2026-05-06 19:30:00', '2026-05-06 19:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (151, 'M202605060108', 1, 1, 108, '2026-05-06 19:35:00', '2026-05-06 19:36:00', '2026-05-06 19:40:00', '2026-05-06 19:40:00', 0, 0, 0, 2, NULL, '2026-05-06 19:40:01', '2026-05-06 19:35:00', '2026-05-06 19:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (152, 'H202605060032', 2, 2, 32, '2026-05-06 19:35:00', '2026-05-06 19:36:00', '2026-05-06 19:40:00', '2026-05-06 19:40:00', 0, 0, 0, 2, NULL, '2026-05-06 19:40:01', '2026-05-06 19:35:00', '2026-05-06 19:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (153, 'E202605060032', 3, 3, 32, '2026-05-06 19:35:00', '2026-05-06 19:36:00', '2026-05-06 19:40:00', '2026-05-06 19:40:00', 1, 0, 1, 2, NULL, '2026-05-06 19:40:01', '2026-05-06 19:35:00', '2026-05-06 19:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (154, 'M202605060109', 1, 1, 109, '2026-05-06 19:40:00', '2026-05-06 19:41:00', '2026-05-06 19:45:00', '2026-05-06 19:45:00', 0, 0, 0, 2, NULL, '2026-05-06 19:45:01', '2026-05-06 19:40:00', '2026-05-06 19:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (156, 'E202605060033', 3, 3, 33, '2026-05-06 19:40:00', '2026-05-06 19:41:00', '2026-05-06 19:45:00', '2026-05-06 19:45:00', 0, 0, 0, 2, NULL, '2026-05-06 19:45:01', '2026-05-06 19:40:00', '2026-05-06 19:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (157, 'M202605060110', 1, 1, 110, '2026-05-06 19:45:00', '2026-05-06 19:46:00', '2026-05-06 19:50:00', '2026-05-06 19:50:00', 0, 0, 0, 2, NULL, '2026-05-06 19:50:00', '2026-05-06 19:45:00', '2026-05-06 19:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (159, 'E202605060034', 3, 3, 34, '2026-05-06 19:45:00', '2026-05-06 19:46:00', '2026-05-06 19:50:00', '2026-05-06 19:50:00', 0, 0, 0, 2, NULL, '2026-05-06 19:50:00', '2026-05-06 19:45:00', '2026-05-06 19:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (160, 'M202605060111', 1, 1, 111, '2026-05-06 19:50:00', '2026-05-06 19:51:00', '2026-05-06 19:55:00', '2026-05-06 19:55:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 19:50:00', '2026-05-06 19:51:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (162, 'E202605060035', 3, 3, 35, '2026-05-06 19:50:00', '2026-05-06 19:51:00', '2026-05-06 19:55:00', '2026-05-06 19:55:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 19:50:00', '2026-05-06 19:51:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (163, '260506020037', 2, 2, 37, '2026-05-06 20:00:00', '2026-05-06 20:01:00', '2026-05-06 20:05:00', '2026-05-06 20:05:00', 0, 0, 0, 2, NULL, '2026-05-06 23:10:00', '2026-05-06 20:00:00', '2026-05-06 23:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (164, '260506010113', 1, 1, 113, '2026-05-06 20:00:00', '2026-05-06 20:01:00', '2026-05-06 20:05:00', '2026-05-06 20:05:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 20:00:00', '2026-05-06 20:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (165, '260506030007', 3, 3, 7, '2026-05-06 20:00:00', '2026-05-06 20:01:00', '2026-05-06 20:30:00', '2026-05-06 20:05:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 20:03:52', '2026-05-06 20:03:52');
INSERT INTO `ddz_arena_periods_202605` VALUES (166, '260506010114', 1, 1, 114, '2026-05-06 20:05:00', '2026-05-06 20:06:00', '2026-05-06 20:10:00', '2026-05-06 20:10:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 20:05:00', '2026-05-06 20:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (167, '260506010115', 1, 1, 115, '2026-05-06 20:10:00', '2026-05-06 20:11:00', '2026-05-06 20:15:00', '2026-05-06 20:15:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 20:10:00', '2026-05-06 20:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (168, '260506020020', 2, 2, 20, '2026-05-06 20:10:00', '2026-05-06 20:11:00', '2026-05-06 20:20:00', '2026-05-06 20:15:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 20:10:00', '2026-05-06 20:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (169, '260506010116', 1, 1, 116, '2026-05-06 20:15:00', '2026-05-06 20:16:00', '2026-05-06 20:20:00', '2026-05-06 20:20:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 20:15:00', '2026-05-06 20:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (170, '260506010117', 1, 1, 117, '2026-05-06 20:20:00', '2026-05-06 20:21:00', '2026-05-06 20:25:00', '2026-05-06 20:25:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 20:20:00', '2026-05-06 20:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (171, '260506020021', 2, 2, 21, '2026-05-06 20:20:00', '2026-05-06 20:21:00', '2026-05-06 20:30:00', '2026-05-06 20:25:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 20:20:00', '2026-05-06 20:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (172, '260506010118', 1, 1, 118, '2026-05-06 20:25:00', '2026-05-06 20:26:00', '2026-05-06 20:30:00', '2026-05-06 20:30:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 20:25:00', '2026-05-06 20:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (173, '260506020022', 2, 2, 22, '2026-05-06 20:30:00', '2026-05-06 20:31:00', '2026-05-06 20:40:00', '2026-05-06 20:35:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 20:30:00', '2026-05-06 20:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (174, '260506010119', 1, 1, 119, '2026-05-06 20:30:00', '2026-05-06 20:31:00', '2026-05-06 20:35:00', '2026-05-06 20:35:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 20:30:00', '2026-05-06 20:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (175, '260506030008', 3, 3, 8, '2026-05-06 20:30:00', '2026-05-06 20:31:00', '2026-05-06 21:00:00', '2026-05-06 20:35:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 20:30:00', '2026-05-06 20:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (176, '260506010120', 1, 1, 120, '2026-05-06 20:35:00', '2026-05-06 20:36:00', '2026-05-06 20:40:00', '2026-05-06 20:40:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 20:35:00', '2026-05-06 20:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (177, '260506010121', 1, 1, 121, '2026-05-06 20:40:00', '2026-05-06 20:41:00', '2026-05-06 20:45:00', '2026-05-06 20:45:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 20:40:00', '2026-05-06 20:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (178, '260506020023', 2, 2, 23, '2026-05-06 20:40:00', '2026-05-06 20:41:00', '2026-05-06 20:50:00', '2026-05-06 20:45:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 20:40:00', '2026-05-06 20:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (179, '260506010122', 1, 1, 122, '2026-05-06 20:45:00', '2026-05-06 20:46:00', '2026-05-06 20:50:00', '2026-05-06 20:50:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 20:45:00', '2026-05-06 20:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (182, '260506020024', 2, 2, 24, '2026-05-06 20:50:00', '2026-05-06 20:51:00', '2026-05-06 21:00:00', '2026-05-06 20:55:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 20:50:00', '2026-05-06 20:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (183, '260506010123', 1, 1, 123, '2026-05-06 20:50:00', '2026-05-06 20:51:00', '2026-05-06 20:55:00', '2026-05-06 20:55:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 20:50:00', '2026-05-06 20:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (184, '260506010124', 1, 1, 124, '2026-05-06 20:55:00', '2026-05-06 20:56:00', '2026-05-06 21:00:00', '2026-05-06 21:00:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 20:55:00', '2026-05-06 20:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (185, '260506010125', 1, 1, 125, '2026-05-06 21:00:00', '2026-05-06 21:01:00', '2026-05-06 21:05:00', '2026-05-06 21:05:00', 0, 0, 0, 0, NULL, NULL, '2026-05-06 21:00:00', '2026-05-06 21:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (186, '260506020025', 2, 2, 25, '2026-05-06 21:00:00', '2026-05-06 21:01:00', '2026-05-06 21:10:00', '2026-05-06 21:05:00', 1, 0, 1, 2, NULL, '2026-05-06 21:10:01', '2026-05-06 21:00:00', '2026-05-06 21:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (187, '260506010126', 1, 1, 126, '2026-05-06 21:05:00', '2026-05-06 21:06:00', '2026-05-06 21:10:00', '2026-05-06 21:10:00', 0, 0, 0, 2, NULL, '2026-05-06 21:10:01', '2026-05-06 21:05:00', '2026-05-06 21:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (188, '260506010127', 1, 1, 127, '2026-05-06 21:10:00', '2026-05-06 21:11:00', '2026-05-06 21:15:00', '2026-05-06 21:15:00', 0, 0, 0, 2, NULL, '2026-05-06 21:15:01', '2026-05-06 21:10:00', '2026-05-06 21:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (189, '260506020026', 2, 2, 26, '2026-05-06 21:10:00', '2026-05-06 21:11:00', '2026-05-06 21:20:00', '2026-05-06 21:15:00', 0, 0, 0, 2, NULL, '2026-05-06 21:20:01', '2026-05-06 21:10:00', '2026-05-06 21:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (190, '260506010128', 1, 1, 128, '2026-05-06 21:15:00', '2026-05-06 21:16:00', '2026-05-06 21:20:00', '2026-05-06 21:20:00', 0, 0, 0, 2, NULL, '2026-05-06 21:20:01', '2026-05-06 21:15:00', '2026-05-06 21:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (191, '260506010129', 1, 1, 129, '2026-05-06 21:20:00', '2026-05-06 21:21:00', '2026-05-06 21:25:00', '2026-05-06 21:25:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 21:20:00', '2026-05-06 21:21:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (192, '260506020027', 2, 2, 27, '2026-05-06 21:20:00', '2026-05-06 21:21:00', '2026-05-06 21:30:00', '2026-05-06 21:25:00', 1, 0, 1, 2, NULL, '2026-05-06 21:30:01', '2026-05-06 21:20:00', '2026-05-06 21:30:01');
INSERT INTO `ddz_arena_periods_202605` VALUES (193, '260506010131', 1, 1, 131, '2026-05-06 21:30:00', '2026-05-06 21:31:00', '2026-05-06 21:35:00', '2026-05-06 21:35:00', 0, 0, 0, 2, NULL, '2026-05-06 21:35:01', '2026-05-06 21:30:01', '2026-05-06 21:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (194, '260506020028', 2, 2, 28, '2026-05-06 21:30:00', '2026-05-06 21:31:00', '2026-05-06 21:40:00', '2026-05-06 21:35:00', 1, 0, 1, 2, NULL, '2026-05-06 21:40:01', '2026-05-06 21:30:01', '2026-05-06 21:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (195, '260506010132', 1, 1, 132, '2026-05-06 21:35:00', '2026-05-06 21:36:00', '2026-05-06 21:40:00', '2026-05-06 21:40:00', 0, 0, 0, 2, NULL, '2026-05-06 21:40:01', '2026-05-06 21:35:00', '2026-05-06 21:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (196, '260506010133', 1, 1, 133, '2026-05-06 21:40:00', '2026-05-06 21:41:00', '2026-05-06 21:45:00', '2026-05-06 21:45:00', 0, 0, 0, 2, NULL, '2026-05-06 21:45:02', '2026-05-06 21:40:00', '2026-05-06 21:45:01');
INSERT INTO `ddz_arena_periods_202605` VALUES (197, '260506020029', 2, 2, 29, '2026-05-06 21:40:00', '2026-05-06 21:41:00', '2026-05-06 21:50:00', '2026-05-06 21:45:00', 1, 1, 1, 2, NULL, '2026-05-06 21:50:00', '2026-05-06 21:40:00', '2026-05-06 21:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (198, '260506010134', 1, 1, 134, '2026-05-06 21:45:00', '2026-05-06 21:46:00', '2026-05-06 21:50:00', '2026-05-06 21:50:00', 0, 0, 0, 2, NULL, '2026-05-06 21:50:00', '2026-05-06 21:45:01', '2026-05-06 21:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (199, '260506010135', 1, 1, 135, '2026-05-06 21:50:00', '2026-05-06 21:51:00', '2026-05-06 21:55:00', '2026-05-06 21:55:00', 0, 0, 0, 2, NULL, '2026-05-06 21:55:00', '2026-05-06 21:50:00', '2026-05-06 21:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (200, '260506020030', 2, 2, 30, '2026-05-06 21:50:00', '2026-05-06 21:51:00', '2026-05-06 22:00:00', '2026-05-06 21:55:00', 1, 0, 1, 2, NULL, '2026-05-06 22:00:00', '2026-05-06 21:50:00', '2026-05-06 22:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (201, '260506010136', 1, 1, 136, '2026-05-06 21:55:00', '2026-05-06 21:56:00', '2026-05-06 22:00:00', '2026-05-06 22:00:00', 0, 0, 0, 2, NULL, '2026-05-06 22:00:00', '2026-05-06 21:55:00', '2026-05-06 22:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (202, '260506010137', 1, 1, 137, '2026-05-06 22:00:00', '2026-05-06 22:01:00', '2026-05-06 22:05:00', '2026-05-06 22:05:00', 0, 0, 0, 2, NULL, '2026-05-06 22:05:00', '2026-05-06 22:00:00', '2026-05-06 22:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (203, '260506020031', 2, 2, 31, '2026-05-06 22:00:00', '2026-05-06 22:01:00', '2026-05-06 22:10:00', '2026-05-06 22:05:00', 0, 0, 0, 2, NULL, '2026-05-06 22:10:00', '2026-05-06 22:00:00', '2026-05-06 22:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (204, '260506010138', 1, 1, 138, '2026-05-06 22:05:00', '2026-05-06 22:06:00', '2026-05-06 22:10:00', '2026-05-06 22:10:00', 0, 0, 0, 2, NULL, '2026-05-06 22:10:00', '2026-05-06 22:05:00', '2026-05-06 22:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (205, '260506010139', 1, 1, 139, '2026-05-06 22:10:00', '2026-05-06 22:11:00', '2026-05-06 22:15:00', '2026-05-06 22:15:00', 0, 0, 0, 2, NULL, '2026-05-06 22:15:00', '2026-05-06 22:10:00', '2026-05-06 22:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (206, '260506020032', 2, 2, 32, '2026-05-06 22:10:00', '2026-05-06 22:11:00', '2026-05-06 22:20:00', '2026-05-06 22:15:00', 0, 0, 0, 2, NULL, '2026-05-06 22:20:00', '2026-05-06 22:10:00', '2026-05-06 22:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (207, '260506010140', 1, 1, 140, '2026-05-06 22:15:00', '2026-05-06 22:16:00', '2026-05-06 22:20:00', '2026-05-06 22:20:00', 0, 0, 0, 2, NULL, '2026-05-06 22:20:00', '2026-05-06 22:15:00', '2026-05-06 22:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (208, '260506010141', 1, 1, 141, '2026-05-06 22:20:00', '2026-05-06 22:21:00', '2026-05-06 22:25:00', '2026-05-06 22:25:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 22:20:00', '2026-05-06 22:21:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (209, '260506020033', 2, 2, 33, '2026-05-06 22:20:00', '2026-05-06 22:21:00', '2026-05-06 22:30:00', '2026-05-06 22:25:00', 1, 3, 0, 2, NULL, '2026-05-06 22:30:00', '2026-05-06 22:20:00', '2026-05-06 22:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (210, '260506010143', 1, 1, 143, '2026-05-06 22:30:00', '2026-05-06 22:31:00', '2026-05-06 22:35:00', '2026-05-06 22:35:00', 0, 0, 0, 2, NULL, '2026-05-06 22:35:00', '2026-05-06 22:30:00', '2026-05-06 22:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (211, '260506020034', 2, 2, 34, '2026-05-06 22:30:00', '2026-05-06 22:31:00', '2026-05-06 22:40:00', '2026-05-06 22:35:00', 0, 0, 0, 2, NULL, '2026-05-06 22:40:00', '2026-05-06 22:30:00', '2026-05-06 22:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (212, '260506010144', 1, 1, 144, '2026-05-06 22:35:00', '2026-05-06 22:36:00', '2026-05-06 22:40:00', '2026-05-06 22:40:00', 0, 0, 0, 2, NULL, '2026-05-06 22:40:00', '2026-05-06 22:35:00', '2026-05-06 22:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (213, '260506010145', 1, 1, 145, '2026-05-06 22:40:00', '2026-05-06 22:41:00', '2026-05-06 22:45:00', '2026-05-06 22:45:00', 0, 0, 0, 2, NULL, '2026-05-06 22:45:00', '2026-05-06 22:40:00', '2026-05-06 22:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (214, '260506020035', 2, 2, 35, '2026-05-06 22:40:00', '2026-05-06 22:41:00', '2026-05-06 22:50:00', '2026-05-06 22:45:00', 0, 0, 0, 2, NULL, '2026-05-06 22:50:00', '2026-05-06 22:40:00', '2026-05-06 22:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (215, '260506010146', 1, 1, 146, '2026-05-06 22:45:00', '2026-05-06 22:46:00', '2026-05-06 22:50:00', '2026-05-06 22:50:00', 0, 0, 0, 2, NULL, '2026-05-06 22:50:00', '2026-05-06 22:45:00', '2026-05-06 22:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (216, '260506010147', 1, 1, 147, '2026-05-06 22:50:00', '2026-05-06 22:51:00', '2026-05-06 22:55:00', '2026-05-06 22:55:00', 0, 0, 0, 2, NULL, '2026-05-06 22:55:00', '2026-05-06 22:50:00', '2026-05-06 22:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (217, '260506020036', 2, 2, 36, '2026-05-06 22:50:00', '2026-05-06 22:51:00', '2026-05-06 23:00:00', '2026-05-06 22:55:00', 0, 0, 0, 2, NULL, '2026-05-06 23:00:00', '2026-05-06 22:50:00', '2026-05-06 23:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (218, '260506010148', 1, 1, 148, '2026-05-06 22:55:00', '2026-05-06 22:56:00', '2026-05-06 23:00:00', '2026-05-06 23:00:00', 0, 0, 0, 2, NULL, '2026-05-06 23:00:00', '2026-05-06 22:55:00', '2026-05-06 23:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (219, '260506010149', 1, 1, 149, '2026-05-06 23:00:00', '2026-05-06 23:01:00', '2026-05-06 23:05:00', '2026-05-06 23:05:00', 0, 0, 0, 2, NULL, '2026-05-06 23:05:00', '2026-05-06 23:00:00', '2026-05-06 23:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (221, '260506010150', 1, 1, 150, '2026-05-06 23:05:00', '2026-05-06 23:06:00', '2026-05-06 23:10:00', '2026-05-06 23:10:00', 0, 0, 0, 2, NULL, '2026-05-06 23:10:00', '2026-05-06 23:05:00', '2026-05-06 23:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (222, '260506010151', 1, 1, 151, '2026-05-06 23:10:00', '2026-05-06 23:11:00', '2026-05-06 23:15:00', '2026-05-06 23:15:00', 0, 0, 0, 2, NULL, '2026-05-06 23:15:00', '2026-05-06 23:10:00', '2026-05-06 23:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (223, '260506020038', 2, 2, 38, '2026-05-06 23:10:00', '2026-05-06 23:11:00', '2026-05-06 23:20:00', '2026-05-06 23:15:00', 0, 0, 0, 2, NULL, '2026-05-06 23:20:00', '2026-05-06 23:10:00', '2026-05-06 23:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (224, '260506010152', 1, 1, 152, '2026-05-06 23:15:00', '2026-05-06 23:16:00', '2026-05-06 23:20:00', '2026-05-06 23:20:00', 0, 0, 0, 2, NULL, '2026-05-06 23:20:00', '2026-05-06 23:15:00', '2026-05-06 23:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (225, '260506010153', 1, 1, 153, '2026-05-06 23:20:00', '2026-05-06 23:21:00', '2026-05-06 23:25:00', '2026-05-06 23:25:00', 0, 0, 0, 2, NULL, '2026-05-06 23:25:00', '2026-05-06 23:20:00', '2026-05-06 23:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (226, '260506020039', 2, 2, 39, '2026-05-06 23:20:00', '2026-05-06 23:21:00', '2026-05-06 23:30:00', '2026-05-06 23:25:00', 0, 0, 0, 2, NULL, '2026-05-06 23:30:00', '2026-05-06 23:20:00', '2026-05-06 23:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (227, '260506010154', 1, 1, 154, '2026-05-06 23:25:00', '2026-05-06 23:26:00', '2026-05-06 23:30:00', '2026-05-06 23:30:00', 0, 0, 0, 2, NULL, '2026-05-06 23:30:00', '2026-05-06 23:25:00', '2026-05-06 23:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (228, '260506010155', 1, 1, 155, '2026-05-06 23:30:00', '2026-05-06 23:31:00', '2026-05-06 23:35:00', '2026-05-06 23:35:00', 0, 0, 0, 2, NULL, '2026-05-06 23:35:00', '2026-05-06 23:30:00', '2026-05-06 23:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (229, '260506020040', 2, 2, 40, '2026-05-06 23:30:00', '2026-05-06 23:31:00', '2026-05-06 23:40:00', '2026-05-06 23:35:00', 0, 0, 0, 2, NULL, '2026-05-06 23:40:00', '2026-05-06 23:30:00', '2026-05-06 23:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (230, '260506010156', 1, 1, 156, '2026-05-06 23:35:00', '2026-05-06 23:36:00', '2026-05-06 23:40:00', '2026-05-06 23:40:00', 0, 0, 0, 2, NULL, '2026-05-06 23:40:00', '2026-05-06 23:35:00', '2026-05-06 23:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (231, '260506010157', 1, 1, 157, '2026-05-06 23:40:00', '2026-05-06 23:41:00', '2026-05-06 23:45:00', '2026-05-06 23:45:00', 0, 0, 0, 2, NULL, '2026-05-06 23:45:00', '2026-05-06 23:40:00', '2026-05-06 23:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (232, '260506020041', 2, 2, 41, '2026-05-06 23:40:00', '2026-05-06 23:41:00', '2026-05-06 23:50:00', '2026-05-06 23:45:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 23:40:00', '2026-05-06 23:41:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (233, '260506010158', 1, 1, 158, '2026-05-06 23:45:00', '2026-05-06 23:46:00', '2026-05-06 23:50:00', '2026-05-06 23:50:00', 0, 0, 0, 2, NULL, '2026-05-06 23:50:00', '2026-05-06 23:45:00', '2026-05-06 23:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (234, '260506010159', 1, 1, 159, '2026-05-06 23:50:00', '2026-05-06 23:51:00', '2026-05-06 23:55:00', '2026-05-06 23:55:00', 0, 0, 0, 1, NULL, NULL, '2026-05-06 23:50:00', '2026-05-06 23:51:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (235, '260507010084', 1, 1, 84, '2026-05-07 06:55:00', '2026-05-07 06:56:00', '2026-05-07 07:00:00', '2026-05-07 07:00:00', 0, 0, 0, 2, NULL, '2026-05-07 07:00:01', '2026-05-07 06:55:59', '2026-05-07 07:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (236, '260507010085', 1, 1, 85, '2026-05-07 07:00:00', '2026-05-07 07:01:00', '2026-05-07 07:05:00', '2026-05-07 07:05:00', 0, 0, 0, 2, NULL, '2026-05-07 07:05:01', '2026-05-07 07:00:00', '2026-05-07 07:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (237, '260507010086', 1, 1, 86, '2026-05-07 07:05:00', '2026-05-07 07:06:00', '2026-05-07 07:10:00', '2026-05-07 07:10:00', 0, 0, 0, 2, NULL, '2026-05-07 07:10:01', '2026-05-07 07:05:00', '2026-05-07 07:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (238, '260507010087', 1, 1, 87, '2026-05-07 07:10:00', '2026-05-07 07:11:00', '2026-05-07 07:15:00', '2026-05-07 07:15:00', 0, 0, 0, 2, NULL, '2026-05-07 07:15:00', '2026-05-07 07:10:00', '2026-05-07 07:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (239, '260507010088', 1, 1, 88, '2026-05-07 07:15:00', '2026-05-07 07:16:00', '2026-05-07 07:20:00', '2026-05-07 07:20:00', 0, 0, 0, 2, NULL, '2026-05-07 07:20:01', '2026-05-07 07:15:00', '2026-05-07 07:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (240, '260507010089', 1, 1, 89, '2026-05-07 07:20:00', '2026-05-07 07:21:00', '2026-05-07 07:25:00', '2026-05-07 07:25:00', 0, 0, 0, 2, NULL, '2026-05-07 07:25:00', '2026-05-07 07:20:00', '2026-05-07 07:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (241, '260507010090', 1, 1, 90, '2026-05-07 07:25:00', '2026-05-07 07:26:00', '2026-05-07 07:30:00', '2026-05-07 07:30:00', 0, 0, 0, 2, NULL, '2026-05-07 07:30:01', '2026-05-07 07:25:00', '2026-05-07 07:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (242, '260507010091', 1, 1, 91, '2026-05-07 07:30:00', '2026-05-07 07:31:00', '2026-05-07 07:35:00', '2026-05-07 07:35:00', 0, 0, 0, 2, NULL, '2026-05-07 07:35:01', '2026-05-07 07:30:00', '2026-05-07 07:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (243, '260507010092', 1, 1, 92, '2026-05-07 07:35:00', '2026-05-07 07:36:00', '2026-05-07 07:40:00', '2026-05-07 07:40:00', 0, 0, 0, 2, NULL, '2026-05-07 07:40:01', '2026-05-07 07:35:00', '2026-05-07 07:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (244, '260507010093', 1, 1, 93, '2026-05-07 07:40:00', '2026-05-07 07:41:00', '2026-05-07 07:45:00', '2026-05-07 07:45:00', 0, 0, 0, 2, NULL, '2026-05-07 07:45:00', '2026-05-07 07:40:00', '2026-05-07 07:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (245, '260507010094', 1, 1, 94, '2026-05-07 07:45:00', '2026-05-07 07:46:00', '2026-05-07 07:50:00', '2026-05-07 07:50:00', 0, 0, 0, 2, NULL, '2026-05-07 07:50:01', '2026-05-07 07:45:00', '2026-05-07 07:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (246, '260507010095', 1, 1, 95, '2026-05-07 07:50:00', '2026-05-07 07:51:00', '2026-05-07 07:55:00', '2026-05-07 07:55:00', 0, 0, 0, 2, NULL, '2026-05-07 07:55:00', '2026-05-07 07:50:00', '2026-05-07 07:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (247, '260507010096', 1, 1, 96, '2026-05-07 07:55:00', '2026-05-07 07:56:00', '2026-05-07 08:00:00', '2026-05-07 08:00:00', 0, 0, 0, 2, NULL, '2026-05-07 08:00:00', '2026-05-07 07:55:00', '2026-05-07 08:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (248, '260507010097', 1, 1, 97, '2026-05-07 08:00:00', '2026-05-07 08:01:00', '2026-05-07 08:05:00', '2026-05-07 08:05:00', 0, 0, 0, 2, NULL, '2026-05-07 08:05:01', '2026-05-07 08:00:00', '2026-05-07 08:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (249, '260507010098', 1, 1, 98, '2026-05-07 08:05:00', '2026-05-07 08:06:00', '2026-05-07 08:10:00', '2026-05-07 08:10:00', 0, 0, 0, 2, NULL, '2026-05-07 08:10:01', '2026-05-07 08:05:00', '2026-05-07 08:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (250, '260507010099', 1, 1, 99, '2026-05-07 08:10:00', '2026-05-07 08:11:00', '2026-05-07 08:15:00', '2026-05-07 08:15:00', 0, 0, 0, 2, NULL, '2026-05-07 08:15:01', '2026-05-07 08:10:00', '2026-05-07 08:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (251, '260507010100', 1, 1, 100, '2026-05-07 08:15:00', '2026-05-07 08:16:00', '2026-05-07 08:20:00', '2026-05-07 08:20:00', 0, 0, 0, 2, NULL, '2026-05-07 08:20:00', '2026-05-07 08:15:00', '2026-05-07 08:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (252, '260507010101', 1, 1, 101, '2026-05-07 08:20:00', '2026-05-07 08:21:00', '2026-05-07 08:25:00', '2026-05-07 08:25:00', 0, 0, 0, 2, NULL, '2026-05-07 08:25:00', '2026-05-07 08:20:00', '2026-05-07 08:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (253, '260507010102', 1, 1, 102, '2026-05-07 08:25:00', '2026-05-07 08:26:00', '2026-05-07 08:30:00', '2026-05-07 08:30:00', 0, 0, 0, 2, NULL, '2026-05-07 08:30:01', '2026-05-07 08:25:00', '2026-05-07 08:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (254, '260507010103', 1, 1, 103, '2026-05-07 08:30:00', '2026-05-07 08:31:00', '2026-05-07 08:35:00', '2026-05-07 08:35:00', 0, 0, 0, 2, NULL, '2026-05-07 08:35:01', '2026-05-07 08:30:00', '2026-05-07 08:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (255, '260507010104', 1, 1, 104, '2026-05-07 08:35:00', '2026-05-07 08:36:00', '2026-05-07 08:40:00', '2026-05-07 08:40:00', 0, 0, 0, 1, NULL, NULL, '2026-05-07 08:35:00', '2026-05-07 08:36:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (256, '260507010166', 1, 1, 166, '2026-05-07 13:45:00', '2026-05-07 13:46:00', '2026-05-07 13:50:00', '2026-05-07 13:50:00', 0, 0, 0, 2, NULL, '2026-05-07 13:50:01', '2026-05-07 13:45:00', '2026-05-07 13:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (257, '260507010167', 1, 1, 167, '2026-05-07 13:50:00', '2026-05-07 13:51:00', '2026-05-07 13:55:00', '2026-05-07 13:55:00', 0, 0, 0, 2, NULL, '2026-05-07 13:55:01', '2026-05-07 13:50:00', '2026-05-07 13:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (258, '260507010168', 1, 1, 168, '2026-05-07 13:55:00', '2026-05-07 13:56:00', '2026-05-07 14:00:00', '2026-05-07 14:00:00', 0, 0, 0, 2, NULL, '2026-05-07 14:00:01', '2026-05-07 13:55:00', '2026-05-07 14:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (259, '260507010169', 1, 1, 169, '2026-05-07 14:00:00', '2026-05-07 14:01:00', '2026-05-07 14:05:00', '2026-05-07 14:05:00', 1, 0, 1, 2, NULL, '2026-05-07 14:05:00', '2026-05-07 14:00:00', '2026-05-07 14:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (260, '260507010170', 1, 1, 170, '2026-05-07 14:05:00', '2026-05-07 14:06:00', '2026-05-07 14:10:00', '2026-05-07 14:10:00', 0, 0, 0, 2, NULL, '2026-05-07 14:10:00', '2026-05-07 14:05:00', '2026-05-07 14:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (261, '260507010171', 1, 1, 171, '2026-05-07 14:10:00', '2026-05-07 14:11:00', '2026-05-07 14:15:00', '2026-05-07 14:15:00', 0, 0, 0, 2, NULL, '2026-05-07 14:15:01', '2026-05-07 14:10:00', '2026-05-07 14:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (262, '260507010172', 1, 1, 172, '2026-05-07 14:15:00', '2026-05-07 14:16:00', '2026-05-07 14:20:00', '2026-05-07 14:20:00', 0, 0, 0, 2, NULL, '2026-05-07 14:20:00', '2026-05-07 14:15:00', '2026-05-07 14:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (263, '260507010173', 1, 1, 173, '2026-05-07 14:20:00', '2026-05-07 14:21:00', '2026-05-07 14:25:00', '2026-05-07 14:25:00', 0, 0, 0, 2, NULL, '2026-05-07 14:25:00', '2026-05-07 14:20:00', '2026-05-07 14:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (264, '260507010174', 1, 1, 174, '2026-05-07 14:25:00', '2026-05-07 14:26:00', '2026-05-07 14:30:00', '2026-05-07 14:30:00', 0, 0, 0, 1, NULL, NULL, '2026-05-07 14:25:00', '2026-05-07 14:26:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (265, '260507010180', 1, 1, 180, '2026-05-07 14:55:00', '2026-05-07 14:56:00', '2026-05-07 15:00:00', '2026-05-07 15:00:00', 0, 0, 0, 2, NULL, '2026-05-07 15:00:00', '2026-05-07 14:55:00', '2026-05-07 15:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (266, '260507010181', 1, 1, 181, '2026-05-07 15:00:00', '2026-05-07 15:01:00', '2026-05-07 15:05:00', '2026-05-07 15:05:00', 1, 1, 1, 2, NULL, '2026-05-07 15:05:00', '2026-05-07 15:00:00', '2026-05-07 15:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (267, '260507010182', 1, 1, 182, '2026-05-07 15:05:00', '2026-05-07 15:06:00', '2026-05-07 15:10:00', '2026-05-07 15:10:00', 0, 0, 0, 2, NULL, '2026-05-07 15:10:01', '2026-05-07 15:05:00', '2026-05-07 15:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (268, '260507010183', 1, 1, 183, '2026-05-07 15:10:00', '2026-05-07 15:11:00', '2026-05-07 15:15:00', '2026-05-07 15:15:00', 0, 0, 0, 2, NULL, '2026-05-07 15:15:00', '2026-05-07 15:10:00', '2026-05-07 15:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (269, '260507010184', 1, 1, 184, '2026-05-07 15:15:00', '2026-05-07 15:16:00', '2026-05-07 15:20:00', '2026-05-07 15:20:00', 0, 0, 0, 2, NULL, '2026-05-07 15:20:01', '2026-05-07 15:15:00', '2026-05-07 15:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (270, '260507010185', 1, 1, 185, '2026-05-07 15:20:00', '2026-05-07 15:21:00', '2026-05-07 15:25:00', '2026-05-07 15:25:00', 0, 0, 0, 2, NULL, '2026-05-07 15:25:01', '2026-05-07 15:20:00', '2026-05-07 15:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (271, '260507010186', 1, 1, 186, '2026-05-07 15:25:00', '2026-05-07 15:26:00', '2026-05-07 15:30:00', '2026-05-07 15:30:00', 0, 0, 0, 2, NULL, '2026-05-07 15:30:00', '2026-05-07 15:25:00', '2026-05-07 15:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (272, '260507010187', 1, 1, 187, '2026-05-07 15:30:00', '2026-05-07 15:31:00', '2026-05-07 15:35:00', '2026-05-07 15:35:00', 0, 0, 0, 2, NULL, '2026-05-07 15:35:01', '2026-05-07 15:30:00', '2026-05-07 15:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (273, '260507010188', 1, 1, 188, '2026-05-07 15:35:00', '2026-05-07 15:36:00', '2026-05-07 15:40:00', '2026-05-07 15:40:00', 0, 0, 0, 2, NULL, '2026-05-07 15:40:01', '2026-05-07 15:35:00', '2026-05-07 15:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (274, '260507010189', 1, 1, 189, '2026-05-07 15:40:00', '2026-05-07 15:41:00', '2026-05-07 15:45:00', '2026-05-07 15:45:00', 0, 0, 0, 2, NULL, '2026-05-07 15:45:00', '2026-05-07 15:40:00', '2026-05-07 15:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (275, '260507010190', 1, 1, 190, '2026-05-07 15:45:00', '2026-05-07 15:46:00', '2026-05-07 15:50:00', '2026-05-07 15:50:00', 0, 0, 0, 2, NULL, '2026-05-07 15:50:00', '2026-05-07 15:45:00', '2026-05-07 15:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (276, '260507010191', 1, 1, 191, '2026-05-07 15:50:00', '2026-05-07 15:51:00', '2026-05-07 15:55:00', '2026-05-07 15:55:00', 0, 0, 0, 2, NULL, '2026-05-07 15:55:01', '2026-05-07 15:50:00', '2026-05-07 15:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (277, '260507010192', 1, 1, 192, '2026-05-07 15:55:00', '2026-05-07 15:56:00', '2026-05-07 16:00:00', '2026-05-07 16:00:00', 0, 0, 0, 2, NULL, '2026-05-07 16:00:01', '2026-05-07 15:55:00', '2026-05-07 16:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (278, '260507010193', 1, 1, 193, '2026-05-07 16:00:00', '2026-05-07 16:01:00', '2026-05-07 16:05:00', '2026-05-07 16:05:00', 1, 0, 1, 2, NULL, '2026-05-07 16:05:01', '2026-05-07 16:00:00', '2026-05-07 16:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (279, '260507010194', 1, 1, 194, '2026-05-07 16:05:00', '2026-05-07 16:06:00', '2026-05-07 16:10:00', '2026-05-07 16:10:00', 0, 0, 0, 2, NULL, '2026-05-07 16:10:00', '2026-05-07 16:05:00', '2026-05-07 16:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (280, '260507010195', 1, 1, 195, '2026-05-07 16:10:00', '2026-05-07 16:11:00', '2026-05-07 16:15:00', '2026-05-07 16:15:00', 0, 0, 0, 2, NULL, '2026-05-07 16:15:00', '2026-05-07 16:10:00', '2026-05-07 16:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (281, '260507010196', 1, 1, 196, '2026-05-07 16:15:00', '2026-05-07 16:16:00', '2026-05-07 16:20:00', '2026-05-07 16:20:00', 0, 0, 0, 2, NULL, '2026-05-07 16:20:00', '2026-05-07 16:15:00', '2026-05-07 16:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (284, '260507010197', 1, 1, 197, '2026-05-07 16:20:00', '2026-05-07 16:21:00', '2026-05-07 16:25:00', '2026-05-07 16:25:00', 0, 0, 0, 2, NULL, '2026-05-07 16:25:00', '2026-05-07 16:20:00', '2026-05-07 16:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (285, '260507010198', 1, 1, 198, '2026-05-07 16:25:00', '2026-05-07 16:26:00', '2026-05-07 16:30:00', '2026-05-07 16:30:00', 0, 0, 0, 2, NULL, '2026-05-07 16:30:00', '2026-05-07 16:25:00', '2026-05-07 16:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (286, '260507010199', 1, 1, 199, '2026-05-07 16:30:00', '2026-05-07 16:31:00', '2026-05-07 16:35:00', '2026-05-07 16:35:00', 0, 0, 0, 2, NULL, '2026-05-07 16:35:01', '2026-05-07 16:30:00', '2026-05-07 16:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (287, '260507010200', 1, 1, 200, '2026-05-07 16:35:00', '2026-05-07 16:36:00', '2026-05-07 16:40:00', '2026-05-07 16:40:00', 0, 0, 0, 2, NULL, '2026-05-07 16:40:00', '2026-05-07 16:35:00', '2026-05-07 16:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (288, '260507010201', 1, 1, 201, '2026-05-07 16:40:00', '2026-05-07 16:41:00', '2026-05-07 16:45:00', '2026-05-07 16:45:00', 0, 0, 0, 2, NULL, '2026-05-07 16:45:01', '2026-05-07 16:40:00', '2026-05-07 16:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (289, '260507010202', 1, 1, 202, '2026-05-07 16:45:00', '2026-05-07 16:46:00', '2026-05-07 16:50:00', '2026-05-07 16:50:00', 1, 0, 3, 2, NULL, '2026-05-07 16:50:01', '2026-05-07 16:45:00', '2026-05-07 16:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (290, '260507010203', 1, 1, 203, '2026-05-07 16:50:00', '2026-05-07 16:51:00', '2026-05-07 16:55:00', '2026-05-07 16:55:00', 0, 0, 0, 2, NULL, '2026-05-07 16:55:01', '2026-05-07 16:50:00', '2026-05-07 16:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (291, '260507010204', 1, 1, 204, '2026-05-07 16:55:00', '2026-05-07 16:56:00', '2026-05-07 17:00:00', '2026-05-07 17:00:00', 0, 0, 0, 2, NULL, '2026-05-07 17:00:01', '2026-05-07 16:55:00', '2026-05-07 17:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (292, '260507020001', 2, 2, 1, '2026-05-07 17:00:00', '2026-05-07 17:01:00', '2026-05-07 17:10:00', '2026-05-07 17:05:00', 0, 0, 0, 2, NULL, '2026-05-07 17:10:01', '2026-05-07 17:00:00', '2026-05-07 17:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (293, '260507010205', 1, 1, 205, '2026-05-07 17:00:00', '2026-05-07 17:01:00', '2026-05-07 17:05:00', '2026-05-07 17:05:00', 1, 0, 3, 2, NULL, '2026-05-07 17:05:01', '2026-05-07 17:00:00', '2026-05-07 17:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (294, '260507030001', 3, 3, 1, '2026-05-07 17:00:00', '2026-05-07 17:01:00', '2026-05-07 17:30:00', '2026-05-07 17:05:00', 0, 0, 0, 2, NULL, '2026-05-07 17:30:01', '2026-05-07 17:00:00', '2026-05-07 17:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (295, '260507010206', 1, 1, 206, '2026-05-07 17:05:00', '2026-05-07 17:06:00', '2026-05-07 17:10:00', '2026-05-07 17:10:00', 0, 0, 0, 2, NULL, '2026-05-07 17:10:01', '2026-05-07 17:05:00', '2026-05-07 17:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (296, '260507010207', 1, 1, 207, '2026-05-07 17:10:00', '2026-05-07 17:11:00', '2026-05-07 17:15:00', '2026-05-07 17:15:00', 0, 0, 0, 2, NULL, '2026-05-07 17:15:01', '2026-05-07 17:10:00', '2026-05-07 17:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (297, '260507020002', 2, 2, 2, '2026-05-07 17:10:00', '2026-05-07 17:11:00', '2026-05-07 17:20:00', '2026-05-07 17:15:00', 0, 0, 0, 2, NULL, '2026-05-07 17:20:00', '2026-05-07 17:10:00', '2026-05-07 17:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (298, '260507010208', 1, 1, 208, '2026-05-07 17:15:00', '2026-05-07 17:16:00', '2026-05-07 17:20:00', '2026-05-07 17:20:00', 0, 0, 0, 2, NULL, '2026-05-07 17:20:00', '2026-05-07 17:15:00', '2026-05-07 17:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (301, '260507010209', 1, 1, 209, '2026-05-07 17:20:00', '2026-05-07 17:21:00', '2026-05-07 17:25:00', '2026-05-07 17:25:00', 0, 0, 0, 2, NULL, '2026-05-07 17:25:00', '2026-05-07 17:20:00', '2026-05-07 17:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (302, '260507020003', 2, 2, 3, '2026-05-07 17:20:00', '2026-05-07 17:21:00', '2026-05-07 17:30:00', '2026-05-07 17:25:00', 0, 0, 0, 2, NULL, '2026-05-07 17:30:01', '2026-05-07 17:20:00', '2026-05-07 17:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (303, '260507010210', 1, 1, 210, '2026-05-07 17:25:00', '2026-05-07 17:26:00', '2026-05-07 17:30:00', '2026-05-07 17:30:00', 0, 0, 0, 2, NULL, '2026-05-07 17:30:01', '2026-05-07 17:25:00', '2026-05-07 17:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (304, '260507010211', 1, 1, 211, '2026-05-07 17:30:00', '2026-05-07 17:31:00', '2026-05-07 17:35:00', '2026-05-07 17:35:00', 1, 0, 3, 2, NULL, '2026-05-07 17:35:00', '2026-05-07 17:30:00', '2026-05-07 17:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (305, '260507020004', 2, 2, 4, '2026-05-07 17:30:00', '2026-05-07 17:31:00', '2026-05-07 17:40:00', '2026-05-07 17:35:00', 0, 0, 0, 2, NULL, '2026-05-07 17:40:01', '2026-05-07 17:30:00', '2026-05-07 17:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (306, '260507030002', 3, 3, 2, '2026-05-07 17:30:00', '2026-05-07 17:31:00', '2026-05-07 18:00:00', '2026-05-07 17:35:00', 0, 0, 0, 2, NULL, '2026-05-07 18:00:00', '2026-05-07 17:30:00', '2026-05-07 18:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (307, '260507010212', 1, 1, 212, '2026-05-07 17:35:00', '2026-05-07 17:36:00', '2026-05-07 17:40:00', '2026-05-07 17:40:00', 0, 0, 0, 2, NULL, '2026-05-07 17:40:01', '2026-05-07 17:35:00', '2026-05-07 17:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (308, '260507010213', 1, 1, 213, '2026-05-07 17:40:00', '2026-05-07 17:41:00', '2026-05-07 17:45:00', '2026-05-07 17:45:00', 1, 0, 3, 2, NULL, '2026-05-07 17:45:00', '2026-05-07 17:40:00', '2026-05-07 17:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (309, '260507020005', 2, 2, 5, '2026-05-07 17:40:00', '2026-05-07 17:41:00', '2026-05-07 17:50:00', '2026-05-07 17:45:00', 0, 0, 0, 2, NULL, '2026-05-07 17:50:00', '2026-05-07 17:40:00', '2026-05-07 17:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (310, '260507010214', 1, 1, 214, '2026-05-07 17:45:00', '2026-05-07 17:46:00', '2026-05-07 17:50:00', '2026-05-07 17:50:00', 0, 0, 0, 2, NULL, '2026-05-07 17:50:00', '2026-05-07 17:45:00', '2026-05-07 17:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (311, '260507010215', 1, 1, 215, '2026-05-07 17:50:00', '2026-05-07 17:51:00', '2026-05-07 17:55:00', '2026-05-07 17:55:00', 0, 0, 0, 2, NULL, '2026-05-07 17:55:00', '2026-05-07 17:50:00', '2026-05-07 17:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (312, '260507020006', 2, 2, 6, '2026-05-07 17:50:00', '2026-05-07 17:51:00', '2026-05-07 18:00:00', '2026-05-07 17:55:00', 0, 0, 0, 2, NULL, '2026-05-07 18:00:00', '2026-05-07 17:50:00', '2026-05-07 18:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (313, '260507010216', 1, 1, 216, '2026-05-07 17:55:00', '2026-05-07 17:56:00', '2026-05-07 18:00:00', '2026-05-07 18:00:00', 0, 0, 0, 2, NULL, '2026-05-07 18:00:00', '2026-05-07 17:55:00', '2026-05-07 18:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (314, '260507010217', 1, 1, 217, '2026-05-07 18:00:00', '2026-05-07 18:01:00', '2026-05-07 18:05:00', '2026-05-07 18:05:00', 0, 0, 0, 2, NULL, '2026-05-07 18:05:01', '2026-05-07 18:00:00', '2026-05-07 18:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (315, '260507020007', 2, 2, 7, '2026-05-07 18:00:00', '2026-05-07 18:01:00', '2026-05-07 18:10:00', '2026-05-07 18:05:00', 0, 0, 0, 2, NULL, '2026-05-07 18:10:01', '2026-05-07 18:00:00', '2026-05-07 18:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (316, '260507030003', 3, 3, 3, '2026-05-07 18:00:00', '2026-05-07 18:01:00', '2026-05-07 18:30:00', '2026-05-07 18:05:00', 0, 0, 0, 2, NULL, '2026-05-07 18:30:00', '2026-05-07 18:00:00', '2026-05-07 18:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (317, '260507010218', 1, 1, 218, '2026-05-07 18:05:00', '2026-05-07 18:06:00', '2026-05-07 18:10:00', '2026-05-07 18:10:00', 0, 0, 0, 2, NULL, '2026-05-07 18:10:01', '2026-05-07 18:05:00', '2026-05-07 18:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (318, '260507010219', 1, 1, 219, '2026-05-07 18:10:00', '2026-05-07 18:11:00', '2026-05-07 18:15:00', '2026-05-07 18:15:00', 0, 0, 0, 2, NULL, '2026-05-07 18:15:01', '2026-05-07 18:10:00', '2026-05-07 18:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (319, '260507020008', 2, 2, 8, '2026-05-07 18:10:00', '2026-05-07 18:11:00', '2026-05-07 18:20:00', '2026-05-07 18:15:00', 0, 0, 0, 2, NULL, '2026-05-07 18:20:00', '2026-05-07 18:10:00', '2026-05-07 18:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (320, '260507010220', 1, 1, 220, '2026-05-07 18:15:00', '2026-05-07 18:16:00', '2026-05-07 18:20:00', '2026-05-07 18:20:00', 0, 0, 0, 2, NULL, '2026-05-07 18:20:00', '2026-05-07 18:15:00', '2026-05-07 18:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (321, '260507010221', 1, 1, 221, '2026-05-07 18:20:00', '2026-05-07 18:21:00', '2026-05-07 18:25:00', '2026-05-07 18:25:00', 0, 0, 0, 2, NULL, '2026-05-07 18:25:01', '2026-05-07 18:20:00', '2026-05-07 18:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (322, '260507020009', 2, 2, 9, '2026-05-07 18:20:00', '2026-05-07 18:21:00', '2026-05-07 18:30:00', '2026-05-07 18:25:00', 0, 0, 0, 2, NULL, '2026-05-07 18:30:00', '2026-05-07 18:20:00', '2026-05-07 18:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (323, '260507010222', 1, 1, 222, '2026-05-07 18:25:00', '2026-05-07 18:26:00', '2026-05-07 18:30:00', '2026-05-07 18:30:00', 0, 0, 0, 2, NULL, '2026-05-07 18:30:00', '2026-05-07 18:25:00', '2026-05-07 18:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (324, '260507010223', 1, 1, 223, '2026-05-07 18:30:00', '2026-05-07 18:31:00', '2026-05-07 18:35:00', '2026-05-07 18:35:00', 0, 0, 0, 2, NULL, '2026-05-07 18:35:00', '2026-05-07 18:30:00', '2026-05-07 18:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (325, '260507030004', 3, 3, 4, '2026-05-07 18:30:00', '2026-05-07 18:31:00', '2026-05-07 19:00:00', '2026-05-07 18:35:00', 0, 0, 0, 2, NULL, '2026-05-07 19:00:00', '2026-05-07 18:30:00', '2026-05-07 19:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (326, '260507020010', 2, 2, 10, '2026-05-07 18:30:00', '2026-05-07 18:31:00', '2026-05-07 18:40:00', '2026-05-07 18:35:00', 0, 0, 0, 2, NULL, '2026-05-07 18:40:00', '2026-05-07 18:30:00', '2026-05-07 18:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (333, '260507010224', 1, 1, 224, '2026-05-07 18:35:00', '2026-05-07 18:36:00', '2026-05-07 18:40:00', '2026-05-07 18:40:00', 0, 0, 0, 2, NULL, '2026-05-07 18:40:00', '2026-05-07 18:35:00', '2026-05-07 18:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (334, '260507010225', 1, 1, 225, '2026-05-07 18:40:00', '2026-05-07 18:41:00', '2026-05-07 18:45:00', '2026-05-07 18:45:00', 0, 0, 0, 2, NULL, '2026-05-07 18:45:01', '2026-05-07 18:40:00', '2026-05-07 18:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (335, '260507020011', 2, 2, 11, '2026-05-07 18:40:00', '2026-05-07 18:41:00', '2026-05-07 18:50:00', '2026-05-07 18:45:00', 0, 0, 0, 2, NULL, '2026-05-07 18:50:00', '2026-05-07 18:40:00', '2026-05-07 18:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (336, '260507010226', 1, 1, 226, '2026-05-07 18:45:00', '2026-05-07 18:46:00', '2026-05-07 18:50:00', '2026-05-07 18:50:00', 0, 0, 0, 2, NULL, '2026-05-07 18:50:00', '2026-05-07 18:45:00', '2026-05-07 18:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (337, '260507010227', 1, 1, 227, '2026-05-07 18:50:00', '2026-05-07 18:51:00', '2026-05-07 18:55:00', '2026-05-07 18:55:00', 0, 0, 0, 2, NULL, '2026-05-07 18:55:01', '2026-05-07 18:50:00', '2026-05-07 18:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (338, '260507020012', 2, 2, 12, '2026-05-07 18:50:00', '2026-05-07 18:51:00', '2026-05-07 19:00:00', '2026-05-07 18:55:00', 0, 0, 0, 2, NULL, '2026-05-07 19:00:00', '2026-05-07 18:50:00', '2026-05-07 19:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (339, '260507010228', 1, 1, 228, '2026-05-07 18:55:00', '2026-05-07 18:56:00', '2026-05-07 19:00:00', '2026-05-07 19:00:00', 0, 0, 0, 2, NULL, '2026-05-07 19:00:00', '2026-05-07 18:55:00', '2026-05-07 19:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (340, '260507010229', 1, 1, 229, '2026-05-07 19:00:00', '2026-05-07 19:01:00', '2026-05-07 19:05:00', '2026-05-07 19:05:00', 0, 0, 0, 2, NULL, '2026-05-07 19:05:00', '2026-05-07 19:00:00', '2026-05-07 19:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (341, '260507020013', 2, 2, 13, '2026-05-07 19:00:00', '2026-05-07 19:01:00', '2026-05-07 19:10:00', '2026-05-07 19:05:00', 0, 0, 0, 1, NULL, NULL, '2026-05-07 19:00:00', '2026-05-07 19:01:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (342, '260507030005', 3, 3, 5, '2026-05-07 19:00:00', '2026-05-07 19:01:00', '2026-05-07 19:30:00', '2026-05-07 19:05:00', 0, 0, 0, 2, NULL, '2026-05-07 19:30:01', '2026-05-07 19:00:00', '2026-05-07 19:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (343, '260507010230', 1, 1, 230, '2026-05-07 19:05:00', '2026-05-07 19:06:00', '2026-05-07 19:10:00', '2026-05-07 19:10:00', 0, 0, 0, 1, NULL, NULL, '2026-05-07 19:05:00', '2026-05-07 19:06:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (344, '260507010232', 1, 1, 232, '2026-05-07 19:15:00', '2026-05-07 19:16:00', '2026-05-07 19:20:00', '2026-05-07 19:20:00', 0, 0, 0, 2, NULL, '2026-05-07 19:20:00', '2026-05-07 19:15:00', '2026-05-07 19:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (345, '260507010233', 1, 1, 233, '2026-05-07 19:20:00', '2026-05-07 19:21:00', '2026-05-07 19:25:00', '2026-05-07 19:25:00', 0, 0, 0, 2, NULL, '2026-05-07 19:25:00', '2026-05-07 19:20:00', '2026-05-07 19:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (346, '260507020015', 2, 2, 15, '2026-05-07 19:20:00', '2026-05-07 19:21:00', '2026-05-07 19:30:00', '2026-05-07 19:25:00', 0, 0, 0, 2, NULL, '2026-05-07 19:30:01', '2026-05-07 19:20:00', '2026-05-07 19:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (347, '260507010234', 1, 1, 234, '2026-05-07 19:25:00', '2026-05-07 19:26:00', '2026-05-07 19:30:00', '2026-05-07 19:30:00', 0, 0, 0, 2, NULL, '2026-05-07 19:30:01', '2026-05-07 19:25:00', '2026-05-07 19:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (348, '260507010235', 1, 1, 235, '2026-05-07 19:30:00', '2026-05-07 19:31:00', '2026-05-07 19:35:00', '2026-05-07 19:35:00', 0, 0, 0, 2, NULL, '2026-05-07 19:35:01', '2026-05-07 19:30:00', '2026-05-07 19:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (349, '260507030006', 3, 3, 6, '2026-05-07 19:30:00', '2026-05-07 19:31:00', '2026-05-07 20:00:00', '2026-05-07 19:35:00', 0, 0, 0, 2, NULL, '2026-05-07 20:00:01', '2026-05-07 19:30:00', '2026-05-07 20:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (350, '260507020016', 2, 2, 16, '2026-05-07 19:30:00', '2026-05-07 19:31:00', '2026-05-07 19:40:00', '2026-05-07 19:35:00', 0, 0, 0, 2, NULL, '2026-05-07 19:40:01', '2026-05-07 19:30:00', '2026-05-07 19:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (351, '260507010236', 1, 1, 236, '2026-05-07 19:35:00', '2026-05-07 19:36:00', '2026-05-07 19:40:00', '2026-05-07 19:40:00', 0, 0, 0, 2, NULL, '2026-05-07 19:40:01', '2026-05-07 19:35:00', '2026-05-07 19:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (352, '260507010237', 1, 1, 237, '2026-05-07 19:40:00', '2026-05-07 19:41:00', '2026-05-07 19:45:00', '2026-05-07 19:45:00', 0, 0, 0, 2, NULL, '2026-05-07 19:45:00', '2026-05-07 19:40:00', '2026-05-07 19:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (353, '260507020017', 2, 2, 17, '2026-05-07 19:40:00', '2026-05-07 19:41:00', '2026-05-07 19:50:00', '2026-05-07 19:45:00', 0, 0, 0, 2, NULL, '2026-05-07 19:50:00', '2026-05-07 19:40:00', '2026-05-07 19:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (354, '260507010238', 1, 1, 238, '2026-05-07 19:45:00', '2026-05-07 19:46:00', '2026-05-07 19:50:00', '2026-05-07 19:50:00', 0, 0, 0, 2, NULL, '2026-05-07 19:50:00', '2026-05-07 19:45:00', '2026-05-07 19:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (355, '260507010239', 1, 1, 239, '2026-05-07 19:50:00', '2026-05-07 19:51:00', '2026-05-07 19:55:00', '2026-05-07 19:55:00', 0, 0, 0, 1, NULL, NULL, '2026-05-07 19:50:00', '2026-05-07 19:51:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (356, '260507020018', 2, 2, 18, '2026-05-07 19:50:00', '2026-05-07 19:51:00', '2026-05-07 20:00:00', '2026-05-07 19:55:00', 0, 0, 0, 2, NULL, '2026-05-07 20:00:01', '2026-05-07 19:50:00', '2026-05-07 20:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (357, '260507010241', 1, 1, 241, '2026-05-07 20:00:00', '2026-05-07 20:01:00', '2026-05-07 20:05:00', '2026-05-07 20:05:00', 0, 0, 0, 2, NULL, '2026-05-07 20:05:01', '2026-05-07 20:00:00', '2026-05-07 20:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (358, '260507020019', 2, 2, 19, '2026-05-07 20:00:00', '2026-05-07 20:01:00', '2026-05-07 20:10:00', '2026-05-07 20:05:00', 0, 0, 0, 2, NULL, '2026-05-07 20:10:01', '2026-05-07 20:00:00', '2026-05-07 20:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (359, '260507030007', 3, 3, 7, '2026-05-07 20:00:00', '2026-05-07 20:01:00', '2026-05-07 20:30:00', '2026-05-07 20:05:00', 0, 0, 0, 2, NULL, '2026-05-07 20:30:00', '2026-05-07 20:00:00', '2026-05-07 20:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (360, '260507010242', 1, 1, 242, '2026-05-07 20:05:00', '2026-05-07 20:06:00', '2026-05-07 20:10:00', '2026-05-07 20:10:00', 0, 0, 0, 2, NULL, '2026-05-07 20:10:01', '2026-05-07 20:05:00', '2026-05-07 20:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (361, '260507010243', 1, 1, 243, '2026-05-07 20:10:00', '2026-05-07 20:11:00', '2026-05-07 20:15:00', '2026-05-07 20:15:00', 0, 0, 0, 2, NULL, '2026-05-07 20:15:01', '2026-05-07 20:10:00', '2026-05-07 20:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (362, '260507020020', 2, 2, 20, '2026-05-07 20:10:00', '2026-05-07 20:11:00', '2026-05-07 20:20:00', '2026-05-07 20:15:00', 0, 0, 0, 2, NULL, '2026-05-07 20:20:00', '2026-05-07 20:10:00', '2026-05-07 20:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (363, '260507010244', 1, 1, 244, '2026-05-07 20:15:00', '2026-05-07 20:16:00', '2026-05-07 20:20:00', '2026-05-07 20:20:00', 0, 0, 0, 2, NULL, '2026-05-07 20:20:00', '2026-05-07 20:15:00', '2026-05-07 20:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (364, '260507010245', 1, 1, 245, '2026-05-07 20:20:00', '2026-05-07 20:21:00', '2026-05-07 20:25:00', '2026-05-07 20:25:00', 0, 0, 0, 2, NULL, '2026-05-07 20:25:00', '2026-05-07 20:20:00', '2026-05-07 20:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (365, '260507020021', 2, 2, 21, '2026-05-07 20:20:00', '2026-05-07 20:21:00', '2026-05-07 20:30:00', '2026-05-07 20:25:00', 0, 0, 0, 2, NULL, '2026-05-07 20:30:00', '2026-05-07 20:20:00', '2026-05-07 20:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (366, '260507010246', 1, 1, 246, '2026-05-07 20:25:00', '2026-05-07 20:26:00', '2026-05-07 20:30:00', '2026-05-07 20:30:00', 0, 0, 0, 2, NULL, '2026-05-07 20:30:00', '2026-05-07 20:25:00', '2026-05-07 20:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (367, '260507010247', 1, 1, 247, '2026-05-07 20:30:00', '2026-05-07 20:31:00', '2026-05-07 20:35:00', '2026-05-07 20:35:00', 0, 0, 0, 2, NULL, '2026-05-07 20:35:01', '2026-05-07 20:30:00', '2026-05-07 20:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (368, '260507030008', 3, 3, 8, '2026-05-07 20:30:00', '2026-05-07 20:31:00', '2026-05-07 21:00:00', '2026-05-07 20:35:00', 0, 0, 0, 1, NULL, NULL, '2026-05-07 20:30:00', '2026-05-07 20:31:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (369, '260507020022', 2, 2, 22, '2026-05-07 20:30:00', '2026-05-07 20:31:00', '2026-05-07 20:40:00', '2026-05-07 20:35:00', 0, 0, 0, 2, NULL, '2026-05-07 20:40:01', '2026-05-07 20:30:00', '2026-05-07 20:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (370, '260507010248', 1, 1, 248, '2026-05-07 20:35:00', '2026-05-07 20:36:00', '2026-05-07 20:40:00', '2026-05-07 20:40:00', 0, 0, 0, 2, NULL, '2026-05-07 20:40:01', '2026-05-07 20:35:00', '2026-05-07 20:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (371, '260507010249', 1, 1, 249, '2026-05-07 20:40:00', '2026-05-07 20:41:00', '2026-05-07 20:45:00', '2026-05-07 20:45:00', 1, 0, 1, 2, NULL, '2026-05-07 20:45:01', '2026-05-07 20:40:00', '2026-05-07 20:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (372, '260507020023', 2, 2, 23, '2026-05-07 20:40:00', '2026-05-07 20:41:00', '2026-05-07 20:50:00', '2026-05-07 20:45:00', 0, 0, 0, 2, NULL, '2026-05-07 20:50:01', '2026-05-07 20:40:00', '2026-05-07 20:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (373, '260507010250', 1, 1, 250, '2026-05-07 20:45:00', '2026-05-07 20:46:00', '2026-05-07 20:50:00', '2026-05-07 20:50:00', 0, 0, 0, 2, NULL, '2026-05-07 20:50:01', '2026-05-07 20:45:00', '2026-05-07 20:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (374, '260507010251', 1, 1, 251, '2026-05-07 20:50:00', '2026-05-07 20:51:00', '2026-05-07 20:55:00', '2026-05-07 20:55:00', 0, 0, 0, 2, NULL, '2026-05-07 20:55:00', '2026-05-07 20:50:00', '2026-05-07 20:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (375, '260507020024', 2, 2, 24, '2026-05-07 20:50:00', '2026-05-07 20:51:00', '2026-05-07 21:00:00', '2026-05-07 20:55:00', 0, 0, 0, 1, NULL, NULL, '2026-05-07 20:50:00', '2026-05-07 20:51:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (376, '260507010252', 1, 1, 252, '2026-05-07 20:55:00', '2026-05-07 20:56:00', '2026-05-07 21:00:00', '2026-05-07 21:00:00', 0, 0, 0, 1, NULL, NULL, '2026-05-07 20:55:00', '2026-05-07 20:56:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (377, '260507010254', 1, 1, 254, '2026-05-07 21:05:00', '2026-05-07 21:06:00', '2026-05-07 21:10:00', '2026-05-07 21:10:00', 0, 0, 0, 2, NULL, '2026-05-07 21:10:01', '2026-05-07 21:05:00', '2026-05-07 21:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (378, '260507010255', 1, 1, 255, '2026-05-07 21:10:00', '2026-05-07 21:11:00', '2026-05-07 21:15:00', '2026-05-07 21:15:00', 1, 0, 1, 2, NULL, '2026-05-07 21:15:01', '2026-05-07 21:10:00', '2026-05-07 21:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (379, '260507020026', 2, 2, 26, '2026-05-07 21:10:00', '2026-05-07 21:11:00', '2026-05-07 21:20:00', '2026-05-07 21:15:00', 0, 0, 0, 2, NULL, '2026-05-07 21:20:00', '2026-05-07 21:10:00', '2026-05-07 21:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (380, '260507010256', 1, 1, 256, '2026-05-07 21:15:00', '2026-05-07 21:16:00', '2026-05-07 21:20:00', '2026-05-07 21:20:00', 0, 0, 0, 2, NULL, '2026-05-07 21:20:00', '2026-05-07 21:15:00', '2026-05-07 21:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (381, '260507010257', 1, 1, 257, '2026-05-07 21:20:00', '2026-05-07 21:21:00', '2026-05-07 21:25:00', '2026-05-07 21:25:00', 0, 0, 0, 2, NULL, '2026-05-07 21:25:00', '2026-05-07 21:20:00', '2026-05-07 21:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (382, '260507020027', 2, 2, 27, '2026-05-07 21:20:00', '2026-05-07 21:21:00', '2026-05-07 21:30:00', '2026-05-07 21:25:00', 0, 0, 0, 2, NULL, '2026-05-07 21:30:01', '2026-05-07 21:20:00', '2026-05-07 21:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (383, '260507010258', 1, 1, 258, '2026-05-07 21:25:00', '2026-05-07 21:26:00', '2026-05-07 21:30:00', '2026-05-07 21:30:00', 0, 0, 0, 2, NULL, '2026-05-07 21:30:01', '2026-05-07 21:25:00', '2026-05-07 21:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (384, '260507010259', 1, 1, 259, '2026-05-07 21:30:00', '2026-05-07 21:31:00', '2026-05-07 21:35:00', '2026-05-07 21:35:00', 1, 0, 1, 2, NULL, '2026-05-07 21:35:01', '2026-05-07 21:30:00', '2026-05-07 21:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (385, '260507020028', 2, 2, 28, '2026-05-07 21:30:00', '2026-05-07 21:31:00', '2026-05-07 21:40:00', '2026-05-07 21:35:00', 0, 0, 0, 2, NULL, '2026-05-07 21:40:01', '2026-05-07 21:30:00', '2026-05-07 21:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (386, '260507010260', 1, 1, 260, '2026-05-07 21:35:00', '2026-05-07 21:36:00', '2026-05-07 21:40:00', '2026-05-07 21:40:00', 0, 0, 0, 2, NULL, '2026-05-07 21:40:01', '2026-05-07 21:35:00', '2026-05-07 21:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (387, '260507010261', 1, 1, 261, '2026-05-07 21:40:00', '2026-05-07 21:41:00', '2026-05-07 21:45:00', '2026-05-07 21:45:00', 1, 0, 1, 2, NULL, '2026-05-07 21:45:01', '2026-05-07 21:40:00', '2026-05-07 21:45:01');
INSERT INTO `ddz_arena_periods_202605` VALUES (388, '260507020029', 2, 2, 29, '2026-05-07 21:40:00', '2026-05-07 21:41:00', '2026-05-07 21:50:00', '2026-05-07 21:45:00', 0, 0, 0, 2, NULL, '2026-05-07 21:50:00', '2026-05-07 21:40:00', '2026-05-07 21:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (389, '260507010262', 1, 1, 262, '2026-05-07 21:45:00', '2026-05-07 21:46:00', '2026-05-07 21:50:00', '2026-05-07 21:50:00', 0, 0, 0, 2, NULL, '2026-05-07 21:50:00', '2026-05-07 21:45:00', '2026-05-07 21:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (390, '260507010263', 1, 1, 263, '2026-05-07 21:50:00', '2026-05-07 21:51:00', '2026-05-07 21:55:00', '2026-05-07 21:55:00', 0, 0, 0, 2, NULL, '2026-05-07 21:55:01', '2026-05-07 21:50:00', '2026-05-07 21:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (391, '260507020030', 2, 2, 30, '2026-05-07 21:50:00', '2026-05-07 21:51:00', '2026-05-07 22:00:00', '2026-05-07 21:55:00', 0, 0, 0, 2, NULL, '2026-05-07 22:00:00', '2026-05-07 21:50:00', '2026-05-07 22:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (392, '260507010264', 1, 1, 264, '2026-05-07 21:55:00', '2026-05-07 21:56:00', '2026-05-07 22:00:00', '2026-05-07 22:00:00', 0, 0, 0, 2, NULL, '2026-05-07 22:00:00', '2026-05-07 21:55:00', '2026-05-07 22:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (393, '260507010265', 1, 1, 265, '2026-05-07 22:00:00', '2026-05-07 22:01:00', '2026-05-07 22:05:00', '2026-05-07 22:05:00', 0, 0, 0, 2, NULL, '2026-05-07 22:05:01', '2026-05-07 22:00:00', '2026-05-07 22:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (394, '260507020031', 2, 2, 31, '2026-05-07 22:00:00', '2026-05-07 22:01:00', '2026-05-07 22:10:00', '2026-05-07 22:05:00', 0, 0, 0, 2, NULL, '2026-05-07 22:10:00', '2026-05-07 22:00:00', '2026-05-07 22:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (395, '260507010266', 1, 1, 266, '2026-05-07 22:05:00', '2026-05-07 22:06:00', '2026-05-07 22:10:00', '2026-05-07 22:10:00', 0, 0, 0, 2, NULL, '2026-05-07 22:10:00', '2026-05-07 22:05:00', '2026-05-07 22:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (396, '260507020032', 2, 2, 32, '2026-05-07 22:10:00', '2026-05-07 22:11:00', '2026-05-07 22:20:00', '2026-05-07 22:15:00', 0, 0, 0, 2, NULL, '2026-05-07 22:20:01', '2026-05-07 22:10:00', '2026-05-07 22:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (397, '260507010267', 1, 1, 267, '2026-05-07 22:10:00', '2026-05-07 22:11:00', '2026-05-07 22:15:00', '2026-05-07 22:15:00', 0, 0, 0, 2, NULL, '2026-05-07 22:15:00', '2026-05-07 22:10:01', '2026-05-07 22:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (402, '260507010268', 1, 1, 268, '2026-05-07 22:15:00', '2026-05-07 22:16:00', '2026-05-07 22:20:00', '2026-05-07 22:20:00', 1, 0, 1, 2, NULL, '2026-05-07 22:20:01', '2026-05-07 22:15:00', '2026-05-07 22:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (403, '260507010269', 1, 1, 269, '2026-05-07 22:20:00', '2026-05-07 22:21:00', '2026-05-07 22:25:00', '2026-05-07 22:25:00', 1, 0, 1, 2, NULL, '2026-05-07 22:25:00', '2026-05-07 22:20:00', '2026-05-07 22:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (404, '260507020033', 2, 2, 33, '2026-05-07 22:20:00', '2026-05-07 22:21:00', '2026-05-07 22:30:00', '2026-05-07 22:25:00', 0, 0, 0, 2, NULL, '2026-05-07 22:30:01', '2026-05-07 22:20:00', '2026-05-07 22:30:01');
INSERT INTO `ddz_arena_periods_202605` VALUES (405, '260507010270', 1, 1, 270, '2026-05-07 22:25:00', '2026-05-07 22:26:00', '2026-05-07 22:30:00', '2026-05-07 22:30:00', 0, 0, 0, 2, NULL, '2026-05-07 22:30:01', '2026-05-07 22:25:00', '2026-05-07 22:30:01');
INSERT INTO `ddz_arena_periods_202605` VALUES (406, '260507010271', 1, 1, 271, '2026-05-07 22:30:00', '2026-05-07 22:31:00', '2026-05-07 22:35:00', '2026-05-07 22:35:00', 0, 0, 0, 2, NULL, '2026-05-07 22:35:01', '2026-05-07 22:30:01', '2026-05-07 22:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (407, '260507020034', 2, 2, 34, '2026-05-07 22:30:00', '2026-05-07 22:31:00', '2026-05-07 22:40:00', '2026-05-07 22:35:00', 0, 0, 0, 2, NULL, '2026-05-07 22:40:00', '2026-05-07 22:30:01', '2026-05-07 22:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (408, '260507010272', 1, 1, 272, '2026-05-07 22:35:00', '2026-05-07 22:36:00', '2026-05-07 22:40:00', '2026-05-07 22:40:00', 0, 0, 0, 2, NULL, '2026-05-07 22:40:00', '2026-05-07 22:35:00', '2026-05-07 22:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (409, '260507010273', 1, 1, 273, '2026-05-07 22:40:00', '2026-05-07 22:41:00', '2026-05-07 22:45:00', '2026-05-07 22:45:00', 0, 0, 0, 2, NULL, '2026-05-07 22:45:01', '2026-05-07 22:40:00', '2026-05-07 22:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (410, '260507020035', 2, 2, 35, '2026-05-07 22:40:00', '2026-05-07 22:41:00', '2026-05-07 22:50:00', '2026-05-07 22:45:00', 0, 0, 0, 1, NULL, NULL, '2026-05-07 22:40:00', '2026-05-07 22:41:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (411, '260507010274', 1, 1, 274, '2026-05-07 22:45:00', '2026-05-07 22:46:00', '2026-05-07 22:50:00', '2026-05-07 22:50:00', 0, 0, 0, 1, NULL, NULL, '2026-05-07 22:45:00', '2026-05-07 22:46:00');

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场期号表(月份分表)' ROW_FORMAT = Dynamic;

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
) ENGINE = InnoDB AUTO_INCREMENT = 48 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场报名日志表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_signup_logs_202605
-- ----------------------------
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (1, 'H202605060001', 65, 2, 4, 1, 0, 1000, 1000, '', '2026-05-06 17:05:53');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (2, 'H202605060001', 65, 2, 4, 2, 0, 1000, 1000, '', '2026-05-06 17:09:25');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (3, 'E202605060004', 81, 3, 4, 1, 0, 1000, 1000, '', '2026-05-06 18:49:30');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (4, 'E202605060004', 81, 3, 4, 2, 0, 1000, 1000, '', '2026-05-06 18:49:35');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (5, 'E202605060004', 81, 3, 4, 1, 0, 1000, 1000, '', '2026-05-06 18:49:37');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (6, 'E202605060004', 81, 3, 4, 2, 0, 1000, 1000, '', '2026-05-06 18:50:30');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (7, 'E202605060004', 81, 3, 4, 1, 0, 1000, 1000, '', '2026-05-06 18:50:50');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (8, 'E202605060026', 135, 3, 4, 1, 0, 1000, 1000, '', '2026-05-06 19:09:54');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (9, 'E202605060028', 141, 3, 4, 1, 0, 1000, 1000, '', '2026-05-06 19:18:38');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (10, 'E202605060030', 147, 3, 4, 1, 0, 1000, 1000, '', '2026-05-06 19:26:40');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (11, 'E202605060032', 153, 3, 4, 1, 0, 1000, 1000, '', '2026-05-06 19:39:02');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (12, '260506030007', 0, 3, 4, 1, 0, 1000, 1000, '', '2026-05-06 20:10:07');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (13, '260506020020', 0, 2, 4, 1, 0, 1000, 1000, '', '2026-05-06 20:17:36');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (14, '260506020021', 0, 2, 4, 1, 0, 1000, 1000, '', '2026-05-06 20:28:42');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (15, '260506030008', 0, 3, 4, 1, 0, 1000, 1000, '', '2026-05-06 20:42:18');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (16, '260506020025', 186, 2, 4, 1, 0, 1000, 1000, '', '2026-05-06 21:06:27');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (17, '260506020027', 192, 2, 4, 1, 0, 1000, 1000, '', '2026-05-06 21:25:42');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (18, '260506020028', 194, 2, 4, 1, 0, 1000, 1000, '', '2026-05-06 21:37:12');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (19, '260506020029', 197, 2, 4, 1, 0, 1000, 1000, '', '2026-05-06 21:41:07');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (20, '260506020029', 197, 2, 4, 2, 0, 1000, 1000, '', '2026-05-06 21:48:18');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (21, '260506020029', 197, 2, 4, 1, 0, 1000, 1000, '', '2026-05-06 21:48:28');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (22, '260506020030', 200, 2, 4, 1, 0, 1000, 1000, '', '2026-05-06 21:56:55');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (23, '260506020033', 209, 2, 4, 1, 0, 1000, 1000, '', '2026-05-06 22:22:15');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (24, '260506020033', 209, 2, 4, 2, 0, 1000, 1000, '', '2026-05-06 22:24:12');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (25, '260506020033', 209, 2, 4, 1, 0, 1000, 1000, '', '2026-05-06 22:24:26');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (26, '260506020033', 209, 2, 4, 2, 0, 1000, 1000, '', '2026-05-06 22:24:30');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (27, '260506020033', 209, 2, 4, 1, 0, 1000, 1000, '', '2026-05-06 22:26:22');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (28, '260506020033', 209, 2, 4, 2, 0, 1000, 1000, '', '2026-05-06 22:26:28');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (29, '260507010169', 259, 1, 4, 1, 0, 1000, 1000, '', '2026-05-07 14:01:09');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (30, '260507010179', 0, 1, 4, 1, 100, 1000, 900, '', '2026-05-07 14:51:34');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (31, '260507010181', 266, 1, 4, 1, 100, 900, 800, '', '2026-05-07 15:01:01');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (32, '260507010181', 266, 1, 4, 2, 100, 800, 900, '', '2026-05-07 15:01:11');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (33, '260507010181', 266, 1, 4, 1, 100, 900, 800, '', '2026-05-07 15:01:28');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (34, '260507010193', 278, 1, 4, 1, 100, 800, 700, '', '2026-05-07 16:02:09');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (35, '260507010202', 289, 1, 4, 1, 100, 700, 600, '', '2026-05-07 16:48:52');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (36, '260507010205', 293, 1, 4, 1, 100, 600, 500, '', '2026-05-07 17:03:22');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (37, '260507010211', 304, 1, 4, 1, 100, 600, 500, '', '2026-05-07 17:33:43');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (38, '260507010213', 308, 1, 4, 1, 100, 600, 500, '', '2026-05-07 17:41:13');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (39, '260507010231', 0, 1, 4, 1, 100, 600, 500, '', '2026-05-07 19:12:19');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (40, '260507010240', 0, 1, 4, 1, 100, 600, 500, '', '2026-05-07 19:56:03');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (41, '260507010249', 371, 1, 4, 1, 100, 600, 500, '', '2026-05-07 20:41:05');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (42, '260507010253', 0, 1, 4, 1, 100, 600, 500, '', '2026-05-07 21:02:02');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (43, '260507010255', 378, 1, 4, 1, 100, 500, 400, '', '2026-05-07 21:12:22');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (44, '260507010259', 384, 1, 4, 1, 100, 500, 400, '', '2026-05-07 21:34:50');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (45, '260507010261', 387, 1, 4, 1, 100, 500, 400, '', '2026-05-07 21:42:39');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (46, '260507010268', 402, 1, 4, 1, 100, 500, 400, '', '2026-05-07 22:18:24');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (47, '260507010269', 403, 1, 4, 1, 100, 400, 300, '', '2026-05-07 22:24:20');

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场报名日志表(月份分表)' ROW_FORMAT = Dynamic;

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
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `bid_order` bigint NOT NULL COMMENT '叫地主顺序(1-3)',
  `bid_type` tinyint NOT NULL COMMENT '叫地主类型:0-不叫,1-叫地主,2-抢地主',
  `bid_score` bigint NOT NULL DEFAULT 0 COMMENT '叫分(1-3分)',
  `is_success` tinyint NOT NULL DEFAULT 0 COMMENT '是否成功成为地主',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
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
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `player_role` tinyint NOT NULL COMMENT '玩家角色:1-地主,2-农民',
  `hand_cards` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '手牌(逗号分隔)',
  `cards_count` bigint NOT NULL DEFAULT 0 COMMENT '手牌数量',
  `landlord_cards` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '底牌(仅地主有)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
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
INSERT INTO `ddz_deal_logs` VALUES (324, 'e186aeb1-cb87-4155-8f50-fe99999b91bd', 7, 2, 'BJ,♦A,♥K,♣K,♣Q,♦J,♣10,♦10,♦8,♠7,♥7,♦7,♥6,♠5,♠4,♥4,♦3', 17, '', '2026-05-03 15:58:52', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (325, 'e186aeb1-cb87-4155-8f50-fe99999b91bd', 5, 2, '♣2,♦2,♥A,♠Q,♦Q,♠J,♥J,♠10,♥9,♣9,♦9,♣8,♥5,♣5,♦5,♦4,♣3', 17, '', '2026-05-03 15:58:52', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (326, 'e186aeb1-cb87-4155-8f50-fe99999b91bd', 4, 1, 'RJ,♠2,♥2,♠A,♣A,♠K,♥Q,♣J,♥10,♠9,♠8,♥8,♣7,♠6,♦6,♣4,♥3', 17, '♣8,♣K,♥5', '2026-05-03 15:58:52', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (327, 'e186aeb1-cb87-4155-8f50-fe99999b91bd', 7, 2, '♥2,♦2,♠A,♥A,♦A,♥Q,♥9,♦8,♠7,♣7,♦7,♥6,♣6,♠5,♠4,♥4,♣4', 17, '', '2026-05-03 15:58:52', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (328, 'e186aeb1-cb87-4155-8f50-fe99999b91bd', 5, 2, 'BJ,♠Q,♣Q,♥J,♣J,♦J,♠10,♣10,♠9,♣9,♦9,♥8,♦6,♦5,♠3,♥3,♦3', 17, '', '2026-05-03 15:58:52', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (329, 'e186aeb1-cb87-4155-8f50-fe99999b91bd', 4, 1, 'RJ,♠2,♣2,♣A,♠K,♥K,♦K,♦Q,♠J,♥10,♦10,♠8,♥7,♠6,♣5,♦4,♣3', 17, '♣8,♣K,♥5', '2026-05-03 15:58:52', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (330, '7d22378f-611a-4734-ab3a-b3ead343abc3', 5, 2, '♥2,♣2,♠A,♣A,♠K,♣K,♦K,♥Q,♥J,♣J,♠10,♥10,♥9,♣9,♥7,♠6,♠3', 17, '', '2026-05-03 16:06:20', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (331, '7d22378f-611a-4734-ab3a-b3ead343abc3', 7, 1, 'BJ,♠2,♦2,♦A,♥K,♠J,♦J,♦10,♦9,♥8,♣8,♦8,♠7,♦7,♦6,♠5,♦3', 17, '♣7,♥A,♠8', '2026-05-03 16:06:20', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (332, '7d22378f-611a-4734-ab3a-b3ead343abc3', 4, 2, 'RJ,♠Q,♣Q,♦Q,♣10,♠9,♥6,♣6,♥5,♣5,♦5,♠4,♥4,♣4,♦4,♥3,♣3', 17, '', '2026-05-03 16:06:20', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (333, '43367ac3-124e-44e6-b969-17533f6a5919', 7, 2, '♣2,♠A,♥K,♥Q,♦Q,♥J,♦10,♠9,♥9,♥7,♣7,♠6,♣6,♦6,♠5,♣5,♦5', 17, '', '2026-05-03 16:57:24', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (334, '43367ac3-124e-44e6-b969-17533f6a5919', 5, 2, '♥2,♥A,♣A,♦A,♠K,♠Q,♥10,♣10,♦9,♥8,♣8,♠7,♥5,♠4,♥4,♣4,♠3', 17, '', '2026-05-03 16:57:24', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (335, '43367ac3-124e-44e6-b969-17533f6a5919', 4, 1, 'RJ,BJ,♠2,♦2,♣K,♦K,♣Q,♠J,♣J,♦J,♠8,♦8,♦7,♥6,♦4,♥3,♣3', 17, '♠10,♦3,♣9', '2026-05-03 16:57:24', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (336, '1596baf7-5ee5-4386-9f67-1b52c7e70d42', 4, 2, '♦2,♣A,♥K,♣Q,♦Q,♥J,♦J,♠10,♣10,♦10,♣8,♥7,♠6,♥6,♦5,♠4,♦4', 17, '', '2026-05-03 17:09:00', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (337, '1596baf7-5ee5-4386-9f67-1b52c7e70d42', 5, 2, 'BJ,♥2,♠A,♦A,♣K,♦K,♠Q,♣J,♥9,♦9,♠8,♠7,♣7,♥5,♥4,♥3,♣3', 17, '', '2026-05-03 17:09:00', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (338, '1596baf7-5ee5-4386-9f67-1b52c7e70d42', 7, 1, 'RJ,♠2,♣2,♠K,♥Q,♥10,♠9,♣9,♥8,♦8,♦7,♦6,♠5,♣5,♣4,♠3,♦3', 17, '♥A,♣6,♠J', '2026-05-03 17:09:00', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (339, '501e74a7-8797-4b4a-a408-58c42472e050', 7, 2, '♥2,♠A,♠K,♦K,♠Q,♥Q,♦Q,♥J,♥10,♠9,♥9,♣9,♠8,♣6,♦4,♥3,♣3', 17, '', '2026-05-03 17:45:40', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (340, '501e74a7-8797-4b4a-a408-58c42472e050', 4, 2, 'BJ,♥A,♣A,♦A,♣K,♦J,♣10,♦9,♥8,♦8,♥7,♣7,♠6,♦6,♠4,♠3,♦3', 17, '', '2026-05-03 17:45:40', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (341, '501e74a7-8797-4b4a-a408-58c42472e050', 5, 1, 'RJ,♠2,♣2,♦2,♥K,♠J,♣J,♦10,♣8,♠7,♦7,♥6,♠5,♥5,♦5,♥4,♣4', 17, '♠10,♣5,♣Q', '2026-05-03 17:45:40', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (342, 'c900cd1d-eabc-4fdd-8583-c343e329e018', 7, 2, '♦A,♥K,♣K,♦K,♥J,♣J,♥10,♣10,♦10,♣9,♣8,♠7,♣7,♥6,♦6,♥3,♣3', 17, '', '2026-05-03 18:20:25', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (343, 'c900cd1d-eabc-4fdd-8583-c343e329e018', 4, 2, 'BJ,♦2,♥A,♠Q,♣Q,♦Q,♠9,♥9,♦8,♥7,♣6,♠5,♣5,♥4,♣4,♦4,♠3', 17, '', '2026-05-03 18:20:25', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (344, 'c900cd1d-eabc-4fdd-8583-c343e329e018', 5, 1, 'RJ,♥2,♣2,♠A,♣A,♠K,♥Q,♠J,♦J,♦9,♠8,♥8,♦7,♥5,♦5,♠4,♦3', 17, '♠6,♠10,♠2', '2026-05-03 18:20:25', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (345, 'c56e3967-fad4-42cd-90e7-a5ed8f5a094d', 4, 1, 'BJ,♠K,♥K,♣K,♦K,♠J,♦J,♦10,♥9,♦9,♣8,♠7,♥7,♣7,♣6,♦6,♥4', 17, '♦2,♠10,♥10', '2026-05-03 18:48:00', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (346, 'c56e3967-fad4-42cd-90e7-a5ed8f5a094d', 5, 2, '♠2,♥2,♠A,♥A,♣A,♣Q,♥J,♣J,♣10,♣9,♦7,♥6,♠5,♥5,♠3,♥3,♣3', 17, '', '2026-05-03 18:48:00', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (347, 'c56e3967-fad4-42cd-90e7-a5ed8f5a094d', 7, 2, 'RJ,♣2,♦A,♠Q,♥Q,♦Q,♠9,♠8,♥8,♦8,♠6,♣5,♦5,♠4,♣4,♦4,♦3', 17, '', '2026-05-03 18:48:00', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (348, '84915987-21e0-44f1-98bf-f22c025aba8d', 4, 2, '♠A,♦K,♠Q,♥Q,♦Q,♠J,♠8,♥8,♣8,♦8,♠7,♥7,♥6,♣6,♠4,♣4,♠3', 17, '', '2026-05-03 18:57:21', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (349, '84915987-21e0-44f1-98bf-f22c025aba8d', 7, 2, '♠2,♥2,♣2,♦A,♠K,♥K,♣K,♦J,♣10,♠9,♠6,♦6,♣5,♥4,♦4,♣3,♦3', 17, '', '2026-05-03 18:57:21', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (350, '84915987-21e0-44f1-98bf-f22c025aba8d', 5, 1, 'RJ,BJ,♦2,♣A,♣Q,♥J,♣J,♠10,♥10,♦10,♣9,♣7,♦7,♠5,♥5,♦5,♥3', 17, '♥9,♥A,♦9', '2026-05-03 18:57:21', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (351, '3ad5d0d0-6f10-4012-91f7-82ad7b4e56b8', 5, 2, '♣2,♦2,♠A,♥A,♣K,♦K,♥J,♣J,♥10,♣9,♣8,♥7,♥6,♦6,♥4,♣4,♣3', 17, '', '2026-05-03 19:04:17', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (352, '3ad5d0d0-6f10-4012-91f7-82ad7b4e56b8', 4, 2, '♥2,♦A,♠K,♥Q,♦Q,♠J,♦J,♣10,♦9,♦8,♣7,♦7,♠6,♠5,♣5,♦5,♦4', 17, '', '2026-05-03 19:04:17', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (353, '3ad5d0d0-6f10-4012-91f7-82ad7b4e56b8', 7, 1, 'BJ,♠2,♥K,♠Q,♣Q,♠10,♦10,♠9,♥9,♥8,♠7,♣6,♥5,♠4,♠3,♥3,♦3', 17, 'RJ,♠8,♣A', '2026-05-03 19:04:17', NULL, NULL);

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
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `room_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间ID',
  `room_type` tinyint NOT NULL DEFAULT 1 COMMENT '房间类型',
  `room_category` tinyint NOT NULL DEFAULT 1 COMMENT '房间分类:1-普通场,2-竞技场',
  `landlord_id` bigint UNSIGNED NOT NULL COMMENT '地主玩家ID',
  `farmer1_id` bigint UNSIGNED NOT NULL COMMENT '农民1玩家ID',
  `farmer2_id` bigint UNSIGNED NOT NULL COMMENT '农民2玩家ID',
  `base_score` bigint NOT NULL DEFAULT 1 COMMENT '底分',
  `multiplier` bigint NOT NULL DEFAULT 1 COMMENT '最终倍数',
  `bomb_count` bigint NOT NULL DEFAULT 0 COMMENT '炸弹数量',
  `spring` tinyint NOT NULL DEFAULT 0 COMMENT '是否春天:0-否,1-地主春天,2-反春天',
  `result` tinyint NOT NULL COMMENT '结果:1-地主胜,2-农民胜',
  `landlord_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '地主输赢金币',
  `landlord_win_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '地主输赢竞技币',
  `farmer1_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '农民1输赢金币',
  `farmer1_win_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '农民1输赢竞技币',
  `farmer2_win_gold` bigint NOT NULL DEFAULT 0 COMMENT '农民2输赢金币',
  `farmer2_win_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '农民2输赢竞技币',
  `started_at` datetime NOT NULL COMMENT '开始时间',
  `ended_at` datetime NULL DEFAULT NULL COMMENT '结束时间',
  `duration_seconds` bigint NOT NULL DEFAULT 0 COMMENT '游戏时长(秒)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
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
INSERT INTO `ddz_game_records` VALUES (107, 'e186aeb1-cb87-4155-8f50-fe99999b91bd', '122883', 1, 1, 4, 7, 5, 10, 8, 1, 1, 1, 160, 160, -80, -80, -80, -80, '2026-05-03 15:57:16', '2026-05-03 15:58:52', 102, '2026-05-03 15:58:52', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO `ddz_game_records` VALUES (108, '7d22378f-611a-4734-ab3a-b3ead343abc3', '133037', 1, 1, 7, 5, 4, 10, 16, 0, 1, 1, 320, 320, -160, -160, -160, -160, '2026-05-03 16:05:01', '2026-05-03 16:06:21', 85, '2026-05-03 16:06:20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO `ddz_game_records` VALUES (109, '43367ac3-124e-44e6-b969-17533f6a5919', '780254', 1, 1, 4, 7, 5, 10, 2, 0, 0, 1, 40, 40, -20, -20, -20, -20, '2026-05-03 16:54:13', '2026-05-03 16:57:24', 204, '2026-05-03 16:57:24', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO `ddz_game_records` VALUES (110, '1596baf7-5ee5-4386-9f67-1b52c7e70d42', '305270', 1, 1, 7, 4, 5, 10, 8, 0, 0, 1, 160, 160, -80, -80, -80, -80, '2026-05-03 17:07:17', '2026-05-03 17:09:01', 108, '2026-05-03 17:09:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO `ddz_game_records` VALUES (111, '501e74a7-8797-4b4a-a408-58c42472e050', '320067', 1, 1, 5, 7, 4, 10, 8, 1, 1, 1, 160, 160, -80, -80, -80, -80, '2026-05-03 17:44:13', '2026-05-03 17:45:40', 92, '2026-05-03 17:45:40', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO `ddz_game_records` VALUES (112, 'c900cd1d-eabc-4fdd-8583-c343e329e018', '125886', 1, 1, 5, 7, 4, 10, 16, 0, 0, 1, 320, 320, -160, -160, -160, -160, '2026-05-03 18:19:08', '2026-05-03 18:20:26', 82, '2026-05-03 18:20:25', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO `ddz_game_records` VALUES (113, 'c56e3967-fad4-42cd-90e7-a5ed8f5a094d', '657624', 1, 1, 4, 5, 7, 10, 16, 1, 0, 1, 320, 320, -160, -160, -160, -160, '2026-05-03 18:44:44', '2026-05-03 18:48:00', 210, '2026-05-03 18:48:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO `ddz_game_records` VALUES (114, '84915987-21e0-44f1-98bf-f22c025aba8d', '465832', 1, 1, 5, 4, 7, 10, 8, 1, 0, 1, 160, 160, -80, -80, -80, -80, '2026-05-03 18:55:50', '2026-05-03 18:57:22', 100, '2026-05-03 18:57:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1);
INSERT INTO `ddz_game_records` VALUES (115, '3ad5d0d0-6f10-4012-91f7-82ad7b4e56b8', '753739', 1, 1, 7, 5, 4, 10, 16, 0, 0, 2, -320, -320, 160, 160, 160, 160, '2026-05-03 19:02:24', '2026-05-03 19:04:18', 120, '2026-05-03 19:04:17', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1);

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
  `login_type` tinyint NOT NULL COMMENT '登录类型:1-手机号,2-微信,3-游客',
  `login_result` tinyint NOT NULL COMMENT '登录结果:0-失败,1-成功',
  `fail_reason` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '失败原因',
  `ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '登录IP',
  `device_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备ID',
  `device_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备类型',
  `user_agent` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'User-Agent',
  `location` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '登录地点',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_login_logs_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_ddz_login_logs_account_id`(`account_id` ASC) USING BTREE,
  INDEX `idx_ddz_login_logs_created_at`(`created_at` ASC) USING BTREE,
  CONSTRAINT `fk_ddz_login_logs_account` FOREIGN KEY (`account_id`) REFERENCES `ddz_user_accounts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ddz_login_logs_player` FOREIGN KEY (`player_id`) REFERENCES `ddz_players` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 45 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_login_logs
-- ----------------------------
INSERT INTO `ddz_login_logs` VALUES (1, 1, 1, 1, 1, '', '[::1]', '', 'Unknown', 'curl/8.5.0', '', '2026-04-25 12:10:45');
INSERT INTO `ddz_login_logs` VALUES (2, 2, 2, 1, 1, '', '[::1]', '', 'Unknown', 'curl/8.5.0', '', '2026-04-25 12:11:06');
INSERT INTO `ddz_login_logs` VALUES (3, 2, 2, 1, 1, '', '[::1]', '', 'Unknown', 'curl/8.5.0', '', '2026-04-25 12:11:15');
INSERT INTO `ddz_login_logs` VALUES (4, 3, 3, 1, 1, '', '[::1]', '', 'Unknown', 'curl/8.5.0', '', '2026-04-25 12:11:20');
INSERT INTO `ddz_login_logs` VALUES (5, 4, 4, 1, 1, '', '127.0.0.1', 'web_1777103633483', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 15:53:53');
INSERT INTO `ddz_login_logs` VALUES (6, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104357220', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:05:57');
INSERT INTO `ddz_login_logs` VALUES (7, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104487562', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:08:07');
INSERT INTO `ddz_login_logs` VALUES (8, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104498108', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:08:18');
INSERT INTO `ddz_login_logs` VALUES (9, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104632583', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:10:32');
INSERT INTO `ddz_login_logs` VALUES (10, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104633147', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:10:32');
INSERT INTO `ddz_login_logs` VALUES (11, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104634187', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:10:33');
INSERT INTO `ddz_login_logs` VALUES (12, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104634851', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:10:34');
INSERT INTO `ddz_login_logs` VALUES (13, 4, 4, 1, 1, '', '127.0.0.1', 'web_1777104646972', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:10:47');
INSERT INTO `ddz_login_logs` VALUES (14, 4, 4, 1, 1, '', '127.0.0.1', 'web_1777104648916', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:10:49');
INSERT INTO `ddz_login_logs` VALUES (15, 4, 4, 1, 1, '', '127.0.0.1', 'web_1777104649404', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:10:50');
INSERT INTO `ddz_login_logs` VALUES (16, 4, 4, 1, 1, '', '127.0.0.1', 'web_1777104649621', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:10:50');
INSERT INTO `ddz_login_logs` VALUES (17, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104873979', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:14:34');
INSERT INTO `ddz_login_logs` VALUES (18, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104878203', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:14:37');
INSERT INTO `ddz_login_logs` VALUES (19, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104878852', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:14:38');
INSERT INTO `ddz_login_logs` VALUES (20, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104879069', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:14:38');
INSERT INTO `ddz_login_logs` VALUES (21, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104879259', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:14:38');
INSERT INTO `ddz_login_logs` VALUES (22, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777104879453', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:14:38');
INSERT INTO `ddz_login_logs` VALUES (23, 4, 4, 1, 1, '', '127.0.0.1', 'web_1777106609797', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 16:43:29');
INSERT INTO `ddz_login_logs` VALUES (24, 4, 4, 1, 1, '', '127.0.0.1', 'web_1777107796118', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 17:03:17');
INSERT INTO `ddz_login_logs` VALUES (25, 5, 5, 1, 1, '', '127.0.0.1', 'web_1777108631556', 'Web Browser', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 17:17:11');
INSERT INTO `ddz_login_logs` VALUES (26, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 18:21:55');
INSERT INTO `ddz_login_logs` VALUES (27, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-25 19:22:12');
INSERT INTO `ddz_login_logs` VALUES (29, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-26 12:14:56');
INSERT INTO `ddz_login_logs` VALUES (30, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-26 12:21:30');
INSERT INTO `ddz_login_logs` VALUES (31, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-26 12:21:55');
INSERT INTO `ddz_login_logs` VALUES (32, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-26 12:26:06');
INSERT INTO `ddz_login_logs` VALUES (33, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-26 13:10:39');
INSERT INTO `ddz_login_logs` VALUES (34, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-26 13:30:26');
INSERT INTO `ddz_login_logs` VALUES (35, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-26 13:44:03');
INSERT INTO `ddz_login_logs` VALUES (36, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-26 19:27:17');
INSERT INTO `ddz_login_logs` VALUES (37, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-26 20:38:50');
INSERT INTO `ddz_login_logs` VALUES (40, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-04-26 21:12:17');
INSERT INTO `ddz_login_logs` VALUES (41, 5, 5, 1, 1, '', '127.0.0.1', '', 'Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '', '2026-04-27 21:16:37');
INSERT INTO `ddz_login_logs` VALUES (42, 7, 6, 1, 1, '', '127.0.0.1', '', 'Android', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36', '', '2026-04-29 10:42:23');
INSERT INTO `ddz_login_logs` VALUES (43, 4, 4, 1, 1, '', '127.0.0.1', '', 'iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '', '2026-05-03 21:18:24');
INSERT INTO `ddz_login_logs` VALUES (44, 8, 7, 1, 1, '', '127.0.0.1', '', 'Android', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36 Edg/146.0.0.0', '', '2026-05-06 21:37:35');

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
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '游戏唯一标识',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `player_role` tinyint NOT NULL COMMENT '玩家角色:1-地主,2-农民',
  `round_num` bigint NOT NULL COMMENT '回合数',
  `play_order` bigint NOT NULL COMMENT '本回合出牌顺序',
  `play_type` tinyint NOT NULL COMMENT '出牌类型:1-出牌,2-不出/过,3-超时自动出牌',
  `cards` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '出的牌',
  `cards_count` bigint NOT NULL DEFAULT 0 COMMENT '出牌数量',
  `card_pattern` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '牌型',
  `is_bomb` tinyint NOT NULL DEFAULT 0 COMMENT '是否炸弹',
  `is_rocket` tinyint NOT NULL DEFAULT 0 COMMENT '是否火箭',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
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
  `stat_date` date NOT NULL COMMENT '统计日期',
  `total_games` bigint NOT NULL DEFAULT 0 COMMENT '总场次',
  `win_games` bigint NOT NULL DEFAULT 0 COMMENT '胜场',
  `lose_games` bigint NOT NULL DEFAULT 0 COMMENT '负场',
  `win_rate` double NULL DEFAULT 0 COMMENT '胜率(%)',
  `landlord_games` bigint NOT NULL DEFAULT 0 COMMENT '当地主场次',
  `landlord_wins` bigint NOT NULL DEFAULT 0 COMMENT '当地主胜场',
  `farmer_games` bigint NOT NULL DEFAULT 0 COMMENT '当农民场次',
  `farmer_wins` bigint NOT NULL DEFAULT 0 COMMENT '当农民胜场',
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
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
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
  `player_type` tinyint NOT NULL DEFAULT 1 COMMENT '玩家类型:1-真人,2-机器人',
  `robot_status` tinyint NOT NULL DEFAULT 0 COMMENT '机器人状态:0-空闲,1-竞技场中',
  `robot_current_session_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '当前竞技场会话ID',
  `robot_locked_at` datetime NULL DEFAULT NULL COMMENT '机器人锁定时间',
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
  `status_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '' COMMENT '状态变更原因',
  `status_expire` datetime NULL DEFAULT NULL COMMENT '状态过期时间(冻结/封禁到期)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_ddz_players_nickname`(`nickname` ASC) USING BTREE,
  UNIQUE INDEX `idx_ddz_players_username`(`username` ASC) USING BTREE,
  INDEX `idx_ddz_players_status`(`status` ASC) USING BTREE,
  INDEX `idx_ddz_players_deleted_at`(`deleted_at` ASC) USING BTREE,
  INDEX `idx_ddz_players_player_type`(`player_type` ASC) USING BTREE,
  INDEX `idx_robot_available`(`player_type` ASC, `robot_status` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 19 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_players
-- ----------------------------
INSERT INTO `ddz_players` VALUES (1, 'phone_13800138000', '用户80000147', '', 0, 1, 0, NULL, NULL, 1000, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, '2026-04-25 12:10:45', '[::1]', '2026-04-25 12:10:45', '2026-04-25 12:10:45', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (2, 'phone_13800138001', '用户80018735', '', 0, 1, 0, NULL, NULL, 1000, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, '2026-04-25 12:11:15', '[::1]', '2026-04-25 12:11:06', '2026-04-25 12:11:15', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (3, 'phone_13800138003', '用户80032758', '', 0, 1, 0, NULL, NULL, 1000, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, '2026-04-25 12:11:20', '[::1]', '2026-04-25 12:11:20', '2026-04-25 12:11:20', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (4, 'phone_15888888888', '李宁', 'uploads/file/2026/05/06/b6f61982-aae1-4d61-afd2-fbab61193356.jpg', 0, 1, 0, NULL, NULL, 10960, 300, 0, 0, 1, 0, 4, 5, 3, 6, 1, '2026-05-03 21:18:24', '127.0.0.1', '2026-04-25 15:53:53', '2026-05-07 22:24:21', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (5, 'phone_15208384146', '用户41461120', '', 0, 1, 0, NULL, NULL, 10380, 0, 0, 0, 1, 0, 4, 5, 3, 6, 1, '2026-04-27 21:16:37', '127.0.0.1', '2026-04-25 16:05:56', '2026-05-03 19:04:18', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (7, 'phone_13999999999', '用户99995055', 'uploads/file/2026/05/06/b6f61982-aae1-4d61-afd2-fbab61193356.jpg', 2, 1, 0, NULL, NULL, 9660, 0, 0, 0, 1, 0, 2, 7, 3, 6, 1, '2026-04-29 10:42:23', '127.0.0.1', '2026-04-29 10:42:23', '2026-05-06 14:25:18', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (8, 'phone_13888888888', '用户88886547', '', 0, 1, 0, NULL, NULL, 1000, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, '2026-05-06 21:37:35', '127.0.0.1', '2026-05-06 21:37:35', '2026-05-06 21:37:35', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (9, 'robot_1778117063805_6545', '活泼松鼠', '/uploads/file/avatar/avatar_28.jpg', 1, 2, 1, NULL, '2026-05-07 17:05:01', 9593, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, NULL, '', '2026-05-07 09:24:24', '2026-05-07 17:05:01', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (10, 'robot_1778117063831_7654', '优雅天鹅', '/uploads/file/avatar/avatar_13.jpeg', 0, 2, 1, NULL, '2026-05-07 17:45:00', 2687, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, NULL, '', '2026-05-07 09:24:24', '2026-05-07 17:45:00', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (11, 'robot_1778117063843_2733', '天选之人', '/uploads/file/avatar/avatar_26.jpeg', 1, 2, 1, NULL, '2026-05-07 17:35:00', 8516, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, NULL, '', '2026-05-07 09:24:24', '2026-05-07 17:35:00', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (12, 'robot_1778117063853_9778', '快乐小兔', '/uploads/file/avatar/avatar_28.jpg', 2, 2, 1, NULL, '2026-05-07 16:50:01', 3196, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, NULL, '', '2026-05-07 09:24:24', '2026-05-07 16:50:01', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (13, 'robot_1778117063866_8617', '岁月无忧', '/uploads/file/avatar/avatar_13.jpeg', 1, 2, 1, NULL, '2026-05-07 16:50:01', 5712, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, NULL, '', '2026-05-07 09:24:24', '2026-05-07 16:50:01', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (14, 'robot_1778117063885_3842', '文人墨客', '/uploads/file/avatar/avatar_2.png', 0, 2, 1, NULL, '2026-05-07 19:15:01', 3639, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, NULL, '', '2026-05-07 09:24:24', '2026-05-07 19:15:01', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (15, 'robot_1778117063901_50', '新手村民', '/uploads/file/avatar/avatar_4.jpeg', 0, 2, 1, NULL, '2026-05-07 19:15:01', 2664, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, NULL, '', '2026-05-07 09:24:24', '2026-05-07 19:15:01', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (16, 'robot_1778117063917_4663', '诗词歌赋', '/uploads/file/avatar/avatar_25.jpeg', 0, 2, 1, NULL, '2026-05-07 17:45:00', 7727, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, NULL, '', '2026-05-07 09:24:24', '2026-05-07 17:45:00', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (17, 'robot_1778117063934_8418', '清风明月', '/uploads/file/avatar/avatar_3.jpeg', 2, 2, 1, NULL, '2026-05-07 17:05:01', 5631, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, NULL, '', '2026-05-07 09:24:24', '2026-05-07 17:05:01', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (18, 'robot_1778117063951_8297', '奶茶爱好者', '/uploads/file/avatar/avatar_14.jpg', 0, 2, 1, NULL, '2026-05-07 17:35:00', 8948, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, NULL, '', '2026-05-07 09:24:24', '2026-05-07 17:35:00', NULL, 0, '', NULL);

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
-- Table structure for ddz_robot_config
-- ----------------------------
DROP TABLE IF EXISTS `ddz_robot_config`;
CREATE TABLE `ddz_robot_config`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `config_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '配置名称',
  `min_think_time` int NOT NULL DEFAULT 1500 COMMENT '最小思考时间(毫秒)',
  `max_think_time` int NOT NULL DEFAULT 3000 COMMENT '最大思考时间(毫秒)',
  `bomb_think_time` int NOT NULL DEFAULT 4000 COMMENT '炸弹思考时间(毫秒)',
  `bomb_probability` decimal(5, 2) NOT NULL DEFAULT 0.60 COMMENT '炸弹使用概率(0-1)',
  `landlord_bid_probability` decimal(5, 2) NOT NULL DEFAULT 0.50 COMMENT '抢地主概率(0-1)',
  `let_win_probability` decimal(5, 2) NOT NULL DEFAULT 0.85 COMMENT '决赛让牌概率(0-1)',
  `let_win_min_rank` bigint NOT NULL DEFAULT 3 COMMENT '触发让牌的最小排名',
  `is_default` tinyint NOT NULL DEFAULT 1 COMMENT '是否默认配置:0-否,1-是',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态:0-禁用,1-启用',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '配置描述',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '机器人AI配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_robot_config
-- ----------------------------
INSERT INTO `ddz_robot_config` VALUES (1, '默认配置', 1500, 3000, 2000, 0.60, 0.50, 0.85, 3, 1, '2026-05-07 11:06:22', '2026-05-07 13:57:39', 1, NULL);

-- ----------------------------
-- Table structure for ddz_room_config
-- ----------------------------
DROP TABLE IF EXISTS `ddz_room_config`;
CREATE TABLE `ddz_room_config`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `room_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '房间名称',
  `room_type` tinyint NOT NULL DEFAULT 1 COMMENT '房间类型:1-普通场,2-高级场,3-富豪场,4-至尊场',
  `room_category` tinyint NOT NULL DEFAULT 1 COMMENT '房间分类:1-普通场,2-竞技场',
  `base_score` bigint NOT NULL DEFAULT 1 COMMENT '底分',
  `multiplier` bigint NOT NULL DEFAULT 1 COMMENT '初始倍数',
  `min_gold` bigint NOT NULL DEFAULT 0 COMMENT '最低入场金币',
  `min_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '最低入场竞技币(竞技场房间使用)',
  `max_gold` bigint NOT NULL DEFAULT 0 COMMENT '最高入场金币(0表示无限制)',
  `max_arena_coin` bigint NOT NULL DEFAULT 0 COMMENT '最高入场竞技币(竞技场房间使用,0表示无限制)',
  `match_time_ranges` json NULL COMMENT '开赛时间段(JSON)',
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
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` datetime NULL DEFAULT NULL COMMENT '删除时间',
  `bg_image_num` tinyint NOT NULL DEFAULT 2 COMMENT '背景图编号',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_ddz_room_config_room_type`(`room_type` ASC) USING BTREE,
  INDEX `idx_ddz_room_config_status`(`status` ASC) USING BTREE,
  INDEX `idx_ddz_room_config_deleted_at`(`deleted_at` ASC) USING BTREE,
  INDEX `idx_ddz_room_config_room_category`(`room_category` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_room_config
-- ----------------------------
INSERT INTO `ddz_room_config` VALUES (1, '新手场', 2, 2, 1, 1, 1000, 100, 50000, 0, '[{\"end\": \"23:59\", \"start\": \"00:00\"}]', 5, 3, 0, 90, 30, NULL, 1, 5, 0.0000, 20, 30, 1, 1, '适合新手玩家,底分1,最低1000金币入场', '2026-04-26 09:27:51', '2026-05-07 06:55:58', NULL, 2);
INSERT INTO `ddz_room_config` VALUES (2, '普通场', 3, 2, 2, 1, 50000, 500, 200000, 0, '[{\"end\": \"23:59\", \"start\": \"17:00\"}]', 10, 3, 0, 9, 3, NULL, 1, 3, 0.0100, 20, 25, 1, 2, '底分2,适合有一定经验的玩家', '2026-04-26 09:27:51', '2026-05-06 16:57:54', NULL, 3);
INSERT INTO `ddz_room_config` VALUES (3, '高级场', 4, 2, 5, 2, 200000, 1000, 1000000, 0, '[{\"end\": \"21:00\", \"start\": \"17:00\"}]', 30, 3, 0, 9, 3, NULL, 1, 2, 0.0200, 20, 20, 1, 3, '底分5,倍数2,高手对决', '2026-04-26 09:27:51', '2026-05-06 20:03:52', NULL, 4);
INSERT INTO `ddz_room_config` VALUES (4, '富豪场', 5, 1, 10, 3, 1000, 0, 0, 0, NULL, 5, 3, 0, 9, 3, NULL, 0, 0, 0.0300, 20, 20, 1, 4, '底分10,倍数3,富豪专属', '2026-04-26 09:27:51', '2026-04-28 10:00:53', NULL, 5);
INSERT INTO `ddz_room_config` VALUES (5, '至尊场', 6, 2, 20, 5, 5000000, 0, 0, 0, NULL, 5, 3, 0, 9, 3, NULL, 0, 0, 0.0500, 20, 15, 0, 5, '底分20,倍数5,顶级玩家对决,无上限', '2026-04-26 09:27:51', '2026-04-27 18:18:14', '2026-04-28 10:01:05', 2);

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
) ENGINE = InnoDB AUTO_INCREMENT = 142 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '房间表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_rooms_202605
-- ----------------------------
INSERT INTO `ddz_rooms_202605` VALUES (132, '368493', '房368493', 0, 1, 1, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-04 16:43:03', '2026-05-04 16:43:09', '2026-05-04 16:43:09');
INSERT INTO `ddz_rooms_202605` VALUES (133, '871191', '房871191', 0, 1, 1, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-04 21:30:13', '2026-05-04 21:30:15', '2026-05-04 21:30:15');
INSERT INTO `ddz_rooms_202605` VALUES (134, '650933', '房650933', 0, 1, 1, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-05 10:57:17', '2026-05-05 10:57:18', '2026-05-05 10:57:19');
INSERT INTO `ddz_rooms_202605` VALUES (135, '162790', '房162790', 0, 1, 1, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-06 10:06:44', '2026-05-06 10:06:45', '2026-05-06 10:06:46');
INSERT INTO `ddz_rooms_202605` VALUES (136, '935571', '房935571', 0, 1, 1, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-06 19:04:39', '2026-05-06 19:04:42', '2026-05-06 19:04:43');
INSERT INTO `ddz_rooms_202605` VALUES (137, '085117', '房085117', 0, 1, 1, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-06 19:09:47', '2026-05-06 19:09:48', '2026-05-06 19:09:48');
INSERT INTO `ddz_rooms_202605` VALUES (138, '282377', '房282377', 0, 1, 1, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-07 20:02:23', '2026-05-07 20:02:25', '2026-05-07 20:02:26');
INSERT INTO `ddz_rooms_202605` VALUES (139, '946133', '房946133', 0, 1, 1, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-07 20:40:12', '2026-05-07 20:40:14', '2026-05-07 20:40:15');
INSERT INTO `ddz_rooms_202605` VALUES (140, '309892', '房309892', 1, 2, 2, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-07 21:05:01', '2026-05-07 22:20:00', '2026-05-07 22:20:00');
INSERT INTO `ddz_rooms_202605` VALUES (141, '487730', '房487730', 1, 2, 2, 4, 1, 3, 1, 1, 1, 4, NULL, NULL, '2026-05-07 22:20:01', '2026-05-07 22:20:00', NULL);

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
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '手机号',
  `code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '验证码',
  `type` tinyint NOT NULL DEFAULT 1 COMMENT '类型:1-登录,2-注册,3-绑定手机,4-修改密码',
  `is_used` tinyint NOT NULL DEFAULT 0 COMMENT '是否已使用:0-否,1-是',
  `expire_at` datetime NULL DEFAULT NULL COMMENT '过期时间',
  `used_at` datetime NULL DEFAULT NULL COMMENT '使用时间',
  `ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '请求IP',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
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
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号',
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '密码(加密存储)',
  `wx_open_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信OpenID',
  `wx_union_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信UnionID',
  `wx_session_key` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信会话密钥',
  `wx_nickname` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信昵称',
  `wx_avatar` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信头像URL',
  `login_type` tinyint NOT NULL DEFAULT 1 COMMENT '登录类型:1-手机号,2-微信,3-游客',
  `token` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '登录Token',
  `token_expire_at` datetime NULL DEFAULT NULL COMMENT 'Token过期时间',
  `refresh_token` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '刷新Token',
  `refresh_token_expire_at` datetime NULL DEFAULT NULL COMMENT '刷新Token过期时间',
  `device_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备ID',
  `device_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '设备类型',
  `last_login_at` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '最后登录IP',
  `login_count` bigint NOT NULL DEFAULT 0 COMMENT '登录次数',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态:0-禁用,1-正常,2-封禁',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` datetime NULL DEFAULT NULL COMMENT '删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_user_accounts_wx_union_id`(`wx_union_id` ASC) USING BTREE,
  INDEX `idx_ddz_user_accounts_token`(`token` ASC) USING BTREE,
  INDEX `idx_ddz_user_accounts_status`(`status` ASC) USING BTREE,
  INDEX `idx_ddz_user_accounts_deleted_at`(`deleted_at` ASC) USING BTREE,
  INDEX `idx_ddz_user_accounts_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_ddz_user_accounts_phone`(`phone` ASC) USING BTREE,
  INDEX `idx_ddz_user_accounts_wx_open_id`(`wx_open_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_user_accounts
-- ----------------------------
INSERT INTO `ddz_user_accounts` VALUES (1, 1, '13800138000', '', NULL, NULL, '', '', '', 1, 'FTjEHwU8zmhXdKAwCicJOhtDfiN7l8PR', '2026-05-02 12:10:45', '', NULL, '', 'Unknown', '2026-04-25 12:10:45', '[::1]', 1, 1, '2026-04-25 12:10:45', '2026-04-25 12:10:45', NULL);
INSERT INTO `ddz_user_accounts` VALUES (2, 2, '13800138001', '', NULL, NULL, '', '', '', 1, 'qA7bInyI9iVJeJ4ZTA5fjIaMrVwbFKTQ', '2026-05-02 12:11:15', '', NULL, '', 'Unknown', '2026-04-25 12:11:15', '[::1]', 2, 1, '2026-04-25 12:11:06', '2026-04-25 12:11:15', NULL);
INSERT INTO `ddz_user_accounts` VALUES (3, 3, '13800138003', '', NULL, NULL, '', '', '', 1, 'jNNq8rDPAs7MyuxqymDEJpMPlk8Fl5Nk', '2026-05-02 12:11:20', '', NULL, '', 'Unknown', '2026-04-25 12:11:20', '[::1]', 1, 1, '2026-04-25 12:11:20', '2026-04-25 12:11:20', NULL);
INSERT INTO `ddz_user_accounts` VALUES (4, 4, '15888888888', '', NULL, NULL, '', '', '', 1, 'tv9uIUW1L9CKc0i2IXcIQoQXBYMQ3EB4', '2026-05-10 21:18:24', '', NULL, '', 'iPhone', '2026-05-03 21:18:24', '127.0.0.1', 20, 1, '2026-04-25 15:53:53', '2026-05-03 21:18:24', NULL);
INSERT INTO `ddz_user_accounts` VALUES (5, 5, '15208384146', '', NULL, NULL, '', '', '', 1, 'K0fLKImDSNABfVAv5HNgf8CZ3AOwj80A', '2026-05-04 21:16:37', '', NULL, '', 'Windows', '2026-04-27 21:16:37', '127.0.0.1', 15, 1, '2026-04-25 16:05:56', '2026-04-27 21:16:37', NULL);
INSERT INTO `ddz_user_accounts` VALUES (6, 7, '13999999999', '', NULL, NULL, '', '', '', 1, 'tTPp0v2CJkFVxEjGnn1L4KYxIdwWJga3', '2026-05-06 10:42:23', '', NULL, '', 'Android', '2026-04-29 10:42:23', '127.0.0.1', 1, 1, '2026-04-29 10:42:23', '2026-04-29 10:42:23', NULL);
INSERT INTO `ddz_user_accounts` VALUES (7, 8, '13888888888', '', NULL, NULL, '', '', '', 1, 'JVgvFtD7U9T7O4oUMM9XDUgPGNvQJx46', '2026-05-13 21:37:35', '', NULL, '', 'Android', '2026-05-06 21:37:35', '127.0.0.1', 1, 1, '2026-05-06 21:37:35', '2026-05-06 21:37:35', NULL);
INSERT INTO `ddz_user_accounts` VALUES (8, 9, NULL, '', 'robot_ffdf151f42fb85e3', 'union_e056998b2152a51a', '', '活泼松鼠', '/uploads/file/avatar/avatar_28.jpg', 2, 'WdpuL6OjkfSrC501', '2026-05-14 09:24:24', '', NULL, '', 'robot', '2026-05-07 09:24:24', '', 1, 1, '2026-05-07 09:24:24', '2026-05-07 09:24:24', NULL);
INSERT INTO `ddz_user_accounts` VALUES (9, 10, NULL, '', 'robot_7e09896b4c5b1045', 'union_52d21e711052818b', '', '优雅天鹅', '/uploads/file/avatar/avatar_13.jpeg', 2, 'ifxCUyRuTRIce9nv', '2026-05-14 09:24:24', '', NULL, '', 'robot', '2026-05-07 09:24:24', '', 1, 1, '2026-05-07 09:24:24', '2026-05-07 09:24:24', NULL);
INSERT INTO `ddz_user_accounts` VALUES (10, 11, NULL, '', 'robot_a5088198fafbd82b', 'union_c21ee064abc30388', '', '天选之人', '/uploads/file/avatar/avatar_26.jpeg', 2, 'eD0xIsWlOHhTa6b9', '2026-05-14 09:24:24', '', NULL, '', 'robot', '2026-05-07 09:24:24', '', 1, 1, '2026-05-07 09:24:24', '2026-05-07 09:24:24', NULL);
INSERT INTO `ddz_user_accounts` VALUES (11, 12, NULL, '', 'robot_d66768bf2e8be7db', 'union_8da872969a3a3351', '', '快乐小兔', '/uploads/file/avatar/avatar_28.jpg', 2, 'JrbcoeQinkDOn6CX', '2026-05-14 09:24:24', '', NULL, '', 'robot', '2026-05-07 09:24:24', '', 1, 1, '2026-05-07 09:24:24', '2026-05-07 09:24:24', NULL);
INSERT INTO `ddz_user_accounts` VALUES (12, 13, NULL, '', 'robot_7acb558106da9050', 'union_3cf8e909bb4e3bda', '', '岁月无忧', '/uploads/file/avatar/avatar_13.jpeg', 2, 'IaCR9crUMm9fWkLJ', '2026-05-14 09:24:24', '', NULL, '', 'robot', '2026-05-07 09:24:24', '', 1, 1, '2026-05-07 09:24:24', '2026-05-07 09:24:24', NULL);
INSERT INTO `ddz_user_accounts` VALUES (13, 14, NULL, '', 'robot_8f187642134e35e2', 'union_26f2dd34d685c798', '', '文人墨客', '/uploads/file/avatar/avatar_2.png', 2, '4NEcwIpPBYQdjjPN', '2026-05-14 09:24:24', '', NULL, '', 'robot', '2026-05-07 09:24:24', '', 1, 1, '2026-05-07 09:24:24', '2026-05-07 09:24:24', NULL);
INSERT INTO `ddz_user_accounts` VALUES (14, 15, NULL, '', 'robot_4188639de7fd14ca', 'union_23c9ccf244a678ce', '', '新手村民', '/uploads/file/avatar/avatar_4.jpeg', 2, 'ctcsyxxHZ3eVwE3w', '2026-05-14 09:24:24', '', NULL, '', 'robot', '2026-05-07 09:24:24', '', 1, 1, '2026-05-07 09:24:24', '2026-05-07 09:24:24', NULL);
INSERT INTO `ddz_user_accounts` VALUES (15, 16, NULL, '', 'robot_f7de569d689c092f', 'union_642419752609df9e', '', '诗词歌赋', '/uploads/file/avatar/avatar_25.jpeg', 2, 'w6owm4zfS8xXhlG2', '2026-05-14 09:24:24', '', NULL, '', 'robot', '2026-05-07 09:24:24', '', 1, 1, '2026-05-07 09:24:24', '2026-05-07 09:24:24', NULL);
INSERT INTO `ddz_user_accounts` VALUES (16, 17, NULL, '', 'robot_b6f28e7e37f842e6', 'union_b8b9895caa363463', '', '清风明月', '/uploads/file/avatar/avatar_3.jpeg', 2, 'pb6osqPQA51kKZf9', '2026-05-14 09:24:24', '', NULL, '', 'robot', '2026-05-07 09:24:24', '', 1, 1, '2026-05-07 09:24:24', '2026-05-07 09:24:24', NULL);
INSERT INTO `ddz_user_accounts` VALUES (17, 18, NULL, '', 'robot_db4264d851b51a83', 'union_117672b99287bc28', '', '奶茶爱好者', '/uploads/file/avatar/avatar_14.jpg', 2, 'mjPaEK6DGSbzRQXl', '2026-05-14 09:24:24', '', NULL, '', 'robot', '2026-05-07 09:24:24', '', 1, 1, '2026-05-07 09:24:24', '2026-05-07 09:24:24', NULL);

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
