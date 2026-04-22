package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

// UserAgreement 用户协议模型
type UserAgreement struct {
	ID        uint      `json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Version   string    `json:"version"`
	Status    int       `json:"status"`
	Sort      int       `json:"sort"`
}

// UserAgreementHandler 用户协议处理器
type UserAgreementHandler struct {
	db *sql.DB
}

// NewUserAgreementHandler 创建用户协议处理器
func NewUserAgreementHandler(config *DBConfig) (*UserAgreementHandler, error) {
	if config == nil {
		return &UserAgreementHandler{db: nil}, nil
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		config.User,
		config.Password,
		config.Host,
		config.Port,
		config.Database,
	)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("连接数据库失败: %w", err)
	}

	// 测试连接
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("数据库连接测试失败: %w", err)
	}

	// 设置连接池
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(time.Hour)

	return &UserAgreementHandler{db: db}, nil
}

// Close 关闭数据库连接
func (h *UserAgreementHandler) Close() error {
	if h.db != nil {
		return h.db.Close()
	}
	return nil
}

// GetLatest 获取最新的启用的用户协议
func (h *UserAgreementHandler) GetLatest(w http.ResponseWriter, r *http.Request) {
	if h.db == nil {
		writeJSONError(w, http.StatusServiceUnavailable, "数据库未配置")
		return
	}

	var agreement UserAgreement
	query := `SELECT id, created_at, updated_at, title, content, version, status, sort
			  FROM sys_user_agreement
			  WHERE status = 1 AND deleted_at IS NULL
			  ORDER BY sort ASC, created_at DESC
			  LIMIT 1`

	err := h.db.QueryRow(query).Scan(
		&agreement.ID,
		&agreement.CreatedAt,
		&agreement.UpdatedAt,
		&agreement.Title,
		&agreement.Content,
		&agreement.Version,
		&agreement.Status,
		&agreement.Sort,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			writeJSONSuccess(w, nil)
			return
		}
		writeJSONError(w, http.StatusInternalServerError, "查询失败: "+err.Error())
		return
	}

	writeJSONSuccess(w, agreement)
}

// GetByID 根据ID获取用户协议
func (h *UserAgreementHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	if h.db == nil {
		writeJSONError(w, http.StatusServiceUnavailable, "数据库未配置")
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		writeJSONError(w, http.StatusBadRequest, "缺少id参数")
		return
	}

	var agreement UserAgreement
	query := `SELECT id, created_at, updated_at, title, content, version, status, sort
			  FROM sys_user_agreement
			  WHERE id = ? AND deleted_at IS NULL`

	err := h.db.QueryRow(query, id).Scan(
		&agreement.ID,
		&agreement.CreatedAt,
		&agreement.UpdatedAt,
		&agreement.Title,
		&agreement.Content,
		&agreement.Version,
		&agreement.Status,
		&agreement.Sort,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			writeJSONError(w, http.StatusNotFound, "用户协议不存在")
			return
		}
		writeJSONError(w, http.StatusInternalServerError, "查询失败: "+err.Error())
		return
	}

	writeJSONSuccess(w, agreement)
}

// List 获取用户协议列表
func (h *UserAgreementHandler) List(w http.ResponseWriter, r *http.Request) {
	if h.db == nil {
		writeJSONError(w, http.StatusServiceUnavailable, "数据库未配置")
		return
	}

	query := `SELECT id, created_at, updated_at, title, content, version, status, sort
			  FROM sys_user_agreement
			  WHERE deleted_at IS NULL
			  ORDER BY sort ASC, created_at DESC`

	rows, err := h.db.Query(query)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "查询失败: "+err.Error())
		return
	}
	defer rows.Close()

	var agreements []UserAgreement
	for rows.Next() {
		var agreement UserAgreement
		err := rows.Scan(
			&agreement.ID,
			&agreement.CreatedAt,
			&agreement.UpdatedAt,
			&agreement.Title,
			&agreement.Content,
			&agreement.Version,
			&agreement.Status,
			&agreement.Sort,
		)
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, "解析数据失败: "+err.Error())
			return
		}
		agreements = append(agreements, agreement)
	}

	if agreements == nil {
		agreements = []UserAgreement{}
	}

	writeJSONSuccess(w, agreements)
}

// writeJSONSuccess 写入成功响应
func writeJSONSuccess(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Code:    0,
		Message: "success",
		Data:    data,
	})
}

// writeJSONError 写入错误响应
func writeJSONError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Code:    code,
		Message: message,
	})
}
