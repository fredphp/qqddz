-- 用户协议表
-- 适用于 gin-vue-admin 后台管理系统
-- Date: 2026-04-22

-- ----------------------------
-- Table structure for sys_user_agreement
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_agreement`;
CREATE TABLE `sys_user_agreement` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `created_at` datetime(3) DEFAULT NULL COMMENT '创建时间',
  `updated_at` datetime(3) DEFAULT NULL COMMENT '更新时间',
  `deleted_at` datetime(3) DEFAULT NULL COMMENT '删除时间',
  `title` varchar(255) NOT NULL COMMENT '协议标题',
  `content` longtext COMMENT '协议内容',
  `version` varchar(50) DEFAULT NULL COMMENT '版本号',
  `status` int DEFAULT 1 COMMENT '状态(1:启用,0:禁用)',
  `sort` int DEFAULT 0 COMMENT '排序',
  PRIMARY KEY (`id`),
  KEY `idx_sys_user_agreement_deleted_at` (`deleted_at`),
  KEY `idx_sys_user_agreement_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户协议表';

-- ----------------------------
-- 初始化用户协议数据
-- ----------------------------
INSERT INTO `sys_user_agreement` (`created_at`, `updated_at`, `title`, `content`, `version`, `status`, `sort`) 
VALUES (
  NOW(), 
  NOW(), 
  '用户协议', 
  '<h1>用户协议</h1>
<p><strong>最后更新日期：2026年4月22日</strong></p>

<h2>一、服务条款的确认和接纳</h2>
<p>欢迎使用我们的斗地主游戏服务。在使用本服务前，请您仔细阅读以下条款。使用本服务即表示您同意遵守这些条款。</p>

<h2>二、用户注册</h2>
<p>1. 用户应按照注册页面提示完成注册流程。您应当对注册信息的真实性、合法性负责。</p>
<p>2. 您注册成功后，将获得一个账号和密码。您应妥善保管账号和密码，并对以您的账号进行的所有活动负责。</p>

<h2>三、使用规则</h2>
<p>1. 用户不得利用本服务从事违法活动。</p>
<p>2. 用户不得干扰本服务的正常运行。</p>
<p>3. 用户不得侵犯他人的合法权益。</p>

<h2>四、知识产权</h2>
<p>本游戏的所有内容，包括但不限于文字、图片、音频、视频、软件等，均受知识产权法律保护。</p>

<h2>五、免责声明</h2>
<p>1. 本服务按"现状"提供，不提供任何形式的担保。</p>
<p>2. 对于因使用本服务而产生的任何直接或间接损失，我们不承担责任。</p>

<h2>六、条款修改</h2>
<p>我们保留随时修改本协议的权利。修改后的协议将在本页面公布，敬请关注。</p>

<h2>七、联系我们</h2>
<p>如有任何问题，请通过游戏内的客服系统联系我们。</p>', 
  'v1.0.0', 
  1, 
  1
);

-- ----------------------------
-- 添加菜单
-- ----------------------------
INSERT INTO `sys_base_menus` (`created_at`, `updated_at`, `menu_level`, `parent_id`, `path`, `name`, `hidden`, `component`, `sort`, `keep_alive`, `default_menu`, `title`, `icon`, `close_tab`) 
VALUES (NOW(), NOW(), 0, 0, 'userAgreement', 'userAgreement', 0, 'view/biz/userAgreement/userAgreement.vue', 999, 0, 0, '用户协议', 'document', 0);

-- 获取新插入的菜单ID
SET @menu_id = LAST_INSERT_ID();

-- ----------------------------
-- 为管理员角色添加菜单权限
-- ----------------------------
INSERT INTO `sys_authority_menus` (`sys_authority_authority_id`, `sys_base_menu_id`) 
SELECT '888', @menu_id FROM DUAL WHERE NOT EXISTS (
  SELECT 1 FROM `sys_authority_menus` WHERE `sys_base_menu_id` = @menu_id AND `sys_authority_authority_id` = '888'
);

-- ----------------------------
-- 添加API权限 (casbin_rule)
-- ----------------------------
INSERT INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`, `v3`, `v4`, `v5`) VALUES
('p', '888', '/sysUserAgreement/createSysUserAgreement', 'POST', '', '', ''),
('p', '888', '/sysUserAgreement/deleteSysUserAgreement', 'DELETE', '', '', ''),
('p', '888', '/sysUserAgreement/deleteSysUserAgreementByIds', 'DELETE', '', '', ''),
('p', '888', '/sysUserAgreement/updateSysUserAgreement', 'PUT', '', '', ''),
('p', '888', '/sysUserAgreement/findSysUserAgreement', 'GET', '', '', ''),
('p', '888', '/sysUserAgreement/getSysUserAgreementList', 'GET', '', '', ''),
('p', '888', '/sysUserAgreement/setUserAgreementStatus', 'PUT', '', '', '');

-- 公开接口（不需要登录）
INSERT INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`, `v3`, `v4`, `v5`) VALUES
('p', '888', '/sysUserAgreement/getLatestUserAgreement', 'GET', '', '', '');
