#  醫院自動報到系統 (Hospital Kiosk)

這是一個專為醫院設計的自助報到系統，整合了身分證掃描、掛號查詢與自動叫號功能。

##  給面試官的執行指南 (How to Run)

由於 GitHub 檔案大小限制，本儲存庫 **不包含** 醫院掛號系統.exe 執行檔。請依照以下步驟在您的電腦上執行或打包。

### 1. 下載專案
\\\ash
git clone https://github.com/CCccccccc98/hospital-kiosk.git
cd hospital-kiosk
\\\

### 2. 安裝/修復依賴 (重要！)
雖然專案已包含 
ode_modules，但因為 electron.exe 被排除，**請務必執行此步驟**來修復執行環境：
\\\ash
npm install
\\\

### 3. 啟動開發模式 (Development Mode)
如果您想直接查看執行效果：
\\\ash
npm run dev
\\\
這將會同時啟動後端伺服器與前端 Electron 視窗。

### 4. 打包成執行檔 (Build .exe)
如果您想產生 醫院掛號系統.exe：
\\\ash
npm run build
\\\
完成後，執行檔將位於 \dist-electron/win-unpacked/醫院掛號系統.exe\。

---

##  系統功能

- ** 身分證驗證**: 支援鍵盤輸入與條碼掃描模擬。
- ** 門診掛號**: 選擇科別、醫師，並即時寫入資料庫。
- ** 叫號系統**: 醫師端可進行叫號，大廳端同步顯示與語音播報。
- ** 本地資料庫**: 使用 SQLite 儲存病患與掛號資訊，無需額外設定資料庫伺服器。

##  技術架構

- **Frontend**: React 18, Vite, TailwindCSS
- **Backend**: Express.js, SQLite3
- **Desktop**: Electron
- **Tooling**: Concurrently (同時啟動前後端)

##  專案預覽

(此處可自行新增截圖)
