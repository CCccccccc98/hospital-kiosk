#  醫院自動報到系統 (Hospital Kiosk)

一個基於 Electron + React + Express 的醫院自助報到系統，提供病患快速掛號與報到服務。

##  快速體驗 (For Interviewer)

如果您只想觀看作品展示，請直接下載執行檔：

1. 前往 **[Releases 頁面](../../releases)** (請點擊右側的 Releases)
2. 下載最新版本的 \醫院掛號系統.exe\
3. 雙擊即可執行 (無需安裝任何環境)

---

##  開發者指南 (For Developers)

如果您想查看原始碼或進行開發：

### 1. 下載專案
\\\ash
git clone https://github.com/CCccccccc98/hospital-kiosk.git
cd hospital-kiosk
\\\

### 2. 安裝依賴
\\\ash
npm install
\\\

### 3. 啟動開發模式
\\\ash
npm run dev
\\\

##  系統功能

- ** 身分證驗證**: 支援鍵盤輸入與條碼掃描模擬。
- ** 門診掛號**: 選擇科別、醫師，並即時寫入資料庫。
- ** 叫號系統**: 醫師端可進行叫號，大廳端同步顯示與語音播報。
- ** 本地資料庫**: 使用 SQLite 儲存病患與掛號資訊。

##  技術架構

- **Frontend**: React 18, Vite, TailwindCSS
- **Backend**: Express.js, SQLite3
- **Desktop**: Electron
