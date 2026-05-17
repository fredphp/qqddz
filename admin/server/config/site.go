package config

// Site 网站基础配置
type Site struct {
	// 网站名称
	Name string `mapstructure:"name" json:"name" yaml:"name"`
	// 网站Logo
	Logo string `mapstructure:"logo" json:"logo" yaml:"logo"`
	// 网站Favicon
	Favicon string `mapstructure:"favicon" json:"favicon" yaml:"favicon"`
	// 网站描述
	Description string `mapstructure:"description" json:"description" yaml:"description"`
	// 网站关键词
	Keywords string `mapstructure:"keywords" json:"keywords" yaml:"keywords"`
	// 版权信息
	Copyright string `mapstructure:"copyright" json:"copyright" yaml:"copyright"`
	// ICP备案号
	Icp string `mapstructure:"icp" json:"icp" yaml:"icp"`
	// 公安备案号
	PoliceIcp string `mapstructure:"police-icp" json:"police-icp" yaml:"police-icp"`
	// 联系电话
	Phone string `mapstructure:"phone" json:"phone" yaml:"phone"`
	// 联系邮箱
	Email string `mapstructure:"email" json:"email" yaml:"email"`
	// 联系地址
	Address string `mapstructure:"address" json:"address" yaml:"address"`
	// QQ客服
	Qq string `mapstructure:"qq" json:"qq" yaml:"qq"`
	// 微信号
	Wechat string `mapstructure:"wechat" json:"wechat" yaml:"wechat"`
	// CDN域名
	CdnDomain string `mapstructure:"cdn-domain" json:"cdn-domain" yaml:"cdn-domain"`
	// API域名
	ApiDomain string `mapstructure:"api-domain" json:"api-domain" yaml:"api-domain"`
}
