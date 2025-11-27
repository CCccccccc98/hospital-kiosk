/**
 * 台灣身分證字號驗證工具
 * 完整實作檢查碼演算法
 */

// 字母對應數字表
const LETTER_MAP = {
    'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17,
    'I': 34, 'J': 18, 'K': 19, 'L': 20, 'M': 21, 'N': 22, 'O': 35, 'P': 23,
    'Q': 24, 'R': 25, 'S': 26, 'T': 27, 'U': 28, 'V': 29, 'W': 32, 'X': 30,
    'Y': 31, 'Z': 33
};

/**
 * 驗證台灣身分證字號
 * @param {string} id - 身分證字號
 * @returns {boolean} - 是否有效
 */
export function validateTaiwanID(id) {
    // 基本格式檢查：1個英文字母 + 1個數字(1或2) + 8個數字
    const regex = /^[A-Z][12]\d{8}$/;
    if (!regex.test(id)) {
        return false;
    }

    // 取得字母對應的數字
    const letterValue = LETTER_MAP[id[0]];
    if (!letterValue) {
        return false;
    }

    // 將字母轉換為兩位數字
    const d1 = Math.floor(letterValue / 10);
    const d2 = letterValue % 10;

    // 建立完整的數字陣列
    const digits = [
        d1,
        d2,
        ...id.slice(1).split('').map(Number)
    ];

    // 權重陣列
    const weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1];

    // 計算加權總和
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
        sum += digits[i] * weights[i];
    }

    // 檢查碼驗證：總和除以 10 的餘數應為 0
    return sum % 10 === 0;
}

/**
 * 格式化身分證字號（加入空格以便閱讀）
 * @param {string} id - 身分證字號
 * @returns {string} - 格式化後的字號
 */
export function formatTaiwanID(id) {
    if (!id || id.length !== 10) return id;
    return `${id.slice(0, 1)} ${id.slice(1, 2)} ${id.slice(2)}`;
}

/**
 * 取得身分證字號的性別
 * @param {string} id - 身分證字號
 * @returns {string|null} - 'M' (男性) 或 'F' (女性)，無效則返回 null
 */
export function getGenderFromID(id) {
    if (!id || id.length < 2) return null;
    const genderDigit = id[1];
    if (genderDigit === '1') return 'M';
    if (genderDigit === '2') return 'F';
    return null;
}

/**
 * 產生測試用的有效身分證字號
 * @param {string} letter - 起始字母 (A-Z)
 * @param {string} gender - 性別 ('1' 或 '2')
 * @returns {string} - 有效的身分證字號
 */
export function generateValidID(letter = 'A', gender = '1') {
    const letterValue = LETTER_MAP[letter];
    if (!letterValue) return null;

    const d1 = Math.floor(letterValue / 10);
    const d2 = letterValue % 10;

    // 隨機產生 7 位數字
    const randomDigits = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10));

    // 計算檢查碼
    const weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    const digits = [d1, d2, parseInt(gender), ...randomDigits];

    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
        sum += digits[i] * weights[i];
    }

    const checkDigit = (10 - (sum % 10)) % 10;

    return `${letter}${gender}${randomDigits.join('')}${checkDigit}`;
}
