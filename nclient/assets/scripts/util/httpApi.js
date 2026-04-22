/**
 * HTTP API 请求工具类
 * 用于与服务器HTTP API通信，支持AES-GCM加密解密
 */

var HttpAPI = {};

// AES-GCM 解密函数 (使用Web Crypto API)
HttpAPI.decryptAESGCM = function(encryptedBase64, keyString) {
    return new Promise(function(resolve, reject) {
        try {
            // Base64 解码
            var raw = atob(encryptedBase64);
            
            // 将字符串转换为Uint8Array
            var rawLength = raw.length;
            var encrypted = new Uint8Array(rawLength);
            for (var i = 0; i < rawLength; i++) {
                encrypted[i] = raw.charCodeAt(i);
            }
            
            // 获取nonce (前12字节)
            var nonce = encrypted.slice(0, 12);
            var ciphertext = encrypted.slice(12);
            
            // 准备密钥 (32字节)
            var keyBytes = new Uint8Array(32);
            for (var i = 0; i < 32 && i < keyString.length; i++) {
                keyBytes[i] = keyString.charCodeAt(i);
            }
            
            // 使用Web Crypto API解密
            crypto.subtle.importKey(
                'raw',
                keyBytes,
                { name: 'AES-GCM' },
                false,
                ['decrypt']
            ).then(function(cryptoKey) {
                return crypto.subtle.decrypt(
                    {
                        name: 'AES-GCM',
                        iv: nonce,
                        tagLength: 128
                    },
                    cryptoKey,
                    ciphertext
                );
            }).then(function(decrypted) {
                var decoder = new TextDecoder('utf-8');
                var jsonStr = decoder.decode(decrypted);
                resolve(JSON.parse(jsonStr));
            }).catch(function(err) {
                reject(err);
            });
        } catch (e) {
            reject(e);
        }
    });
};

// 发送GET请求并解密响应
HttpAPI.get = function(url, cryptoKey, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.timeout = 10000; // 10秒超时
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    
                    // 检查是否是加密响应
                    if (response.data && response.timestamp && typeof response.data === 'string') {
                        // 加密响应，需要解密
                        HttpAPI.decryptAESGCM(response.data, cryptoKey).then(function(decrypted) {
                            callback(null, decrypted);
                        }).catch(function(err) {
                            cc.error('[HttpAPI] 解密失败:', err);
                            callback('解密失败: ' + err.message, null);
                        });
                    } else {
                        // 未加密响应，直接返回
                        callback(null, response);
                    }
                } catch (e) {
                    callback('解析响应失败: ' + e.message, null);
                }
            } else {
                callback('请求失败: ' + xhr.status, null);
            }
        }
    };
    
    xhr.onerror = function() {
        callback('网络错误', null);
    };
    
    xhr.ontimeout = function() {
        callback('请求超时', null);
    };
    
    xhr.send();
};

// 发送POST请求
HttpAPI.post = function(url, data, cryptoKey, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.timeout = 10000; // 10秒超时
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    
                    // 检查是否是加密响应
                    if (response.data && response.timestamp && typeof response.data === 'string') {
                        // 加密响应，需要解密
                        HttpAPI.decryptAESGCM(response.data, cryptoKey).then(function(decrypted) {
                            callback(null, decrypted);
                        }).catch(function(err) {
                            cc.error('[HttpAPI] 解密失败:', err);
                            callback('解密失败: ' + err.message, null);
                        });
                    } else {
                        // 未加密响应，直接返回
                        callback(null, response);
                    }
                } catch (e) {
                    callback('解析响应失败: ' + e.message, null);
                }
            } else {
                callback('请求失败: ' + xhr.status, null);
            }
        }
    };
    
    xhr.onerror = function() {
        callback('网络错误', null);
    };
    
    xhr.ontimeout = function() {
        callback('请求超时', null);
    };
    
    xhr.send(JSON.stringify(data || {}));
};

