#  醫院自動報到系統 (Hospital Kiosk)

一個基於 Electron + React + Express 的醫院自助報到系統，提供病患快速掛號與報到服務。

---

##  快速開始 (給面試官)

### 方法 1: 下載執行檔 (最簡單)

1. 前往 **[Releases 頁面](https://github.com/CCccccccc98/hospital-kiosk/releases)**
2. 下載最新版本的 `醫院掛號系統.exe`
3. 雙擊執行即可

>  如果 Windows 顯示安全警告，請點擊「仍要執行」

---

### 方法 2: 從原始碼執行

####  前置需求
- Node.js 18+ (建議使用 v20)
- npm 或 yarn

####  安裝步驟

```bash
# 1. Clone 專案
git clone https://github.com/CCccccccc98/hospital-kiosk.git
cd hospital-kiosk

# 2. 安裝依賴 (前端 + 後端)
npm install
cd server
npm install
cd ..

# 3. 啟動應用程式
npm run dev:fullstack
```

應用程式會自動在 Electron 視窗中開啟，同時啟動後端伺服器。

---

##  系統功能

- ** 身分證驗證**: 支援鍵盤輸入與條碼掃描模擬
- ** 門診掛號**: 選擇科別、醫師，並即時寫入資料庫
- ** 叫號系統**: 醫師端可進行叫號，大廳端同步顯示與語音播報
- ** 本地資料庫**: 使用 SQLite 儲存病患與掛號資訊

---

##  技術架構

- **Frontend**: React 18, Vite, TailwindCSS
- **Backend**: Express.js, SQLite3
- **Desktop**: Electron
- **Build Tool**: electron-builder

---

##  專案結構

```
hospital-kiosk/
 src/                    # 前端 React 程式碼
    components/         # React 元件
    App.jsx            # 主應用程式
 server/                 # 後端 Express 伺服器
    server.js          # 伺服器主程式
    hospital.db        # SQLite 資料庫
 electron.cjs           # Electron 主程序
 package.json           # 專案設定
 vite.config.js         # Vite 設定
```

---

##  常見問題

### Q: 執行 `npm run dev:fullstack` 後沒有反應？
A: 請確認：
1. 已經在 `server/` 資料夾執行過 `npm install`
2. Port 3000 和 5173 沒有被其他程式佔用

### Q: Windows 顯示「無法執行此應用程式」？
A: 請右鍵點擊 exe  內容  解除封鎖

### Q: 如何重新建置 exe？
A: 執行 `npm run electron:build`，產生的 exe 會在 `dist-electron/` 資料夾

---

##  開發指令

```bash
# 僅啟動前端開發伺服器
npm run dev

# 啟動完整應用程式 (前端 + 後端 + Electron)
npm run dev:fullstack

# 建置前端
npm run build

# 打包成執行檔
npm run electron:build
```

---

##  授權

MIT License
