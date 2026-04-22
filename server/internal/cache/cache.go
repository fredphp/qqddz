// Package cache 提供内存缓存功能
package cache

import (
	"sync"
	"time"
)

// CacheItem 缓存项
type CacheItem struct {
	Value      interface{}
	ExpireAt   time.Time
	Expiration time.Duration
}

// IsExpired 检查是否过期
func (item *CacheItem) IsExpired() bool {
	return time.Now().After(item.ExpireAt)
}

// Cache 内存缓存
type Cache struct {
	items map[string]*CacheItem
	mu    sync.RWMutex
}

// globalCache 全局缓存实例
var globalCache *Cache
var once sync.Once

// GetCache 获取全局缓存实例
func GetCache() *Cache {
	once.Do(func() {
		globalCache = &Cache{
			items: make(map[string]*CacheItem),
		}
		// 启动后台清理协程
		go globalCache.cleanupExpired()
	})
	return globalCache
}

// Set 设置缓存
func (c *Cache) Set(key string, value interface{}, expiration time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items[key] = &CacheItem{
		Value:      value,
		ExpireAt:   time.Now().Add(expiration),
		Expiration: expiration,
	}
}

// Get 获取缓存
func (c *Cache) Get(key string) (interface{}, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	item, exists := c.items[key]
	if !exists {
		return nil, false
	}

	if item.IsExpired() {
		return nil, false
	}

	return item.Value, true
}

// Delete 删除缓存
func (c *Cache) Delete(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.items, key)
}

// DeleteByPrefix 删除指定前缀的所有缓存
func (c *Cache) DeleteByPrefix(prefix string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	for key := range c.items {
		if len(key) >= len(prefix) && key[:len(prefix)] == prefix {
			delete(c.items, key)
		}
	}
}

// Clear 清空所有缓存
func (c *Cache) Clear() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items = make(map[string]*CacheItem)
}

// cleanupExpired 定期清理过期缓存
func (c *Cache) cleanupExpired() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		c.mu.Lock()
		for key, item := range c.items {
			if item.IsExpired() {
				delete(c.items, key)
			}
		}
		c.mu.Unlock()
	}
}

// GetOrSet 获取缓存，如果不存在则执行函数并缓存结果
func (c *Cache) GetOrSet(key string, fn func() (interface{}, error), expiration time.Duration) (interface{}, error) {
	// 先尝试读取
	if value, exists := c.Get(key); exists {
		return value, nil
	}

	// 执行函数获取数据
	value, err := fn()
	if err != nil {
		return nil, err
	}

	// 缓存结果
	c.Set(key, value, expiration)

	return value, nil
}

// Keys 获取所有缓存键
func (c *Cache) Keys() []string {
	c.mu.RLock()
	defer c.mu.RUnlock()

	keys := make([]string, 0, len(c.items))
	for key := range c.items {
		keys = append(keys, key)
	}
	return keys
}

// Size 获取缓存大小
func (c *Cache) Size() int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return len(c.items)
}
