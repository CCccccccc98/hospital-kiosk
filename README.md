# 醫院報到系統 - 使用說明

## 🚀 快速開始

### 方式一：執行打包好的應用程式

**面試官或展示使用**，不需要安裝 Node.js 或任何依賴：

1. 執行打包指令（開發者）：
```bash
npm run electron:build
```

2. 打包完成後，執行檔位於：
```
dist-electron\win-unpacked\醫院掛號系統.exe
```

3. 雙擊執行檔即可啟動，前端和後端會自動啟動

> 詳細使用說明請參考 [面試官使用指南.md](./面試官使用指南.md)

---

### 方式二：開發模式（需要 Node.js）

**適合開發和測試**：

#### 安裝依賴
```bash
npm install
```

### 1. 安裝後端依賴
```bash
cd server
npm install
```

### 2. 啟動後端伺服器
```bash
cd server
npm start
```
伺服器將在 `http://localhost:3001` 啟動

### 3. 啟動前端 (新終端)
```bash
npm run dev
```
前端將在 `http://localhost:5173` 啟動

## 📋 測試用資料

### 有效的身分證字號 (已在資料庫中)
- `A123456789` - 陳小美
- `B234567890` - 林志豪
- `C345678901` - 張雅婷
- `D456789012` - 王大明
- `E567890123` - 李國華

### 診間資訊
系統預設有 6 個診間：
- 內科一診 - 李大衛 醫師
- 內科二診 - 陳淑芬 醫師
- 外科一診 - 王建國 醫師
- 外科二診 - 林美玲 醫師
- 兒科一診 - 張小寶 醫師
- 眼科一診 - 劉光明 醫師

## 🔧 API 端點

- `GET /api/clinics` - 取得所有診間資訊
- `GET /api/patients/:id` - 查詢患者資料
- `POST /api/checkin` - 執行報到
- `POST /api/call-next` - 叫號
- `GET /api/logs` - 查看操作日誌
- `GET /health` - 健康檢查

## ✨ 主要改進

### P0 - 已完成
✅ **後端 API 系統**
- Express.js + SQLite 資料庫
- RESTful API 設計
- 資料持久化

✅ **身分證驗證**
- 完整的台灣身分證檢查碼演算法
- 格式驗證

✅ **號碼牌邏輯修正**
- 資料庫自增序列
- 確保號碼唯一性

### P1 - 已完成
✅ **錯誤處理**
- API 錯誤處理
- React 錯誤邊界
- 用戶友善錯誤訊息

✅ **操作日誌**
- 報到記錄
- 叫號記錄
- 時間戳記

## 🎯 測試流程

### 1. 患者報到
1. 進入「患者報到」
2. 輸入身分證字號 (例如: A123456789)
3. 選擇診間
4. 確認報到
5. 取得號碼牌

### 2. 醫師叫號
1. 進入「醫師控制台」
2. 選擇診間
3. 點擊「叫號」
4. 號碼遞增，候診人數減少

### 3. 查看進度
1. 進入「即時看診進度」
2. 查看所有診間的當前號碼和候診人數

## 🔒 安全性改進

- ✅ 身分證格式驗證
- ✅ 重複報到檢查
- ✅ 診間人數上限
- ✅ API 錯誤處理
- ⚠️ 待加入：醫師權限驗證

## 📊 資料庫結構

### patients (患者)
- id (身分證字號)
- name (姓名)
- phone (電話)

### clinics (診間)
- id
- name (醫師姓名)
- dept (科別)
- current (當前號碼)
- waiting (候診人數)
- last_ticket (最後號碼)

### checkin_records (報到記錄)
- patient_id
- clinic_id
- ticket_number
- status
- created_at
- called_at

### operation_logs (操作日誌)
- action
- clinic_id
- patient_id
- ticket_number
- details
- created_at
