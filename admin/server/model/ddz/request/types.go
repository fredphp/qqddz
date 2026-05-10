package request

import (
        "encoding/json"
        "strconv"
)

// NullUint64 可接受空字符串或数字的 uint64 类型
type NullUint64 struct {
        Value uint64
        Valid bool
}

// UnmarshalJSON 自定义 JSON 解析，支持空字符串
func (n *NullUint64) UnmarshalJSON(data []byte) error {
        // 处理 null
        if string(data) == "null" {
                n.Valid = false
                return nil
        }

        // 处理空字符串
        var s string
        if err := json.Unmarshal(data, &s); err == nil {
                if s == "" {
                        n.Valid = false
                        return nil
                }
                // 尝试解析字符串数字
                val, err := strconv.ParseUint(s, 10, 64)
                if err != nil {
                        n.Valid = false
                        return nil
                }
                n.Value = val
                n.Valid = true
                return nil
        }

        // 处理数字
        var val uint64
        if err := json.Unmarshal(data, &val); err != nil {
                return err
        }
        n.Value = val
        n.Valid = true
        return nil
}

// MarshalJSON 实现 JSON 序列化
func (n NullUint64) MarshalJSON() ([]byte, error) {
        if !n.Valid {
                return []byte("null"), nil
        }
        return json.Marshal(n.Value)
}

// Ptr 返回指针，方便使用
func (n NullUint64) Ptr() *uint64 {
        if !n.Valid {
                return nil
        }
        return &n.Value
}

// NullInt 可接受空字符串或数字的 int 类型
type NullInt struct {
        Value int
        Valid bool
}

// UnmarshalJSON 自定义 JSON 解析，支持空字符串
func (n *NullInt) UnmarshalJSON(data []byte) error {
        // 处理 null
        if string(data) == "null" {
                n.Valid = false
                return nil
        }

        // 处理空字符串
        var s string
        if err := json.Unmarshal(data, &s); err == nil {
                if s == "" {
                        n.Valid = false
                        return nil
                }
                // 尝试解析字符串数字
                val, err := strconv.Atoi(s)
                if err != nil {
                        n.Valid = false
                        return nil
                }
                n.Value = val
                n.Valid = true
                return nil
        }

        // 处理数字
        var val int
        if err := json.Unmarshal(data, &val); err != nil {
                return err
        }
        n.Value = val
        n.Valid = true
        return nil
}

// MarshalJSON 实现 JSON 序列化
func (n NullInt) MarshalJSON() ([]byte, error) {
        if !n.Valid {
                return []byte("null"), nil
        }
        return json.Marshal(n.Value)
}

// Ptr 返回指针，方便使用
func (n NullInt) Ptr() *int {
        if !n.Valid {
                return nil
        }
        return &n.Value
}
