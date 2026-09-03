/*
 Navicat Premium Dump SQL

 Source Server         : conn
 Source Server Type    : MySQL
 Source Server Version : 80041 (8.0.41)
 Source Host           : localhost:3306
 Source Schema         : yymusic

 Target Server Type    : MySQL
 Target Server Version : 80041 (8.0.41)
 File Encoding         : 65001

 Date: 05/01/2026 17:21:23
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for music_creation
-- ----------------------------
DROP TABLE IF EXISTS `music_creation`;
CREATE TABLE `music_creation`  (
  `creation_id` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '创作ID',
  `user_id` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `prompt` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '提示词',
  `lyrics` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '歌词',
  `model` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '模型',
  `music_type` tinyint(1) NOT NULL DEFAULT 0 COMMENT '音乐类型 0:音乐 1:纯音乐',
  `mode_type` tinyint(1) NULL DEFAULT NULL COMMENT '模式 0:简单模式 1:高级模式',
  `settings` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '设置信息',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`creation_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '音乐创作信息' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of music_creation
-- ----------------------------

-- ----------------------------
-- Table structure for music_info
-- ----------------------------
DROP TABLE IF EXISTS `music_info`;
CREATE TABLE `music_info`  (
  `music_id` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '音乐ID',
  `user_id` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `task_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '任务ID',
  `creation_id` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '创作ID',
  `music_title` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '标题',
  `cover` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '封面',
  `audio_path` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '音乐地址',
  `duration` int NULL DEFAULT NULL COMMENT '持续时间',
  `lyrics` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '歌词',
  `play_count` int NULL DEFAULT 0 COMMENT '播放数量',
  `good_count` int NULL DEFAULT 0 COMMENT '点赞数',
  `commend_type` tinyint(1) NULL DEFAULT 0 COMMENT '0:未推荐 1:已推荐',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `music_status` tinyint(1) NULL DEFAULT 0 COMMENT '0:生成音乐中 1:生成完毕',
  `music_type` tinyint(1) NOT NULL DEFAULT 0 COMMENT '音乐类型 0:音乐 1:纯音乐',
  PRIMARY KEY (`music_id`) USING BTREE,
  UNIQUE INDEX `idx_key_task_id`(`task_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '音乐信息' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of music_info
-- ----------------------------

-- ----------------------------
-- Table structure for music_info_action
-- ----------------------------
DROP TABLE IF EXISTS `music_info_action`;
CREATE TABLE `music_info_action`  (
  `action_id` int NOT NULL AUTO_INCREMENT COMMENT '操作ID',
  `music_id` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '音乐ID',
  `music_user_id` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '音乐用户ID',
  `user_id` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `action_type` tinyint(1) NULL DEFAULT NULL COMMENT '操作类型1:点赞',
  PRIMARY KEY (`action_id`) USING BTREE,
  UNIQUE INDEX `idx_key_user_music_id`(`music_id` ASC, `user_id` ASC, `action_type` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 111 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '音乐操作' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of music_info_action
-- ----------------------------

-- ----------------------------
-- Table structure for pay_code_info
-- ----------------------------
DROP TABLE IF EXISTS `pay_code_info`;
CREATE TABLE `pay_code_info`  (
  `pay_code` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '支付码',
  `amount` decimal(15, 2) NULL DEFAULT NULL COMMENT '金额',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `use_user_id` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '使用用户ID',
  `use_time` datetime NULL DEFAULT NULL COMMENT '使用时间',
  `status` tinyint(1) NULL DEFAULT NULL COMMENT '状态 0:待使用 1:已使用',
  PRIMARY KEY (`pay_code`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '支付码' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of pay_code_info
-- ----------------------------

-- ----------------------------
-- Table structure for pay_order_info
-- ----------------------------
DROP TABLE IF EXISTS `pay_order_info`;
CREATE TABLE `pay_order_info`  (
  `order_id` varchar(28) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '订单号',
  `user_id` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户ID',
  `product_id` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '商品ID',
  `product_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '商品名称',
  `amount` decimal(5, 2) NULL DEFAULT NULL COMMENT '金额',
  `channel_order_id` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '支付通道订单ID',
  `create_time` datetime NULL DEFAULT NULL COMMENT '订单创建时间',
  `pay_time` datetime NULL DEFAULT NULL COMMENT '支付时间',
  `status` tinyint(1) NULL DEFAULT NULL COMMENT '0:待支付 1:支付完成',
  `integral` int NULL DEFAULT NULL COMMENT '购买积分',
  `pay_info` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '支付信息',
  `pay_type` tinyint(1) NULL DEFAULT NULL COMMENT '支付类型 0:付款码 1:微信支付',
  PRIMARY KEY (`order_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_product_id`(`product_id` ASC) USING BTREE,
  INDEX `idx_pay_type`(`pay_type` ASC) USING BTREE,
  INDEX `idx_pay_time`(`pay_time` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '支付订单信息' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of pay_order_info
-- ----------------------------

-- ----------------------------
-- Table structure for product_info
-- ----------------------------
DROP TABLE IF EXISTS `product_info`;
CREATE TABLE `product_info`  (
  `product_id` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '商品ID',
  `product_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '商品名称',
  `cover` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '封面',
  `price` decimal(7, 2) NULL DEFAULT NULL COMMENT '价格',
  `product_description` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '商品描述',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `onsale_type` tinyint(1) NULL DEFAULT NULL COMMENT '上架类型(0:未售 1:在售)',
  `integral` int NULL DEFAULT NULL COMMENT '购买积分',
  `sort` int NULL DEFAULT NULL COMMENT '排序号',
  PRIMARY KEY (`product_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '商品信息' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of product_info
-- ----------------------------

-- ----------------------------
-- Table structure for sys_dict
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict`;
CREATE TABLE `sys_dict`  (
  `dict_id` int NOT NULL AUTO_INCREMENT COMMENT '字典ID',
  `dict_code` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '字典编号',
  `dict_pcode` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '父级字典code',
  `dict_value` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '字典值',
  `dict_desc` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '字典描述',
  `sort` tinyint(1) NULL DEFAULT NULL COMMENT '排序号',
  PRIMARY KEY (`dict_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 109 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '系统字典' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of sys_dict
-- ----------------------------
INSERT INTO `sys_dict` VALUES (17, 'music_model', '0', '', '音乐模型', NULL);
INSERT INTO `sys_dict` VALUES (18, 'V3', 'music_model', '30', '生成最长120s的音乐(30积分/首)', 1);
INSERT INTO `sys_dict` VALUES (19, 'V3.5', 'music_model', '40', '生成最长270s的音乐(40积分/首)', 2);
INSERT INTO `sys_dict` VALUES (20, 'music_model_pure', '0', NULL, '纯音乐模型', NULL);
INSERT INTO `sys_dict` VALUES (21, 'V3', 'music_model_pure', '25', '生成最长120s的纯音乐(25积分/首)', 1);
INSERT INTO `sys_dict` VALUES (22, 'V3.5', 'music_model_pure', '35', '生成最长270s的纯音乐(35积分/首)', 2);
INSERT INTO `sys_dict` VALUES (23, 'music_grenre', '0', NULL, '曲风', 0);
INSERT INTO `sys_dict` VALUES (24, '流行', 'music_grenre', '', '', 1);
INSERT INTO `sys_dict` VALUES (25, '摇滚', 'music_grenre', '', '', 2);
INSERT INTO `sys_dict` VALUES (26, '迪斯科', 'music_grenre', '', NULL, 3);
INSERT INTO `sys_dict` VALUES (27, '电子', 'music_grenre', '', NULL, 4);
INSERT INTO `sys_dict` VALUES (28, '民谣', 'music_grenre', '', NULL, 5);
INSERT INTO `sys_dict` VALUES (29, '放克', 'music_grenre', '', NULL, 6);
INSERT INTO `sys_dict` VALUES (30, '乡村', 'music_grenre', '', NULL, 7);
INSERT INTO `sys_dict` VALUES (31, '爵士', 'music_grenre', '', NULL, 8);
INSERT INTO `sys_dict` VALUES (32, '嘻哈', 'music_grenre', '', NULL, 9);
INSERT INTO `sys_dict` VALUES (33, '金属', 'music_grenre', '', NULL, 10);
INSERT INTO `sys_dict` VALUES (34, '蓝调', 'music_grenre', '', NULL, 11);
INSERT INTO `sys_dict` VALUES (35, '朋克', 'music_grenre', '', NULL, 12);
INSERT INTO `sys_dict` VALUES (36, 'music_emotion', '0', NULL, '情绪', 0);
INSERT INTO `sys_dict` VALUES (37, '放松', 'music_emotion', '', '', 1);
INSERT INTO `sys_dict` VALUES (38, '生气', 'music_emotion', '', '', 2);
INSERT INTO `sys_dict` VALUES (39, '快乐', 'music_emotion', '', '', 3);
INSERT INTO `sys_dict` VALUES (40, '悲伤', 'music_emotion', '', '', 4);
INSERT INTO `sys_dict` VALUES (41, '冷静', 'music_emotion', '', '', 5);
INSERT INTO `sys_dict` VALUES (42, '灵感', 'music_emotion', '', '', 6);
INSERT INTO `sys_dict` VALUES (43, '神秘', 'music_emotion', '', '', 7);
INSERT INTO `sys_dict` VALUES (44, '雄伟', 'music_emotion', '', '', 8);
INSERT INTO `sys_dict` VALUES (45, '古怪', 'music_emotion', '', '', 9);
INSERT INTO `sys_dict` VALUES (46, '充满活力', 'music_emotion', '', '', 10);
INSERT INTO `sys_dict` VALUES (47, 'music_sex', '0', NULL, '人声', 0);
INSERT INTO `sys_dict` VALUES (48, '女声', 'music_sex', '', '', 1);
INSERT INTO `sys_dict` VALUES (49, '男声', 'music_sex', '', '', 2);
INSERT INTO `sys_dict` VALUES (50, 'music_prompt', '0', NULL, '音乐提示词', 0);
INSERT INTO `sys_dict` VALUES (51, '一首梦幻的浪漫歌曲，讲述霓虹灯下时间仿佛静止，每一刻都令人难', 'music_prompt', NULL, NULL, 1);
INSERT INTO `sys_dict` VALUES (52, '一首充满力量的主题曲，强烈的嗓音和鼓舞人心的节拍，讲述一起征', 'music_prompt', '', '', 2);
INSERT INTO `sys_dict` VALUES (53, '一首充满活力的浪漫歌曲，分享一个魔幻之吻', 'music_prompt', NULL, NULL, 3);
INSERT INTO `sys_dict` VALUES (54, '一首反思性歌曲，带有令人难忘的旋律和强有力的重复副歌', 'music_prompt', NULL, NULL, 4);
INSERT INTO `sys_dict` VALUES (55, '一首描述一只猫头鹰在月光下跳舞的歌曲', 'music_prompt', NULL, NULL, 5);
INSERT INTO `sys_dict` VALUES (56, '创作一首适合雨天聆听的民谣', 'music_prompt', NULL, NULL, 6);
INSERT INTO `sys_dict` VALUES (57, '为雨后的清新小镇创作宁静之歌', 'music_prompt', NULL, NULL, 7);
INSERT INTO `sys_dict` VALUES (58, '写一首甜蜜浪漫的情人节情歌', 'music_prompt', NULL, NULL, 8);
INSERT INTO `sys_dict` VALUES (61, '一首充满力量的主题曲，强烈的嗓音和鼓舞人心的节拍，讲述一起征', 'music_prompt', NULL, NULL, 11);
INSERT INTO `sys_dict` VALUES (62, 'music_prompt_pure', '0', '', '纯音乐提示词', 0);
INSERT INTO `sys_dict` VALUES (63, '轻快的原声吉他搭配轻打击乐，非常适合旅行剪辑和日常生活。', 'music_prompt_pure', NULL, NULL, 12);
INSERT INTO `sys_dict` VALUES (64, '欢快的尤克里里旋律配以轻柔的钢琴，适合生活方式和烹饪视频博客', 'music_prompt_pure', NULL, NULL, 13);
INSERT INTO `sys_dict` VALUES (65, '带有微妙键盘的低保真嘻哈节拍，非常适合学习环节和桌面导览。', 'music_prompt_pure', NULL, NULL, 14);
INSERT INTO `sys_dict` VALUES (66, '带有合成器音波的充满活力的电子流行音乐，科技评测和开箱视频。', 'music_prompt_pure', NULL, NULL, 4);
INSERT INTO `sys_dict` VALUES (67, '带有木琴和轻鼓的趣味器乐，非常适合家庭和儿童友好的内容。', 'music_prompt_pure', NULL, NULL, 5);
INSERT INTO `sys_dict` VALUES (68, '带有柔和音垫的环境电子音乐，适合自然漫步和宁静时刻。', 'music_prompt_pure', NULL, NULL, 6);
INSERT INTO `sys_dict` VALUES (69, '带有渐进弦乐的鼓舞人心的钢琴，励志内容。', 'music_prompt_pure', NULL, NULL, 7);
INSERT INTO `sys_dict` VALUES (70, '奇特的复古合成器搭配有趣的贝斯，非常适合喜剧视频博客和挑战。', 'music_prompt_pure', NULL, NULL, 8);
INSERT INTO `sys_dict` VALUES (71, '带有丝滑萨克斯风的轻松爵士休息室音乐，适合城市观光和咖啡店场', 'music_prompt_pure', NULL, NULL, 9);
INSERT INTO `sys_dict` VALUES (72, '带有现代节拍的动感打击乐，健身和体育视频博客。', 'music_prompt_pure', NULL, NULL, 10);
INSERT INTO `sys_dict` VALUES (73, '极简环境嗡鸣声配以偶尔的风铃声，非常适合深度思考和解决问题。', 'music_prompt_pure', NULL, NULL, 11);
INSERT INTO `sys_dict` VALUES (74, '平静的自然声音配以远处的钢琴，非常适合放松和减压。', 'music_prompt_pure', NULL, NULL, 12);
INSERT INTO `sys_dict` VALUES (75, '柔和的合成器声波配以轻柔的打击乐，完美适合深夜工作环节。', 'music_prompt_pure', NULL, NULL, 13);
INSERT INTO `sys_dict` VALUES (76, '极简钢琴配以柔和的氛围纹理，完美适合深度工作和专注。', 'music_prompt_pure', NULL, NULL, 14);
INSERT INTO `sys_dict` VALUES (77, '写一首温柔如初的民谣情歌', 'music_prompt', NULL, NULL, 0);
INSERT INTO `sys_dict` VALUES (78, '写一首关于舞蹈节奏的活力之歌，使用电子风格', 'music_prompt', NULL, NULL, 0);
INSERT INTO `sys_dict` VALUES (79, '写一首关于冬日初雪的宁静之歌，使用民谣风格', 'music_prompt', NULL, NULL, 0);
INSERT INTO `sys_dict` VALUES (80, '写一首春日樱花绽放的浪漫之歌，使用流行风格', 'music_prompt', NULL, NULL, 0);
INSERT INTO `sys_dict` VALUES (81, '为一次热气球之旅打造梦幻升空的旋律', 'music_prompt', NULL, NULL, 0);
INSERT INTO `sys_dict` VALUES (82, '夏日夜晚，微风与星空相伴', 'music_prompt', NULL, NULL, 0);
INSERT INTO `sys_dict` VALUES (83, '春日早晨，鸟鸣与花香交织', 'music_prompt', NULL, NULL, 0);
INSERT INTO `sys_dict` VALUES (84, '深夜书房，灯火与书籍相伴', 'music_prompt', NULL, NULL, 0);
INSERT INTO `sys_dict` VALUES (85, '写一首送给离别恋人的歌，使用民谣风格', 'music_prompt', NULL, NULL, 0);
INSERT INTO `sys_dict` VALUES (86, '创作一首流行乐，感受都市的宁静', 'music_prompt', NULL, NULL, 0);
INSERT INTO `sys_dict` VALUES (87, '写一首关于星际旅行的歌，使用电子风格', 'music_prompt', NULL, NULL, 0);
INSERT INTO `sys_dict` VALUES (88, '创作一首充满力量的说唱，传递正能量与不屈精神', 'music_prompt', '', '', 0);
INSERT INTO `sys_dict` VALUES (89, '想要一首适合早晨起床时听的清新音乐', 'music_prompt_pure', NULL, NULL, 10);
INSERT INTO `sys_dict` VALUES (90, '适合晚上酒吧听的爵士蓝调', 'music_prompt_pure', NULL, NULL, 11);
INSERT INTO `sys_dict` VALUES (91, '适合海边看日落时听的宁静音乐', 'music_prompt_pure', NULL, NULL, 9);
INSERT INTO `sys_dict` VALUES (92, '来一首适合独自旅行时听的自由音乐', 'music_prompt_pure', NULL, NULL, 8);
INSERT INTO `sys_dict` VALUES (93, '想要一首适合冬日暖阳下的温馨音乐', 'music_prompt_pure', NULL, NULL, 7);
INSERT INTO `sys_dict` VALUES (94, '来一首适合夜晚驾车时听的动感音乐', 'music_prompt_pure', NULL, NULL, 6);
INSERT INTO `sys_dict` VALUES (95, '来一首适合团建时激发团队精神的快节奏音乐', 'music_prompt_pure', NULL, NULL, 5);
INSERT INTO `sys_dict` VALUES (96, '来一首适合工作间隙放松的轻松音乐', 'music_prompt_pure', NULL, NULL, 4);
INSERT INTO `sys_dict` VALUES (97, '一首适合骑行时听的歌', 'music_prompt_pure', NULL, NULL, 3);
INSERT INTO `sys_dict` VALUES (98, '来一首适合秋天落叶时听的感伤音乐', 'music_prompt_pure', NULL, NULL, 2);
INSERT INTO `sys_dict` VALUES (99, '适合夜晚读书时听的古典音乐', 'music_prompt_pure', '', '', 0);
INSERT INTO `sys_dict` VALUES (100, '想要一首适合家庭聚会时听的欢快音乐', 'music_prompt_pure', NULL, NULL, 1);

-- ----------------------------
-- Table structure for user_info
-- ----------------------------
DROP TABLE IF EXISTS `user_info`;
CREATE TABLE `user_info`  (
  `user_id` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户ID',
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '邮箱',
  `nick_name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '昵称',
  `avatar` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户头像',
  `password` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '密码',
  `status` tinyint(1) NULL DEFAULT NULL COMMENT '状态',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `last_login_time` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `integral` int NULL DEFAULT 0 COMMENT '积分',
  PRIMARY KEY (`user_id`) USING BTREE,
  UNIQUE INDEX `idx_key_email`(`email` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户信息' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_info
-- ----------------------------

-- ----------------------------
-- Table structure for user_integral_record
-- ----------------------------
DROP TABLE IF EXISTS `user_integral_record`;
CREATE TABLE `user_integral_record`  (
  `record_id` int NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `user_id` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户ID',
  `change_integral` int NULL DEFAULT NULL COMMENT '积分',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `record_type` tinyint NULL DEFAULT NULL COMMENT '记录类型 0:创作失败退回 1:创作消耗 2:充值 3:系统赠送',
  `business_id` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '业务ID',
  `amount` decimal(5, 2) NULL DEFAULT NULL COMMENT '充值金额',
  PRIMARY KEY (`record_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10073 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户积分记录信息' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_integral_record
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