// 获取用户协议（带缓存）
HttpAPI.getUserAgreement = function(apiUrl, cryptoKey, callback) {
    // 检查内存缓存
    if (HttpAPI._userAgreementCache) {
        callback(null, HttpAPI._userAgreementCache);
        return;
    }
    
    // 尝试从localStorage加载缓存
    try {
        var cached = localStorage.getItem('user_agreement_cache');
        if (cached) {
            var cacheData = JSON.parse(cached);
            HttpAPI._userAgreementCache = cacheData;
            callback(null, cacheData);
            return;
        }
    } catch (e) {
        // 忽略缓存错误
    }
    
    // 从服务器获取（带解密）
    HttpAPI.get(
        apiUrl + '/api/v1/user-agreement/latest',
        cryptoKey,
        function(err, result) {
            if (err) {
                callback(err, null);
                return;
            }
            
            // result 已经是解密后的数据
            if (result && result.code === 0 && result.data) {
                // 缓存结果
                HttpAPI._userAgreementCache = result.data;
                try {
                    localStorage.setItem('user_agreement_cache', JSON.stringify(result.data));
                } catch (e) {
                    // 忽略缓存错误
                }
                callback(null, result.data);
            } else if (result && result.data) {
                // 兼容解密后直接返回data的情况
                HttpAPI._userAgreementCache = result.data;
                try {
                    localStorage.setItem('user_agreement_cache', JSON.stringify(result.data));
                } catch (e) {
                    // 忽略缓存错误
                }
                callback(null, result.data);
            } else {
                callback(result ? result.message : '获取用户协议失败', null);
            }
        }
    );
};

// 清除用户协议缓存
HttpAPI.clearUserAgreementCache = function() {
    HttpAPI._userAgreementCache = null;
    try {
        localStorage.removeItem('user_agreement_cache');
    } catch (e) {
        // 忽略错误
    }
};

// 用户登录
HttpAPI.login = function(apiUrl, account, password, callback) {
    var url = apiUrl + '/api/user/login';
    var data = {
        account: account,
        password: password
    };
    
    HttpAPI.post(url, data, null, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        
        if (result && result.code === 0) {
            callback(null, result.data);
        } else {
            callback(result ? result.message : '登录失败', null);
        }
    });
};

// 游客登录
HttpAPI.guestLogin = function(apiUrl, callback) {
    var url = apiUrl + '/api/user/guest-login';
    
    HttpAPI.post(url, {}, null, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        
        if (result && result.code === 0) {
            callback(null, result.data);
        } else {
            callback(result ? result.message : '游客登录失败', null);
        }
    });
};

// 用户注册
HttpAPI.register = function(apiUrl, account, password, nickname, callback) {
    var url = apiUrl + '/api/user/register';
    var data = {
        account: account,
        password: password,
        nickname: nickname || account
    };
    
    HttpAPI.post(url, data, null, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        
        if (result && result.code === 0) {
            callback(null, result.data);
        } else {
            callback(result ? result.message : '注册失败', null);
        }
    });
};

// 获取用户信息
HttpAPI.getUserInfo = function(apiUrl, token, callback) {
    var url = apiUrl + '/api/user/info';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.timeout = 10000;
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    if (response.code === 0) {
                        callback(null, response.data);
                    } else {
                        callback(response.message, null);
                    }
                } catch (e) {
                    callback('解析响应失败', null);
                }
            } else {
                callback('请求失败: ' + xhr.status, null);
            }
        }
    };
    
    xhr.onerror = function() {
        callback('网络错误', null);
    };
    
    xhr.send();
};

// 创建房间
HttpAPI.createRoom = function(apiUrl, token, roomConfig, callback) {
    var url = apiUrl + '/api/room/create';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.timeout = 10000;
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    if (response.code === 0) {
                        callback(null, response.data);
                    } else {
                        callback(response.message, null);
                    }
                } catch (e) {
                    callback('解析响应失败', null);
                }
            } else {
                callback('请求失败: ' + xhr.status, null);
            }
        }
    };
    
    xhr.onerror = function() {
        callback('网络错误', null);
    };
    
    xhr.send(JSON.stringify(roomConfig || {}));
};

// 加入房间
HttpAPI.joinRoom = function(apiUrl, token, roomId, callback) {
    var url = apiUrl + '/api/room/join';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.timeout = 10000;
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    if (response.code === 0) {
                        callback(null, response.data);
                    } else {
                        callback(response.message, null);
                    }
                } catch (e) {
                    callback('解析响应失败', null);
                }
            } else {
                callback('请求失败: ' + xhr.status, null);
            }
        }
    };
    
    xhr.onerror = function() {
        callback('网络错误', null);
    };
    
    xhr.send(JSON.stringify({ roomId: roomId }));
};

// 设置全局变量
if (typeof window !== 'undefined') {
    window.HttpAPI = HttpAPI;
}

// 模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HttpAPI;
}

cc.log('[HttpAPI] HTTP API 工具类加载完成');
