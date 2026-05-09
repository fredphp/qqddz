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

 Date: 09/05/2026 22:32:07
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
) ENGINE = InnoDB AUTO_INCREMENT = 74 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '竞技币流水记录表' ROW_FORMAT = Dynamic;

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
INSERT INTO `ddz_arena_coin_logs` VALUES (21, 4, -100, 200, 5, '260508010100', '竞技场报名扣除', '2026-05-08 08:19:21');
INSERT INTO `ddz_arena_coin_logs` VALUES (22, 4, -100, 100, 5, '260508010104', '竞技场报名扣除', '2026-05-08 08:39:11');
INSERT INTO `ddz_arena_coin_logs` VALUES (23, 4, -100, 0, 5, '260508010109', '竞技场报名扣除', '2026-05-08 09:04:04');
INSERT INTO `ddz_arena_coin_logs` VALUES (24, 4, 100, 100, 6, '260508010109', '取消报名退还', '2026-05-08 09:04:08');
INSERT INTO `ddz_arena_coin_logs` VALUES (25, 4, -100, 0, 5, '260508010109', '竞技场报名扣除', '2026-05-08 09:04:16');
INSERT INTO `ddz_arena_coin_logs` VALUES (26, 4, 10000, 10000, 4, '', '增加竞技币', '2026-05-08 10:21:20');
INSERT INTO `ddz_arena_coin_logs` VALUES (27, 4, -100, 9900, 5, '260508010133', '竞技场报名扣除', '2026-05-08 11:01:46');
INSERT INTO `ddz_arena_coin_logs` VALUES (28, 4, -100, 9800, 5, '260508010139', '竞技场报名扣除', '2026-05-08 11:34:35');
INSERT INTO `ddz_arena_coin_logs` VALUES (29, 4, -100, 9700, 5, '260508010144', '竞技场报名扣除', '2026-05-08 11:56:01');
INSERT INTO `ddz_arena_coin_logs` VALUES (30, 4, -100, 9600, 5, '260508010149', '竞技场报名扣除', '2026-05-08 12:23:07');
INSERT INTO `ddz_arena_coin_logs` VALUES (31, 4, -100, 9500, 5, '260508010162', '竞技场报名扣除', '2026-05-08 13:26:12');
INSERT INTO `ddz_arena_coin_logs` VALUES (32, 4, -100, 9400, 5, '260508010163', '竞技场报名扣除', '2026-05-08 13:31:04');
INSERT INTO `ddz_arena_coin_logs` VALUES (33, 4, -100, 9300, 5, '260508010165', '竞技场报名扣除', '2026-05-08 13:44:38');
INSERT INTO `ddz_arena_coin_logs` VALUES (34, 4, -100, 9200, 5, '260508010168', '竞技场报名扣除', '2026-05-08 13:56:41');
INSERT INTO `ddz_arena_coin_logs` VALUES (35, 4, -100, 9100, 5, '260508010171', '竞技场报名扣除', '2026-05-08 14:12:43');
INSERT INTO `ddz_arena_coin_logs` VALUES (36, 4, -100, 9000, 5, '260508010177', '竞技场报名扣除', '2026-05-08 14:42:34');
INSERT INTO `ddz_arena_coin_logs` VALUES (37, 4, -100, 8900, 5, '260508010179', '竞技场报名扣除', '2026-05-08 14:52:28');
INSERT INTO `ddz_arena_coin_logs` VALUES (38, 4, -100, 8800, 5, '260508010180', '竞技场报名扣除', '2026-05-08 14:56:01');
INSERT INTO `ddz_arena_coin_logs` VALUES (39, 4, -100, 8700, 5, '260508010182', '竞技场报名扣除', '2026-05-08 15:06:20');
INSERT INTO `ddz_arena_coin_logs` VALUES (40, 4, -100, 8600, 5, '260508010187', '竞技场报名扣除', '2026-05-08 15:32:16');
INSERT INTO `ddz_arena_coin_logs` VALUES (41, 4, -100, 8500, 5, '260508010194', '竞技场报名扣除', '2026-05-08 16:09:15');
INSERT INTO `ddz_arena_coin_logs` VALUES (42, 4, -100, 8400, 5, '260508010197', '竞技场报名扣除', '2026-05-08 16:24:19');
INSERT INTO `ddz_arena_coin_logs` VALUES (43, 4, -100, 8300, 5, '260508010202', '竞技场报名扣除', '2026-05-08 16:46:30');
INSERT INTO `ddz_arena_coin_logs` VALUES (44, 4, -100, 8200, 5, '260508010231', '竞技场报名扣除', '2026-05-08 19:11:51');
INSERT INTO `ddz_arena_coin_logs` VALUES (45, 4, -100, 8100, 5, '260508010245', '竞技场报名扣除', '2026-05-08 20:21:02');
INSERT INTO `ddz_arena_coin_logs` VALUES (46, 4, -100, 8000, 5, '260509010087', '竞技场报名扣除', '2026-05-09 07:11:01');
INSERT INTO `ddz_arena_coin_logs` VALUES (47, 4, 100, 8100, 6, '260509010087', '进入阶段超时返还，期号:260509010087', '2026-05-09 07:15:58');
INSERT INTO `ddz_arena_coin_logs` VALUES (48, 4, -100, 8000, 5, '260509010088', '竞技场报名扣除', '2026-05-09 07:16:14');
INSERT INTO `ddz_arena_coin_logs` VALUES (49, 4, -100, 7900, 5, '260509010091', '竞技场报名扣除', '2026-05-09 07:34:12');
INSERT INTO `ddz_arena_coin_logs` VALUES (50, 4, -100, 7800, 5, '260509010095', '竞技场报名扣除', '2026-05-09 07:52:48');
INSERT INTO `ddz_arena_coin_logs` VALUES (51, 4, -100, 7700, 5, '260509010120', '竞技场报名扣除', '2026-05-09 09:59:51');
INSERT INTO `ddz_arena_coin_logs` VALUES (52, 4, -100, 7600, 5, '260509010122', '竞技场报名扣除', '2026-05-09 10:07:32');
INSERT INTO `ddz_arena_coin_logs` VALUES (53, 4, -100, 7500, 5, '260509010124', '竞技场报名扣除', '2026-05-09 10:18:52');
INSERT INTO `ddz_arena_coin_logs` VALUES (54, 4, -100, 7400, 5, '260509010127', '竞技场报名扣除', '2026-05-09 10:31:10');
INSERT INTO `ddz_arena_coin_logs` VALUES (55, 4, -100, 7300, 5, '260509010130', '竞技场报名扣除', '2026-05-09 10:46:31');
INSERT INTO `ddz_arena_coin_logs` VALUES (56, 4, -100, 7200, 5, '260509010139', '竞技场报名扣除', '2026-05-09 11:31:42');
INSERT INTO `ddz_arena_coin_logs` VALUES (57, 4, -100, 7100, 5, '260509010140', '竞技场报名扣除', '2026-05-09 11:36:23');
INSERT INTO `ddz_arena_coin_logs` VALUES (58, 4, -100, 7000, 5, '260509010145', '竞技场报名扣除', '2026-05-09 12:02:24');
INSERT INTO `ddz_arena_coin_logs` VALUES (59, 4, -100, 6900, 5, '260509010147', '竞技场报名扣除', '2026-05-09 12:13:09');
INSERT INTO `ddz_arena_coin_logs` VALUES (60, 4, -100, 6800, 5, '260509010150', '竞技场报名扣除', '2026-05-09 12:27:32');
INSERT INTO `ddz_arena_coin_logs` VALUES (61, 4, -100, 6700, 5, '260509010152', '竞技场报名扣除', '2026-05-09 12:36:20');
INSERT INTO `ddz_arena_coin_logs` VALUES (62, 4, -100, 6600, 5, '260509010162', '竞技场报名扣除', '2026-05-09 13:26:12');
INSERT INTO `ddz_arena_coin_logs` VALUES (63, 4, -100, 6500, 5, '260509010164', '竞技场报名扣除', '2026-05-09 13:37:48');
INSERT INTO `ddz_arena_coin_logs` VALUES (64, 4, -100, 6400, 5, '260509010209', '竞技场报名扣除', '2026-05-09 17:21:01');
INSERT INTO `ddz_arena_coin_logs` VALUES (65, 4, -100, 6300, 5, '260509010212', '竞技场报名扣除', '2026-05-09 17:36:56');
INSERT INTO `ddz_arena_coin_logs` VALUES (66, 4, -100, 6200, 5, '260509010221', '竞技场报名扣除', '2026-05-09 18:22:37');
INSERT INTO `ddz_arena_coin_logs` VALUES (67, 4, -100, 6100, 5, '260509010227', '竞技场报名扣除', '2026-05-09 18:53:39');
INSERT INTO `ddz_arena_coin_logs` VALUES (68, 4, -100, 6000, 5, '260509010230', '竞技场报名扣除', '2026-05-09 19:06:01');
INSERT INTO `ddz_arena_coin_logs` VALUES (69, 4, -100, 5900, 5, '260509010234', '竞技场报名扣除', '2026-05-09 19:27:49');
INSERT INTO `ddz_arena_coin_logs` VALUES (70, 4, -100, 5800, 5, '260509010263', '竞技场报名扣除', '2026-05-09 21:51:00');
INSERT INTO `ddz_arena_coin_logs` VALUES (71, 4, -100, 5700, 5, '260509010269', '竞技场报名扣除', '2026-05-09 22:24:04');
INSERT INTO `ddz_arena_coin_logs` VALUES (72, 4, 100, 5800, 6, '260509010269', '取消报名退还', '2026-05-09 22:24:15');
INSERT INTO `ddz_arena_coin_logs` VALUES (73, 4, -100, 5700, 5, '260509010271', '竞技场报名扣除', '2026-05-09 22:31:40');

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
-- Table structure for ddz_arena_gold_logs
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_gold_logs`;
CREATE TABLE `ddz_arena_gold_logs`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `period_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '期号',
  `room_id` bigint NOT NULL COMMENT '房间ID',
  `player_id` bigint NOT NULL COMMENT '玩家ID',
  `match_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '对局ID',
  `before_gold` bigint NULL DEFAULT 0 COMMENT '变动前金币',
  `change_gold` bigint NULL DEFAULT 0 COMMENT '变动金币',
  `after_gold` bigint NULL DEFAULT 0 COMMENT '变动后金币',
  `reason` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '变动原因',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_period_no`(`period_no` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '竞技场金币流水表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_gold_logs
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_arena_gold_logs_202605
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_gold_logs_202605`;
CREATE TABLE `ddz_arena_gold_logs_202605`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '流水ID',
  `period_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '期号',
  `room_id` bigint UNSIGNED NOT NULL COMMENT '房间ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `match_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '对局ID',
  `before_gold` bigint NOT NULL DEFAULT 0 COMMENT '变动前金币',
  `change_gold` bigint NOT NULL DEFAULT 0 COMMENT '变动金币(正=赢,负=输)',
  `after_gold` bigint NOT NULL DEFAULT 0 COMMENT '变动后金币',
  `reason` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '变动原因',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_period_no`(`period_no` ASC) USING BTREE,
  INDEX `idx_room_id`(`room_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_match_id`(`match_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 256 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场金币流水表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_gold_logs_202605
-- ----------------------------
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (1, '260508010165', 1, 4, '', 0, 1000, 1000, 'INIT', '2026-05-08 13:44:37');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (2, '260508010165', 0, 18, '', 0, 1000, 1000, 'INIT', '2026-05-08 13:45:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (3, '260508010165', 0, 11, '', 0, 1000, 1000, 'INIT', '2026-05-08 13:45:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (4, '260508010168', 1, 4, '', 0, 1000, 1000, 'INIT', '2026-05-08 13:56:40');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (5, '260508010168', 0, 14, '', 0, 1000, 1000, 'INIT', '2026-05-08 14:00:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (6, '260508010168', 0, 12, '', 0, 1000, 1000, 'INIT', '2026-05-08 14:00:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (7, '260508010168', 1, 12, '023668', 0, -40, 0, 'LOSE', '2026-05-08 14:03:50');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (8, '260508010168', 1, 14, '023668', 0, -40, 0, 'LOSE', '2026-05-08 14:03:50');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (9, '260508010168', 1, 4, '023668', 1000, 80, 1080, 'WIN', '2026-05-08 14:03:51');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (10, '260508010171', 1, 4, '', 0, 1000, 1000, 'INIT', '2026-05-08 14:12:42');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (11, '260508010171', 0, 16, '', 0, 1000, 1000, 'INIT', '2026-05-08 14:15:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (12, '260508010171', 0, 15, '', 0, 1000, 1000, 'INIT', '2026-05-08 14:15:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (13, '260508010171', 1, 15, '704948', 0, -40, 0, 'LOSE', '2026-05-08 14:16:37');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (14, '260508010171', 1, 16, '704948', 0, -40, 0, 'LOSE', '2026-05-08 14:16:37');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (15, '260508010171', 1, 4, '704948', 1000, 80, 1080, 'WIN', '2026-05-08 14:16:37');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (16, '260508010177', 1, 4, '', 0, 1000, 1000, 'INIT', '2026-05-08 14:42:33');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (17, '260508010177', 1, 10, '', 0, 1000, 1000, 'INIT', '2026-05-08 14:45:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (18, '260508010177', 1, 9, '', 0, 1000, 1000, 'INIT', '2026-05-08 14:45:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (19, '260508010177', 1, 4, '560873', 1000, 160, 1160, 'WIN', '2026-05-08 14:45:58');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (20, '260508010177', 1, 10, '560873', 1000, -80, 920, 'LOSE', '2026-05-08 14:45:58');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (21, '260508010177', 1, 9, '560873', 1000, -80, 920, 'LOSE', '2026-05-08 14:45:58');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (22, '260508010179', 1, 4, '', 0, 1000, 1000, 'INIT', '2026-05-08 14:52:28');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (23, '260508010180', 1, 4, '', 0, 1000, 1000, 'INIT', '2026-05-08 14:56:01');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (24, '260508010180', 1, 9, '', 0, 1000, 1000, 'INIT', '2026-05-08 15:00:01');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (25, '260508010180', 1, 17, '', 0, 1000, 1000, 'INIT', '2026-05-08 15:00:01');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (26, '260508010180', 1, 4, '904184', 1000, 160, 1160, 'WIN', '2026-05-08 15:01:31');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (27, '260508010180', 1, 9, '904184', 1000, -80, 920, 'LOSE', '2026-05-08 15:01:31');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (28, '260508010180', 1, 17, '904184', 1000, -80, 920, 'LOSE', '2026-05-08 15:01:31');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (29, '260508010182', 1, 4, '', 0, 1000, 1000, 'INIT', '2026-05-08 15:06:20');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (30, '260508010182', 1, 20, '', 0, 1000, 1000, 'INIT', '2026-05-08 15:10:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (31, '260508010182', 1, 21, '', 0, 1000, 1000, 'INIT', '2026-05-08 15:10:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (32, '260508010182', 1, 4, '288465', 1000, 160, 1160, 'WIN', '2026-05-08 15:11:17');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (33, '260508010182', 1, 21, '288465', 1000, -80, 920, 'LOSE', '2026-05-08 15:11:17');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (34, '260508010182', 1, 20, '288465', 1000, -80, 920, 'LOSE', '2026-05-08 15:11:17');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (35, '260508010187', 1, 4, '', 0, 1000, 1000, 'INIT', '2026-05-08 15:32:16');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (36, '260508010187', 1, 25, '', 0, 1000, 1000, 'INIT', '2026-05-08 15:35:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (37, '260508010187', 1, 19, '', 0, 1000, 1000, 'INIT', '2026-05-08 15:35:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (38, '260508010187', 1, 4, '400847', 1000, -40, 960, 'LOSE', '2026-05-08 15:36:29');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (39, '260508010187', 1, 19, '400847', 1000, 80, 1080, 'WIN', '2026-05-08 15:36:29');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (40, '260508010187', 1, 25, '400847', 1000, 80, 1080, 'WIN', '2026-05-08 15:38:38');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (41, '260508010187', 1, 4, '400847', 960, 80, 1040, 'WIN', '2026-05-08 15:38:38');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (42, '260508010187', 1, 19, '400847', 1080, -160, 920, 'LOSE', '2026-05-08 15:38:38');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (43, '260508010187', 1, 4, '400847', 1040, 640, 1680, 'WIN', '2026-05-08 15:40:11');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (44, '260508010187', 1, 19, '400847', 920, -320, 600, 'LOSE', '2026-05-08 15:40:11');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (45, '260508010187', 1, 25, '400847', 1080, -1280, 0, 'LOSE', '2026-05-08 15:41:48');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (46, '260508010187', 1, 19, '400847', 600, -1280, 0, 'LOSE', '2026-05-08 15:41:48');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (47, '260508010187', 1, 4, '400847', 1680, 2560, 4240, 'WIN', '2026-05-08 15:41:48');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (48, '260508010187', 1, 4, '400847', 4240, 10240, 14480, 'WIN', '2026-05-08 15:43:32');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (49, '260508010187', 1, 19, '400847', 0, -5120, 0, 'LOSE', '2026-05-08 15:43:32');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (50, '260508010187', 1, 4, '400847', 14480, 20480, 34960, 'WIN', '2026-05-08 15:45:06');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (51, '260508010187', 1, 19, '400847', 0, -10240, 0, 'LOSE', '2026-05-08 15:45:06');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (52, '260508010187', 1, 4, '400847', 34960, 20480, 55440, 'WIN', '2026-05-08 15:47:21');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (53, '260508010187', 1, 19, '400847', 0, 20480, 20480, 'WIN', '2026-05-08 15:47:21');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (54, '260508010187', 1, 4, '400847', 55440, -327680, 0, 'LOSE', '2026-05-08 15:48:58');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (55, '260508010187', 1, 19, '400847', 20480, 655360, 675840, 'WIN', '2026-05-08 15:48:58');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (56, '260508010187', 1, 4, '400847', 0, 655360, 655360, 'WIN', '2026-05-08 15:51:12');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (57, '260508010187', 1, 19, '400847', 675840, -1310720, 0, 'LOSE', '2026-05-08 15:51:12');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (58, '260508010187', 1, 4, '400847', 655360, -5242880, 0, 'LOSE', '2026-05-08 15:52:47');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (59, '260508010187', 1, 19, '400847', 0, 10485760, 10485760, 'WIN', '2026-05-08 15:52:47');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (60, '260508010187', 1, 4, '400847', 0, 10485760, 10485760, 'WIN', '2026-05-08 15:54:52');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (61, '260508010187', 1, 19, '400847', 10485760, 10485760, 20971520, 'WIN', '2026-05-08 15:54:52');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (62, '260508010187', 1, 4, '400847', 10485760, -41943040, 0, 'LOSE', '2026-05-08 15:56:30');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (63, '260508010187', 1, 19, '400847', 20971520, 83886080, 104857600, 'WIN', '2026-05-08 15:56:30');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (64, '260508010194', 1, 4, '', 0, 1000, 1000, 'INIT', '2026-05-08 16:09:15');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (65, '260508010194', 1, 33, '', 0, 1000, 1000, 'INIT', '2026-05-08 16:10:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (66, '260508010194', 1, 38, '', 0, 1000, 1000, 'INIT', '2026-05-08 16:10:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (67, '260508010194', 1, 33, '836744', 1000, -80, 920, 'LOSE', '2026-05-08 16:10:37');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (68, '260508010194', 1, 38, '836744', 1000, -80, 920, 'LOSE', '2026-05-08 16:10:37');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (69, '260508010194', 1, 4, '836744', 1000, 160, 1160, 'WIN', '2026-05-08 16:10:37');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (70, '260508010194', 1, 33, '836744', 920, -320, 600, 'LOSE', '2026-05-08 16:12:29');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (71, '260508010194', 1, 38, '836744', 920, -320, 600, 'LOSE', '2026-05-08 16:12:29');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (72, '260508010194', 1, 4, '836744', 1160, 640, 1800, 'WIN', '2026-05-08 16:12:29');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (73, '260508010197', 1, 4, '', 0, 1000, 1000, 'INIT', '2026-05-08 16:24:18');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (74, '260508010197', 1, 10, '', 0, 1000, 1000, 'INIT', '2026-05-08 16:25:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (75, '260508010197', 1, 14, '', 0, 1000, 1000, 'INIT', '2026-05-08 16:25:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (76, '260508010197', 1, 4, '655355', 1000, 80, 1080, 'WIN', '2026-05-08 16:25:35');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (77, '260508010197', 1, 10, '655355', 1000, -40, 960, 'LOSE', '2026-05-08 16:25:35');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (78, '260508010197', 1, 14, '655355', 1000, -40, 960, 'LOSE', '2026-05-08 16:25:35');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (79, '260508010197', 1, 4, '655355', 1080, 160, 1240, 'WIN', '2026-05-08 16:26:54');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (80, '260508010197', 1, 10, '655355', 960, -80, 880, 'LOSE', '2026-05-08 16:26:54');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (81, '260508010197', 1, 14, '655355', 960, -80, 880, 'LOSE', '2026-05-08 16:26:54');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (82, '260508010197', 1, 4, '655355', 1240, 2560, 3800, 'WIN', '2026-05-08 16:28:11');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (83, '260508010197', 1, 10, '655355', 880, -1280, 0, 'LOSE', '2026-05-08 16:28:11');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (84, '260508010197', 1, 14, '655355', 880, -1280, 0, 'LOSE', '2026-05-08 16:28:11');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (85, '260508010202', 1, 4, '', 0, 1000, 1000, 'INIT', '2026-05-08 16:46:30');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (86, '260508010202', 1, 22, '', 0, 1000, 1000, 'INIT', '2026-05-08 16:50:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (87, '260508010202', 1, 24, '', 0, 1000, 1000, 'INIT', '2026-05-08 16:50:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (88, '260508010202', 1, 4, '663807', 1000, 320, 1320, 'WIN', '2026-05-08 16:50:48');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (89, '260508010202', 1, 24, '663807', 1000, -160, 840, 'LOSE', '2026-05-08 16:50:48');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (90, '260508010202', 1, 22, '663807', 1000, -160, 840, 'LOSE', '2026-05-08 16:50:48');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (91, '260508010202', 1, 4, '663807', 1320, 1280, 2600, 'WIN', '2026-05-08 16:52:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (92, '260508010202', 1, 24, '663807', 840, -2560, 0, 'LOSE', '2026-05-08 16:52:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (93, '260508010202', 1, 22, '663807', 840, 1280, 2120, 'WIN', '2026-05-08 16:52:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (94, '260508010202', 1, 4, '663807', 2600, -10240, 0, 'LOSE', '2026-05-08 16:53:48');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (95, '260508010202', 1, 24, '663807', 0, 20480, 20480, 'WIN', '2026-05-08 16:53:48');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (96, '260508010202', 1, 22, '663807', 2120, -10240, 0, 'LOSE', '2026-05-08 16:53:48');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (97, '260508010231', 1, 4, '', 0, 1000, 1000, 'INIT', '2026-05-08 19:11:50');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (98, '260508010231', 1, 21, '', 0, 1000, 1000, 'INIT', '2026-05-08 19:15:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (99, '260508010231', 1, 34, '', 0, 1000, 1000, 'INIT', '2026-05-08 19:15:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (100, '260508010231', 1, 4, '592012', 1000, 80, 1080, 'WIN', '2026-05-08 19:15:51');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (101, '260508010231', 1, 21, '592012', 1000, -40, 960, 'LOSE', '2026-05-08 19:15:51');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (102, '260508010231', 1, 4, '592012', 1080, 40, 1120, 'WIN', '2026-05-08 19:17:02');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (103, '260508010231', 1, 34, '592012', 1000, -20, 980, 'LOSE', '2026-05-08 19:17:02');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (104, '260508010231', 1, 21, '592012', 960, -20, 940, 'LOSE', '2026-05-08 19:17:02');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (105, '260508010231', 1, 4, '592012', 1120, 80, 1200, 'WIN', '2026-05-08 19:18:15');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (106, '260508010231', 1, 34, '592012', 980, -40, 940, 'LOSE', '2026-05-08 19:18:15');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (107, '260508010231', 1, 21, '592012', 940, -40, 900, 'LOSE', '2026-05-08 19:18:15');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (108, '260508010245', 1, 4, '', 0, 1000, 1000, 'INIT', '2026-05-08 20:21:01');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (109, '260508010245', 1, 35, '', 0, 1000, 1000, 'INIT', '2026-05-08 20:25:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (110, '260508010245', 1, 17, '', 0, 1000, 1000, 'INIT', '2026-05-08 20:25:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (111, '260508010245', 1, 4, '463452', 1000, 320, 1320, 'WIN', '2026-05-08 20:25:54');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (112, '260508010245', 1, 17, '463452', 1000, -160, 840, 'LOSE', '2026-05-08 20:25:54');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (113, '260508010245', 1, 4, '463452', 1320, 80, 1400, 'WIN', '2026-05-08 20:26:58');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (114, '260508010245', 1, 17, '463452', 840, -40, 800, 'LOSE', '2026-05-08 20:26:58');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (115, '260508010245', 1, 4, '463452', 1400, 80, 1480, 'WIN', '2026-05-08 20:28:12');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (116, '260508010245', 1, 17, '463452', 800, -40, 760, 'LOSE', '2026-05-08 20:28:12');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (117, '260509010087', 1, 4, '', 0, 1000, 1000, 'INIT', '2026-05-09 07:11:01');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (118, '260509010087', 1, 11, '', 0, 1000, 1000, 'INIT', '2026-05-09 07:15:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (119, '260509010087', 1, 36, '', 0, 1000, 1000, 'INIT', '2026-05-09 07:15:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (120, '260509010088', 1, 4, '', 0, 1000, 1000, 'INIT', '2026-05-09 07:16:14');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (121, '260509010088', 1, 29, '', 0, 1000, 1000, 'INIT', '2026-05-09 07:20:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (122, '260509010088', 1, 31, '', 0, 1000, 1000, 'INIT', '2026-05-09 07:20:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (123, '260509010088', 1, 4, '190389', 1000, 160, 1160, 'WIN', '2026-05-09 07:21:29');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (124, '260509010088', 1, 29, '190389', 1000, -80, 920, 'LOSE', '2026-05-09 07:21:29');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (125, '260509010088', 1, 31, '190389', 1000, -80, 920, 'LOSE', '2026-05-09 07:21:29');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (126, '260509010088', 1, 4, '190389', 1160, 160, 1320, 'WIN', '2026-05-09 07:23:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (127, '260509010088', 1, 31, '190389', 920, -80, 840, 'LOSE', '2026-05-09 07:23:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (128, '260509010088', 1, 4, '190389', 1320, 160, 1480, 'WIN', '2026-05-09 07:24:21');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (129, '260509010088', 1, 31, '190389', 840, -80, 760, 'LOSE', '2026-05-09 07:24:21');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (130, '260509010091', 1, 4, '', 0, 1000, 1000, 'INIT', '2026-05-09 07:34:11');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (131, '260509010091', 1, 28, '', 0, 1000, 1000, 'INIT', '2026-05-09 07:35:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (132, '260509010091', 1, 15, '', 0, 1000, 1000, 'INIT', '2026-05-09 07:35:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (133, '260509010091', 1, 4, '737575', 1000, 80, 1080, 'WIN', '2026-05-09 07:35:52');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (134, '260509010091', 1, 15, '737575', 1000, -40, 960, 'LOSE', '2026-05-09 07:35:52');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (135, '260509010091', 1, 28, '737575', 1000, -40, 960, 'LOSE', '2026-05-09 07:35:52');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (136, '260509010091', 1, 28, '737575', 960, -40, 920, 'LOSE', '2026-05-09 07:37:27');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (137, '260509010091', 1, 4, '737575', 1080, 80, 1160, 'WIN', '2026-05-09 07:37:27');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (138, '260509010091', 1, 15, '737575', 960, -40, 920, 'LOSE', '2026-05-09 07:37:27');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (139, '260509010095', 1, 4, '', 0, 1000, 1000, 'INIT', '2026-05-09 07:52:47');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (140, '260509010095', 1, 9, '', 0, 1000, 1000, 'INIT', '2026-05-09 07:55:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (141, '260509010095', 1, 18, '', 0, 1000, 1000, 'INIT', '2026-05-09 07:55:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (142, '260509010095', 1, 4, '248151', 1000, -80, 920, 'LOSE', '2026-05-09 07:56:30');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (143, '260509010095', 1, 9, '248151', 1000, 40, 1040, 'WIN', '2026-05-09 07:56:30');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (144, '260509010095', 1, 18, '248151', 1000, 40, 1040, 'WIN', '2026-05-09 07:56:30');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (145, '260509010095', 1, 4, '248151', 920, 80, 1000, 'WIN', '2026-05-09 07:57:58');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (146, '260509010095', 1, 18, '248151', 1040, -40, 1000, 'LOSE', '2026-05-09 07:57:58');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (147, '260509010095', 1, 9, '248151', 1040, -40, 1000, 'LOSE', '2026-05-09 07:57:58');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (148, '260509010095', 1, 4, '248151', 1000, -40, 960, 'LOSE', '2026-05-09 08:00:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (149, '260509010095', 1, 18, '248151', 1000, 20, 1020, 'WIN', '2026-05-09 08:00:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (150, '260509010095', 1, 9, '248151', 1000, 20, 1020, 'WIN', '2026-05-09 08:00:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (151, '260509010130', 1, 4, '172550', 1000, -40, 960, 'LOSE', '2026-05-09 10:52:11');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (152, '260509010130', 1, 20, '172550', 1000, 20, 1020, 'WIN', '2026-05-09 10:52:11');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (153, '260509010130', 1, 13, '172550', 1000, 20, 1020, 'WIN', '2026-05-09 10:52:11');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (154, '260509010130', 1, 4, '172550', 960, -40, 920, 'LOSE', '2026-05-09 10:55:20');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (155, '260509010130', 1, 13, '172550', 1020, 20, 1040, 'WIN', '2026-05-09 10:55:20');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (156, '260509010130', 1, 20, '172550', 1020, 20, 1040, 'WIN', '2026-05-09 10:55:20');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (157, '260509010130', 1, 4, '172550', 920, -40, 880, 'LOSE', '2026-05-09 10:57:41');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (158, '260509010130', 1, 20, '172550', 1040, 20, 1060, 'WIN', '2026-05-09 10:57:41');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (159, '260509010130', 1, 13, '172550', 1040, 20, 1060, 'WIN', '2026-05-09 10:57:41');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (160, '260509010140', 1, 4, '057940', 0, -80, 0, 'LOSE', '2026-05-09 11:41:50');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (161, '260509010140', 1, 14, '057940', 0, -80, 0, 'LOSE', '2026-05-09 11:41:50');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (162, '260509010140', 1, 11, '057940', 0, 160, 160, 'WIN', '2026-05-09 11:41:50');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (163, '260509010147', 1, 29, '', 0, 1000, 1000, 'INIT', '2026-05-09 12:15:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (164, '260509010147', 1, 21, '', 0, 1000, 1000, 'INIT', '2026-05-09 12:15:01');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (165, '260509010150', 1, 24, '', 0, 1000, 1000, 'INIT', '2026-05-09 12:30:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (166, '260509010150', 1, 20, '', 0, 1000, 1000, 'INIT', '2026-05-09 12:30:01');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (167, '260509010152', 1, 31, '', 0, 1000, 1000, 'INIT', '2026-05-09 12:40:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (168, '260509010152', 1, 26, '', 0, 1000, 1000, 'INIT', '2026-05-09 12:40:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (169, '260509010152', 1, 4, '441624', 1000, 40, 1040, 'WIN', '2026-05-09 12:40:51');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (170, '260509010152', 1, 26, '441624', 1000, -20, 980, 'LOSE', '2026-05-09 12:40:51');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (171, '260509010152', 1, 31, '441624', 1000, -20, 980, 'LOSE', '2026-05-09 12:40:51');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (172, '260509010162', 1, 17, '', 0, 1000, 1000, 'INIT', '2026-05-09 13:30:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (173, '260509010162', 1, 23, '', 0, 1000, 1000, 'INIT', '2026-05-09 13:30:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (174, '260509010164', 1, 35, '', 0, 1000, 1000, 'INIT', '2026-05-09 13:40:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (175, '260509010164', 1, 22, '', 0, 1000, 1000, 'INIT', '2026-05-09 13:40:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (176, '260509010164', 1, 35, '392964', 1000, -80, 920, 'LOSE', '2026-05-09 13:40:56');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (177, '260509010164', 1, 4, '392964', 1000, 160, 1160, 'WIN', '2026-05-09 13:40:56');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (178, '260509010164', 1, 22, '392964', 1000, -80, 920, 'LOSE', '2026-05-09 13:40:56');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (179, '260509010164', 1, 4, '392964', 1160, 40, 1200, 'WIN', '2026-05-09 13:42:41');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (180, '260509010164', 1, 22, '392964', 920, -20, 900, 'LOSE', '2026-05-09 13:42:41');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (181, '260509010164', 1, 35, '392964', 920, -20, 900, 'LOSE', '2026-05-09 13:42:41');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (182, '260509010164', 1, 4, '392964', 1200, -40, 1160, 'LOSE', '2026-05-09 13:44:59');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (183, '260509010164', 1, 22, '392964', 900, 20, 920, 'WIN', '2026-05-09 13:44:59');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (184, '260509010164', 1, 35, '392964', 900, 20, 920, 'WIN', '2026-05-09 13:44:59');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (185, '260509010209', 1, 32, '', 0, 1000, 1000, 'INIT', '2026-05-09 17:25:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (186, '260509010209', 1, 30, '', 0, 1000, 1000, 'INIT', '2026-05-09 17:25:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (187, '260509010209', 1, 4, '919930', 1000, 160, 1160, 'WIN', '2026-05-09 17:26:05');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (188, '260509010209', 1, 30, '919930', 1000, -80, 920, 'LOSE', '2026-05-09 17:26:05');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (189, '260509010209', 1, 32, '919930', 1000, -80, 920, 'LOSE', '2026-05-09 17:26:05');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (190, '260509010209', 1, 4, '919930', 1160, 20, 1180, 'WIN', '2026-05-09 17:28:07');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (191, '260509010209', 1, 32, '919930', 920, 20, 940, 'WIN', '2026-05-09 17:28:07');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (192, '260509010209', 1, 30, '919930', 920, -40, 880, 'LOSE', '2026-05-09 17:28:07');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (193, '260509010212', 1, 13, '', 0, 1000, 1000, 'INIT', '2026-05-09 17:40:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (194, '260509010212', 1, 18, '', 0, 1000, 1000, 'INIT', '2026-05-09 17:40:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (195, '260509010212', 1, 4, '987195', 1000, -20, 980, 'LOSE', '2026-05-09 17:40:29');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (196, '260509010212', 1, 13, '987195', 1000, 40, 1040, 'WIN', '2026-05-09 17:40:29');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (197, '260509010212', 1, 18, '987195', 1000, -20, 980, 'LOSE', '2026-05-09 17:40:29');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (198, '260509010212', 1, 4, '987195', 980, -40, 940, 'LOSE', '2026-05-09 17:42:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (199, '260509010212', 1, 18, '987195', 980, -40, 940, 'LOSE', '2026-05-09 17:42:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (200, '260509010212', 1, 13, '987195', 1040, 80, 1120, 'WIN', '2026-05-09 17:42:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (201, '260509010212', 1, 4, '987195', 940, 40, 980, 'WIN', '2026-05-09 17:43:21');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (202, '260509010212', 1, 13, '987195', 1120, -20, 1100, 'LOSE', '2026-05-09 17:43:21');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (203, '260509010212', 1, 18, '987195', 940, -20, 920, 'LOSE', '2026-05-09 17:43:21');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (204, '260509010221', 1, 9, '', 0, 1000, 1000, 'INIT', '2026-05-09 18:25:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (205, '260509010221', 1, 10, '', 0, 1000, 1000, 'INIT', '2026-05-09 18:25:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (206, '260509010221', 1, 4, '614656', 1000, 40, 1040, 'WIN', '2026-05-09 18:25:39');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (207, '260509010221', 1, 9, '614656', 1000, -20, 980, 'LOSE', '2026-05-09 18:25:39');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (208, '260509010221', 1, 10, '614656', 1000, -20, 980, 'LOSE', '2026-05-09 18:25:39');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (209, '260509010221', 1, 9, '614656', 980, -320, 660, 'LOSE', '2026-05-09 18:27:02');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (210, '260509010221', 1, 4, '614656', 1040, 160, 1200, 'WIN', '2026-05-09 18:27:02');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (211, '260509010221', 1, 10, '614656', 980, 160, 1140, 'WIN', '2026-05-09 18:27:02');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (212, '260509010227', 1, 11, '', 0, 1000, 1000, 'INIT', '2026-05-09 18:55:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (213, '260509010227', 1, 28, '', 0, 1000, 1000, 'INIT', '2026-05-09 18:55:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (214, '260509010227', 1, 28, '273798', 1000, -40, 960, 'LOSE', '2026-05-09 18:56:18');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (215, '260509010227', 1, 11, '273798', 1000, -40, 960, 'LOSE', '2026-05-09 18:56:18');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (216, '260509010227', 1, 4, '273798', 1000, 80, 1080, 'WIN', '2026-05-09 18:56:18');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (217, '260509010227', 1, 4, '273798', 1080, 40, 1120, 'WIN', '2026-05-09 18:57:50');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (218, '260509010227', 1, 11, '273798', 960, -20, 940, 'LOSE', '2026-05-09 18:57:50');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (219, '260509010227', 1, 28, '273798', 960, -20, 940, 'LOSE', '2026-05-09 18:57:50');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (220, '260509010227', 1, 4, '273798', 1120, 40, 1160, 'WIN', '2026-05-09 18:58:56');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (221, '260509010227', 1, 11, '273798', 940, -20, 920, 'LOSE', '2026-05-09 18:58:56');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (222, '260509010227', 1, 28, '273798', 940, -20, 920, 'LOSE', '2026-05-09 18:58:56');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (223, '260509010230', 1, 27, '', 0, 1000, 1000, 'INIT', '2026-05-09 19:10:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (224, '260509010230', 1, 16, '', 0, 1000, 1000, 'INIT', '2026-05-09 19:10:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (225, '260509010230', 1, 4, '734098', 1000, 40, 1040, 'WIN', '2026-05-09 19:11:13');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (226, '260509010230', 1, 16, '734098', 1000, -20, 980, 'LOSE', '2026-05-09 19:11:13');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (227, '260509010230', 1, 27, '734098', 1000, -20, 980, 'LOSE', '2026-05-09 19:11:13');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (228, '260509010230', 1, 4, '734098', 1040, 160, 1200, 'WIN', '2026-05-09 19:12:37');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (229, '260509010230', 1, 16, '734098', 980, -320, 660, 'LOSE', '2026-05-09 19:12:37');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (230, '260509010230', 1, 27, '734098', 980, 160, 1140, 'WIN', '2026-05-09 19:12:37');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (231, '260509010230', 1, 4, '734098', 1200, 40, 1240, 'WIN', '2026-05-09 19:13:44');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (232, '260509010230', 1, 27, '734098', 1140, -20, 1120, 'LOSE', '2026-05-09 19:13:44');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (233, '260509010230', 1, 16, '734098', 660, -20, 640, 'LOSE', '2026-05-09 19:13:44');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (234, '260509010234', 1, 33, '', 0, 1000, 1000, 'INIT', '2026-05-09 19:30:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (235, '260509010234', 1, 36, '', 0, 1000, 1000, 'INIT', '2026-05-09 19:30:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (236, '260509010234', 1, 4, '372853', 1000, 640, 1640, 'WIN', '2026-05-09 19:30:42');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (237, '260509010234', 1, 36, '372853', 1000, -320, 680, 'LOSE', '2026-05-09 19:30:42');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (238, '260509010234', 1, 33, '372853', 1000, -320, 680, 'LOSE', '2026-05-09 19:30:42');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (239, '260509010234', 1, 4, '372853', 1640, -40, 1600, 'LOSE', '2026-05-09 19:32:07');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (240, '260509010234', 1, 33, '372853', 680, 20, 700, 'WIN', '2026-05-09 19:32:07');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (241, '260509010234', 1, 36, '372853', 680, 20, 700, 'WIN', '2026-05-09 19:32:07');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (242, '260509010234', 1, 4, '372853', 1600, 80, 1680, 'WIN', '2026-05-09 19:34:01');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (243, '260509010234', 1, 33, '372853', 700, -40, 660, 'LOSE', '2026-05-09 19:34:01');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (244, '260509010234', 1, 36, '372853', 700, -40, 660, 'LOSE', '2026-05-09 19:34:01');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (245, '260509010263', 1, 30, '', 0, 1000, 1000, 'INIT', '2026-05-09 21:55:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (246, '260509010263', 1, 23, '', 0, 1000, 1000, 'INIT', '2026-05-09 21:55:00');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (247, '260509010263', 1, 30, '978330', 1000, -160, 840, 'LOSE', '2026-05-09 21:56:11');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (248, '260509010263', 1, 4, '978330', 1000, 80, 1080, 'WIN', '2026-05-09 21:56:11');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (249, '260509010263', 1, 23, '978330', 1000, 80, 1080, 'WIN', '2026-05-09 21:56:11');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (250, '260509010263', 1, 4, '978330', 1080, 80, 1160, 'WIN', '2026-05-09 21:57:45');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (251, '260509010263', 1, 23, '978330', 1080, -160, 920, 'LOSE', '2026-05-09 21:57:45');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (252, '260509010263', 1, 30, '978330', 840, 80, 920, 'WIN', '2026-05-09 21:57:45');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (253, '260509010263', 1, 4, '978330', 1160, 160, 1320, 'WIN', '2026-05-09 21:58:51');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (254, '260509010263', 1, 30, '978330', 920, -80, 840, 'LOSE', '2026-05-09 21:58:51');
INSERT INTO `ddz_arena_gold_logs_202605` VALUES (255, '260509010263', 1, 23, '978330', 920, -80, 840, 'LOSE', '2026-05-09 21:58:51');

-- ----------------------------
-- Table structure for ddz_arena_gold_logs_202606
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_gold_logs_202606`;
CREATE TABLE `ddz_arena_gold_logs_202606`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '流水ID',
  `period_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '期号',
  `room_id` bigint UNSIGNED NOT NULL COMMENT '房间ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `match_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '对局ID',
  `before_gold` bigint NOT NULL DEFAULT 0 COMMENT '变动前金币',
  `change_gold` bigint NOT NULL DEFAULT 0 COMMENT '变动金币(正=赢,负=输)',
  `after_gold` bigint NOT NULL DEFAULT 0 COMMENT '变动后金币',
  `reason` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '变动原因',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_period_no`(`period_no` ASC) USING BTREE,
  INDEX `idx_room_id`(`room_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_match_id`(`match_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场金币流水表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_gold_logs_202606
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
  `period_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '期号(关联报名记录)',
  `is_robot` tinyint NOT NULL DEFAULT 0 COMMENT '是否机器人:0-否,1-是',
  `is_tournament_bot` tinyint NOT NULL DEFAULT 0 COMMENT '是否为锦标赛补位机器人(不可获奖)',
  `let_win_enabled` tinyint NOT NULL DEFAULT 0 COMMENT '是否启用让牌策略(决赛阶段)',
  `signup_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
  `signup_fee` bigint NOT NULL DEFAULT 0 COMMENT '报名费(竞技币)',
  `match_coin` bigint NOT NULL DEFAULT 0 COMMENT '比赛金币(临时，仅用于排名)',
  `round_match_coin` bigint NOT NULL DEFAULT 0 COMMENT '本轮比赛金币(每轮重置)',
  `current_round` int NOT NULL DEFAULT 0 COMMENT '当前所在轮次',
  `rank` int NULL DEFAULT NULL COMMENT '最终排名',
  `is_eliminated` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否淘汰:0-否,1-是',
  `eliminated_round` int NULL DEFAULT NULL COMMENT '淘汰轮次',
  `eliminated_reason` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '淘汰原因:lose-输掉比赛,disconnect-掉线,forfeit-弃权',
  `is_champion` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否冠军',
  `is_online` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '是否在线:0-离线,1-在线',
  `last_table_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '最后所在桌号',
  `current_table_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '当前所在桌ID',
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
  INDEX `idx_is_robot`(`session_id` ASC, `is_robot` ASC) USING BTREE,
  INDEX `idx_period_no`(`period_no` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '参赛记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_participations
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_arena_participations_202605
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_participations_202605`;
CREATE TABLE `ddz_arena_participations_202605`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `session_id` bigint UNSIGNED NOT NULL COMMENT '比赛会话ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `period_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '期号(关联报名记录)',
  `robot_id` bigint UNSIGNED NOT NULL DEFAULT 0 COMMENT '机器人ID(当is_robot=1时等于player_id)',
  `is_robot` tinyint NOT NULL DEFAULT 0 COMMENT '是否机器人:0-否,1-是',
  `is_tournament_bot` tinyint NOT NULL DEFAULT 0 COMMENT '是否为锦标赛补位机器人(不可获奖)',
  `let_win_enabled` tinyint NOT NULL DEFAULT 0 COMMENT '是否启用让牌策略',
  `match_coin` bigint NOT NULL DEFAULT 0 COMMENT '比赛金币(用于排名)',
  `round_match_coin` bigint NOT NULL DEFAULT 0 COMMENT '本轮比赛金币(每轮重置)',
  `current_round` int NOT NULL DEFAULT 0 COMMENT '当前所在轮次',
  `final_rank` int NULL DEFAULT NULL COMMENT '最终排名',
  `is_eliminated` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否淘汰',
  `eliminated_round` int NULL DEFAULT NULL COMMENT '淘汰轮次',
  `eliminated_reason` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '淘汰原因',
  `is_champion` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否冠军',
  `is_online` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '是否在线',
  `last_table_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '最后所在桌号',
  `current_table_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '当前所在桌ID',
  `reward_claimed` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '奖励是否已领取',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_session_id`(`session_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_period_no`(`period_no` ASC) USING BTREE,
  INDEX `idx_is_eliminated`(`is_eliminated` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  UNIQUE INDEX `uk_period_player`(`period_no` ASC, `player_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 41 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场参赛记录表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_participations_202605
-- ----------------------------
INSERT INTO `ddz_arena_participations_202605` VALUES (1, 0, 4, '260509010130', 0, 0, 0, 0, 880, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 10:50:00', '2026-05-09 10:57:41');
INSERT INTO `ddz_arena_participations_202605` VALUES (2, 0, 20, '260509010130', 0, 1, 0, 0, 1060, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 10:50:00', '2026-05-09 10:57:41');
INSERT INTO `ddz_arena_participations_202605` VALUES (3, 0, 13, '260509010130', 0, 1, 0, 0, 1060, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 10:50:00', '2026-05-09 10:57:41');
INSERT INTO `ddz_arena_participations_202605` VALUES (8, 0, 4, '260509010150', 0, 0, 0, 0, 1000, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 12:30:01', '2026-05-09 12:30:01');
INSERT INTO `ddz_arena_participations_202605` VALUES (9, 0, 24, '260509010150', 0, 1, 0, 0, 1000, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 12:30:01', '2026-05-09 12:30:01');
INSERT INTO `ddz_arena_participations_202605` VALUES (10, 0, 20, '260509010150', 0, 1, 0, 0, 1000, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 12:30:01', '2026-05-09 12:30:01');
INSERT INTO `ddz_arena_participations_202605` VALUES (11, 0, 4, '260509010152', 0, 0, 0, 0, 1040, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 12:40:00', '2026-05-09 12:40:51');
INSERT INTO `ddz_arena_participations_202605` VALUES (12, 0, 31, '260509010152', 0, 1, 0, 0, 980, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 12:40:00', '2026-05-09 12:40:51');
INSERT INTO `ddz_arena_participations_202605` VALUES (13, 0, 26, '260509010152', 0, 1, 0, 0, 980, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 12:40:00', '2026-05-09 12:40:51');
INSERT INTO `ddz_arena_participations_202605` VALUES (14, 0, 4, '260509010162', 0, 0, 0, 0, 1000, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 13:30:00', '2026-05-09 13:30:00');
INSERT INTO `ddz_arena_participations_202605` VALUES (15, 0, 17, '260509010162', 0, 1, 0, 0, 1000, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 13:30:00', '2026-05-09 13:30:00');
INSERT INTO `ddz_arena_participations_202605` VALUES (16, 0, 23, '260509010162', 0, 1, 0, 0, 1000, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 13:30:00', '2026-05-09 13:30:00');
INSERT INTO `ddz_arena_participations_202605` VALUES (17, 0, 4, '260509010164', 0, 0, 0, 0, 1160, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 13:40:00', '2026-05-09 13:44:59');
INSERT INTO `ddz_arena_participations_202605` VALUES (18, 0, 35, '260509010164', 0, 1, 0, 0, 920, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 13:40:00', '2026-05-09 13:44:59');
INSERT INTO `ddz_arena_participations_202605` VALUES (19, 0, 22, '260509010164', 0, 1, 0, 0, 920, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 13:40:00', '2026-05-09 13:44:59');
INSERT INTO `ddz_arena_participations_202605` VALUES (20, 0, 4, '260509010209', 0, 0, 0, 0, 1180, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 17:25:00', '2026-05-09 17:28:07');
INSERT INTO `ddz_arena_participations_202605` VALUES (21, 0, 32, '260509010209', 0, 1, 0, 0, 940, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 17:25:00', '2026-05-09 17:28:07');
INSERT INTO `ddz_arena_participations_202605` VALUES (22, 0, 30, '260509010209', 0, 1, 0, 0, 880, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 17:25:00', '2026-05-09 17:28:07');
INSERT INTO `ddz_arena_participations_202605` VALUES (23, 0, 4, '260509010212', 0, 0, 0, 0, 980, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 17:40:00', '2026-05-09 17:43:22');
INSERT INTO `ddz_arena_participations_202605` VALUES (24, 0, 13, '260509010212', 0, 1, 0, 0, 1100, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 17:40:00', '2026-05-09 17:43:22');
INSERT INTO `ddz_arena_participations_202605` VALUES (25, 0, 18, '260509010212', 0, 1, 0, 0, 920, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 17:40:00', '2026-05-09 17:43:22');
INSERT INTO `ddz_arena_participations_202605` VALUES (26, 0, 4, '260509010221', 0, 0, 0, 0, 1200, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 18:25:01', '2026-05-09 18:27:02');
INSERT INTO `ddz_arena_participations_202605` VALUES (27, 0, 9, '260509010221', 0, 1, 0, 0, 660, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 18:25:01', '2026-05-09 18:27:02');
INSERT INTO `ddz_arena_participations_202605` VALUES (28, 0, 10, '260509010221', 0, 1, 0, 0, 1140, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 18:25:01', '2026-05-09 18:27:02');
INSERT INTO `ddz_arena_participations_202605` VALUES (29, 0, 4, '260509010227', 0, 0, 0, 0, 1160, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 18:55:01', '2026-05-09 18:58:57');
INSERT INTO `ddz_arena_participations_202605` VALUES (30, 0, 11, '260509010227', 0, 1, 0, 0, 920, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 18:55:01', '2026-05-09 18:58:57');
INSERT INTO `ddz_arena_participations_202605` VALUES (31, 0, 28, '260509010227', 0, 1, 0, 0, 920, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 18:55:01', '2026-05-09 18:58:57');
INSERT INTO `ddz_arena_participations_202605` VALUES (32, 0, 4, '260509010230', 0, 0, 0, 0, 1240, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 19:10:01', '2026-05-09 19:13:44');
INSERT INTO `ddz_arena_participations_202605` VALUES (33, 0, 27, '260509010230', 0, 1, 0, 0, 1120, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 19:10:01', '2026-05-09 19:13:44');
INSERT INTO `ddz_arena_participations_202605` VALUES (34, 0, 16, '260509010230', 0, 1, 0, 0, 640, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 19:10:01', '2026-05-09 19:13:44');
INSERT INTO `ddz_arena_participations_202605` VALUES (35, 0, 4, '260509010234', 0, 0, 0, 0, 1680, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 19:30:00', '2026-05-09 19:34:01');
INSERT INTO `ddz_arena_participations_202605` VALUES (36, 0, 33, '260509010234', 0, 1, 0, 0, 660, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 19:30:00', '2026-05-09 19:34:01');
INSERT INTO `ddz_arena_participations_202605` VALUES (37, 0, 36, '260509010234', 0, 1, 0, 0, 660, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 19:30:00', '2026-05-09 19:34:01');
INSERT INTO `ddz_arena_participations_202605` VALUES (38, 0, 4, '260509010263', 0, 0, 0, 0, 1320, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 21:55:01', '2026-05-09 21:58:52');
INSERT INTO `ddz_arena_participations_202605` VALUES (39, 0, 30, '260509010263', 0, 1, 0, 0, 840, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 21:55:01', '2026-05-09 21:58:52');
INSERT INTO `ddz_arena_participations_202605` VALUES (40, 0, 23, '260509010263', 0, 1, 0, 0, 840, 0, 0, NULL, 0, NULL, NULL, 0, 1, NULL, NULL, 0, '2026-05-09 21:55:01', '2026-05-09 21:58:52');

-- ----------------------------
-- Table structure for ddz_arena_participations_202606
-- ----------------------------
DROP TABLE IF EXISTS `ddz_arena_participations_202606`;
CREATE TABLE `ddz_arena_participations_202606`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `session_id` bigint UNSIGNED NOT NULL COMMENT '比赛会话ID',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `period_no` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '期号(关联报名记录)',
  `robot_id` bigint UNSIGNED NOT NULL DEFAULT 0 COMMENT '机器人ID(当is_robot=1时等于player_id)',
  `is_robot` tinyint NOT NULL DEFAULT 0 COMMENT '是否机器人:0-否,1-是',
  `is_tournament_bot` tinyint NOT NULL DEFAULT 0 COMMENT '是否为锦标赛补位机器人(不可获奖)',
  `let_win_enabled` tinyint NOT NULL DEFAULT 0 COMMENT '是否启用让牌策略',
  `match_coin` bigint NOT NULL DEFAULT 0 COMMENT '比赛金币(用于排名)',
  `round_match_coin` bigint NOT NULL DEFAULT 0 COMMENT '本轮比赛金币(每轮重置)',
  `current_round` int NOT NULL DEFAULT 0 COMMENT '当前所在轮次',
  `final_rank` int NULL DEFAULT NULL COMMENT '最终排名',
  `is_eliminated` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否淘汰',
  `eliminated_round` int NULL DEFAULT NULL COMMENT '淘汰轮次',
  `eliminated_reason` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '淘汰原因',
  `is_champion` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否冠军',
  `is_online` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '是否在线',
  `last_table_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '最后所在桌号',
  `current_table_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '当前所在桌ID',
  `reward_claimed` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '奖励是否已领取',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_period_player`(`period_no` ASC, `player_id` ASC) USING BTREE,
  INDEX `idx_session_id`(`session_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_period_no`(`period_no` ASC) USING BTREE,
  INDEX `idx_is_eliminated`(`is_eliminated` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场参赛记录表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_participations_202606
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
  `arena_gold` bigint NULL DEFAULT 0 COMMENT '当期赛事金币',
  `is_eliminated` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否淘汰:0-否,1-是',
  `eliminated_round` bigint NULL DEFAULT NULL COMMENT '淘汰轮次',
  `rank_no` bigint NULL DEFAULT NULL COMMENT '最终排名',
  `player_status` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '玩家状态:0-报名,1-比赛中,2-淘汰,3-晋级,4-结束',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `final_rank` bigint NULL DEFAULT NULL COMMENT '最终排名(比赛结束时同步)',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_arena_period_players_period_no`(`period_no` ASC) USING BTREE,
  INDEX `idx_ddz_arena_period_players_period_id`(`period_id` ASC) USING BTREE,
  INDEX `idx_ddz_arena_period_players_room_id`(`room_id` ASC) USING BTREE,
  INDEX `idx_ddz_arena_period_players_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_ddz_arena_period_players_status`(`status` ASC) USING BTREE,
  INDEX `idx_ddz_arena_period_players_player_status`(`player_status` ASC) USING BTREE
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
  `arena_gold` bigint NOT NULL DEFAULT 0 COMMENT '当期赛事金币',
  `is_eliminated` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否淘汰:0-否,1-是',
  `eliminated_round` int NULL DEFAULT NULL COMMENT '淘汰轮次',
  `rank_no` int NULL DEFAULT NULL COMMENT '最终排名',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `player_status` tinyint NULL DEFAULT 0 COMMENT '0报名 1比赛中 2淘汰 3晋级 4结束',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `final_rank` int NULL DEFAULT NULL COMMENT '最终排名(比赛结束时从participations同步)',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_period_no`(`period_no` ASC) USING BTREE,
  INDEX `idx_period_id`(`period_id` ASC) USING BTREE,
  INDEX `idx_room_id`(`room_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 212 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场期号玩家表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_arena_period_players_202605
-- ----------------------------
INSERT INTO `ddz_arena_period_players_202605` VALUES (1, 'H202605060001', 65, 2, 4, '2026-05-06 17:05:53', 0, 0, 2, 0, 0, NULL, NULL, '2026-05-06 17:05:53', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (2, 'E202605060004', 81, 3, 4, '2026-05-06 18:49:31', 0, 0, 2, 0, 0, NULL, NULL, '2026-05-06 18:49:30', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (3, 'E202605060004', 81, 3, 4, '2026-05-06 18:49:37', 0, 0, 2, 0, 0, NULL, NULL, '2026-05-06 18:49:37', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (4, 'E202605060004', 81, 3, 4, '2026-05-06 18:50:50', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-06 18:50:50', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (5, 'E202605060026', 135, 3, 4, '2026-05-06 19:09:54', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-06 19:09:54', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (6, 'E202605060028', 141, 3, 4, '2026-05-06 19:18:38', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-06 19:18:38', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (7, 'E202605060030', 147, 3, 4, '2026-05-06 19:26:41', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-06 19:26:40', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (8, 'E202605060032', 153, 3, 4, '2026-05-06 19:39:03', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-06 19:39:02', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (9, '260506030007', 0, 3, 4, '2026-05-06 20:10:08', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-06 20:10:07', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (10, '260506020020', 0, 2, 4, '2026-05-06 20:17:37', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-06 20:17:36', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (11, '260506020021', 0, 2, 4, '2026-05-06 20:28:43', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-06 20:28:42', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (12, '260506030008', 0, 3, 4, '2026-05-06 20:42:18', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-06 20:42:18', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (13, '260506020025', 186, 2, 4, '2026-05-06 21:06:27', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-06 21:06:27', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (14, '260506020027', 192, 2, 4, '2026-05-06 21:25:41', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-06 21:25:41', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (15, '260506020028', 194, 2, 4, '2026-05-06 21:37:12', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-06 21:37:12', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (16, '260506020029', 197, 2, 4, '2026-05-06 21:48:28', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-06 21:41:07', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (17, '260506020030', 200, 2, 4, '2026-05-06 21:56:55', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-06 21:56:55', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (18, '260506020033', 209, 2, 4, '2026-05-06 22:26:23', 0, 0, 2, 0, 0, NULL, NULL, '2026-05-06 22:22:15', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (19, '260507010169', 259, 1, 4, '2026-05-07 14:01:10', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-07 14:01:09', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (20, '260507010179', 0, 1, 4, '2026-05-07 14:51:34', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-07 14:51:34', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (21, '260507010181', 266, 1, 4, '2026-05-07 15:01:29', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-07 15:01:01', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (22, '260507010193', 278, 1, 4, '2026-05-07 16:02:09', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-07 16:02:09', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (23, '260507010202', 289, 1, 4, '2026-05-07 16:48:52', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-07 16:48:52', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (24, '260507010202', 289, 1, 12, '2026-05-07 16:50:01', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-07 16:50:00', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (25, '260507010202', 289, 1, 13, '2026-05-07 16:50:01', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-07 16:50:00', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (26, '260507010205', 293, 1, 4, '2026-05-07 17:03:22', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-07 17:03:22', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (27, '260507010205', 293, 1, 9, '2026-05-07 17:05:01', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-07 17:05:00', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (28, '260507010205', 293, 1, 17, '2026-05-07 17:05:01', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-07 17:05:00', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (29, '260507010211', 304, 1, 4, '2026-05-07 17:33:43', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-07 17:33:43', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (30, '260507010211', 304, 1, 11, '2026-05-07 17:35:00', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-07 17:35:00', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (31, '260507010211', 304, 1, 18, '2026-05-07 17:35:00', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-07 17:35:00', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (32, '260507010213', 308, 1, 4, '2026-05-07 17:41:14', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-07 17:41:13', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (33, '260507010213', 308, 1, 10, '2026-05-07 17:45:00', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-07 17:45:00', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (34, '260507010213', 308, 1, 16, '2026-05-07 17:45:00', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-07 17:45:00', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (35, '260507010231', 0, 1, 4, '2026-05-07 19:12:19', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-07 19:12:19', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (36, '260507010240', 0, 1, 4, '2026-05-07 19:56:03', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-07 19:56:03', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (37, '260507010249', 371, 1, 4, '2026-05-07 20:41:06', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-07 20:41:05', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (38, '260507010253', 0, 1, 4, '2026-05-07 21:02:03', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-07 21:02:02', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (39, '260507010255', 378, 1, 4, '2026-05-07 21:12:22', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-07 21:12:22', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (40, '260507010259', 384, 1, 4, '2026-05-07 21:34:51', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-07 21:34:50', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (41, '260507010261', 387, 1, 4, '2026-05-07 21:42:39', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-07 21:42:39', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (42, '260507010268', 402, 1, 4, '2026-05-07 22:18:25', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-07 22:18:24', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (43, '260507010269', 403, 1, 4, '2026-05-07 22:24:21', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-07 22:24:20', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (44, '260508010100', 534, 1, 4, '2026-05-08 08:19:21', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 08:19:20', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (45, '260508010100', 534, 1, 9, '2026-05-08 08:20:01', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-08 08:20:00', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (46, '260508010100', 534, 1, 18, '2026-05-08 08:20:01', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-08 08:20:00', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (47, '260508010104', 0, 1, 4, '2026-05-08 08:39:11', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 08:39:10', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (48, '260508010109', 542, 1, 4, '2026-05-08 09:04:16', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 09:04:03', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (49, '260508010109', 542, 1, 11, '2026-05-08 09:05:00', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-08 09:05:00', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (50, '260508010109', 542, 1, 12, '2026-05-08 09:05:00', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-08 09:05:00', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (51, '260508010133', 565, 1, 4, '2026-05-08 11:01:46', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 11:01:46', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (52, '260508010133', 565, 1, 16, '2026-05-08 11:05:00', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-08 11:05:00', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (53, '260508010133', 565, 1, 17, '2026-05-08 11:05:00', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-08 11:05:00', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (54, '260508010139', 0, 1, 4, '2026-05-08 11:34:35', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 11:34:34', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (55, '260508010144', 574, 1, 4, '2026-05-08 11:56:01', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 11:56:00', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (56, '260508010144', 574, 1, 9, '2026-05-08 12:00:01', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-08 12:00:00', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (57, '260508010144', 574, 1, 10, '2026-05-08 12:00:01', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-08 12:00:00', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (58, '260508010149', 579, 1, 4, '2026-05-08 12:23:07', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 12:23:07', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (59, '260508010149', 579, 1, 15, '2026-05-08 12:25:00', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-08 12:25:00', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (60, '260508010149', 579, 1, 18, '2026-05-08 12:25:00', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-08 12:25:00', 0, '2026-05-08 13:12:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (61, '260508010162', 0, 1, 4, '2026-05-08 13:26:12', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 13:26:11', 0, '2026-05-08 13:26:11', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (62, '260508010163', 583, 1, 4, '2026-05-08 13:31:04', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 13:31:04', 0, '2026-05-08 13:31:04', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (63, '260508010163', 583, 1, 13, '2026-05-08 13:35:01', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-08 13:35:00', 0, '2026-05-08 13:35:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (64, '260508010163', 583, 1, 17, '2026-05-08 13:35:01', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-08 13:35:00', 0, '2026-05-08 13:35:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (65, '260508010165', 585, 1, 4, '2026-05-08 13:44:38', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 13:44:37', 0, '2026-05-08 13:44:38', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (66, '260508010165', 585, 1, 11, '2026-05-08 13:45:00', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-08 13:45:00', 0, '2026-05-08 13:45:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (67, '260508010165', 585, 1, 18, '2026-05-08 13:45:00', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-08 13:45:00', 0, '2026-05-08 13:45:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (68, '260508010168', 587, 1, 4, '2026-05-08 13:56:41', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 13:56:40', 0, '2026-05-08 14:03:51', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (69, '260508010168', 587, 1, 12, '2026-05-08 14:00:01', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-08 14:00:01', 0, '2026-05-08 14:03:51', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (70, '260508010168', 587, 1, 14, '2026-05-08 14:00:01', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-08 14:00:01', 0, '2026-05-08 14:03:51', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (71, '260508010171', 590, 1, 4, '2026-05-08 14:12:43', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 14:12:42', 0, '2026-05-08 14:16:38', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (72, '260508010171', 590, 1, 15, '2026-05-08 14:15:01', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-08 14:15:00', 0, '2026-05-08 14:16:38', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (73, '260508010171', 590, 1, 16, '2026-05-08 14:15:01', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-08 14:15:00', 0, '2026-05-08 14:16:38', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (74, '260508010177', 0, 1, 4, '2026-05-08 14:42:34', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 14:42:33', 0, '2026-05-08 14:45:59', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (75, '260508010177', 177, 1, 10, '2026-05-08 14:45:00', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-08 14:45:00', 0, '2026-05-08 14:45:59', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (76, '260508010177', 177, 1, 9, '2026-05-08 14:45:00', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-08 14:45:00', 0, '2026-05-08 14:45:59', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (77, '260508010179', 596, 1, 4, '2026-05-08 14:52:28', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 14:52:27', 0, '2026-05-08 14:52:28', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (78, '260508010180', 597, 1, 4, '2026-05-08 14:56:01', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 14:56:01', 0, '2026-05-08 15:01:32', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (79, '260508010180', 180, 1, 9, '2026-05-08 15:00:01', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-08 15:00:01', 0, '2026-05-08 15:01:32', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (80, '260508010180', 180, 1, 17, '2026-05-08 15:00:01', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-08 15:00:01', 0, '2026-05-08 15:01:32', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (81, '260508010180', 597, 1, 9, '2026-05-08 15:00:01', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-08 15:00:01', 0, '2026-05-08 15:01:32', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (82, '260508010180', 597, 1, 17, '2026-05-08 15:00:01', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-08 15:00:01', 0, '2026-05-08 15:01:32', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (83, '260508010182', 0, 1, 4, '2026-05-08 15:06:20', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 15:06:20', 0, '2026-05-08 15:11:18', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (84, '260508010182', 182, 1, 20, '2026-05-08 15:10:01', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-08 15:10:01', 0, '2026-05-08 15:11:18', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (85, '260508010182', 182, 1, 21, '2026-05-08 15:10:01', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-08 15:10:01', 0, '2026-05-08 15:11:18', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (86, '260508010187', 603, 1, 4, '2026-05-08 15:32:16', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 15:32:16', 0, '2026-05-08 15:56:30', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (87, '260508010187', 187, 1, 25, '2026-05-08 15:35:00', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-08 15:35:00', 0, '2026-05-08 15:41:49', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (88, '260508010187', 187, 1, 19, '2026-05-08 15:35:00', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-08 15:35:00', 0, '2026-05-08 15:56:30', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (89, '260508010187', 603, 1, 19, '2026-05-08 15:35:01', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-08 15:35:00', 0, '2026-05-08 15:56:30', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (90, '260508010187', 603, 1, 25, '2026-05-08 15:35:01', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-08 15:35:00', 0, '2026-05-08 15:41:49', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (91, '260508010194', 0, 1, 4, '2026-05-08 16:09:15', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 16:09:15', 0, '2026-05-08 16:12:29', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (92, '260508010194', 194, 1, 33, '2026-05-08 16:10:00', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-08 16:10:00', 0, '2026-05-08 16:12:29', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (93, '260508010194', 194, 1, 38, '2026-05-08 16:10:00', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-08 16:10:00', 0, '2026-05-08 16:12:29', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (94, '260508010197', 615, 1, 4, '2026-05-08 16:24:19', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 16:24:18', 0, '2026-05-08 16:28:11', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (95, '260508010197', 197, 1, 10, '2026-05-08 16:25:00', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-08 16:25:00', 0, '2026-05-08 16:28:11', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (96, '260508010197', 197, 1, 14, '2026-05-08 16:25:00', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-08 16:25:00', 0, '2026-05-08 16:28:11', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (97, '260508010197', 615, 1, 10, '2026-05-08 16:25:00', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-08 16:25:00', 0, '2026-05-08 16:28:11', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (98, '260508010197', 615, 1, 14, '2026-05-08 16:25:00', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-08 16:25:00', 0, '2026-05-08 16:28:11', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (99, '260508010202', 620, 1, 4, '2026-05-08 16:46:30', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 16:46:30', 0, '2026-05-08 16:53:49', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (100, '260508010202', 202, 1, 22, '2026-05-08 16:50:01', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-08 16:50:01', 0, '2026-05-08 16:53:49', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (101, '260508010202', 202, 1, 24, '2026-05-08 16:50:01', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-08 16:50:01', 0, '2026-05-08 16:53:49', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (102, '260508010202', 620, 1, 22, '2026-05-08 16:50:01', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-08 16:50:00', 0, '2026-05-08 16:53:49', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (103, '260508010202', 620, 1, 24, '2026-05-08 16:50:01', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-08 16:50:00', 0, '2026-05-08 16:53:49', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (104, '260508010231', 629, 1, 4, '2026-05-08 19:11:51', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 19:11:50', 0, '2026-05-08 19:18:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (105, '260508010231', 231, 1, 21, '2026-05-08 19:15:01', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-08 19:15:01', 0, '2026-05-08 19:18:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (106, '260508010231', 231, 1, 34, '2026-05-08 19:15:01', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-08 19:15:01', 0, '2026-05-08 19:18:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (107, '260508010231', 629, 1, 21, '2026-05-08 19:15:01', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-08 19:15:00', 0, '2026-05-08 19:18:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (108, '260508010231', 629, 1, 34, '2026-05-08 19:15:01', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-08 19:15:00', 0, '2026-05-08 19:18:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (109, '260508010245', 650, 1, 4, '2026-05-08 20:21:02', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-08 20:21:01', 0, '2026-05-08 20:28:12', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (110, '260508010245', 245, 1, 35, '2026-05-08 20:25:00', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-08 20:25:00', 0, '2026-05-08 20:25:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (111, '260508010245', 245, 1, 17, '2026-05-08 20:25:00', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-08 20:25:00', 0, '2026-05-08 20:28:12', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (112, '260508010245', 650, 1, 17, '2026-05-08 20:25:00', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-08 20:25:00', 0, '2026-05-08 20:28:12', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (113, '260508010245', 650, 1, 35, '2026-05-08 20:25:00', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-08 20:25:00', 0, '2026-05-08 20:25:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (114, '260509010087', 0, 1, 4, '2026-05-09 07:11:01', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-09 07:11:01', 0, '2026-05-09 07:11:01', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (115, '260509010087', 87, 1, 11, '2026-05-09 07:15:01', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-09 07:15:01', 0, '2026-05-09 07:15:01', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (116, '260509010087', 87, 1, 36, '2026-05-09 07:15:01', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-09 07:15:01', 0, '2026-05-09 07:15:01', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (117, '260509010088', 662, 1, 4, '2026-05-09 07:16:14', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-09 07:16:14', 0, '2026-05-09 07:24:21', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (118, '260509010088', 88, 1, 29, '2026-05-09 07:20:01', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-09 07:20:01', 0, '2026-05-09 07:21:30', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (119, '260509010088', 88, 1, 31, '2026-05-09 07:20:01', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-09 07:20:01', 0, '2026-05-09 07:24:21', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (120, '260509010088', 662, 1, 29, '2026-05-09 07:20:01', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-09 07:20:00', 0, '2026-05-09 07:21:30', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (121, '260509010088', 662, 1, 31, '2026-05-09 07:20:01', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-09 07:20:00', 0, '2026-05-09 07:24:21', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (122, '260509010091', 665, 1, 4, '2026-05-09 07:34:12', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-09 07:34:11', 0, '2026-05-09 07:37:27', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (123, '260509010091', 91, 1, 28, '2026-05-09 07:35:01', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-09 07:35:01', 0, '2026-05-09 07:37:27', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (124, '260509010091', 91, 1, 15, '2026-05-09 07:35:01', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-09 07:35:01', 0, '2026-05-09 07:37:27', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (125, '260509010091', 665, 1, 15, '2026-05-09 07:35:01', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-09 07:35:00', 0, '2026-05-09 07:37:27', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (126, '260509010091', 665, 1, 28, '2026-05-09 07:35:01', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-09 07:35:00', 0, '2026-05-09 07:37:27', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (127, '260509010095', 669, 1, 4, '2026-05-09 07:52:48', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-09 07:52:47', 0, '2026-05-09 08:00:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (128, '260509010095', 95, 1, 9, '2026-05-09 07:55:00', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-09 07:55:00', 0, '2026-05-09 08:00:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (129, '260509010095', 95, 1, 18, '2026-05-09 07:55:00', 0, 0, 1, 0, 0, NULL, NULL, '2026-05-09 07:55:00', 0, '2026-05-09 08:00:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (130, '260509010095', 669, 1, 9, '2026-05-09 07:55:00', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-09 07:55:00', 0, '2026-05-09 08:00:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (131, '260509010095', 669, 1, 18, '2026-05-09 07:55:00', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-09 07:55:00', 0, '2026-05-09 08:00:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (132, '260509010120', 0, 1, 4, '2026-05-09 09:59:51', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-09 09:59:50', 0, '2026-05-09 09:59:50', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (133, '260509010122', 696, 1, 4, '2026-05-09 10:07:32', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-09 10:07:31', 0, '2026-05-09 10:07:31', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (134, '260509010122', 696, 1, 12, '2026-05-09 10:10:00', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-09 10:10:00', 0, '2026-05-09 10:10:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (135, '260509010122', 696, 1, 16, '2026-05-09 10:10:00', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-09 10:10:00', 0, '2026-05-09 10:10:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (136, '260509010124', 698, 1, 4, '2026-05-09 10:18:52', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-09 10:18:52', 0, '2026-05-09 10:18:52', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (137, '260509010124', 698, 1, 25, '2026-05-09 10:20:01', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-09 10:20:00', 0, '2026-05-09 10:20:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (138, '260509010124', 698, 1, 30, '2026-05-09 10:20:01', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-09 10:20:00', 0, '2026-05-09 10:20:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (139, '260509010127', 0, 1, 4, '2026-05-09 10:31:10', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-09 10:31:10', 0, '2026-05-09 10:31:10', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (140, '260509010130', 0, 1, 4, '2026-05-09 10:46:31', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-09 10:46:31', 0, '2026-05-09 10:46:31', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (141, '260509010130', 0, 1, 20, '2026-05-09 10:50:00', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-09 10:50:00', 0, '2026-05-09 10:50:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (142, '260509010130', 0, 1, 13, '2026-05-09 10:50:00', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-09 10:50:00', 0, '2026-05-09 10:50:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (143, '260509010139', 0, 1, 4, '2026-05-09 11:31:42', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-09 11:31:42', 0, '2026-05-09 11:31:42', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (144, '260509010139', 0, 1, 27, '2026-05-09 11:35:00', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-09 11:35:00', 0, '2026-05-09 11:35:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (145, '260509010140', 711, 1, 4, '2026-05-09 11:36:23', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-09 11:36:22', 0, '2026-05-09 11:36:22', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (146, '260509010140', 711, 1, 14, '2026-05-09 11:40:00', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-09 11:40:00', 0, '2026-05-09 11:40:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (147, '260509010140', 711, 1, 11, '2026-05-09 11:40:00', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-09 11:40:00', 0, '2026-05-09 11:40:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (148, '260509010145', 0, 1, 4, '2026-05-09 12:02:24', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-09 12:02:24', 0, '2026-05-09 12:02:24', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (149, '260509010145', 0, 1, 36, '2026-05-09 12:05:00', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-09 12:05:00', 0, '2026-05-09 12:05:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (150, '260509010145', 0, 1, 16, '2026-05-09 12:05:00', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-09 12:05:00', 0, '2026-05-09 12:05:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (151, '260509010147', 717, 1, 4, '2026-05-09 12:13:09', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-09 12:13:09', 0, '2026-05-09 12:13:09', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (152, '260509010147', 147, 1, 29, '2026-05-09 12:15:01', 0, 0, 1, 1000, 0, NULL, NULL, '2026-05-09 12:15:01', 0, '2026-05-09 12:15:01', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (153, '260509010147', 147, 1, 21, '2026-05-09 12:15:01', 0, 0, 1, 1000, 0, NULL, NULL, '2026-05-09 12:15:01', 0, '2026-05-09 12:15:01', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (154, '260509010147', 717, 1, 29, '2026-05-09 12:15:02', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-09 12:15:01', 0, '2026-05-09 12:15:01', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (155, '260509010147', 717, 1, 21, '2026-05-09 12:15:02', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-09 12:15:01', 0, '2026-05-09 12:15:01', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (156, '260509010150', 720, 1, 4, '2026-05-09 12:27:32', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-09 12:27:32', 0, '2026-05-09 12:27:32', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (157, '260509010150', 150, 1, 24, '2026-05-09 12:30:01', 0, 0, 1, 1000, 0, NULL, NULL, '2026-05-09 12:30:01', 0, '2026-05-09 12:30:01', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (158, '260509010150', 150, 1, 20, '2026-05-09 12:30:01', 0, 0, 1, 1000, 0, NULL, NULL, '2026-05-09 12:30:01', 0, '2026-05-09 12:30:01', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (159, '260509010150', 720, 1, 24, '2026-05-09 12:30:01', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-09 12:30:01', 0, '2026-05-09 12:30:01', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (160, '260509010150', 720, 1, 20, '2026-05-09 12:30:01', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-09 12:30:01', 0, '2026-05-09 12:30:01', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (161, '260509010152', 0, 1, 4, '2026-05-09 12:36:20', 0, 100, 1, 1040, 0, NULL, NULL, '2026-05-09 12:36:19', 0, '2026-05-09 12:40:51', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (162, '260509010152', 152, 1, 31, '2026-05-09 12:40:00', 0, 0, 1, 980, 0, NULL, NULL, '2026-05-09 12:40:00', 0, '2026-05-09 12:40:51', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (163, '260509010152', 152, 1, 26, '2026-05-09 12:40:00', 0, 0, 1, 980, 0, NULL, NULL, '2026-05-09 12:40:00', 0, '2026-05-09 12:40:51', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (164, '260509010152', 0, 1, 31, '2026-05-09 12:40:00', 2, 0, 1, 980, 0, NULL, NULL, '2026-05-09 12:40:00', 0, '2026-05-09 12:40:51', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (165, '260509010152', 0, 1, 26, '2026-05-09 12:40:00', 3, 0, 1, 980, 0, NULL, NULL, '2026-05-09 12:40:00', 0, '2026-05-09 12:40:51', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (166, '260509010162', 0, 1, 4, '2026-05-09 13:26:12', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-09 13:26:12', 0, '2026-05-09 13:26:12', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (167, '260509010162', 162, 1, 17, '2026-05-09 13:30:00', 0, 0, 1, 1000, 0, NULL, NULL, '2026-05-09 13:30:00', 0, '2026-05-09 13:30:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (168, '260509010162', 162, 1, 23, '2026-05-09 13:30:00', 0, 0, 1, 1000, 0, NULL, NULL, '2026-05-09 13:30:00', 0, '2026-05-09 13:30:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (169, '260509010162', 0, 1, 17, '2026-05-09 13:30:00', 2, 0, 1, 0, 0, NULL, NULL, '2026-05-09 13:30:00', 0, '2026-05-09 13:30:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (170, '260509010162', 0, 1, 23, '2026-05-09 13:30:00', 3, 0, 1, 0, 0, NULL, NULL, '2026-05-09 13:30:00', 0, '2026-05-09 13:30:00', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (171, '260509010164', 731, 1, 4, '2026-05-09 13:37:48', 0, 100, 1, 1160, 0, NULL, NULL, '2026-05-09 13:37:48', 0, '2026-05-09 13:44:59', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (172, '260509010164', 164, 1, 35, '2026-05-09 13:40:00', 0, 0, 1, 920, 0, NULL, NULL, '2026-05-09 13:40:00', 0, '2026-05-09 13:44:59', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (173, '260509010164', 164, 1, 22, '2026-05-09 13:40:00', 0, 0, 1, 920, 0, NULL, NULL, '2026-05-09 13:40:00', 0, '2026-05-09 13:44:59', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (174, '260509010164', 731, 1, 35, '2026-05-09 13:40:00', 2, 0, 1, 920, 0, NULL, NULL, '2026-05-09 13:40:00', 0, '2026-05-09 13:44:59', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (175, '260509010164', 731, 1, 22, '2026-05-09 13:40:00', 3, 0, 1, 920, 0, NULL, NULL, '2026-05-09 13:40:00', 0, '2026-05-09 13:44:59', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (176, '260509010209', 779, 1, 4, '2026-05-09 17:21:01', 0, 100, 1, 1180, 0, NULL, NULL, '2026-05-09 17:21:01', 0, '2026-05-09 17:28:07', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (177, '260509010209', 209, 1, 32, '2026-05-09 17:25:00', 0, 0, 1, 920, 0, NULL, NULL, '2026-05-09 17:25:00', 0, '2026-05-09 17:26:06', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (178, '260509010209', 209, 1, 30, '2026-05-09 17:25:00', 0, 0, 1, 880, 0, NULL, NULL, '2026-05-09 17:25:00', 0, '2026-05-09 17:28:07', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (179, '260509010209', 779, 1, 32, '2026-05-09 17:25:00', 2, 0, 1, 920, 0, NULL, NULL, '2026-05-09 17:25:00', 0, '2026-05-09 17:26:06', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (180, '260509010209', 779, 1, 30, '2026-05-09 17:25:00', 3, 0, 1, 880, 0, NULL, NULL, '2026-05-09 17:25:00', 0, '2026-05-09 17:28:07', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (181, '260509010212', 785, 1, 4, '2026-05-09 17:36:56', 0, 100, 1, 980, 0, NULL, NULL, '2026-05-09 17:36:56', 0, '2026-05-09 17:43:22', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (182, '260509010212', 212, 1, 13, '2026-05-09 17:40:00', 0, 0, 1, 1100, 0, NULL, NULL, '2026-05-09 17:40:00', 0, '2026-05-09 17:43:22', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (183, '260509010212', 212, 1, 18, '2026-05-09 17:40:00', 0, 0, 1, 920, 0, NULL, NULL, '2026-05-09 17:40:00', 0, '2026-05-09 17:43:22', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (184, '260509010212', 785, 1, 13, '2026-05-09 17:40:00', 2, 0, 1, 1100, 0, NULL, NULL, '2026-05-09 17:40:00', 0, '2026-05-09 17:43:22', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (185, '260509010212', 785, 1, 18, '2026-05-09 17:40:00', 3, 0, 1, 920, 0, NULL, NULL, '2026-05-09 17:40:00', 0, '2026-05-09 17:43:22', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (186, '260509010221', 0, 1, 4, '2026-05-09 18:22:37', 0, 100, 1, 1200, 0, NULL, NULL, '2026-05-09 18:22:36', 0, '2026-05-09 18:27:03', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (187, '260509010221', 221, 1, 9, '2026-05-09 18:25:01', 0, 0, 1, 660, 0, NULL, NULL, '2026-05-09 18:25:01', 0, '2026-05-09 18:27:02', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (188, '260509010221', 221, 1, 10, '2026-05-09 18:25:01', 0, 0, 1, 1140, 0, NULL, NULL, '2026-05-09 18:25:01', 0, '2026-05-09 18:27:03', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (189, '260509010221', 0, 1, 9, '2026-05-09 18:25:01', 2, 0, 1, 660, 0, NULL, NULL, '2026-05-09 18:25:00', 0, '2026-05-09 18:27:02', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (190, '260509010221', 0, 1, 10, '2026-05-09 18:25:01', 3, 0, 1, 1140, 0, NULL, NULL, '2026-05-09 18:25:00', 0, '2026-05-09 18:27:03', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (191, '260509010227', 810, 1, 4, '2026-05-09 18:53:39', 0, 100, 1, 1160, 0, NULL, NULL, '2026-05-09 18:53:38', 0, '2026-05-09 18:58:57', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (192, '260509010227', 227, 1, 11, '2026-05-09 18:55:01', 0, 0, 1, 920, 0, NULL, NULL, '2026-05-09 18:55:01', 0, '2026-05-09 18:58:57', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (193, '260509010227', 227, 1, 28, '2026-05-09 18:55:01', 0, 0, 1, 920, 0, NULL, NULL, '2026-05-09 18:55:01', 0, '2026-05-09 18:58:57', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (194, '260509010227', 810, 1, 11, '2026-05-09 18:55:01', 2, 0, 1, 920, 0, NULL, NULL, '2026-05-09 18:55:00', 0, '2026-05-09 18:58:57', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (195, '260509010227', 810, 1, 28, '2026-05-09 18:55:01', 3, 0, 1, 920, 0, NULL, NULL, '2026-05-09 18:55:00', 0, '2026-05-09 18:58:57', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (196, '260509010230', 816, 1, 4, '2026-05-09 19:06:01', 0, 100, 1, 1240, 0, NULL, NULL, '2026-05-09 19:06:01', 0, '2026-05-09 19:13:44', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (197, '260509010230', 230, 1, 27, '2026-05-09 19:10:01', 0, 0, 1, 1120, 0, NULL, NULL, '2026-05-09 19:10:01', 0, '2026-05-09 19:13:44', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (198, '260509010230', 230, 1, 16, '2026-05-09 19:10:01', 0, 0, 1, 640, 0, NULL, NULL, '2026-05-09 19:10:01', 0, '2026-05-09 19:13:44', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (199, '260509010230', 816, 1, 27, '2026-05-09 19:10:01', 2, 0, 1, 1120, 0, NULL, NULL, '2026-05-09 19:10:00', 0, '2026-05-09 19:13:44', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (200, '260509010230', 816, 1, 16, '2026-05-09 19:10:01', 3, 0, 1, 640, 0, NULL, NULL, '2026-05-09 19:10:00', 0, '2026-05-09 19:13:44', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (201, '260509010234', 824, 1, 4, '2026-05-09 19:27:49', 0, 100, 1, 1680, 0, NULL, NULL, '2026-05-09 19:27:48', 0, '2026-05-09 19:34:01', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (202, '260509010234', 234, 1, 33, '2026-05-09 19:30:00', 0, 0, 1, 660, 0, NULL, NULL, '2026-05-09 19:30:00', 0, '2026-05-09 19:34:01', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (203, '260509010234', 234, 1, 36, '2026-05-09 19:30:00', 0, 0, 1, 660, 0, NULL, NULL, '2026-05-09 19:30:00', 0, '2026-05-09 19:34:01', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (204, '260509010234', 824, 1, 33, '2026-05-09 19:30:00', 2, 0, 1, 660, 0, NULL, NULL, '2026-05-09 19:30:00', 0, '2026-05-09 19:34:01', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (205, '260509010234', 824, 1, 36, '2026-05-09 19:30:00', 3, 0, 1, 660, 0, NULL, NULL, '2026-05-09 19:30:00', 0, '2026-05-09 19:34:01', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (206, '260509010263', 0, 1, 4, '2026-05-09 21:51:00', 0, 100, 1, 1320, 0, NULL, NULL, '2026-05-09 21:51:00', 0, '2026-05-09 21:58:52', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (207, '260509010263', 263, 1, 30, '2026-05-09 21:55:01', 0, 0, 1, 840, 0, NULL, NULL, '2026-05-09 21:55:01', 0, '2026-05-09 21:58:52', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (208, '260509010263', 263, 1, 23, '2026-05-09 21:55:01', 0, 0, 1, 840, 0, NULL, NULL, '2026-05-09 21:55:01', 0, '2026-05-09 21:58:52', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (209, '260509010263', 0, 1, 30, '2026-05-09 21:55:01', 2, 0, 1, 840, 0, NULL, NULL, '2026-05-09 21:55:00', 0, '2026-05-09 21:58:52', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (210, '260509010269', 877, 1, 4, '2026-05-09 22:24:04', 0, 100, 2, 0, 0, NULL, NULL, '2026-05-09 22:24:03', 0, '2026-05-09 22:24:14', NULL);
INSERT INTO `ddz_arena_period_players_202605` VALUES (211, '260509010271', 0, 1, 4, '2026-05-09 22:31:40', 0, 100, 1, 0, 0, NULL, NULL, '2026-05-09 22:31:40', 0, '2026-05-09 22:31:40', NULL);

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
  `arena_gold` bigint NOT NULL DEFAULT 0 COMMENT '当期赛事金币',
  `is_eliminated` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否淘汰:0-否,1-是',
  `eliminated_round` int NULL DEFAULT NULL COMMENT '淘汰轮次',
  `rank_no` int NULL DEFAULT NULL COMMENT '最终排名',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `player_status` tinyint NULL DEFAULT 0 COMMENT '0报名 1比赛中 2淘汰 3晋级 4结束',
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `final_rank` int NULL DEFAULT NULL COMMENT '最终排名(比赛结束时从participations同步)',
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
) ENGINE = InnoDB AUTO_INCREMENT = 880 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场期号表(月份分表)' ROW_FORMAT = Dynamic;

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
INSERT INTO `ddz_arena_periods_202605` VALUES (410, '260507020035', 2, 2, 35, '2026-05-07 22:40:00', '2026-05-07 22:41:00', '2026-05-07 22:50:00', '2026-05-07 22:45:00', 0, 0, 0, 2, NULL, '2026-05-07 22:50:00', '2026-05-07 22:40:00', '2026-05-07 22:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (411, '260507010274', 1, 1, 274, '2026-05-07 22:45:00', '2026-05-07 22:46:00', '2026-05-07 22:50:00', '2026-05-07 22:50:00', 0, 0, 0, 2, NULL, '2026-05-07 22:50:00', '2026-05-07 22:45:00', '2026-05-07 22:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (412, '260507010275', 1, 1, 275, '2026-05-07 22:50:00', '2026-05-07 22:51:00', '2026-05-07 22:55:00', '2026-05-07 22:55:00', 0, 0, 0, 2, NULL, '2026-05-07 22:55:01', '2026-05-07 22:50:00', '2026-05-07 22:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (413, '260507020036', 2, 2, 36, '2026-05-07 22:50:00', '2026-05-07 22:51:00', '2026-05-07 23:00:00', '2026-05-07 22:55:00', 0, 0, 0, 2, NULL, '2026-05-07 23:00:00', '2026-05-07 22:50:00', '2026-05-07 23:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (418, '260507010276', 1, 1, 276, '2026-05-07 22:55:00', '2026-05-07 22:56:00', '2026-05-07 23:00:00', '2026-05-07 23:00:00', 0, 0, 0, 2, NULL, '2026-05-07 23:00:00', '2026-05-07 22:55:00', '2026-05-07 23:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (419, '260507010277', 1, 1, 277, '2026-05-07 23:00:00', '2026-05-07 23:01:00', '2026-05-07 23:05:00', '2026-05-07 23:05:00', 0, 0, 0, 2, NULL, '2026-05-07 23:05:01', '2026-05-07 23:00:00', '2026-05-07 23:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (420, '260507020037', 2, 2, 37, '2026-05-07 23:00:00', '2026-05-07 23:01:00', '2026-05-07 23:10:00', '2026-05-07 23:05:00', 0, 0, 0, 2, NULL, '2026-05-07 23:10:01', '2026-05-07 23:00:00', '2026-05-07 23:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (421, '260507010278', 1, 1, 278, '2026-05-07 23:05:00', '2026-05-07 23:06:00', '2026-05-07 23:10:00', '2026-05-07 23:10:00', 0, 0, 0, 2, NULL, '2026-05-07 23:10:01', '2026-05-07 23:05:00', '2026-05-07 23:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (422, '260507010279', 1, 1, 279, '2026-05-07 23:10:00', '2026-05-07 23:11:00', '2026-05-07 23:15:00', '2026-05-07 23:15:00', 0, 0, 0, 2, NULL, '2026-05-07 23:15:01', '2026-05-07 23:10:00', '2026-05-07 23:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (423, '260507020038', 2, 2, 38, '2026-05-07 23:10:00', '2026-05-07 23:11:00', '2026-05-07 23:20:00', '2026-05-07 23:15:00', 0, 0, 0, 2, NULL, '2026-05-07 23:20:00', '2026-05-07 23:10:00', '2026-05-07 23:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (424, '260507010280', 1, 1, 280, '2026-05-07 23:15:00', '2026-05-07 23:16:00', '2026-05-07 23:20:00', '2026-05-07 23:20:00', 0, 0, 0, 2, NULL, '2026-05-07 23:20:00', '2026-05-07 23:15:00', '2026-05-07 23:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (425, '260507010281', 1, 1, 281, '2026-05-07 23:20:00', '2026-05-07 23:21:00', '2026-05-07 23:25:00', '2026-05-07 23:25:00', 0, 0, 0, 2, NULL, '2026-05-07 23:25:01', '2026-05-07 23:20:00', '2026-05-07 23:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (426, '260507020039', 2, 2, 39, '2026-05-07 23:20:00', '2026-05-07 23:21:00', '2026-05-07 23:30:00', '2026-05-07 23:25:00', 0, 0, 0, 2, NULL, '2026-05-07 23:30:01', '2026-05-07 23:20:00', '2026-05-07 23:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (427, '260507010282', 1, 1, 282, '2026-05-07 23:25:00', '2026-05-07 23:26:00', '2026-05-07 23:30:00', '2026-05-07 23:30:00', 0, 0, 0, 2, NULL, '2026-05-07 23:30:01', '2026-05-07 23:25:00', '2026-05-07 23:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (428, '260507010283', 1, 1, 283, '2026-05-07 23:30:00', '2026-05-07 23:31:00', '2026-05-07 23:35:00', '2026-05-07 23:35:00', 0, 0, 0, 2, NULL, '2026-05-07 23:35:01', '2026-05-07 23:30:00', '2026-05-07 23:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (429, '260507020040', 2, 2, 40, '2026-05-07 23:30:00', '2026-05-07 23:31:00', '2026-05-07 23:40:00', '2026-05-07 23:35:00', 0, 0, 0, 2, NULL, '2026-05-07 23:40:01', '2026-05-07 23:30:00', '2026-05-07 23:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (430, '260507010284', 1, 1, 284, '2026-05-07 23:35:00', '2026-05-07 23:36:00', '2026-05-07 23:40:00', '2026-05-07 23:40:00', 0, 0, 0, 2, NULL, '2026-05-07 23:40:01', '2026-05-07 23:35:00', '2026-05-07 23:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (431, '260507010285', 1, 1, 285, '2026-05-07 23:40:00', '2026-05-07 23:41:00', '2026-05-07 23:45:00', '2026-05-07 23:45:00', 0, 0, 0, 2, NULL, '2026-05-07 23:45:01', '2026-05-07 23:40:00', '2026-05-07 23:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (432, '260507020041', 2, 2, 41, '2026-05-07 23:40:00', '2026-05-07 23:41:00', '2026-05-07 23:50:00', '2026-05-07 23:45:00', 0, 0, 0, 1, NULL, NULL, '2026-05-07 23:40:00', '2026-05-07 23:41:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (433, '260507010286', 1, 1, 286, '2026-05-07 23:45:00', '2026-05-07 23:46:00', '2026-05-07 23:50:00', '2026-05-07 23:50:00', 0, 0, 0, 2, NULL, '2026-05-07 23:50:01', '2026-05-07 23:45:00', '2026-05-07 23:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (434, '260507010287', 1, 1, 287, '2026-05-07 23:50:00', '2026-05-07 23:51:00', '2026-05-07 23:55:00', '2026-05-07 23:55:00', 0, 0, 0, 1, NULL, NULL, '2026-05-07 23:50:00', '2026-05-07 23:51:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (435, '260508010001', 1, 1, 1, '2026-05-08 00:00:00', '2026-05-08 00:01:00', '2026-05-08 00:05:00', '2026-05-08 00:05:00', 0, 0, 0, 2, NULL, '2026-05-08 00:05:01', '2026-05-08 00:00:00', '2026-05-08 00:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (436, '260508010002', 1, 1, 2, '2026-05-08 00:05:00', '2026-05-08 00:06:00', '2026-05-08 00:10:00', '2026-05-08 00:10:00', 0, 0, 0, 2, NULL, '2026-05-08 00:10:01', '2026-05-08 00:05:00', '2026-05-08 00:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (437, '260508010003', 1, 1, 3, '2026-05-08 00:10:00', '2026-05-08 00:11:00', '2026-05-08 00:15:00', '2026-05-08 00:15:00', 0, 0, 0, 2, NULL, '2026-05-08 00:15:01', '2026-05-08 00:10:00', '2026-05-08 00:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (438, '260508010004', 1, 1, 4, '2026-05-08 00:15:00', '2026-05-08 00:16:00', '2026-05-08 00:20:00', '2026-05-08 00:20:00', 0, 0, 0, 2, NULL, '2026-05-08 00:20:01', '2026-05-08 00:15:00', '2026-05-08 00:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (439, '260508010005', 1, 1, 5, '2026-05-08 00:20:00', '2026-05-08 00:21:00', '2026-05-08 00:25:00', '2026-05-08 00:25:00', 0, 0, 0, 2, NULL, '2026-05-08 00:25:01', '2026-05-08 00:20:00', '2026-05-08 00:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (440, '260508010006', 1, 1, 6, '2026-05-08 00:25:00', '2026-05-08 00:26:00', '2026-05-08 00:30:00', '2026-05-08 00:30:00', 0, 0, 0, 2, NULL, '2026-05-08 00:30:01', '2026-05-08 00:25:00', '2026-05-08 00:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (441, '260508010007', 1, 1, 7, '2026-05-08 00:30:00', '2026-05-08 00:31:00', '2026-05-08 00:35:00', '2026-05-08 00:35:00', 0, 0, 0, 2, NULL, '2026-05-08 00:35:01', '2026-05-08 00:30:00', '2026-05-08 00:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (442, '260508010008', 1, 1, 8, '2026-05-08 00:35:00', '2026-05-08 00:36:00', '2026-05-08 00:40:00', '2026-05-08 00:40:00', 0, 0, 0, 2, NULL, '2026-05-08 00:40:01', '2026-05-08 00:35:00', '2026-05-08 00:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (443, '260508010009', 1, 1, 9, '2026-05-08 00:40:00', '2026-05-08 00:41:00', '2026-05-08 00:45:00', '2026-05-08 00:45:00', 0, 0, 0, 2, NULL, '2026-05-08 00:45:01', '2026-05-08 00:40:00', '2026-05-08 00:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (444, '260508010010', 1, 1, 10, '2026-05-08 00:45:00', '2026-05-08 00:46:00', '2026-05-08 00:50:00', '2026-05-08 00:50:00', 0, 0, 0, 2, NULL, '2026-05-08 00:50:01', '2026-05-08 00:45:00', '2026-05-08 00:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (445, '260508010011', 1, 1, 11, '2026-05-08 00:50:00', '2026-05-08 00:51:00', '2026-05-08 00:55:00', '2026-05-08 00:55:00', 0, 0, 0, 2, NULL, '2026-05-08 00:55:01', '2026-05-08 00:50:00', '2026-05-08 00:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (446, '260508010012', 1, 1, 12, '2026-05-08 00:55:00', '2026-05-08 00:56:00', '2026-05-08 01:00:00', '2026-05-08 01:00:00', 0, 0, 0, 2, NULL, '2026-05-08 01:00:01', '2026-05-08 00:55:00', '2026-05-08 01:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (447, '260508010013', 1, 1, 13, '2026-05-08 01:00:00', '2026-05-08 01:01:00', '2026-05-08 01:05:00', '2026-05-08 01:05:00', 0, 0, 0, 2, NULL, '2026-05-08 01:05:01', '2026-05-08 01:00:00', '2026-05-08 01:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (448, '260508010014', 1, 1, 14, '2026-05-08 01:05:00', '2026-05-08 01:06:00', '2026-05-08 01:10:00', '2026-05-08 01:10:00', 0, 0, 0, 2, NULL, '2026-05-08 01:10:01', '2026-05-08 01:05:00', '2026-05-08 01:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (449, '260508010015', 1, 1, 15, '2026-05-08 01:10:00', '2026-05-08 01:11:00', '2026-05-08 01:15:00', '2026-05-08 01:15:00', 0, 0, 0, 2, NULL, '2026-05-08 01:15:01', '2026-05-08 01:10:00', '2026-05-08 01:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (450, '260508010016', 1, 1, 16, '2026-05-08 01:15:00', '2026-05-08 01:16:00', '2026-05-08 01:20:00', '2026-05-08 01:20:00', 0, 0, 0, 2, NULL, '2026-05-08 01:20:01', '2026-05-08 01:15:00', '2026-05-08 01:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (451, '260508010017', 1, 1, 17, '2026-05-08 01:20:00', '2026-05-08 01:21:00', '2026-05-08 01:25:00', '2026-05-08 01:25:00', 0, 0, 0, 2, NULL, '2026-05-08 01:25:00', '2026-05-08 01:20:00', '2026-05-08 01:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (452, '260508010018', 1, 1, 18, '2026-05-08 01:25:00', '2026-05-08 01:26:00', '2026-05-08 01:30:00', '2026-05-08 01:30:00', 0, 0, 0, 2, NULL, '2026-05-08 01:30:00', '2026-05-08 01:25:00', '2026-05-08 01:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (453, '260508010019', 1, 1, 19, '2026-05-08 01:30:00', '2026-05-08 01:31:00', '2026-05-08 01:35:00', '2026-05-08 01:35:00', 0, 0, 0, 2, NULL, '2026-05-08 01:35:00', '2026-05-08 01:30:00', '2026-05-08 01:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (454, '260508010020', 1, 1, 20, '2026-05-08 01:35:00', '2026-05-08 01:36:00', '2026-05-08 01:40:00', '2026-05-08 01:40:00', 0, 0, 0, 2, NULL, '2026-05-08 01:40:00', '2026-05-08 01:35:00', '2026-05-08 01:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (455, '260508010021', 1, 1, 21, '2026-05-08 01:40:00', '2026-05-08 01:41:00', '2026-05-08 01:45:00', '2026-05-08 01:45:00', 0, 0, 0, 2, NULL, '2026-05-08 01:45:00', '2026-05-08 01:40:00', '2026-05-08 01:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (456, '260508010022', 1, 1, 22, '2026-05-08 01:45:00', '2026-05-08 01:46:00', '2026-05-08 01:50:00', '2026-05-08 01:50:00', 0, 0, 0, 2, NULL, '2026-05-08 01:50:00', '2026-05-08 01:45:00', '2026-05-08 01:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (457, '260508010023', 1, 1, 23, '2026-05-08 01:50:00', '2026-05-08 01:51:00', '2026-05-08 01:55:00', '2026-05-08 01:55:00', 0, 0, 0, 2, NULL, '2026-05-08 01:55:00', '2026-05-08 01:50:00', '2026-05-08 01:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (458, '260508010024', 1, 1, 24, '2026-05-08 01:55:00', '2026-05-08 01:56:00', '2026-05-08 02:00:00', '2026-05-08 02:00:00', 0, 0, 0, 2, NULL, '2026-05-08 02:00:01', '2026-05-08 01:55:00', '2026-05-08 02:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (459, '260508010025', 1, 1, 25, '2026-05-08 02:00:00', '2026-05-08 02:01:00', '2026-05-08 02:05:00', '2026-05-08 02:05:00', 0, 0, 0, 2, NULL, '2026-05-08 02:05:01', '2026-05-08 02:00:00', '2026-05-08 02:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (460, '260508010026', 1, 1, 26, '2026-05-08 02:05:00', '2026-05-08 02:06:00', '2026-05-08 02:10:00', '2026-05-08 02:10:00', 0, 0, 0, 2, NULL, '2026-05-08 02:10:00', '2026-05-08 02:05:00', '2026-05-08 02:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (461, '260508010027', 1, 1, 27, '2026-05-08 02:10:00', '2026-05-08 02:11:00', '2026-05-08 02:15:00', '2026-05-08 02:15:00', 0, 0, 0, 2, NULL, '2026-05-08 02:15:00', '2026-05-08 02:10:00', '2026-05-08 02:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (462, '260508010028', 1, 1, 28, '2026-05-08 02:15:00', '2026-05-08 02:16:00', '2026-05-08 02:20:00', '2026-05-08 02:20:00', 0, 0, 0, 2, NULL, '2026-05-08 02:20:00', '2026-05-08 02:15:00', '2026-05-08 02:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (463, '260508010029', 1, 1, 29, '2026-05-08 02:20:00', '2026-05-08 02:21:00', '2026-05-08 02:25:00', '2026-05-08 02:25:00', 0, 0, 0, 2, NULL, '2026-05-08 02:25:01', '2026-05-08 02:20:00', '2026-05-08 02:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (464, '260508010030', 1, 1, 30, '2026-05-08 02:25:00', '2026-05-08 02:26:00', '2026-05-08 02:30:00', '2026-05-08 02:30:00', 0, 0, 0, 2, NULL, '2026-05-08 02:30:01', '2026-05-08 02:25:00', '2026-05-08 02:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (465, '260508010031', 1, 1, 31, '2026-05-08 02:30:00', '2026-05-08 02:31:00', '2026-05-08 02:35:00', '2026-05-08 02:35:00', 0, 0, 0, 2, NULL, '2026-05-08 02:35:01', '2026-05-08 02:30:00', '2026-05-08 02:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (466, '260508010032', 1, 1, 32, '2026-05-08 02:35:00', '2026-05-08 02:36:00', '2026-05-08 02:40:00', '2026-05-08 02:40:00', 0, 0, 0, 2, NULL, '2026-05-08 02:40:00', '2026-05-08 02:35:00', '2026-05-08 02:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (467, '260508010033', 1, 1, 33, '2026-05-08 02:40:00', '2026-05-08 02:41:00', '2026-05-08 02:45:00', '2026-05-08 02:45:00', 0, 0, 0, 2, NULL, '2026-05-08 02:45:00', '2026-05-08 02:40:00', '2026-05-08 02:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (468, '260508010034', 1, 1, 34, '2026-05-08 02:45:00', '2026-05-08 02:46:00', '2026-05-08 02:50:00', '2026-05-08 02:50:00', 0, 0, 0, 2, NULL, '2026-05-08 02:50:00', '2026-05-08 02:45:00', '2026-05-08 02:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (469, '260508010035', 1, 1, 35, '2026-05-08 02:50:00', '2026-05-08 02:51:00', '2026-05-08 02:55:00', '2026-05-08 02:55:00', 0, 0, 0, 2, NULL, '2026-05-08 02:55:00', '2026-05-08 02:50:00', '2026-05-08 02:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (470, '260508010036', 1, 1, 36, '2026-05-08 02:55:00', '2026-05-08 02:56:00', '2026-05-08 03:00:00', '2026-05-08 03:00:00', 0, 0, 0, 2, NULL, '2026-05-08 03:00:01', '2026-05-08 02:55:00', '2026-05-08 03:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (471, '260508010037', 1, 1, 37, '2026-05-08 03:00:00', '2026-05-08 03:01:00', '2026-05-08 03:05:00', '2026-05-08 03:05:00', 0, 0, 0, 2, NULL, '2026-05-08 03:05:00', '2026-05-08 03:00:00', '2026-05-08 03:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (472, '260508010038', 1, 1, 38, '2026-05-08 03:05:00', '2026-05-08 03:06:00', '2026-05-08 03:10:00', '2026-05-08 03:10:00', 0, 0, 0, 2, NULL, '2026-05-08 03:10:01', '2026-05-08 03:05:00', '2026-05-08 03:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (473, '260508010039', 1, 1, 39, '2026-05-08 03:10:00', '2026-05-08 03:11:00', '2026-05-08 03:15:00', '2026-05-08 03:15:00', 0, 0, 0, 2, NULL, '2026-05-08 03:15:00', '2026-05-08 03:10:00', '2026-05-08 03:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (474, '260508010040', 1, 1, 40, '2026-05-08 03:15:00', '2026-05-08 03:16:00', '2026-05-08 03:20:00', '2026-05-08 03:20:00', 0, 0, 0, 2, NULL, '2026-05-08 03:20:01', '2026-05-08 03:15:00', '2026-05-08 03:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (475, '260508010041', 1, 1, 41, '2026-05-08 03:20:00', '2026-05-08 03:21:00', '2026-05-08 03:25:00', '2026-05-08 03:25:00', 0, 0, 0, 2, NULL, '2026-05-08 03:25:00', '2026-05-08 03:20:00', '2026-05-08 03:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (476, '260508010042', 1, 1, 42, '2026-05-08 03:25:00', '2026-05-08 03:26:00', '2026-05-08 03:30:00', '2026-05-08 03:30:00', 0, 0, 0, 2, NULL, '2026-05-08 03:30:00', '2026-05-08 03:25:00', '2026-05-08 03:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (477, '260508010043', 1, 1, 43, '2026-05-08 03:30:00', '2026-05-08 03:31:00', '2026-05-08 03:35:00', '2026-05-08 03:35:00', 0, 0, 0, 2, NULL, '2026-05-08 03:35:00', '2026-05-08 03:30:00', '2026-05-08 03:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (478, '260508010044', 1, 1, 44, '2026-05-08 03:35:00', '2026-05-08 03:36:00', '2026-05-08 03:40:00', '2026-05-08 03:40:00', 0, 0, 0, 2, NULL, '2026-05-08 03:40:01', '2026-05-08 03:35:00', '2026-05-08 03:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (479, '260508010045', 1, 1, 45, '2026-05-08 03:40:00', '2026-05-08 03:41:00', '2026-05-08 03:45:00', '2026-05-08 03:45:00', 0, 0, 0, 2, NULL, '2026-05-08 03:45:00', '2026-05-08 03:40:00', '2026-05-08 03:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (480, '260508010046', 1, 1, 46, '2026-05-08 03:45:00', '2026-05-08 03:46:00', '2026-05-08 03:50:00', '2026-05-08 03:50:00', 0, 0, 0, 2, NULL, '2026-05-08 03:50:01', '2026-05-08 03:45:00', '2026-05-08 03:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (481, '260508010047', 1, 1, 47, '2026-05-08 03:50:00', '2026-05-08 03:51:00', '2026-05-08 03:55:00', '2026-05-08 03:55:00', 0, 0, 0, 2, NULL, '2026-05-08 03:55:01', '2026-05-08 03:50:00', '2026-05-08 03:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (482, '260508010048', 1, 1, 48, '2026-05-08 03:55:00', '2026-05-08 03:56:00', '2026-05-08 04:00:00', '2026-05-08 04:00:00', 0, 0, 0, 2, NULL, '2026-05-08 04:00:01', '2026-05-08 03:55:00', '2026-05-08 04:00:01');
INSERT INTO `ddz_arena_periods_202605` VALUES (483, '260508010049', 1, 1, 49, '2026-05-08 04:00:00', '2026-05-08 04:01:00', '2026-05-08 04:05:00', '2026-05-08 04:05:00', 0, 0, 0, 2, NULL, '2026-05-08 04:05:00', '2026-05-08 04:00:01', '2026-05-08 04:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (484, '260508010050', 1, 1, 50, '2026-05-08 04:05:00', '2026-05-08 04:06:00', '2026-05-08 04:10:00', '2026-05-08 04:10:00', 0, 0, 0, 2, NULL, '2026-05-08 04:10:01', '2026-05-08 04:05:00', '2026-05-08 04:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (485, '260508010051', 1, 1, 51, '2026-05-08 04:10:00', '2026-05-08 04:11:00', '2026-05-08 04:15:00', '2026-05-08 04:15:00', 0, 0, 0, 2, NULL, '2026-05-08 04:15:01', '2026-05-08 04:10:00', '2026-05-08 04:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (486, '260508010052', 1, 1, 52, '2026-05-08 04:15:00', '2026-05-08 04:16:00', '2026-05-08 04:20:00', '2026-05-08 04:20:00', 0, 0, 0, 2, NULL, '2026-05-08 04:20:01', '2026-05-08 04:15:00', '2026-05-08 04:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (487, '260508010053', 1, 1, 53, '2026-05-08 04:20:00', '2026-05-08 04:21:00', '2026-05-08 04:25:00', '2026-05-08 04:25:00', 0, 0, 0, 2, NULL, '2026-05-08 04:25:00', '2026-05-08 04:20:00', '2026-05-08 04:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (488, '260508010054', 1, 1, 54, '2026-05-08 04:25:00', '2026-05-08 04:26:00', '2026-05-08 04:30:00', '2026-05-08 04:30:00', 0, 0, 0, 2, NULL, '2026-05-08 04:30:00', '2026-05-08 04:25:00', '2026-05-08 04:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (489, '260508010055', 1, 1, 55, '2026-05-08 04:30:00', '2026-05-08 04:31:00', '2026-05-08 04:35:00', '2026-05-08 04:35:00', 0, 0, 0, 2, NULL, '2026-05-08 04:35:00', '2026-05-08 04:30:00', '2026-05-08 04:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (490, '260508010056', 1, 1, 56, '2026-05-08 04:35:00', '2026-05-08 04:36:00', '2026-05-08 04:40:00', '2026-05-08 04:40:00', 0, 0, 0, 2, NULL, '2026-05-08 04:40:00', '2026-05-08 04:35:00', '2026-05-08 04:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (491, '260508010057', 1, 1, 57, '2026-05-08 04:40:00', '2026-05-08 04:41:00', '2026-05-08 04:45:00', '2026-05-08 04:45:00', 0, 0, 0, 2, NULL, '2026-05-08 04:45:00', '2026-05-08 04:40:00', '2026-05-08 04:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (492, '260508010058', 1, 1, 58, '2026-05-08 04:45:00', '2026-05-08 04:46:00', '2026-05-08 04:50:00', '2026-05-08 04:50:00', 0, 0, 0, 2, NULL, '2026-05-08 04:50:00', '2026-05-08 04:45:00', '2026-05-08 04:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (493, '260508010059', 1, 1, 59, '2026-05-08 04:50:00', '2026-05-08 04:51:00', '2026-05-08 04:55:00', '2026-05-08 04:55:00', 0, 0, 0, 2, NULL, '2026-05-08 04:55:01', '2026-05-08 04:50:00', '2026-05-08 04:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (494, '260508010060', 1, 1, 60, '2026-05-08 04:55:00', '2026-05-08 04:56:00', '2026-05-08 05:00:00', '2026-05-08 05:00:00', 0, 0, 0, 2, NULL, '2026-05-08 05:00:01', '2026-05-08 04:55:00', '2026-05-08 05:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (495, '260508010061', 1, 1, 61, '2026-05-08 05:00:00', '2026-05-08 05:01:00', '2026-05-08 05:05:00', '2026-05-08 05:05:00', 0, 0, 0, 2, NULL, '2026-05-08 05:05:01', '2026-05-08 05:00:00', '2026-05-08 05:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (496, '260508010062', 1, 1, 62, '2026-05-08 05:05:00', '2026-05-08 05:06:00', '2026-05-08 05:10:00', '2026-05-08 05:10:00', 0, 0, 0, 2, NULL, '2026-05-08 05:10:01', '2026-05-08 05:05:00', '2026-05-08 05:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (497, '260508010063', 1, 1, 63, '2026-05-08 05:10:00', '2026-05-08 05:11:00', '2026-05-08 05:15:00', '2026-05-08 05:15:00', 0, 0, 0, 2, NULL, '2026-05-08 05:15:00', '2026-05-08 05:10:00', '2026-05-08 05:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (498, '260508010064', 1, 1, 64, '2026-05-08 05:15:00', '2026-05-08 05:16:00', '2026-05-08 05:20:00', '2026-05-08 05:20:00', 0, 0, 0, 2, NULL, '2026-05-08 05:20:01', '2026-05-08 05:15:00', '2026-05-08 05:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (499, '260508010065', 1, 1, 65, '2026-05-08 05:20:00', '2026-05-08 05:21:00', '2026-05-08 05:25:00', '2026-05-08 05:25:00', 0, 0, 0, 2, NULL, '2026-05-08 05:25:01', '2026-05-08 05:20:00', '2026-05-08 05:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (500, '260508010066', 1, 1, 66, '2026-05-08 05:25:00', '2026-05-08 05:26:00', '2026-05-08 05:30:00', '2026-05-08 05:30:00', 0, 0, 0, 2, NULL, '2026-05-08 05:30:00', '2026-05-08 05:25:00', '2026-05-08 05:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (501, '260508010067', 1, 1, 67, '2026-05-08 05:30:00', '2026-05-08 05:31:00', '2026-05-08 05:35:00', '2026-05-08 05:35:00', 0, 0, 0, 2, NULL, '2026-05-08 05:35:01', '2026-05-08 05:30:00', '2026-05-08 05:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (502, '260508010068', 1, 1, 68, '2026-05-08 05:35:00', '2026-05-08 05:36:00', '2026-05-08 05:40:00', '2026-05-08 05:40:00', 0, 0, 0, 2, NULL, '2026-05-08 05:40:01', '2026-05-08 05:35:00', '2026-05-08 05:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (503, '260508010069', 1, 1, 69, '2026-05-08 05:40:00', '2026-05-08 05:41:00', '2026-05-08 05:45:00', '2026-05-08 05:45:00', 0, 0, 0, 2, NULL, '2026-05-08 05:45:01', '2026-05-08 05:40:00', '2026-05-08 05:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (504, '260508010070', 1, 1, 70, '2026-05-08 05:45:00', '2026-05-08 05:46:00', '2026-05-08 05:50:00', '2026-05-08 05:50:00', 0, 0, 0, 2, NULL, '2026-05-08 05:50:00', '2026-05-08 05:45:00', '2026-05-08 05:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (505, '260508010071', 1, 1, 71, '2026-05-08 05:50:00', '2026-05-08 05:51:00', '2026-05-08 05:55:00', '2026-05-08 05:55:00', 0, 0, 0, 2, NULL, '2026-05-08 05:55:01', '2026-05-08 05:50:00', '2026-05-08 05:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (506, '260508010072', 1, 1, 72, '2026-05-08 05:55:00', '2026-05-08 05:56:00', '2026-05-08 06:00:00', '2026-05-08 06:00:00', 0, 0, 0, 2, NULL, '2026-05-08 06:00:00', '2026-05-08 05:55:00', '2026-05-08 06:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (507, '260508010073', 1, 1, 73, '2026-05-08 06:00:00', '2026-05-08 06:01:00', '2026-05-08 06:05:00', '2026-05-08 06:05:00', 0, 0, 0, 2, NULL, '2026-05-08 06:05:01', '2026-05-08 06:00:00', '2026-05-08 06:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (508, '260508010074', 1, 1, 74, '2026-05-08 06:05:00', '2026-05-08 06:06:00', '2026-05-08 06:10:00', '2026-05-08 06:10:00', 0, 0, 0, 2, NULL, '2026-05-08 06:10:01', '2026-05-08 06:05:00', '2026-05-08 06:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (509, '260508010075', 1, 1, 75, '2026-05-08 06:10:00', '2026-05-08 06:11:00', '2026-05-08 06:15:00', '2026-05-08 06:15:00', 0, 0, 0, 2, NULL, '2026-05-08 06:15:00', '2026-05-08 06:10:00', '2026-05-08 06:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (510, '260508010076', 1, 1, 76, '2026-05-08 06:15:00', '2026-05-08 06:16:00', '2026-05-08 06:20:00', '2026-05-08 06:20:00', 0, 0, 0, 2, NULL, '2026-05-08 06:20:00', '2026-05-08 06:15:00', '2026-05-08 06:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (511, '260508010077', 1, 1, 77, '2026-05-08 06:20:00', '2026-05-08 06:21:00', '2026-05-08 06:25:00', '2026-05-08 06:25:00', 0, 0, 0, 2, NULL, '2026-05-08 06:25:01', '2026-05-08 06:20:00', '2026-05-08 06:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (512, '260508010078', 1, 1, 78, '2026-05-08 06:25:00', '2026-05-08 06:26:00', '2026-05-08 06:30:00', '2026-05-08 06:30:00', 0, 0, 0, 2, NULL, '2026-05-08 06:30:00', '2026-05-08 06:25:00', '2026-05-08 06:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (513, '260508010079', 1, 1, 79, '2026-05-08 06:30:00', '2026-05-08 06:31:00', '2026-05-08 06:35:00', '2026-05-08 06:35:00', 0, 0, 0, 2, NULL, '2026-05-08 06:35:00', '2026-05-08 06:30:00', '2026-05-08 06:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (514, '260508010080', 1, 1, 80, '2026-05-08 06:35:00', '2026-05-08 06:36:00', '2026-05-08 06:40:00', '2026-05-08 06:40:00', 0, 0, 0, 2, NULL, '2026-05-08 06:40:01', '2026-05-08 06:35:00', '2026-05-08 06:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (515, '260508010081', 1, 1, 81, '2026-05-08 06:40:00', '2026-05-08 06:41:00', '2026-05-08 06:45:00', '2026-05-08 06:45:00', 0, 0, 0, 2, NULL, '2026-05-08 06:45:01', '2026-05-08 06:40:00', '2026-05-08 06:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (516, '260508010082', 1, 1, 82, '2026-05-08 06:45:00', '2026-05-08 06:46:00', '2026-05-08 06:50:00', '2026-05-08 06:50:00', 0, 0, 0, 2, NULL, '2026-05-08 06:50:00', '2026-05-08 06:45:00', '2026-05-08 06:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (517, '260508010083', 1, 1, 83, '2026-05-08 06:50:00', '2026-05-08 06:51:00', '2026-05-08 06:55:00', '2026-05-08 06:55:00', 0, 0, 0, 2, NULL, '2026-05-08 06:55:00', '2026-05-08 06:50:00', '2026-05-08 06:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (518, '260508010084', 1, 1, 84, '2026-05-08 06:55:00', '2026-05-08 06:56:00', '2026-05-08 07:00:00', '2026-05-08 07:00:00', 0, 0, 0, 2, NULL, '2026-05-08 07:00:00', '2026-05-08 06:55:00', '2026-05-08 07:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (519, '260508010085', 1, 1, 85, '2026-05-08 07:00:00', '2026-05-08 07:01:00', '2026-05-08 07:05:00', '2026-05-08 07:05:00', 0, 0, 0, 2, NULL, '2026-05-08 07:05:00', '2026-05-08 07:00:00', '2026-05-08 07:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (520, '260508010086', 1, 1, 86, '2026-05-08 07:05:00', '2026-05-08 07:06:00', '2026-05-08 07:10:00', '2026-05-08 07:10:00', 0, 0, 0, 2, NULL, '2026-05-08 07:10:00', '2026-05-08 07:05:00', '2026-05-08 07:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (521, '260508010087', 1, 1, 87, '2026-05-08 07:10:00', '2026-05-08 07:11:00', '2026-05-08 07:15:00', '2026-05-08 07:15:00', 0, 0, 0, 2, NULL, '2026-05-08 07:15:00', '2026-05-08 07:10:00', '2026-05-08 07:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (522, '260508010088', 1, 1, 88, '2026-05-08 07:15:00', '2026-05-08 07:16:00', '2026-05-08 07:20:00', '2026-05-08 07:20:00', 0, 0, 0, 2, NULL, '2026-05-08 07:20:01', '2026-05-08 07:15:00', '2026-05-08 07:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (523, '260508010089', 1, 1, 89, '2026-05-08 07:20:00', '2026-05-08 07:21:00', '2026-05-08 07:25:00', '2026-05-08 07:25:00', 0, 0, 0, 2, NULL, '2026-05-08 07:25:01', '2026-05-08 07:20:00', '2026-05-08 07:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (524, '260508010090', 1, 1, 90, '2026-05-08 07:25:00', '2026-05-08 07:26:00', '2026-05-08 07:30:00', '2026-05-08 07:30:00', 0, 0, 0, 2, NULL, '2026-05-08 07:30:01', '2026-05-08 07:25:00', '2026-05-08 07:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (525, '260508010091', 1, 1, 91, '2026-05-08 07:30:00', '2026-05-08 07:31:00', '2026-05-08 07:35:00', '2026-05-08 07:35:00', 0, 0, 0, 2, NULL, '2026-05-08 07:35:01', '2026-05-08 07:30:00', '2026-05-08 07:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (526, '260508010092', 1, 1, 92, '2026-05-08 07:35:00', '2026-05-08 07:36:00', '2026-05-08 07:40:00', '2026-05-08 07:40:00', 0, 0, 0, 2, NULL, '2026-05-08 07:40:01', '2026-05-08 07:35:00', '2026-05-08 07:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (527, '260508010093', 1, 1, 93, '2026-05-08 07:40:00', '2026-05-08 07:41:00', '2026-05-08 07:45:00', '2026-05-08 07:45:00', 0, 0, 0, 2, NULL, '2026-05-08 07:45:00', '2026-05-08 07:40:00', '2026-05-08 07:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (528, '260508010094', 1, 1, 94, '2026-05-08 07:45:00', '2026-05-08 07:46:00', '2026-05-08 07:50:00', '2026-05-08 07:50:00', 0, 0, 0, 2, NULL, '2026-05-08 07:50:00', '2026-05-08 07:45:00', '2026-05-08 07:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (529, '260508010095', 1, 1, 95, '2026-05-08 07:50:00', '2026-05-08 07:51:00', '2026-05-08 07:55:00', '2026-05-08 07:55:00', 0, 0, 0, 2, NULL, '2026-05-08 07:55:01', '2026-05-08 07:50:00', '2026-05-08 07:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (530, '260508010096', 1, 1, 96, '2026-05-08 07:55:00', '2026-05-08 07:56:00', '2026-05-08 08:00:00', '2026-05-08 08:00:00', 0, 0, 0, 2, NULL, '2026-05-08 08:00:00', '2026-05-08 07:55:00', '2026-05-08 08:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (531, '260508010097', 1, 1, 97, '2026-05-08 08:00:00', '2026-05-08 08:01:00', '2026-05-08 08:05:00', '2026-05-08 08:05:00', 0, 0, 0, 2, NULL, '2026-05-08 08:05:00', '2026-05-08 08:00:00', '2026-05-08 08:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (532, '260508010098', 1, 1, 98, '2026-05-08 08:05:00', '2026-05-08 08:06:00', '2026-05-08 08:10:00', '2026-05-08 08:10:00', 0, 0, 0, 2, NULL, '2026-05-08 08:10:01', '2026-05-08 08:05:00', '2026-05-08 08:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (533, '260508010099', 1, 1, 99, '2026-05-08 08:10:00', '2026-05-08 08:11:00', '2026-05-08 08:15:00', '2026-05-08 08:15:00', 0, 0, 0, 2, NULL, '2026-05-08 08:15:01', '2026-05-08 08:10:00', '2026-05-08 08:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (534, '260508010100', 1, 1, 100, '2026-05-08 08:15:00', '2026-05-08 08:16:00', '2026-05-08 08:20:00', '2026-05-08 08:20:00', 1, 0, 3, 2, NULL, '2026-05-08 08:20:01', '2026-05-08 08:15:00', '2026-05-08 08:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (535, '260508010101', 1, 1, 101, '2026-05-08 08:20:00', '2026-05-08 08:21:00', '2026-05-08 08:25:00', '2026-05-08 08:25:00', 0, 0, 0, 2, NULL, '2026-05-08 08:25:00', '2026-05-08 08:20:00', '2026-05-08 08:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (536, '260508010102', 1, 1, 102, '2026-05-08 08:25:00', '2026-05-08 08:26:00', '2026-05-08 08:30:00', '2026-05-08 08:30:00', 0, 0, 0, 2, NULL, '2026-05-08 08:30:01', '2026-05-08 08:25:00', '2026-05-08 08:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (537, '260508010103', 1, 1, 103, '2026-05-08 08:30:00', '2026-05-08 08:31:00', '2026-05-08 08:35:00', '2026-05-08 08:35:00', 0, 0, 0, 1, NULL, NULL, '2026-05-08 08:30:00', '2026-05-08 08:31:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (538, '260508010105', 1, 1, 105, '2026-05-08 08:40:00', '2026-05-08 08:41:00', '2026-05-08 08:45:00', '2026-05-08 08:45:00', 0, 0, 0, 2, NULL, '2026-05-08 08:45:01', '2026-05-08 08:40:00', '2026-05-08 08:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (539, '260508010106', 1, 1, 106, '2026-05-08 08:45:00', '2026-05-08 08:46:00', '2026-05-08 08:50:00', '2026-05-08 08:50:00', 0, 0, 0, 2, NULL, '2026-05-08 08:50:01', '2026-05-08 08:45:00', '2026-05-08 08:50:01');
INSERT INTO `ddz_arena_periods_202605` VALUES (540, '260508010107', 1, 1, 107, '2026-05-08 08:50:00', '2026-05-08 08:51:00', '2026-05-08 08:55:00', '2026-05-08 08:55:00', 0, 0, 0, 2, NULL, '2026-05-08 08:55:01', '2026-05-08 08:50:01', '2026-05-08 08:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (541, '260508010108', 1, 1, 108, '2026-05-08 08:55:00', '2026-05-08 08:56:00', '2026-05-08 09:00:00', '2026-05-08 09:00:00', 0, 0, 0, 2, NULL, '2026-05-08 09:00:01', '2026-05-08 08:55:00', '2026-05-08 09:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (542, '260508010109', 1, 1, 109, '2026-05-08 09:00:00', '2026-05-08 09:01:00', '2026-05-08 09:05:00', '2026-05-08 09:05:00', 1, 1, 3, 2, NULL, '2026-05-08 09:05:00', '2026-05-08 09:00:00', '2026-05-08 09:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (543, '260508010110', 1, 1, 110, '2026-05-08 09:05:00', '2026-05-08 09:06:00', '2026-05-08 09:10:00', '2026-05-08 09:10:00', 0, 0, 0, 2, NULL, '2026-05-08 09:10:00', '2026-05-08 09:05:00', '2026-05-08 09:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (544, '260508010111', 1, 1, 111, '2026-05-08 09:10:00', '2026-05-08 09:11:00', '2026-05-08 09:15:00', '2026-05-08 09:15:00', 0, 0, 0, 2, NULL, '2026-05-08 09:15:01', '2026-05-08 09:10:00', '2026-05-08 09:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (545, '260508010112', 1, 1, 112, '2026-05-08 09:15:00', '2026-05-08 09:16:00', '2026-05-08 09:20:00', '2026-05-08 09:20:00', 0, 0, 0, 2, NULL, '2026-05-08 09:20:00', '2026-05-08 09:15:00', '2026-05-08 09:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (546, '260508010113', 1, 1, 113, '2026-05-08 09:20:00', '2026-05-08 09:21:00', '2026-05-08 09:25:00', '2026-05-08 09:25:00', 0, 0, 0, 2, NULL, '2026-05-08 09:25:01', '2026-05-08 09:20:00', '2026-05-08 09:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (547, '260508010114', 1, 1, 114, '2026-05-08 09:25:00', '2026-05-08 09:26:00', '2026-05-08 09:30:00', '2026-05-08 09:30:00', 0, 0, 0, 2, NULL, '2026-05-08 09:30:00', '2026-05-08 09:25:00', '2026-05-08 09:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (548, '260508010115', 1, 1, 115, '2026-05-08 09:30:00', '2026-05-08 09:31:00', '2026-05-08 09:35:00', '2026-05-08 09:35:00', 0, 0, 0, 2, NULL, '2026-05-08 09:35:00', '2026-05-08 09:30:00', '2026-05-08 09:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (549, '260508010116', 1, 1, 116, '2026-05-08 09:35:00', '2026-05-08 09:36:00', '2026-05-08 09:40:00', '2026-05-08 09:40:00', 0, 0, 0, 2, NULL, '2026-05-08 09:40:01', '2026-05-08 09:35:00', '2026-05-08 09:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (550, '260508010117', 1, 1, 117, '2026-05-08 09:40:00', '2026-05-08 09:41:00', '2026-05-08 09:45:00', '2026-05-08 09:45:00', 0, 0, 0, 2, NULL, '2026-05-08 09:45:00', '2026-05-08 09:40:00', '2026-05-08 09:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (551, '260508010118', 1, 1, 118, '2026-05-08 09:45:00', '2026-05-08 09:46:00', '2026-05-08 09:50:00', '2026-05-08 09:50:00', 0, 0, 0, 2, NULL, '2026-05-08 09:50:01', '2026-05-08 09:45:00', '2026-05-08 09:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (552, '260508010119', 1, 1, 119, '2026-05-08 09:50:00', '2026-05-08 09:51:00', '2026-05-08 09:55:00', '2026-05-08 09:55:00', 0, 0, 0, 2, NULL, '2026-05-08 09:55:00', '2026-05-08 09:50:00', '2026-05-08 09:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (553, '260508010120', 1, 1, 120, '2026-05-08 09:55:00', '2026-05-08 09:56:00', '2026-05-08 10:00:00', '2026-05-08 10:00:00', 0, 0, 0, 2, NULL, '2026-05-08 10:00:00', '2026-05-08 09:55:00', '2026-05-08 10:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (554, '260508010121', 1, 1, 121, '2026-05-08 10:00:00', '2026-05-08 10:01:00', '2026-05-08 10:05:00', '2026-05-08 10:05:00', 0, 0, 0, 2, NULL, '2026-05-08 10:05:01', '2026-05-08 10:00:00', '2026-05-08 10:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (555, '260508010122', 1, 1, 122, '2026-05-08 10:05:00', '2026-05-08 10:06:00', '2026-05-08 10:10:00', '2026-05-08 10:10:00', 0, 0, 0, 2, NULL, '2026-05-08 10:10:00', '2026-05-08 10:05:00', '2026-05-08 10:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (556, '260508010123', 1, 1, 123, '2026-05-08 10:10:00', '2026-05-08 10:11:00', '2026-05-08 10:15:00', '2026-05-08 10:15:00', 0, 0, 0, 2, NULL, '2026-05-08 10:15:00', '2026-05-08 10:10:00', '2026-05-08 10:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (557, '260508010124', 1, 1, 124, '2026-05-08 10:15:00', '2026-05-08 10:16:00', '2026-05-08 10:20:00', '2026-05-08 10:20:00', 0, 0, 0, 1, NULL, NULL, '2026-05-08 10:15:00', '2026-05-08 10:16:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (558, '260508010126', 1, 1, 126, '2026-05-08 10:25:00', '2026-05-08 10:26:00', '2026-05-08 10:30:00', '2026-05-08 10:30:00', 0, 0, 0, 2, NULL, '2026-05-08 10:30:00', '2026-05-08 10:25:00', '2026-05-08 10:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (559, '260508010127', 1, 1, 127, '2026-05-08 10:30:00', '2026-05-08 10:31:00', '2026-05-08 10:35:00', '2026-05-08 10:35:00', 0, 0, 0, 2, NULL, '2026-05-08 10:35:01', '2026-05-08 10:30:00', '2026-05-08 10:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (560, '260508010128', 1, 1, 128, '2026-05-08 10:35:00', '2026-05-08 10:36:00', '2026-05-08 10:40:00', '2026-05-08 10:40:00', 0, 0, 0, 2, NULL, '2026-05-08 10:40:00', '2026-05-08 10:35:00', '2026-05-08 10:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (561, '260508010129', 1, 1, 129, '2026-05-08 10:40:00', '2026-05-08 10:41:00', '2026-05-08 10:45:00', '2026-05-08 10:45:00', 0, 0, 0, 2, NULL, '2026-05-08 10:45:00', '2026-05-08 10:40:00', '2026-05-08 10:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (562, '260508010130', 1, 1, 130, '2026-05-08 10:45:00', '2026-05-08 10:46:00', '2026-05-08 10:50:00', '2026-05-08 10:50:00', 0, 0, 0, 2, NULL, '2026-05-08 10:50:01', '2026-05-08 10:45:00', '2026-05-08 10:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (563, '260508010131', 1, 1, 131, '2026-05-08 10:50:00', '2026-05-08 10:51:00', '2026-05-08 10:55:00', '2026-05-08 10:55:00', 0, 0, 0, 2, NULL, '2026-05-08 10:55:00', '2026-05-08 10:50:00', '2026-05-08 10:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (564, '260508010132', 1, 1, 132, '2026-05-08 10:55:00', '2026-05-08 10:56:00', '2026-05-08 11:00:00', '2026-05-08 11:00:00', 0, 0, 0, 2, NULL, '2026-05-08 11:00:00', '2026-05-08 10:55:00', '2026-05-08 11:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (565, '260508010133', 1, 1, 133, '2026-05-08 11:00:00', '2026-05-08 11:01:00', '2026-05-08 11:05:00', '2026-05-08 11:05:00', 1, 0, 3, 2, NULL, '2026-05-08 11:05:00', '2026-05-08 11:00:00', '2026-05-08 11:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (566, '260508010134', 1, 1, 134, '2026-05-08 11:05:00', '2026-05-08 11:06:00', '2026-05-08 11:10:00', '2026-05-08 11:10:00', 0, 0, 0, 2, NULL, '2026-05-08 11:10:00', '2026-05-08 11:05:00', '2026-05-08 11:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (567, '260508010135', 1, 1, 135, '2026-05-08 11:10:00', '2026-05-08 11:11:00', '2026-05-08 11:15:00', '2026-05-08 11:15:00', 0, 0, 0, 2, NULL, '2026-05-08 11:15:00', '2026-05-08 11:10:00', '2026-05-08 11:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (568, '260508010136', 1, 1, 136, '2026-05-08 11:15:00', '2026-05-08 11:16:00', '2026-05-08 11:20:00', '2026-05-08 11:20:00', 0, 0, 0, 2, NULL, '2026-05-08 11:20:01', '2026-05-08 11:15:00', '2026-05-08 11:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (569, '260508010137', 1, 1, 137, '2026-05-08 11:20:00', '2026-05-08 11:21:00', '2026-05-08 11:25:00', '2026-05-08 11:25:00', 0, 0, 0, 2, NULL, '2026-05-08 11:25:01', '2026-05-08 11:20:00', '2026-05-08 11:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (570, '260508010138', 1, 1, 138, '2026-05-08 11:25:00', '2026-05-08 11:26:00', '2026-05-08 11:30:00', '2026-05-08 11:30:00', 0, 0, 0, 1, NULL, NULL, '2026-05-08 11:25:00', '2026-05-08 11:26:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (571, '260508010140', 1, 1, 140, '2026-05-08 11:35:00', '2026-05-08 11:36:00', '2026-05-08 11:40:00', '2026-05-08 11:40:00', 0, 0, 0, 2, NULL, '2026-05-08 11:40:01', '2026-05-08 11:35:00', '2026-05-08 11:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (572, '260508010141', 1, 1, 141, '2026-05-08 11:40:00', '2026-05-08 11:41:00', '2026-05-08 11:45:00', '2026-05-08 11:45:00', 0, 0, 0, 2, NULL, '2026-05-08 11:45:00', '2026-05-08 11:40:00', '2026-05-08 11:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (573, '260508010142', 1, 1, 142, '2026-05-08 11:45:00', '2026-05-08 11:46:00', '2026-05-08 11:50:00', '2026-05-08 11:50:00', 0, 0, 0, 1, NULL, NULL, '2026-05-08 11:45:00', '2026-05-08 11:46:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (574, '260508010144', 1, 1, 144, '2026-05-08 11:55:00', '2026-05-08 11:56:00', '2026-05-08 12:00:00', '2026-05-08 12:00:00', 1, 0, 3, 2, NULL, '2026-05-08 12:00:01', '2026-05-08 11:55:00', '2026-05-08 12:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (575, '260508010145', 1, 1, 145, '2026-05-08 12:00:00', '2026-05-08 12:01:00', '2026-05-08 12:05:00', '2026-05-08 12:05:00', 0, 0, 0, 2, NULL, '2026-05-08 12:05:00', '2026-05-08 12:00:00', '2026-05-08 12:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (576, '260508010146', 1, 1, 146, '2026-05-08 12:05:00', '2026-05-08 12:06:00', '2026-05-08 12:10:00', '2026-05-08 12:10:00', 0, 0, 0, 2, NULL, '2026-05-08 12:10:01', '2026-05-08 12:05:00', '2026-05-08 12:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (577, '260508010147', 1, 1, 147, '2026-05-08 12:10:00', '2026-05-08 12:11:00', '2026-05-08 12:15:00', '2026-05-08 12:15:00', 0, 0, 0, 2, NULL, '2026-05-08 12:15:00', '2026-05-08 12:10:00', '2026-05-08 12:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (578, '260508010148', 1, 1, 148, '2026-05-08 12:15:00', '2026-05-08 12:16:00', '2026-05-08 12:20:00', '2026-05-08 12:20:00', 0, 0, 0, 2, NULL, '2026-05-08 12:20:01', '2026-05-08 12:15:00', '2026-05-08 12:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (579, '260508010149', 1, 1, 149, '2026-05-08 12:20:00', '2026-05-08 12:21:00', '2026-05-08 12:25:00', '2026-05-08 12:25:00', 1, 0, 3, 2, NULL, '2026-05-08 12:25:00', '2026-05-08 12:20:00', '2026-05-08 12:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (580, '260508010150', 1, 1, 150, '2026-05-08 12:25:00', '2026-05-08 12:26:00', '2026-05-08 12:30:00', '2026-05-08 12:30:00', 0, 0, 0, 2, NULL, '2026-05-08 12:30:01', '2026-05-08 12:25:00', '2026-05-08 12:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (581, '260508010151', 1, 1, 151, '2026-05-08 12:30:00', '2026-05-08 12:31:00', '2026-05-08 12:35:00', '2026-05-08 12:35:00', 0, 0, 0, 2, NULL, '2026-05-08 12:35:00', '2026-05-08 12:30:00', '2026-05-08 12:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (582, '260508010152', 1, 1, 152, '2026-05-08 12:35:00', '2026-05-08 12:36:00', '2026-05-08 12:40:00', '2026-05-08 12:40:00', 0, 0, 0, 0, NULL, NULL, '2026-05-08 12:35:00', '2026-05-08 12:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (583, '260508010163', 1, 1, 163, '2026-05-08 13:30:00', '2026-05-08 13:31:00', '2026-05-08 13:35:00', '2026-05-08 13:35:00', 1, 0, 3, 2, NULL, '2026-05-08 13:35:01', '2026-05-08 13:30:00', '2026-05-08 13:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (584, '260508010164', 1, 1, 164, '2026-05-08 13:35:00', '2026-05-08 13:36:00', '2026-05-08 13:40:00', '2026-05-08 13:40:00', 0, 0, 0, 2, NULL, '2026-05-08 13:40:01', '2026-05-08 13:35:00', '2026-05-08 13:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (585, '260508010165', 1, 1, 165, '2026-05-08 13:40:00', '2026-05-08 13:41:00', '2026-05-08 13:45:00', '2026-05-08 13:45:00', 1, 0, 3, 2, NULL, '2026-05-08 13:45:00', '2026-05-08 13:40:00', '2026-05-08 13:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (586, '260508010166', 1, 1, 166, '2026-05-08 13:45:00', '2026-05-08 13:46:00', '2026-05-08 13:50:00', '2026-05-08 13:50:00', 0, 0, 0, 1, NULL, NULL, '2026-05-08 13:45:00', '2026-05-08 13:46:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (587, '260508010168', 1, 1, 168, '2026-05-08 13:55:00', '2026-05-08 13:56:00', '2026-05-08 14:00:00', '2026-05-08 14:00:00', 1, 0, 3, 2, NULL, '2026-05-08 14:00:01', '2026-05-08 13:55:00', '2026-05-08 14:00:01');
INSERT INTO `ddz_arena_periods_202605` VALUES (588, '260508010169', 1, 1, 169, '2026-05-08 14:00:00', '2026-05-08 14:01:00', '2026-05-08 14:05:00', '2026-05-08 14:05:00', 0, 0, 0, 2, NULL, '2026-05-08 14:05:01', '2026-05-08 14:00:01', '2026-05-08 14:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (589, '260508010170', 1, 1, 170, '2026-05-08 14:05:00', '2026-05-08 14:06:00', '2026-05-08 14:10:00', '2026-05-08 14:10:00', 0, 0, 0, 2, NULL, '2026-05-08 14:10:00', '2026-05-08 14:05:00', '2026-05-08 14:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (590, '260508010171', 1, 1, 171, '2026-05-08 14:10:00', '2026-05-08 14:11:00', '2026-05-08 14:15:00', '2026-05-08 14:15:00', 1, 0, 3, 2, NULL, '2026-05-08 14:15:01', '2026-05-08 14:10:00', '2026-05-08 14:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (591, '260508010172', 1, 1, 172, '2026-05-08 14:15:00', '2026-05-08 14:16:00', '2026-05-08 14:20:00', '2026-05-08 14:20:00', 0, 0, 0, 2, NULL, '2026-05-08 14:20:00', '2026-05-08 14:15:00', '2026-05-08 14:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (592, '260508010173', 1, 1, 173, '2026-05-08 14:20:00', '2026-05-08 14:21:00', '2026-05-08 14:25:00', '2026-05-08 14:25:00', 0, 0, 0, 2, NULL, '2026-05-08 14:25:00', '2026-05-08 14:20:00', '2026-05-08 14:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (593, '260508010174', 1, 1, 174, '2026-05-08 14:25:00', '2026-05-08 14:26:00', '2026-05-08 14:30:00', '2026-05-08 14:30:00', 0, 0, 0, 2, NULL, '2026-05-08 14:30:01', '2026-05-08 14:25:00', '2026-05-08 14:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (594, '260508010175', 1, 1, 175, '2026-05-08 14:30:00', '2026-05-08 14:31:00', '2026-05-08 14:35:00', '2026-05-08 14:35:00', 0, 0, 0, 1, NULL, NULL, '2026-05-08 14:30:00', '2026-05-08 14:31:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (595, '260508010178', 1, 1, 178, '2026-05-08 14:45:00', '2026-05-08 14:46:00', '2026-05-08 14:50:00', '2026-05-08 14:50:00', 0, 0, 0, 2, NULL, '2026-05-08 14:50:00', '2026-05-08 14:45:00', '2026-05-08 14:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (596, '260508010179', 1, 1, 179, '2026-05-08 14:50:00', '2026-05-08 14:51:00', '2026-05-08 14:55:00', '2026-05-08 14:55:00', 1, 0, 1, 2, NULL, '2026-05-08 14:55:01', '2026-05-08 14:50:00', '2026-05-08 14:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (597, '260508010180', 1, 1, 180, '2026-05-08 14:55:00', '2026-05-08 14:56:00', '2026-05-08 15:00:00', '2026-05-08 15:00:00', 1, 0, 3, 2, NULL, '2026-05-08 15:00:01', '2026-05-08 14:55:00', '2026-05-08 15:00:01');
INSERT INTO `ddz_arena_periods_202605` VALUES (598, '260508010181', 1, 1, 181, '2026-05-08 15:00:00', '2026-05-08 15:01:00', '2026-05-08 15:05:00', '2026-05-08 15:05:00', 0, 0, 0, 1, NULL, NULL, '2026-05-08 15:00:01', '2026-05-08 15:01:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (599, '260508010183', 1, 1, 183, '2026-05-08 15:10:00', '2026-05-08 15:11:00', '2026-05-08 15:15:00', '2026-05-08 15:15:00', 0, 0, 0, 2, NULL, '2026-05-08 15:15:00', '2026-05-08 15:10:00', '2026-05-08 15:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (600, '260508010184', 1, 1, 184, '2026-05-08 15:15:00', '2026-05-08 15:16:00', '2026-05-08 15:20:00', '2026-05-08 15:20:00', 0, 0, 0, 2, NULL, '2026-05-08 15:20:00', '2026-05-08 15:15:00', '2026-05-08 15:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (601, '260508010185', 1, 1, 185, '2026-05-08 15:20:00', '2026-05-08 15:21:00', '2026-05-08 15:25:00', '2026-05-08 15:25:00', 0, 0, 0, 2, NULL, '2026-05-08 15:25:00', '2026-05-08 15:20:00', '2026-05-08 15:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (602, '260508010186', 1, 1, 186, '2026-05-08 15:25:00', '2026-05-08 15:26:00', '2026-05-08 15:30:00', '2026-05-08 15:30:00', 0, 0, 0, 2, NULL, '2026-05-08 15:30:01', '2026-05-08 15:25:00', '2026-05-08 15:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (603, '260508010187', 1, 1, 187, '2026-05-08 15:30:00', '2026-05-08 15:31:00', '2026-05-08 15:35:00', '2026-05-08 15:35:00', 1, 0, 3, 2, NULL, '2026-05-08 15:35:00', '2026-05-08 15:30:00', '2026-05-08 15:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (604, '260508010188', 1, 1, 188, '2026-05-08 15:35:00', '2026-05-08 15:36:00', '2026-05-08 15:40:00', '2026-05-08 15:40:00', 0, 0, 0, 2, NULL, '2026-05-08 15:40:00', '2026-05-08 15:35:00', '2026-05-08 15:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (605, '260508010189', 1, 1, 189, '2026-05-08 15:40:00', '2026-05-08 15:41:00', '2026-05-08 15:45:00', '2026-05-08 15:45:00', 0, 0, 0, 2, NULL, '2026-05-08 15:45:01', '2026-05-08 15:40:00', '2026-05-08 15:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (606, '260508010190', 1, 1, 190, '2026-05-08 15:45:00', '2026-05-08 15:46:00', '2026-05-08 15:50:00', '2026-05-08 15:50:00', 0, 0, 0, 2, NULL, '2026-05-08 15:50:01', '2026-05-08 15:45:00', '2026-05-08 15:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (607, '260508010191', 1, 1, 191, '2026-05-08 15:50:00', '2026-05-08 15:51:00', '2026-05-08 15:55:00', '2026-05-08 15:55:00', 0, 0, 0, 2, NULL, '2026-05-08 15:55:00', '2026-05-08 15:50:00', '2026-05-08 15:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (610, '260508010192', 1, 1, 192, '2026-05-08 15:55:00', '2026-05-08 15:56:00', '2026-05-08 16:00:00', '2026-05-08 16:00:00', 0, 0, 0, 1, NULL, NULL, '2026-05-08 15:55:00', '2026-05-08 15:56:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (611, '260508010195', 1, 1, 195, '2026-05-08 16:10:00', '2026-05-08 16:11:00', '2026-05-08 16:15:00', '2026-05-08 16:15:00', 0, 0, 0, 2, NULL, '2026-05-08 16:15:00', '2026-05-08 16:10:00', '2026-05-08 16:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (612, '260508010194', 1, 1, 194, '2026-05-08 16:05:00', '2026-05-08 16:06:00', '2026-05-08 16:10:00', '2026-05-08 16:10:00', 0, 0, 0, 2, NULL, '2026-05-08 16:10:01', '2026-05-08 16:09:59', '2026-05-08 16:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (614, '260508010196', 1, 1, 196, '2026-05-08 16:15:00', '2026-05-08 16:16:00', '2026-05-08 16:20:00', '2026-05-08 16:20:00', 0, 0, 0, 2, NULL, '2026-05-08 16:20:00', '2026-05-08 16:15:00', '2026-05-08 16:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (615, '260508010197', 1, 1, 197, '2026-05-08 16:20:00', '2026-05-08 16:21:00', '2026-05-08 16:25:00', '2026-05-08 16:25:00', 1, 0, 3, 2, NULL, '2026-05-08 16:25:00', '2026-05-08 16:20:00', '2026-05-08 16:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (616, '260508010198', 1, 1, 198, '2026-05-08 16:25:00', '2026-05-08 16:26:00', '2026-05-08 16:30:00', '2026-05-08 16:30:00', 0, 0, 0, 2, NULL, '2026-05-08 16:30:00', '2026-05-08 16:25:00', '2026-05-08 16:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (617, '260508010199', 1, 1, 199, '2026-05-08 16:30:00', '2026-05-08 16:31:00', '2026-05-08 16:35:00', '2026-05-08 16:35:00', 0, 0, 0, 2, NULL, '2026-05-08 16:35:01', '2026-05-08 16:30:00', '2026-05-08 16:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (618, '260508010200', 1, 1, 200, '2026-05-08 16:35:00', '2026-05-08 16:36:00', '2026-05-08 16:40:00', '2026-05-08 16:40:00', 0, 0, 0, 2, NULL, '2026-05-08 16:40:01', '2026-05-08 16:35:00', '2026-05-08 16:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (619, '260508010201', 1, 1, 201, '2026-05-08 16:40:00', '2026-05-08 16:41:00', '2026-05-08 16:45:00', '2026-05-08 16:45:00', 0, 0, 0, 2, NULL, '2026-05-08 16:45:01', '2026-05-08 16:40:00', '2026-05-08 16:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (620, '260508010202', 1, 1, 202, '2026-05-08 16:45:00', '2026-05-08 16:46:00', '2026-05-08 16:50:00', '2026-05-08 16:50:00', 1, 0, 3, 2, NULL, '2026-05-08 16:50:01', '2026-05-08 16:45:00', '2026-05-08 16:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (621, '260508010203', 1, 1, 203, '2026-05-08 16:50:00', '2026-05-08 16:51:00', '2026-05-08 16:55:00', '2026-05-08 16:55:00', 0, 0, 0, 2, NULL, '2026-05-08 16:55:00', '2026-05-08 16:50:00', '2026-05-08 16:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (622, '260508010204', 1, 1, 204, '2026-05-08 16:55:00', '2026-05-08 16:56:00', '2026-05-08 17:00:00', '2026-05-08 17:00:00', 0, 0, 0, 2, NULL, '2026-05-08 17:00:00', '2026-05-08 16:55:00', '2026-05-08 17:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (623, '260508010205', 1, 1, 205, '2026-05-08 17:00:00', '2026-05-08 17:01:00', '2026-05-08 17:05:00', '2026-05-08 17:05:00', 0, 0, 0, 1, NULL, NULL, '2026-05-08 17:00:00', '2026-05-08 17:01:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (624, '260508020001', 2, 2, 1, '2026-05-08 17:00:00', '2026-05-08 17:01:00', '2026-05-08 17:10:00', '2026-05-08 17:05:00', 0, 0, 0, 1, NULL, NULL, '2026-05-08 17:00:00', '2026-05-08 17:01:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (625, '260508030001', 3, 3, 1, '2026-05-08 17:00:00', '2026-05-08 17:01:00', '2026-05-08 17:30:00', '2026-05-08 17:05:00', 0, 0, 0, 1, NULL, NULL, '2026-05-08 17:00:00', '2026-05-08 17:01:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (626, '260508010229', 1, 1, 229, '2026-05-08 19:00:00', '2026-05-08 19:01:00', '2026-05-08 19:05:00', '2026-05-08 19:05:00', 0, 0, 0, 1, NULL, NULL, '2026-05-08 19:00:00', '2026-05-08 19:01:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (627, '260508020013', 2, 2, 13, '2026-05-08 19:00:00', '2026-05-08 19:01:00', '2026-05-08 19:10:00', '2026-05-08 19:05:00', 0, 0, 0, 2, NULL, '2026-05-08 19:10:01', '2026-05-08 19:00:00', '2026-05-08 19:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (628, '260508030005', 3, 3, 5, '2026-05-08 19:00:00', '2026-05-08 19:01:00', '2026-05-08 19:30:00', '2026-05-08 19:05:00', 0, 0, 0, 2, NULL, '2026-05-08 19:30:00', '2026-05-08 19:00:00', '2026-05-08 19:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (629, '260508010231', 1, 1, 231, '2026-05-08 19:10:00', '2026-05-08 19:11:00', '2026-05-08 19:15:00', '2026-05-08 19:15:00', 1, 0, 3, 2, NULL, '2026-05-08 19:15:01', '2026-05-08 19:10:00', '2026-05-08 19:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (630, '260508020014', 2, 2, 14, '2026-05-08 19:10:00', '2026-05-08 19:11:00', '2026-05-08 19:20:00', '2026-05-08 19:15:00', 0, 0, 0, 2, NULL, '2026-05-08 19:20:00', '2026-05-08 19:10:00', '2026-05-08 19:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (631, '260508010232', 1, 1, 232, '2026-05-08 19:15:00', '2026-05-08 19:16:00', '2026-05-08 19:20:00', '2026-05-08 19:20:00', 0, 0, 0, 2, NULL, '2026-05-08 19:20:00', '2026-05-08 19:15:00', '2026-05-08 19:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (632, '260508010233', 1, 1, 233, '2026-05-08 19:20:00', '2026-05-08 19:21:00', '2026-05-08 19:25:00', '2026-05-08 19:25:00', 0, 0, 0, 2, NULL, '2026-05-08 19:25:00', '2026-05-08 19:20:00', '2026-05-08 19:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (633, '260508020015', 2, 2, 15, '2026-05-08 19:20:00', '2026-05-08 19:21:00', '2026-05-08 19:30:00', '2026-05-08 19:25:00', 0, 0, 0, 2, NULL, '2026-05-08 19:30:00', '2026-05-08 19:20:00', '2026-05-08 19:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (634, '260508010234', 1, 1, 234, '2026-05-08 19:25:00', '2026-05-08 19:26:00', '2026-05-08 19:30:00', '2026-05-08 19:30:00', 0, 0, 0, 2, NULL, '2026-05-08 19:30:00', '2026-05-08 19:25:00', '2026-05-08 19:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (635, '260508010235', 1, 1, 235, '2026-05-08 19:30:00', '2026-05-08 19:31:00', '2026-05-08 19:35:00', '2026-05-08 19:35:00', 0, 0, 0, 2, NULL, '2026-05-08 19:35:01', '2026-05-08 19:30:00', '2026-05-08 19:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (636, '260508020016', 2, 2, 16, '2026-05-08 19:30:00', '2026-05-08 19:31:00', '2026-05-08 19:40:00', '2026-05-08 19:35:00', 0, 0, 0, 2, NULL, '2026-05-08 19:40:00', '2026-05-08 19:30:00', '2026-05-08 19:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (637, '260508030006', 3, 3, 6, '2026-05-08 19:30:00', '2026-05-08 19:31:00', '2026-05-08 20:00:00', '2026-05-08 19:35:00', 0, 0, 0, 2, NULL, '2026-05-08 20:00:01', '2026-05-08 19:30:00', '2026-05-08 20:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (638, '260508010236', 1, 1, 236, '2026-05-08 19:35:00', '2026-05-08 19:36:00', '2026-05-08 19:40:00', '2026-05-08 19:40:00', 0, 0, 0, 2, NULL, '2026-05-08 19:40:00', '2026-05-08 19:35:00', '2026-05-08 19:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (639, '260508010237', 1, 1, 237, '2026-05-08 19:40:00', '2026-05-08 19:41:00', '2026-05-08 19:45:00', '2026-05-08 19:45:00', 0, 0, 0, 2, NULL, '2026-05-08 19:45:00', '2026-05-08 19:40:00', '2026-05-08 19:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (640, '260508020017', 2, 2, 17, '2026-05-08 19:40:00', '2026-05-08 19:41:00', '2026-05-08 19:50:00', '2026-05-08 19:45:00', 0, 0, 0, 2, NULL, '2026-05-08 19:50:01', '2026-05-08 19:40:00', '2026-05-08 19:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (641, '260508010238', 1, 1, 238, '2026-05-08 19:45:00', '2026-05-08 19:46:00', '2026-05-08 19:50:00', '2026-05-08 19:50:00', 0, 0, 0, 2, NULL, '2026-05-08 19:50:01', '2026-05-08 19:45:00', '2026-05-08 19:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (642, '260508010239', 1, 1, 239, '2026-05-08 19:50:00', '2026-05-08 19:51:00', '2026-05-08 19:55:00', '2026-05-08 19:55:00', 0, 0, 0, 2, NULL, '2026-05-08 19:55:00', '2026-05-08 19:50:00', '2026-05-08 19:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (643, '260508020018', 2, 2, 18, '2026-05-08 19:50:00', '2026-05-08 19:51:00', '2026-05-08 20:00:00', '2026-05-08 19:55:00', 0, 0, 0, 2, NULL, '2026-05-08 20:00:01', '2026-05-08 19:50:00', '2026-05-08 20:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (644, '260508010240', 1, 1, 240, '2026-05-08 19:55:00', '2026-05-08 19:56:00', '2026-05-08 20:00:00', '2026-05-08 20:00:00', 0, 0, 0, 2, NULL, '2026-05-08 20:00:01', '2026-05-08 19:55:00', '2026-05-08 20:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (645, '260508010241', 1, 1, 241, '2026-05-08 20:00:00', '2026-05-08 20:01:00', '2026-05-08 20:05:00', '2026-05-08 20:05:00', 0, 0, 0, 2, NULL, '2026-05-08 20:05:00', '2026-05-08 20:00:00', '2026-05-08 20:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (646, '260508020019', 2, 2, 19, '2026-05-08 20:00:00', '2026-05-08 20:01:00', '2026-05-08 20:10:00', '2026-05-08 20:05:00', 0, 0, 0, 1, NULL, NULL, '2026-05-08 20:00:00', '2026-05-08 20:01:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (647, '260508030007', 3, 3, 7, '2026-05-08 20:00:00', '2026-05-08 20:01:00', '2026-05-08 20:30:00', '2026-05-08 20:05:00', 0, 0, 0, 2, NULL, '2026-05-08 20:30:01', '2026-05-08 20:00:00', '2026-05-08 20:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (648, '260508010242', 1, 1, 242, '2026-05-08 20:05:00', '2026-05-08 20:06:00', '2026-05-08 20:10:00', '2026-05-08 20:10:00', 0, 0, 0, 1, NULL, NULL, '2026-05-08 20:05:00', '2026-05-08 20:06:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (649, '260508010244', 1, 1, 244, '2026-05-08 20:15:00', '2026-05-08 20:16:00', '2026-05-08 20:20:00', '2026-05-08 20:20:00', 0, 0, 0, 2, NULL, '2026-05-08 20:20:00', '2026-05-08 20:15:00', '2026-05-08 20:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (650, '260508010245', 1, 1, 245, '2026-05-08 20:20:00', '2026-05-08 20:21:00', '2026-05-08 20:25:00', '2026-05-08 20:25:00', 1, 0, 3, 2, NULL, '2026-05-08 20:25:00', '2026-05-08 20:20:00', '2026-05-08 20:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (651, '260508020021', 2, 2, 21, '2026-05-08 20:20:00', '2026-05-08 20:21:00', '2026-05-08 20:30:00', '2026-05-08 20:25:00', 0, 0, 0, 2, NULL, '2026-05-08 20:30:01', '2026-05-08 20:20:00', '2026-05-08 20:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (652, '260508010246', 1, 1, 246, '2026-05-08 20:25:00', '2026-05-08 20:26:00', '2026-05-08 20:30:00', '2026-05-08 20:30:00', 0, 0, 0, 2, NULL, '2026-05-08 20:30:01', '2026-05-08 20:25:00', '2026-05-08 20:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (653, '260508010247', 1, 1, 247, '2026-05-08 20:30:00', '2026-05-08 20:31:00', '2026-05-08 20:35:00', '2026-05-08 20:35:00', 0, 0, 0, 2, NULL, '2026-05-08 20:35:00', '2026-05-08 20:30:00', '2026-05-08 20:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (654, '260508020022', 2, 2, 22, '2026-05-08 20:30:00', '2026-05-08 20:31:00', '2026-05-08 20:40:00', '2026-05-08 20:35:00', 0, 0, 0, 2, NULL, '2026-05-08 20:40:01', '2026-05-08 20:30:00', '2026-05-08 20:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (655, '260508030008', 3, 3, 8, '2026-05-08 20:30:00', '2026-05-08 20:31:00', '2026-05-08 21:00:00', '2026-05-08 20:35:00', 0, 0, 0, 1, NULL, NULL, '2026-05-08 20:30:00', '2026-05-08 20:31:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (656, '260508010248', 1, 1, 248, '2026-05-08 20:35:00', '2026-05-08 20:36:00', '2026-05-08 20:40:00', '2026-05-08 20:40:00', 0, 0, 0, 2, NULL, '2026-05-08 20:40:01', '2026-05-08 20:35:00', '2026-05-08 20:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (657, '260508010249', 1, 1, 249, '2026-05-08 20:40:00', '2026-05-08 20:41:00', '2026-05-08 20:45:00', '2026-05-08 20:45:00', 0, 0, 0, 2, NULL, '2026-05-08 20:45:01', '2026-05-08 20:40:00', '2026-05-08 20:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (658, '260508020023', 2, 2, 23, '2026-05-08 20:40:00', '2026-05-08 20:41:00', '2026-05-08 20:50:00', '2026-05-08 20:45:00', 0, 0, 0, 2, NULL, '2026-05-08 20:50:01', '2026-05-08 20:40:00', '2026-05-08 20:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (659, '260508010250', 1, 1, 250, '2026-05-08 20:45:00', '2026-05-08 20:46:00', '2026-05-08 20:50:00', '2026-05-08 20:50:00', 0, 0, 0, 2, NULL, '2026-05-08 20:50:01', '2026-05-08 20:45:00', '2026-05-08 20:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (660, '260508010251', 1, 1, 251, '2026-05-08 20:50:00', '2026-05-08 20:51:00', '2026-05-08 20:55:00', '2026-05-08 20:55:00', 0, 0, 0, 1, NULL, NULL, '2026-05-08 20:50:00', '2026-05-08 20:51:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (661, '260508020024', 2, 2, 24, '2026-05-08 20:50:00', '2026-05-08 20:51:00', '2026-05-08 21:00:00', '2026-05-08 20:55:00', 0, 0, 0, 1, NULL, NULL, '2026-05-08 20:50:00', '2026-05-08 20:51:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (662, '260509010088', 1, 1, 88, '2026-05-09 07:15:00', '2026-05-09 07:16:00', '2026-05-09 07:20:00', '2026-05-09 07:20:00', 1, 0, 3, 2, NULL, '2026-05-09 07:20:01', '2026-05-09 07:15:00', '2026-05-09 07:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (663, '260509010089', 1, 1, 89, '2026-05-09 07:20:00', '2026-05-09 07:21:00', '2026-05-09 07:25:00', '2026-05-09 07:25:00', 0, 0, 0, 2, NULL, '2026-05-09 07:25:00', '2026-05-09 07:20:00', '2026-05-09 07:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (664, '260509010090', 1, 1, 90, '2026-05-09 07:25:00', '2026-05-09 07:26:00', '2026-05-09 07:30:00', '2026-05-09 07:30:00', 0, 0, 0, 2, NULL, '2026-05-09 07:30:01', '2026-05-09 07:25:00', '2026-05-09 07:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (665, '260509010091', 1, 1, 91, '2026-05-09 07:30:00', '2026-05-09 07:31:00', '2026-05-09 07:35:00', '2026-05-09 07:35:00', 1, 0, 3, 2, NULL, '2026-05-09 07:35:01', '2026-05-09 07:30:00', '2026-05-09 07:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (666, '260509010092', 1, 1, 92, '2026-05-09 07:35:00', '2026-05-09 07:36:00', '2026-05-09 07:40:00', '2026-05-09 07:40:00', 0, 0, 0, 2, NULL, '2026-05-09 07:40:01', '2026-05-09 07:35:00', '2026-05-09 07:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (667, '260509010093', 1, 1, 93, '2026-05-09 07:40:00', '2026-05-09 07:41:00', '2026-05-09 07:45:00', '2026-05-09 07:45:00', 0, 0, 0, 2, NULL, '2026-05-09 07:45:01', '2026-05-09 07:40:00', '2026-05-09 07:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (668, '260509010094', 1, 1, 94, '2026-05-09 07:45:00', '2026-05-09 07:46:00', '2026-05-09 07:50:00', '2026-05-09 07:50:00', 0, 0, 0, 2, NULL, '2026-05-09 07:50:00', '2026-05-09 07:45:00', '2026-05-09 07:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (669, '260509010095', 1, 1, 95, '2026-05-09 07:50:00', '2026-05-09 07:51:00', '2026-05-09 07:55:00', '2026-05-09 07:55:00', 1, 0, 3, 2, NULL, '2026-05-09 07:55:00', '2026-05-09 07:50:00', '2026-05-09 07:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (670, '260509010096', 1, 1, 96, '2026-05-09 07:55:00', '2026-05-09 07:56:00', '2026-05-09 08:00:00', '2026-05-09 08:00:00', 0, 0, 0, 2, NULL, '2026-05-09 08:00:01', '2026-05-09 07:55:00', '2026-05-09 08:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (671, '260509010097', 1, 1, 97, '2026-05-09 08:00:00', '2026-05-09 08:01:00', '2026-05-09 08:05:00', '2026-05-09 08:05:00', 0, 0, 0, 2, NULL, '2026-05-09 08:05:00', '2026-05-09 08:00:00', '2026-05-09 08:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (672, '260509010098', 1, 1, 98, '2026-05-09 08:05:00', '2026-05-09 08:06:00', '2026-05-09 08:10:00', '2026-05-09 08:10:00', 0, 0, 0, 2, NULL, '2026-05-09 08:10:01', '2026-05-09 08:05:00', '2026-05-09 08:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (673, '260509010099', 1, 1, 99, '2026-05-09 08:10:00', '2026-05-09 08:11:00', '2026-05-09 08:15:00', '2026-05-09 08:15:00', 0, 0, 0, 2, NULL, '2026-05-09 08:15:01', '2026-05-09 08:10:00', '2026-05-09 08:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (674, '260509010100', 1, 1, 100, '2026-05-09 08:15:00', '2026-05-09 08:16:00', '2026-05-09 08:20:00', '2026-05-09 08:20:00', 0, 0, 0, 2, NULL, '2026-05-09 08:20:00', '2026-05-09 08:15:00', '2026-05-09 08:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (675, '260509010101', 1, 1, 101, '2026-05-09 08:20:00', '2026-05-09 08:21:00', '2026-05-09 08:25:00', '2026-05-09 08:25:00', 0, 0, 0, 2, NULL, '2026-05-09 08:25:01', '2026-05-09 08:20:00', '2026-05-09 08:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (676, '260509010102', 1, 1, 102, '2026-05-09 08:25:00', '2026-05-09 08:26:00', '2026-05-09 08:30:00', '2026-05-09 08:30:00', 0, 0, 0, 2, NULL, '2026-05-09 08:30:01', '2026-05-09 08:25:00', '2026-05-09 08:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (677, '260509010103', 1, 1, 103, '2026-05-09 08:30:00', '2026-05-09 08:31:00', '2026-05-09 08:35:00', '2026-05-09 08:35:00', 0, 0, 0, 2, NULL, '2026-05-09 08:35:01', '2026-05-09 08:30:00', '2026-05-09 08:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (678, '260509010104', 1, 1, 104, '2026-05-09 08:35:00', '2026-05-09 08:36:00', '2026-05-09 08:40:00', '2026-05-09 08:40:00', 0, 0, 0, 2, NULL, '2026-05-09 08:40:00', '2026-05-09 08:35:00', '2026-05-09 08:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (679, '260509010105', 1, 1, 105, '2026-05-09 08:40:00', '2026-05-09 08:41:00', '2026-05-09 08:45:00', '2026-05-09 08:45:00', 0, 0, 0, 2, NULL, '2026-05-09 08:45:01', '2026-05-09 08:40:00', '2026-05-09 08:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (680, '260509010106', 1, 1, 106, '2026-05-09 08:45:00', '2026-05-09 08:46:00', '2026-05-09 08:50:00', '2026-05-09 08:50:00', 0, 0, 0, 2, NULL, '2026-05-09 08:50:00', '2026-05-09 08:45:00', '2026-05-09 08:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (681, '260509010107', 1, 1, 107, '2026-05-09 08:50:00', '2026-05-09 08:51:00', '2026-05-09 08:55:00', '2026-05-09 08:55:00', 0, 0, 0, 2, NULL, '2026-05-09 08:55:01', '2026-05-09 08:50:00', '2026-05-09 08:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (682, '260509010108', 1, 1, 108, '2026-05-09 08:55:00', '2026-05-09 08:56:00', '2026-05-09 09:00:00', '2026-05-09 09:00:00', 0, 0, 0, 2, NULL, '2026-05-09 09:00:00', '2026-05-09 08:55:00', '2026-05-09 09:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (683, '260509010109', 1, 1, 109, '2026-05-09 09:00:00', '2026-05-09 09:01:00', '2026-05-09 09:05:00', '2026-05-09 09:05:00', 0, 0, 0, 2, NULL, '2026-05-09 09:05:01', '2026-05-09 09:00:00', '2026-05-09 09:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (684, '260509010110', 1, 1, 110, '2026-05-09 09:05:00', '2026-05-09 09:06:00', '2026-05-09 09:10:00', '2026-05-09 09:10:00', 0, 0, 0, 2, NULL, '2026-05-09 09:10:01', '2026-05-09 09:05:00', '2026-05-09 09:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (687, '260509010111', 1, 1, 111, '2026-05-09 09:10:00', '2026-05-09 09:11:00', '2026-05-09 09:15:00', '2026-05-09 09:15:00', 0, 0, 0, 2, NULL, '2026-05-09 09:15:00', '2026-05-09 09:10:00', '2026-05-09 09:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (688, '260509010112', 1, 1, 112, '2026-05-09 09:15:00', '2026-05-09 09:16:00', '2026-05-09 09:20:00', '2026-05-09 09:20:00', 0, 0, 0, 2, NULL, '2026-05-09 09:20:00', '2026-05-09 09:15:00', '2026-05-09 09:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (689, '260509010113', 1, 1, 113, '2026-05-09 09:20:00', '2026-05-09 09:21:00', '2026-05-09 09:25:00', '2026-05-09 09:25:00', 0, 0, 0, 2, NULL, '2026-05-09 09:25:01', '2026-05-09 09:20:00', '2026-05-09 09:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (690, '260509010114', 1, 1, 114, '2026-05-09 09:25:00', '2026-05-09 09:26:00', '2026-05-09 09:30:00', '2026-05-09 09:30:00', 0, 0, 0, 2, NULL, '2026-05-09 09:30:00', '2026-05-09 09:25:00', '2026-05-09 09:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (691, '260509010115', 1, 1, 115, '2026-05-09 09:30:00', '2026-05-09 09:31:00', '2026-05-09 09:35:00', '2026-05-09 09:35:00', 0, 0, 0, 2, NULL, '2026-05-09 09:35:01', '2026-05-09 09:30:00', '2026-05-09 09:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (692, '260509010116', 1, 1, 116, '2026-05-09 09:35:00', '2026-05-09 09:36:00', '2026-05-09 09:40:00', '2026-05-09 09:40:00', 0, 0, 0, 2, NULL, '2026-05-09 09:40:01', '2026-05-09 09:35:00', '2026-05-09 09:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (693, '260509010117', 1, 1, 117, '2026-05-09 09:40:00', '2026-05-09 09:41:00', '2026-05-09 09:45:00', '2026-05-09 09:45:00', 0, 0, 0, 2, NULL, '2026-05-09 09:45:00', '2026-05-09 09:40:00', '2026-05-09 09:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (694, '260509010118', 1, 1, 118, '2026-05-09 09:45:00', '2026-05-09 09:46:00', '2026-05-09 09:50:00', '2026-05-09 09:50:00', 0, 0, 0, 1, NULL, NULL, '2026-05-09 09:45:00', '2026-05-09 09:46:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (695, '260509010121', 1, 1, 121, '2026-05-09 10:00:00', '2026-05-09 10:01:00', '2026-05-09 10:05:00', '2026-05-09 10:05:00', 0, 0, 0, 2, NULL, '2026-05-09 10:05:00', '2026-05-09 10:00:00', '2026-05-09 10:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (696, '260509010122', 1, 1, 122, '2026-05-09 10:05:00', '2026-05-09 10:06:00', '2026-05-09 10:10:00', '2026-05-09 10:10:00', 1, 0, 3, 2, NULL, '2026-05-09 10:10:00', '2026-05-09 10:05:00', '2026-05-09 10:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (697, '260509010123', 1, 1, 123, '2026-05-09 10:10:00', '2026-05-09 10:11:00', '2026-05-09 10:15:00', '2026-05-09 10:15:00', 0, 0, 0, 2, NULL, '2026-05-09 10:15:01', '2026-05-09 10:10:00', '2026-05-09 10:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (698, '260509010124', 1, 1, 124, '2026-05-09 10:15:00', '2026-05-09 10:16:00', '2026-05-09 10:20:00', '2026-05-09 10:20:00', 1, 0, 3, 2, NULL, '2026-05-09 10:20:01', '2026-05-09 10:15:00', '2026-05-09 10:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (699, '260509010125', 1, 1, 125, '2026-05-09 10:20:00', '2026-05-09 10:21:00', '2026-05-09 10:25:00', '2026-05-09 10:25:00', 0, 0, 0, 2, NULL, '2026-05-09 10:25:00', '2026-05-09 10:20:00', '2026-05-09 10:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (700, '260509010126', 1, 1, 126, '2026-05-09 10:25:00', '2026-05-09 10:26:00', '2026-05-09 10:30:00', '2026-05-09 10:30:00', 0, 0, 0, 1, NULL, NULL, '2026-05-09 10:25:00', '2026-05-09 10:26:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (701, '260509010128', 1, 1, 128, '2026-05-09 10:35:00', '2026-05-09 10:36:00', '2026-05-09 10:40:00', '2026-05-09 10:40:00', 0, 0, 0, 2, NULL, '2026-05-09 10:40:01', '2026-05-09 10:35:00', '2026-05-09 10:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (702, '260509010129', 1, 1, 129, '2026-05-09 10:40:00', '2026-05-09 10:41:00', '2026-05-09 10:45:00', '2026-05-09 10:45:00', 0, 0, 0, 1, NULL, NULL, '2026-05-09 10:40:00', '2026-05-09 10:41:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (703, '260509010131', 1, 1, 131, '2026-05-09 10:50:00', '2026-05-09 10:51:00', '2026-05-09 10:55:00', '2026-05-09 10:55:00', 0, 0, 0, 2, NULL, '2026-05-09 10:55:01', '2026-05-09 10:50:00', '2026-05-09 10:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (704, '260509010132', 1, 1, 132, '2026-05-09 10:55:00', '2026-05-09 10:56:00', '2026-05-09 11:00:00', '2026-05-09 11:00:00', 0, 0, 0, 2, NULL, '2026-05-09 11:00:00', '2026-05-09 10:55:00', '2026-05-09 11:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (705, '260509010133', 1, 1, 133, '2026-05-09 11:00:00', '2026-05-09 11:01:00', '2026-05-09 11:05:00', '2026-05-09 11:05:00', 0, 0, 0, 2, NULL, '2026-05-09 11:05:00', '2026-05-09 11:00:00', '2026-05-09 11:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (706, '260509010134', 1, 1, 134, '2026-05-09 11:05:00', '2026-05-09 11:06:00', '2026-05-09 11:10:00', '2026-05-09 11:10:00', 0, 0, 0, 2, NULL, '2026-05-09 11:10:01', '2026-05-09 11:05:00', '2026-05-09 11:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (707, '260509010135', 1, 1, 135, '2026-05-09 11:10:00', '2026-05-09 11:11:00', '2026-05-09 11:15:00', '2026-05-09 11:15:00', 0, 0, 0, 2, NULL, '2026-05-09 11:15:01', '2026-05-09 11:10:00', '2026-05-09 11:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (708, '260509010136', 1, 1, 136, '2026-05-09 11:15:00', '2026-05-09 11:16:00', '2026-05-09 11:20:00', '2026-05-09 11:20:00', 0, 0, 0, 2, NULL, '2026-05-09 11:20:01', '2026-05-09 11:15:00', '2026-05-09 11:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (709, '260509010137', 1, 1, 137, '2026-05-09 11:20:00', '2026-05-09 11:21:00', '2026-05-09 11:25:00', '2026-05-09 11:25:00', 0, 0, 0, 2, NULL, '2026-05-09 11:25:00', '2026-05-09 11:20:00', '2026-05-09 11:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (710, '260509010138', 1, 1, 138, '2026-05-09 11:25:00', '2026-05-09 11:26:00', '2026-05-09 11:30:00', '2026-05-09 11:30:00', 0, 0, 0, 1, NULL, NULL, '2026-05-09 11:25:00', '2026-05-09 11:26:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (711, '260509010140', 1, 1, 140, '2026-05-09 11:35:00', '2026-05-09 11:36:00', '2026-05-09 11:40:00', '2026-05-09 11:40:00', 1, 0, 3, 2, NULL, '2026-05-09 11:40:01', '2026-05-09 11:35:00', '2026-05-09 11:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (712, '260509010141', 1, 1, 141, '2026-05-09 11:40:00', '2026-05-09 11:41:00', '2026-05-09 11:45:00', '2026-05-09 11:45:00', 0, 0, 0, 2, NULL, '2026-05-09 11:45:01', '2026-05-09 11:40:00', '2026-05-09 11:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (713, '260509010142', 1, 1, 142, '2026-05-09 11:45:00', '2026-05-09 11:46:00', '2026-05-09 11:50:00', '2026-05-09 11:50:00', 0, 0, 0, 2, NULL, '2026-05-09 11:50:01', '2026-05-09 11:45:00', '2026-05-09 11:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (714, '260509010143', 1, 1, 143, '2026-05-09 11:50:00', '2026-05-09 11:51:00', '2026-05-09 11:55:00', '2026-05-09 11:55:00', 0, 0, 0, 2, NULL, '2026-05-09 11:55:00', '2026-05-09 11:50:00', '2026-05-09 11:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (715, '260509010144', 1, 1, 144, '2026-05-09 11:55:00', '2026-05-09 11:56:00', '2026-05-09 12:00:00', '2026-05-09 12:00:00', 0, 0, 0, 0, NULL, NULL, '2026-05-09 11:55:00', '2026-05-09 11:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (716, '260509010146', 1, 1, 146, '2026-05-09 12:05:00', '2026-05-09 12:06:00', '2026-05-09 12:10:00', '2026-05-09 12:10:00', 0, 0, 0, 2, NULL, '2026-05-09 12:10:00', '2026-05-09 12:05:00', '2026-05-09 12:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (717, '260509010147', 1, 1, 147, '2026-05-09 12:10:00', '2026-05-09 12:11:00', '2026-05-09 12:15:00', '2026-05-09 12:15:00', 1, 0, 3, 2, NULL, '2026-05-09 12:15:02', '2026-05-09 12:10:00', '2026-05-09 12:15:02');
INSERT INTO `ddz_arena_periods_202605` VALUES (718, '260509010148', 1, 1, 148, '2026-05-09 12:15:00', '2026-05-09 12:16:00', '2026-05-09 12:20:00', '2026-05-09 12:20:00', 0, 0, 0, 2, NULL, '2026-05-09 12:20:01', '2026-05-09 12:15:02', '2026-05-09 12:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (719, '260509010149', 1, 1, 149, '2026-05-09 12:20:00', '2026-05-09 12:21:00', '2026-05-09 12:25:00', '2026-05-09 12:25:00', 0, 0, 0, 2, NULL, '2026-05-09 12:25:00', '2026-05-09 12:20:00', '2026-05-09 12:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (720, '260509010150', 1, 1, 150, '2026-05-09 12:25:00', '2026-05-09 12:26:00', '2026-05-09 12:30:00', '2026-05-09 12:30:00', 1, 0, 3, 2, NULL, '2026-05-09 12:30:01', '2026-05-09 12:25:00', '2026-05-09 12:30:01');
INSERT INTO `ddz_arena_periods_202605` VALUES (721, '260509010151', 1, 1, 151, '2026-05-09 12:30:00', '2026-05-09 12:31:00', '2026-05-09 12:35:00', '2026-05-09 12:35:00', 0, 0, 0, 1, NULL, NULL, '2026-05-09 12:30:01', '2026-05-09 12:31:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (722, '260509010153', 1, 1, 153, '2026-05-09 12:40:00', '2026-05-09 12:41:00', '2026-05-09 12:45:00', '2026-05-09 12:45:00', 0, 0, 0, 2, NULL, '2026-05-09 12:45:00', '2026-05-09 12:40:00', '2026-05-09 12:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (723, '260509010154', 1, 1, 154, '2026-05-09 12:45:00', '2026-05-09 12:46:00', '2026-05-09 12:50:00', '2026-05-09 12:50:00', 0, 0, 0, 2, NULL, '2026-05-09 12:50:01', '2026-05-09 12:45:00', '2026-05-09 12:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (724, '260509010155', 1, 1, 155, '2026-05-09 12:50:00', '2026-05-09 12:51:00', '2026-05-09 12:55:00', '2026-05-09 12:55:00', 0, 0, 0, 2, NULL, '2026-05-09 12:55:00', '2026-05-09 12:50:00', '2026-05-09 12:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (725, '260509010156', 1, 1, 156, '2026-05-09 12:55:00', '2026-05-09 12:56:00', '2026-05-09 13:00:00', '2026-05-09 13:00:00', 0, 0, 0, 2, NULL, '2026-05-09 13:00:00', '2026-05-09 12:55:00', '2026-05-09 13:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (726, '260509010157', 1, 1, 157, '2026-05-09 13:00:00', '2026-05-09 13:01:00', '2026-05-09 13:05:00', '2026-05-09 13:05:00', 0, 0, 0, 2, NULL, '2026-05-09 13:05:01', '2026-05-09 13:00:00', '2026-05-09 13:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (727, '260509010158', 1, 1, 158, '2026-05-09 13:05:00', '2026-05-09 13:06:00', '2026-05-09 13:10:00', '2026-05-09 13:10:00', 0, 0, 0, 2, NULL, '2026-05-09 13:10:01', '2026-05-09 13:05:00', '2026-05-09 13:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (728, '260509010159', 1, 1, 159, '2026-05-09 13:10:00', '2026-05-09 13:11:00', '2026-05-09 13:15:00', '2026-05-09 13:15:00', 0, 0, 0, 2, NULL, '2026-05-09 13:15:00', '2026-05-09 13:10:00', '2026-05-09 13:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (729, '260509010160', 1, 1, 160, '2026-05-09 13:15:00', '2026-05-09 13:16:00', '2026-05-09 13:20:00', '2026-05-09 13:20:00', 0, 0, 0, 1, NULL, NULL, '2026-05-09 13:15:00', '2026-05-09 13:16:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (730, '260509010163', 1, 1, 163, '2026-05-09 13:30:00', '2026-05-09 13:31:00', '2026-05-09 13:35:00', '2026-05-09 13:35:00', 0, 0, 0, 2, NULL, '2026-05-09 13:35:01', '2026-05-09 13:30:00', '2026-05-09 13:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (731, '260509010164', 1, 1, 164, '2026-05-09 13:35:00', '2026-05-09 13:36:00', '2026-05-09 13:40:00', '2026-05-09 13:40:00', 1, 0, 3, 2, NULL, '2026-05-09 13:40:00', '2026-05-09 13:35:00', '2026-05-09 13:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (732, '260509010165', 1, 1, 165, '2026-05-09 13:40:00', '2026-05-09 13:41:00', '2026-05-09 13:45:00', '2026-05-09 13:45:00', 0, 0, 0, 2, NULL, '2026-05-09 13:45:00', '2026-05-09 13:40:00', '2026-05-09 13:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (733, '260509010166', 1, 1, 166, '2026-05-09 13:45:00', '2026-05-09 13:46:00', '2026-05-09 13:50:00', '2026-05-09 13:50:00', 0, 0, 0, 2, NULL, '2026-05-09 13:50:01', '2026-05-09 13:45:00', '2026-05-09 13:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (734, '260509010167', 1, 1, 167, '2026-05-09 13:50:00', '2026-05-09 13:51:00', '2026-05-09 13:55:00', '2026-05-09 13:55:00', 0, 0, 0, 2, NULL, '2026-05-09 13:55:00', '2026-05-09 13:50:00', '2026-05-09 13:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (735, '260509010168', 1, 1, 168, '2026-05-09 13:55:00', '2026-05-09 13:56:00', '2026-05-09 14:00:00', '2026-05-09 14:00:00', 0, 0, 0, 2, NULL, '2026-05-09 14:00:00', '2026-05-09 13:55:00', '2026-05-09 14:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (736, '260509010169', 1, 1, 169, '2026-05-09 14:00:00', '2026-05-09 14:01:00', '2026-05-09 14:05:00', '2026-05-09 14:05:00', 0, 0, 0, 2, NULL, '2026-05-09 14:05:00', '2026-05-09 14:00:00', '2026-05-09 14:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (737, '260509010170', 1, 1, 170, '2026-05-09 14:05:00', '2026-05-09 14:06:00', '2026-05-09 14:10:00', '2026-05-09 14:10:00', 0, 0, 0, 2, NULL, '2026-05-09 14:10:00', '2026-05-09 14:05:00', '2026-05-09 14:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (738, '260509010171', 1, 1, 171, '2026-05-09 14:10:00', '2026-05-09 14:11:00', '2026-05-09 14:15:00', '2026-05-09 14:15:00', 0, 0, 0, 2, NULL, '2026-05-09 14:15:00', '2026-05-09 14:10:00', '2026-05-09 14:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (739, '260509010172', 1, 1, 172, '2026-05-09 14:15:00', '2026-05-09 14:16:00', '2026-05-09 14:20:00', '2026-05-09 14:20:00', 0, 0, 0, 2, NULL, '2026-05-09 14:20:00', '2026-05-09 14:15:00', '2026-05-09 14:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (740, '260509010173', 1, 1, 173, '2026-05-09 14:20:00', '2026-05-09 14:21:00', '2026-05-09 14:25:00', '2026-05-09 14:25:00', 0, 0, 0, 2, NULL, '2026-05-09 14:25:01', '2026-05-09 14:20:00', '2026-05-09 14:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (741, '260509010174', 1, 1, 174, '2026-05-09 14:25:00', '2026-05-09 14:26:00', '2026-05-09 14:30:00', '2026-05-09 14:30:00', 0, 0, 0, 2, NULL, '2026-05-09 14:30:00', '2026-05-09 14:25:00', '2026-05-09 14:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (742, '260509010175', 1, 1, 175, '2026-05-09 14:30:00', '2026-05-09 14:31:00', '2026-05-09 14:35:00', '2026-05-09 14:35:00', 0, 0, 0, 2, NULL, '2026-05-09 14:35:00', '2026-05-09 14:30:00', '2026-05-09 14:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (743, '260509010176', 1, 1, 176, '2026-05-09 14:35:00', '2026-05-09 14:36:00', '2026-05-09 14:40:00', '2026-05-09 14:40:00', 0, 0, 0, 2, NULL, '2026-05-09 14:40:00', '2026-05-09 14:35:00', '2026-05-09 14:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (744, '260509010177', 1, 1, 177, '2026-05-09 14:40:00', '2026-05-09 14:41:00', '2026-05-09 14:45:00', '2026-05-09 14:45:00', 0, 0, 0, 2, NULL, '2026-05-09 14:45:00', '2026-05-09 14:40:00', '2026-05-09 14:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (745, '260509010178', 1, 1, 178, '2026-05-09 14:45:00', '2026-05-09 14:46:00', '2026-05-09 14:50:00', '2026-05-09 14:50:00', 0, 0, 0, 2, NULL, '2026-05-09 14:50:00', '2026-05-09 14:45:00', '2026-05-09 14:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (746, '260509010179', 1, 1, 179, '2026-05-09 14:50:00', '2026-05-09 14:51:00', '2026-05-09 14:55:00', '2026-05-09 14:55:00', 0, 0, 0, 2, NULL, '2026-05-09 14:55:00', '2026-05-09 14:50:00', '2026-05-09 14:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (747, '260509010180', 1, 1, 180, '2026-05-09 14:55:00', '2026-05-09 14:56:00', '2026-05-09 15:00:00', '2026-05-09 15:00:00', 0, 0, 0, 2, NULL, '2026-05-09 15:00:00', '2026-05-09 14:55:00', '2026-05-09 15:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (748, '260509010181', 1, 1, 181, '2026-05-09 15:00:00', '2026-05-09 15:01:00', '2026-05-09 15:05:00', '2026-05-09 15:05:00', 0, 0, 0, 2, NULL, '2026-05-09 15:05:00', '2026-05-09 15:00:00', '2026-05-09 15:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (749, '260509010182', 1, 1, 182, '2026-05-09 15:05:00', '2026-05-09 15:06:00', '2026-05-09 15:10:00', '2026-05-09 15:10:00', 0, 0, 0, 2, NULL, '2026-05-09 15:10:01', '2026-05-09 15:05:00', '2026-05-09 15:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (750, '260509010183', 1, 1, 183, '2026-05-09 15:10:00', '2026-05-09 15:11:00', '2026-05-09 15:15:00', '2026-05-09 15:15:00', 0, 0, 0, 2, NULL, '2026-05-09 15:15:00', '2026-05-09 15:10:00', '2026-05-09 15:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (751, '260509010184', 1, 1, 184, '2026-05-09 15:15:00', '2026-05-09 15:16:00', '2026-05-09 15:20:00', '2026-05-09 15:20:00', 0, 0, 0, 2, NULL, '2026-05-09 15:20:00', '2026-05-09 15:15:00', '2026-05-09 15:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (752, '260509010185', 1, 1, 185, '2026-05-09 15:20:00', '2026-05-09 15:21:00', '2026-05-09 15:25:00', '2026-05-09 15:25:00', 0, 0, 0, 2, NULL, '2026-05-09 15:25:01', '2026-05-09 15:20:00', '2026-05-09 15:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (753, '260509010186', 1, 1, 186, '2026-05-09 15:25:00', '2026-05-09 15:26:00', '2026-05-09 15:30:00', '2026-05-09 15:30:00', 0, 0, 0, 2, NULL, '2026-05-09 15:30:01', '2026-05-09 15:25:00', '2026-05-09 15:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (754, '260509010187', 1, 1, 187, '2026-05-09 15:30:00', '2026-05-09 15:31:00', '2026-05-09 15:35:00', '2026-05-09 15:35:00', 0, 0, 0, 2, NULL, '2026-05-09 15:35:00', '2026-05-09 15:30:00', '2026-05-09 15:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (755, '260509010188', 1, 1, 188, '2026-05-09 15:35:00', '2026-05-09 15:36:00', '2026-05-09 15:40:00', '2026-05-09 15:40:00', 0, 0, 0, 2, NULL, '2026-05-09 15:40:01', '2026-05-09 15:35:00', '2026-05-09 15:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (756, '260509010189', 1, 1, 189, '2026-05-09 15:40:00', '2026-05-09 15:41:00', '2026-05-09 15:45:00', '2026-05-09 15:45:00', 0, 0, 0, 2, NULL, '2026-05-09 15:45:00', '2026-05-09 15:40:00', '2026-05-09 15:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (757, '260509010190', 1, 1, 190, '2026-05-09 15:45:00', '2026-05-09 15:46:00', '2026-05-09 15:50:00', '2026-05-09 15:50:00', 0, 0, 0, 2, NULL, '2026-05-09 15:50:01', '2026-05-09 15:45:00', '2026-05-09 15:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (758, '260509010191', 1, 1, 191, '2026-05-09 15:50:00', '2026-05-09 15:51:00', '2026-05-09 15:55:00', '2026-05-09 15:55:00', 0, 0, 0, 2, NULL, '2026-05-09 15:55:01', '2026-05-09 15:50:00', '2026-05-09 15:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (759, '260509010192', 1, 1, 192, '2026-05-09 15:55:00', '2026-05-09 15:56:00', '2026-05-09 16:00:00', '2026-05-09 16:00:00', 0, 0, 0, 2, NULL, '2026-05-09 16:00:01', '2026-05-09 15:55:00', '2026-05-09 16:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (760, '260509010193', 1, 1, 193, '2026-05-09 16:00:00', '2026-05-09 16:01:00', '2026-05-09 16:05:00', '2026-05-09 16:05:00', 0, 0, 0, 2, NULL, '2026-05-09 16:05:01', '2026-05-09 16:00:00', '2026-05-09 16:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (761, '260509010194', 1, 1, 194, '2026-05-09 16:05:00', '2026-05-09 16:06:00', '2026-05-09 16:10:00', '2026-05-09 16:10:00', 0, 0, 0, 2, NULL, '2026-05-09 16:10:01', '2026-05-09 16:05:00', '2026-05-09 16:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (762, '260509010195', 1, 1, 195, '2026-05-09 16:10:00', '2026-05-09 16:11:00', '2026-05-09 16:15:00', '2026-05-09 16:15:00', 0, 0, 0, 2, NULL, '2026-05-09 16:15:01', '2026-05-09 16:10:00', '2026-05-09 16:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (763, '260509010196', 1, 1, 196, '2026-05-09 16:15:00', '2026-05-09 16:16:00', '2026-05-09 16:20:00', '2026-05-09 16:20:00', 0, 0, 0, 2, NULL, '2026-05-09 16:20:00', '2026-05-09 16:15:00', '2026-05-09 16:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (764, '260509010197', 1, 1, 197, '2026-05-09 16:20:00', '2026-05-09 16:21:00', '2026-05-09 16:25:00', '2026-05-09 16:25:00', 0, 0, 0, 2, NULL, '2026-05-09 16:25:01', '2026-05-09 16:20:00', '2026-05-09 16:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (765, '260509010198', 1, 1, 198, '2026-05-09 16:25:00', '2026-05-09 16:26:00', '2026-05-09 16:30:00', '2026-05-09 16:30:00', 0, 0, 0, 2, NULL, '2026-05-09 16:30:01', '2026-05-09 16:25:00', '2026-05-09 16:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (766, '260509010199', 1, 1, 199, '2026-05-09 16:30:00', '2026-05-09 16:31:00', '2026-05-09 16:35:00', '2026-05-09 16:35:00', 0, 0, 0, 2, NULL, '2026-05-09 16:35:00', '2026-05-09 16:30:00', '2026-05-09 16:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (767, '260509010200', 1, 1, 200, '2026-05-09 16:35:00', '2026-05-09 16:36:00', '2026-05-09 16:40:00', '2026-05-09 16:40:00', 0, 0, 0, 2, NULL, '2026-05-09 16:40:01', '2026-05-09 16:35:00', '2026-05-09 16:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (768, '260509010201', 1, 1, 201, '2026-05-09 16:40:00', '2026-05-09 16:41:00', '2026-05-09 16:45:00', '2026-05-09 16:45:00', 0, 0, 0, 2, NULL, '2026-05-09 16:45:01', '2026-05-09 16:40:00', '2026-05-09 16:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (769, '260509010202', 1, 1, 202, '2026-05-09 16:45:00', '2026-05-09 16:46:00', '2026-05-09 16:50:00', '2026-05-09 16:50:00', 0, 0, 0, 2, NULL, '2026-05-09 16:50:00', '2026-05-09 16:45:00', '2026-05-09 16:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (770, '260509010203', 1, 1, 203, '2026-05-09 16:50:00', '2026-05-09 16:51:00', '2026-05-09 16:55:00', '2026-05-09 16:55:00', 0, 0, 0, 2, NULL, '2026-05-09 16:55:00', '2026-05-09 16:50:00', '2026-05-09 16:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (771, '260509010204', 1, 1, 204, '2026-05-09 16:55:00', '2026-05-09 16:56:00', '2026-05-09 17:00:00', '2026-05-09 17:00:00', 0, 0, 0, 2, NULL, '2026-05-09 17:00:00', '2026-05-09 16:55:00', '2026-05-09 17:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (772, '260509010205', 1, 1, 205, '2026-05-09 17:00:00', '2026-05-09 17:01:00', '2026-05-09 17:05:00', '2026-05-09 17:05:00', 0, 0, 0, 2, NULL, '2026-05-09 17:05:00', '2026-05-09 17:00:00', '2026-05-09 17:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (773, '260509030001', 3, 3, 1, '2026-05-09 17:00:00', '2026-05-09 17:01:00', '2026-05-09 17:30:00', '2026-05-09 17:05:00', 0, 0, 0, 2, NULL, '2026-05-09 17:30:01', '2026-05-09 17:00:00', '2026-05-09 17:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (774, '260509020001', 2, 2, 1, '2026-05-09 17:00:00', '2026-05-09 17:01:00', '2026-05-09 17:10:00', '2026-05-09 17:05:00', 0, 0, 0, 2, NULL, '2026-05-09 17:10:00', '2026-05-09 17:00:00', '2026-05-09 17:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (775, '260509010206', 1, 1, 206, '2026-05-09 17:05:00', '2026-05-09 17:06:00', '2026-05-09 17:10:00', '2026-05-09 17:10:00', 0, 0, 0, 2, NULL, '2026-05-09 17:10:00', '2026-05-09 17:05:00', '2026-05-09 17:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (776, '260509010207', 1, 1, 207, '2026-05-09 17:10:00', '2026-05-09 17:11:00', '2026-05-09 17:15:00', '2026-05-09 17:15:00', 0, 0, 0, 2, NULL, '2026-05-09 17:15:01', '2026-05-09 17:10:00', '2026-05-09 17:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (777, '260509020002', 2, 2, 2, '2026-05-09 17:10:00', '2026-05-09 17:11:00', '2026-05-09 17:20:00', '2026-05-09 17:15:00', 0, 0, 0, 2, NULL, '2026-05-09 17:20:00', '2026-05-09 17:10:00', '2026-05-09 17:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (778, '260509010208', 1, 1, 208, '2026-05-09 17:15:00', '2026-05-09 17:16:00', '2026-05-09 17:20:00', '2026-05-09 17:20:00', 0, 0, 0, 2, NULL, '2026-05-09 17:20:00', '2026-05-09 17:15:00', '2026-05-09 17:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (779, '260509010209', 1, 1, 209, '2026-05-09 17:20:00', '2026-05-09 17:21:00', '2026-05-09 17:25:00', '2026-05-09 17:25:00', 1, 0, 3, 2, NULL, '2026-05-09 17:25:00', '2026-05-09 17:20:00', '2026-05-09 17:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (780, '260509020003', 2, 2, 3, '2026-05-09 17:20:00', '2026-05-09 17:21:00', '2026-05-09 17:30:00', '2026-05-09 17:25:00', 0, 0, 0, 2, NULL, '2026-05-09 17:30:01', '2026-05-09 17:20:00', '2026-05-09 17:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (781, '260509010210', 1, 1, 210, '2026-05-09 17:25:00', '2026-05-09 17:26:00', '2026-05-09 17:30:00', '2026-05-09 17:30:00', 0, 0, 0, 2, NULL, '2026-05-09 17:30:01', '2026-05-09 17:25:00', '2026-05-09 17:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (782, '260509010211', 1, 1, 211, '2026-05-09 17:30:00', '2026-05-09 17:31:00', '2026-05-09 17:35:00', '2026-05-09 17:35:00', 0, 0, 0, 2, NULL, '2026-05-09 17:35:00', '2026-05-09 17:30:00', '2026-05-09 17:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (783, '260509020004', 2, 2, 4, '2026-05-09 17:30:00', '2026-05-09 17:31:00', '2026-05-09 17:40:00', '2026-05-09 17:35:00', 0, 0, 0, 2, NULL, '2026-05-09 17:40:00', '2026-05-09 17:30:00', '2026-05-09 17:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (784, '260509030002', 3, 3, 2, '2026-05-09 17:30:00', '2026-05-09 17:31:00', '2026-05-09 18:00:00', '2026-05-09 17:35:00', 0, 0, 0, 2, NULL, '2026-05-09 18:00:01', '2026-05-09 17:30:00', '2026-05-09 18:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (785, '260509010212', 1, 1, 212, '2026-05-09 17:35:00', '2026-05-09 17:36:00', '2026-05-09 17:40:00', '2026-05-09 17:40:00', 1, 0, 3, 2, NULL, '2026-05-09 17:40:00', '2026-05-09 17:35:00', '2026-05-09 17:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (786, '260509010213', 1, 1, 213, '2026-05-09 17:40:00', '2026-05-09 17:41:00', '2026-05-09 17:45:00', '2026-05-09 17:45:00', 0, 0, 0, 2, NULL, '2026-05-09 17:45:01', '2026-05-09 17:40:00', '2026-05-09 17:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (787, '260509020005', 2, 2, 5, '2026-05-09 17:40:00', '2026-05-09 17:41:00', '2026-05-09 17:50:00', '2026-05-09 17:45:00', 0, 0, 0, 2, NULL, '2026-05-09 17:50:00', '2026-05-09 17:40:00', '2026-05-09 17:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (788, '260509010214', 1, 1, 214, '2026-05-09 17:45:00', '2026-05-09 17:46:00', '2026-05-09 17:50:00', '2026-05-09 17:50:00', 0, 0, 0, 2, NULL, '2026-05-09 17:50:00', '2026-05-09 17:45:00', '2026-05-09 17:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (789, '260509010215', 1, 1, 215, '2026-05-09 17:50:00', '2026-05-09 17:51:00', '2026-05-09 17:55:00', '2026-05-09 17:55:00', 0, 0, 0, 2, NULL, '2026-05-09 17:55:01', '2026-05-09 17:50:00', '2026-05-09 17:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (790, '260509020006', 2, 2, 6, '2026-05-09 17:50:00', '2026-05-09 17:51:00', '2026-05-09 18:00:00', '2026-05-09 17:55:00', 0, 0, 0, 2, NULL, '2026-05-09 18:00:01', '2026-05-09 17:50:00', '2026-05-09 18:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (791, '260509010216', 1, 1, 216, '2026-05-09 17:55:00', '2026-05-09 17:56:00', '2026-05-09 18:00:00', '2026-05-09 18:00:00', 0, 0, 0, 2, NULL, '2026-05-09 18:00:01', '2026-05-09 17:55:00', '2026-05-09 18:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (792, '260509010217', 1, 1, 217, '2026-05-09 18:00:00', '2026-05-09 18:01:00', '2026-05-09 18:05:00', '2026-05-09 18:05:00', 0, 0, 0, 2, NULL, '2026-05-09 18:05:01', '2026-05-09 18:00:00', '2026-05-09 18:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (793, '260509020007', 2, 2, 7, '2026-05-09 18:00:00', '2026-05-09 18:01:00', '2026-05-09 18:10:00', '2026-05-09 18:05:00', 0, 0, 0, 2, NULL, '2026-05-09 18:10:00', '2026-05-09 18:00:00', '2026-05-09 18:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (794, '260509030003', 3, 3, 3, '2026-05-09 18:00:00', '2026-05-09 18:01:00', '2026-05-09 18:30:00', '2026-05-09 18:05:00', 0, 0, 0, 2, NULL, '2026-05-09 18:30:01', '2026-05-09 18:00:00', '2026-05-09 18:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (795, '260509010218', 1, 1, 218, '2026-05-09 18:05:00', '2026-05-09 18:06:00', '2026-05-09 18:10:00', '2026-05-09 18:10:00', 0, 0, 0, 2, NULL, '2026-05-09 18:10:00', '2026-05-09 18:05:00', '2026-05-09 18:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (796, '260509010219', 1, 1, 219, '2026-05-09 18:10:00', '2026-05-09 18:11:00', '2026-05-09 18:15:00', '2026-05-09 18:15:00', 0, 0, 0, 1, NULL, '2026-05-09 18:09:59', '2026-05-09 18:10:00', '2026-05-09 18:11:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (797, '260509020008', 2, 2, 8, '2026-05-09 18:10:00', '2026-05-09 18:11:00', '2026-05-09 18:20:00', '2026-05-09 18:15:00', 0, 0, 0, 1, NULL, '2026-05-09 18:09:59', '2026-05-09 18:10:00', '2026-05-09 18:11:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (802, '260509010222', 1, 1, 222, '2026-05-09 18:25:00', '2026-05-09 18:26:00', '2026-05-09 18:30:00', '2026-05-09 18:30:00', 0, 0, 0, 2, NULL, '2026-05-09 18:30:01', '2026-05-09 18:25:00', '2026-05-09 18:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (803, '260509010223', 1, 1, 223, '2026-05-09 18:30:00', '2026-05-09 18:31:00', '2026-05-09 18:35:00', '2026-05-09 18:35:00', 0, 0, 0, 2, NULL, '2026-05-09 18:35:00', '2026-05-09 18:30:00', '2026-05-09 18:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (804, '260509020010', 2, 2, 10, '2026-05-09 18:30:00', '2026-05-09 18:31:00', '2026-05-09 18:40:00', '2026-05-09 18:35:00', 0, 0, 0, 2, NULL, '2026-05-09 18:40:01', '2026-05-09 18:30:00', '2026-05-09 18:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (805, '260509030004', 3, 3, 4, '2026-05-09 18:30:00', '2026-05-09 18:31:00', '2026-05-09 19:00:00', '2026-05-09 18:35:00', 0, 0, 0, 2, NULL, '2026-05-09 19:00:01', '2026-05-09 18:30:00', '2026-05-09 19:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (806, '260509010224', 1, 1, 224, '2026-05-09 18:35:00', '2026-05-09 18:36:00', '2026-05-09 18:40:00', '2026-05-09 18:40:00', 0, 0, 0, 2, NULL, '2026-05-09 18:40:01', '2026-05-09 18:35:00', '2026-05-09 18:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (807, '260509010225', 1, 1, 225, '2026-05-09 18:40:00', '2026-05-09 18:41:00', '2026-05-09 18:45:00', '2026-05-09 18:45:00', 0, 0, 0, 2, NULL, '2026-05-09 18:45:01', '2026-05-09 18:40:00', '2026-05-09 18:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (808, '260509020011', 2, 2, 11, '2026-05-09 18:40:00', '2026-05-09 18:41:00', '2026-05-09 18:50:00', '2026-05-09 18:45:00', 0, 0, 0, 2, NULL, '2026-05-09 18:50:01', '2026-05-09 18:40:00', '2026-05-09 18:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (809, '260509010226', 1, 1, 226, '2026-05-09 18:45:00', '2026-05-09 18:46:00', '2026-05-09 18:50:00', '2026-05-09 18:50:00', 0, 0, 0, 2, NULL, '2026-05-09 18:50:01', '2026-05-09 18:45:00', '2026-05-09 18:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (810, '260509010227', 1, 1, 227, '2026-05-09 18:50:00', '2026-05-09 18:51:00', '2026-05-09 18:55:00', '2026-05-09 18:55:00', 1, 0, 3, 2, NULL, '2026-05-09 18:55:01', '2026-05-09 18:50:00', '2026-05-09 18:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (811, '260509020012', 2, 2, 12, '2026-05-09 18:50:00', '2026-05-09 18:51:00', '2026-05-09 19:00:00', '2026-05-09 18:55:00', 0, 0, 0, 2, NULL, '2026-05-09 19:00:01', '2026-05-09 18:50:00', '2026-05-09 19:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (812, '260509010228', 1, 1, 228, '2026-05-09 18:55:00', '2026-05-09 18:56:00', '2026-05-09 19:00:00', '2026-05-09 19:00:00', 0, 0, 0, 2, NULL, '2026-05-09 19:00:01', '2026-05-09 18:55:00', '2026-05-09 19:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (813, '260509010229', 1, 1, 229, '2026-05-09 19:00:00', '2026-05-09 19:01:00', '2026-05-09 19:05:00', '2026-05-09 19:05:00', 0, 0, 0, 2, NULL, '2026-05-09 19:05:00', '2026-05-09 19:00:00', '2026-05-09 19:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (814, '260509020013', 2, 2, 13, '2026-05-09 19:00:00', '2026-05-09 19:01:00', '2026-05-09 19:10:00', '2026-05-09 19:05:00', 0, 0, 0, 2, NULL, '2026-05-09 19:10:01', '2026-05-09 19:00:00', '2026-05-09 19:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (815, '260509030005', 3, 3, 5, '2026-05-09 19:00:00', '2026-05-09 19:01:00', '2026-05-09 19:30:00', '2026-05-09 19:05:00', 0, 0, 0, 2, NULL, '2026-05-09 19:30:00', '2026-05-09 19:00:00', '2026-05-09 19:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (816, '260509010230', 1, 1, 230, '2026-05-09 19:05:00', '2026-05-09 19:06:00', '2026-05-09 19:10:00', '2026-05-09 19:10:00', 1, 0, 3, 2, NULL, '2026-05-09 19:10:01', '2026-05-09 19:05:00', '2026-05-09 19:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (819, '260509010231', 1, 1, 231, '2026-05-09 19:10:00', '2026-05-09 19:11:00', '2026-05-09 19:15:00', '2026-05-09 19:15:00', 0, 0, 0, 2, NULL, '2026-05-09 19:15:00', '2026-05-09 19:10:00', '2026-05-09 19:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (820, '260509020014', 2, 2, 14, '2026-05-09 19:10:00', '2026-05-09 19:11:00', '2026-05-09 19:20:00', '2026-05-09 19:15:00', 0, 0, 0, 2, NULL, '2026-05-09 19:20:00', '2026-05-09 19:10:00', '2026-05-09 19:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (821, '260509010232', 1, 1, 232, '2026-05-09 19:15:00', '2026-05-09 19:16:00', '2026-05-09 19:20:00', '2026-05-09 19:20:00', 0, 0, 0, 2, NULL, '2026-05-09 19:20:00', '2026-05-09 19:15:00', '2026-05-09 19:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (822, '260509010233', 1, 1, 233, '2026-05-09 19:20:00', '2026-05-09 19:21:00', '2026-05-09 19:25:00', '2026-05-09 19:25:00', 0, 0, 0, 2, NULL, '2026-05-09 19:25:01', '2026-05-09 19:20:00', '2026-05-09 19:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (823, '260509020015', 2, 2, 15, '2026-05-09 19:20:00', '2026-05-09 19:21:00', '2026-05-09 19:30:00', '2026-05-09 19:25:00', 0, 0, 0, 2, NULL, '2026-05-09 19:30:00', '2026-05-09 19:20:00', '2026-05-09 19:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (824, '260509010234', 1, 1, 234, '2026-05-09 19:25:00', '2026-05-09 19:26:00', '2026-05-09 19:30:00', '2026-05-09 19:30:00', 1, 0, 3, 2, NULL, '2026-05-09 19:30:00', '2026-05-09 19:25:00', '2026-05-09 19:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (825, '260509010235', 1, 1, 235, '2026-05-09 19:30:00', '2026-05-09 19:31:00', '2026-05-09 19:35:00', '2026-05-09 19:35:00', 0, 0, 0, 2, NULL, '2026-05-09 19:35:00', '2026-05-09 19:30:00', '2026-05-09 19:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (826, '260509020016', 2, 2, 16, '2026-05-09 19:30:00', '2026-05-09 19:31:00', '2026-05-09 19:40:00', '2026-05-09 19:35:00', 0, 0, 0, 2, NULL, '2026-05-09 19:40:00', '2026-05-09 19:30:00', '2026-05-09 19:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (827, '260509030006', 3, 3, 6, '2026-05-09 19:30:00', '2026-05-09 19:31:00', '2026-05-09 20:00:00', '2026-05-09 19:35:00', 0, 0, 0, 2, NULL, '2026-05-09 20:00:00', '2026-05-09 19:30:00', '2026-05-09 20:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (828, '260509010236', 1, 1, 236, '2026-05-09 19:35:00', '2026-05-09 19:36:00', '2026-05-09 19:40:00', '2026-05-09 19:40:00', 0, 0, 0, 2, NULL, '2026-05-09 19:40:00', '2026-05-09 19:35:00', '2026-05-09 19:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (829, '260509010237', 1, 1, 237, '2026-05-09 19:40:00', '2026-05-09 19:41:00', '2026-05-09 19:45:00', '2026-05-09 19:45:00', 0, 0, 0, 2, NULL, '2026-05-09 19:45:01', '2026-05-09 19:40:00', '2026-05-09 19:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (830, '260509020017', 2, 2, 17, '2026-05-09 19:40:00', '2026-05-09 19:41:00', '2026-05-09 19:50:00', '2026-05-09 19:45:00', 0, 0, 0, 2, NULL, '2026-05-09 19:50:00', '2026-05-09 19:40:00', '2026-05-09 19:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (831, '260509010238', 1, 1, 238, '2026-05-09 19:45:00', '2026-05-09 19:46:00', '2026-05-09 19:50:00', '2026-05-09 19:50:00', 0, 0, 0, 2, NULL, '2026-05-09 19:50:00', '2026-05-09 19:45:00', '2026-05-09 19:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (832, '260509010239', 1, 1, 239, '2026-05-09 19:50:00', '2026-05-09 19:51:00', '2026-05-09 19:55:00', '2026-05-09 19:55:00', 0, 0, 0, 2, NULL, '2026-05-09 19:55:01', '2026-05-09 19:50:00', '2026-05-09 19:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (833, '260509020018', 2, 2, 18, '2026-05-09 19:50:00', '2026-05-09 19:51:00', '2026-05-09 20:00:00', '2026-05-09 19:55:00', 0, 0, 0, 2, NULL, '2026-05-09 20:00:00', '2026-05-09 19:50:00', '2026-05-09 20:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (834, '260509010240', 1, 1, 240, '2026-05-09 19:55:00', '2026-05-09 19:56:00', '2026-05-09 20:00:00', '2026-05-09 20:00:00', 0, 0, 0, 2, NULL, '2026-05-09 20:00:00', '2026-05-09 19:55:00', '2026-05-09 20:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (835, '260509010241', 1, 1, 241, '2026-05-09 20:00:00', '2026-05-09 20:01:00', '2026-05-09 20:05:00', '2026-05-09 20:05:00', 0, 0, 0, 2, NULL, '2026-05-09 20:05:00', '2026-05-09 20:00:00', '2026-05-09 20:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (836, '260509020019', 2, 2, 19, '2026-05-09 20:00:00', '2026-05-09 20:01:00', '2026-05-09 20:10:00', '2026-05-09 20:05:00', 0, 0, 0, 2, NULL, '2026-05-09 20:10:01', '2026-05-09 20:00:00', '2026-05-09 20:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (837, '260509030007', 3, 3, 7, '2026-05-09 20:00:00', '2026-05-09 20:01:00', '2026-05-09 20:30:00', '2026-05-09 20:05:00', 0, 0, 0, 2, NULL, '2026-05-09 20:30:00', '2026-05-09 20:00:00', '2026-05-09 20:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (838, '260509010242', 1, 1, 242, '2026-05-09 20:05:00', '2026-05-09 20:06:00', '2026-05-09 20:10:00', '2026-05-09 20:10:00', 0, 0, 0, 2, NULL, '2026-05-09 20:10:01', '2026-05-09 20:05:00', '2026-05-09 20:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (839, '260509010243', 1, 1, 243, '2026-05-09 20:10:00', '2026-05-09 20:11:00', '2026-05-09 20:15:00', '2026-05-09 20:15:00', 0, 0, 0, 2, NULL, '2026-05-09 20:15:00', '2026-05-09 20:10:00', '2026-05-09 20:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (840, '260509020020', 2, 2, 20, '2026-05-09 20:10:00', '2026-05-09 20:11:00', '2026-05-09 20:20:00', '2026-05-09 20:15:00', 0, 0, 0, 2, NULL, '2026-05-09 20:20:00', '2026-05-09 20:10:00', '2026-05-09 20:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (841, '260509010244', 1, 1, 244, '2026-05-09 20:15:00', '2026-05-09 20:16:00', '2026-05-09 20:20:00', '2026-05-09 20:20:00', 0, 0, 0, 2, NULL, '2026-05-09 20:20:00', '2026-05-09 20:15:00', '2026-05-09 20:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (842, '260509010245', 1, 1, 245, '2026-05-09 20:20:00', '2026-05-09 20:21:00', '2026-05-09 20:25:00', '2026-05-09 20:25:00', 0, 0, 0, 2, NULL, '2026-05-09 20:25:00', '2026-05-09 20:20:00', '2026-05-09 20:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (843, '260509020021', 2, 2, 21, '2026-05-09 20:20:00', '2026-05-09 20:21:00', '2026-05-09 20:30:00', '2026-05-09 20:25:00', 0, 0, 0, 2, NULL, '2026-05-09 20:30:00', '2026-05-09 20:20:00', '2026-05-09 20:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (844, '260509010246', 1, 1, 246, '2026-05-09 20:25:00', '2026-05-09 20:26:00', '2026-05-09 20:30:00', '2026-05-09 20:30:00', 0, 0, 0, 2, NULL, '2026-05-09 20:30:00', '2026-05-09 20:25:00', '2026-05-09 20:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (845, '260509010247', 1, 1, 247, '2026-05-09 20:30:00', '2026-05-09 20:31:00', '2026-05-09 20:35:00', '2026-05-09 20:35:00', 0, 0, 0, 2, NULL, '2026-05-09 20:35:01', '2026-05-09 20:30:00', '2026-05-09 20:35:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (846, '260509020022', 2, 2, 22, '2026-05-09 20:30:00', '2026-05-09 20:31:00', '2026-05-09 20:40:00', '2026-05-09 20:35:00', 0, 0, 0, 2, NULL, '2026-05-09 20:40:00', '2026-05-09 20:30:00', '2026-05-09 20:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (847, '260509030008', 3, 3, 8, '2026-05-09 20:30:00', '2026-05-09 20:31:00', '2026-05-09 21:00:00', '2026-05-09 20:35:00', 0, 0, 0, 1, NULL, NULL, '2026-05-09 20:30:00', '2026-05-09 20:31:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (848, '260509010248', 1, 1, 248, '2026-05-09 20:35:00', '2026-05-09 20:36:00', '2026-05-09 20:40:00', '2026-05-09 20:40:00', 0, 0, 0, 2, NULL, '2026-05-09 20:40:00', '2026-05-09 20:35:00', '2026-05-09 20:40:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (849, '260509010249', 1, 1, 249, '2026-05-09 20:40:00', '2026-05-09 20:41:00', '2026-05-09 20:45:00', '2026-05-09 20:45:00', 0, 0, 0, 2, NULL, '2026-05-09 20:45:01', '2026-05-09 20:40:00', '2026-05-09 20:45:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (850, '260509020023', 2, 2, 23, '2026-05-09 20:40:00', '2026-05-09 20:41:00', '2026-05-09 20:50:00', '2026-05-09 20:45:00', 0, 0, 0, 2, NULL, '2026-05-09 20:50:01', '2026-05-09 20:40:00', '2026-05-09 20:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (851, '260509010250', 1, 1, 250, '2026-05-09 20:45:00', '2026-05-09 20:46:00', '2026-05-09 20:50:00', '2026-05-09 20:50:00', 0, 0, 0, 2, NULL, '2026-05-09 20:50:01', '2026-05-09 20:45:00', '2026-05-09 20:50:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (852, '260509010251', 1, 1, 251, '2026-05-09 20:50:00', '2026-05-09 20:51:00', '2026-05-09 20:55:00', '2026-05-09 20:55:00', 0, 0, 0, 2, NULL, '2026-05-09 20:55:01', '2026-05-09 20:50:00', '2026-05-09 20:55:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (853, '260509020024', 2, 2, 24, '2026-05-09 20:50:00', '2026-05-09 20:51:00', '2026-05-09 21:00:00', '2026-05-09 20:55:00', 0, 0, 0, 2, NULL, '2026-05-09 21:00:00', '2026-05-09 20:50:00', '2026-05-09 21:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (854, '260509010252', 1, 1, 252, '2026-05-09 20:55:00', '2026-05-09 20:56:00', '2026-05-09 21:00:00', '2026-05-09 21:00:00', 0, 0, 0, 2, NULL, '2026-05-09 21:00:00', '2026-05-09 20:55:00', '2026-05-09 21:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (855, '260509010253', 1, 1, 253, '2026-05-09 21:00:00', '2026-05-09 21:01:00', '2026-05-09 21:05:00', '2026-05-09 21:05:00', 0, 0, 0, 2, NULL, '2026-05-09 21:05:01', '2026-05-09 21:00:00', '2026-05-09 21:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (856, '260509020025', 2, 2, 25, '2026-05-09 21:00:00', '2026-05-09 21:01:00', '2026-05-09 21:10:00', '2026-05-09 21:05:00', 0, 0, 0, 2, NULL, '2026-05-09 21:10:00', '2026-05-09 21:00:00', '2026-05-09 21:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (857, '260509010254', 1, 1, 254, '2026-05-09 21:05:00', '2026-05-09 21:06:00', '2026-05-09 21:10:00', '2026-05-09 21:10:00', 0, 0, 0, 2, NULL, '2026-05-09 21:10:00', '2026-05-09 21:05:00', '2026-05-09 21:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (858, '260509010255', 1, 1, 255, '2026-05-09 21:10:00', '2026-05-09 21:11:00', '2026-05-09 21:15:00', '2026-05-09 21:15:00', 0, 0, 0, 2, NULL, '2026-05-09 21:15:01', '2026-05-09 21:10:00', '2026-05-09 21:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (859, '260509020026', 2, 2, 26, '2026-05-09 21:10:00', '2026-05-09 21:11:00', '2026-05-09 21:20:00', '2026-05-09 21:15:00', 0, 0, 0, 2, NULL, '2026-05-09 21:20:00', '2026-05-09 21:10:00', '2026-05-09 21:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (864, '260509010256', 1, 1, 256, '2026-05-09 21:15:00', '2026-05-09 21:16:00', '2026-05-09 21:20:00', '2026-05-09 21:20:00', 0, 0, 0, 2, NULL, '2026-05-09 21:20:00', '2026-05-09 21:15:00', '2026-05-09 21:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (865, '260509010257', 1, 1, 257, '2026-05-09 21:20:00', '2026-05-09 21:21:00', '2026-05-09 21:25:00', '2026-05-09 21:25:00', 0, 0, 0, 2, NULL, '2026-05-09 21:25:01', '2026-05-09 21:20:00', '2026-05-09 21:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (866, '260509020027', 2, 2, 27, '2026-05-09 21:20:00', '2026-05-09 21:21:00', '2026-05-09 21:30:00', '2026-05-09 21:25:00', 0, 0, 0, 2, NULL, '2026-05-09 21:30:00', '2026-05-09 21:20:00', '2026-05-09 21:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (867, '260509010258', 1, 1, 258, '2026-05-09 21:25:00', '2026-05-09 21:26:00', '2026-05-09 21:30:00', '2026-05-09 21:30:00', 0, 0, 0, 2, NULL, '2026-05-09 21:30:00', '2026-05-09 21:25:00', '2026-05-09 21:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (868, '260509010259', 1, 1, 259, '2026-05-09 21:30:00', '2026-05-09 21:31:00', '2026-05-09 21:35:00', '2026-05-09 21:35:00', 0, 0, 0, 0, NULL, NULL, '2026-05-09 21:30:00', '2026-05-09 21:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (869, '260509020028', 2, 2, 28, '2026-05-09 21:30:00', '2026-05-09 21:31:00', '2026-05-09 21:40:00', '2026-05-09 21:35:00', 0, 0, 0, 0, NULL, NULL, '2026-05-09 21:30:00', '2026-05-09 21:30:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (870, '260509010264', 1, 1, 264, '2026-05-09 21:55:00', '2026-05-09 21:56:00', '2026-05-09 22:00:00', '2026-05-09 22:00:00', 0, 0, 0, 2, NULL, '2026-05-09 22:00:00', '2026-05-09 21:55:00', '2026-05-09 22:00:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (871, '260509010265', 1, 1, 265, '2026-05-09 22:00:00', '2026-05-09 22:01:00', '2026-05-09 22:05:00', '2026-05-09 22:05:00', 0, 0, 0, 2, NULL, '2026-05-09 22:05:01', '2026-05-09 22:00:00', '2026-05-09 22:05:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (872, '260509020031', 2, 2, 31, '2026-05-09 22:00:00', '2026-05-09 22:01:00', '2026-05-09 22:10:00', '2026-05-09 22:05:00', 0, 0, 0, 2, NULL, '2026-05-09 22:10:00', '2026-05-09 22:00:00', '2026-05-09 22:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (873, '260509010266', 1, 1, 266, '2026-05-09 22:05:00', '2026-05-09 22:06:00', '2026-05-09 22:10:00', '2026-05-09 22:10:00', 0, 0, 0, 2, NULL, '2026-05-09 22:10:00', '2026-05-09 22:05:00', '2026-05-09 22:10:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (874, '260509010267', 1, 1, 267, '2026-05-09 22:10:00', '2026-05-09 22:11:00', '2026-05-09 22:15:00', '2026-05-09 22:15:00', 0, 0, 0, 2, NULL, '2026-05-09 22:15:01', '2026-05-09 22:10:00', '2026-05-09 22:15:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (875, '260509020032', 2, 2, 32, '2026-05-09 22:10:00', '2026-05-09 22:11:00', '2026-05-09 22:20:00', '2026-05-09 22:15:00', 0, 0, 0, 2, NULL, '2026-05-09 22:20:01', '2026-05-09 22:10:00', '2026-05-09 22:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (876, '260509010268', 1, 1, 268, '2026-05-09 22:15:00', '2026-05-09 22:16:00', '2026-05-09 22:20:00', '2026-05-09 22:20:00', 0, 0, 0, 2, NULL, '2026-05-09 22:20:01', '2026-05-09 22:15:00', '2026-05-09 22:20:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (877, '260509010269', 1, 1, 269, '2026-05-09 22:20:00', '2026-05-09 22:21:00', '2026-05-09 22:25:00', '2026-05-09 22:25:00', 1, 1, 0, 2, NULL, '2026-05-09 22:25:01', '2026-05-09 22:20:00', '2026-05-09 22:25:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (878, '260509020033', 2, 2, 33, '2026-05-09 22:20:00', '2026-05-09 22:21:00', '2026-05-09 22:30:00', '2026-05-09 22:25:00', 0, 0, 0, 1, NULL, NULL, '2026-05-09 22:20:00', '2026-05-09 22:21:00');
INSERT INTO `ddz_arena_periods_202605` VALUES (879, '260509010270', 1, 1, 270, '2026-05-09 22:25:00', '2026-05-09 22:26:00', '2026-05-09 22:30:00', '2026-05-09 22:30:00', 0, 0, 0, 1, NULL, NULL, '2026-05-09 22:25:00', '2026-05-09 22:26:00');

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
  `elimination_rules` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '[60,30,18,9,3]' COMMENT '淘汰规则JSON数组',
  `current_elimination_idx` int NOT NULL DEFAULT 0 COMMENT '当前淘汰规则索引',
  `tournament_stage` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'SIGNUP' COMMENT '赛事阶段',
  `rank_wait_until` datetime NULL DEFAULT NULL COMMENT '排行榜阶段等待截止时间',
  `tables_completed` int NOT NULL DEFAULT 0 COMMENT '本轮已完成的桌数',
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
) ENGINE = InnoDB AUTO_INCREMENT = 99 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '竞技场报名日志表(月份分表)' ROW_FORMAT = Dynamic;

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
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (48, '260508010100', 534, 1, 4, 1, 100, 300, 200, '', '2026-05-08 08:19:20');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (49, '260508010104', 0, 1, 4, 1, 100, 200, 100, '', '2026-05-08 08:39:10');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (50, '260508010109', 542, 1, 4, 1, 100, 100, 0, '', '2026-05-08 09:04:03');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (51, '260508010109', 542, 1, 4, 2, 100, 0, 100, '', '2026-05-08 09:04:08');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (52, '260508010109', 542, 1, 4, 1, 100, 100, 0, '', '2026-05-08 09:04:16');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (53, '260508010133', 565, 1, 4, 1, 100, 10000, 9900, '', '2026-05-08 11:01:46');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (54, '260508010139', 0, 1, 4, 1, 100, 9900, 9800, '', '2026-05-08 11:34:34');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (55, '260508010144', 574, 1, 4, 1, 100, 9800, 9700, '', '2026-05-08 11:56:00');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (56, '260508010149', 579, 1, 4, 1, 100, 9700, 9600, '', '2026-05-08 12:23:07');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (57, '260508010162', 0, 1, 4, 1, 100, 9600, 9500, '', '2026-05-08 13:26:11');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (58, '260508010163', 583, 1, 4, 1, 100, 9500, 9400, '', '2026-05-08 13:31:04');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (59, '260508010165', 585, 1, 4, 1, 100, 9400, 9300, '', '2026-05-08 13:44:37');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (60, '260508010168', 587, 1, 4, 1, 100, 9300, 9200, '', '2026-05-08 13:56:40');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (61, '260508010171', 590, 1, 4, 1, 100, 9200, 9100, '', '2026-05-08 14:12:42');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (62, '260508010177', 0, 1, 4, 1, 100, 9100, 9000, '', '2026-05-08 14:42:33');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (63, '260508010179', 596, 1, 4, 1, 100, 9000, 8900, '', '2026-05-08 14:52:28');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (64, '260508010180', 597, 1, 4, 1, 100, 8900, 8800, '', '2026-05-08 14:56:01');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (65, '260508010182', 0, 1, 4, 1, 100, 8800, 8700, '', '2026-05-08 15:06:20');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (66, '260508010187', 603, 1, 4, 1, 100, 8700, 8600, '', '2026-05-08 15:32:16');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (67, '260508010194', 0, 1, 4, 1, 100, 8600, 8500, '', '2026-05-08 16:09:15');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (68, '260508010197', 615, 1, 4, 1, 100, 8500, 8400, '', '2026-05-08 16:24:18');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (69, '260508010202', 620, 1, 4, 1, 100, 8400, 8300, '', '2026-05-08 16:46:30');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (70, '260508010231', 629, 1, 4, 1, 100, 8300, 8200, '', '2026-05-08 19:11:50');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (71, '260508010245', 650, 1, 4, 1, 100, 8200, 8100, '', '2026-05-08 20:21:01');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (72, '260509010087', 0, 1, 4, 1, 100, 8100, 8000, '', '2026-05-09 07:11:01');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (73, '260509010088', 662, 1, 4, 1, 100, 8100, 8000, '', '2026-05-09 07:16:14');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (74, '260509010091', 665, 1, 4, 1, 100, 8000, 7900, '', '2026-05-09 07:34:11');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (75, '260509010095', 669, 1, 4, 1, 100, 7900, 7800, '', '2026-05-09 07:52:47');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (76, '260509010120', 0, 1, 4, 1, 100, 7800, 7700, '', '2026-05-09 09:59:50');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (77, '260509010122', 696, 1, 4, 1, 100, 7700, 7600, '', '2026-05-09 10:07:31');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (78, '260509010124', 698, 1, 4, 1, 100, 7600, 7500, '', '2026-05-09 10:18:52');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (79, '260509010127', 0, 1, 4, 1, 100, 7500, 7400, '', '2026-05-09 10:31:10');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (80, '260509010130', 0, 1, 4, 1, 100, 7400, 7300, '', '2026-05-09 10:46:31');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (81, '260509010139', 0, 1, 4, 1, 100, 7300, 7200, '', '2026-05-09 11:31:42');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (82, '260509010140', 711, 1, 4, 1, 100, 7200, 7100, '', '2026-05-09 11:36:22');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (83, '260509010145', 0, 1, 4, 1, 100, 7100, 7000, '', '2026-05-09 12:02:24');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (84, '260509010147', 717, 1, 4, 1, 100, 7000, 6900, '', '2026-05-09 12:13:09');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (85, '260509010150', 720, 1, 4, 1, 100, 6900, 6800, '', '2026-05-09 12:27:32');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (86, '260509010152', 0, 1, 4, 1, 100, 6800, 6700, '', '2026-05-09 12:36:19');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (87, '260509010162', 0, 1, 4, 1, 100, 6700, 6600, '', '2026-05-09 13:26:12');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (88, '260509010164', 731, 1, 4, 1, 100, 6600, 6500, '', '2026-05-09 13:37:48');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (89, '260509010209', 779, 1, 4, 1, 100, 6500, 6400, '', '2026-05-09 17:21:01');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (90, '260509010212', 785, 1, 4, 1, 100, 6400, 6300, '', '2026-05-09 17:36:56');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (91, '260509010221', 0, 1, 4, 1, 100, 6300, 6200, '', '2026-05-09 18:22:36');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (92, '260509010227', 810, 1, 4, 1, 100, 6200, 6100, '', '2026-05-09 18:53:38');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (93, '260509010230', 816, 1, 4, 1, 100, 6100, 6000, '', '2026-05-09 19:06:01');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (94, '260509010234', 824, 1, 4, 1, 100, 6000, 5900, '', '2026-05-09 19:27:48');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (95, '260509010263', 0, 1, 4, 1, 100, 5900, 5800, '', '2026-05-09 21:51:00');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (96, '260509010269', 877, 1, 4, 1, 100, 5800, 5700, '', '2026-05-09 22:24:03');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (97, '260509010269', 877, 1, 4, 2, 100, 5700, 5800, '', '2026-05-09 22:24:14');
INSERT INTO `ddz_arena_signup_logs_202605` VALUES (98, '260509010271', 0, 1, 4, 1, 100, 5800, 5700, '', '2026-05-09 22:31:40');

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
) ENGINE = InnoDB AUTO_INCREMENT = 546 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

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
INSERT INTO `ddz_deal_logs` VALUES (354, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 4, 1, 'BJ,♥2,♦2,♠A,♠K,♠10,♥10,♣10,♣9,♣8,♠7,♦7,♣6,♥5,♣5,♥4,♠3', 17, '♣2,♦A,♥J', '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (355, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 16, 2, '♥K,♣K,♥Q,♦Q,♠J,♣J,♦J,♦10,♠9,♦9,♠8,♦8,♣7,♠4,♦4,♥3,♣3', 17, '', '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (356, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 17, 2, 'RJ,♠2,♥A,♣A,♦K,♠Q,♣Q,♥9,♥8,♥7,♠6,♥6,♦6,♠5,♦5,♣4,♦3', 17, '', '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (357, '480201d0-27e4-4cd7-85bc-160271faae9c', 4, 1, '♠2,♥2,♣2,♥A,♣K,♠Q,♥Q,♣Q,♦J,♥10,♠8,♥8,♥7,♣7,♠4,♣4,♦3', 17, '♦2,♣5,♣6', '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (358, '480201d0-27e4-4cd7-85bc-160271faae9c', 14, 2, '♠A,♦A,♠K,♥K,♥J,♣J,♦10,♠9,♣9,♦9,♣8,♦8,♠7,♦6,♦5,♥4,♠3', 17, '', '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (359, '480201d0-27e4-4cd7-85bc-160271faae9c', 13, 2, 'RJ,BJ,♣A,♦K,♦Q,♠J,♠10,♣10,♥9,♦7,♠6,♥6,♠5,♥5,♦4,♥3,♣3', 17, '', '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (360, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 4, 1, 'BJ,♠2,♥2,♦2,♦A,♥K,♣K,♠J,♥J,♣J,♦J,♣9,♥7,♦7,♦6,♥5,♦5', 17, '♠3,♥A,♦8', '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (361, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 15, 2, 'RJ,♠A,♠K,♦K,♣Q,♠10,♦10,♦9,♠8,♠7,♣7,♠6,♣6,♠5,♣5,♥4,♦4', 17, '', '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (362, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 18, 2, '♣2,♣A,♠Q,♥Q,♦Q,♥10,♣10,♠9,♥9,♥8,♣8,♥6,♠4,♣4,♥3,♣3,♦3', 17, '', '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (363, 'e7309f46-5b26-4ec5-815d-021542736243', 4, 1, '♠2,♥2,♦A,♥K,♦K,♥Q,♦Q,♠J,♥J,♣J,♦J,♠9,♦8,♠7,♣7,♠6,♥6', 17, '♣4,♥8,♠5', '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (364, 'e7309f46-5b26-4ec5-815d-021542736243', 13, 2, '♣2,♦2,♥A,♣A,♣K,♣Q,♠10,♥10,♥9,♣9,♦9,♣8,♣6,♦6,♣5,♦4,♠3', 17, '', '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (365, 'e7309f46-5b26-4ec5-815d-021542736243', 17, 2, 'RJ,BJ,♠A,♠K,♠Q,♣10,♦10,♠8,♥7,♦7,♥5,♦5,♠4,♥4,♥3,♣3,♦3', 17, '', '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (366, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♠2,♥A,♣A,♠K,♥Q,♣Q,♠J,♦10,♦9,♥7,♣7,♠6,♥6,♥5,♦4,♠3,♣3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (367, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'RJ,BJ,♣2,♦2,♠A,♣K,♠Q,♥J,♣J,♠10,♠9,♠8,♥8,♣8,♦8,♦5,♣4', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (368, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, '♥2,♦A,♥K,♦K,♦Q,♥10,♥9,♣9,♠7,♦7,♣6,♦6,♠5,♠4,♥4,♥3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (369, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♣2,♠A,♥A,♣A,♦K,♦Q,♦J,♦10,♦9,♥8,♥7,♥6,♠4,♥4,♣4,♦4,♥3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (370, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♠2,♥2,♦A,♥K,♠J,♥10,♠9,♣9,♠8,♣8,♠7,♣7,♠6,♦6,♠5,♦5,♠3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (371, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'BJ,♦2,♠K,♣K,♠Q,♥Q,♣Q,♥J,♣J,♠10,♣10,♥9,♦8,♣6,♥5,♣5,♣3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (372, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'RJ,♥2,♣2,♥K,♦K,♠Q,♣Q,♣J,♠10,♦10,♥9,♠8,♣8,♦7,♣6,♥5,♠4', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (373, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♠2,♦2,♦A,♥Q,♦Q,♠J,♥J,♦J,♣9,♦9,♦8,♣7,♥6,♣5,♣4,♠3,♥3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (374, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'BJ,♠A,♥A,♣A,♠K,♣K,♥10,♣10,♠9,♥8,♠7,♥7,♦6,♠5,♥4,♦4,♣3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (375, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'RJ,BJ,♥2,♠A,♥A,♠K,♦Q,♦10,♥9,♦8,♣7,♦6,♥4,♣4,♦4,♥3,♣3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (376, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♠2,♣2,♦2,♣A,♦A,♥Q,♣Q,♠10,♣10,♠8,♥7,♦7,♣6,♥5,♣5,♠4,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (377, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, '♥K,♣K,♦K,♠Q,♠J,♥J,♦J,♥10,♠9,♣9,♦9,♣8,♠6,♥6,♠5,♦5,♠3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (378, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♥2,♦2,♥A,♥K,♥Q,♦Q,♠J,♥J,♣J,♦J,♣10,♠9,♦9,♠7,♦7,♥6,♠4', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (379, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'RJ,BJ,♠2,♣2,♠A,♣A,♦A,♦K,♠Q,♣Q,♥10,♣9,♣8,♠6,♣5,♥4,♦4', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (380, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, '♠K,♣K,♠10,♦10,♥9,♥8,♥7,♣7,♣6,♦6,♠5,♦5,♣4,♠3,♥3,♣3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (381, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'BJ,♠2,♣2,♠A,♥A,♣A,♥K,♣K,♦K,♦Q,♥10,♥9,♣8,♦8,♥7,♦6,♥3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (382, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♥2,♦2,♠Q,♥Q,♠J,♠10,♠9,♣9,♠8,♠7,♠6,♥6,♠5,♥5,♥4,♣4,♦4', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (383, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'RJ,♦A,♠K,♣Q,♥J,♣J,♦J,♣10,♦9,♥8,♣7,♣6,♣5,♦5,♠4,♠3,♣3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (384, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♥A,♣A,♣K,♦K,♣Q,♦Q,♥10,♣10,♦10,♠9,♣9,♦9,♠8,♥8,♦6,♥5,♣4', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (385, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'RJ,♥2,♠K,♠Q,♥J,♠10,♥9,♣8,♠7,♥7,♣7,♥6,♣5,♠4,♦4,♠3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (386, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'BJ,♠2,♣2,♦2,♠A,♦A,♥K,♥Q,♠J,♣J,♦7,♠6,♣6,♠5,♦5,♥4,♥3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (387, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'RJ,BJ,♠2,♠K,♦K,♣Q,♥J,♦J,♠9,♥9,♥7,♣7,♦7,♠5,♠4,♥4,♠3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (388, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♣A,♥K,♠Q,♦Q,♦10,♣9,♥8,♣8,♠7,♠6,♥6,♦6,♥5,♦5,♦4,♥3,♣3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (389, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, '♥2,♣2,♦2,♠A,♦A,♣K,♥Q,♣J,♠10,♥10,♣10,♦9,♠8,♦8,♣6,♣4,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (390, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'RJ,♠2,♠K,♦K,♣Q,♦Q,♥10,♦9,♥8,♣7,♦7,♠6,♦6,♣5,♠4,♣4,♣3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (391, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♥2,♣2,♠A,♦A,♠Q,♥Q,♠J,♥J,♦J,♥9,♣9,♠8,♣8,♥7,♣6,♠5,♠3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (392, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, '♦2,♥A,♣A,♥K,♣K,♣J,♠10,♣10,♠9,♦8,♠7,♥6,♥5,♦5,♦4,♥3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (393, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'RJ,♠2,♥2,♣2,♦2,♠A,♣A,♣10,♠9,♣9,♠8,♥8,♠7,♥7,♣7,♣6,♣5', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (394, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'BJ,♦A,♣K,♥Q,♣Q,♦Q,♦9,♦7,♠6,♥6,♦6,♠5,♥4,♣4,♠3,♥3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (395, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, '♥A,♠K,♥K,♦K,♠Q,♥J,♣J,♦J,♠10,♦10,♣8,♦8,♥5,♦5,♠4,♦4,♣3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (396, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'BJ,♣2,♠A,♥A,♥K,♣K,♠Q,♣J,♠10,♥7,♠6,♣5,♠4,♥4,♣4,♦4,♥3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (397, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♠2,♥2,♠K,♦K,♥Q,♣Q,♦Q,♠J,♦J,♥8,♦8,♣7,♣6,♦6,♠5,♥5,♣3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (398, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'RJ,♦2,♦A,♥J,♥10,♣10,♦10,♥9,♣9,♠8,♣8,♠7,♦7,♥6,♦5,♠3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (399, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'RJ,♥2,♣2,♦A,♥Q,♣Q,♦Q,♥J,♣9,♠8,♦6,♠5,♥5,♠4,♥4,♣4,♦4', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (400, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'BJ,♥A,♣K,♠Q,♠10,♥10,♣10,♦10,♦8,♠7,♥7,♦7,♣6,♠3,♥3,♣3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (401, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, '♠2,♦2,♣A,♠K,♥K,♦K,♠J,♣J,♦J,♠9,♦9,♥8,♣7,♠6,♥6,♣5,♦5', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (402, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♣2,♠A,♦A,♠K,♦K,♠J,♣J,♠10,♣9,♦9,♠8,♠6,♥6,♦6,♦5,♥3,♣3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (403, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'BJ,♠2,♥2,♦2,♥K,♥Q,♦J,♥10,♠9,♥8,♠5,♥5,♣5,♥4,♣4,♦4,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (404, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'RJ,♣A,♣K,♣Q,♦Q,♣10,♦10,♥9,♣8,♦8,♠7,♥7,♣7,♦7,♣6,♠4,♠3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (405, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♠2,♦2,♠A,♦K,♠J,♦J,♣10,♥9,♥8,♦8,♠7,♥7,♠6,♣6,♥5,♥3,♣3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (406, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'RJ,BJ,♥2,♥A,♦A,♥Q,♣Q,♦Q,♣9,♦9,♠8,♣8,♣7,♦7,♦6,♣5,♥4', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (407, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, '♣2,♣A,♠K,♥K,♥J,♣J,♠10,♥10,♦10,♠9,♥6,♠5,♦5,♠4,♣4,♦4,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (408, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'BJ,♠2,♣A,♦A,♣K,♦Q,♠J,♣J,♠10,♥10,♣10,♠9,♣9,♣7,♥6,♣6,♥3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (409, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'RJ,♦2,♠A,♠Q,♣Q,♥J,♦J,♦10,♦9,♦8,♠6,♥5,♣5,♦5,♠4,♣4,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (410, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, '♥2,♣2,♥A,♠K,♥K,♥Q,♥9,♠8,♥8,♣8,♠7,♥7,♦7,♠5,♥4,♦4,♠3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (411, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'BJ,♠2,♥2,♦A,♥K,♣K,♦K,♠Q,♦Q,♥J,♣J,♦J,♦10,♣9,♦8,♣6,♣3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (412, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'RJ,♣A,♣Q,♠J,♥9,♦9,♠8,♥8,♠7,♣7,♠6,♦6,♠5,♥5,♦4,♠3,♥3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (413, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, '♣2,♦2,♠A,♥A,♠K,♠10,♥10,♣10,♠9,♣8,♥6,♣5,♦5,♠4,♥4,♣4,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (414, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'BJ,♣2,♥A,♥K,♠Q,♦Q,♣J,♦10,♠9,♥9,♠8,♣8,♠7,♣7,♥6,♦5,♣3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (415, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'RJ,♠2,♦2,♠A,♣A,♠K,♣K,♠J,♥J,♦J,♣10,♦8,♥7,♦7,♦6,♥4,♦4', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (416, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, '♥2,♦K,♥Q,♣Q,♠10,♥10,♣9,♦9,♥8,♠6,♣6,♠5,♣5,♠4,♣4,♥3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (417, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'BJ,♦2,♠A,♦K,♥Q,♦Q,♥J,♣J,♦J,♥9,♣7,♥5,♣5,♥4,♠3,♥3,♣3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (418, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♥2,♣2,♣K,♠Q,♣Q,♠10,♦10,♠9,♠8,♥8,♦8,♠7,♦7,♠6,♦5,♠4,♣4', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (419, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'RJ,♠2,♥A,♣A,♠K,♥K,♥10,♣10,♣9,♦9,♣8,♥7,♥6,♣6,♦6,♠5,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (420, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'RJ,♥2,♣2,♠A,♦K,♠Q,♠J,♥J,♣J,♠10,♣10,♥7,♦7,♣6,♥4,♦4,♥3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (421, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♦2,♣A,♦A,♥Q,♣Q,♦Q,♦10,♠9,♦9,♠8,♦8,♣7,♠5,♠4,♣4,♠3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (422, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'BJ,♠2,♥A,♠K,♥K,♣K,♦J,♥10,♥9,♣9,♣8,♠7,♠6,♥6,♥5,♦5,♣3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (423, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'BJ,♦A,♠Q,♦Q,♥J,♣J,♦J,♠7,♣7,♦7,♠6,♠5,♣5,♠4,♥4,♣4,♣3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (424, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'RJ,♥2,♣A,♠K,♦K,♣Q,♣10,♠9,♦9,♥8,♣8,♦8,♥7,♥6,♣6,♦6,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (425, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, '♠2,♦2,♠A,♥A,♣K,♥Q,♠J,♠10,♥10,♦10,♥9,♣9,♠8,♦5,♦4,♠3,♥3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (426, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♥2,♥A,♣A,♦A,♦K,♣Q,♠J,♥J,♣J,♠10,♦9,♠8,♦6,♥5,♦5,♥4,♠3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (427, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♠A,♠K,♥K,♣K,♥Q,♣10,♠9,♥8,♣7,♦7,♠6,♣6,♠5,♠4,♥3,♣3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (428, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'RJ,BJ,♣2,♦2,♠Q,♦Q,♦J,♥10,♦10,♥9,♣9,♦8,♥7,♥6,♣5,♣4,♦4', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (429, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'BJ,♠2,♥K,♦Q,♥J,♦J,♠10,♥10,♣10,♥9,♣9,♠8,♥8,♣7,♥6,♥4,♦3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (430, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♥2,♦2,♠A,♥A,♠K,♣K,♦K,♥Q,♦10,♠9,♣8,♦8,♠7,♦7,♠6,♦6,♣3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (431, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'RJ,♣2,♣A,♦A,♣Q,♠J,♣J,♦9,♥7,♠5,♥5,♣5,♦5,♠4,♣4,♠3,♥3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (432, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'BJ,♥2,♣A,♦K,♥Q,♣Q,♦Q,♦10,♠9,♥9,♦9,♥8,♠7,♥5,♠4,♥4,♦4', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (433, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'RJ,♠2,♣2,♦2,♠A,♠Q,♥J,♣J,♦J,♠8,♦7,♥6,♣6,♦6,♦5,♥3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (434, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, '♥A,♦A,♠K,♥K,♣K,♠J,♠10,♥10,♣10,♣9,♣8,♦8,♥7,♣7,♣5,♣4,♠3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (435, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'BJ,♣2,♠A,♦A,♠K,♣K,♠Q,♥Q,♣Q,♦J,♥10,♥9,♥8,♦7,♦6,♣4,♦4', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (436, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♥2,♣A,♥K,♠J,♥J,♦10,♠8,♦8,♠7,♣7,♥6,♣6,♠5,♥4,♥3,♣3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (437, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'RJ,♠2,♥A,♦K,♦Q,♣J,♠10,♠9,♣9,♦9,♣8,♥7,♠6,♥5,♣5,♠4,♠3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (438, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'RJ,♥2,♣2,♠A,♥A,♥Q,♦Q,♣J,♦J,♥10,♦10,♠9,♥8,♦7,♠5,♥5,♣4', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (439, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♠2,♦A,♠K,♥K,♦K,♥J,♥9,♣9,♣7,♥6,♣6,♦6,♦5,♥4,♦4,♥3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (440, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'BJ,♦2,♣A,♣K,♠J,♠10,♣10,♦9,♠8,♣8,♦8,♠7,♥7,♠6,♣5,♠4,♣3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (441, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♣2,♠A,♣A,♦K,♥Q,♣J,♥10,♣10,♠8,♣8,♦8,♣6,♠5,♥5,♠4,♠3,♣3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (442, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'RJ,♦A,♠Q,♣Q,♠J,♠10,♦10,♦9,♥8,♠7,♥7,♣7,♦7,♠6,♥4,♣4,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (443, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, '♠2,♥2,♦2,♥A,♠K,♣K,♦Q,♥J,♦J,♠9,♥9,♥6,♦6,♣5,♦5,♦4,♥3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (444, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♥2,♣2,♥K,♣K,♦K,♠Q,♥Q,♥J,♥9,♦9,♠8,♦8,♥7,♣6,♣5,♠4,♠3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (445, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'BJ,♦2,♠A,♦A,♣J,♠10,♥10,♣10,♣9,♠7,♥6,♦6,♦5,♥4,♣4,♦4,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (446, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'RJ,♠2,♥A,♣A,♠K,♣Q,♠J,♦J,♦10,♠9,♥8,♣8,♣7,♠6,♠5,♥5,♥3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (447, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♣2,♠A,♥A,♠Q,♥Q,♦Q,♣J,♥10,♠8,♦8,♦7,♠6,♥6,♠5,♥5,♠3,♣3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (448, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'RJ,♠2,♦2,♣A,♦K,♥J,♦10,♠9,♥9,♣9,♦6,♣5,♦5,♠4,♥4,♦4,♥3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (449, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'BJ,♥2,♦A,♠K,♥K,♣K,♣Q,♠J,♦J,♣10,♦9,♥8,♣8,♥7,♣7,♣6,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (450, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'RJ,♣A,♠K,♥K,♣K,♣Q,♥J,♦J,♣9,♦9,♣8,♥7,♣7,♠5,♣5,♣4,♥3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (451, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'BJ,♥2,♣2,♦2,♠Q,♠10,♦10,♠9,♥9,♠8,♠6,♥6,♣6,♠4,♥4,♣3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (452, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, '♠2,♥A,♦A,♦K,♥Q,♦Q,♣J,♥10,♣10,♥8,♦8,♠7,♦7,♦6,♦5,♦4,♠3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (453, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'BJ,♠K,♥K,♣K,♠Q,♥Q,♣Q,♣J,♦J,♣9,♠8,♥8,♣8,♦8,♠6,♥6,♥5', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (454, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♥2,♠A,♣A,♦A,♥J,♣10,♦10,♠9,♥9,♣7,♦7,♦6,♠5,♣5,♦5,♠4,♠3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (455, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'RJ,♠2,♣2,♦2,♦K,♦Q,♠J,♠10,♦9,♠7,♥7,♣6,♥4,♣4,♦4,♥3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (456, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♠2,♥2,♦2,♥A,♠K,♣K,♦K,♣J,♠9,♠7,♣7,♦7,♠6,♦6,♣5,♦5,♥4', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (457, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♣2,♠A,♣A,♣Q,♦Q,♥J,♣10,♦10,♣9,♠8,♥8,♣8,♠4,♦4,♥3,♣3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (458, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, '♦A,♠Q,♥Q,♠J,♦J,♠10,♥10,♥9,♦9,♦8,♥7,♥6,♣6,♠5,♥5,♣4,♠3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (459, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'BJ,♠2,♥2,♦2,♦A,♣Q,♥J,♠10,♥10,♠9,♥8,♦7,♥6,♣6,♠4,♣4,♠3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (460, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♥A,♠K,♦K,♠Q,♥Q,♦Q,♠J,♦J,♣10,♦10,♥9,♣8,♥7,♠5,♥5,♥4,♥3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (461, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'RJ,♠A,♣A,♥K,♣K,♣J,♣9,♠8,♦8,♠7,♣7,♠6,♣5,♦5,♦4,♣3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (462, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♠2,♣2,♥Q,♣Q,♦Q,♠J,♥J,♠10,♦10,♦9,♠8,♠7,♣7,♥6,♠5,♣4,♥3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (463, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'BJ,♥A,♣A,♦A,♠K,♥K,♣K,♠Q,♦J,♣10,♥9,♣9,♠6,♣6,♦5,♦4,♣3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (464, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'RJ,♥2,♠A,♦K,♣J,♥10,♠9,♥8,♣8,♦8,♦7,♦6,♥5,♣5,♠4,♥4,♠3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (465, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♠A,♠K,♥K,♥Q,♥J,♦J,♠10,♠9,♠8,♦7,♥6,♦6,♠5,♠4,♦4,♠3,♣3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (466, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'RJ,♠2,♣2,♦2,♥A,♣A,♦A,♦K,♠Q,♣J,♦10,♦9,♣8,♥7,♣7,♥4,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (467, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'BJ,♣K,♣Q,♦Q,♥10,♣10,♥9,♣9,♥8,♦8,♠7,♠6,♣6,♥5,♣5,♣4,♥3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (468, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♥2,♥A,♦K,♠Q,♥J,♦J,♥10,♠8,♣8,♦8,♥7,♦7,♠6,♦5,♥4,♣4,♣3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (469, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'RJ,♠2,♣2,♦A,♣Q,♦Q,♣10,♦10,♥8,♥6,♦6,♠5,♥5,♣5,♠4,♦4,♥3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (470, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'BJ,♠A,♣A,♠K,♥K,♣K,♥Q,♠J,♣J,♠10,♠9,♥9,♣9,♦9,♠7,♣6,♠3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (471, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♠2,♦2,♣A,♠J,♥J,♣10,♥9,♦9,♥8,♣8,♠7,♣7,♣6,♦5,♠4,♣4,♠3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (472, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'RJ,♥2,♣2,♠A,♠K,♦K,♠Q,♣Q,♦J,♥10,♣9,♦7,♥6,♣5,♦4,♥3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (473, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'BJ,♥A,♥K,♣K,♥Q,♦Q,♣J,♠10,♦10,♠9,♠8,♦8,♥7,♠6,♦6,♠5,♥5', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (474, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'BJ,♣A,♦A,♥K,♣J,♣10,♠8,♥8,♣8,♠7,♥6,♦6,♠5,♣4,♥3,♣3,♦3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (475, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♦2,♥A,♥Q,♣Q,♠J,♥J,♦J,♦10,♥9,♥7,♣7,♠6,♣6,♥5,♦5,♠4,♥4', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (476, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'RJ,♥2,♣2,♠A,♠K,♣K,♦K,♦Q,♠10,♥10,♠9,♦9,♦8,♦7,♣5,♦4,♠3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (477, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♣2,♦2,♥Q,♣Q,♠J,♦10,♠8,♥8,♣8,♠7,♥7,♣7,♣6,♣5,♥4,♦4,♦3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (478, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'RJ,♠2,♥A,♥K,♣K,♦Q,♣J,♦J,♠10,♣10,♥9,♦7,♠6,♥6,♠4,♠3,♥3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (479, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'BJ,♥2,♠A,♣A,♦A,♠K,♠Q,♥J,♥10,♠9,♣9,♦9,♦8,♦6,♦5,♣4,♣3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (480, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♠2,♥2,♥A,♦A,♠K,♠J,♠10,♠8,♥8,♦8,♥7,♣6,♥5,♣5,♥3,♣3,♦3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (481, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'RJ,♣A,♦K,♦Q,♥J,♣J,♥10,♦10,♠9,♥9,♣9,♦7,♠6,♠5,♦5,♠4,♥4', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (482, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, '♣2,♦2,♠A,♥K,♠Q,♥Q,♦J,♣10,♦9,♣8,♠7,♣7,♥6,♦6,♣4,♦4,♠3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (483, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♣A,♥K,♦K,♠J,♠10,♥10,♥9,♦9,♦8,♠7,♠6,♥6,♥5,♣5,♠3,♥3,♦3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (484, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'RJ,BJ,♥2,♠A,♥A,♦A,♣Q,♣J,♦J,♦10,♠9,♣9,♦7,♣6,♠4,♦4,♣3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (485, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, '♠2,♣2,♦2,♠K,♣K,♠Q,♥Q,♥J,♣10,♠8,♥8,♣8,♥7,♣7,♦6,♠5,♥4', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (486, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♦2,♠J,♣J,♥9,♣9,♦9,♦8,♥7,♥6,♣6,♦6,♠5,♣5,♦5,♣4,♦4,♠3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (487, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'RJ,♣2,♦A,♠K,♥K,♣Q,♦Q,♥J,♦J,♥10,♠8,♠7,♦7,♠6,♠4,♥4,♣3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (488, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'BJ,♠2,♥2,♠A,♣A,♣K,♠Q,♥Q,♠10,♣10,♦10,♥8,♣8,♣7,♥5,♥3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (489, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♥2,♦2,♠A,♥A,♣A,♦K,♠J,♣J,♦J,♦10,♣8,♠7,♥7,♣7,♠4,♠3,♥3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (490, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'RJ,♥K,♣K,♥Q,♥J,♥10,♠9,♥9,♣9,♦9,♦7,♠6,♣6,♥5,♣5,♦4,♣3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (491, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'BJ,♠2,♣2,♦A,♠K,♠Q,♦Q,♣10,♠8,♥8,♦8,♥6,♦6,♠5,♥4,♣4,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (492, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♣2,♠A,♥K,♣K,♠J,♣10,♦9,♥8,♣8,♦8,♥6,♣6,♦6,♥5,♦5,♥4,♦4', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (493, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♣A,♦A,♠K,♦K,♥Q,♦Q,♦J,♠10,♦10,♠9,♣9,♦7,♠6,♠4,♠3,♥3,♣3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (494, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'RJ,BJ,♠2,♥2,♦2,♥A,♣Q,♥J,♣J,♥10,♥9,♠7,♥7,♣7,♠5,♣4,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (495, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'RJ,♠2,♣A,♦K,♠J,♦10,♥9,♦9,♥7,♣7,♥6,♣6,♠5,♥5,♣4,♦4,♠3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (496, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♣2,♠K,♥K,♠Q,♣Q,♦Q,♣J,♦J,♥10,♣9,♥8,♦7,♠6,♣5,♥3,♣3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (497, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'BJ,♦2,♠A,♥A,♦A,♥Q,♥J,♣10,♠9,♠8,♣8,♦8,♠7,♦6,♦5,♠4,♥4', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (498, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'RJ,♥A,♦A,♥K,♦K,♣Q,♣J,♦J,♣10,♦9,♦7,♠6,♥6,♦6,♥4,♦4,♠3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (499, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'BJ,♠2,♥2,♠A,♣A,♣K,♠Q,♠J,♥J,♠9,♥8,♠7,♣7,♣6,♠5,♥5,♣5', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (500, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, '♣2,♦2,♠K,♥Q,♦Q,♥10,♣9,♠8,♣8,♦8,♥7,♦5,♠4,♣4,♥3,♣3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (501, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♦2,♠Q,♥Q,♣Q,♠J,♥J,♠10,♥10,♦9,♥7,♦7,♣6,♦6,♦5,♠4,♥4,♦4', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (502, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♥2,♣2,♦A,♠K,♥K,♣K,♦Q,♣J,♦J,♦10,♠8,♥8,♦8,♥5,♣5,♠3,♥3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (503, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'RJ,BJ,♠2,♠A,♥A,♣A,♦K,♠9,♥9,♣8,♠7,♣7,♠6,♥6,♣4,♣3,♦3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (504, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, '♠A,♥A,♣K,♣Q,♠J,♥J,♠10,♦10,♣9,♠8,♠6,♥6,♥5,♦5,♦4,♠3,♦3', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (505, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, '♠2,♥2,♣2,♦K,♦Q,♣J,♦J,♥10,♣10,♥9,♥8,♣7,♦7,♠5,♣5,♣4,♣3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (506, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 'RJ,BJ,♦2,♣A,♦A,♠K,♥K,♥Q,♠9,♣8,♦8,♠7,♥7,♣6,♦6,♥4,♥3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (507, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 'RJ,♥2,♣K,♦K,♥Q,♠J,♦J,♥10,♥9,♣9,♥8,♦8,♥7,♠6,♣6,♦6,♦4', 17, '♥4,♠K,♦3', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (508, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 'BJ,♣2,♦2,♥A,♠Q,♣Q,♦Q,♥J,♣J,♣8,♠7,♣7,♥6,♥5,♣5,♠4,♣4', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (509, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, '♠2,♠A,♣A,♦A,♥K,♠10,♣10,♦10,♠9,♦9,♠8,♦7,♠5,♦5,♠3,♥3,♣3', 17, '', '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (510, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, '♦2,♠A,♥A,♣A,♥Q,♦J,♦10,♣9,♠8,♥8,♣7,♦6,♠5,♠4,♥4,♦4,♦3', 17, '♦5,♦8,♠6', '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (511, '71065836-67bf-4479-a527-f59219f0963a', 16, 2, 'RJ,♦A,♠K,♥K,♦K,♠Q,♠J,♥J,♠10,♥10,♥9,♦9,♠7,♥7,♠3,♥3,♣3', 17, '', '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (512, '71065836-67bf-4479-a527-f59219f0963a', 15, 2, 'BJ,♠2,♥2,♣2,♣K,♣Q,♦Q,♣J,♣10,♠9,♣8,♦7,♥6,♣6,♥5,♣5,♣4', 17, '', '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (513, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 4, 1, '♣2,♦2,♠A,♣A,♦K,♠Q,♥Q,♦Q,♥J,♠10,♣10,♣9,♠8,♣5,♥4,♣4,♦4', 17, 'RJ,♣Q,♦7', '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (514, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 10, 2, 'BJ,♥A,♠K,♣J,♠9,♥9,♦9,♥8,♠7,♣7,♠6,♥5,♦5,♠4,♥3,♣3,♦3', 17, '', '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (515, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 9, 2, '♠2,♥2,♦A,♥K,♣K,♠J,♦J,♥10,♦10,♣8,♦8,♥7,♥6,♣6,♦6,♠5,♠3', 17, '', '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (516, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 4, 1, '♠2,♥2,♦Q,♠J,♦J,♥10,♥9,♦9,♦8,♠7,♣6,♥5,♣5,♠4,♥4,♠3,♣3', 17, '♦6,♣8,♥A', '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (517, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 9, 2, '♠A,♠K,♦K,♠Q,♥Q,♣Q,♠10,♣10,♠8,♥8,♥7,♣7,♦7,♠6,♠5,♦5,♣4', 17, '', '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (518, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 17, 2, 'RJ,BJ,♣2,♦2,♣A,♦A,♥K,♣K,♥J,♣J,♦10,♠9,♣9,♥6,♦4,♥3,♦3', 17, '', '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (519, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 4, 1, '♠2,♥2,♥A,♦A,♦K,♦Q,♥J,♦J,♣10,♦10,♠8,♥8,♣8,♣7,♥4,♣3,♦3', 17, 'BJ,♣2,♦9', '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (520, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 20, 2, '♦2,♠K,♥K,♠Q,♥Q,♣J,♠10,♠9,♣9,♥7,♣6,♦6,♠5,♣5,♦5,♠4,♦4', 17, '', '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (521, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 21, 2, 'RJ,♠A,♣A,♣K,♣Q,♠J,♥10,♥9,♦8,♠7,♦7,♠6,♥6,♥5,♣4,♠3,♥3', 17, '', '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (522, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, '♦2,♠A,♣A,♠K,♦K,♥Q,♠10,♥9,♣9,♦9,♣8,♥7,♦6,♣5,♦5,♣4,♦4', 17, '', '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (523, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 'BJ,♥2,♣K,♠Q,♣Q,♠J,♥J,♣J,♦J,♥10,♦10,♠7,♥6,♠5,♠4,♥4,♣3', 17, '', '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (524, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 'RJ,♠2,♣2,♥A,♦A,♥K,♦Q,♣10,♠9,♠8,♥8,♣7,♠6,♣6,♥5,♠3,♥3', 17, '♠9,♣9,♠2', '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (525, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, '♥2,♣2,♦2,♠A,♦A,♠K,♣K,♦K,♦10,♠8,♣8,♥7,♥6,♦6,♦4,♠3,♣3', 17, '', '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (526, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 'BJ,♥A,♥K,♠Q,♣Q,♦Q,♣J,♦J,♣10,♥9,♦9,♠6,♣6,♥5,♣5,♦5,♥4', 17, '', '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (527, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 'RJ,♣A,♥Q,♠J,♥J,♠10,♥10,♥8,♦8,♠7,♣7,♦7,♠5,♠4,♣4,♥3,♦3', 17, '♠9,♣9,♠2', '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (528, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 4, 1, 'BJ,♠2,♦2,♥Q,♣Q,♠J,♦J,♠10,♥9,♣9,♦9,♦7,♥6,♠5,♥5,♦4,♣3', 17, '♣7,♣K,♣J', '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (529, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 33, 2, '♥2,♣2,♣A,♠K,♥K,♦K,♥J,♣10,♦10,♥8,♠7,♣6,♦5,♣4,♠3,♥3,♦3', 17, '', '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (530, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 38, 2, 'RJ,♠A,♥A,♦A,♠Q,♦Q,♥10,♠9,♠8,♣8,♦8,♥7,♠6,♦6,♣5,♠4,♥4', 17, '', '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (531, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 4, 1, '♠2,♠A,♥A,♣A,♠K,♦K,♠Q,♠J,♦J,♥10,♠8,♠7,♣6,♦6,♦5,♦4,♦3', 17, '♦A,♦8,♣8', '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (532, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 10, 2, 'RJ,BJ,♦2,♣K,♣Q,♠10,♦10,♣9,♦9,♠6,♠5,♥5,♣5,♥4,♣4,♥3,♣3', 17, '', '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (533, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 14, 2, '♥2,♣2,♥K,♥Q,♦Q,♥J,♣J,♣10,♠9,♥9,♥8,♥7,♣7,♦7,♥6,♠4,♠3', 17, '', '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (534, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 4, 1, '♠2,♥A,♣A,♦K,♦Q,♥10,♣10,♦10,♦9,♠8,♣7,♠6,♥6,♦6,♥4,♠3,♣3', 17, '♠J,♦2,♦3', '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (535, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 24, 2, '♠K,♣K,♥J,♠9,♥9,♥8,♣8,♦8,♠7,♥7,♦7,♠5,♥5,♣5,♠4,♦4,♥3', 17, '', '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (536, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 22, 2, 'RJ,BJ,♥2,♣2,♠A,♦A,♥K,♠Q,♥Q,♣Q,♣J,♦J,♠10,♣9,♣6,♦5,♣4', 17, '', '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (537, 'c0bec0d2-1732-46cc-b8f3-db308ee734ef', 4, 1, '♠2,♥2,♦2,♣A,♦K,♠J,♣J,♦10,♣9,♥8,♥7,♠5,♣5,♦5,♠4,♣4,♠3', 17, '♥6,♣7,♥4', '2026-05-08 19:15:51', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (538, 'c0bec0d2-1732-46cc-b8f3-db308ee734ef', 34, 2, 'BJ,♣2,♠A,♦A,♥K,♣K,♠Q,♣Q,♦Q,♣10,♠9,♦9,♠8,♦7,♣6,♥5,♦4', 17, '', '2026-05-08 19:15:51', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (539, 'c0bec0d2-1732-46cc-b8f3-db308ee734ef', 21, 2, 'RJ,♥A,♠K,♥Q,♥J,♦J,♠10,♥10,♥9,♣8,♦8,♠7,♠6,♦6,♥3,♣3,♦3', 17, '', '2026-05-08 19:15:51', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (540, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 4, 1, '♣2,♦2,♦A,♠K,♣Q,♥10,♦10,♠9,♥9,♣9,♠8,♣8,♦7,♦6,♦5,♠4,♥3', 17, '♣4,♣7,♣K', '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (541, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 34, 2, 'RJ,♠A,♥A,♦K,♠Q,♥Q,♦J,♠10,♣10,♦9,♦8,♠7,♠6,♣6,♥4,♦4,♦3', 17, '', '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (542, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 21, 2, 'BJ,♠2,♥2,♣A,♥K,♦Q,♠J,♥J,♣J,♥8,♥7,♥6,♠5,♥5,♣5,♠3,♣3', 17, '', '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (543, 'e2d74440-2c02-46f2-be82-e28517e09314', 4, 1, 'BJ,♥2,♠A,♥A,♠K,♣K,♦K,♦Q,♠J,♣J,♦J,♣9,♥8,♠6,♣5,♦4,♣3', 17, '♥6,♠3,♠10', '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (544, 'e2d74440-2c02-46f2-be82-e28517e09314', 34, 2, 'RJ,♠2,♣A,♥Q,♣Q,♥10,♦10,♦9,♠8,♦8,♥7,♦7,♣6,♥5,♥4,♣4,♥3', 17, '', '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_deal_logs` VALUES (545, 'e2d74440-2c02-46f2-be82-e28517e09314', 21, 2, '♣2,♦2,♦A,♥K,♠Q,♥J,♣10,♠9,♥9,♣8,♠7,♣7,♦6,♠5,♦5,♠4,♦3', 17, '', '2026-05-08 19:18:15', NULL, NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 124 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '发牌日志表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_deal_logs_202605
-- ----------------------------
INSERT INTO `ddz_deal_logs_202605` VALUES (1, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 4, 1, '♠2,♥2,♠A,♥A,♣A,♦A,♥K,♣K,♠Q,♥10,♣10,♣6,♦6,♠4,♣4,♦4,♣3', 17, '♥J,♠7,♠8', '2026-05-08 20:25:55');
INSERT INTO `ddz_deal_logs_202605` VALUES (2, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 17, 2, '♣2,♦K,♥Q,♦Q,♣J,♥9,♣9,♥8,♦8,♥7,♣7,♠6,♥6,♣5,♦5,♥4,♠3', 17, '', '2026-05-08 20:25:55');
INSERT INTO `ddz_deal_logs_202605` VALUES (3, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 35, 2, 'RJ,BJ,♦2,♠K,♣Q,♠J,♦J,♠10,♦10,♠9,♦9,♣8,♦7,♠5,♥5,♥3,♦3', 17, '', '2026-05-08 20:25:55');
INSERT INTO `ddz_deal_logs_202605` VALUES (4, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 4, 1, '♦2,♠A,♣K,♠Q,♦Q,♦J,♠8,♠7,♥7,♦7,♥6,♣5,♦5,♥4,♦4,♠3,♦3', 17, 'RJ,♣Q,♠10', '2026-05-08 20:26:59');
INSERT INTO `ddz_deal_logs_202605` VALUES (5, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 17, 2, '♥A,♠K,♥Q,♥J,♥10,♦10,♥9,♦9,♣8,♣7,♠6,♣6,♠5,♥5,♠4,♣4,♥3', 17, '', '2026-05-08 20:26:59');
INSERT INTO `ddz_deal_logs_202605` VALUES (6, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 35, 2, 'BJ,♠2,♥2,♣2,♣A,♦A,♥K,♦K,♠J,♣J,♣10,♠9,♣9,♥8,♦8,♦6,♣3', 17, '', '2026-05-08 20:26:59');
INSERT INTO `ddz_deal_logs_202605` VALUES (7, '7e9bf02e-5576-465b-8c6d-4ae863483969', 4, 1, '♦2,♦A,♠K,♥K,♣K,♥Q,♦Q,♣J,♦J,♠10,♥9,♥8,♥6,♦6,♠5,♥4,♣4', 17, '♦3,♣3,♣6', '2026-05-08 20:28:12');
INSERT INTO `ddz_deal_logs_202605` VALUES (8, '7e9bf02e-5576-465b-8c6d-4ae863483969', 17, 2, 'RJ,BJ,♠2,♣2,♠A,♥A,♦K,♣Q,♣10,♠8,♣8,♠7,♥7,♣7,♠6,♦4,♠3', 17, '', '2026-05-08 20:28:12');
INSERT INTO `ddz_deal_logs_202605` VALUES (9, '7e9bf02e-5576-465b-8c6d-4ae863483969', 35, 2, '♥2,♣A,♠Q,♠J,♥J,♥10,♦10,♠9,♣9,♦9,♦8,♦7,♥5,♣5,♦5,♠4,♥3', 17, '', '2026-05-08 20:28:12');
INSERT INTO `ddz_deal_logs_202605` VALUES (10, '7bcd73b9-4007-4e78-930e-721936c88248', 4, 1, 'RJ,♠2,♣2,♠A,♥A,♣A,♣K,♣Q,♣J,♥10,♣8,♥6,♣6,♠5,♥5,♦5,♠4', 17, '♠6,♦4,♥3', '2026-05-09 07:21:30');
INSERT INTO `ddz_deal_logs_202605` VALUES (11, '7bcd73b9-4007-4e78-930e-721936c88248', 31, 2, 'BJ,♥2,♦2,♠K,♥K,♠Q,♦Q,♥J,♥9,♣9,♦9,♥8,♦8,♥7,♣5,♣3,♦3', 17, '', '2026-05-09 07:21:30');
INSERT INTO `ddz_deal_logs_202605` VALUES (12, '7bcd73b9-4007-4e78-930e-721936c88248', 29, 2, '♦A,♦K,♥Q,♠J,♦J,♠10,♣10,♦10,♠9,♠8,♠7,♣7,♦7,♦6,♥4,♣4,♠3', 17, '', '2026-05-09 07:21:30');
INSERT INTO `ddz_deal_logs_202605` VALUES (13, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 4, 1, '♠2,♥A,♦K,♥J,♦J,♠10,♥10,♣9,♠8,♦8,♠6,♥6,♣5,♠4,♦4,♥3,♦3', 17, '♥4,♣10,♣K', '2026-05-09 07:23:00');
INSERT INTO `ddz_deal_logs_202605` VALUES (14, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 31, 2, 'RJ,BJ,♠A,♠K,♣Q,♦Q,♣J,♠9,♥9,♣8,♣7,♣6,♦6,♠5,♥5,♦5,♣4', 17, '', '2026-05-09 07:23:00');
INSERT INTO `ddz_deal_logs_202605` VALUES (15, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 29, 2, '♥2,♣2,♦2,♣A,♦A,♥K,♠Q,♥Q,♠J,♦10,♦9,♥8,♠7,♥7,♦7,♠3,♣3', 17, '', '2026-05-09 07:23:00');
INSERT INTO `ddz_deal_logs_202605` VALUES (16, 'ff1c49e3-918c-4a72-8bad-747def826d60', 4, 1, 'RJ,♠A,♠K,♥Q,♦Q,♥9,♠8,♥8,♣8,♣6,♥5,♦5,♥4,♠3,♥3,♣3,♦3', 17, '♣10,♠4,♦2', '2026-05-09 07:24:21');
INSERT INTO `ddz_deal_logs_202605` VALUES (17, 'ff1c49e3-918c-4a72-8bad-747def826d60', 31, 2, '♠2,♥A,♥K,♣K,♠Q,♥J,♣J,♥10,♠9,♣9,♦9,♠7,♣7,♦7,♥6,♣5,♦4', 17, '', '2026-05-09 07:24:21');
INSERT INTO `ddz_deal_logs_202605` VALUES (18, 'ff1c49e3-918c-4a72-8bad-747def826d60', 29, 2, 'BJ,♥2,♣2,♣A,♦A,♦K,♣Q,♠J,♦J,♠10,♦10,♦8,♥7,♠6,♦6,♠5,♣4', 17, '', '2026-05-09 07:24:21');
INSERT INTO `ddz_deal_logs_202605` VALUES (19, '8c7441a4-43c5-4000-8d41-6c57090bb760', 4, 1, 'BJ,♣2,♥A,♦A,♥K,♦K,♦Q,♥J,♣J,♦J,♠10,♣7,♦6,♦5,♠4,♣4,♣3', 17, '♣K,♦7,♣6', '2026-05-09 07:35:52');
INSERT INTO `ddz_deal_logs_202605` VALUES (20, '8c7441a4-43c5-4000-8d41-6c57090bb760', 28, 2, 'RJ,♠Q,♥Q,♠J,♥10,♠9,♥9,♥8,♣8,♦8,♠6,♥6,♠5,♥5,♣5,♦4,♦3', 17, '', '2026-05-09 07:35:52');
INSERT INTO `ddz_deal_logs_202605` VALUES (21, '8c7441a4-43c5-4000-8d41-6c57090bb760', 15, 2, '♠2,♥2,♦2,♠A,♣A,♠K,♣Q,♣10,♦10,♣9,♦9,♠8,♠7,♥7,♥4,♠3,♥3', 17, '', '2026-05-09 07:35:52');
INSERT INTO `ddz_deal_logs_202605` VALUES (22, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 4, 1, 'BJ,♠2,♦A,♦K,♠Q,♥Q,♦Q,♠10,♣10,♣9,♠8,♣7,♥6,♣6,♠5,♥5,♣4', 17, '♣J,♥7,♣8', '2026-05-09 07:37:27');
INSERT INTO `ddz_deal_logs_202605` VALUES (23, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 28, 2, '♥2,♣A,♣K,♣Q,♠J,♥10,♠9,♦9,♠7,♠6,♦6,♣5,♦4,♠3,♥3,♣3,♦3', 17, '', '2026-05-09 07:37:27');
INSERT INTO `ddz_deal_logs_202605` VALUES (24, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 15, 2, 'RJ,♣2,♦2,♠A,♥A,♠K,♥K,♥J,♦J,♦10,♥9,♥8,♦8,♦7,♦5,♠4,♥4', 17, '', '2026-05-09 07:37:27');
INSERT INTO `ddz_deal_logs_202605` VALUES (25, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, '♠2,♣2,♥K,♦K,♦Q,♦10,♠9,♣9,♦9,♠7,♥7,♥6,♣5,♦5,♦4,♠3,♦3', 17, '♦J,♥8,♥10', '2026-05-09 07:56:30');
INSERT INTO `ddz_deal_logs_202605` VALUES (26, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, '♥2,♦2,♠A,♣A,♦A,♣K,♥Q,♠10,♥9,♦8,♣7,♦6,♠5,♥5,♣4,♥3,♣3', 17, '', '2026-05-09 07:56:30');
INSERT INTO `ddz_deal_logs_202605` VALUES (27, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 'RJ,BJ,♥A,♠K,♠Q,♣Q,♠J,♥J,♣J,♣10,♠8,♣8,♦7,♠6,♣6,♠4,♥4', 17, '', '2026-05-09 07:56:30');
INSERT INTO `ddz_deal_logs_202605` VALUES (28, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 4, 1, 'RJ,♣2,♦2,♠A,♠K,♥K,♣J,♦J,♥10,♣9,♠7,♥7,♣6,♥5,♣4,♠3,♦3', 17, '♥6,♣A,♥A', '2026-05-09 07:57:58');
INSERT INTO `ddz_deal_logs_202605` VALUES (29, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 18, 2, 'BJ,♦A,♠Q,♥Q,♦Q,♥J,♠10,♦10,♦9,♠8,♣7,♦7,♦6,♠5,♦5,♠4,♥4', 17, '', '2026-05-09 07:57:58');
INSERT INTO `ddz_deal_logs_202605` VALUES (30, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 9, 2, '♠2,♥2,♣K,♦K,♣Q,♠J,♣10,♠9,♥9,♥8,♣8,♦8,♠6,♣5,♦4,♥3,♣3', 17, '', '2026-05-09 07:57:58');
INSERT INTO `ddz_deal_logs_202605` VALUES (31, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, '♣A,♦K,♠J,♥J,♦J,♥10,♦10,♣9,♠8,♥8,♦8,♦7,♠5,♦5,♠4,♣4,♦3', 17, '♥7,♠Q,♥Q', '2026-05-09 08:00:00');
INSERT INTO `ddz_deal_logs_202605` VALUES (32, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, '♠2,♥2,♣2,♠K,♦Q,♣J,♣10,♠9,♥9,♦9,♣8,♠7,♥6,♦6,♥5,♥4,♠3', 17, '', '2026-05-09 08:00:00');
INSERT INTO `ddz_deal_logs_202605` VALUES (33, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 'RJ,BJ,♦2,♠A,♥A,♦A,♥K,♣K,♣Q,♠10,♣7,♠6,♣6,♣5,♦4,♥3,♣3', 17, '', '2026-05-09 08:00:00');
INSERT INTO `ddz_deal_logs_202605` VALUES (34, '6cea2468-5824-4335-ac27-2a493ade9023', 4, 1, 'RJ,♥2,♦A,♠K,♥J,♦J,♥10,♣10,♦10,♠8,♦8,♦7,♠6,♠5,♠4,♦4,♦3', 17, '♥K,♠A,♠10', '2026-05-09 10:02:19');
INSERT INTO `ddz_deal_logs_202605` VALUES (35, '6cea2468-5824-4335-ac27-2a493ade9023', 26, 2, '♠2,♣2,♣A,♠Q,♣Q,♣J,♥9,♦9,♥8,♣8,♠7,♥7,♥6,♦6,♣5,♣4,♣3', 17, '', '2026-05-09 10:02:19');
INSERT INTO `ddz_deal_logs_202605` VALUES (36, '6cea2468-5824-4335-ac27-2a493ade9023', 32, 2, 'BJ,♦2,♥A,♣K,♦K,♥Q,♦Q,♠J,♠9,♣9,♣7,♣6,♥5,♦5,♥4,♠3,♥3', 17, '', '2026-05-09 10:02:19');
INSERT INTO `ddz_deal_logs_202605` VALUES (37, 'badcee84-ce2c-4272-8293-240f683be96a', 4, 1, '♠2,♥2,♠J,♣J,♠10,♣10,♥9,♣9,♠8,♦8,♠7,♠5,♥4,♦4,♥3,♣3,♦3', 17, '♣5,♥K,♥7', '2026-05-09 10:52:11');
INSERT INTO `ddz_deal_logs_202605` VALUES (38, 'badcee84-ce2c-4272-8293-240f683be96a', 13, 2, 'RJ,BJ,♣2,♥A,♣A,♦A,♦K,♥J,♦10,♠9,♦9,♣8,♣7,♠6,♥6,♦6,♥5', 17, '', '2026-05-09 10:52:11');
INSERT INTO `ddz_deal_logs_202605` VALUES (39, 'badcee84-ce2c-4272-8293-240f683be96a', 20, 2, '♦2,♠A,♠K,♣K,♠Q,♥Q,♣Q,♦Q,♦J,♥10,♥8,♦7,♣6,♦5,♠4,♣4,♠3', 17, '', '2026-05-09 10:52:11');
INSERT INTO `ddz_deal_logs_202605` VALUES (40, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, '♥2,♣2,♣A,♠K,♣K,♥Q,♣Q,♦Q,♥J,♥10,♠9,♣8,♥7,♣7,♦6,♥5,♥3', 17, '♥9,♠3,♣5', '2026-05-09 10:55:20');
INSERT INTO `ddz_deal_logs_202605` VALUES (41, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, '♠A,♥A,♦A,♥K,♦K,♠J,♠10,♣10,♦10,♦9,♠7,♦7,♥6,♠5,♦5,♦4,♣3', 17, '', '2026-05-09 10:55:20');
INSERT INTO `ddz_deal_logs_202605` VALUES (42, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 'RJ,BJ,♠2,♦2,♠Q,♣J,♦J,♣9,♠8,♥8,♦8,♠6,♣6,♠4,♥4,♣4,♦3', 17, '', '2026-05-09 10:55:20');
INSERT INTO `ddz_deal_logs_202605` VALUES (43, '8233eba0-e039-409f-b9e5-8bc9c960be63', 4, 1, 'BJ,♥2,♥A,♣K,♠Q,♠J,♥J,♥10,♠9,♥9,♦9,♠8,♦8,♥7,♣6,♠4,♠3', 17, '♥Q,♥8,♦K', '2026-05-09 10:57:41');
INSERT INTO `ddz_deal_logs_202605` VALUES (44, '8233eba0-e039-409f-b9e5-8bc9c960be63', 13, 2, '♠2,♣2,♦2,♣A,♦A,♠K,♥K,♣Q,♦Q,♣J,♣10,♣9,♣8,♦7,♠6,♥6,♥3', 17, '', '2026-05-09 10:57:41');
INSERT INTO `ddz_deal_logs_202605` VALUES (45, '8233eba0-e039-409f-b9e5-8bc9c960be63', 20, 2, 'RJ,♠A,♦J,♠10,♦10,♠7,♣7,♦6,♠5,♥5,♣5,♦5,♥4,♣4,♦4,♣3,♦3', 17, '', '2026-05-09 10:57:41');
INSERT INTO `ddz_deal_logs_202605` VALUES (46, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, '♠A,♣A,♣K,♠J,♠9,♥9,♦9,♥8,♣8,♠7,♣7,♦7,♠6,♥4,♣4,♥3,♦3', 17, '', '2026-05-09 11:41:50');
INSERT INTO `ddz_deal_logs_202605` VALUES (47, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 'RJ,BJ,♣2,♥A,♠K,♥K,♦K,♠Q,♥J,♠10,♥10,♠8,♥6,♦6,♠5,♠4,♠3', 17, '', '2026-05-09 11:41:50');
INSERT INTO `ddz_deal_logs_202605` VALUES (48, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, '♥2,♦2,♦A,♥Q,♣Q,♦Q,♣J,♦J,♣10,♦10,♣9,♦8,♥7,♣5,♦5,♦4,♣3', 17, '♥5,♣6,♠2', '2026-05-09 11:41:50');
INSERT INTO `ddz_deal_logs_202605` VALUES (49, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 4, 1, '♠2,♥2,♣2,♠A,♣A,♠K,♣K,♣Q,♣J,♣9,♥8,♦8,♠7,♣7,♥6,♣5,♦3', 17, '♦10,♠8,♥K', '2026-05-09 12:40:51');
INSERT INTO `ddz_deal_logs_202605` VALUES (50, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 31, 2, 'RJ,BJ,♥A,♦Q,♠J,♦J,♣10,♥9,♣8,♣6,♠5,♥5,♦5,♠4,♥4,♦4,♥3', 17, '', '2026-05-09 12:40:51');
INSERT INTO `ddz_deal_logs_202605` VALUES (51, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 26, 2, '♦2,♦A,♦K,♠Q,♥Q,♥J,♠10,♥10,♠9,♦9,♥7,♦7,♠6,♦6,♣4,♠3,♣3', 17, '', '2026-05-09 12:40:51');
INSERT INTO `ddz_deal_logs_202605` VALUES (52, 'b870234d-60a1-4515-89d9-506d78fed621', 4, 1, 'BJ,♣2,♦2,♣A,♦A,♣K,♦K,♦Q,♠J,♣J,♦J,♠10,♥10,♠8,♣6,♣4,♦3', 17, '♠4,RJ,♥4', '2026-05-09 13:40:56');
INSERT INTO `ddz_deal_logs_202605` VALUES (53, 'b870234d-60a1-4515-89d9-506d78fed621', 35, 2, '♠2,♥2,♣10,♦10,♥9,♣9,♥8,♦8,♠7,♥7,♠6,♠5,♣5,♦4,♠3,♥3,♣3', 17, '', '2026-05-09 13:40:56');
INSERT INTO `ddz_deal_logs_202605` VALUES (54, 'b870234d-60a1-4515-89d9-506d78fed621', 22, 2, '♠A,♥A,♠K,♥K,♠Q,♥Q,♣Q,♥J,♠9,♦9,♣8,♣7,♦7,♥6,♦6,♥5,♦5', 17, '', '2026-05-09 13:40:56');
INSERT INTO `ddz_deal_logs_202605` VALUES (55, 'f15d8dd9-db71-4038-992c-6206ccf7b4e9', 4, 1, 'RJ,♠2,♥2,♦A,♠Q,♦Q,♣J,♦J,♥10,♣10,♠9,♣9,♠7,♥6,♥5,♦5,♠3', 17, '♥J,♣5,♦7', '2026-05-09 13:42:41');
INSERT INTO `ddz_deal_logs_202605` VALUES (56, 'f15d8dd9-db71-4038-992c-6206ccf7b4e9', 35, 2, '♣2,♠A,♥K,♥Q,♠J,♠10,♠8,♣8,♦8,♣7,♣6,♠5,♠4,♥4,♣4,♦4,♣3', 17, '', '2026-05-09 13:42:41');
INSERT INTO `ddz_deal_logs_202605` VALUES (57, 'f15d8dd9-db71-4038-992c-6206ccf7b4e9', 22, 2, 'BJ,♦2,♥A,♣A,♠K,♣K,♦K,♣Q,♦10,♥9,♦9,♥8,♥7,♠6,♦6,♥3,♦3', 17, '', '2026-05-09 13:42:41');
INSERT INTO `ddz_deal_logs_202605` VALUES (58, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, '♠2,♣2,♠A,♣A,♦J,♠10,♥10,♦10,♠8,♣8,♦7,♠5,♣5,♦5,♣4,♠3,♥3', 17, '♠9,♥K,♠J', '2026-05-09 13:44:59');
INSERT INTO `ddz_deal_logs_202605` VALUES (59, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 35, 2, 'RJ,♥2,♦A,♥Q,♥J,♣10,♣9,♦9,♠7,♣7,♠6,♥6,♣6,♦6,♥5,♠4,♦4', 17, '', '2026-05-09 13:44:59');
INSERT INTO `ddz_deal_logs_202605` VALUES (60, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 22, 2, 'BJ,♦2,♥A,♠K,♣K,♦K,♠Q,♣Q,♦Q,♣J,♥9,♥8,♦8,♥7,♥4,♣3,♦3', 17, '', '2026-05-09 13:44:59');
INSERT INTO `ddz_deal_logs_202605` VALUES (61, 'b5e5bff5-9ece-4d3f-a9b7-dd08cc209811', 4, 1, 'BJ,♦2,♠A,♦A,♠K,♦K,♦Q,♠J,♣J,♦9,♥8,♦7,♠6,♣5,♠4,♥3,♣3', 17, '♣10,♦6,♥5', '2026-05-09 17:26:05');
INSERT INTO `ddz_deal_logs_202605` VALUES (62, 'b5e5bff5-9ece-4d3f-a9b7-dd08cc209811', 30, 2, 'RJ,♠2,♥2,♥K,♣Q,♥J,♥10,♠9,♥9,♣9,♣8,♥7,♣7,♠5,♦5,♥4,♦4', 17, '', '2026-05-09 17:26:05');
INSERT INTO `ddz_deal_logs_202605` VALUES (63, 'b5e5bff5-9ece-4d3f-a9b7-dd08cc209811', 32, 2, '♣2,♥A,♣A,♣K,♠Q,♥Q,♦J,♠10,♦10,♠8,♦8,♠7,♥6,♣6,♣4,♠3,♦3', 17, '', '2026-05-09 17:26:05');
INSERT INTO `ddz_deal_logs_202605` VALUES (64, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, '♠A,♣A,♦A,♣K,♠Q,♦Q,♠10,♥10,♦10,♣9,♦9,♠7,♣7,♣6,♥5,♥3,♣3', 17, '', '2026-05-09 17:28:07');
INSERT INTO `ddz_deal_logs_202605` VALUES (65, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 30, 1, 'RJ,♠2,♣2,♠K,♦K,♦J,♠9,♠8,♥8,♣8,♦8,♠6,♦6,♣5,♣4,♦4,♦3', 17, '♥K,♣8,♥10', '2026-05-09 17:28:07');
INSERT INTO `ddz_deal_logs_202605` VALUES (66, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 32, 2, 'BJ,♥2,♦2,♥A,♥Q,♣Q,♠J,♥J,♣10,♥9,♥7,♦7,♥6,♠5,♠4,♥4,♠3', 17, '', '2026-05-09 17:28:07');
INSERT INTO `ddz_deal_logs_202605` VALUES (67, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 'BJ,♠2,♣A,♦A,♠K,♥J,♠10,♦10,♥9,♣9,♦9,♦8,♦6,♣5,♠4,♣4,♠3', 17, '', '2026-05-09 17:28:07');
INSERT INTO `ddz_deal_logs_202605` VALUES (68, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 30, 1, 'RJ,♥2,♥A,♠Q,♥Q,♣Q,♠J,♦J,♣10,♠8,♥8,♣7,♦7,♥6,♦5,♥4,♦3', 17, '♥K,♣8,♥10', '2026-05-09 17:28:07');
INSERT INTO `ddz_deal_logs_202605` VALUES (69, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 32, 2, '♣2,♦2,♠A,♣K,♦K,♦Q,♣J,♠9,♠7,♥7,♠6,♣6,♠5,♥5,♦4,♥3,♣3', 17, '', '2026-05-09 17:28:07');
INSERT INTO `ddz_deal_logs_202605` VALUES (70, 'c44b172c-5710-4196-a4c1-d7b769aa31a0', 4, 2, '♦2,♣A,♦A,♥K,♠Q,♣Q,♠J,♦J,♠10,♠9,♣8,♠7,♦6,♠4,♥4,♠3,♥3', 17, '', '2026-05-09 17:40:29');
INSERT INTO `ddz_deal_logs_202605` VALUES (71, 'c44b172c-5710-4196-a4c1-d7b769aa31a0', 13, 1, 'BJ,♣2,♠A,♣K,♥Q,♥J,♣10,♠8,♥8,♦8,♥7,♣7,♦7,♠6,♣5,♦5,♣4', 17, '♣J,♦3,♠2', '2026-05-09 17:40:29');
INSERT INTO `ddz_deal_logs_202605` VALUES (72, 'c44b172c-5710-4196-a4c1-d7b769aa31a0', 18, 2, 'RJ,♥2,♥A,♠K,♦K,♦Q,♥10,♦10,♥9,♣9,♦9,♥6,♣6,♠5,♥5,♦4,♣3', 17, '', '2026-05-09 17:40:29');
INSERT INTO `ddz_deal_logs_202605` VALUES (73, '9da60f58-0604-4e0b-8a15-33462695b17a', 4, 2, '♥2,♦2,♠K,♦K,♦Q,♦J,♣10,♦10,♠8,♥8,♦8,♠6,♥6,♣6,♠4,♣4,♠3', 17, '', '2026-05-09 17:42:00');
INSERT INTO `ddz_deal_logs_202605` VALUES (74, '9da60f58-0604-4e0b-8a15-33462695b17a', 13, 1, 'RJ,♠2,♣2,♥A,♣A,♦A,♥K,♣K,♣Q,♠J,♥J,♦7,♠5,♥5,♥4,♥3,♦3', 17, '♠A,♥10,BJ', '2026-05-09 17:42:00');
INSERT INTO `ddz_deal_logs_202605` VALUES (75, '9da60f58-0604-4e0b-8a15-33462695b17a', 18, 2, '♠Q,♥Q,♣J,♠10,♠9,♥9,♣9,♦9,♣8,♠7,♥7,♣7,♦6,♣5,♦5,♦4,♣3', 17, '', '2026-05-09 17:42:00');
INSERT INTO `ddz_deal_logs_202605` VALUES (76, '88c11e7f-2e8a-4bcd-aceb-b18949955001', 4, 1, 'BJ,♠2,♥2,♠A,♣A,♦A,♦Q,♠J,♥J,♠10,♠7,♥7,♥5,♣5,♦4,♠3,♣3', 17, '♦3,♥A,♠6', '2026-05-09 17:43:22');
INSERT INTO `ddz_deal_logs_202605` VALUES (77, '88c11e7f-2e8a-4bcd-aceb-b18949955001', 13, 2, '♣2,♣K,♦K,♠Q,♥Q,♥10,♣10,♥9,♣9,♠8,♣8,♦8,♣7,♦7,♦6,♦5,♠4', 17, '', '2026-05-09 17:43:22');
INSERT INTO `ddz_deal_logs_202605` VALUES (78, '88c11e7f-2e8a-4bcd-aceb-b18949955001', 18, 2, 'RJ,♦2,♠K,♥K,♣Q,♣J,♦J,♦10,♠9,♦9,♥8,♥6,♣6,♠5,♥4,♣4,♥3', 17, '', '2026-05-09 17:43:22');
INSERT INTO `ddz_deal_logs_202605` VALUES (79, '703bc364-c84b-4cf5-9969-b19d80e7ff4a', 4, 1, 'RJ,♣2,♣A,♣K,♥Q,♣Q,♦Q,♠10,♣10,♦10,♥9,♦9,♥8,♥6,♦6,♥4,♣4', 17, '♦4,♦3,♠9', '2026-05-09 18:25:39');
INSERT INTO `ddz_deal_logs_202605` VALUES (80, '703bc364-c84b-4cf5-9969-b19d80e7ff4a', 10, 2, 'BJ,♠A,♦A,♠K,♥K,♦K,♠Q,♥J,♣9,♠8,♣7,♦7,♠6,♣6,♠5,♥5,♣3', 17, '', '2026-05-09 18:25:39');
INSERT INTO `ddz_deal_logs_202605` VALUES (81, '703bc364-c84b-4cf5-9969-b19d80e7ff4a', 9, 2, '♠2,♥2,♦2,♥A,♠J,♣J,♦J,♥10,♣8,♦8,♠7,♥7,♣5,♦5,♠4,♠3,♥3', 17, '', '2026-05-09 18:25:39');
INSERT INTO `ddz_deal_logs_202605` VALUES (82, '7991304a-adb1-4f2a-a35f-9684b655a58b', 4, 2, '♠2,♦2,♥A,♣Q,♦Q,♥10,♠9,♣9,♦8,♠7,♥7,♠5,♥5,♥4,♠3,♥3,♣3', 17, '', '2026-05-09 18:27:02');
INSERT INTO `ddz_deal_logs_202605` VALUES (83, '7991304a-adb1-4f2a-a35f-9684b655a58b', 10, 2, 'BJ,♣2,♠A,♠K,♣K,♦K,♠Q,♠J,♦J,♦10,♣8,♣7,♦7,♠6,♦6,♣5,♠4', 17, '', '2026-05-09 18:27:02');
INSERT INTO `ddz_deal_logs_202605` VALUES (84, '7991304a-adb1-4f2a-a35f-9684b655a58b', 9, 1, 'RJ,♥2,♣A,♦A,♥K,♥Q,♣J,♣10,♥9,♦9,♠8,♥8,♥6,♣6,♦5,♣4,♦3', 17, '♠K,♥K,♣7', '2026-05-09 18:27:02');
INSERT INTO `ddz_deal_logs_202605` VALUES (85, '7991304a-adb1-4f2a-a35f-9684b655a58b', 4, 2, 'RJ,BJ,♦2,♣A,♣K,♠Q,♣Q,♥J,♣J,♠9,♥9,♣9,♦9,♦6,♠5,♣4,♠3', 17, '', '2026-05-09 18:27:02');
INSERT INTO `ddz_deal_logs_202605` VALUES (86, '7991304a-adb1-4f2a-a35f-9684b655a58b', 10, 2, '♣2,♠A,♥A,♦K,♥Q,♦Q,♠J,♠10,♥10,♦10,♠8,♥8,♦7,♣6,♣5,♦4,♣3', 17, '', '2026-05-09 18:27:02');
INSERT INTO `ddz_deal_logs_202605` VALUES (87, '7991304a-adb1-4f2a-a35f-9684b655a58b', 9, 1, '♠2,♥2,♦A,♦J,♣10,♣8,♦8,♠7,♥7,♠6,♥6,♥5,♦5,♠4,♥4,♥3,♦3', 17, '♠K,♥K,♣7', '2026-05-09 18:27:02');
INSERT INTO `ddz_deal_logs_202605` VALUES (88, '06c0dd48-80e9-444d-ac2c-cad5641ced14', 4, 1, 'RJ,BJ,♠2,♣2,♠K,♥K,♠Q,♦Q,♣J,♠10,♣10,♠8,♥6,♠5,♣5,♠4,♥4', 17, '♥5,♥7,♥A', '2026-05-09 18:56:18');
INSERT INTO `ddz_deal_logs_202605` VALUES (89, '06c0dd48-80e9-444d-ac2c-cad5641ced14', 28, 2, '♥2,♠A,♣A,♦K,♥Q,♥J,♥10,♦10,♠9,♣9,♦9,♦8,♠7,♦7,♠6,♣6,♣3', 17, '', '2026-05-09 18:56:18');
INSERT INTO `ddz_deal_logs_202605` VALUES (90, '06c0dd48-80e9-444d-ac2c-cad5641ced14', 11, 2, '♦2,♦A,♣K,♣Q,♠J,♦J,♥9,♥8,♣8,♣7,♦6,♦5,♣4,♦4,♠3,♥3,♦3', 17, '', '2026-05-09 18:56:18');
INSERT INTO `ddz_deal_logs_202605` VALUES (91, '2958950a-2e7c-4c7f-a4f7-48efe569c1cb', 4, 1, '♠2,♥A,♣A,♦A,♥K,♦K,♠J,♠10,♣10,♥9,♣9,♦8,♥7,♣7,♦7,♣6,♣5', 17, '♠4,♥8,♥6', '2026-05-09 18:57:50');
INSERT INTO `ddz_deal_logs_202605` VALUES (92, '2958950a-2e7c-4c7f-a4f7-48efe569c1cb', 28, 2, '♥2,♣2,♠A,♣K,♠Q,♣J,♦10,♠9,♠8,♠6,♠5,♥5,♦5,♥4,♣4,♦4,♥3', 17, '', '2026-05-09 18:57:50');
INSERT INTO `ddz_deal_logs_202605` VALUES (93, '2958950a-2e7c-4c7f-a4f7-48efe569c1cb', 11, 2, 'RJ,BJ,♦2,♠K,♥Q,♣Q,♦Q,♥J,♦J,♥10,♦9,♣8,♠7,♦6,♠3,♣3,♦3', 17, '', '2026-05-09 18:57:50');
INSERT INTO `ddz_deal_logs_202605` VALUES (94, '4b8fc93e-6a20-4686-80b5-b7dd1abd669a', 4, 1, 'BJ,♠2,♥K,♦K,♥Q,♦J,♥10,♣10,♦9,♦8,♠7,♣7,♠6,♣6,♥5,♣4,♣3', 17, '♥6,♥8,♣A', '2026-05-09 18:58:56');
INSERT INTO `ddz_deal_logs_202605` VALUES (95, '4b8fc93e-6a20-4686-80b5-b7dd1abd669a', 28, 2, 'RJ,♥2,♦2,♠K,♣K,♠Q,♣Q,♦Q,♣J,♠9,♣9,♣8,♦7,♦6,♣5,♠4,♦4', 17, '', '2026-05-09 18:58:56');
INSERT INTO `ddz_deal_logs_202605` VALUES (96, '4b8fc93e-6a20-4686-80b5-b7dd1abd669a', 11, 2, '♣2,♠A,♥A,♦A,♠J,♥J,♠10,♦10,♥9,♠8,♥7,♠5,♦5,♥4,♠3,♥3,♦3', 17, '', '2026-05-09 18:58:56');
INSERT INTO `ddz_deal_logs_202605` VALUES (97, 'bdeab0b5-da80-4e6c-abe9-cd2de37429dd', 4, 1, 'RJ,♥2,♣2,♣A,♥K,♣K,♥Q,♣J,♠10,♣10,♣9,♦9,♠8,♥8,♥7,♥6,♦3', 17, '♦6,♥J,♦7', '2026-05-09 19:11:13');
INSERT INTO `ddz_deal_logs_202605` VALUES (98, 'bdeab0b5-da80-4e6c-abe9-cd2de37429dd', 16, 2, 'BJ,♠2,♦2,♠K,♦K,♠Q,♣Q,♦J,♥10,♦10,♣8,♠6,♣6,♣4,♦4,♥3,♣3', 17, '', '2026-05-09 19:11:13');
INSERT INTO `ddz_deal_logs_202605` VALUES (99, 'bdeab0b5-da80-4e6c-abe9-cd2de37429dd', 27, 2, '♠A,♥A,♦A,♦Q,♠J,♠9,♥9,♦8,♠7,♣7,♠5,♥5,♣5,♦5,♠4,♥4,♠3', 17, '', '2026-05-09 19:11:13');
INSERT INTO `ddz_deal_logs_202605` VALUES (100, 'ad4c3293-6367-4215-aac5-a11e1885dff6', 4, 2, 'RJ,BJ,♥2,♥A,♣A,♦A,♣K,♣J,♣10,♦8,♦7,♣6,♦6,♥5,♣5,♠3,♥3', 17, '', '2026-05-09 19:12:38');
INSERT INTO `ddz_deal_logs_202605` VALUES (101, 'ad4c3293-6367-4215-aac5-a11e1885dff6', 16, 1, '♣2,♠A,♣Q,♦Q,♠J,♦J,♥10,♠9,♥9,♠8,♥8,♠7,♥7,♣7,♠6,♥6,♠4', 17, '♠5,♦K,♥4', '2026-05-09 19:12:38');
INSERT INTO `ddz_deal_logs_202605` VALUES (102, 'ad4c3293-6367-4215-aac5-a11e1885dff6', 27, 2, '♠2,♦2,♠K,♥K,♠Q,♥Q,♥J,♠10,♦10,♣9,♦9,♣8,♦5,♣4,♦4,♣3,♦3', 17, '', '2026-05-09 19:12:38');
INSERT INTO `ddz_deal_logs_202605` VALUES (103, 'af00acc2-79c0-4889-8104-921837288f71', 4, 1, 'BJ,♥2,♦A,♠K,♦Q,♣J,♦J,♠10,♥10,♦10,♣9,♠8,♥8,♣7,♦7,♠6,♦3', 17, '♠4,♣6,♦5', '2026-05-09 19:13:44');
INSERT INTO `ddz_deal_logs_202605` VALUES (104, 'af00acc2-79c0-4889-8104-921837288f71', 16, 2, '♠2,♣2,♦2,♠A,♣A,♦K,♥Q,♣Q,♠J,♥9,♦8,♠7,♥7,♠5,♥5,♣4,♥3', 17, '', '2026-05-09 19:13:44');
INSERT INTO `ddz_deal_logs_202605` VALUES (105, 'af00acc2-79c0-4889-8104-921837288f71', 27, 2, 'RJ,♥A,♥K,♣K,♠Q,♥J,♣10,♠9,♦9,♣8,♥6,♦6,♣5,♥4,♦4,♠3,♣3', 17, '', '2026-05-09 19:13:44');
INSERT INTO `ddz_deal_logs_202605` VALUES (106, 'a28b1f83-b336-45f6-bd19-30ced58225aa', 4, 1, 'RJ,BJ,♥2,♦2,♠K,♣K,♦K,♥J,♣J,♦J,♠10,♣10,♣9,♠8,♠6,♦4,♦3', 17, '♥8,♠J,♥A', '2026-05-09 19:30:42');
INSERT INTO `ddz_deal_logs_202605` VALUES (107, 'a28b1f83-b336-45f6-bd19-30ced58225aa', 33, 2, '♠2,♣2,♦A,♥Q,♦Q,♥10,♠9,♥9,♦8,♣7,♥6,♦6,♠5,♠4,♣4,♥3,♣3', 17, '', '2026-05-09 19:30:42');
INSERT INTO `ddz_deal_logs_202605` VALUES (108, 'a28b1f83-b336-45f6-bd19-30ced58225aa', 36, 2, '♠A,♣A,♥K,♠Q,♣Q,♦10,♦9,♣8,♠7,♥7,♦7,♣6,♥5,♣5,♦5,♥4,♠3', 17, '', '2026-05-09 19:30:42');
INSERT INTO `ddz_deal_logs_202605` VALUES (109, '5d03e671-2560-41d2-850f-bd2b09762ccd', 4, 1, 'BJ,♦2,♣A,♦A,♥Q,♦Q,♠10,♣9,♦9,♠8,♦8,♥7,♣7,♥5,♣5,♠4,♣3', 17, '♥6,♥9,♥3', '2026-05-09 19:32:07');
INSERT INTO `ddz_deal_logs_202605` VALUES (110, '5d03e671-2560-41d2-850f-bd2b09762ccd', 33, 2, 'RJ,♥2,♥A,♠K,♥K,♦K,♠J,♦J,♥10,♠9,♣8,♦7,♠6,♣6,♦6,♦4,♠3', 17, '', '2026-05-09 19:32:07');
INSERT INTO `ddz_deal_logs_202605` VALUES (111, '5d03e671-2560-41d2-850f-bd2b09762ccd', 36, 2, '♠2,♣2,♠A,♣K,♠Q,♣Q,♥J,♣J,♣10,♦10,♥8,♠7,♠5,♦5,♥4,♣4,♦3', 17, '', '2026-05-09 19:32:07');
INSERT INTO `ddz_deal_logs_202605` VALUES (112, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, '♠2,♥2,♦2,♥A,♦K,♠J,♣J,♠10,♥10,♠9,♠8,♦8,♥7,♣6,♣4,♦4,♦3', 17, '♥K,♣K,♦5', '2026-05-09 19:34:01');
INSERT INTO `ddz_deal_logs_202605` VALUES (113, 'feba73e8-abd2-4334-ad9e-86f282917718', 33, 2, 'RJ,♠A,♠K,♠Q,♥Q,♦10,♥9,♣9,♣8,♦7,♠6,♥6,♦6,♣5,♠4,♥3,♣3', 17, '', '2026-05-09 19:34:01');
INSERT INTO `ddz_deal_logs_202605` VALUES (114, 'feba73e8-abd2-4334-ad9e-86f282917718', 36, 2, 'BJ,♣2,♣A,♦A,♣Q,♦Q,♥J,♦J,♣10,♦9,♥8,♠7,♣7,♠5,♥5,♥4,♠3', 17, '', '2026-05-09 19:34:01');
INSERT INTO `ddz_deal_logs_202605` VALUES (115, 'bffbb2a8-0db6-44f4-a26c-67daaf2cdd12', 4, 2, '♠2,♦2,♠Q,♦Q,♥J,♠10,♦10,♠9,♥9,♣9,♥8,♣8,♥6,♥5,♣5,♦5,♣3', 17, '', '2026-05-09 21:56:11');
INSERT INTO `ddz_deal_logs_202605` VALUES (116, 'bffbb2a8-0db6-44f4-a26c-67daaf2cdd12', 30, 1, 'RJ,♣2,♥A,♣A,♦A,♠K,♥K,♣K,♥Q,♦9,♦8,♠7,♣7,♠6,♦6,♦4,♠3', 17, '♥4,♠4,♣J', '2026-05-09 21:56:11');
INSERT INTO `ddz_deal_logs_202605` VALUES (117, 'bffbb2a8-0db6-44f4-a26c-67daaf2cdd12', 23, 2, 'BJ,♥2,♠A,♦K,♣Q,♠J,♦J,♥10,♣10,♠8,♥7,♦7,♣6,♠5,♣4,♥3,♦3', 17, '', '2026-05-09 21:56:11');
INSERT INTO `ddz_deal_logs_202605` VALUES (118, '4ea1053a-b691-4285-b23a-177a74b7010c', 4, 2, 'RJ,BJ,♠K,♥K,♦K,♣Q,♥10,♣10,♦10,♥9,♣7,♥6,♥5,♦4,♠3,♣3,♦3', 17, '', '2026-05-09 21:57:46');
INSERT INTO `ddz_deal_logs_202605` VALUES (119, '4ea1053a-b691-4285-b23a-177a74b7010c', 30, 2, '♠2,♥2,♣2,♦2,♦A,♥Q,♠J,♣J,♦J,♠9,♣9,♠8,♥8,♦8,♠7,♦6,♠5', 17, '', '2026-05-09 21:57:46');
INSERT INTO `ddz_deal_logs_202605` VALUES (120, '4ea1053a-b691-4285-b23a-177a74b7010c', 23, 1, '♣A,♣K,♠Q,♦Q,♥J,♠10,♦9,♥7,♦7,♠6,♣6,♣5,♦5,♠4,♥4,♣4,♥3', 17, '♣8,♥A,♠A', '2026-05-09 21:57:46');
INSERT INTO `ddz_deal_logs_202605` VALUES (121, '1847ebc2-108d-4762-981c-cde9b6a9d6b5', 4, 1, '♦2,♠A,♦A,♠Q,♠J,♣J,♠10,♠9,♥9,♦9,♥8,♥7,♣6,♠5,♣5,♦5,♥3', 17, '♦K,♣9,BJ', '2026-05-09 21:58:52');
INSERT INTO `ddz_deal_logs_202605` VALUES (122, '1847ebc2-108d-4762-981c-cde9b6a9d6b5', 30, 2, '♠2,♥2,♥A,♣A,♠K,♣K,♥Q,♦Q,♥J,♥10,♣10,♦10,♠7,♦7,♥6,♠4,♠3', 17, '', '2026-05-09 21:58:52');
INSERT INTO `ddz_deal_logs_202605` VALUES (123, '1847ebc2-108d-4762-981c-cde9b6a9d6b5', 23, 2, 'RJ,♣2,♥K,♣Q,♦J,♠8,♣8,♦8,♣7,♠6,♦6,♥5,♥4,♣4,♦4,♣3,♦3', 17, '', '2026-05-09 21:58:52');

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
  `started_at` datetime(3) NULL DEFAULT NULL COMMENT '开始时间',
  `ended_at` datetime(3) NULL DEFAULT NULL COMMENT '结束时间',
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
  `room_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '房间号',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_ddz_game_records_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_ddz_game_records_room_id`(`room_id` ASC) USING BTREE,
  INDEX `idx_ddz_game_records_landlord_id`(`landlord_id` ASC) USING BTREE,
  INDEX `idx_ddz_game_records_farmer1_id`(`farmer1_id` ASC) USING BTREE,
  INDEX `idx_ddz_game_records_farmer2_id`(`farmer2_id` ASC) USING BTREE,
  INDEX `idx_ddz_game_records_result`(`result` ASC) USING BTREE,
  INDEX `idx_ddz_game_records_started_at`(`started_at` ASC) USING BTREE,
  INDEX `idx_ddz_game_records_deleted_at`(`deleted_at` ASC) USING BTREE,
  INDEX `idx_ddz_game_records_room_code`(`room_code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 180 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_game_records
-- ----------------------------
INSERT INTO `ddz_game_records` VALUES (107, 'e186aeb1-cb87-4155-8f50-fe99999b91bd', '122883', 1, 1, 4, 7, 5, 10, 8, 1, 1, 1, 160, 160, -80, -80, -80, -80, '2026-05-03 15:57:16.000', '2026-05-03 15:58:52.000', 102, '2026-05-03 15:58:52', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (108, '7d22378f-611a-4734-ab3a-b3ead343abc3', '133037', 1, 1, 7, 5, 4, 10, 16, 0, 1, 1, 320, 320, -160, -160, -160, -160, '2026-05-03 16:05:01.000', '2026-05-03 16:06:21.000', 85, '2026-05-03 16:06:20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (109, '43367ac3-124e-44e6-b969-17533f6a5919', '780254', 1, 1, 4, 7, 5, 10, 2, 0, 0, 1, 40, 40, -20, -20, -20, -20, '2026-05-03 16:54:13.000', '2026-05-03 16:57:24.000', 204, '2026-05-03 16:57:24', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (110, '1596baf7-5ee5-4386-9f67-1b52c7e70d42', '305270', 1, 1, 7, 4, 5, 10, 8, 0, 0, 1, 160, 160, -80, -80, -80, -80, '2026-05-03 17:07:17.000', '2026-05-03 17:09:01.000', 108, '2026-05-03 17:09:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (111, '501e74a7-8797-4b4a-a408-58c42472e050', '320067', 1, 1, 5, 7, 4, 10, 8, 1, 1, 1, 160, 160, -80, -80, -80, -80, '2026-05-03 17:44:13.000', '2026-05-03 17:45:40.000', 92, '2026-05-03 17:45:40', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (112, 'c900cd1d-eabc-4fdd-8583-c343e329e018', '125886', 1, 1, 5, 7, 4, 10, 16, 0, 0, 1, 320, 320, -160, -160, -160, -160, '2026-05-03 18:19:08.000', '2026-05-03 18:20:26.000', 82, '2026-05-03 18:20:25', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (113, 'c56e3967-fad4-42cd-90e7-a5ed8f5a094d', '657624', 1, 1, 4, 5, 7, 10, 16, 1, 0, 1, 320, 320, -160, -160, -160, -160, '2026-05-03 18:44:44.000', '2026-05-03 18:48:00.000', 210, '2026-05-03 18:48:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (114, '84915987-21e0-44f1-98bf-f22c025aba8d', '465832', 1, 1, 5, 4, 7, 10, 8, 1, 0, 1, 160, 160, -80, -80, -80, -80, '2026-05-03 18:55:50.000', '2026-05-03 18:57:22.000', 100, '2026-05-03 18:57:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (115, '3ad5d0d0-6f10-4012-91f7-82ad7b4e56b8', '753739', 1, 1, 7, 5, 4, 10, 16, 0, 0, 2, -320, -320, 160, 160, 160, 160, '2026-05-03 19:02:24.000', '2026-05-03 19:04:18.000', 120, '2026-05-03 19:04:17', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (116, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', '197768', 1, 1, 4, 16, 17, 10, 2, 0, 0, 1, 40, 40, -20, -20, -20, -20, '2026-05-08 11:05:03.000', '2026-05-08 11:05:56.000', 56, '2026-05-08 11:05:55', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (117, '480201d0-27e4-4cd7-85bc-160271faae9c', '021367', 1, 1, 4, 14, 13, 10, 4, 1, 0, 1, 80, 80, -40, -40, -40, -40, '2026-05-08 11:35:02.000', '2026-05-08 11:35:56.000', 57, '2026-05-08 11:35:56', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (118, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', '376010', 1, 1, 4, 15, 18, 10, 4, 1, 0, 1, 80, 80, -40, -40, -40, -40, '2026-05-08 12:25:07.000', '2026-05-08 12:26:30.000', 87, '2026-05-08 12:26:29', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (119, 'e7309f46-5b26-4ec5-815d-021542736243', '565888', 1, 1, 4, 13, 17, 10, 4, 1, 0, 1, 80, 80, -40, -40, -40, -40, '2026-05-08 13:35:49.000', '2026-05-08 13:36:24.000', 38, '2026-05-08 13:36:23', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (120, 'd92cc4de-649b-45bc-821c-15f1fd910872', '023668', 1, 1, 4, 12, 14, 10, 4, 0, 1, 1, 80, 80, -40, -40, -40, -40, '2026-05-08 14:00:02.000', '2026-05-08 14:03:51.000', 243, '2026-05-08 14:03:50', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (121, '71065836-67bf-4479-a527-f59219f0963a', '704948', 1, 1, 4, 16, 15, 10, 4, 0, 1, 1, 80, 80, -40, -40, -40, -40, '2026-05-08 14:15:02.000', '2026-05-08 14:16:38.000', 101, '2026-05-08 14:16:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (122, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', '560873', 1, 1, 4, 10, 9, 10, 8, 1, 1, 1, 160, 160, -80, -80, -80, -80, '2026-05-08 14:45:26.000', '2026-05-08 14:45:59.000', 34, '2026-05-08 14:45:58', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (123, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', '904184', 1, 1, 4, 9, 17, 10, 8, 1, 0, 1, 160, 160, -80, -80, -80, -80, '2026-05-08 15:00:03.000', '2026-05-08 15:01:32.000', 92, '2026-05-08 15:01:31', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (124, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', '288465', 1, 1, 4, 20, 21, 10, 8, 0, 0, 1, 160, 160, -80, -80, -80, -80, '2026-05-08 15:10:39.000', '2026-05-08 15:11:18.000', 40, '2026-05-08 15:11:17', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (125, 'a7c7b979-980e-4a20-973a-a9672e334ab5', '400847', 1, 1, 19, 4, 25, 10, 4, 0, 1, 1, 80, 80, -40, -40, -40, -40, '2026-05-08 15:35:04.000', '2026-05-08 15:36:30.000', 88, '2026-05-08 15:36:29', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (159, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', '836744', 1, 1, 4, 33, 38, 10, 8, 0, 0, 1, 160, 160, -80, -80, -80, -80, '2026-05-08 16:10:03.000', '2026-05-08 16:10:37.000', 36, '2026-05-08 16:10:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (163, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', '655355', 1, 1, 4, 10, 14, 10, 4, 1, 0, 1, 80, 80, -40, -40, -40, -40, '2026-05-08 16:25:03.000', '2026-05-08 16:25:36.000', 34, '2026-05-08 16:25:35', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (170, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', '663807', 1, 1, 4, 24, 22, 10, 16, 1, 0, 1, 320, 320, -160, -160, -160, -160, '2026-05-08 16:50:02.000', '2026-05-08 16:50:49.000', 48, '2026-05-08 16:50:48', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (177, 'c0bec0d2-1732-46cc-b8f3-db308ee734ef', '592012', 1, 1, 4, 34, 21, 10, 4, 0, 0, 1, 80, 80, -40, -40, -40, -40, '2026-05-08 19:15:16.000', '2026-05-08 19:15:51.000', 38, '2026-05-08 19:15:51', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (178, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', '592012', 1, 1, 4, 34, 21, 10, 2, 0, 0, 1, 40, 40, -20, -20, -20, -20, '2026-05-08 19:16:21.000', '2026-05-08 19:17:03.000', 46, '2026-05-08 19:17:03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');
INSERT INTO `ddz_game_records` VALUES (179, 'e2d74440-2c02-46f2-be82-e28517e09314', '592012', 1, 1, 4, 34, 21, 10, 4, 0, 0, 1, 80, 80, -40, -40, -40, -40, '2026-05-08 19:17:31.000', '2026-05-08 19:18:14.000', 45, '2026-05-08 19:18:15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '');

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
) ENGINE = InnoDB AUTO_INCREMENT = 40 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '游戏记录表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_game_records_202605
-- ----------------------------
INSERT INTO `ddz_game_records_202605` VALUES (1, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', '463452', '', 1, 1, 4, 17, 35, 10, 16, 1, 0, 1, 320, -160, -160, 320, -160, -160, '2026-05-08 20:25:08', '2026-05-08 20:25:55', 51, '2026-05-08 20:25:55');
INSERT INTO `ddz_game_records_202605` VALUES (2, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', '463452', '', 1, 1, 4, 17, 35, 10, 4, 0, 0, 1, 80, -40, -40, 80, -40, -40, '2026-05-08 20:26:22', '2026-05-08 20:26:59', 38, '2026-05-08 20:26:59');
INSERT INTO `ddz_game_records_202605` VALUES (3, '7e9bf02e-5576-465b-8c6d-4ae863483969', '463452', '', 1, 1, 4, 17, 35, 10, 4, 0, 0, 1, 80, -40, -40, 80, -40, -40, '2026-05-08 20:27:26', '2026-05-08 20:28:12', 48, '2026-05-08 20:28:12');
INSERT INTO `ddz_game_records_202605` VALUES (4, '7bcd73b9-4007-4e78-930e-721936c88248', '190389', '', 1, 1, 4, 31, 29, 10, 8, 0, 0, 1, 160, -80, -80, 160, -80, -80, '2026-05-09 07:20:44', '2026-05-09 07:21:30', 48, '2026-05-09 07:21:30');
INSERT INTO `ddz_game_records_202605` VALUES (5, '277c55b0-7752-4f83-8b5a-c44b4eec2370', '190389', '', 1, 1, 4, 31, 29, 10, 8, 1, 0, 1, 160, -80, -80, 160, -80, -80, '2026-05-09 07:21:58', '2026-05-09 07:23:00', 64, '2026-05-09 07:23:00');
INSERT INTO `ddz_game_records_202605` VALUES (6, 'ff1c49e3-918c-4a72-8bad-747def826d60', '190389', '', 1, 1, 4, 31, 29, 10, 8, 1, 0, 1, 160, -80, -80, 160, -80, -80, '2026-05-09 07:23:29', '2026-05-09 07:24:21', 53, '2026-05-09 07:24:21');
INSERT INTO `ddz_game_records_202605` VALUES (7, '8c7441a4-43c5-4000-8d41-6c57090bb760', '737575', '', 1, 1, 4, 28, 15, 10, 4, 0, 0, 1, 80, -40, -40, 80, -40, -40, '2026-05-09 07:35:02', '2026-05-09 07:35:53', 53, '2026-05-09 07:35:52');
INSERT INTO `ddz_game_records_202605` VALUES (8, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', '737575', '', 1, 1, 4, 28, 15, 10, 4, 1, 0, 1, 80, -40, -40, 80, -40, -40, '2026-05-09 07:36:21', '2026-05-09 07:37:27', 68, '2026-05-09 07:37:27');
INSERT INTO `ddz_game_records_202605` VALUES (9, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', '248151', '', 1, 1, 4, 18, 9, 10, 4, 0, 0, 2, -80, 40, 40, -80, 40, 40, '2026-05-09 07:55:02', '2026-05-09 07:56:30', 91, '2026-05-09 07:56:30');
INSERT INTO `ddz_game_records_202605` VALUES (10, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', '248151', '', 1, 1, 4, 18, 9, 10, 4, 0, 0, 1, 80, -40, -40, 80, -40, -40, '2026-05-09 07:56:59', '2026-05-09 07:57:59', 62, '2026-05-09 07:57:58');
INSERT INTO `ddz_game_records_202605` VALUES (11, '35eb32d2-b096-4804-aee9-201b886ed4f3', '248151', '', 1, 1, 4, 18, 9, 10, 2, 0, 0, 2, -40, 20, 20, -40, 20, 20, '2026-05-09 07:58:29', '2026-05-09 08:00:00', 95, '2026-05-09 08:00:00');
INSERT INTO `ddz_game_records_202605` VALUES (12, '6cea2468-5824-4335-ac27-2a493ade9023', '480322', '', 1, 1, 4, 26, 32, 10, 2, 0, 0, 1, 40, -20, -20, 40, -20, -20, '2026-05-09 10:00:02', '2026-05-09 10:02:19', 145, '2026-05-09 10:02:19');
INSERT INTO `ddz_game_records_202605` VALUES (13, 'badcee84-ce2c-4272-8293-240f683be96a', '172550', '', 1, 1, 4, 13, 20, 10, 2, 0, 0, 2, -40, 20, 20, -40, 20, 20, '2026-05-09 10:50:40', '2026-05-09 10:52:12', 96, '2026-05-09 10:52:11');
INSERT INTO `ddz_game_records_202605` VALUES (14, '856497fa-f927-4306-879f-0b1c4b0596dc', '172550', '', 1, 1, 4, 13, 20, 10, 2, 0, 0, 2, -40, 20, 20, -40, 20, 20, '2026-05-09 10:52:40', '2026-05-09 10:55:20', 169, '2026-05-09 10:55:20');
INSERT INTO `ddz_game_records_202605` VALUES (15, '8233eba0-e039-409f-b9e5-8bc9c960be63', '172550', '', 1, 1, 4, 13, 20, 10, 2, 0, 0, 2, -40, 20, 20, -40, 20, 20, '2026-05-09 10:55:48', '2026-05-09 10:57:41', 120, '2026-05-09 10:57:41');
INSERT INTO `ddz_game_records_202605` VALUES (16, 'ecc59607-3422-478d-9290-b22f79890c76', '057940', '', 1, 1, 11, 4, 14, 10, 8, 0, 0, 1, 160, -80, -80, 160, -80, -80, '2026-05-09 11:40:01', '2026-05-09 11:41:50', 116, '2026-05-09 11:41:50');
INSERT INTO `ddz_game_records_202605` VALUES (17, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', '441624', '', 1, 1, 4, 31, 26, 10, 2, 0, 0, 1, 40, -20, -20, 40, -20, -20, '2026-05-09 12:40:10', '2026-05-09 12:40:51', 45, '2026-05-09 12:40:51');
INSERT INTO `ddz_game_records_202605` VALUES (18, 'b870234d-60a1-4515-89d9-506d78fed621', '392964', '', 1, 1, 4, 35, 22, 10, 8, 1, 0, 1, 160, -80, -80, 160, -80, -80, '2026-05-09 13:40:06', '2026-05-09 13:40:56', 54, '2026-05-09 13:40:56');
INSERT INTO `ddz_game_records_202605` VALUES (19, 'f15d8dd9-db71-4038-992c-6206ccf7b4e9', '392964', '', 1, 1, 4, 35, 22, 10, 2, 0, 0, 1, 40, -20, -20, 40, -20, -20, '2026-05-09 13:41:25', '2026-05-09 13:42:41', 79, '2026-05-09 13:42:41');
INSERT INTO `ddz_game_records_202605` VALUES (20, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', '392964', '', 1, 1, 4, 35, 22, 10, 2, 0, 0, 2, -40, 20, 20, -40, 20, 20, '2026-05-09 13:43:10', '2026-05-09 13:44:59', 116, '2026-05-09 13:44:59');
INSERT INTO `ddz_game_records_202605` VALUES (21, 'b5e5bff5-9ece-4d3f-a9b7-dd08cc209811', '919930', '', 1, 1, 4, 30, 32, 10, 8, 0, 0, 1, 160, -80, -80, 160, -80, -80, '2026-05-09 17:25:02', '2026-05-09 17:26:05', 68, '2026-05-09 17:26:05');
INSERT INTO `ddz_game_records_202605` VALUES (22, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', '919930', '', 1, 1, 30, 4, 32, 10, 2, 0, 0, 2, -40, 20, 20, -40, 20, 20, '2026-05-09 17:26:33', '2026-05-09 17:28:07', 101, '2026-05-09 17:28:07');
INSERT INTO `ddz_game_records_202605` VALUES (23, 'c44b172c-5710-4196-a4c1-d7b769aa31a0', '987195', '', 1, 1, 13, 4, 18, 10, 2, 0, 0, 1, 40, -20, -20, 40, -20, -20, '2026-05-09 17:40:02', '2026-05-09 17:40:29', 29, '2026-05-09 17:40:29');
INSERT INTO `ddz_game_records_202605` VALUES (24, '9da60f58-0604-4e0b-8a15-33462695b17a', '987195', '', 1, 1, 13, 4, 18, 10, 4, 0, 0, 1, 80, -40, -40, 80, -40, -40, '2026-05-09 17:40:57', '2026-05-09 17:42:00', 68, '2026-05-09 17:42:00');
INSERT INTO `ddz_game_records_202605` VALUES (25, '88c11e7f-2e8a-4bcd-aceb-b18949955001', '987195', '', 1, 1, 4, 13, 18, 10, 2, 0, 0, 1, 40, -20, -20, 40, -20, -20, '2026-05-09 17:42:28', '2026-05-09 17:43:22', 58, '2026-05-09 17:43:22');
INSERT INTO `ddz_game_records_202605` VALUES (26, '703bc364-c84b-4cf5-9969-b19d80e7ff4a', '614656', '', 1, 1, 4, 10, 9, 10, 2, 0, 0, 1, 40, -20, -20, 40, -20, -20, '2026-05-09 18:25:04', '2026-05-09 18:25:39', 37, '2026-05-09 18:25:39');
INSERT INTO `ddz_game_records_202605` VALUES (27, '7991304a-adb1-4f2a-a35f-9684b655a58b', '614656', '', 1, 1, 9, 4, 10, 10, 16, 1, 0, 2, -320, 160, 160, -320, 160, 160, '2026-05-09 18:26:07', '2026-05-09 18:27:02', 60, '2026-05-09 18:27:02');
INSERT INTO `ddz_game_records_202605` VALUES (28, '06c0dd48-80e9-444d-ac2c-cad5641ced14', '273798', '', 1, 1, 4, 28, 11, 10, 4, 1, 0, 1, 80, -40, -40, 80, -40, -40, '2026-05-09 18:55:40', '2026-05-09 18:56:18', 40, '2026-05-09 18:56:18');
INSERT INTO `ddz_game_records_202605` VALUES (29, '2958950a-2e7c-4c7f-a4f7-48efe569c1cb', '273798', '', 1, 1, 4, 28, 11, 10, 2, 0, 0, 1, 40, -20, -20, 40, -20, -20, '2026-05-09 18:56:46', '2026-05-09 18:57:51', 70, '2026-05-09 18:57:50');
INSERT INTO `ddz_game_records_202605` VALUES (30, '4b8fc93e-6a20-4686-80b5-b7dd1abd669a', '273798', '', 1, 1, 4, 28, 11, 10, 2, 0, 0, 1, 40, -20, -20, 40, -20, -20, '2026-05-09 18:58:18', '2026-05-09 18:58:57', 41, '2026-05-09 18:58:56');
INSERT INTO `ddz_game_records_202605` VALUES (31, 'bdeab0b5-da80-4e6c-abe9-cd2de37429dd', '734098', '', 1, 1, 4, 16, 27, 10, 2, 0, 0, 1, 40, -20, -20, 40, -20, -20, '2026-05-09 19:10:04', '2026-05-09 19:11:13', 73, '2026-05-09 19:11:13');
INSERT INTO `ddz_game_records_202605` VALUES (32, 'ad4c3293-6367-4215-aac5-a11e1885dff6', '734098', '', 1, 1, 16, 4, 27, 10, 16, 1, 0, 2, -320, 160, 160, -320, 160, 160, '2026-05-09 19:11:40', '2026-05-09 19:12:38', 62, '2026-05-09 19:12:38');
INSERT INTO `ddz_game_records_202605` VALUES (33, 'af00acc2-79c0-4889-8104-921837288f71', '734098', '', 1, 1, 4, 16, 27, 10, 2, 0, 0, 1, 40, -20, -20, 40, -20, -20, '2026-05-09 19:13:05', '2026-05-09 19:13:44', 41, '2026-05-09 19:13:44');
INSERT INTO `ddz_game_records_202605` VALUES (34, 'a28b1f83-b336-45f6-bd19-30ced58225aa', '372853', '', 1, 1, 4, 33, 36, 10, 32, 2, 0, 1, 640, -320, -320, 640, -320, -320, '2026-05-09 19:30:01', '2026-05-09 19:30:42', 45, '2026-05-09 19:30:42');
INSERT INTO `ddz_game_records_202605` VALUES (35, '5d03e671-2560-41d2-850f-bd2b09762ccd', '372853', '', 1, 1, 4, 33, 36, 10, 2, 0, 0, 2, -40, 20, 20, -40, 20, 20, '2026-05-09 19:31:12', '2026-05-09 19:32:08', 61, '2026-05-09 19:32:07');
INSERT INTO `ddz_game_records_202605` VALUES (36, 'feba73e8-abd2-4334-ad9e-86f282917718', '372853', '', 1, 1, 4, 33, 36, 10, 4, 0, 0, 1, 80, -40, -40, 80, -40, -40, '2026-05-09 19:32:35', '2026-05-09 19:34:01', 93, '2026-05-09 19:34:01');
INSERT INTO `ddz_game_records_202605` VALUES (37, 'bffbb2a8-0db6-44f4-a26c-67daaf2cdd12', '978330', '', 1, 1, 30, 4, 23, 10, 8, 0, 0, 2, -160, 80, 80, -160, 80, 80, '2026-05-09 21:55:16', '2026-05-09 21:56:11', 60, '2026-05-09 21:56:11');
INSERT INTO `ddz_game_records_202605` VALUES (38, '4ea1053a-b691-4285-b23a-177a74b7010c', '978330', '', 1, 1, 23, 4, 30, 10, 8, 0, 0, 2, -160, 80, 80, -160, 80, 80, '2026-05-09 21:56:38', '2026-05-09 21:57:46', 72, '2026-05-09 21:57:46');
INSERT INTO `ddz_game_records_202605` VALUES (39, '1847ebc2-108d-4762-981c-cde9b6a9d6b5', '978330', '', 1, 1, 4, 30, 23, 10, 8, 0, 0, 1, 160, -80, -80, 160, -80, -80, '2026-05-09 21:58:13', '2026-05-09 21:58:52', 44, '2026-05-09 21:58:52');

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
-- Table structure for ddz_pending_game_data
-- ----------------------------
DROP TABLE IF EXISTS `ddz_pending_game_data`;
CREATE TABLE `ddz_pending_game_data`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `game_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `data_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `status` tinyint UNSIGNED NULL DEFAULT 0,
  `retry_count` bigint NULL DEFAULT 0,
  `created_at` datetime(3) NULL DEFAULT NULL,
  `updated_at` datetime(3) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_ddz_pending_game_data_game_id`(`game_id` ASC) USING BTREE,
  INDEX `idx_ddz_pending_game_data_status`(`status` ASC) USING BTREE,
  INDEX `idx_ddz_pending_game_data_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 43 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_pending_game_data
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
) ENGINE = InnoDB AUTO_INCREMENT = 795 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_play_logs
-- ----------------------------
INSERT INTO `ddz_play_logs` VALUES (290, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 4, 1, 1, 1, 1, '♦7,♣6,♣5,♥4,♠3', 5, '顺子', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (291, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 16, 2, 1, 2, 1, '♦J,♦10,♦9,♦8,♣7', 5, '顺子', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (292, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 17, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (293, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 4, 1, 1, 4, 2, '', 0, '', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (294, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 16, 2, 2, 1, 1, '♣3', 1, '单张', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (295, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 17, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (296, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 4, 1, 2, 3, 1, '♥5', 1, '单张', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (297, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 16, 2, 2, 4, 2, '', 0, '', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (298, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 17, 2, 2, 5, 2, '', 0, '', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (299, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 4, 1, 3, 1, 1, '♥J,♣10,♣9,♣8,♠7', 5, '顺子', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (300, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 16, 2, 3, 2, 1, '♦Q,♦J,♦10,♦9,♦8', 5, '顺子', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (301, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 17, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (302, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 4, 1, 3, 4, 2, '', 0, '', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (303, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 16, 2, 4, 1, 1, '♥3', 1, '单张', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (304, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 17, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (305, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 4, 1, 4, 3, 1, '♠K', 1, '单张', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (306, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 16, 2, 4, 4, 2, '', 0, '', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (307, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 17, 2, 4, 5, 2, '', 0, '', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (308, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 4, 1, 5, 1, 1, '♥10,♠10', 2, '对子', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (309, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 16, 2, 5, 2, 1, '♠J,♣J', 2, '对子', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (310, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 17, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (311, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 4, 1, 5, 4, 1, '♦A,♠A', 2, '对子', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (312, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 16, 2, 5, 5, 2, '', 0, '', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (313, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 17, 2, 5, 6, 2, '', 0, '', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (314, 'e045ba70-bc9f-419e-9d21-81cec9ad4388', 4, 1, 6, 1, 1, 'BJ,♥2,♣2,♦2', 4, '三带一', 0, 0, '2026-05-08 11:05:55', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (315, '480201d0-27e4-4cd7-85bc-160271faae9c', 4, 1, 1, 1, 1, '♣7,♣6,♣5,♣4,♦3', 5, '顺子', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (316, '480201d0-27e4-4cd7-85bc-160271faae9c', 14, 2, 1, 2, 1, '♦8,♠7,♦6,♦5,♥4', 5, '顺子', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (317, '480201d0-27e4-4cd7-85bc-160271faae9c', 13, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (318, '480201d0-27e4-4cd7-85bc-160271faae9c', 4, 1, 1, 4, 2, '', 0, '', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (319, '480201d0-27e4-4cd7-85bc-160271faae9c', 14, 2, 2, 1, 1, '♠3', 1, '单张', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (320, '480201d0-27e4-4cd7-85bc-160271faae9c', 13, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (321, '480201d0-27e4-4cd7-85bc-160271faae9c', 4, 1, 2, 3, 1, '♠4', 1, '单张', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (322, '480201d0-27e4-4cd7-85bc-160271faae9c', 14, 2, 2, 4, 2, '', 0, '', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (323, '480201d0-27e4-4cd7-85bc-160271faae9c', 13, 2, 2, 5, 2, '', 0, '', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (324, '480201d0-27e4-4cd7-85bc-160271faae9c', 4, 1, 3, 1, 1, '♥7', 1, '单张', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (325, '480201d0-27e4-4cd7-85bc-160271faae9c', 14, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (326, '480201d0-27e4-4cd7-85bc-160271faae9c', 13, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (327, '480201d0-27e4-4cd7-85bc-160271faae9c', 4, 1, 4, 1, 1, '♥8,♠8', 2, '对子', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (328, '480201d0-27e4-4cd7-85bc-160271faae9c', 14, 2, 4, 2, 1, '♠9,♣9', 2, '对子', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (329, '480201d0-27e4-4cd7-85bc-160271faae9c', 13, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (330, '480201d0-27e4-4cd7-85bc-160271faae9c', 4, 1, 4, 4, 1, '♠Q,♥Q', 2, '对子', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (331, '480201d0-27e4-4cd7-85bc-160271faae9c', 14, 2, 4, 5, 1, '♠K,♥K', 2, '对子', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (332, '480201d0-27e4-4cd7-85bc-160271faae9c', 13, 2, 4, 6, 2, '', 0, '', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (333, '480201d0-27e4-4cd7-85bc-160271faae9c', 4, 1, 4, 7, 1, '♥2,♦2,♣2,♠2', 4, '炸弹', 1, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (334, '480201d0-27e4-4cd7-85bc-160271faae9c', 14, 2, 4, 8, 2, '', 0, '', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (335, '480201d0-27e4-4cd7-85bc-160271faae9c', 13, 2, 4, 9, 2, '', 0, '', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (336, '480201d0-27e4-4cd7-85bc-160271faae9c', 4, 1, 5, 1, 1, '♥A,♣K,♣Q,♦J,♥10', 5, '顺子', 0, 0, '2026-05-08 11:35:56', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (337, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 4, 1, 1, 1, 1, '♠3', 1, '单张', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (338, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 15, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (339, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 18, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (340, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 4, 1, 2, 1, 1, '♦5', 1, '单张', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (341, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 15, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (342, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 18, 2, 2, 3, 2, '', 0, '', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (343, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 4, 1, 3, 1, 1, '♦7', 1, '单张', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (344, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 15, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (345, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 18, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (346, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 4, 1, 4, 1, 1, '♣9,♦8,♥7,♦6,♥5', 5, '顺子', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (347, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 15, 2, 4, 2, 1, '♦10,♦9,♠8,♣7,♣6', 5, '顺子', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (348, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 18, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (349, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 4, 1, 4, 4, 2, '', 0, '', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (350, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 15, 2, 5, 1, 1, '♥4', 1, '单张', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (351, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 18, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (352, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 4, 1, 5, 3, 1, '♥K', 1, '单张', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (353, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 15, 2, 5, 4, 2, '', 0, '', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (354, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 18, 2, 5, 5, 2, '', 0, '', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (355, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 4, 1, 6, 1, 1, '♣K', 1, '单张', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (356, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 15, 2, 6, 2, 2, '', 0, '', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (357, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 18, 2, 6, 3, 2, '', 0, '', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (358, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 4, 1, 7, 1, 1, '♦A,♥A', 2, '对子', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (359, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 15, 2, 7, 2, 2, '', 0, '', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (360, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 18, 2, 7, 3, 2, '', 0, '', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (361, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 4, 1, 8, 1, 1, 'BJ,♥2,♦2,♠2', 4, '三带一', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (362, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 15, 2, 8, 2, 2, '', 0, '', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (363, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 18, 2, 8, 3, 2, '', 0, '', 0, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (364, 'b63d6e9b-69eb-4504-9f8a-b47aeb9902b2', 4, 1, 9, 1, 1, '♠J,♥J,♣J,♦J', 4, '炸弹', 1, 0, '2026-05-08 12:26:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (365, 'e7309f46-5b26-4ec5-815d-021542736243', 4, 1, 1, 1, 1, '♠9,♦8,♠7,♥6,♠5,♣4', 6, '顺子', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (366, 'e7309f46-5b26-4ec5-815d-021542736243', 13, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (367, 'e7309f46-5b26-4ec5-815d-021542736243', 17, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (368, 'e7309f46-5b26-4ec5-815d-021542736243', 4, 1, 2, 1, 1, '♠6', 1, '单张', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (369, 'e7309f46-5b26-4ec5-815d-021542736243', 13, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (370, 'e7309f46-5b26-4ec5-815d-021542736243', 17, 2, 2, 3, 2, '', 0, '', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (371, 'e7309f46-5b26-4ec5-815d-021542736243', 4, 1, 3, 1, 1, '♣7', 1, '单张', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (372, 'e7309f46-5b26-4ec5-815d-021542736243', 13, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (373, 'e7309f46-5b26-4ec5-815d-021542736243', 17, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (374, 'e7309f46-5b26-4ec5-815d-021542736243', 4, 1, 4, 1, 1, '♥8', 1, '单张', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (375, 'e7309f46-5b26-4ec5-815d-021542736243', 13, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (376, 'e7309f46-5b26-4ec5-815d-021542736243', 17, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (377, 'e7309f46-5b26-4ec5-815d-021542736243', 4, 1, 5, 1, 1, '♦A', 1, '单张', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (378, 'e7309f46-5b26-4ec5-815d-021542736243', 13, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (379, 'e7309f46-5b26-4ec5-815d-021542736243', 17, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (380, 'e7309f46-5b26-4ec5-815d-021542736243', 4, 1, 6, 1, 1, '♦Q,♥Q', 2, '对子', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (381, 'e7309f46-5b26-4ec5-815d-021542736243', 13, 2, 6, 2, 1, '♥A,♣A', 2, '对子', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (382, 'e7309f46-5b26-4ec5-815d-021542736243', 17, 2, 6, 3, 2, '', 0, '', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (383, 'e7309f46-5b26-4ec5-815d-021542736243', 4, 1, 6, 4, 1, '♥2,♠2', 2, '对子', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (384, 'e7309f46-5b26-4ec5-815d-021542736243', 13, 2, 6, 5, 2, '', 0, '', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (385, 'e7309f46-5b26-4ec5-815d-021542736243', 17, 2, 6, 6, 2, '', 0, '', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (386, 'e7309f46-5b26-4ec5-815d-021542736243', 4, 1, 7, 1, 1, '♦K,♥K', 2, '对子', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (387, 'e7309f46-5b26-4ec5-815d-021542736243', 13, 2, 7, 2, 1, '♣2,♦2', 2, '对子', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (388, 'e7309f46-5b26-4ec5-815d-021542736243', 17, 2, 7, 3, 2, '', 0, '', 0, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (389, 'e7309f46-5b26-4ec5-815d-021542736243', 4, 1, 7, 4, 1, '♣J,♦J,♠J,♥J', 4, '炸弹', 1, 0, '2026-05-08 13:36:24', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (390, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 1, 1, 1, '♦3', 1, '单张', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (391, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (392, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (393, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 2, 1, 1, '♥4', 1, '单张', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (394, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (395, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 2, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (396, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 3, 1, 1, '♦4', 1, '单张', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (397, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (398, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (399, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 4, 1, 1, '♦6', 1, '单张', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (400, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (401, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (402, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 5, 1, 1, '♣6', 1, '单张', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (403, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (404, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (405, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 6, 1, 1, '♠6', 1, '单张', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (406, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 6, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (407, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 6, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (408, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 7, 1, 1, '♥7', 1, '单张', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (409, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 7, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (410, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 7, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (411, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 8, 1, 1, '♦8', 1, '单张', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (412, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 8, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (413, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 8, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (414, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 9, 1, 1, '♥8', 1, '单张', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (415, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 9, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (416, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 9, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (417, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 10, 1, 1, '♥9', 1, '单张', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (418, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 10, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (419, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 10, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (420, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 11, 1, 1, '♣9', 1, '单张', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (421, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 11, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (422, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 11, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (423, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 12, 1, 1, '♥10', 1, '单张', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (424, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 12, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (425, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 12, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (426, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 13, 1, 1, '♠J', 1, '单张', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (427, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 13, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (428, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 13, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (429, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 14, 1, 1, '♦J', 1, '单张', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (430, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 14, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (431, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 14, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (432, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 15, 1, 1, '♥Q', 1, '单张', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (433, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 15, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (434, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 15, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (435, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 16, 1, 1, '♠K', 1, '单张', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (436, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 16, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (437, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 16, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (438, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 17, 1, 1, '♣K', 1, '单张', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (439, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 17, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (440, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 17, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (441, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 18, 1, 1, '♦K', 1, '单张', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (442, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 18, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (443, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 18, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (444, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 19, 1, 1, '♥2', 1, '单张', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (445, 'd92cc4de-649b-45bc-821c-15f1fd910872', 12, 2, 19, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (446, 'd92cc4de-649b-45bc-821c-15f1fd910872', 14, 2, 19, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (447, 'd92cc4de-649b-45bc-821c-15f1fd910872', 4, 1, 20, 1, 1, 'RJ', 1, '单张', 0, 0, '2026-05-08 14:03:50', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (448, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, 1, 1, 1, '♦3', 1, '单张', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (449, '71065836-67bf-4479-a527-f59219f0963a', 16, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (450, '71065836-67bf-4479-a527-f59219f0963a', 15, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (451, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, 2, 1, 1, '♦4', 1, '单张', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (452, '71065836-67bf-4479-a527-f59219f0963a', 16, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (453, '71065836-67bf-4479-a527-f59219f0963a', 15, 2, 2, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (454, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, 3, 1, 1, '♥4', 1, '单张', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (455, '71065836-67bf-4479-a527-f59219f0963a', 16, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (456, '71065836-67bf-4479-a527-f59219f0963a', 15, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (457, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, 4, 1, 1, '♠4', 1, '单张', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (458, '71065836-67bf-4479-a527-f59219f0963a', 16, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (459, '71065836-67bf-4479-a527-f59219f0963a', 15, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (460, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, 5, 1, 1, '♦5', 1, '单张', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (461, '71065836-67bf-4479-a527-f59219f0963a', 16, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (462, '71065836-67bf-4479-a527-f59219f0963a', 15, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (463, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, 6, 1, 1, '♠5', 1, '单张', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (464, '71065836-67bf-4479-a527-f59219f0963a', 16, 2, 6, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (465, '71065836-67bf-4479-a527-f59219f0963a', 15, 2, 6, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (466, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, 7, 1, 1, '♠6', 1, '单张', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (467, '71065836-67bf-4479-a527-f59219f0963a', 16, 2, 7, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (468, '71065836-67bf-4479-a527-f59219f0963a', 15, 2, 7, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (469, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, 8, 1, 1, '♦6', 1, '单张', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (470, '71065836-67bf-4479-a527-f59219f0963a', 16, 2, 8, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (471, '71065836-67bf-4479-a527-f59219f0963a', 15, 2, 8, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (472, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, 9, 1, 1, '♣7', 1, '单张', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (473, '71065836-67bf-4479-a527-f59219f0963a', 16, 2, 9, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (474, '71065836-67bf-4479-a527-f59219f0963a', 15, 2, 9, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (475, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, 10, 1, 1, '♦8', 1, '单张', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (476, '71065836-67bf-4479-a527-f59219f0963a', 16, 2, 10, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (477, '71065836-67bf-4479-a527-f59219f0963a', 15, 2, 10, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (478, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, 11, 1, 1, '♠8', 1, '单张', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (479, '71065836-67bf-4479-a527-f59219f0963a', 16, 2, 11, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (480, '71065836-67bf-4479-a527-f59219f0963a', 15, 2, 11, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (481, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, 12, 1, 1, '♥8', 1, '单张', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (482, '71065836-67bf-4479-a527-f59219f0963a', 16, 2, 12, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (483, '71065836-67bf-4479-a527-f59219f0963a', 15, 2, 12, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (484, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, 13, 1, 1, '♣9', 1, '单张', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (485, '71065836-67bf-4479-a527-f59219f0963a', 16, 2, 13, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (486, '71065836-67bf-4479-a527-f59219f0963a', 15, 2, 13, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (487, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, 14, 1, 1, '♦10', 1, '单张', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (488, '71065836-67bf-4479-a527-f59219f0963a', 16, 2, 14, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (489, '71065836-67bf-4479-a527-f59219f0963a', 15, 2, 14, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (490, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, 15, 1, 1, '♦J', 1, '单张', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (491, '71065836-67bf-4479-a527-f59219f0963a', 16, 2, 15, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (492, '71065836-67bf-4479-a527-f59219f0963a', 15, 2, 15, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (493, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, 16, 1, 1, '♥Q', 1, '单张', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (494, '71065836-67bf-4479-a527-f59219f0963a', 16, 2, 16, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (495, '71065836-67bf-4479-a527-f59219f0963a', 15, 2, 16, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (496, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, 17, 1, 1, '♠A', 1, '单张', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (497, '71065836-67bf-4479-a527-f59219f0963a', 16, 2, 17, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (498, '71065836-67bf-4479-a527-f59219f0963a', 15, 2, 17, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (499, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, 18, 1, 1, '♥A', 1, '单张', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (500, '71065836-67bf-4479-a527-f59219f0963a', 16, 2, 18, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (501, '71065836-67bf-4479-a527-f59219f0963a', 15, 2, 18, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (502, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, 19, 1, 1, '♣A', 1, '单张', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (503, '71065836-67bf-4479-a527-f59219f0963a', 16, 2, 19, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (504, '71065836-67bf-4479-a527-f59219f0963a', 15, 2, 19, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (505, '71065836-67bf-4479-a527-f59219f0963a', 4, 1, 20, 1, 1, '♦2', 1, '单张', 0, 0, '2026-05-08 14:16:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (506, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 4, 1, 1, 1, 1, '♣5,♥4,♣4,♦4', 4, '三带一', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (507, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 10, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (508, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 9, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (509, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 4, 1, 2, 1, 1, '♥J,♣10,♣9,♠8,♦7', 5, '顺子', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (510, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 10, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (511, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 9, 2, 2, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (512, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 4, 1, 3, 1, 1, '♠10', 1, '单张', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (513, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 10, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (514, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 9, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (515, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 4, 1, 4, 1, 1, '♦K', 1, '单张', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (516, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 10, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (517, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 9, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (518, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 4, 1, 5, 1, 1, '♦2,♣2', 2, '对子', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (519, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 10, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (520, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 9, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (521, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 4, 1, 6, 1, 1, 'RJ', 1, '单张', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (522, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 10, 2, 6, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (523, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 9, 2, 6, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (524, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 4, 1, 7, 1, 1, '♠Q,♣Q,♥Q,♦Q', 4, '炸弹', 1, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (525, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 10, 2, 7, 2, 2, '', 0, '', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (526, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 9, 2, 7, 3, 2, '', 0, '', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (527, 'dc5b0d1c-34d9-45e3-97a4-321aa7a164c7', 4, 1, 8, 1, 1, '♣A,♠A', 2, '对子', 0, 0, '2026-05-08 14:45:58', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (528, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 4, 1, 1, 1, 1, '♦6,♣6,♣5,♥5,♠4,♥4,♣3,♠3', 8, '连对', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (529, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 9, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (530, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 17, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (531, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 4, 1, 2, 1, 1, '♦Q,♦J,♥10,♦9,♦8,♠7', 6, '顺子', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (532, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 9, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (533, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 17, 2, 2, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (534, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 4, 1, 3, 1, 1, '♣8', 1, '单张', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (535, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 9, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (536, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 17, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (537, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 4, 1, 4, 1, 1, '♥9', 1, '单张', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (538, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 9, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (539, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 17, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (540, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 4, 1, 5, 1, 1, '♠J', 1, '单张', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (541, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 9, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (542, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 17, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (543, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 4, 1, 6, 1, 1, '♥A', 1, '单张', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (544, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 9, 2, 6, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (545, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 17, 2, 6, 3, 1, 'RJ,BJ', 2, '王炸', 0, 1, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (546, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 4, 1, 6, 4, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (547, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 9, 2, 6, 5, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (548, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 17, 2, 7, 1, 1, '♦3', 1, '单张', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (549, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 4, 1, 7, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (550, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 9, 2, 7, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (551, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 17, 2, 8, 1, 1, '♥3', 1, '单张', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (552, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 4, 1, 8, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (553, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 9, 2, 8, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (554, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 17, 2, 9, 1, 1, '♦4', 1, '单张', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (555, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 4, 1, 9, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (556, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 9, 2, 9, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (557, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 17, 2, 10, 1, 1, '♥6', 1, '单张', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (558, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 4, 1, 10, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (559, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 9, 2, 10, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (560, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 17, 2, 11, 1, 1, '♠9', 1, '单张', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (561, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 4, 1, 11, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (562, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 9, 2, 11, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (563, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 17, 2, 12, 1, 1, '♣9', 1, '单张', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (564, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 4, 1, 12, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (565, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 9, 2, 12, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (566, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 17, 2, 13, 1, 1, '♦10', 1, '单张', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (567, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 4, 1, 13, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (568, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 9, 2, 13, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (569, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 17, 2, 14, 1, 1, '♥J,♣J', 2, '对子', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (570, '7c48643c-eecc-4fd4-b088-4c1fd79ec0e7', 4, 1, 14, 2, 1, '♥2,♠2', 2, '对子', 0, 0, '2026-05-08 15:01:31', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (571, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 4, 1, 1, 1, 1, '♦3,♣3', 2, '对子', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (572, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 20, 2, 1, 2, 1, '♠4,♦4', 2, '对子', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (573, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 21, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (574, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 4, 1, 1, 4, 1, '♣10,♦10', 2, '对子', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (575, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 20, 2, 1, 5, 1, '♠Q,♥Q', 2, '对子', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (576, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 21, 2, 1, 6, 2, '', 0, '', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (577, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 4, 1, 1, 7, 1, '♥A,♦A', 2, '对子', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (578, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 20, 2, 1, 8, 2, '', 0, '', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (579, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 21, 2, 1, 9, 2, '', 0, '', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (580, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 4, 1, 2, 1, 1, '♥4', 1, '单张', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (581, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 20, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (582, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 21, 2, 2, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (583, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 4, 1, 3, 1, 1, '♣7', 1, '单张', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (584, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 20, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (585, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 21, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (586, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 4, 1, 4, 1, 1, '♦9', 1, '单张', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (587, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 20, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (588, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 21, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (589, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 4, 1, 5, 1, 1, '♦Q', 1, '单张', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (590, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 20, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (591, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 21, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (592, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 4, 1, 6, 1, 1, '♦K', 1, '单张', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (593, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 20, 2, 6, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (594, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 21, 2, 6, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (595, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 4, 1, 7, 1, 1, '♦J,♥J,♣8,♥8,♠8', 5, '三带二', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (596, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 20, 2, 7, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (597, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 21, 2, 7, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (598, 'bdf46471-bbd6-4a15-8037-6459ee1458ba', 4, 1, 8, 1, 1, 'BJ,♣2,♥2,♠2', 4, '三带一', 0, 0, '2026-05-08 15:11:17', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (599, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 1, 1, 1, '♦3', 1, '单张', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (600, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (601, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (602, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 2, 1, 1, '♥3', 1, '单张', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (603, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (604, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 2, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (605, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 3, 1, 1, '♣4', 1, '单张', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (606, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (607, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (608, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 4, 1, 1, '♠4', 1, '单张', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (609, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (610, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (611, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 5, 1, 1, '♠5', 1, '单张', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (612, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (613, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (614, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 6, 1, 1, '♠7', 1, '单张', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (615, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, 6, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (616, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 6, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (617, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 7, 1, 1, '♦7', 1, '单张', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (618, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, 7, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (619, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 7, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (620, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 8, 1, 1, '♣7', 1, '单张', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (621, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, 8, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (622, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 8, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (623, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 9, 1, 1, '♥8', 1, '单张', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (624, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, 9, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (625, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 9, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (626, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 10, 1, 1, '♦8', 1, '单张', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (627, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, 10, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (628, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 10, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (629, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 11, 1, 1, '♠9', 1, '单张', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (630, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, 11, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (631, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 11, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (632, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 12, 1, 1, '♣9', 1, '单张', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (633, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, 12, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (634, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 12, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (635, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 13, 1, 1, '♠10', 1, '单张', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (636, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, 13, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (637, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 13, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (638, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 14, 1, 1, '♥10', 1, '单张', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (639, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, 14, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (640, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 14, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (641, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 15, 1, 1, '♠J', 1, '单张', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (642, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, 15, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (643, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 15, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (644, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 16, 1, 1, '♥J', 1, '单张', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (645, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, 16, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (646, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 16, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (647, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 17, 1, 1, '♥Q', 1, '单张', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (648, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, 17, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (649, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 17, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (650, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 18, 1, 1, '♣A', 1, '单张', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (651, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, 18, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (652, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 18, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (653, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 19, 1, 1, '♠2', 1, '单张', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (654, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 4, 2, 19, 2, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (655, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 25, 2, 19, 3, 2, '', 0, '', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (656, 'a7c7b979-980e-4a20-973a-a9672e334ab5', 19, 1, 20, 1, 1, 'RJ', 1, '单张', 0, 0, '2026-05-08 15:36:29', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (657, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 4, 1, 1, 1, 1, '♥5', 1, '单张', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (658, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 33, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (659, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 38, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (660, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 4, 1, 2, 1, 1, '♣7', 1, '单张', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (661, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 33, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (662, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 38, 2, 2, 3, 2, '', 0, '', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (663, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 4, 1, 3, 1, 1, '♦7,♥6,♠5,♦4,♣3', 5, '顺子', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (664, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 33, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (665, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 38, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (666, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 4, 1, 4, 1, 1, '♠10,♣9,♥9,♦9', 4, '三带一', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (667, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 33, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (668, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 38, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (669, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 4, 1, 5, 1, 1, '♣K,♠J,♣J,♦J', 4, '三带一', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (670, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 33, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (671, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 38, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (672, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 4, 1, 6, 1, 1, '♥Q,♣Q', 2, '对子', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (673, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 33, 2, 6, 2, 1, '♠K,♥K', 2, '对子', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (674, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 38, 2, 6, 3, 2, '', 0, '', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (675, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 4, 1, 6, 4, 1, '♦2,♠2', 2, '对子', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (676, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 33, 2, 6, 5, 2, '', 0, '', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (677, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 38, 2, 6, 6, 2, '', 0, '', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (678, 'b4328265-0388-4e09-8ef5-19e2ef0f24ab', 4, 1, 7, 1, 1, 'BJ', 1, '单张', 0, 0, '2026-05-08 16:10:37', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (679, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 4, 1, 1, 1, 1, '♠7,♦6,♦5,♦4,♦3', 5, '顺子', 0, 0, '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (680, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 10, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (681, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 14, 2, 1, 3, 1, '♣10,♥9,♥8,♦7,♥6', 5, '顺子', 0, 0, '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (682, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 4, 1, 1, 4, 1, '♦A,♠K,♠Q,♠J,♥10', 5, '顺子', 0, 0, '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (683, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 10, 2, 1, 5, 2, '', 0, '', 0, 0, '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (684, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 14, 2, 1, 6, 2, '', 0, '', 0, 0, '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (685, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 4, 1, 2, 1, 1, '♦8,♠8,♣8,♣6', 4, '三带一', 0, 0, '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (686, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 10, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (687, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 14, 2, 2, 3, 2, '', 0, '', 0, 0, '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (688, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 4, 1, 3, 1, 1, '♣A,♥A,♠A,♦J', 4, '三带一', 0, 0, '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (689, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 10, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (690, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 14, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (691, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 4, 1, 4, 1, 1, '♦K', 1, '单张', 0, 0, '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (692, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 10, 2, 4, 2, 1, 'RJ,BJ', 2, '王炸', 0, 1, '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (693, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 14, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (694, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 4, 1, 4, 4, 2, '', 0, '', 0, 0, '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (695, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 10, 2, 5, 1, 1, '♣3', 1, '单张', 0, 0, '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (696, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 14, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (697, '5f3ad13e-6cea-4bce-827a-5aeded4c67cb', 4, 1, 5, 3, 1, '♠2', 1, '单张', 0, 0, '2026-05-08 16:25:35', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (698, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 4, 1, 1, 1, 1, '♦K,♦Q,♠J,♦10,♦9,♠8,♣7', 7, '顺子', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (699, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 24, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (700, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 22, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (701, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 4, 1, 2, 1, 1, '♥4', 1, '单张', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (702, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 24, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (703, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 22, 2, 2, 3, 2, '', 0, '', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (704, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 4, 1, 3, 1, 1, '♣10,♥10,♠3,♣3,♦3', 5, '三带二', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (705, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 24, 2, 3, 2, 1, '♠5,♥5,♣5,♠4,♦4', 5, '三带二', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (706, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 22, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (707, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 4, 1, 3, 4, 1, '♣A,♥A,♦6,♠6,♥6', 5, '三带二', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (708, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 24, 2, 3, 5, 2, '', 0, '', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (709, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 22, 2, 3, 6, 1, '♠Q,♥Q,♣Q,♣J,♦J', 5, '三带二', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (710, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 4, 1, 3, 7, 2, '', 0, '', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (711, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 24, 2, 3, 8, 2, '', 0, '', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (712, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 22, 2, 4, 1, 1, '♣4', 1, '单张', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (713, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 4, 1, 4, 2, 1, '♦2', 1, '单张', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (714, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 24, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (715, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 22, 2, 4, 4, 1, 'RJ,BJ', 2, '王炸', 0, 1, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (716, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 4, 1, 4, 5, 2, '', 0, '', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (717, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 24, 2, 4, 6, 2, '', 0, '', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (718, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 22, 2, 5, 1, 1, '♦5', 1, '单张', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (719, 'eaa8e380-6ec3-4b42-ae50-c86729be69dc', 4, 1, 5, 2, 1, '♠2', 1, '单张', 0, 0, '2026-05-08 16:50:48', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (720, 'c0bec0d2-1732-46cc-b8f3-db308ee734ef', 4, 1, 1, 1, 1, '♣7,♦5,♣5,♠5,♣4,♥4,♠4,♠3', 8, '飞机带单', 0, 0, '2026-05-08 19:15:51', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (721, 'c0bec0d2-1732-46cc-b8f3-db308ee734ef', 34, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-08 19:15:51', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (722, 'c0bec0d2-1732-46cc-b8f3-db308ee734ef', 21, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-08 19:15:51', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (723, 'c0bec0d2-1732-46cc-b8f3-db308ee734ef', 4, 1, 2, 1, 1, '♣J,♦10,♣9,♥8,♥7,♥6', 6, '顺子', 0, 0, '2026-05-08 19:15:51', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (724, 'c0bec0d2-1732-46cc-b8f3-db308ee734ef', 34, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-08 19:15:51', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (725, 'c0bec0d2-1732-46cc-b8f3-db308ee734ef', 21, 2, 2, 3, 1, '♥Q,♦J,♥10,♥9,♦8,♠7', 6, '顺子', 0, 0, '2026-05-08 19:15:51', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (726, 'c0bec0d2-1732-46cc-b8f3-db308ee734ef', 4, 1, 2, 4, 2, '', 0, '', 0, 0, '2026-05-08 19:15:51', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (727, 'c0bec0d2-1732-46cc-b8f3-db308ee734ef', 34, 2, 2, 5, 2, '', 0, '', 0, 0, '2026-05-08 19:15:51', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (728, 'c0bec0d2-1732-46cc-b8f3-db308ee734ef', 21, 2, 3, 1, 1, '♥3', 1, '单张', 0, 0, '2026-05-08 19:15:51', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (729, 'c0bec0d2-1732-46cc-b8f3-db308ee734ef', 4, 1, 3, 2, 1, '♠J', 1, '单张', 0, 0, '2026-05-08 19:15:51', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (730, 'c0bec0d2-1732-46cc-b8f3-db308ee734ef', 34, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-08 19:15:51', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (731, 'c0bec0d2-1732-46cc-b8f3-db308ee734ef', 21, 2, 3, 4, 2, '', 0, '', 0, 0, '2026-05-08 19:15:51', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (732, 'c0bec0d2-1732-46cc-b8f3-db308ee734ef', 4, 1, 4, 1, 1, '♦K', 1, '单张', 0, 0, '2026-05-08 19:15:51', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (733, 'c0bec0d2-1732-46cc-b8f3-db308ee734ef', 34, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-08 19:15:51', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (734, 'c0bec0d2-1732-46cc-b8f3-db308ee734ef', 21, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-08 19:15:51', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (735, 'c0bec0d2-1732-46cc-b8f3-db308ee734ef', 4, 1, 5, 1, 1, '♦2,♥2,♠2,♣A', 4, '三带一', 0, 0, '2026-05-08 19:15:51', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (736, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 4, 1, 1, 1, 1, '♦7,♦6,♦5,♣4,♥3', 5, '顺子', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (737, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 34, 2, 1, 2, 1, '♣10,♦9,♦8,♠7,♣6', 5, '顺子', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (738, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 21, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (739, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 4, 1, 1, 4, 2, '', 0, '', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (740, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 34, 2, 2, 1, 1, '♦3', 1, '单张', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (741, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 21, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (742, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 4, 1, 2, 3, 1, '♠4', 1, '单张', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (743, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 34, 2, 2, 4, 2, '', 0, '', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (744, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 21, 2, 2, 5, 2, '', 0, '', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (745, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 4, 1, 3, 1, 1, '♣7', 1, '单张', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (746, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 34, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (747, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 21, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (748, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 4, 1, 4, 1, 1, '♣Q', 1, '单张', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (749, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 34, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (750, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 21, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (751, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 4, 1, 5, 1, 1, '♦10,♥10,♣9,♠9,♣8,♠8', 6, '连对', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (752, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 34, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (753, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 21, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (754, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 4, 1, 6, 1, 1, '♥9', 1, '单张', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (755, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 34, 2, 6, 2, 2, '', 0, '', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (756, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 21, 2, 6, 3, 2, '', 0, '', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (757, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 4, 1, 7, 1, 1, '♦A', 1, '单张', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (758, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 34, 2, 7, 2, 2, '', 0, '', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (759, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 21, 2, 7, 3, 2, '', 0, '', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (760, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 4, 1, 8, 1, 1, '♠K,♣K', 2, '对子', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (761, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 34, 2, 8, 2, 1, '♠A,♥A', 2, '对子', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (762, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 21, 2, 8, 3, 2, '', 0, '', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (763, '2bb57ce9-35bb-4d50-902e-43325fa9d85b', 4, 1, 8, 4, 1, '♦2,♣2', 2, '对子', 0, 0, '2026-05-08 19:17:03', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (764, 'e2d74440-2c02-46f2-be82-e28517e09314', 4, 1, 1, 1, 1, '♦4', 1, '单张', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (765, 'e2d74440-2c02-46f2-be82-e28517e09314', 34, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (766, 'e2d74440-2c02-46f2-be82-e28517e09314', 21, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (767, 'e2d74440-2c02-46f2-be82-e28517e09314', 4, 1, 2, 1, 1, '♣5', 1, '单张', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (768, 'e2d74440-2c02-46f2-be82-e28517e09314', 34, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (769, 'e2d74440-2c02-46f2-be82-e28517e09314', 21, 2, 2, 3, 2, '', 0, '', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (770, 'e2d74440-2c02-46f2-be82-e28517e09314', 4, 1, 3, 1, 1, '♠3,♣3', 2, '对子', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (771, 'e2d74440-2c02-46f2-be82-e28517e09314', 34, 2, 3, 2, 1, '♥4,♣4', 2, '对子', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (772, 'e2d74440-2c02-46f2-be82-e28517e09314', 21, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (773, 'e2d74440-2c02-46f2-be82-e28517e09314', 4, 1, 3, 4, 1, '♠6,♥6', 2, '对子', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (774, 'e2d74440-2c02-46f2-be82-e28517e09314', 34, 2, 3, 5, 1, '♥7,♦7', 2, '对子', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (775, 'e2d74440-2c02-46f2-be82-e28517e09314', 21, 2, 3, 6, 2, '', 0, '', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (776, 'e2d74440-2c02-46f2-be82-e28517e09314', 4, 1, 3, 7, 1, '♦J,♣J', 2, '对子', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (777, 'e2d74440-2c02-46f2-be82-e28517e09314', 34, 2, 3, 8, 1, '♥Q,♣Q', 2, '对子', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (778, 'e2d74440-2c02-46f2-be82-e28517e09314', 21, 2, 3, 9, 2, '', 0, '', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (779, 'e2d74440-2c02-46f2-be82-e28517e09314', 4, 1, 3, 10, 1, '♦K,♣K', 2, '对子', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (780, 'e2d74440-2c02-46f2-be82-e28517e09314', 34, 2, 3, 11, 2, '', 0, '', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (781, 'e2d74440-2c02-46f2-be82-e28517e09314', 21, 2, 3, 12, 1, '♣2,♦2', 2, '对子', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (782, 'e2d74440-2c02-46f2-be82-e28517e09314', 4, 1, 3, 13, 2, '', 0, '', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (783, 'e2d74440-2c02-46f2-be82-e28517e09314', 34, 2, 3, 14, 2, '', 0, '', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (784, 'e2d74440-2c02-46f2-be82-e28517e09314', 21, 2, 4, 1, 1, '♦3', 1, '单张', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (785, 'e2d74440-2c02-46f2-be82-e28517e09314', 4, 1, 4, 2, 1, '♥A', 1, '单张', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (786, 'e2d74440-2c02-46f2-be82-e28517e09314', 34, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (787, 'e2d74440-2c02-46f2-be82-e28517e09314', 21, 2, 4, 4, 2, '', 0, '', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (788, 'e2d74440-2c02-46f2-be82-e28517e09314', 4, 1, 5, 1, 1, '♠A,♠K,♦Q,♠J,♠10,♣9,♥8', 7, '顺子', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (789, 'e2d74440-2c02-46f2-be82-e28517e09314', 34, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (790, 'e2d74440-2c02-46f2-be82-e28517e09314', 21, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (791, 'e2d74440-2c02-46f2-be82-e28517e09314', 4, 1, 6, 1, 1, '♥2', 1, '单张', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (792, 'e2d74440-2c02-46f2-be82-e28517e09314', 34, 2, 6, 2, 2, '', 0, '', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (793, 'e2d74440-2c02-46f2-be82-e28517e09314', 21, 2, 6, 3, 2, '', 0, '', 0, 0, '2026-05-08 19:18:15', NULL, NULL);
INSERT INTO `ddz_play_logs` VALUES (794, 'e2d74440-2c02-46f2-be82-e28517e09314', 4, 1, 7, 1, 1, 'BJ', 1, '单张', 0, 0, '2026-05-08 19:18:15', NULL, NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 1003 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '出牌日志表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_play_logs_202605
-- ----------------------------
INSERT INTO `ddz_play_logs_202605` VALUES (1, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 4, 1, 1, 1, 1, '♣3', 1, '单张', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (2, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 17, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (3, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 35, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (4, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 4, 1, 2, 1, 1, '♠7', 1, '单张', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (5, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 17, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (6, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 35, 2, 2, 3, 2, '', 0, '', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (7, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 4, 1, 3, 1, 1, '♠8', 1, '单张', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (8, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 17, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (9, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 35, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (10, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 4, 1, 4, 1, 1, '♣6,♦6', 2, '对子', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (11, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 17, 2, 4, 2, 1, '♥7,♣7', 2, '对子', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (12, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 35, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (13, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 4, 1, 4, 4, 1, '♥10,♣10', 2, '对子', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (14, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 17, 2, 4, 5, 1, '♥Q,♦Q', 2, '对子', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (15, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 35, 2, 4, 6, 2, '', 0, '', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (16, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 4, 1, 4, 7, 1, '♣K,♥K', 2, '对子', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (17, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 17, 2, 4, 8, 2, '', 0, '', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (18, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 35, 2, 4, 9, 2, '', 0, '', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (19, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 4, 1, 5, 1, 1, '♥J,♣4,♠4,♦4', 4, '三带一', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (20, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 17, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (21, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 35, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (22, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 4, 1, 6, 1, 1, '♠Q', 1, '单张', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (23, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 17, 2, 6, 2, 2, '', 0, '', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (24, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 35, 2, 6, 3, 2, '', 0, '', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (25, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 4, 1, 7, 1, 1, '♥2,♠2', 2, '对子', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (26, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 17, 2, 7, 2, 2, '', 0, '', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (27, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 35, 2, 7, 3, 2, '', 0, '', 0, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (28, '0872aaf7-2d59-4390-9d8a-b1cbfb9c5c34', 4, 1, 8, 1, 1, '♦A,♣A,♥A,♠A', 4, '炸弹', 1, 0, '2026-05-08 20:25:55');
INSERT INTO `ddz_play_logs_202605` VALUES (29, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 4, 1, 1, 1, 1, '♦5,♣5,♦4,♥4,♦3,♠3', 6, '连对', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (30, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 17, 2, 1, 2, 1, '♠6,♣6,♠5,♥5,♠4,♣4', 6, '连对', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (31, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 35, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (32, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 4, 1, 1, 4, 2, '', 0, '', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (33, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 17, 2, 2, 1, 1, '♥3', 1, '单张', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (34, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 35, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (35, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 4, 1, 2, 3, 1, '♥6', 1, '单张', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (36, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 17, 2, 2, 4, 2, '', 0, '', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (37, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 35, 2, 2, 5, 2, '', 0, '', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (38, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 4, 1, 3, 1, 1, '♠8', 1, '单张', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (39, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 17, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (40, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 35, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (41, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 4, 1, 4, 1, 1, '♠10', 1, '单张', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (42, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 17, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (43, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 35, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (44, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 4, 1, 5, 1, 1, '♦J,♠7,♦7,♥7', 4, '三带一', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (45, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 17, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (46, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 35, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (47, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 4, 1, 6, 1, 1, '♣K,♦Q,♣Q,♠Q', 4, '三带一', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (48, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 17, 2, 6, 2, 2, '', 0, '', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (49, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 35, 2, 6, 3, 2, '', 0, '', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (50, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 4, 1, 7, 1, 1, '♠A', 1, '单张', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (51, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 17, 2, 7, 2, 2, '', 0, '', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (52, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 35, 2, 7, 3, 2, '', 0, '', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (53, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 4, 1, 8, 1, 1, '♦2', 1, '单张', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (54, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 17, 2, 8, 2, 2, '', 0, '', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (55, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 35, 2, 8, 3, 2, '', 0, '', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (56, '4e62cd7d-a3e7-4723-b5b1-1f52de0d63db', 4, 1, 9, 1, 1, 'RJ', 1, '单张', 0, 0, '2026-05-08 20:26:59');
INSERT INTO `ddz_play_logs_202605` VALUES (57, '7e9bf02e-5576-465b-8c6d-4ae863483969', 4, 1, 1, 1, 1, '♦3,♣3', 2, '对子', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (58, '7e9bf02e-5576-465b-8c6d-4ae863483969', 17, 2, 1, 2, 1, '♠7,♥7', 2, '对子', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (59, '7e9bf02e-5576-465b-8c6d-4ae863483969', 35, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (60, '7e9bf02e-5576-465b-8c6d-4ae863483969', 4, 1, 1, 4, 1, '♣J,♦J', 2, '对子', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (61, '7e9bf02e-5576-465b-8c6d-4ae863483969', 17, 2, 1, 5, 1, '♠A,♥A', 2, '对子', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (62, '7e9bf02e-5576-465b-8c6d-4ae863483969', 35, 2, 1, 6, 2, '', 0, '', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (63, '7e9bf02e-5576-465b-8c6d-4ae863483969', 4, 1, 1, 7, 2, '', 0, '', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (64, '7e9bf02e-5576-465b-8c6d-4ae863483969', 17, 2, 2, 1, 1, '♠3', 1, '单张', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (65, '7e9bf02e-5576-465b-8c6d-4ae863483969', 35, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (66, '7e9bf02e-5576-465b-8c6d-4ae863483969', 4, 1, 2, 3, 1, '♠5', 1, '单张', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (67, '7e9bf02e-5576-465b-8c6d-4ae863483969', 17, 2, 2, 4, 2, '', 0, '', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (68, '7e9bf02e-5576-465b-8c6d-4ae863483969', 35, 2, 2, 5, 2, '', 0, '', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (69, '7e9bf02e-5576-465b-8c6d-4ae863483969', 4, 1, 3, 1, 1, '♣4,♥4', 2, '对子', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (70, '7e9bf02e-5576-465b-8c6d-4ae863483969', 17, 2, 3, 2, 1, '♠8,♣8', 2, '对子', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (71, '7e9bf02e-5576-465b-8c6d-4ae863483969', 35, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (72, '7e9bf02e-5576-465b-8c6d-4ae863483969', 4, 1, 3, 4, 1, '♥Q,♦Q', 2, '对子', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (73, '7e9bf02e-5576-465b-8c6d-4ae863483969', 17, 2, 3, 5, 1, '♠2,♣2', 2, '对子', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (74, '7e9bf02e-5576-465b-8c6d-4ae863483969', 35, 2, 3, 6, 2, '', 0, '', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (75, '7e9bf02e-5576-465b-8c6d-4ae863483969', 4, 1, 3, 7, 2, '', 0, '', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (76, '7e9bf02e-5576-465b-8c6d-4ae863483969', 17, 2, 4, 1, 1, '♦4', 1, '单张', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (77, '7e9bf02e-5576-465b-8c6d-4ae863483969', 35, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (78, '7e9bf02e-5576-465b-8c6d-4ae863483969', 4, 1, 4, 3, 1, '♥8', 1, '单张', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (79, '7e9bf02e-5576-465b-8c6d-4ae863483969', 17, 2, 4, 4, 2, '', 0, '', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (80, '7e9bf02e-5576-465b-8c6d-4ae863483969', 35, 2, 4, 5, 2, '', 0, '', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (81, '7e9bf02e-5576-465b-8c6d-4ae863483969', 4, 1, 5, 1, 1, '♥9', 1, '单张', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (82, '7e9bf02e-5576-465b-8c6d-4ae863483969', 17, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (83, '7e9bf02e-5576-465b-8c6d-4ae863483969', 35, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (84, '7e9bf02e-5576-465b-8c6d-4ae863483969', 4, 1, 6, 1, 1, '♠10,♦6,♣6,♥6', 4, '三带一', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (85, '7e9bf02e-5576-465b-8c6d-4ae863483969', 17, 2, 6, 2, 2, '', 0, '', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (86, '7e9bf02e-5576-465b-8c6d-4ae863483969', 35, 2, 6, 3, 2, '', 0, '', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (87, '7e9bf02e-5576-465b-8c6d-4ae863483969', 4, 1, 7, 1, 1, '♦A,♣K,♥K,♠K', 4, '三带一', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (88, '7e9bf02e-5576-465b-8c6d-4ae863483969', 17, 2, 7, 2, 2, '', 0, '', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (89, '7e9bf02e-5576-465b-8c6d-4ae863483969', 35, 2, 7, 3, 2, '', 0, '', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (90, '7e9bf02e-5576-465b-8c6d-4ae863483969', 4, 1, 8, 1, 1, '♦2', 1, '单张', 0, 0, '2026-05-08 20:28:12');
INSERT INTO `ddz_play_logs_202605` VALUES (91, '7bcd73b9-4007-4e78-930e-721936c88248', 4, 1, 1, 1, 1, '♣8,♣6,♥6,♠6,♦5,♥5,♠5,♥3', 8, '飞机带单', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (92, '7bcd73b9-4007-4e78-930e-721936c88248', 31, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (93, '7bcd73b9-4007-4e78-930e-721936c88248', 29, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (94, '7bcd73b9-4007-4e78-930e-721936c88248', 4, 1, 2, 1, 1, '♣A,♣K,♣Q,♣J,♥10', 5, '顺子', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (95, '7bcd73b9-4007-4e78-930e-721936c88248', 31, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (96, '7bcd73b9-4007-4e78-930e-721936c88248', 29, 2, 2, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (97, '7bcd73b9-4007-4e78-930e-721936c88248', 4, 1, 3, 1, 1, '♦4,♠4', 2, '对子', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (98, '7bcd73b9-4007-4e78-930e-721936c88248', 31, 2, 3, 2, 1, '♥8,♦8', 2, '对子', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (99, '7bcd73b9-4007-4e78-930e-721936c88248', 29, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (100, '7bcd73b9-4007-4e78-930e-721936c88248', 4, 1, 3, 4, 1, '♥A,♠A', 2, '对子', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (101, '7bcd73b9-4007-4e78-930e-721936c88248', 31, 2, 3, 5, 1, '♥2,♦2', 2, '对子', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (102, '7bcd73b9-4007-4e78-930e-721936c88248', 29, 2, 3, 6, 2, '', 0, '', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (103, '7bcd73b9-4007-4e78-930e-721936c88248', 4, 1, 3, 7, 2, '', 0, '', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (104, '7bcd73b9-4007-4e78-930e-721936c88248', 31, 2, 4, 1, 1, '♦9', 1, '单张', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (105, '7bcd73b9-4007-4e78-930e-721936c88248', 29, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (106, '7bcd73b9-4007-4e78-930e-721936c88248', 4, 1, 4, 3, 1, '♣2', 1, '单张', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (107, '7bcd73b9-4007-4e78-930e-721936c88248', 31, 2, 4, 4, 2, '', 0, '', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (108, '7bcd73b9-4007-4e78-930e-721936c88248', 29, 2, 4, 5, 2, '', 0, '', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (109, '7bcd73b9-4007-4e78-930e-721936c88248', 4, 1, 5, 1, 1, '♠2', 1, '单张', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (110, '7bcd73b9-4007-4e78-930e-721936c88248', 31, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (111, '7bcd73b9-4007-4e78-930e-721936c88248', 29, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (112, '7bcd73b9-4007-4e78-930e-721936c88248', 4, 1, 6, 1, 1, 'RJ', 1, '单张', 0, 0, '2026-05-09 07:21:30');
INSERT INTO `ddz_play_logs_202605` VALUES (113, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 4, 1, 1, 1, 1, '♣5', 1, '单张', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (114, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 31, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (115, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 29, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (116, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 4, 1, 2, 1, 1, '♣9', 1, '单张', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (117, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 31, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (118, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 29, 2, 2, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (119, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 4, 1, 3, 1, 1, '♦4,♥4,♠4,♥3,♦3', 5, '三带二', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (120, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 31, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (121, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 29, 2, 3, 3, 1, '♠7,♥7,♦7,♠3,♣3', 5, '三带二', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (122, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 4, 1, 3, 4, 1, '♠10,♥10,♣10,♠6,♥6', 5, '三带二', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (123, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 31, 2, 3, 5, 2, '', 0, '', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (124, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 29, 2, 3, 6, 1, '♥2,♣2,♦2,♠Q,♥Q', 5, '三带二', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (125, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 4, 1, 3, 7, 2, '', 0, '', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (126, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 31, 2, 3, 8, 2, '', 0, '', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (127, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 29, 2, 4, 1, 1, '♥8', 1, '单张', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (128, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 4, 1, 4, 2, 1, '♥A', 1, '单张', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (129, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 31, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (130, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 29, 2, 4, 4, 2, '', 0, '', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (131, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 4, 1, 5, 1, 1, '♦8,♠8', 2, '对子', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (132, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 31, 2, 5, 2, 1, '♠9,♥9', 2, '对子', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (133, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 29, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (134, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 4, 1, 5, 4, 1, '♥J,♦J', 2, '对子', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (135, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 31, 2, 5, 5, 1, '♣Q,♦Q', 2, '对子', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (136, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 29, 2, 5, 6, 2, '', 0, '', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (137, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 4, 1, 5, 7, 1, '♣K,♦K', 2, '对子', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (138, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 31, 2, 5, 8, 1, 'RJ,BJ', 2, '王炸', 0, 1, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (139, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 29, 2, 5, 9, 2, '', 0, '', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (140, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 4, 1, 5, 10, 2, '', 0, '', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (141, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 31, 2, 6, 1, 1, '♦6', 1, '单张', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (142, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 29, 2, 6, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (143, '277c55b0-7752-4f83-8b5a-c44b4eec2370', 4, 1, 6, 3, 1, '♠2', 1, '单张', 0, 0, '2026-05-09 07:23:00');
INSERT INTO `ddz_play_logs_202605` VALUES (144, 'ff1c49e3-918c-4a72-8bad-747def826d60', 4, 1, 1, 1, 1, '♥4,♠4', 2, '对子', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (145, 'ff1c49e3-918c-4a72-8bad-747def826d60', 31, 2, 1, 2, 1, '♠7,♣7', 2, '对子', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (146, 'ff1c49e3-918c-4a72-8bad-747def826d60', 29, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (147, 'ff1c49e3-918c-4a72-8bad-747def826d60', 4, 1, 1, 4, 1, '♥Q,♦Q', 2, '对子', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (148, 'ff1c49e3-918c-4a72-8bad-747def826d60', 31, 2, 1, 5, 1, '♥K,♣K', 2, '对子', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (149, 'ff1c49e3-918c-4a72-8bad-747def826d60', 29, 2, 1, 6, 2, '', 0, '', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (150, 'ff1c49e3-918c-4a72-8bad-747def826d60', 4, 1, 1, 7, 2, '', 0, '', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (151, 'ff1c49e3-918c-4a72-8bad-747def826d60', 31, 2, 2, 1, 1, '♦4', 1, '单张', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (152, 'ff1c49e3-918c-4a72-8bad-747def826d60', 29, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (153, 'ff1c49e3-918c-4a72-8bad-747def826d60', 4, 1, 2, 3, 1, '♣6', 1, '单张', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (154, 'ff1c49e3-918c-4a72-8bad-747def826d60', 31, 2, 2, 4, 2, '', 0, '', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (155, 'ff1c49e3-918c-4a72-8bad-747def826d60', 29, 2, 2, 5, 2, '', 0, '', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (156, 'ff1c49e3-918c-4a72-8bad-747def826d60', 4, 1, 3, 1, 1, '♥9', 1, '单张', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (157, 'ff1c49e3-918c-4a72-8bad-747def826d60', 31, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (158, 'ff1c49e3-918c-4a72-8bad-747def826d60', 29, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (159, 'ff1c49e3-918c-4a72-8bad-747def826d60', 4, 1, 4, 1, 1, '♣10', 1, '单张', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (160, 'ff1c49e3-918c-4a72-8bad-747def826d60', 31, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (161, 'ff1c49e3-918c-4a72-8bad-747def826d60', 29, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (162, 'ff1c49e3-918c-4a72-8bad-747def826d60', 4, 1, 5, 1, 1, '♠K', 1, '单张', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (163, 'ff1c49e3-918c-4a72-8bad-747def826d60', 31, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (164, 'ff1c49e3-918c-4a72-8bad-747def826d60', 29, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (165, 'ff1c49e3-918c-4a72-8bad-747def826d60', 4, 1, 6, 1, 1, '♠A', 1, '单张', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (166, 'ff1c49e3-918c-4a72-8bad-747def826d60', 31, 2, 6, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (167, 'ff1c49e3-918c-4a72-8bad-747def826d60', 29, 2, 6, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (168, 'ff1c49e3-918c-4a72-8bad-747def826d60', 4, 1, 7, 1, 1, '♦2', 1, '单张', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (169, 'ff1c49e3-918c-4a72-8bad-747def826d60', 31, 2, 7, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (170, 'ff1c49e3-918c-4a72-8bad-747def826d60', 29, 2, 7, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (171, 'ff1c49e3-918c-4a72-8bad-747def826d60', 4, 1, 8, 1, 1, '♠8,♥8,♣8,♥5,♦5', 5, '三带二', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (172, 'ff1c49e3-918c-4a72-8bad-747def826d60', 31, 2, 8, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (173, 'ff1c49e3-918c-4a72-8bad-747def826d60', 29, 2, 8, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (174, 'ff1c49e3-918c-4a72-8bad-747def826d60', 4, 1, 9, 1, 1, 'RJ', 1, '单张', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (175, 'ff1c49e3-918c-4a72-8bad-747def826d60', 31, 2, 9, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (176, 'ff1c49e3-918c-4a72-8bad-747def826d60', 29, 2, 9, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (177, 'ff1c49e3-918c-4a72-8bad-747def826d60', 4, 1, 10, 1, 1, '♦3,♣3,♥3,♠3', 4, '炸弹', 1, 0, '2026-05-09 07:24:21');
INSERT INTO `ddz_play_logs_202605` VALUES (178, '8c7441a4-43c5-4000-8d41-6c57090bb760', 4, 1, 1, 1, 1, '♠4', 1, '单张', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (179, '8c7441a4-43c5-4000-8d41-6c57090bb760', 28, 2, 1, 2, 1, '♣5', 1, '单张', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (180, '8c7441a4-43c5-4000-8d41-6c57090bb760', 15, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (181, '8c7441a4-43c5-4000-8d41-6c57090bb760', 4, 1, 1, 4, 1, '♣6', 1, '单张', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (182, '8c7441a4-43c5-4000-8d41-6c57090bb760', 28, 2, 1, 5, 1, '♣8', 1, '单张', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (183, '8c7441a4-43c5-4000-8d41-6c57090bb760', 15, 2, 1, 6, 2, '', 0, '', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (184, '8c7441a4-43c5-4000-8d41-6c57090bb760', 4, 1, 1, 7, 1, '♠10', 1, '单张', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (185, '8c7441a4-43c5-4000-8d41-6c57090bb760', 28, 2, 1, 8, 1, '♠J', 1, '单张', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (186, '8c7441a4-43c5-4000-8d41-6c57090bb760', 15, 2, 1, 9, 2, '', 0, '', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (187, '8c7441a4-43c5-4000-8d41-6c57090bb760', 4, 1, 1, 10, 1, '♦Q', 1, '单张', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (188, '8c7441a4-43c5-4000-8d41-6c57090bb760', 28, 2, 1, 11, 1, 'RJ', 1, '单张', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (189, '8c7441a4-43c5-4000-8d41-6c57090bb760', 15, 2, 1, 12, 2, '', 0, '', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (190, '8c7441a4-43c5-4000-8d41-6c57090bb760', 4, 1, 1, 13, 2, '', 0, '', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (191, '8c7441a4-43c5-4000-8d41-6c57090bb760', 28, 2, 2, 1, 1, '♦3', 1, '单张', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (192, '8c7441a4-43c5-4000-8d41-6c57090bb760', 15, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (193, '8c7441a4-43c5-4000-8d41-6c57090bb760', 4, 1, 2, 3, 1, '♦7', 1, '单张', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (194, '8c7441a4-43c5-4000-8d41-6c57090bb760', 28, 2, 2, 4, 1, '♥8', 1, '单张', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (195, '8c7441a4-43c5-4000-8d41-6c57090bb760', 15, 2, 2, 5, 2, '', 0, '', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (196, '8c7441a4-43c5-4000-8d41-6c57090bb760', 4, 1, 2, 6, 1, '♣2', 1, '单张', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (197, '8c7441a4-43c5-4000-8d41-6c57090bb760', 28, 2, 2, 7, 2, '', 0, '', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (198, '8c7441a4-43c5-4000-8d41-6c57090bb760', 15, 2, 2, 8, 2, '', 0, '', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (199, '8c7441a4-43c5-4000-8d41-6c57090bb760', 4, 1, 3, 1, 1, '♣7,♦6,♦5,♣4,♣3', 5, '顺子', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (200, '8c7441a4-43c5-4000-8d41-6c57090bb760', 28, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (201, '8c7441a4-43c5-4000-8d41-6c57090bb760', 15, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (202, '8c7441a4-43c5-4000-8d41-6c57090bb760', 4, 1, 4, 1, 1, '♥A,♦A,♦J,♣J,♥J', 5, '三带二', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (203, '8c7441a4-43c5-4000-8d41-6c57090bb760', 28, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (204, '8c7441a4-43c5-4000-8d41-6c57090bb760', 15, 2, 4, 3, 1, '♠2,♥2,♦2,♠3,♥3', 5, '三带二', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (205, '8c7441a4-43c5-4000-8d41-6c57090bb760', 4, 1, 4, 4, 2, '', 0, '', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (206, '8c7441a4-43c5-4000-8d41-6c57090bb760', 28, 2, 4, 5, 2, '', 0, '', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (207, '8c7441a4-43c5-4000-8d41-6c57090bb760', 15, 2, 5, 1, 1, '♥4', 1, '单张', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (208, '8c7441a4-43c5-4000-8d41-6c57090bb760', 4, 1, 5, 2, 1, 'BJ', 1, '单张', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (209, '8c7441a4-43c5-4000-8d41-6c57090bb760', 28, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (210, '8c7441a4-43c5-4000-8d41-6c57090bb760', 15, 2, 5, 4, 2, '', 0, '', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (211, '8c7441a4-43c5-4000-8d41-6c57090bb760', 4, 1, 6, 1, 1, '♣K,♥K,♦K', 3, '三张', 0, 0, '2026-05-09 07:35:52');
INSERT INTO `ddz_play_logs_202605` VALUES (212, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 4, 1, 1, 1, 1, '♣8,♣7,♥6,♥5,♣4', 5, '顺子', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (213, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 28, 2, 1, 2, 1, '♣K,♣Q,♠J,♥10,♦9', 5, '顺子', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (214, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 15, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (215, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 4, 1, 1, 4, 1, '♦A,♦K,♠Q,♣J,♠10', 5, '顺子', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (216, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 28, 2, 1, 5, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (217, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 15, 2, 1, 6, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (218, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 4, 1, 2, 1, 1, '♣10,♣9,♠8,♥7,♣6,♠5', 6, '顺子', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (219, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 28, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (220, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 15, 2, 2, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (221, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 4, 1, 3, 1, 1, '♦Q,♥Q', 2, '对子', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (222, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 28, 2, 3, 2, 1, '♠3,♥3,♣3,♦3', 4, '炸弹', 1, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (223, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 15, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (224, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 4, 1, 3, 4, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (225, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 28, 2, 4, 1, 1, '♠7', 1, '单张', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (226, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 15, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (227, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 4, 1, 4, 3, 1, '♠2', 1, '单张', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (228, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 28, 2, 4, 4, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (229, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 15, 2, 4, 5, 1, 'RJ', 1, '单张', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (230, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 4, 1, 4, 6, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (231, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 28, 2, 4, 7, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (232, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 15, 2, 5, 1, 1, '♠4,♥4', 2, '对子', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (233, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 4, 1, 5, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (234, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 28, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (235, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 15, 2, 6, 1, 1, '♥8,♦8', 2, '对子', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (236, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 4, 1, 6, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (237, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 28, 2, 6, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (238, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 15, 2, 7, 1, 1, '♥J,♦J', 2, '对子', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (239, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 4, 1, 7, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (240, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 28, 2, 7, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (241, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 15, 2, 8, 1, 1, '♠K,♥K', 2, '对子', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (242, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 4, 1, 8, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (243, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 28, 2, 8, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (244, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 15, 2, 9, 1, 1, '♠A,♥A', 2, '对子', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (245, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 4, 1, 9, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (246, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 28, 2, 9, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (247, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 15, 2, 10, 1, 1, '♣2,♦2', 2, '对子', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (248, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 4, 1, 10, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (249, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 28, 2, 10, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (250, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 15, 2, 11, 1, 1, '♦5', 1, '单张', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (251, 'f40a7b83-ed8b-4c8a-b180-e996e0dea180', 4, 1, 11, 2, 1, 'BJ', 1, '单张', 0, 0, '2026-05-09 07:37:27');
INSERT INTO `ddz_play_logs_202605` VALUES (252, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 1, 1, 1, '♠3', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (253, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 1, 2, 1, '♣4', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (254, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (255, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 1, 4, 1, '♣5', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (256, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 1, 5, 1, '♦6', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (257, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 1, 6, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (258, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 1, 7, 1, '♠7', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (259, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 1, 8, 1, '♦8', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (260, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 1, 9, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (261, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 1, 10, 1, '♦10', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (262, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 1, 11, 1, '♥Q', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (263, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 1, 12, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (264, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 1, 13, 1, '♦K', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (265, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 1, 14, 1, '♦A', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (266, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 1, 15, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (267, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 1, 16, 1, '♣2', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (268, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 1, 17, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (269, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 1, 18, 1, 'BJ', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (270, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 1, 19, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (271, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 1, 20, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (272, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 2, 1, 1, '♥4', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (273, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 2, 2, 1, '♠2', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (274, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 2, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (275, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 2, 4, 1, 'RJ', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (276, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 2, 5, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (277, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 2, 6, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (278, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 3, 1, 1, '♠4', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (279, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 3, 2, 1, '♥K', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (280, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 3, 3, 1, '♠A', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (281, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 3, 4, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (282, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 3, 5, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (283, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 4, 1, 1, '♥3', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (284, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (285, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 4, 3, 1, '♦Q', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (286, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 4, 4, 1, '♣K', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (287, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 4, 5, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (288, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 4, 6, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (289, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 5, 1, 1, '♣3', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (290, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (291, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 5, 3, 1, '♦J', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (292, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 5, 4, 1, '♣A', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (293, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 5, 5, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (294, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 5, 6, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (295, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 6, 1, 1, '♠5', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (296, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 6, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (297, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 6, 3, 1, '♥10', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (298, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 6, 4, 1, '♥2', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (299, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 6, 5, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (300, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 6, 6, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (301, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 7, 1, 1, '♥5', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (302, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 7, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (303, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 7, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (304, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 8, 1, 1, '♣7', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (305, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 8, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (306, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 8, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (307, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 9, 1, 1, '♥9', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (308, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 9, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (309, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 9, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (310, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 10, 1, 1, '♠10', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (311, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 9, 2, 10, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (312, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 4, 1, 10, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (313, '713a22d0-af48-4b9f-90da-1d1d4c8ba4a4', 18, 2, 11, 1, 1, '♦2', 1, '单张', 0, 0, '2026-05-09 07:56:30');
INSERT INTO `ddz_play_logs_202605` VALUES (314, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 4, 1, 1, 1, 1, '♥7,♣6,♥5,♣4,♠3', 5, '顺子', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (315, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 18, 2, 1, 2, 1, '♠8,♦7,♦6,♦5,♥4', 5, '顺子', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (316, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 9, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (317, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 4, 1, 1, 4, 2, '', 0, '', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (318, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 18, 2, 2, 1, 1, '♠4', 1, '单张', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (319, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 9, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (320, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 4, 1, 2, 3, 1, '♥6', 1, '单张', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (321, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 18, 2, 2, 4, 1, '♣7', 1, '单张', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (322, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 9, 2, 2, 5, 2, '', 0, '', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (323, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 4, 1, 2, 6, 1, '♣9', 1, '单张', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (324, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 18, 2, 2, 7, 1, '♠10', 1, '单张', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (325, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 9, 2, 2, 8, 2, '', 0, '', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (326, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 4, 1, 2, 9, 2, '', 0, '', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (327, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 18, 2, 3, 1, 1, '♠5', 1, '单张', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (328, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 9, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (329, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 4, 1, 3, 3, 1, '♠7', 1, '单张', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (330, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 18, 2, 3, 4, 1, '♦9', 1, '单张', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (331, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 9, 2, 3, 5, 2, '', 0, '', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (332, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 4, 1, 3, 6, 1, '♥10', 1, '单张', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (333, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 18, 2, 3, 7, 1, '♥J', 1, '单张', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (334, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 9, 2, 3, 8, 2, '', 0, '', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (335, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 4, 1, 3, 9, 2, '', 0, '', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (336, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 18, 2, 4, 1, 1, '♦10', 1, '单张', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (337, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 9, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (338, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 4, 1, 4, 3, 1, '♦2', 1, '单张', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (339, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 18, 2, 4, 4, 1, 'BJ', 1, '单张', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (340, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 9, 2, 4, 5, 2, '', 0, '', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (341, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 4, 1, 4, 6, 1, 'RJ', 1, '单张', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (342, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 18, 2, 4, 7, 2, '', 0, '', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (343, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 9, 2, 4, 8, 2, '', 0, '', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (344, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 4, 1, 5, 1, 1, '♣J,♦J', 2, '对子', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (345, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 18, 2, 5, 2, 1, '♠Q,♥Q', 2, '对子', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (346, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 9, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (347, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 4, 1, 5, 4, 1, '♠K,♥K', 2, '对子', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (348, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 18, 2, 5, 5, 2, '', 0, '', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (349, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 9, 2, 5, 6, 1, '♠2,♥2', 2, '对子', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (350, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 4, 1, 5, 7, 2, '', 0, '', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (351, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 18, 2, 5, 8, 2, '', 0, '', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (352, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 9, 2, 6, 1, 1, '♣3', 1, '单张', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (353, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 4, 1, 6, 2, 1, '♣2', 1, '单张', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (354, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 18, 2, 6, 3, 2, '', 0, '', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (355, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 9, 2, 6, 4, 2, '', 0, '', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (356, 'fc949e35-8f9e-42a6-b8fb-d087c1f5b942', 4, 1, 7, 1, 1, '♠A,♥A,♣A,♦3', 4, '三带一', 0, 0, '2026-05-09 07:57:58');
INSERT INTO `ddz_play_logs_202605` VALUES (357, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 1, 1, 1, '♣4,♠4', 2, '对子', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (358, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 1, 2, 1, '♥6,♦6', 2, '对子', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (359, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (360, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 1, 4, 1, '♦7,♥7', 2, '对子', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (361, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 1, 5, 1, '♠9,♥9', 2, '对子', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (362, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 1, 6, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (363, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 1, 7, 1, '♥10,♦10', 2, '对子', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (364, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 1, 8, 1, '♠2,♥2', 2, '对子', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (365, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 1, 9, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (366, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 1, 10, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (367, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 2, 1, 1, '♠3', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (368, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (369, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 2, 3, 1, '♣9', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (370, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 2, 4, 1, '♣10', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (371, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 2, 5, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (372, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 2, 6, 1, '♦K', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (373, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 2, 7, 1, '♣2', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (374, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 2, 8, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (375, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 2, 9, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (376, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 3, 1, 1, '♥4', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (377, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (378, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 3, 3, 1, '♣A', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (379, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 3, 4, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (380, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 3, 5, 1, '♦2', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (381, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 3, 6, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (382, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 3, 7, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (383, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 4, 1, 1, '♣3', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (384, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 4, 2, 1, '♠5', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (385, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 4, 3, 1, '♠7', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (386, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 4, 4, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (387, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 4, 5, 1, '♥Q', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (388, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 4, 6, 1, '♠K', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (389, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 4, 7, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (390, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 4, 8, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (391, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 5, 1, 1, '♥5', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (392, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (393, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 5, 3, 1, '♠Q', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (394, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 5, 4, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (395, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 5, 5, 1, '♣K', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (396, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 5, 6, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (397, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 5, 7, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (398, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 6, 1, 1, '♥3', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (399, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 6, 2, 1, '♦5', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (400, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 6, 3, 1, '♣8', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (401, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 6, 4, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (402, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 6, 5, 1, '♠J', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (403, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 6, 6, 1, '♦Q', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (404, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 6, 7, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (405, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 6, 8, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (406, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 7, 1, 1, '♦9', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (407, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 7, 2, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (408, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 7, 3, 1, '♥J', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (409, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 7, 4, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (410, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 7, 5, 1, '♣Q', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (411, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 7, 6, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (412, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 7, 7, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (413, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 8, 1, 1, '♦4', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (414, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 8, 2, 1, '♦J', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (415, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 8, 3, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (416, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 8, 4, 1, '♥K', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (417, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 8, 5, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (418, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 8, 6, 2, '', 0, '', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (419, '35eb32d2-b096-4804-aee9-201b886ed4f3', 9, 2, 9, 1, 1, '♣5', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (420, '35eb32d2-b096-4804-aee9-201b886ed4f3', 4, 1, 9, 2, 1, '♦8', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (421, '35eb32d2-b096-4804-aee9-201b886ed4f3', 18, 2, 9, 3, 1, '♣J', 1, '单张', 0, 0, '2026-05-09 08:00:00');
INSERT INTO `ddz_play_logs_202605` VALUES (422, '6cea2468-5824-4335-ac27-2a493ade9023', 4, 1, 1, 1, 1, '♦7,♠6,♠5,♦4,♦3', 5, '顺子', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (423, '6cea2468-5824-4335-ac27-2a493ade9023', 26, 2, 1, 2, 1, '♣8,♥7,♦6,♣5,♣4', 5, '顺子', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (424, '6cea2468-5824-4335-ac27-2a493ade9023', 32, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (425, '6cea2468-5824-4335-ac27-2a493ade9023', 4, 1, 1, 4, 2, '', 0, '', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (426, '6cea2468-5824-4335-ac27-2a493ade9023', 26, 2, 2, 1, 1, '♣3', 1, '单张', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (427, '6cea2468-5824-4335-ac27-2a493ade9023', 32, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (428, '6cea2468-5824-4335-ac27-2a493ade9023', 4, 1, 2, 3, 1, '♠4', 1, '单张', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (429, '6cea2468-5824-4335-ac27-2a493ade9023', 26, 2, 2, 4, 1, '♥6', 1, '单张', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (430, '6cea2468-5824-4335-ac27-2a493ade9023', 32, 2, 2, 5, 2, '', 0, '', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (431, '6cea2468-5824-4335-ac27-2a493ade9023', 4, 1, 2, 6, 1, '♠8', 1, '单张', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (432, '6cea2468-5824-4335-ac27-2a493ade9023', 26, 2, 2, 7, 1, '♥9', 1, '单张', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (433, '6cea2468-5824-4335-ac27-2a493ade9023', 32, 2, 2, 8, 2, '', 0, '', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (434, '6cea2468-5824-4335-ac27-2a493ade9023', 4, 1, 2, 9, 1, '♥10', 1, '单张', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (435, '6cea2468-5824-4335-ac27-2a493ade9023', 26, 2, 2, 10, 1, '♣J', 1, '单张', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (436, '6cea2468-5824-4335-ac27-2a493ade9023', 32, 2, 2, 11, 2, '', 0, '', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (437, '6cea2468-5824-4335-ac27-2a493ade9023', 4, 1, 2, 12, 1, '♥K', 1, '单张', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (438, '6cea2468-5824-4335-ac27-2a493ade9023', 26, 2, 2, 13, 1, '♣A', 1, '单张', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (439, '6cea2468-5824-4335-ac27-2a493ade9023', 32, 2, 2, 14, 2, '', 0, '', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (440, '6cea2468-5824-4335-ac27-2a493ade9023', 4, 1, 2, 15, 1, '♥2', 1, '单张', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (441, '6cea2468-5824-4335-ac27-2a493ade9023', 26, 2, 2, 16, 2, '', 0, '', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (442, '6cea2468-5824-4335-ac27-2a493ade9023', 32, 2, 2, 17, 1, 'BJ', 1, '单张', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (443, '6cea2468-5824-4335-ac27-2a493ade9023', 4, 1, 2, 18, 1, 'RJ', 1, '单张', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (444, '6cea2468-5824-4335-ac27-2a493ade9023', 26, 2, 2, 19, 2, '', 0, '', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (445, '6cea2468-5824-4335-ac27-2a493ade9023', 32, 2, 2, 20, 2, '', 0, '', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (446, '6cea2468-5824-4335-ac27-2a493ade9023', 4, 1, 3, 1, 1, '♦10,♣10,♠10,♦8', 4, '三带一', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (447, '6cea2468-5824-4335-ac27-2a493ade9023', 26, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (448, '6cea2468-5824-4335-ac27-2a493ade9023', 32, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (449, '6cea2468-5824-4335-ac27-2a493ade9023', 4, 1, 4, 1, 1, '♦J,♥J', 2, '对子', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (450, '6cea2468-5824-4335-ac27-2a493ade9023', 26, 2, 4, 2, 1, '♠Q,♣Q', 2, '对子', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (451, '6cea2468-5824-4335-ac27-2a493ade9023', 32, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (452, '6cea2468-5824-4335-ac27-2a493ade9023', 4, 1, 4, 4, 1, '♠A,♦A', 2, '对子', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (453, '6cea2468-5824-4335-ac27-2a493ade9023', 26, 2, 4, 5, 1, '♠2,♣2', 2, '对子', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (454, '6cea2468-5824-4335-ac27-2a493ade9023', 32, 2, 4, 6, 2, '', 0, '', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (455, '6cea2468-5824-4335-ac27-2a493ade9023', 4, 1, 4, 7, 2, '', 0, '', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (456, '6cea2468-5824-4335-ac27-2a493ade9023', 26, 2, 5, 1, 1, '♠7', 1, '单张', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (457, '6cea2468-5824-4335-ac27-2a493ade9023', 32, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (458, '6cea2468-5824-4335-ac27-2a493ade9023', 4, 1, 5, 3, 1, '♠K', 1, '单张', 0, 0, '2026-05-09 10:02:19');
INSERT INTO `ddz_play_logs_202605` VALUES (459, 'badcee84-ce2c-4272-8293-240f683be96a', 4, 1, 1, 1, 1, '♥4,♦4,♥3,♣3,♦3', 5, '三带二', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (460, 'badcee84-ce2c-4272-8293-240f683be96a', 13, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (461, 'badcee84-ce2c-4272-8293-240f683be96a', 20, 2, 1, 3, 1, '♠Q,♥Q,♣Q,♠4,♣4', 5, '三带二', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (462, 'badcee84-ce2c-4272-8293-240f683be96a', 4, 1, 1, 4, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (463, 'badcee84-ce2c-4272-8293-240f683be96a', 13, 2, 1, 5, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (464, 'badcee84-ce2c-4272-8293-240f683be96a', 20, 2, 2, 1, 1, '♠3', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (465, 'badcee84-ce2c-4272-8293-240f683be96a', 4, 1, 2, 2, 1, '♥K', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (466, 'badcee84-ce2c-4272-8293-240f683be96a', 13, 2, 2, 3, 1, '♦A', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (467, 'badcee84-ce2c-4272-8293-240f683be96a', 20, 2, 2, 4, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (468, 'badcee84-ce2c-4272-8293-240f683be96a', 4, 1, 2, 5, 1, '♥2', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (469, 'badcee84-ce2c-4272-8293-240f683be96a', 13, 2, 2, 6, 1, 'BJ', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (470, 'badcee84-ce2c-4272-8293-240f683be96a', 20, 2, 2, 7, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (471, 'badcee84-ce2c-4272-8293-240f683be96a', 4, 1, 2, 8, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (472, 'badcee84-ce2c-4272-8293-240f683be96a', 13, 2, 3, 1, 1, '♥5', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (473, 'badcee84-ce2c-4272-8293-240f683be96a', 20, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (474, 'badcee84-ce2c-4272-8293-240f683be96a', 4, 1, 3, 3, 1, '♠2', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (475, 'badcee84-ce2c-4272-8293-240f683be96a', 13, 2, 3, 4, 1, 'RJ', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (476, 'badcee84-ce2c-4272-8293-240f683be96a', 20, 2, 3, 5, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (477, 'badcee84-ce2c-4272-8293-240f683be96a', 4, 1, 3, 6, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (478, 'badcee84-ce2c-4272-8293-240f683be96a', 13, 2, 4, 1, 1, '♦6', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (479, 'badcee84-ce2c-4272-8293-240f683be96a', 20, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (480, 'badcee84-ce2c-4272-8293-240f683be96a', 4, 1, 4, 3, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (481, 'badcee84-ce2c-4272-8293-240f683be96a', 13, 2, 5, 1, 1, '♠6', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (482, 'badcee84-ce2c-4272-8293-240f683be96a', 20, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (483, 'badcee84-ce2c-4272-8293-240f683be96a', 4, 1, 5, 3, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (484, 'badcee84-ce2c-4272-8293-240f683be96a', 13, 2, 6, 1, 1, '♥6', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (485, 'badcee84-ce2c-4272-8293-240f683be96a', 20, 2, 6, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (486, 'badcee84-ce2c-4272-8293-240f683be96a', 4, 1, 6, 3, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (487, 'badcee84-ce2c-4272-8293-240f683be96a', 13, 2, 7, 1, 1, '♣7', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (488, 'badcee84-ce2c-4272-8293-240f683be96a', 20, 2, 7, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (489, 'badcee84-ce2c-4272-8293-240f683be96a', 4, 1, 7, 3, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (490, 'badcee84-ce2c-4272-8293-240f683be96a', 13, 2, 8, 1, 1, '♣8', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (491, 'badcee84-ce2c-4272-8293-240f683be96a', 20, 2, 8, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (492, 'badcee84-ce2c-4272-8293-240f683be96a', 4, 1, 8, 3, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (493, 'badcee84-ce2c-4272-8293-240f683be96a', 13, 2, 9, 1, 1, '♠9', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (494, 'badcee84-ce2c-4272-8293-240f683be96a', 20, 2, 9, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (495, 'badcee84-ce2c-4272-8293-240f683be96a', 4, 1, 9, 3, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (496, 'badcee84-ce2c-4272-8293-240f683be96a', 13, 2, 10, 1, 1, '♦9', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (497, 'badcee84-ce2c-4272-8293-240f683be96a', 20, 2, 10, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (498, 'badcee84-ce2c-4272-8293-240f683be96a', 4, 1, 10, 3, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (499, 'badcee84-ce2c-4272-8293-240f683be96a', 13, 2, 11, 1, 1, '♦10', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (500, 'badcee84-ce2c-4272-8293-240f683be96a', 20, 2, 11, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (501, 'badcee84-ce2c-4272-8293-240f683be96a', 4, 1, 11, 3, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (502, 'badcee84-ce2c-4272-8293-240f683be96a', 13, 2, 12, 1, 1, '♥J', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (503, 'badcee84-ce2c-4272-8293-240f683be96a', 20, 2, 12, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (504, 'badcee84-ce2c-4272-8293-240f683be96a', 4, 1, 12, 3, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (505, 'badcee84-ce2c-4272-8293-240f683be96a', 13, 2, 13, 1, 1, '♦K', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (506, 'badcee84-ce2c-4272-8293-240f683be96a', 20, 2, 13, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (507, 'badcee84-ce2c-4272-8293-240f683be96a', 4, 1, 13, 3, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (508, 'badcee84-ce2c-4272-8293-240f683be96a', 13, 2, 14, 1, 1, '♥A', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (509, 'badcee84-ce2c-4272-8293-240f683be96a', 20, 2, 14, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (510, 'badcee84-ce2c-4272-8293-240f683be96a', 4, 1, 14, 3, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (511, 'badcee84-ce2c-4272-8293-240f683be96a', 13, 2, 15, 1, 1, '♣A', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (512, 'badcee84-ce2c-4272-8293-240f683be96a', 20, 2, 15, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (513, 'badcee84-ce2c-4272-8293-240f683be96a', 4, 1, 15, 3, 2, '', 0, '', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (514, 'badcee84-ce2c-4272-8293-240f683be96a', 13, 2, 16, 1, 1, '♣2', 1, '单张', 0, 0, '2026-05-09 10:52:11');
INSERT INTO `ddz_play_logs_202605` VALUES (515, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 1, 1, 1, '♠3,♥3', 2, '对子', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (516, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 1, 2, 1, '♠5,♦5', 2, '对子', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (517, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (518, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 1, 4, 1, '♣Q,♥Q', 2, '对子', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (519, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 1, 5, 1, '♥K,♦K', 2, '对子', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (520, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 1, 6, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (521, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 1, 7, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (522, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 2, 1, 1, '♣3', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (523, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (524, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 2, 3, 1, '♥5', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (525, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 2, 4, 1, '♥6', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (526, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 2, 5, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (527, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 2, 6, 1, '♣7', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (528, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 2, 7, 1, '♦9', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (529, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 2, 8, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (530, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 2, 9, 1, '♣K', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (531, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 2, 10, 1, '♠A', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (532, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 2, 11, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (533, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 2, 12, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (534, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 3, 1, 1, '♦4', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (535, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (536, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 3, 3, 1, '♠9', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (537, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 3, 4, 1, '♠10', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (538, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 3, 5, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (539, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 3, 6, 1, '♣A', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (540, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 3, 7, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (541, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 3, 8, 1, '♦2', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (542, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 3, 9, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (543, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 3, 10, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (544, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 4, 1, 1, '♦3', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (545, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 4, 2, 1, '♠K', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (546, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 4, 3, 1, '♥A', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (547, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 4, 4, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (548, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 4, 5, 1, '♣2', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (549, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 4, 6, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (550, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 4, 7, 1, 'BJ', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (551, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 4, 8, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (552, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 4, 9, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (553, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 5, 1, 1, '♣4', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (554, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 5, 2, 1, '♥2', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (555, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (556, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 5, 4, 1, 'RJ', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (557, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 5, 5, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (558, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 5, 6, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (559, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 6, 1, 1, '♠4', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (560, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 6, 2, 1, '♣5', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (561, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 6, 3, 1, '♠7', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (562, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 6, 4, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (563, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 6, 5, 1, '♣8', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (564, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 6, 6, 1, '♣10', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (565, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 6, 7, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (566, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 6, 8, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (567, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 7, 1, 1, '♦7', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (568, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 7, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (569, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 7, 3, 1, '♥9', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (570, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 7, 4, 1, '♦10', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (571, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 7, 5, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (572, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 7, 6, 1, '♥J', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (573, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 7, 7, 1, '♦A', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (574, '856497fa-f927-4306-879f-0b1c4b0596dc', 20, 2, 7, 8, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (575, '856497fa-f927-4306-879f-0b1c4b0596dc', 4, 1, 7, 9, 2, '', 0, '', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (576, '856497fa-f927-4306-879f-0b1c4b0596dc', 13, 2, 8, 1, 1, '♠J', 1, '单张', 0, 0, '2026-05-09 10:55:20');
INSERT INTO `ddz_play_logs_202605` VALUES (577, '8233eba0-e039-409f-b9e5-8bc9c960be63', 4, 1, 1, 1, 1, '♠3', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (578, '8233eba0-e039-409f-b9e5-8bc9c960be63', 13, 2, 1, 2, 1, '♥6', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (579, '8233eba0-e039-409f-b9e5-8bc9c960be63', 20, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (580, '8233eba0-e039-409f-b9e5-8bc9c960be63', 4, 1, 1, 4, 1, '♥J', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (581, '8233eba0-e039-409f-b9e5-8bc9c960be63', 13, 2, 1, 5, 1, '♦Q', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (582, '8233eba0-e039-409f-b9e5-8bc9c960be63', 20, 2, 1, 6, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (583, '8233eba0-e039-409f-b9e5-8bc9c960be63', 4, 1, 1, 7, 1, '♦K', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (584, '8233eba0-e039-409f-b9e5-8bc9c960be63', 13, 2, 1, 8, 1, '♦A', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (585, '8233eba0-e039-409f-b9e5-8bc9c960be63', 20, 2, 1, 9, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (586, '8233eba0-e039-409f-b9e5-8bc9c960be63', 4, 1, 1, 10, 1, '♥2', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (587, '8233eba0-e039-409f-b9e5-8bc9c960be63', 13, 2, 1, 11, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (588, '8233eba0-e039-409f-b9e5-8bc9c960be63', 20, 2, 1, 12, 1, 'RJ', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (589, '8233eba0-e039-409f-b9e5-8bc9c960be63', 4, 1, 1, 13, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (590, '8233eba0-e039-409f-b9e5-8bc9c960be63', 13, 2, 1, 14, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (591, '8233eba0-e039-409f-b9e5-8bc9c960be63', 20, 2, 2, 1, 1, '♦3', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (592, '8233eba0-e039-409f-b9e5-8bc9c960be63', 4, 1, 2, 2, 1, '♠4', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (593, '8233eba0-e039-409f-b9e5-8bc9c960be63', 13, 2, 2, 3, 1, '♠6', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (594, '8233eba0-e039-409f-b9e5-8bc9c960be63', 20, 2, 2, 4, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (595, '8233eba0-e039-409f-b9e5-8bc9c960be63', 4, 1, 2, 5, 1, '♥7', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (596, '8233eba0-e039-409f-b9e5-8bc9c960be63', 13, 2, 2, 6, 1, '♣8', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (597, '8233eba0-e039-409f-b9e5-8bc9c960be63', 20, 2, 2, 7, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (598, '8233eba0-e039-409f-b9e5-8bc9c960be63', 4, 1, 2, 8, 1, '♦9', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (599, '8233eba0-e039-409f-b9e5-8bc9c960be63', 13, 2, 2, 9, 1, '♣10', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (600, '8233eba0-e039-409f-b9e5-8bc9c960be63', 20, 2, 2, 10, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (601, '8233eba0-e039-409f-b9e5-8bc9c960be63', 4, 1, 2, 11, 1, '♠J', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (602, '8233eba0-e039-409f-b9e5-8bc9c960be63', 13, 2, 2, 12, 1, '♣Q', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (603, '8233eba0-e039-409f-b9e5-8bc9c960be63', 20, 2, 2, 13, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (604, '8233eba0-e039-409f-b9e5-8bc9c960be63', 4, 1, 2, 14, 1, '♣K', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (605, '8233eba0-e039-409f-b9e5-8bc9c960be63', 13, 2, 2, 15, 1, '♣A', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (606, '8233eba0-e039-409f-b9e5-8bc9c960be63', 20, 2, 2, 16, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (607, '8233eba0-e039-409f-b9e5-8bc9c960be63', 4, 1, 2, 17, 1, 'BJ', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (608, '8233eba0-e039-409f-b9e5-8bc9c960be63', 13, 2, 2, 18, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (609, '8233eba0-e039-409f-b9e5-8bc9c960be63', 20, 2, 2, 19, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (610, '8233eba0-e039-409f-b9e5-8bc9c960be63', 4, 1, 3, 1, 1, '♣6', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (611, '8233eba0-e039-409f-b9e5-8bc9c960be63', 13, 2, 3, 2, 1, '♦7', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (612, '8233eba0-e039-409f-b9e5-8bc9c960be63', 20, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (613, '8233eba0-e039-409f-b9e5-8bc9c960be63', 4, 1, 3, 4, 1, '♥10', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (614, '8233eba0-e039-409f-b9e5-8bc9c960be63', 13, 2, 3, 5, 1, '♣J', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (615, '8233eba0-e039-409f-b9e5-8bc9c960be63', 20, 2, 3, 6, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (616, '8233eba0-e039-409f-b9e5-8bc9c960be63', 4, 1, 3, 7, 1, '♥A', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (617, '8233eba0-e039-409f-b9e5-8bc9c960be63', 13, 2, 3, 8, 1, '♠2', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (618, '8233eba0-e039-409f-b9e5-8bc9c960be63', 20, 2, 3, 9, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (619, '8233eba0-e039-409f-b9e5-8bc9c960be63', 4, 1, 3, 10, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (620, '8233eba0-e039-409f-b9e5-8bc9c960be63', 13, 2, 4, 1, 1, '♥3', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (621, '8233eba0-e039-409f-b9e5-8bc9c960be63', 20, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (622, '8233eba0-e039-409f-b9e5-8bc9c960be63', 4, 1, 4, 3, 1, '♥Q', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (623, '8233eba0-e039-409f-b9e5-8bc9c960be63', 13, 2, 4, 4, 1, '♠K', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (624, '8233eba0-e039-409f-b9e5-8bc9c960be63', 20, 2, 4, 5, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (625, '8233eba0-e039-409f-b9e5-8bc9c960be63', 4, 1, 4, 6, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (626, '8233eba0-e039-409f-b9e5-8bc9c960be63', 13, 2, 5, 1, 1, '♣9', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (627, '8233eba0-e039-409f-b9e5-8bc9c960be63', 20, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (628, '8233eba0-e039-409f-b9e5-8bc9c960be63', 4, 1, 5, 3, 1, '♠Q', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (629, '8233eba0-e039-409f-b9e5-8bc9c960be63', 13, 2, 5, 4, 1, '♥K', 1, '单张', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (630, '8233eba0-e039-409f-b9e5-8bc9c960be63', 20, 2, 5, 5, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (631, '8233eba0-e039-409f-b9e5-8bc9c960be63', 4, 1, 5, 6, 2, '', 0, '', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (632, '8233eba0-e039-409f-b9e5-8bc9c960be63', 13, 2, 6, 1, 1, '♣2,♦2', 2, '对子', 0, 0, '2026-05-09 10:57:41');
INSERT INTO `ddz_play_logs_202605` VALUES (633, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 1, 1, 1, '♥7,♣6,♥5,♦4,♣3', 5, '顺子', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (634, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (635, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 1, 3, 1, '♥A,♦K,♠Q,♥J,♥10', 5, '顺子', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (636, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 1, 4, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (637, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, 1, 5, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (638, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 2, 1, 1, '♠3', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (639, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 2, 2, 1, '♦5', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (640, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, 2, 3, 1, '♠6', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (641, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 2, 4, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (642, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 2, 5, 1, '♦8', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (643, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, 2, 6, 1, '♦9', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (644, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 2, 7, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (645, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 2, 8, 1, '♦10', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (646, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, 2, 9, 1, '♠J', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (647, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 2, 10, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (648, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 2, 11, 1, '♥Q', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (649, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, 2, 12, 1, '♣K', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (650, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 2, 13, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (651, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 2, 14, 1, '♦A', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (652, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, 2, 15, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (653, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 2, 16, 1, '♣2', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (654, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 2, 17, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (655, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, 2, 18, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (656, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 3, 1, 1, '♠4', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (657, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 3, 2, 1, '♣5', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (658, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, 3, 3, 1, '♠7', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (659, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 3, 4, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (660, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 3, 5, 1, '♣9', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (661, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, 3, 6, 1, '♠A', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (662, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 3, 7, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (663, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 3, 8, 1, '♠2', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (664, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, 3, 9, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (665, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 3, 10, 1, 'BJ', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (666, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 3, 11, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (667, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, 3, 12, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (668, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 4, 1, 1, '♠5', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (669, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 4, 2, 1, '♣10', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (670, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, 4, 3, 1, '♣A', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (671, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 4, 4, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (672, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 4, 5, 1, '♦2', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (673, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, 4, 6, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (674, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 4, 7, 1, 'RJ', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (675, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 4, 8, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (676, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, 4, 9, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (677, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 5, 1, 1, '♥6', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (678, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 5, 2, 1, '♣J', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (679, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (680, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 5, 4, 1, '♠K', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (681, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 5, 5, 1, '♥2', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (682, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, 5, 6, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (683, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 5, 7, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (684, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 6, 1, 1, '♦J', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (685, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, 6, 2, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (686, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 6, 3, 1, '♥K', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (687, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 6, 4, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (688, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, 6, 5, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (689, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 7, 1, 1, '♦6', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (690, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 7, 2, 1, '♣Q', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (691, 'ecc59607-3422-478d-9290-b22f79890c76', 4, 2, 7, 3, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (692, 'ecc59607-3422-478d-9290-b22f79890c76', 14, 2, 7, 4, 2, '', 0, '', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (693, 'ecc59607-3422-478d-9290-b22f79890c76', 11, 1, 8, 1, 1, '♦Q', 1, '单张', 0, 0, '2026-05-09 11:41:50');
INSERT INTO `ddz_play_logs_202605` VALUES (694, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 4, 1, 1, 1, 1, '♣Q,♣J,♦10,♣9,♦8,♣7,♥6,♣5', 8, '顺子', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (695, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 31, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (696, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 26, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (697, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 4, 1, 2, 1, 1, '♦3', 1, '单张', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (698, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 31, 2, 2, 2, 1, '♦4', 1, '单张', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (699, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 26, 2, 2, 3, 2, '', 0, '', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (700, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 4, 1, 2, 4, 1, '♠7', 1, '单张', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (701, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 31, 2, 2, 5, 1, '♣8', 1, '单张', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (702, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 26, 2, 2, 6, 2, '', 0, '', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (703, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 4, 1, 2, 7, 1, '♠A', 1, '单张', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (704, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 31, 2, 2, 8, 1, 'BJ', 1, '单张', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (705, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 26, 2, 2, 9, 2, '', 0, '', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (706, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 4, 1, 2, 10, 2, '', 0, '', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (707, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 31, 2, 3, 1, 1, '♥3', 1, '单张', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (708, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 26, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (709, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 4, 1, 3, 3, 1, '♣A', 1, '单张', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (710, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 31, 2, 3, 4, 1, 'RJ', 1, '单张', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (711, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 26, 2, 3, 5, 2, '', 0, '', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (712, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 4, 1, 3, 6, 2, '', 0, '', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (713, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 31, 2, 4, 1, 1, '♠4', 1, '单张', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (714, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 26, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (715, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 4, 1, 4, 3, 1, '♣2', 1, '单张', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (716, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 31, 2, 4, 4, 2, '', 0, '', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (717, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 26, 2, 4, 5, 2, '', 0, '', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (718, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 4, 1, 5, 1, 1, '♣K,♥K,♠K,♥8,♠8', 5, '三带二', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (719, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 31, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (720, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 26, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (721, '6b5ec4e6-d2d9-4441-b64f-9beb4329f0c0', 4, 1, 6, 1, 1, '♥2,♠2', 2, '对子', 0, 0, '2026-05-09 12:40:51');
INSERT INTO `ddz_play_logs_202605` VALUES (722, 'b870234d-60a1-4515-89d9-506d78fed621', 4, 1, 1, 1, 1, '♣4,♥4,♠4,♦3', 4, '三带一', 0, 0, '2026-05-09 13:40:56');
INSERT INTO `ddz_play_logs_202605` VALUES (723, 'b870234d-60a1-4515-89d9-506d78fed621', 4, 1, 1, 2, 1, '♣6', 1, '单张', 0, 0, '2026-05-09 13:40:56');
INSERT INTO `ddz_play_logs_202605` VALUES (724, 'b870234d-60a1-4515-89d9-506d78fed621', 4, 1, 1, 3, 1, '♠8', 1, '单张', 0, 0, '2026-05-09 13:40:56');
INSERT INTO `ddz_play_logs_202605` VALUES (725, 'b870234d-60a1-4515-89d9-506d78fed621', 4, 1, 1, 4, 1, '♦Q', 1, '单张', 0, 0, '2026-05-09 13:40:56');
INSERT INTO `ddz_play_logs_202605` VALUES (726, 'b870234d-60a1-4515-89d9-506d78fed621', 4, 1, 1, 5, 2, '', 0, '', 0, 0, '2026-05-09 13:40:56');
INSERT INTO `ddz_play_logs_202605` VALUES (727, 'b870234d-60a1-4515-89d9-506d78fed621', 4, 1, 2, 1, 1, '♦2', 1, '单张', 0, 0, '2026-05-09 13:40:56');
INSERT INTO `ddz_play_logs_202605` VALUES (728, 'b870234d-60a1-4515-89d9-506d78fed621', 4, 1, 2, 2, 1, '♥10,♠10', 2, '对子', 0, 0, '2026-05-09 13:40:56');
INSERT INTO `ddz_play_logs_202605` VALUES (729, 'b870234d-60a1-4515-89d9-506d78fed621', 4, 1, 2, 3, 1, '♦K,♣K', 2, '对子', 0, 0, '2026-05-09 13:40:56');
INSERT INTO `ddz_play_logs_202605` VALUES (730, 'b870234d-60a1-4515-89d9-506d78fed621', 4, 1, 2, 4, 2, '', 0, '', 0, 0, '2026-05-09 13:40:56');
INSERT INTO `ddz_play_logs_202605` VALUES (731, 'b870234d-60a1-4515-89d9-506d78fed621', 4, 1, 2, 5, 1, '♣2', 1, '单张', 0, 0, '2026-05-09 13:40:56');
INSERT INTO `ddz_play_logs_202605` VALUES (732, 'b870234d-60a1-4515-89d9-506d78fed621', 4, 1, 2, 6, 1, '♦A,♣A,♣J,♠J,♦J', 5, '三带二', 0, 0, '2026-05-09 13:40:56');
INSERT INTO `ddz_play_logs_202605` VALUES (733, 'b870234d-60a1-4515-89d9-506d78fed621', 4, 1, 2, 7, 1, 'RJ,BJ', 2, '王炸', 0, 1, '2026-05-09 13:40:56');
INSERT INTO `ddz_play_logs_202605` VALUES (734, 'f15d8dd9-db71-4038-992c-6206ccf7b4e9', 4, 1, 1, 1, 1, '♠3', 1, '单张', 0, 0, '2026-05-09 13:42:41');
INSERT INTO `ddz_play_logs_202605` VALUES (735, 'f15d8dd9-db71-4038-992c-6206ccf7b4e9', 4, 1, 1, 2, 1, '♥6', 1, '单张', 0, 0, '2026-05-09 13:42:41');
INSERT INTO `ddz_play_logs_202605` VALUES (736, 'f15d8dd9-db71-4038-992c-6206ccf7b4e9', 4, 1, 1, 3, 1, '♦A', 1, '单张', 0, 0, '2026-05-09 13:42:41');
INSERT INTO `ddz_play_logs_202605` VALUES (737, 'f15d8dd9-db71-4038-992c-6206ccf7b4e9', 4, 1, 1, 4, 2, '', 0, '', 0, 0, '2026-05-09 13:42:41');
INSERT INTO `ddz_play_logs_202605` VALUES (738, 'f15d8dd9-db71-4038-992c-6206ccf7b4e9', 4, 1, 2, 1, 1, '♥2', 1, '单张', 0, 0, '2026-05-09 13:42:41');
INSERT INTO `ddz_play_logs_202605` VALUES (739, 'f15d8dd9-db71-4038-992c-6206ccf7b4e9', 4, 1, 2, 2, 1, 'RJ', 1, '单张', 0, 0, '2026-05-09 13:42:41');
INSERT INTO `ddz_play_logs_202605` VALUES (740, 'f15d8dd9-db71-4038-992c-6206ccf7b4e9', 4, 1, 2, 3, 1, '♦7,♠7,♥5,♦5,♣5', 5, '三带二', 0, 0, '2026-05-09 13:42:41');
INSERT INTO `ddz_play_logs_202605` VALUES (741, 'f15d8dd9-db71-4038-992c-6206ccf7b4e9', 4, 1, 2, 4, 1, '♦J,♣J,♥J,♣9,♠9', 5, '三带二', 0, 0, '2026-05-09 13:42:41');
INSERT INTO `ddz_play_logs_202605` VALUES (742, 'f15d8dd9-db71-4038-992c-6206ccf7b4e9', 4, 1, 2, 5, 2, '', 0, '', 0, 0, '2026-05-09 13:42:41');
INSERT INTO `ddz_play_logs_202605` VALUES (743, 'f15d8dd9-db71-4038-992c-6206ccf7b4e9', 4, 1, 2, 6, 1, '♠Q', 1, '单张', 0, 0, '2026-05-09 13:42:41');
INSERT INTO `ddz_play_logs_202605` VALUES (744, 'f15d8dd9-db71-4038-992c-6206ccf7b4e9', 4, 1, 2, 7, 2, '', 0, '', 0, 0, '2026-05-09 13:42:41');
INSERT INTO `ddz_play_logs_202605` VALUES (745, 'f15d8dd9-db71-4038-992c-6206ccf7b4e9', 4, 1, 3, 1, 1, '♦Q', 1, '单张', 0, 0, '2026-05-09 13:42:41');
INSERT INTO `ddz_play_logs_202605` VALUES (746, 'f15d8dd9-db71-4038-992c-6206ccf7b4e9', 4, 1, 3, 2, 1, '♠2', 1, '单张', 0, 0, '2026-05-09 13:42:41');
INSERT INTO `ddz_play_logs_202605` VALUES (747, 'f15d8dd9-db71-4038-992c-6206ccf7b4e9', 4, 1, 3, 3, 1, '♣10,♥10', 2, '对子', 0, 0, '2026-05-09 13:42:41');
INSERT INTO `ddz_play_logs_202605` VALUES (748, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 1, 1, 1, '♣4', 1, '单张', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (749, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 1, 2, 1, '♠8', 1, '单张', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (750, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 1, 3, 1, '♦J', 1, '单张', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (751, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 1, 4, 1, '♥K', 1, '单张', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (752, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 1, 5, 1, '♣2', 1, '单张', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (753, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 1, 6, 2, '', 0, '', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (754, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 2, 1, 1, '♠A', 1, '单张', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (755, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 2, 2, 2, '', 0, '', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (756, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 3, 1, 1, '♣A', 1, '单张', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (757, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 3, 2, 2, '', 0, '', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (758, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 3, 3, 1, '♠2', 1, '单张', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (759, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 3, 4, 2, '', 0, '', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (760, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 3, 5, 1, '♦7', 1, '单张', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (761, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 3, 6, 1, '♠J', 1, '单张', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (762, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 3, 7, 2, '', 0, '', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (763, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 3, 8, 1, '♣8', 1, '单张', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (764, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 3, 9, 2, '', 0, '', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (765, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 4, 1, 1, '♠9', 1, '单张', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (766, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 4, 2, 2, '', 0, '', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (767, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 5, 1, 1, '♥10', 1, '单张', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (768, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 5, 2, 2, '', 0, '', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (769, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 5, 3, 1, '♦10', 1, '单张', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (770, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 5, 4, 2, '', 0, '', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (771, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 5, 5, 1, '♠10', 1, '单张', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (772, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 5, 6, 2, '', 0, '', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (773, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 5, 7, 2, '', 0, '', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (774, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 5, 8, 2, '', 0, '', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (775, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 5, 9, 2, '', 0, '', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (776, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 5, 10, 2, '', 0, '', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (777, 'd8ccdef9-6562-4991-bfeb-f4f5d5e3a095', 4, 1, 5, 11, 2, '', 0, '', 0, 0, '2026-05-09 13:44:59');
INSERT INTO `ddz_play_logs_202605` VALUES (778, 'b5e5bff5-9ece-4d3f-a9b7-dd08cc209811', 4, 1, 1, 1, 1, '♥3', 1, '单张', 0, 0, '2026-05-09 17:26:05');
INSERT INTO `ddz_play_logs_202605` VALUES (779, 'b5e5bff5-9ece-4d3f-a9b7-dd08cc209811', 4, 1, 1, 2, 1, '♥5', 1, '单张', 0, 0, '2026-05-09 17:26:05');
INSERT INTO `ddz_play_logs_202605` VALUES (780, 'b5e5bff5-9ece-4d3f-a9b7-dd08cc209811', 4, 1, 1, 3, 1, '♠J', 1, '单张', 0, 0, '2026-05-09 17:26:05');
INSERT INTO `ddz_play_logs_202605` VALUES (781, 'b5e5bff5-9ece-4d3f-a9b7-dd08cc209811', 4, 1, 1, 4, 1, '♦2', 1, '单张', 0, 0, '2026-05-09 17:26:05');
INSERT INTO `ddz_play_logs_202605` VALUES (782, 'b5e5bff5-9ece-4d3f-a9b7-dd08cc209811', 4, 1, 1, 5, 2, '', 0, '', 0, 0, '2026-05-09 17:26:05');
INSERT INTO `ddz_play_logs_202605` VALUES (783, 'b5e5bff5-9ece-4d3f-a9b7-dd08cc209811', 4, 1, 2, 1, 1, '♠6', 1, '单张', 0, 0, '2026-05-09 17:26:05');
INSERT INTO `ddz_play_logs_202605` VALUES (784, 'b5e5bff5-9ece-4d3f-a9b7-dd08cc209811', 4, 1, 2, 2, 1, '♦K', 1, '单张', 0, 0, '2026-05-09 17:26:05');
INSERT INTO `ddz_play_logs_202605` VALUES (785, 'b5e5bff5-9ece-4d3f-a9b7-dd08cc209811', 4, 1, 2, 3, 1, 'BJ', 1, '单张', 0, 0, '2026-05-09 17:26:05');
INSERT INTO `ddz_play_logs_202605` VALUES (786, 'b5e5bff5-9ece-4d3f-a9b7-dd08cc209811', 4, 1, 2, 4, 1, '♦A,♠K,♦Q,♣J,♣10,♦9,♥8,♦7,♦6,♣5,♠4,♣3', 12, '顺子', 0, 0, '2026-05-09 17:26:05');
INSERT INTO `ddz_play_logs_202605` VALUES (787, 'b5e5bff5-9ece-4d3f-a9b7-dd08cc209811', 4, 1, 2, 5, 1, '♠A', 1, '单张', 0, 0, '2026-05-09 17:26:05');
INSERT INTO `ddz_play_logs_202605` VALUES (788, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 1, 1, 2, '', 0, '', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (789, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 2, 1, 2, '', 0, '', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (790, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 3, 1, 1, '♥J', 1, '单张', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (791, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (792, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 3, 3, 2, '', 0, '', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (793, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 4, 1, 2, '', 0, '', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (794, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (795, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 4, 3, 2, '', 0, '', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (796, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 5, 1, 1, '♠K', 1, '单张', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (797, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 5, 2, 1, '♠3', 1, '单张', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (798, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 5, 3, 2, '', 0, '', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (799, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 5, 4, 1, '♦8', 1, '单张', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (800, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 5, 5, 2, '', 0, '', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (801, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 5, 6, 2, '', 0, '', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (802, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 5, 7, 2, '', 0, '', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (803, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 5, 8, 1, '♣A', 1, '单张', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (804, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 5, 9, 1, '♠4,♣4', 2, '对子', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (805, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 5, 10, 1, '♦9,♣9,♥9,♣5', 4, '三带一', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (806, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 5, 11, 1, '♦A', 1, '单张', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (807, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 5, 12, 1, '♠10,♦10', 2, '对子', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (808, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 5, 13, 1, '♠2', 1, '单张', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (809, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 5, 14, 1, 'BJ', 1, '单张', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (810, 'bedbb910-76a8-49d7-8a75-f268b3c8a583', 4, 2, 5, 15, 1, '♦6', 1, '单张', 0, 0, '2026-05-09 17:28:07');
INSERT INTO `ddz_play_logs_202605` VALUES (811, 'c44b172c-5710-4196-a4c1-d7b769aa31a0', 4, 2, 1, 1, 1, '♠10,♠9,♣8,♠7,♦6', 5, '顺子', 0, 0, '2026-05-09 17:40:29');
INSERT INTO `ddz_play_logs_202605` VALUES (812, 'c44b172c-5710-4196-a4c1-d7b769aa31a0', 4, 2, 1, 2, 1, '♥3,♠3', 2, '对子', 0, 0, '2026-05-09 17:40:29');
INSERT INTO `ddz_play_logs_202605` VALUES (813, 'c44b172c-5710-4196-a4c1-d7b769aa31a0', 4, 2, 1, 3, 1, '♦J,♠J', 2, '对子', 0, 0, '2026-05-09 17:40:29');
INSERT INTO `ddz_play_logs_202605` VALUES (814, 'c44b172c-5710-4196-a4c1-d7b769aa31a0', 4, 2, 1, 4, 2, '', 0, '', 0, 0, '2026-05-09 17:40:29');
INSERT INTO `ddz_play_logs_202605` VALUES (815, 'c44b172c-5710-4196-a4c1-d7b769aa31a0', 4, 2, 2, 1, 2, '', 0, '', 0, 0, '2026-05-09 17:40:29');
INSERT INTO `ddz_play_logs_202605` VALUES (816, 'c44b172c-5710-4196-a4c1-d7b769aa31a0', 4, 2, 3, 1, 2, '', 0, '', 0, 0, '2026-05-09 17:40:29');
INSERT INTO `ddz_play_logs_202605` VALUES (817, 'c44b172c-5710-4196-a4c1-d7b769aa31a0', 4, 2, 4, 1, 1, '♦2', 1, '单张', 0, 0, '2026-05-09 17:40:29');
INSERT INTO `ddz_play_logs_202605` VALUES (818, '9da60f58-0604-4e0b-8a15-33462695b17a', 4, 2, 1, 1, 2, '', 0, '', 0, 0, '2026-05-09 17:42:00');
INSERT INTO `ddz_play_logs_202605` VALUES (819, '9da60f58-0604-4e0b-8a15-33462695b17a', 4, 2, 2, 1, 2, '', 0, '', 0, 0, '2026-05-09 17:42:00');
INSERT INTO `ddz_play_logs_202605` VALUES (820, '9da60f58-0604-4e0b-8a15-33462695b17a', 4, 2, 2, 2, 1, '♦J', 1, '单张', 0, 0, '2026-05-09 17:42:00');
INSERT INTO `ddz_play_logs_202605` VALUES (821, '9da60f58-0604-4e0b-8a15-33462695b17a', 4, 2, 2, 3, 2, '', 0, '', 0, 0, '2026-05-09 17:42:00');
INSERT INTO `ddz_play_logs_202605` VALUES (822, '88c11e7f-2e8a-4bcd-aceb-b18949955001', 4, 1, 1, 1, 1, '♣3,♠3', 2, '对子', 0, 0, '2026-05-09 17:43:22');
INSERT INTO `ddz_play_logs_202605` VALUES (823, '88c11e7f-2e8a-4bcd-aceb-b18949955001', 4, 1, 1, 2, 1, '♥2,♠2', 2, '对子', 0, 0, '2026-05-09 17:43:22');
INSERT INTO `ddz_play_logs_202605` VALUES (824, '88c11e7f-2e8a-4bcd-aceb-b18949955001', 4, 1, 1, 3, 1, '♦Q', 1, '单张', 0, 0, '2026-05-09 17:43:22');
INSERT INTO `ddz_play_logs_202605` VALUES (825, '88c11e7f-2e8a-4bcd-aceb-b18949955001', 4, 1, 1, 4, 1, '♦A', 1, '单张', 0, 0, '2026-05-09 17:43:22');
INSERT INTO `ddz_play_logs_202605` VALUES (826, '703bc364-c84b-4cf5-9969-b19d80e7ff4a', 4, 1, 1, 1, 1, '♦4,♣4,♥4,♦3', 4, '三带一', 0, 0, '2026-05-09 18:25:39');
INSERT INTO `ddz_play_logs_202605` VALUES (827, '703bc364-c84b-4cf5-9969-b19d80e7ff4a', 4, 1, 1, 2, 1, '♣K,♦10,♣10,♠10,♦9,♥9,♠9,♥8', 8, '飞机带单', 0, 0, '2026-05-09 18:25:39');
INSERT INTO `ddz_play_logs_202605` VALUES (828, '703bc364-c84b-4cf5-9969-b19d80e7ff4a', 4, 1, 1, 3, 1, '♦Q,♣Q,♥Q,♦6,♥6', 5, '三带二', 0, 0, '2026-05-09 18:25:39');
INSERT INTO `ddz_play_logs_202605` VALUES (829, '703bc364-c84b-4cf5-9969-b19d80e7ff4a', 4, 1, 1, 4, 2, '', 0, '', 0, 0, '2026-05-09 18:25:39');
INSERT INTO `ddz_play_logs_202605` VALUES (830, '703bc364-c84b-4cf5-9969-b19d80e7ff4a', 4, 1, 2, 1, 1, '♣A', 1, '单张', 0, 0, '2026-05-09 18:25:39');
INSERT INTO `ddz_play_logs_202605` VALUES (831, '703bc364-c84b-4cf5-9969-b19d80e7ff4a', 4, 1, 2, 2, 1, 'RJ', 1, '单张', 0, 0, '2026-05-09 18:25:39');
INSERT INTO `ddz_play_logs_202605` VALUES (832, '703bc364-c84b-4cf5-9969-b19d80e7ff4a', 4, 1, 2, 3, 1, '♣2', 1, '单张', 0, 0, '2026-05-09 18:25:39');
INSERT INTO `ddz_play_logs_202605` VALUES (833, '7991304a-adb1-4f2a-a35f-9684b655a58b', 4, 2, 1, 1, 2, '', 0, '', 0, 0, '2026-05-09 18:27:02');
INSERT INTO `ddz_play_logs_202605` VALUES (834, '7991304a-adb1-4f2a-a35f-9684b655a58b', 4, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-09 18:27:02');
INSERT INTO `ddz_play_logs_202605` VALUES (835, '7991304a-adb1-4f2a-a35f-9684b655a58b', 4, 2, 2, 1, 1, '♠5', 1, '单张', 0, 0, '2026-05-09 18:27:02');
INSERT INTO `ddz_play_logs_202605` VALUES (836, '7991304a-adb1-4f2a-a35f-9684b655a58b', 4, 2, 2, 2, 1, '♣K', 1, '单张', 0, 0, '2026-05-09 18:27:02');
INSERT INTO `ddz_play_logs_202605` VALUES (837, '7991304a-adb1-4f2a-a35f-9684b655a58b', 4, 2, 2, 3, 1, '♦2', 1, '单张', 0, 0, '2026-05-09 18:27:02');
INSERT INTO `ddz_play_logs_202605` VALUES (838, '7991304a-adb1-4f2a-a35f-9684b655a58b', 4, 2, 2, 4, 1, '♠3', 1, '单张', 0, 0, '2026-05-09 18:27:02');
INSERT INTO `ddz_play_logs_202605` VALUES (839, '7991304a-adb1-4f2a-a35f-9684b655a58b', 4, 2, 2, 5, 1, '♦6', 1, '单张', 0, 0, '2026-05-09 18:27:02');
INSERT INTO `ddz_play_logs_202605` VALUES (840, '7991304a-adb1-4f2a-a35f-9684b655a58b', 4, 2, 2, 6, 1, '♣A', 1, '单张', 0, 0, '2026-05-09 18:27:02');
INSERT INTO `ddz_play_logs_202605` VALUES (841, '7991304a-adb1-4f2a-a35f-9684b655a58b', 4, 2, 2, 7, 1, 'BJ', 1, '单张', 0, 0, '2026-05-09 18:27:02');
INSERT INTO `ddz_play_logs_202605` VALUES (842, '7991304a-adb1-4f2a-a35f-9684b655a58b', 4, 2, 2, 8, 1, '♣4', 1, '单张', 0, 0, '2026-05-09 18:27:02');
INSERT INTO `ddz_play_logs_202605` VALUES (843, '7991304a-adb1-4f2a-a35f-9684b655a58b', 4, 2, 2, 9, 1, 'RJ', 1, '单张', 0, 0, '2026-05-09 18:27:02');
INSERT INTO `ddz_play_logs_202605` VALUES (844, '7991304a-adb1-4f2a-a35f-9684b655a58b', 4, 2, 2, 10, 1, '♣J,♥J', 2, '对子', 0, 0, '2026-05-09 18:27:02');
INSERT INTO `ddz_play_logs_202605` VALUES (845, '7991304a-adb1-4f2a-a35f-9684b655a58b', 4, 2, 2, 11, 1, '♠9,♥9,♣9,♦9', 4, '炸弹', 1, 0, '2026-05-09 18:27:02');
INSERT INTO `ddz_play_logs_202605` VALUES (846, '7991304a-adb1-4f2a-a35f-9684b655a58b', 4, 2, 2, 12, 1, '♠Q,♣Q', 2, '对子', 0, 0, '2026-05-09 18:27:02');
INSERT INTO `ddz_play_logs_202605` VALUES (847, '06c0dd48-80e9-444d-ac2c-cad5641ced14', 4, 1, 1, 1, 1, '♠4', 1, '单张', 0, 0, '2026-05-09 18:56:18');
INSERT INTO `ddz_play_logs_202605` VALUES (848, '06c0dd48-80e9-444d-ac2c-cad5641ced14', 4, 1, 1, 2, 1, '♠10', 1, '单张', 0, 0, '2026-05-09 18:56:18');
INSERT INTO `ddz_play_logs_202605` VALUES (849, '06c0dd48-80e9-444d-ac2c-cad5641ced14', 4, 1, 1, 3, 1, '♠Q', 1, '单张', 0, 0, '2026-05-09 18:56:18');
INSERT INTO `ddz_play_logs_202605` VALUES (850, '06c0dd48-80e9-444d-ac2c-cad5641ced14', 4, 1, 1, 4, 1, '♣2', 1, '单张', 0, 0, '2026-05-09 18:56:18');
INSERT INTO `ddz_play_logs_202605` VALUES (851, '06c0dd48-80e9-444d-ac2c-cad5641ced14', 4, 1, 1, 5, 1, '♠8,♥7,♥6,♣5,♥4', 5, '顺子', 0, 0, '2026-05-09 18:56:18');
INSERT INTO `ddz_play_logs_202605` VALUES (852, '06c0dd48-80e9-444d-ac2c-cad5641ced14', 4, 1, 1, 6, 1, '♥A,♠K,♦Q,♣J,♣10', 5, '顺子', 0, 0, '2026-05-09 18:56:18');
INSERT INTO `ddz_play_logs_202605` VALUES (853, '06c0dd48-80e9-444d-ac2c-cad5641ced14', 4, 1, 1, 7, 1, '♥K', 1, '单张', 0, 0, '2026-05-09 18:56:18');
INSERT INTO `ddz_play_logs_202605` VALUES (854, '06c0dd48-80e9-444d-ac2c-cad5641ced14', 4, 1, 1, 8, 1, '♠2', 1, '单张', 0, 0, '2026-05-09 18:56:18');
INSERT INTO `ddz_play_logs_202605` VALUES (855, '06c0dd48-80e9-444d-ac2c-cad5641ced14', 4, 1, 1, 9, 1, '♥5,♠5', 2, '对子', 0, 0, '2026-05-09 18:56:18');
INSERT INTO `ddz_play_logs_202605` VALUES (856, '06c0dd48-80e9-444d-ac2c-cad5641ced14', 4, 1, 1, 10, 1, 'RJ,BJ', 2, '王炸', 0, 1, '2026-05-09 18:56:18');
INSERT INTO `ddz_play_logs_202605` VALUES (857, '2958950a-2e7c-4c7f-a4f7-48efe569c1cb', 4, 1, 1, 1, 1, '♣10,♣9,♦8,♦7,♣6,♣5,♠4', 7, '顺子', 0, 0, '2026-05-09 18:57:50');
INSERT INTO `ddz_play_logs_202605` VALUES (858, '2958950a-2e7c-4c7f-a4f7-48efe569c1cb', 4, 1, 1, 2, 2, '', 0, '', 0, 0, '2026-05-09 18:57:50');
INSERT INTO `ddz_play_logs_202605` VALUES (859, '2958950a-2e7c-4c7f-a4f7-48efe569c1cb', 4, 1, 2, 1, 1, '♥7', 1, '单张', 0, 0, '2026-05-09 18:57:50');
INSERT INTO `ddz_play_logs_202605` VALUES (860, '2958950a-2e7c-4c7f-a4f7-48efe569c1cb', 4, 1, 2, 2, 2, '', 0, '', 0, 0, '2026-05-09 18:57:50');
INSERT INTO `ddz_play_logs_202605` VALUES (861, '2958950a-2e7c-4c7f-a4f7-48efe569c1cb', 4, 1, 3, 1, 1, '♦K', 1, '单张', 0, 0, '2026-05-09 18:57:50');
INSERT INTO `ddz_play_logs_202605` VALUES (862, '2958950a-2e7c-4c7f-a4f7-48efe569c1cb', 4, 1, 3, 2, 2, '', 0, '', 0, 0, '2026-05-09 18:57:50');
INSERT INTO `ddz_play_logs_202605` VALUES (863, '2958950a-2e7c-4c7f-a4f7-48efe569c1cb', 4, 1, 4, 1, 1, '♥K', 1, '单张', 0, 0, '2026-05-09 18:57:50');
INSERT INTO `ddz_play_logs_202605` VALUES (864, '2958950a-2e7c-4c7f-a4f7-48efe569c1cb', 4, 1, 4, 2, 2, '', 0, '', 0, 0, '2026-05-09 18:57:50');
INSERT INTO `ddz_play_logs_202605` VALUES (865, '2958950a-2e7c-4c7f-a4f7-48efe569c1cb', 4, 1, 4, 3, 1, '♦A', 1, '单张', 0, 0, '2026-05-09 18:57:50');
INSERT INTO `ddz_play_logs_202605` VALUES (866, '2958950a-2e7c-4c7f-a4f7-48efe569c1cb', 4, 1, 4, 4, 2, '', 0, '', 0, 0, '2026-05-09 18:57:50');
INSERT INTO `ddz_play_logs_202605` VALUES (867, '2958950a-2e7c-4c7f-a4f7-48efe569c1cb', 4, 1, 4, 5, 1, '♣A', 1, '单张', 0, 0, '2026-05-09 18:57:50');
INSERT INTO `ddz_play_logs_202605` VALUES (868, '2958950a-2e7c-4c7f-a4f7-48efe569c1cb', 4, 1, 4, 6, 2, '', 0, '', 0, 0, '2026-05-09 18:57:50');
INSERT INTO `ddz_play_logs_202605` VALUES (869, '2958950a-2e7c-4c7f-a4f7-48efe569c1cb', 4, 1, 4, 7, 1, '♥A', 1, '单张', 0, 0, '2026-05-09 18:57:50');
INSERT INTO `ddz_play_logs_202605` VALUES (870, '2958950a-2e7c-4c7f-a4f7-48efe569c1cb', 4, 1, 4, 8, 1, '♠2', 1, '单张', 0, 0, '2026-05-09 18:57:50');
INSERT INTO `ddz_play_logs_202605` VALUES (871, '2958950a-2e7c-4c7f-a4f7-48efe569c1cb', 4, 1, 4, 9, 1, '♠J,♠10,♥9,♥8,♣7,♥6', 6, '顺子', 0, 0, '2026-05-09 18:57:50');
INSERT INTO `ddz_play_logs_202605` VALUES (872, '4b8fc93e-6a20-4686-80b5-b7dd1abd669a', 4, 1, 1, 1, 1, '♦8,♣7,♣6,♥5,♣4,♣3', 6, '顺子', 0, 0, '2026-05-09 18:58:56');
INSERT INTO `ddz_play_logs_202605` VALUES (873, '4b8fc93e-6a20-4686-80b5-b7dd1abd669a', 4, 1, 1, 2, 1, '♥Q,♦J,♥10,♦9,♥8,♠7', 6, '顺子', 0, 0, '2026-05-09 18:58:56');
INSERT INTO `ddz_play_logs_202605` VALUES (874, '4b8fc93e-6a20-4686-80b5-b7dd1abd669a', 4, 1, 1, 3, 1, '♠6,♥6', 2, '对子', 0, 0, '2026-05-09 18:58:56');
INSERT INTO `ddz_play_logs_202605` VALUES (875, '4b8fc93e-6a20-4686-80b5-b7dd1abd669a', 4, 1, 1, 4, 1, '♦K,♥K', 2, '对子', 0, 0, '2026-05-09 18:58:56');
INSERT INTO `ddz_play_logs_202605` VALUES (876, '4b8fc93e-6a20-4686-80b5-b7dd1abd669a', 4, 1, 1, 5, 2, '', 0, '', 0, 0, '2026-05-09 18:58:56');
INSERT INTO `ddz_play_logs_202605` VALUES (877, '4b8fc93e-6a20-4686-80b5-b7dd1abd669a', 4, 1, 2, 1, 1, '♣10', 1, '单张', 0, 0, '2026-05-09 18:58:56');
INSERT INTO `ddz_play_logs_202605` VALUES (878, '4b8fc93e-6a20-4686-80b5-b7dd1abd669a', 4, 1, 2, 2, 1, '♣A', 1, '单张', 0, 0, '2026-05-09 18:58:56');
INSERT INTO `ddz_play_logs_202605` VALUES (879, '4b8fc93e-6a20-4686-80b5-b7dd1abd669a', 4, 1, 2, 3, 2, '', 0, '', 0, 0, '2026-05-09 18:58:56');
INSERT INTO `ddz_play_logs_202605` VALUES (880, '4b8fc93e-6a20-4686-80b5-b7dd1abd669a', 4, 1, 3, 1, 1, '♠2', 1, '单张', 0, 0, '2026-05-09 18:58:56');
INSERT INTO `ddz_play_logs_202605` VALUES (881, '4b8fc93e-6a20-4686-80b5-b7dd1abd669a', 4, 1, 3, 2, 1, 'BJ', 1, '单张', 0, 0, '2026-05-09 18:58:56');
INSERT INTO `ddz_play_logs_202605` VALUES (882, 'bdeab0b5-da80-4e6c-abe9-cd2de37429dd', 4, 1, 1, 1, 1, '♣A,♣K,♥Q,♣J,♣10,♦9,♥8,♦7,♦6', 9, '顺子', 0, 0, '2026-05-09 19:11:13');
INSERT INTO `ddz_play_logs_202605` VALUES (883, 'bdeab0b5-da80-4e6c-abe9-cd2de37429dd', 4, 1, 1, 2, 1, '♥J,♠10,♣9,♠8,♥7,♥6', 6, '顺子', 0, 0, '2026-05-09 19:11:13');
INSERT INTO `ddz_play_logs_202605` VALUES (884, 'bdeab0b5-da80-4e6c-abe9-cd2de37429dd', 4, 1, 1, 3, 1, '♦3', 1, '单张', 0, 0, '2026-05-09 19:11:13');
INSERT INTO `ddz_play_logs_202605` VALUES (885, 'bdeab0b5-da80-4e6c-abe9-cd2de37429dd', 4, 1, 1, 4, 1, '♥K', 1, '单张', 0, 0, '2026-05-09 19:11:13');
INSERT INTO `ddz_play_logs_202605` VALUES (886, 'bdeab0b5-da80-4e6c-abe9-cd2de37429dd', 4, 1, 1, 5, 1, 'RJ', 1, '单张', 0, 0, '2026-05-09 19:11:13');
INSERT INTO `ddz_play_logs_202605` VALUES (887, 'bdeab0b5-da80-4e6c-abe9-cd2de37429dd', 4, 1, 1, 6, 2, '', 0, '', 0, 0, '2026-05-09 19:11:13');
INSERT INTO `ddz_play_logs_202605` VALUES (888, 'bdeab0b5-da80-4e6c-abe9-cd2de37429dd', 4, 1, 1, 7, 1, '♥2', 1, '单张', 0, 0, '2026-05-09 19:11:13');
INSERT INTO `ddz_play_logs_202605` VALUES (889, 'bdeab0b5-da80-4e6c-abe9-cd2de37429dd', 4, 1, 1, 8, 2, '', 0, '', 0, 0, '2026-05-09 19:11:13');
INSERT INTO `ddz_play_logs_202605` VALUES (890, 'bdeab0b5-da80-4e6c-abe9-cd2de37429dd', 4, 1, 2, 1, 2, '', 0, '', 0, 0, '2026-05-09 19:11:13');
INSERT INTO `ddz_play_logs_202605` VALUES (891, 'bdeab0b5-da80-4e6c-abe9-cd2de37429dd', 4, 1, 3, 1, 2, '', 0, '', 0, 0, '2026-05-09 19:11:13');
INSERT INTO `ddz_play_logs_202605` VALUES (892, 'bdeab0b5-da80-4e6c-abe9-cd2de37429dd', 4, 1, 4, 1, 2, '', 0, '', 0, 0, '2026-05-09 19:11:13');
INSERT INTO `ddz_play_logs_202605` VALUES (893, 'bdeab0b5-da80-4e6c-abe9-cd2de37429dd', 4, 1, 5, 1, 2, '', 0, '', 0, 0, '2026-05-09 19:11:13');
INSERT INTO `ddz_play_logs_202605` VALUES (894, 'bdeab0b5-da80-4e6c-abe9-cd2de37429dd', 4, 1, 6, 1, 2, '', 0, '', 0, 0, '2026-05-09 19:11:13');
INSERT INTO `ddz_play_logs_202605` VALUES (895, 'bdeab0b5-da80-4e6c-abe9-cd2de37429dd', 4, 1, 7, 1, 1, '♣2', 1, '单张', 0, 0, '2026-05-09 19:11:13');
INSERT INTO `ddz_play_logs_202605` VALUES (896, 'ad4c3293-6367-4215-aac5-a11e1885dff6', 4, 2, 1, 1, 2, '', 0, '', 0, 0, '2026-05-09 19:12:38');
INSERT INTO `ddz_play_logs_202605` VALUES (897, 'ad4c3293-6367-4215-aac5-a11e1885dff6', 4, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-09 19:12:38');
INSERT INTO `ddz_play_logs_202605` VALUES (898, 'ad4c3293-6367-4215-aac5-a11e1885dff6', 4, 2, 2, 1, 2, '', 0, '', 0, 0, '2026-05-09 19:12:38');
INSERT INTO `ddz_play_logs_202605` VALUES (899, 'ad4c3293-6367-4215-aac5-a11e1885dff6', 4, 2, 2, 2, 1, '♦7', 1, '单张', 0, 0, '2026-05-09 19:12:38');
INSERT INTO `ddz_play_logs_202605` VALUES (900, 'ad4c3293-6367-4215-aac5-a11e1885dff6', 4, 2, 2, 3, 1, '♣10', 1, '单张', 0, 0, '2026-05-09 19:12:38');
INSERT INTO `ddz_play_logs_202605` VALUES (901, 'ad4c3293-6367-4215-aac5-a11e1885dff6', 4, 2, 2, 4, 1, '♣K', 1, '单张', 0, 0, '2026-05-09 19:12:38');
INSERT INTO `ddz_play_logs_202605` VALUES (902, 'ad4c3293-6367-4215-aac5-a11e1885dff6', 4, 2, 2, 5, 2, '', 0, '', 0, 0, '2026-05-09 19:12:38');
INSERT INTO `ddz_play_logs_202605` VALUES (903, 'ad4c3293-6367-4215-aac5-a11e1885dff6', 4, 2, 2, 6, 1, '♦8', 1, '单张', 0, 0, '2026-05-09 19:12:38');
INSERT INTO `ddz_play_logs_202605` VALUES (904, 'ad4c3293-6367-4215-aac5-a11e1885dff6', 4, 2, 2, 7, 1, '♣J', 1, '单张', 0, 0, '2026-05-09 19:12:38');
INSERT INTO `ddz_play_logs_202605` VALUES (905, 'ad4c3293-6367-4215-aac5-a11e1885dff6', 4, 2, 2, 8, 2, '', 0, '', 0, 0, '2026-05-09 19:12:38');
INSERT INTO `ddz_play_logs_202605` VALUES (906, 'ad4c3293-6367-4215-aac5-a11e1885dff6', 4, 2, 2, 9, 1, '♥2', 1, '单张', 0, 0, '2026-05-09 19:12:38');
INSERT INTO `ddz_play_logs_202605` VALUES (907, 'ad4c3293-6367-4215-aac5-a11e1885dff6', 4, 2, 2, 10, 1, '♥3,♠3', 2, '对子', 0, 0, '2026-05-09 19:12:38');
INSERT INTO `ddz_play_logs_202605` VALUES (908, 'ad4c3293-6367-4215-aac5-a11e1885dff6', 4, 2, 2, 11, 1, '♣5,♥5', 2, '对子', 0, 0, '2026-05-09 19:12:38');
INSERT INTO `ddz_play_logs_202605` VALUES (909, 'ad4c3293-6367-4215-aac5-a11e1885dff6', 4, 2, 2, 12, 1, '♦A,♣A,♥A,♦6,♣6', 5, '三带二', 0, 0, '2026-05-09 19:12:38');
INSERT INTO `ddz_play_logs_202605` VALUES (910, 'ad4c3293-6367-4215-aac5-a11e1885dff6', 4, 2, 2, 13, 1, 'RJ,BJ', 2, '王炸', 0, 1, '2026-05-09 19:12:38');
INSERT INTO `ddz_play_logs_202605` VALUES (911, 'af00acc2-79c0-4889-8104-921837288f71', 4, 1, 1, 1, 1, '♥8,♦7,♣6,♦5,♠4,♦3', 6, '顺子', 0, 0, '2026-05-09 19:13:44');
INSERT INTO `ddz_play_logs_202605` VALUES (912, 'af00acc2-79c0-4889-8104-921837288f71', 4, 1, 1, 2, 2, '', 0, '', 0, 0, '2026-05-09 19:13:44');
INSERT INTO `ddz_play_logs_202605` VALUES (913, 'af00acc2-79c0-4889-8104-921837288f71', 4, 1, 1, 3, 1, '♦J', 1, '单张', 0, 0, '2026-05-09 19:13:44');
INSERT INTO `ddz_play_logs_202605` VALUES (914, 'af00acc2-79c0-4889-8104-921837288f71', 4, 1, 1, 4, 1, '♥2', 1, '单张', 0, 0, '2026-05-09 19:13:44');
INSERT INTO `ddz_play_logs_202605` VALUES (915, 'af00acc2-79c0-4889-8104-921837288f71', 4, 1, 1, 5, 2, '', 0, '', 0, 0, '2026-05-09 19:13:44');
INSERT INTO `ddz_play_logs_202605` VALUES (916, 'af00acc2-79c0-4889-8104-921837288f71', 4, 1, 1, 6, 1, 'BJ', 1, '单张', 0, 0, '2026-05-09 19:13:44');
INSERT INTO `ddz_play_logs_202605` VALUES (917, 'af00acc2-79c0-4889-8104-921837288f71', 4, 1, 1, 7, 1, '♦A,♠K,♦Q,♣J,♦10,♣9,♠8,♣7,♠6', 9, '顺子', 0, 0, '2026-05-09 19:13:44');
INSERT INTO `ddz_play_logs_202605` VALUES (918, 'af00acc2-79c0-4889-8104-921837288f71', 4, 1, 1, 8, 1, '♥10,♠10', 2, '对子', 0, 0, '2026-05-09 19:13:44');
INSERT INTO `ddz_play_logs_202605` VALUES (919, 'a28b1f83-b336-45f6-bd19-30ced58225aa', 4, 1, 1, 1, 1, '♦3', 1, '单张', 0, 0, '2026-05-09 19:30:42');
INSERT INTO `ddz_play_logs_202605` VALUES (920, 'a28b1f83-b336-45f6-bd19-30ced58225aa', 4, 1, 1, 2, 1, '♠6', 1, '单张', 0, 0, '2026-05-09 19:30:42');
INSERT INTO `ddz_play_logs_202605` VALUES (921, 'a28b1f83-b336-45f6-bd19-30ced58225aa', 4, 1, 1, 3, 1, '♣9', 1, '单张', 0, 0, '2026-05-09 19:30:42');
INSERT INTO `ddz_play_logs_202605` VALUES (922, 'a28b1f83-b336-45f6-bd19-30ced58225aa', 4, 1, 1, 4, 1, '♥A', 1, '单张', 0, 0, '2026-05-09 19:30:42');
INSERT INTO `ddz_play_logs_202605` VALUES (923, 'a28b1f83-b336-45f6-bd19-30ced58225aa', 4, 1, 1, 5, 2, '', 0, '', 0, 0, '2026-05-09 19:30:42');
INSERT INTO `ddz_play_logs_202605` VALUES (924, 'a28b1f83-b336-45f6-bd19-30ced58225aa', 4, 1, 2, 1, 1, '♦4', 1, '单张', 0, 0, '2026-05-09 19:30:42');
INSERT INTO `ddz_play_logs_202605` VALUES (925, 'a28b1f83-b336-45f6-bd19-30ced58225aa', 4, 1, 2, 2, 1, '♦2', 1, '单张', 0, 0, '2026-05-09 19:30:42');
INSERT INTO `ddz_play_logs_202605` VALUES (926, 'a28b1f83-b336-45f6-bd19-30ced58225aa', 4, 1, 2, 3, 1, '♣K,♦K,♠K,♥8,♠8', 5, '三带二', 0, 0, '2026-05-09 19:30:42');
INSERT INTO `ddz_play_logs_202605` VALUES (927, 'a28b1f83-b336-45f6-bd19-30ced58225aa', 4, 1, 2, 4, 1, '♣10,♠10', 2, '对子', 0, 0, '2026-05-09 19:30:42');
INSERT INTO `ddz_play_logs_202605` VALUES (928, 'a28b1f83-b336-45f6-bd19-30ced58225aa', 4, 1, 2, 5, 1, '♠J,♥J,♣J,♦J', 4, '炸弹', 1, 0, '2026-05-09 19:30:42');
INSERT INTO `ddz_play_logs_202605` VALUES (929, 'a28b1f83-b336-45f6-bd19-30ced58225aa', 4, 1, 2, 6, 1, '♥2', 1, '单张', 0, 0, '2026-05-09 19:30:42');
INSERT INTO `ddz_play_logs_202605` VALUES (930, 'a28b1f83-b336-45f6-bd19-30ced58225aa', 4, 1, 2, 7, 1, 'RJ,BJ', 2, '王炸', 0, 1, '2026-05-09 19:30:42');
INSERT INTO `ddz_play_logs_202605` VALUES (931, '5d03e671-2560-41d2-850f-bd2b09762ccd', 4, 1, 1, 1, 1, '♣7,♥6,♣5,♠4,♣3', 5, '顺子', 0, 0, '2026-05-09 19:32:07');
INSERT INTO `ddz_play_logs_202605` VALUES (932, '5d03e671-2560-41d2-850f-bd2b09762ccd', 4, 1, 1, 2, 2, '', 0, '', 0, 0, '2026-05-09 19:32:07');
INSERT INTO `ddz_play_logs_202605` VALUES (933, '5d03e671-2560-41d2-850f-bd2b09762ccd', 4, 1, 2, 1, 1, '♥5', 1, '单张', 0, 0, '2026-05-09 19:32:07');
INSERT INTO `ddz_play_logs_202605` VALUES (934, '5d03e671-2560-41d2-850f-bd2b09762ccd', 4, 1, 2, 2, 1, '♥7', 1, '单张', 0, 0, '2026-05-09 19:32:07');
INSERT INTO `ddz_play_logs_202605` VALUES (935, '5d03e671-2560-41d2-850f-bd2b09762ccd', 4, 1, 2, 3, 1, '♦2', 1, '单张', 0, 0, '2026-05-09 19:32:07');
INSERT INTO `ddz_play_logs_202605` VALUES (936, '5d03e671-2560-41d2-850f-bd2b09762ccd', 4, 1, 2, 4, 2, '', 0, '', 0, 0, '2026-05-09 19:32:07');
INSERT INTO `ddz_play_logs_202605` VALUES (937, '5d03e671-2560-41d2-850f-bd2b09762ccd', 4, 1, 3, 1, 1, '♠10', 1, '单张', 0, 0, '2026-05-09 19:32:07');
INSERT INTO `ddz_play_logs_202605` VALUES (938, '5d03e671-2560-41d2-850f-bd2b09762ccd', 4, 1, 3, 2, 1, '♦A', 1, '单张', 0, 0, '2026-05-09 19:32:07');
INSERT INTO `ddz_play_logs_202605` VALUES (939, '5d03e671-2560-41d2-850f-bd2b09762ccd', 4, 1, 3, 3, 2, '', 0, '', 0, 0, '2026-05-09 19:32:07');
INSERT INTO `ddz_play_logs_202605` VALUES (940, '5d03e671-2560-41d2-850f-bd2b09762ccd', 4, 1, 4, 1, 1, '♣A', 1, '单张', 0, 0, '2026-05-09 19:32:07');
INSERT INTO `ddz_play_logs_202605` VALUES (941, '5d03e671-2560-41d2-850f-bd2b09762ccd', 4, 1, 4, 2, 2, '', 0, '', 0, 0, '2026-05-09 19:32:07');
INSERT INTO `ddz_play_logs_202605` VALUES (942, '5d03e671-2560-41d2-850f-bd2b09762ccd', 4, 1, 4, 3, 1, '♦Q', 1, '单张', 0, 0, '2026-05-09 19:32:07');
INSERT INTO `ddz_play_logs_202605` VALUES (943, '5d03e671-2560-41d2-850f-bd2b09762ccd', 4, 1, 4, 4, 2, '', 0, '', 0, 0, '2026-05-09 19:32:07');
INSERT INTO `ddz_play_logs_202605` VALUES (944, '5d03e671-2560-41d2-850f-bd2b09762ccd', 4, 1, 5, 1, 2, '', 0, '', 0, 0, '2026-05-09 19:32:07');
INSERT INTO `ddz_play_logs_202605` VALUES (945, '5d03e671-2560-41d2-850f-bd2b09762ccd', 4, 1, 6, 1, 2, '', 0, '', 0, 0, '2026-05-09 19:32:07');
INSERT INTO `ddz_play_logs_202605` VALUES (946, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, 1, 1, 1, '♠9,♦8,♥7,♣6,♦5,♦4,♦3', 7, '顺子', 0, 0, '2026-05-09 19:34:01');
INSERT INTO `ddz_play_logs_202605` VALUES (947, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, 1, 2, 2, '', 0, '', 0, 0, '2026-05-09 19:34:01');
INSERT INTO `ddz_play_logs_202605` VALUES (948, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, 2, 1, 1, '♣4', 1, '单张', 0, 0, '2026-05-09 19:34:01');
INSERT INTO `ddz_play_logs_202605` VALUES (949, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, 2, 2, 1, '♠8', 1, '单张', 0, 0, '2026-05-09 19:34:01');
INSERT INTO `ddz_play_logs_202605` VALUES (950, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, 2, 3, 1, '♥A', 1, '单张', 0, 0, '2026-05-09 19:34:01');
INSERT INTO `ddz_play_logs_202605` VALUES (951, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, 2, 4, 2, '', 0, '', 0, 0, '2026-05-09 19:34:01');
INSERT INTO `ddz_play_logs_202605` VALUES (952, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, 3, 1, 1, '♦K', 1, '单张', 0, 0, '2026-05-09 19:34:01');
INSERT INTO `ddz_play_logs_202605` VALUES (953, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, 3, 2, 2, '', 0, '', 0, 0, '2026-05-09 19:34:01');
INSERT INTO `ddz_play_logs_202605` VALUES (954, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, 4, 1, 1, '♥K', 1, '单张', 0, 0, '2026-05-09 19:34:01');
INSERT INTO `ddz_play_logs_202605` VALUES (955, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, 4, 2, 2, '', 0, '', 0, 0, '2026-05-09 19:34:01');
INSERT INTO `ddz_play_logs_202605` VALUES (956, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, 4, 3, 1, '♣K', 1, '单张', 0, 0, '2026-05-09 19:34:01');
INSERT INTO `ddz_play_logs_202605` VALUES (957, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, 4, 4, 1, '♥2', 1, '单张', 0, 0, '2026-05-09 19:34:01');
INSERT INTO `ddz_play_logs_202605` VALUES (958, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, 4, 5, 2, '', 0, '', 0, 0, '2026-05-09 19:34:01');
INSERT INTO `ddz_play_logs_202605` VALUES (959, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, 4, 6, 1, '♠J', 1, '单张', 0, 0, '2026-05-09 19:34:01');
INSERT INTO `ddz_play_logs_202605` VALUES (960, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, 4, 7, 2, '', 0, '', 0, 0, '2026-05-09 19:34:01');
INSERT INTO `ddz_play_logs_202605` VALUES (961, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, 5, 1, 1, '♦2', 1, '单张', 0, 0, '2026-05-09 19:34:01');
INSERT INTO `ddz_play_logs_202605` VALUES (962, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, 5, 2, 1, '♠10,♥10', 2, '对子', 0, 0, '2026-05-09 19:34:01');
INSERT INTO `ddz_play_logs_202605` VALUES (963, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, 5, 3, 2, '', 0, '', 0, 0, '2026-05-09 19:34:01');
INSERT INTO `ddz_play_logs_202605` VALUES (964, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, 5, 4, 1, '♠2', 1, '单张', 0, 0, '2026-05-09 19:34:01');
INSERT INTO `ddz_play_logs_202605` VALUES (965, 'feba73e8-abd2-4334-ad9e-86f282917718', 4, 1, 5, 5, 1, '♣J', 1, '单张', 0, 0, '2026-05-09 19:34:01');
INSERT INTO `ddz_play_logs_202605` VALUES (966, 'bffbb2a8-0db6-44f4-a26c-67daaf2cdd12', 4, 2, 1, 1, 1, '♥6', 1, '单张', 0, 0, '2026-05-09 21:56:11');
INSERT INTO `ddz_play_logs_202605` VALUES (967, 'bffbb2a8-0db6-44f4-a26c-67daaf2cdd12', 4, 2, 1, 2, 1, '♥J', 1, '单张', 0, 0, '2026-05-09 21:56:11');
INSERT INTO `ddz_play_logs_202605` VALUES (968, 'bffbb2a8-0db6-44f4-a26c-67daaf2cdd12', 4, 2, 1, 3, 2, '', 0, '', 0, 0, '2026-05-09 21:56:11');
INSERT INTO `ddz_play_logs_202605` VALUES (969, 'bffbb2a8-0db6-44f4-a26c-67daaf2cdd12', 4, 2, 1, 4, 2, '', 0, '', 0, 0, '2026-05-09 21:56:11');
INSERT INTO `ddz_play_logs_202605` VALUES (970, 'bffbb2a8-0db6-44f4-a26c-67daaf2cdd12', 4, 2, 1, 5, 2, '', 0, '', 0, 0, '2026-05-09 21:56:11');
INSERT INTO `ddz_play_logs_202605` VALUES (971, 'bffbb2a8-0db6-44f4-a26c-67daaf2cdd12', 4, 2, 2, 1, 1, '♦2', 1, '单张', 0, 0, '2026-05-09 21:56:11');
INSERT INTO `ddz_play_logs_202605` VALUES (972, 'bffbb2a8-0db6-44f4-a26c-67daaf2cdd12', 4, 2, 2, 2, 1, '♣8,♥8,♦5,♥5,♣5', 5, '三带二', 0, 0, '2026-05-09 21:56:11');
INSERT INTO `ddz_play_logs_202605` VALUES (973, 'bffbb2a8-0db6-44f4-a26c-67daaf2cdd12', 4, 2, 2, 3, 2, '', 0, '', 0, 0, '2026-05-09 21:56:11');
INSERT INTO `ddz_play_logs_202605` VALUES (974, 'bffbb2a8-0db6-44f4-a26c-67daaf2cdd12', 4, 2, 3, 1, 1, '♠10,♦10', 2, '对子', 0, 0, '2026-05-09 21:56:11');
INSERT INTO `ddz_play_logs_202605` VALUES (975, 'bffbb2a8-0db6-44f4-a26c-67daaf2cdd12', 4, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-09 21:56:11');
INSERT INTO `ddz_play_logs_202605` VALUES (976, 'bffbb2a8-0db6-44f4-a26c-67daaf2cdd12', 4, 2, 4, 1, 1, '♠2', 1, '单张', 0, 0, '2026-05-09 21:56:11');
INSERT INTO `ddz_play_logs_202605` VALUES (977, 'bffbb2a8-0db6-44f4-a26c-67daaf2cdd12', 4, 2, 4, 2, 1, '♣9,♥9,♠9,♣3', 4, '三带一', 0, 0, '2026-05-09 21:56:11');
INSERT INTO `ddz_play_logs_202605` VALUES (978, 'bffbb2a8-0db6-44f4-a26c-67daaf2cdd12', 4, 2, 4, 3, 1, '♠Q,♦Q', 2, '对子', 0, 0, '2026-05-09 21:56:11');
INSERT INTO `ddz_play_logs_202605` VALUES (979, '4ea1053a-b691-4285-b23a-177a74b7010c', 4, 2, 1, 1, 2, '', 0, '', 0, 0, '2026-05-09 21:57:46');
INSERT INTO `ddz_play_logs_202605` VALUES (980, '4ea1053a-b691-4285-b23a-177a74b7010c', 4, 2, 1, 2, 2, '', 0, '', 0, 0, '2026-05-09 21:57:46');
INSERT INTO `ddz_play_logs_202605` VALUES (981, '4ea1053a-b691-4285-b23a-177a74b7010c', 4, 2, 1, 3, 1, '♥9', 1, '单张', 0, 0, '2026-05-09 21:57:46');
INSERT INTO `ddz_play_logs_202605` VALUES (982, '4ea1053a-b691-4285-b23a-177a74b7010c', 4, 2, 1, 4, 1, '♣Q', 1, '单张', 0, 0, '2026-05-09 21:57:46');
INSERT INTO `ddz_play_logs_202605` VALUES (983, '4ea1053a-b691-4285-b23a-177a74b7010c', 4, 2, 1, 5, 2, '', 0, '', 0, 0, '2026-05-09 21:57:46');
INSERT INTO `ddz_play_logs_202605` VALUES (984, '4ea1053a-b691-4285-b23a-177a74b7010c', 4, 2, 1, 6, 2, '', 0, '', 0, 0, '2026-05-09 21:57:46');
INSERT INTO `ddz_play_logs_202605` VALUES (985, '4ea1053a-b691-4285-b23a-177a74b7010c', 4, 2, 2, 1, 2, '', 0, '', 0, 0, '2026-05-09 21:57:46');
INSERT INTO `ddz_play_logs_202605` VALUES (986, '4ea1053a-b691-4285-b23a-177a74b7010c', 4, 2, 2, 2, 2, '', 0, '', 0, 0, '2026-05-09 21:57:46');
INSERT INTO `ddz_play_logs_202605` VALUES (987, '4ea1053a-b691-4285-b23a-177a74b7010c', 4, 2, 3, 1, 2, '', 0, '', 0, 0, '2026-05-09 21:57:46');
INSERT INTO `ddz_play_logs_202605` VALUES (988, '4ea1053a-b691-4285-b23a-177a74b7010c', 4, 2, 3, 2, 2, '', 0, '', 0, 0, '2026-05-09 21:57:46');
INSERT INTO `ddz_play_logs_202605` VALUES (989, '4ea1053a-b691-4285-b23a-177a74b7010c', 4, 2, 4, 1, 2, '', 0, '', 0, 0, '2026-05-09 21:57:46');
INSERT INTO `ddz_play_logs_202605` VALUES (990, '4ea1053a-b691-4285-b23a-177a74b7010c', 4, 2, 4, 2, 2, '', 0, '', 0, 0, '2026-05-09 21:57:46');
INSERT INTO `ddz_play_logs_202605` VALUES (991, '4ea1053a-b691-4285-b23a-177a74b7010c', 4, 2, 5, 1, 2, '', 0, '', 0, 0, '2026-05-09 21:57:46');
INSERT INTO `ddz_play_logs_202605` VALUES (992, '4ea1053a-b691-4285-b23a-177a74b7010c', 4, 2, 5, 2, 2, '', 0, '', 0, 0, '2026-05-09 21:57:46');
INSERT INTO `ddz_play_logs_202605` VALUES (993, '4ea1053a-b691-4285-b23a-177a74b7010c', 4, 2, 6, 1, 2, '', 0, '', 0, 0, '2026-05-09 21:57:46');
INSERT INTO `ddz_play_logs_202605` VALUES (994, '4ea1053a-b691-4285-b23a-177a74b7010c', 4, 2, 6, 2, 2, '', 0, '', 0, 0, '2026-05-09 21:57:46');
INSERT INTO `ddz_play_logs_202605` VALUES (995, '4ea1053a-b691-4285-b23a-177a74b7010c', 4, 2, 6, 3, 2, '', 0, '', 0, 0, '2026-05-09 21:57:46');
INSERT INTO `ddz_play_logs_202605` VALUES (996, '1847ebc2-108d-4762-981c-cde9b6a9d6b5', 4, 1, 1, 1, 1, '♦5,♣5,♠5,♥3', 4, '三带一', 0, 0, '2026-05-09 21:58:52');
INSERT INTO `ddz_play_logs_202605` VALUES (997, '1847ebc2-108d-4762-981c-cde9b6a9d6b5', 4, 1, 1, 2, 1, '♣J,♣9,♥9,♦9', 4, '三带一', 0, 0, '2026-05-09 21:58:52');
INSERT INTO `ddz_play_logs_202605` VALUES (998, '1847ebc2-108d-4762-981c-cde9b6a9d6b5', 4, 1, 1, 3, 1, '♦A,♦K,♠Q,♠J,♠10,♠9,♥8,♥7,♣6', 9, '顺子', 0, 0, '2026-05-09 21:58:52');
INSERT INTO `ddz_play_logs_202605` VALUES (999, '1847ebc2-108d-4762-981c-cde9b6a9d6b5', 4, 1, 1, 4, 1, '♦2', 1, '单张', 0, 0, '2026-05-09 21:58:52');
INSERT INTO `ddz_play_logs_202605` VALUES (1000, '1847ebc2-108d-4762-981c-cde9b6a9d6b5', 4, 1, 1, 5, 2, '', 0, '', 0, 0, '2026-05-09 21:58:52');
INSERT INTO `ddz_play_logs_202605` VALUES (1001, '1847ebc2-108d-4762-981c-cde9b6a9d6b5', 4, 1, 1, 6, 1, '♠A', 1, '单张', 0, 0, '2026-05-09 21:58:52');
INSERT INTO `ddz_play_logs_202605` VALUES (1002, '1847ebc2-108d-4762-981c-cde9b6a9d6b5', 4, 1, 1, 7, 1, 'BJ', 1, '单张', 0, 0, '2026-05-09 21:58:52');

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
) ENGINE = InnoDB AUTO_INCREMENT = 39 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_players
-- ----------------------------
INSERT INTO `ddz_players` VALUES (1, 'phone_13800138000', '用户80000147', '', 0, 1, 0, NULL, NULL, 1000, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, '2026-04-25 12:10:45', '[::1]', '2026-04-25 12:10:45', '2026-04-25 12:10:45', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (2, 'phone_13800138001', '用户80018735', '', 0, 1, 0, NULL, NULL, 1000, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, '2026-04-25 12:11:15', '[::1]', '2026-04-25 12:11:06', '2026-04-25 12:11:15', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (3, 'phone_13800138003', '用户80032758', '', 0, 1, 0, NULL, NULL, 1000, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, '2026-04-25 12:11:20', '[::1]', '2026-04-25 12:11:20', '2026-04-25 12:11:20', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (4, 'phone_15888888888', '李宁', 'uploads/file/2026/05/06/b6f61982-aae1-4d61-afd2-fbab61193356.jpg', 0, 1, 0, NULL, NULL, 15480, 5700, 0, 0, 1, 0, 48, 16, 49, 15, 1, '2026-05-03 21:18:24', '127.0.0.1', '2026-04-25 15:53:53', '2026-05-09 22:31:40', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (5, 'phone_15208384146', '用户41461120', '', 0, 1, 0, NULL, NULL, 10380, 0, 0, 0, 1, 0, 4, 5, 3, 6, 1, '2026-04-27 21:16:37', '127.0.0.1', '2026-04-25 16:05:56', '2026-05-03 19:04:18', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (7, 'phone_13999999999', '用户99995055', 'uploads/file/2026/05/06/b6f61982-aae1-4d61-afd2-fbab61193356.jpg', 2, 1, 0, NULL, NULL, 9660, 0, 0, 0, 1, 0, 2, 7, 3, 6, 1, '2026-04-29 10:42:23', '127.0.0.1', '2026-04-29 10:42:23', '2026-05-06 14:25:18', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (8, 'phone_13888888888', '用户88886547', '', 0, 1, 0, NULL, NULL, 1000, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, '2026-05-06 21:37:35', '127.0.0.1', '2026-05-06 21:37:35', '2026-05-06 21:37:35', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (9, 'robot_1778117063805_6545', '活泼松鼠', '/uploads/file/avatar/avatar_28.jpg', 1, 2, 0, NULL, '2026-05-09 18:25:00', 9113, 0, 0, 0, 1, 0, 2, 5, 1, 6, 1, NULL, '', '2026-05-07 09:24:24', '2026-05-09 18:27:03', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (10, 'robot_1778117063831_7654', '优雅天鹅', '/uploads/file/avatar/avatar_13.jpeg', 0, 2, 0, NULL, '2026-05-09 18:25:00', 2707, 0, 0, 0, 1, 0, 1, 3, 0, 4, 1, NULL, '', '2026-05-07 09:24:24', '2026-05-09 18:27:03', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (11, 'robot_1778117063843_2733', '天选之人', '/uploads/file/avatar/avatar_26.jpeg', 1, 2, 0, NULL, '2026-05-09 18:55:01', 8596, 0, 0, 0, 1, 0, 1, 3, 1, 3, 1, NULL, '', '2026-05-07 09:24:24', '2026-05-09 18:58:57', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (12, 'robot_1778117063853_9778', '快乐小兔', '/uploads/file/avatar/avatar_28.jpg', 2, 2, 0, NULL, '2026-05-09 10:10:00', 3156, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, NULL, '', '2026-05-07 09:24:24', '2026-05-09 10:10:00', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (13, 'robot_1778117063866_8617', '岁月无忧', '/uploads/file/avatar/avatar_13.jpeg', 1, 2, 0, NULL, '2026-05-09 17:40:00', 5792, 0, 0, 0, 1, 0, 5, 3, 2, 6, 1, NULL, '', '2026-05-07 09:24:24', '2026-05-09 17:43:22', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (14, 'robot_1778117063885_3842', '文人墨客', '/uploads/file/avatar/avatar_2.png', 0, 2, 0, NULL, '2026-05-09 11:40:00', 3439, 0, 0, 0, 1, 0, 0, 4, 0, 4, 1, NULL, '', '2026-05-07 09:24:24', '2026-05-09 11:41:51', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (15, 'robot_1778117063901_50', '新手村民', '/uploads/file/avatar/avatar_4.jpeg', 0, 2, 0, NULL, '2026-05-09 07:35:01', 2504, 0, 0, 0, 1, 0, 0, 4, 0, 4, 1, NULL, '', '2026-05-07 09:24:24', '2026-05-09 07:37:27', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (16, 'robot_1778117063917_4663', '诗词歌赋', '/uploads/file/avatar/avatar_25.jpeg', 0, 2, 0, NULL, '2026-05-09 19:10:01', 7307, 0, 0, 0, 1, 0, 0, 5, 1, 4, 1, NULL, '', '2026-05-07 09:24:24', '2026-05-09 19:13:44', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (17, 'robot_1778117063934_8418', '清风明月', '/uploads/file/avatar/avatar_3.jpeg', 2, 2, 0, NULL, '2026-05-09 13:30:00', 5251, 0, 0, 0, 1, 0, 0, 6, 0, 6, 1, NULL, '', '2026-05-07 09:24:24', '2026-05-09 13:30:00', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (18, 'robot_1778117063951_8297', '奶茶爱好者', '/uploads/file/avatar/avatar_14.jpg', 0, 2, 0, NULL, '2026-05-09 17:40:00', 8848, 0, 0, 0, 1, 0, 2, 5, 0, 7, 1, NULL, '', '2026-05-07 09:24:24', '2026-05-09 17:43:22', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (19, 'robot_1778223341635_5587', '山水诗意', '/uploads/file/avatar/avatar_28.jpg', 1, 2, 0, NULL, '2026-05-09 10:35:01', 6683, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, NULL, '', '2026-05-08 14:55:42', '2026-05-09 10:35:01', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (20, 'robot_1778223341658_9110', '牌技精湛', '/uploads/file/avatar/avatar_1.webp', 0, 2, 0, NULL, '2026-05-09 12:30:01', 2405, 0, 0, 0, 1, 0, 3, 1, 0, 4, 1, NULL, '', '2026-05-08 14:55:42', '2026-05-09 12:30:01', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (21, 'robot_1778223341670_1498', '浅笑安然', '/uploads/file/avatar/avatar_8.png', 1, 2, 0, NULL, '2026-05-09 12:15:00', 3655, 0, 0, 0, 1, 0, 0, 4, 0, 4, 1, NULL, '', '2026-05-08 14:55:42', '2026-05-09 12:15:01', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (22, 'robot_1778223341680_2077', '阳光灿烂', '/uploads/file/avatar/avatar_19.jpeg', 1, 2, 0, NULL, '2026-05-09 13:40:00', 4849, 0, 0, 0, 1, 0, 1, 3, 0, 4, 1, NULL, '', '2026-05-08 14:55:42', '2026-05-09 13:44:59', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (23, 'robot_1778223341696_9071', '活力满满', '/uploads/file/avatar/avatar_22.png', 0, 2, 1, NULL, '2026-05-09 21:55:01', 5215, 0, 0, 0, 1, 0, 1, 2, 1, 2, 1, NULL, '', '2026-05-08 14:55:42', '2026-05-09 21:58:52', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (24, 'robot_1778223341709_7927', '躺赢专家', '/uploads/file/avatar/avatar_20.jpg', 2, 2, 0, NULL, '2026-05-09 12:30:01', 3702, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, NULL, '', '2026-05-08 14:55:42', '2026-05-09 12:30:01', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (25, 'robot_1778223341721_7888', '认真生活', '/uploads/file/avatar/avatar_7.jpeg', 0, 2, 0, NULL, '2026-05-09 10:20:01', 3939, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, NULL, '', '2026-05-08 14:55:42', '2026-05-09 10:20:01', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (26, 'robot_1778223341731_3761', '独孤求败', '/uploads/file/avatar/avatar_1.webp', 1, 2, 0, NULL, '2026-05-09 12:40:00', 7429, 0, 0, 0, 1, 0, 0, 2, 0, 2, 1, NULL, '', '2026-05-08 14:55:42', '2026-05-09 12:40:52', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (27, 'robot_1778223341743_272', '运气爆棚', '/uploads/file/avatar/avatar_4.png', 0, 2, 0, NULL, '2026-05-09 19:10:01', 9375, 0, 0, 0, 1, 0, 1, 2, 0, 3, 1, NULL, '', '2026-05-08 14:55:42', '2026-05-09 19:13:44', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (28, 'robot_1778223341757_940', '王者段位', '/uploads/file/avatar/avatar_27.jpg', 0, 2, 0, NULL, '2026-05-09 18:55:01', 7489, 0, 0, 0, 1, 0, 0, 5, 0, 5, 1, NULL, '', '2026-05-08 14:55:42', '2026-05-09 18:58:57', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (29, 'robot_1778223341766_2071', '青春无敌', '/uploads/file/avatar/avatar_14.jpg', 1, 2, 0, NULL, '2026-05-09 12:15:00', 1950, 0, 0, 0, 1, 0, 0, 3, 0, 3, 1, NULL, '', '2026-05-08 14:55:42', '2026-05-09 12:15:00', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (30, 'robot_1778223341778_4422', '碧海蓝天', '/uploads/file/avatar/avatar_19.jpeg', 2, 2, 1, NULL, '2026-05-09 21:55:01', 8675, 0, 0, 0, 1, 0, 1, 4, 2, 3, 1, NULL, '', '2026-05-08 14:55:42', '2026-05-09 21:58:52', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (31, 'robot_1778223341788_7510', '心安是归', '/uploads/file/avatar/avatar_3.jpeg', 1, 2, 0, NULL, '2026-05-09 12:40:00', 9261, 0, 0, 0, 1, 0, 0, 4, 0, 4, 1, NULL, '', '2026-05-08 14:55:42', '2026-05-09 12:40:52', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (32, 'robot_1778223341799_7436', '心向阳光', '/uploads/file/avatar/avatar_10.jpeg', 1, 2, 0, NULL, '2026-05-09 17:25:00', 6869, 0, 0, 0, 1, 0, 1, 2, 0, 3, 1, NULL, '', '2026-05-08 14:55:42', '2026-05-09 17:28:07', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (33, 'robot_1778223341809_880', '美味蛋糕', '/uploads/file/avatar/avatar_31.jpeg', 2, 2, 1, NULL, '2026-05-09 19:30:00', 1445, 0, 0, 0, 1, 0, 1, 3, 0, 4, 1, NULL, '', '2026-05-08 14:55:42', '2026-05-09 19:34:01', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (34, 'robot_1778223341819_9815', '自在逍遥', '/uploads/file/avatar/avatar_31.jpeg', 0, 2, 0, NULL, '2026-05-08 19:15:01', 1817, 0, 0, 0, 1, 0, 0, 3, 0, 3, 1, NULL, '', '2026-05-08 14:55:42', '2026-05-08 19:18:16', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (35, 'robot_1778223341830_9244', '氪金大佬', '/uploads/file/avatar/avatar_17.jpeg', 1, 2, 0, NULL, '2026-05-09 13:40:00', 2701, 0, 0, 0, 1, 0, 1, 5, 0, 6, 1, NULL, '', '2026-05-08 14:55:42', '2026-05-09 13:44:59', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (36, 'robot_1778223341840_1580', '静静守候', '/uploads/file/avatar/avatar_4.png', 0, 2, 1, NULL, '2026-05-09 19:30:00', 9641, 0, 0, 0, 1, 0, 1, 2, 0, 3, 1, NULL, '', '2026-05-08 14:55:42', '2026-05-09 19:34:01', NULL, 0, '', NULL);
INSERT INTO `ddz_players` VALUES (38, 'robot_1778223341918_6438', '活泼小狗', '/uploads/file/avatar/avatar_31.jpeg', 2, 2, 0, NULL, '2026-05-08 16:10:00', 5087, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, NULL, '', '2026-05-08 14:55:42', '2026-05-08 16:10:37', NULL, 0, '', NULL);

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
  `elimination_rules` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '[60,30,18,9,3]' COMMENT '淘汰规则JSON数组',
  `rank_wait_seconds` int NOT NULL DEFAULT 30 COMMENT '排行榜阶段等待秒数',
  `min_match_players` bigint NOT NULL DEFAULT 1 COMMENT '最小匹配人数',
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
INSERT INTO `ddz_room_config` VALUES (1, '新手场', 2, 2, 1, 1, 1000, 100, 50000, 0, '[{\"end\": \"23:59\", \"start\": \"00:00\"}]', 5, 3, 0, 90, 30, NULL, '[60,30,18,9,3]', 30, 1, 1, 5, 0.0000, 20, 30, 1, 1, '适合新手玩家,底分1,最低1000金币入场', '2026-04-26 09:27:51', '2026-05-09 16:54:44', NULL, 2);
INSERT INTO `ddz_room_config` VALUES (2, '普通场', 3, 2, 2, 1, 50000, 500, 200000, 0, '[{\"end\": \"23:59\", \"start\": \"17:00\"}]', 10, 3, 0, 9, 3, NULL, '[60,30,18,9,3]', 30, 1, 1, 3, 0.0100, 20, 25, 1, 2, '底分2,适合有一定经验的玩家', '2026-04-26 09:27:51', '2026-05-06 16:57:54', NULL, 3);
INSERT INTO `ddz_room_config` VALUES (3, '高级场', 4, 2, 5, 2, 200000, 1000, 1000000, 0, '[{\"end\": \"21:00\", \"start\": \"17:00\"}]', 30, 3, 0, 9, 3, NULL, '[60,30,18,9,3]', 30, 1, 1, 2, 0.0200, 20, 20, 1, 3, '底分5,倍数2,高手对决', '2026-04-26 09:27:51', '2026-05-06 20:03:52', NULL, 4);
INSERT INTO `ddz_room_config` VALUES (4, '富豪场', 5, 1, 10, 3, 1000, 0, 0, 0, NULL, 5, 3, 0, 9, 3, NULL, '[60,30,18,9,3]', 30, 1, 0, 0, 0.0300, 20, 20, 1, 4, '底分10,倍数3,富豪专属', '2026-04-26 09:27:51', '2026-04-28 10:00:53', NULL, 5);
INSERT INTO `ddz_room_config` VALUES (5, '至尊场', 6, 2, 20, 5, 5000000, 0, 0, 0, NULL, 5, 3, 0, 9, 3, NULL, '[60,30,18,9,3]', 30, 1, 0, 0, 0.0500, 20, 15, 0, 5, '底分20,倍数5,顶级玩家对决,无上限', '2026-04-26 09:27:51', '2026-04-27 18:18:14', '2026-04-28 10:01:05', 2);

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
) ENGINE = InnoDB AUTO_INCREMENT = 189 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '房间表(月份分表)' ROW_FORMAT = Dynamic;

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
INSERT INTO `ddz_rooms_202605` VALUES (141, '487730', '房487730', 1, 2, 2, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-07 22:20:01', '2026-05-08 08:20:21', '2026-05-08 08:20:21');
INSERT INTO `ddz_rooms_202605` VALUES (142, '355435', '房355435', 1, 2, 2, 4, 3, 3, 2, 1, 1, 4, 9, 18, '2026-05-08 08:20:21', '2026-05-08 08:20:21', NULL);
INSERT INTO `ddz_rooms_202605` VALUES (143, '765476', '房765476', 1, 2, 2, 4, 3, 3, 2, 1, 1, 4, 15, 17, '2026-05-08 08:40:05', '2026-05-08 08:40:04', NULL);
INSERT INTO `ddz_rooms_202605` VALUES (144, '372334', '房372334', 1, 2, 2, 4, 3, 3, 2, 1, 1, 4, 12, 11, '2026-05-08 09:05:03', '2026-05-08 09:05:03', NULL);
INSERT INTO `ddz_rooms_202605` VALUES (145, '197768', '房197768', 1, 2, 2, 4, 3, 3, 0, 1, 1, 4, 16, 17, '2026-05-08 11:05:02', '2026-05-08 11:10:06', '2026-05-08 11:10:06');
INSERT INTO `ddz_rooms_202605` VALUES (146, '021367', '房021367', 1, 2, 2, 4, 3, 3, 2, 1, 1, 4, 14, 13, '2026-05-08 11:35:02', '2026-05-08 11:35:01', NULL);
INSERT INTO `ddz_rooms_202605` VALUES (147, '358253', '房358253', 1, 2, 2, 4, 3, 3, 2, 1, 1, 4, 9, 10, '2026-05-08 12:00:02', '2026-05-08 12:00:02', NULL);
INSERT INTO `ddz_rooms_202605` VALUES (148, '376010', '房376010', 1, 2, 2, 4, 3, 3, 2, 1, 1, 4, 15, 18, '2026-05-08 12:25:07', '2026-05-08 12:25:06', NULL);
INSERT INTO `ddz_rooms_202605` VALUES (149, '859039', '房859039', 1, 2, 2, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-08 13:30:04', '2026-05-08 13:31:00', '2026-05-08 13:31:00');
INSERT INTO `ddz_rooms_202605` VALUES (150, '565888', '房565888', 1, 2, 2, 4, 3, 3, 2, 1, 1, 4, 13, 17, '2026-05-08 13:35:49', '2026-05-08 13:35:49', NULL);
INSERT INTO `ddz_rooms_202605` VALUES (151, '547470', '房547470', 0, 1, 1, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-08 13:44:17', '2026-05-08 13:44:21', '2026-05-08 13:44:21');
INSERT INTO `ddz_rooms_202605` VALUES (152, '186601', '房186601', 1, 2, 2, 4, 3, 3, 0, 1, 1, 4, 18, 11, '2026-05-08 13:45:03', '2026-05-08 13:47:38', '2026-05-08 13:47:39');
INSERT INTO `ddz_rooms_202605` VALUES (153, '023668', '房023668', 1, 2, 2, 4, 3, 3, 2, 1, 1, 4, 12, 14, '2026-05-08 14:00:02', '2026-05-08 14:00:02', NULL);
INSERT INTO `ddz_rooms_202605` VALUES (154, '704948', '房704948', 1, 2, 2, 4, 3, 3, 2, 1, 1, 4, 16, 15, '2026-05-08 14:15:02', '2026-05-08 14:15:01', NULL);
INSERT INTO `ddz_rooms_202605` VALUES (155, '560873', '房560873', 1, 2, 2, 4, 3, 3, 2, 1, 1, 4, 10, 9, '2026-05-08 14:45:26', '2026-05-08 14:45:25', NULL);
INSERT INTO `ddz_rooms_202605` VALUES (156, '866035', '房866035', 1, 2, 2, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-08 14:55:02', '2026-05-08 14:55:55', '2026-05-08 14:55:56');
INSERT INTO `ddz_rooms_202605` VALUES (157, '904184', '房904184', 1, 2, 2, 4, 3, 3, 2, 1, 1, 4, 9, 17, '2026-05-08 15:00:03', '2026-05-08 15:00:03', NULL);
INSERT INTO `ddz_rooms_202605` VALUES (158, '288465', '房288465', 1, 2, 2, 4, 3, 3, 2, 1, 1, 4, 20, 21, '2026-05-08 15:10:39', '2026-05-08 15:10:38', NULL);
INSERT INTO `ddz_rooms_202605` VALUES (159, '400847', '房400847', 1, 2, 2, 4, 3, 3, 2, 1, 1, 4, 25, 19, '2026-05-08 15:35:04', '2026-05-08 15:35:03', NULL);
INSERT INTO `ddz_rooms_202605` VALUES (160, '836744', '房836744', 1, 2, 2, 4, 3, 3, 0, 1, 1, 4, 33, 38, '2026-05-08 16:10:02', '2026-05-08 16:20:18', '2026-05-08 16:20:18');
INSERT INTO `ddz_rooms_202605` VALUES (161, '655355', '房655355', 1, 2, 2, 4, 3, 3, 0, 1, 1, 4, 10, 14, '2026-05-08 16:25:03', '2026-05-08 16:34:34', '2026-05-08 16:34:34');
INSERT INTO `ddz_rooms_202605` VALUES (162, '663807', '房663807', 1, 2, 2, 4, 3, 3, 0, 1, 1, 4, 24, 22, '2026-05-08 16:50:02', '2026-05-08 17:00:12', '2026-05-08 17:00:13');
INSERT INTO `ddz_rooms_202605` VALUES (163, '592012', '房592012', 1, 2, 2, 4, 3, 3, 0, 1, 1, 4, 34, 21, '2026-05-08 19:15:16', '2026-05-08 19:25:23', '2026-05-08 19:25:23');
INSERT INTO `ddz_rooms_202605` VALUES (164, '463452', '房463452', 1, 2, 2, 4, 3, 3, 0, 1, 1, 4, 17, 35, '2026-05-08 20:25:07', '2026-05-08 20:34:45', '2026-05-08 20:34:46');
INSERT INTO `ddz_rooms_202605` VALUES (165, '190389', '房190389', 1, 2, 2, 4, 3, 3, 0, 1, 1, 4, 31, 29, '2026-05-09 07:20:44', '2026-05-09 07:30:34', '2026-05-09 07:30:34');
INSERT INTO `ddz_rooms_202605` VALUES (166, '737575', '房737575', 1, 2, 2, 4, 3, 3, 2, 1, 1, 4, 28, 15, '2026-05-09 07:35:02', '2026-05-09 07:35:02', NULL);
INSERT INTO `ddz_rooms_202605` VALUES (167, '248151', '房248151', 1, 2, 2, 4, 3, 3, 0, 1, 1, 4, 18, 9, '2026-05-09 07:55:02', '2026-05-09 08:05:10', '2026-05-09 08:05:10');
INSERT INTO `ddz_rooms_202605` VALUES (168, '480322', '房480322', 1, 2, 2, 4, 3, 3, 2, 1, 1, 4, 26, 32, '2026-05-09 10:00:02', '2026-05-09 10:00:02', NULL);
INSERT INTO `ddz_rooms_202605` VALUES (169, '888021', '房888021', 1, 2, 2, 4, 3, 3, 2, 1, 1, 4, 12, 16, '2026-05-09 10:10:02', '2026-05-09 10:10:02', NULL);
INSERT INTO `ddz_rooms_202605` VALUES (170, '119562', '房119562', 1, 2, 2, 4, 3, 3, 2, 1, 1, 4, 30, 25, '2026-05-09 10:20:02', '2026-05-09 10:20:01', NULL);
INSERT INTO `ddz_rooms_202605` VALUES (171, '400430', '房400430', 1, 2, 2, 4, 3, 3, 2, 1, 1, 4, 23, 19, '2026-05-09 10:35:02', '2026-05-09 10:35:02', NULL);
INSERT INTO `ddz_rooms_202605` VALUES (172, '172550', '房172550', 1, 2, 2, 4, 3, 3, 0, 1, 1, 4, 13, 20, '2026-05-09 10:50:40', '2026-05-09 11:00:44', '2026-05-09 11:00:44');
INSERT INTO `ddz_rooms_202605` VALUES (173, '668482', '房668482', 1, 2, 2, 4, 2, 3, 0, 1, 1, 4, 27, NULL, '2026-05-09 11:35:02', '2026-05-09 11:36:17', '2026-05-09 11:36:18');
INSERT INTO `ddz_rooms_202605` VALUES (174, '311420', '房311420', 0, 1, 1, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-09 11:36:43', '2026-05-09 11:36:46', '2026-05-09 11:36:47');
INSERT INTO `ddz_rooms_202605` VALUES (175, '057940', '房057940', 1, 2, 2, 4, 3, 3, 0, 1, 1, 4, 14, 11, '2026-05-09 11:40:01', '2026-05-09 11:50:08', '2026-05-09 11:50:09');
INSERT INTO `ddz_rooms_202605` VALUES (176, '635252', '房635252', 1, 2, 2, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-09 12:05:03', '2026-05-09 12:15:03', '2026-05-09 12:15:04');
INSERT INTO `ddz_rooms_202605` VALUES (177, '529032', '房529032', 1, 2, 2, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-09 12:15:04', '2026-05-09 12:30:04', '2026-05-09 12:30:05');
INSERT INTO `ddz_rooms_202605` VALUES (178, '296305', '房296305', 1, 2, 2, 4, 1, 3, 0, 1, 1, 4, NULL, NULL, '2026-05-09 12:30:05', '2026-05-09 12:40:09', '2026-05-09 12:40:10');
INSERT INTO `ddz_rooms_202605` VALUES (179, '441624', '房441624', 1, 2, 2, 4, 3, 3, 2, 1, 1, 4, 31, 26, '2026-05-09 12:40:10', '2026-05-09 12:40:09', NULL);
INSERT INTO `ddz_rooms_202605` VALUES (180, '898605', '房898605', 1, 2, 2, 4, 3, 3, 2, 1, 1, 4, 17, 23, '2026-05-09 13:30:01', '2026-05-09 13:30:01', NULL);
INSERT INTO `ddz_rooms_202605` VALUES (181, '392964', '房392964', 1, 2, 2, 4, 3, 3, 0, 1, 1, 4, 35, 22, '2026-05-09 13:40:06', '2026-05-09 13:49:56', '2026-05-09 13:49:57');
INSERT INTO `ddz_rooms_202605` VALUES (182, '919930', '房919930', 1, 2, 2, 4, 3, 3, 0, 1, 1, 4, 30, 32, '2026-05-09 17:25:02', '2026-05-09 17:34:42', '2026-05-09 17:34:42');
INSERT INTO `ddz_rooms_202605` VALUES (183, '987195', '房987195', 1, 2, 2, 4, 3, 3, 0, 1, 1, 4, 13, 18, '2026-05-09 17:40:02', '2026-05-09 17:49:31', '2026-05-09 17:49:32');
INSERT INTO `ddz_rooms_202605` VALUES (184, '614656', '房614656', 1, 2, 2, 4, 3, 3, 0, 1, 1, 4, 10, 9, '2026-05-09 18:25:04', '2026-05-09 18:34:27', '2026-05-09 18:34:28');
INSERT INTO `ddz_rooms_202605` VALUES (185, '273798', '房273798', 1, 2, 2, 4, 3, 3, 0, 1, 1, 4, 28, 11, '2026-05-09 18:55:40', '2026-05-09 19:04:58', '2026-05-09 19:04:58');
INSERT INTO `ddz_rooms_202605` VALUES (186, '734098', '房734098', 1, 2, 2, 4, 3, 3, 0, 1, 1, 4, 16, 27, '2026-05-09 19:10:04', '2026-05-09 19:20:09', '2026-05-09 19:20:09');
INSERT INTO `ddz_rooms_202605` VALUES (187, '372853', '房372853', 1, 2, 2, 4, 3, 3, 0, 1, 1, 4, 33, 36, '2026-05-09 19:30:01', '2026-05-09 19:39:25', '2026-05-09 19:39:25');
INSERT INTO `ddz_rooms_202605` VALUES (188, '978330', '房978330', 1, 2, 2, 4, 3, 3, 0, 1, 1, 4, 30, 23, '2026-05-09 21:55:16', '2026-05-09 22:05:11', '2026-05-09 22:05:12');

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
-- Table structure for ddz_tournament_eliminations
-- ----------------------------
DROP TABLE IF EXISTS `ddz_tournament_eliminations`;
CREATE TABLE `ddz_tournament_eliminations`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `session_id` bigint UNSIGNED NOT NULL COMMENT '比赛会话ID',
  `round_num` int NOT NULL COMMENT '轮次号',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '被淘汰玩家ID',
  `rank_before` int NOT NULL COMMENT '淘汰前排名',
  `match_coin` bigint NOT NULL COMMENT '淘汰时比赛金币',
  `eliminated_reason` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'lose' COMMENT '淘汰原因: lose-输掉比赛, offline-掉线, forfeit-弃权',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_session_id`(`session_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_round_num`(`session_id` ASC, `round_num` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '锦标赛淘汰记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_tournament_eliminations
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_tournament_eliminations_202605
-- ----------------------------
DROP TABLE IF EXISTS `ddz_tournament_eliminations_202605`;
CREATE TABLE `ddz_tournament_eliminations_202605`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `session_id` bigint UNSIGNED NOT NULL COMMENT '比赛会话ID',
  `round_num` int NOT NULL COMMENT '轮次号',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `rank_before` int NOT NULL DEFAULT 0 COMMENT '淘汰前排名',
  `match_coin` bigint NOT NULL DEFAULT 0 COMMENT '淘汰时金币',
  `eliminated_reason` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '淘汰原因',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_session_id`(`session_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_round_num`(`round_num` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '锦标赛淘汰记录表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_tournament_eliminations_202605
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_tournament_eliminations_202606
-- ----------------------------
DROP TABLE IF EXISTS `ddz_tournament_eliminations_202606`;
CREATE TABLE `ddz_tournament_eliminations_202606`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `session_id` bigint UNSIGNED NOT NULL COMMENT '比赛会话ID',
  `round_num` int NOT NULL COMMENT '轮次号',
  `player_id` bigint UNSIGNED NOT NULL COMMENT '玩家ID',
  `rank_before` int NOT NULL DEFAULT 0 COMMENT '淘汰前排名',
  `match_coin` bigint NOT NULL DEFAULT 0 COMMENT '淘汰时金币',
  `eliminated_reason` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '淘汰原因',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_session_id`(`session_id` ASC) USING BTREE,
  INDEX `idx_player_id`(`player_id` ASC) USING BTREE,
  INDEX `idx_round_num`(`round_num` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '锦标赛淘汰记录表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_tournament_eliminations_202606
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_tournament_rounds
-- ----------------------------
DROP TABLE IF EXISTS `ddz_tournament_rounds`;
CREATE TABLE `ddz_tournament_rounds`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `session_id` bigint UNSIGNED NOT NULL COMMENT '比赛会话ID',
  `round_num` int NOT NULL COMMENT '轮次号',
  `elimination_target` int NOT NULL COMMENT '本轮淘汰目标人数(保留人数)',
  `total_players` int NOT NULL COMMENT '本轮开始时总人数',
  `tables_count` int NOT NULL COMMENT '本轮桌数',
  `stage` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PREPARE' COMMENT '阶段: PREPARE, PLAYING, RANKING, ELIMINATING, COMPLETED',
  `started_at` datetime NULL DEFAULT NULL COMMENT '开始时间',
  `ended_at` datetime NULL DEFAULT NULL COMMENT '结束时间',
  `rank_wait_until` datetime NULL DEFAULT NULL COMMENT '排行榜等待截止时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_session_id`(`session_id` ASC) USING BTREE,
  INDEX `idx_round_num`(`session_id` ASC, `round_num` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '锦标赛淘汰轮次表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_tournament_rounds
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_tournament_rounds_202605
-- ----------------------------
DROP TABLE IF EXISTS `ddz_tournament_rounds_202605`;
CREATE TABLE `ddz_tournament_rounds_202605`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `session_id` bigint UNSIGNED NOT NULL COMMENT '比赛会话ID',
  `round_num` int NOT NULL COMMENT '轮次号',
  `elimination_target` int NOT NULL DEFAULT 0 COMMENT '淘汰目标人数',
  `total_players` int NOT NULL DEFAULT 0 COMMENT '总玩家数',
  `tables_count` int NOT NULL DEFAULT 0 COMMENT '桌子数量',
  `stage` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PREPARE' COMMENT '阶段',
  `started_at` datetime NULL DEFAULT NULL COMMENT '开始时间',
  `ended_at` datetime NULL DEFAULT NULL COMMENT '结束时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_session_round`(`session_id` ASC, `round_num` ASC) USING BTREE,
  INDEX `idx_session_id`(`session_id` ASC) USING BTREE,
  INDEX `idx_stage`(`stage` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '锦标赛轮次表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_tournament_rounds_202605
-- ----------------------------

-- ----------------------------
-- Table structure for ddz_tournament_rounds_202606
-- ----------------------------
DROP TABLE IF EXISTS `ddz_tournament_rounds_202606`;
CREATE TABLE `ddz_tournament_rounds_202606`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `session_id` bigint UNSIGNED NOT NULL COMMENT '比赛会话ID',
  `round_num` int NOT NULL COMMENT '轮次号',
  `elimination_target` int NOT NULL DEFAULT 0 COMMENT '淘汰目标人数',
  `total_players` int NOT NULL DEFAULT 0 COMMENT '总玩家数',
  `tables_count` int NOT NULL DEFAULT 0 COMMENT '桌子数量',
  `stage` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PREPARE' COMMENT '阶段',
  `started_at` datetime NULL DEFAULT NULL COMMENT '开始时间',
  `ended_at` datetime NULL DEFAULT NULL COMMENT '结束时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_session_round`(`session_id` ASC, `round_num` ASC) USING BTREE,
  INDEX `idx_session_id`(`session_id` ASC) USING BTREE,
  INDEX `idx_stage`(`stage` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '锦标赛轮次表(月份分表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_tournament_rounds_202606
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
) ENGINE = InnoDB AUTO_INCREMENT = 37 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

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
INSERT INTO `ddz_user_accounts` VALUES (18, 19, NULL, '', 'robot_55f402448a50a8e6', 'union_abca9bcb60953d48', '', '山水诗意', '/uploads/file/avatar/avatar_28.jpg', 2, 'MPV6cpAaJeqgIX24', '2026-05-15 14:55:42', '', NULL, '', 'robot', '2026-05-08 14:55:42', '', 1, 1, '2026-05-08 14:55:42', '2026-05-08 14:55:42', NULL);
INSERT INTO `ddz_user_accounts` VALUES (19, 20, NULL, '', 'robot_2bfcadaa7ac988d1', 'union_642de9db4fbbd523', '', '牌技精湛', '/uploads/file/avatar/avatar_1.webp', 2, 'wOTPaHPDk3wCCXC7', '2026-05-15 14:55:42', '', NULL, '', 'robot', '2026-05-08 14:55:42', '', 1, 1, '2026-05-08 14:55:42', '2026-05-08 14:55:42', NULL);
INSERT INTO `ddz_user_accounts` VALUES (20, 21, NULL, '', 'robot_d06a37f8c4b969b9', 'union_962e536af838d4d7', '', '浅笑安然', '/uploads/file/avatar/avatar_8.png', 2, '7raw8LTPfebkq7P2', '2026-05-15 14:55:42', '', NULL, '', 'robot', '2026-05-08 14:55:42', '', 1, 1, '2026-05-08 14:55:42', '2026-05-08 14:55:42', NULL);
INSERT INTO `ddz_user_accounts` VALUES (21, 22, NULL, '', 'robot_dbce0720eb064af2', 'union_31cd904aa07fddc9', '', '阳光灿烂', '/uploads/file/avatar/avatar_19.jpeg', 2, 'heYnE2dm4lvANAeG', '2026-05-15 14:55:42', '', NULL, '', 'robot', '2026-05-08 14:55:42', '', 1, 1, '2026-05-08 14:55:42', '2026-05-08 14:55:42', NULL);
INSERT INTO `ddz_user_accounts` VALUES (22, 23, NULL, '', 'robot_11fe7f750321cbfc', 'union_98238966ed2d44c1', '', '活力满满', '/uploads/file/avatar/avatar_22.png', 2, 'J96dmxGJOVMnj76e', '2026-05-15 14:55:42', '', NULL, '', 'robot', '2026-05-08 14:55:42', '', 1, 1, '2026-05-08 14:55:42', '2026-05-08 14:55:42', NULL);
INSERT INTO `ddz_user_accounts` VALUES (23, 24, NULL, '', 'robot_2b971021da64c880', 'union_a982271be3314139', '', '躺赢专家', '/uploads/file/avatar/avatar_20.jpg', 2, 'GKIBWQCvicZm5bP9', '2026-05-15 14:55:42', '', NULL, '', 'robot', '2026-05-08 14:55:42', '', 1, 1, '2026-05-08 14:55:42', '2026-05-08 14:55:42', NULL);
INSERT INTO `ddz_user_accounts` VALUES (24, 25, NULL, '', 'robot_1a09a3459201f603', 'union_09d3c4b9da9c5384', '', '认真生活', '/uploads/file/avatar/avatar_7.jpeg', 2, 'OnNrBKKffB1mDP9w', '2026-05-15 14:55:42', '', NULL, '', 'robot', '2026-05-08 14:55:42', '', 1, 1, '2026-05-08 14:55:42', '2026-05-08 14:55:42', NULL);
INSERT INTO `ddz_user_accounts` VALUES (25, 26, NULL, '', 'robot_f21fd9bd77cb2e06', 'union_9dc081cc92b6b856', '', '独孤求败', '/uploads/file/avatar/avatar_1.webp', 2, 'jOzCmkyriSYN1XPz', '2026-05-15 14:55:42', '', NULL, '', 'robot', '2026-05-08 14:55:42', '', 1, 1, '2026-05-08 14:55:42', '2026-05-08 14:55:42', NULL);
INSERT INTO `ddz_user_accounts` VALUES (26, 27, NULL, '', 'robot_98e33f9cd4d27736', 'union_4b6294544f14864e', '', '运气爆棚', '/uploads/file/avatar/avatar_4.png', 2, 'v0K46hvjHrjYlJM3', '2026-05-15 14:55:42', '', NULL, '', 'robot', '2026-05-08 14:55:42', '', 1, 1, '2026-05-08 14:55:42', '2026-05-08 14:55:42', NULL);
INSERT INTO `ddz_user_accounts` VALUES (27, 28, NULL, '', 'robot_827be94603b7f3a6', 'union_0f083065fd4e9c96', '', '王者段位', '/uploads/file/avatar/avatar_27.jpg', 2, 'qPrBRUfMkyMGCmjb', '2026-05-15 14:55:42', '', NULL, '', 'robot', '2026-05-08 14:55:42', '', 1, 1, '2026-05-08 14:55:42', '2026-05-08 14:55:42', NULL);
INSERT INTO `ddz_user_accounts` VALUES (28, 29, NULL, '', 'robot_86d31a4a5f532dc5', 'union_d1cc8e0be5ca40d2', '', '青春无敌', '/uploads/file/avatar/avatar_14.jpg', 2, '9oHChd1EmoNoGNir', '2026-05-15 14:55:42', '', NULL, '', 'robot', '2026-05-08 14:55:42', '', 1, 1, '2026-05-08 14:55:42', '2026-05-08 14:55:42', NULL);
INSERT INTO `ddz_user_accounts` VALUES (29, 30, NULL, '', 'robot_3563bcb4c8bf2e34', 'union_aa861d21c0dbad41', '', '碧海蓝天', '/uploads/file/avatar/avatar_19.jpeg', 2, '1bZDczS1zZFc4ktg', '2026-05-15 14:55:42', '', NULL, '', 'robot', '2026-05-08 14:55:42', '', 1, 1, '2026-05-08 14:55:42', '2026-05-08 14:55:42', NULL);
INSERT INTO `ddz_user_accounts` VALUES (30, 31, NULL, '', 'robot_a0e57d7dc4059b69', 'union_aa61c865daf520b6', '', '心安是归', '/uploads/file/avatar/avatar_3.jpeg', 2, 'bbOqfpBZPXH0kdQS', '2026-05-15 14:55:42', '', NULL, '', 'robot', '2026-05-08 14:55:42', '', 1, 1, '2026-05-08 14:55:42', '2026-05-08 14:55:42', NULL);
INSERT INTO `ddz_user_accounts` VALUES (31, 32, NULL, '', 'robot_4f907b20467d6fc8', 'union_8680610aea830851', '', '心向阳光', '/uploads/file/avatar/avatar_10.jpeg', 2, 'kovo0rs6wYnMqi5p', '2026-05-15 14:55:42', '', NULL, '', 'robot', '2026-05-08 14:55:42', '', 1, 1, '2026-05-08 14:55:42', '2026-05-08 14:55:42', NULL);
INSERT INTO `ddz_user_accounts` VALUES (32, 33, NULL, '', 'robot_be7d69ff6346c47e', 'union_be97258075909e42', '', '美味蛋糕', '/uploads/file/avatar/avatar_31.jpeg', 2, 'wcHaxxdVO9oNPXL2', '2026-05-15 14:55:42', '', NULL, '', 'robot', '2026-05-08 14:55:42', '', 1, 1, '2026-05-08 14:55:42', '2026-05-08 14:55:42', NULL);
INSERT INTO `ddz_user_accounts` VALUES (33, 34, NULL, '', 'robot_72e0d2f0c3b89412', 'union_2ee628606068df87', '', '自在逍遥', '/uploads/file/avatar/avatar_31.jpeg', 2, 'aK3w8gUXvIXoVfHr', '2026-05-15 14:55:42', '', NULL, '', 'robot', '2026-05-08 14:55:42', '', 1, 1, '2026-05-08 14:55:42', '2026-05-08 14:55:42', NULL);
INSERT INTO `ddz_user_accounts` VALUES (34, 35, NULL, '', 'robot_f40552942441cbe3', 'union_ccdfa7340db6490a', '', '氪金大佬', '/uploads/file/avatar/avatar_17.jpeg', 2, 'yMRfX6wEbpsIfS33', '2026-05-15 14:55:42', '', NULL, '', 'robot', '2026-05-08 14:55:42', '', 1, 1, '2026-05-08 14:55:42', '2026-05-08 14:55:42', NULL);
INSERT INTO `ddz_user_accounts` VALUES (35, 36, NULL, '', 'robot_bc7754841267db00', 'union_b080eb1060b9e1a2', '', '静静守候', '/uploads/file/avatar/avatar_4.png', 2, 'wGmyls8ncoyKFIuj', '2026-05-15 14:55:42', '', NULL, '', 'robot', '2026-05-08 14:55:42', '', 1, 1, '2026-05-08 14:55:42', '2026-05-08 14:55:42', NULL);
INSERT INTO `ddz_user_accounts` VALUES (36, 38, NULL, '', 'robot_a79925cf095b9dda', 'union_b48152b36658add5', '', '活泼小狗', '/uploads/file/avatar/avatar_31.jpeg', 2, 'mgvTElzGajTU4T7E', '2026-05-15 14:55:42', '', NULL, '', 'robot', '2026-05-08 14:55:42', '', 1, 1, '2026-05-08 14:55:42', '2026-05-08 14:55:42', NULL);

-- ----------------------------
-- Table structure for ddz_write_queue_error_logs
-- ----------------------------
DROP TABLE IF EXISTS `ddz_write_queue_error_logs`;
CREATE TABLE `ddz_write_queue_error_logs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `error_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `error_msg` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `error_detail` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `resolved` tinyint UNSIGNED NULL DEFAULT 0,
  `created_at` datetime(3) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ddz_write_queue_error_logs_error_type`(`error_type` ASC) USING BTREE,
  INDEX `idx_ddz_write_queue_error_logs_resolved`(`resolved` ASC) USING BTREE,
  INDEX `idx_ddz_write_queue_error_logs_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ddz_write_queue_error_logs
-- ----------------------------

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
-- Procedure structure for migrate_arena_period_players_tables
-- ----------------------------
DROP PROCEDURE IF EXISTS `migrate_arena_period_players_tables`;
delimiter ;;
CREATE PROCEDURE `migrate_arena_period_players_tables`()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE tbl_name VARCHAR(100);
    DECLARE cur CURSOR FOR 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name LIKE 'ddz_arena_period_players_%';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO tbl_name;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- 添加 final_rank 字段
        CALL safe_add_column(tbl_name, 'final_rank', "int DEFAULT NULL COMMENT '最终排名(比赛结束时从participations同步)'");
        
        -- 删除冗余字段
        CALL safe_drop_column(tbl_name, 'arena_gold');
        CALL safe_drop_column(tbl_name, 'is_eliminated');
        CALL safe_drop_column(tbl_name, 'eliminated_round');
        CALL safe_drop_column(tbl_name, 'rank_no');
        
        SELECT CONCAT('✅ 已完成表迁移: ', tbl_name) AS result;
    END LOOP;
    
    CLOSE cur;
    
    SELECT '🎉 所有 period_players 分表迁移完成' AS result;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for safe_add_column
-- ----------------------------
DROP PROCEDURE IF EXISTS `safe_add_column`;
delimiter ;;
CREATE PROCEDURE `safe_add_column`(IN p_table_name VARCHAR(100),
    IN p_column_name VARCHAR(100),
    IN p_column_definition VARCHAR(500))
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
    AND table_name = p_table_name
    AND column_name = p_column_name;
    
    IF column_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', p_table_name, ' ADD COLUMN ', p_column_name, ' ', p_column_definition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('✅ 已添加字段: ', p_table_name, '.', p_column_name) AS result;
    ELSE
        SELECT CONCAT('⏭️ 字段已存在: ', p_table_name, '.', p_column_name) AS result;
    END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for safe_add_index
-- ----------------------------
DROP PROCEDURE IF EXISTS `safe_add_index`;
delimiter ;;
CREATE PROCEDURE `safe_add_index`(IN p_table_name VARCHAR(100),
    IN p_index_name VARCHAR(100),
    IN p_columns VARCHAR(500))
BEGIN
    DECLARE index_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO index_exists
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
    AND table_name = p_table_name
    AND index_name = p_index_name;
    
    IF index_exists = 0 THEN
        SET @sql = CONCAT('CREATE INDEX ', p_index_name, ' ON ', p_table_name, '(', p_columns, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('✅ 已添加索引: ', p_table_name, '.', p_index_name) AS result;
    ELSE
        SELECT CONCAT('⏭️ 索引已存在: ', p_table_name, '.', p_index_name) AS result;
    END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for safe_drop_column
-- ----------------------------
DROP PROCEDURE IF EXISTS `safe_drop_column`;
delimiter ;;
CREATE PROCEDURE `safe_drop_column`(IN p_table_name VARCHAR(100),
    IN p_column_name VARCHAR(100))
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
    AND table_name = p_table_name
    AND column_name = p_column_name;
    
    IF column_exists > 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', p_table_name, ' DROP COLUMN ', p_column_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('✅ 已删除字段: ', p_table_name, '.', p_column_name) AS result;
    ELSE
        SELECT CONCAT('⏭️ 字段不存在: ', p_table_name, '.', p_column_name) AS result;
    END IF;
END
;;
delimiter ;

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
