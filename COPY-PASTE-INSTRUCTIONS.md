# 🚀 HƯỚNG DẪN COPY/PASTE NHANH - SỬA LỖI N8N

## 🎯 CÁCH 1: IMPORT TRỰC TIẾP VÀO WORKFLOW JSON (KHUYẾN NGHỊ)

### Bước 1: Export workflow hiện tại
1. Mở workflow trong n8n
2. Click **⋮** (3 chấm) góc trên bên phải
3. Chọn **"Download"**
4. Lưu file JSON (ví dụ: `my-workflow.json`)

### Bước 2: Mở file JSON bằng text editor
Dùng VS Code, Notepad++, hoặc bất kỳ text editor nào

### Bước 3: Tìm section `"nodes":`
Tìm dòng có nội dung:
```json
  "nodes": [
```

### Bước 4: Thêm 2 node mới
Sau node `"Convert to File"` (tìm node có `"name": "Convert to File"`), thêm dấu phẩy và paste 2 node sau:

```json
    ,
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "preserve-title-001",
              "name": "title",
              "value": "={{ $('Edit Fields').item.json.title }}",
              "type": "string"
            },
            {
              "id": "preserve-token-002",
              "name": "Token",
              "value": "={{ $('Edit Fields').item.json.Token }}",
              "type": "string"
            }
          ]
        },
        "options": {
          "includeOtherFields": true
        }
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        -3000,
        368
      ],
      "id": "new-preserve-data-node-001",
      "name": "Preserve Data"
    },
    {
      "parameters": {
        "url": "https://vbee.vn/api/v1/files/presigned-url-for-uploading",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "extension",
              "value": "srt"
            },
            {
              "name": "directory",
              "value": "subtitles"
            },
            {
              "name": "fileName",
              "value": "={{ $json.title }}"
            }
          ]
        },
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "accept",
              "value": "application/json, text/plain, */*"
            },
            {
              "name": "accept-language",
              "value": "vi,vi-VN;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5"
            },
            {
              "name": "authorization",
              "value": "={{ $json.Token }}"
            },
            {
              "name": "origin",
              "value": "https://studio.vbee.vn"
            },
            {
              "name": "priority",
              "value": "u=1, i"
            },
            {
              "name": "referer",
              "value": "https://studio.vbee.vn/"
            },
            {
              "name": "sec-ch-ua",
              "value": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\""
            },
            {
              "name": "sec-ch-ua-mobile",
              "value": "?0"
            },
            {
              "name": "sec-ch-ua-platform",
              "value": "\"Windows\""
            },
            {
              "name": "sec-fetch-dest",
              "value": "empty"
            },
            {
              "name": "sec-fetch-mode",
              "value": "cors"
            },
            {
              "name": "sec-fetch-site",
              "value": "same-site"
            },
            {
              "name": "user-agent",
              "value": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
            }
          ]
        },
        "options": {
          "includeOtherFields": true
        }
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        -2880,
        368
      ],
      "id": "new-get-fresh-url-node-002",
      "name": "Get Fresh Presigned URL"
    }
```

### Bước 5: Sửa node "Put data"
Tìm node `"Put data"` (có `"name": "Put data"`), tìm dòng:
```json
"url": "={{ $('1. Get Presigned URL1').item.json.result.url }}"
```

Đổi thành:
```json
"url": "={{ $json.result.url }}"
```

### Bước 6: Thêm connections
Tìm section `"connections":`, tìm đoạn:
```json
    "Convert to File": {
      "main": [
        [
          {
            "node": "Put data",
            ...
```

Đổi thành:
```json
    "Convert to File": {
      "main": [
        [
          {
            "node": "Preserve Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Preserve Data": {
      "main": [
        [
          {
            "node": "Get Fresh Presigned URL",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get Fresh Presigned URL": {
      "main": [
        [
          {
            "node": "Put data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
```

### Bước 7: Import lại
1. Lưu file JSON đã sửa
2. Trong n8n, tạo workflow mới hoặc mở workflow cũ
3. Click **⋮** → **"Import from File"**
4. Chọn file JSON đã sửa
5. Click **"Save"**

---

## 🎯 CÁCH 2: TẠO NODE BẰNG TAY TRONG UI (ĐƠN GIẢN HƠN)

### NODE 1: "Preserve Data"

1. Click vào node **"Convert to File"**
2. Click nút **"+"** bên phải
3. Chọn **"Set"** (Data Transformation)
4. Đổi tên thành: **"Preserve Data"**
5. Copy/paste config sau:

**Field 1:**
- Type: `String`
- Name: `title`
- Value: Copy đoạn này → `={{ $('Edit Fields').item.json.title }}`

**Field 2:**
- Type: `String`
- Name: `Token`
- Value: Copy đoạn này → `={{ $('Edit Fields').item.json.Token }}`

**Options:**
- Click gear icon (⚙️)
- Bật **"Include Other Fields"** = ON

6. Click **"Execute Node"** để test
7. Click **"Save"**

---

### NODE 2: "Get Fresh Presigned URL"

1. Click vào node **"Preserve Data"** vừa tạo
2. Click nút **"+"** bên phải
3. Chọn **"HTTP Request"**
4. Đổi tên thành: **"Get Fresh Presigned URL"**
5. Copy/paste config sau:

**Basic Settings:**
- Method: `GET`
- URL: Copy → `https://vbee.vn/api/v1/files/presigned-url-for-uploading`

**Query Parameters:**
- Click "Add Query"
- Bật **"Send Query"**
- Thêm 3 parameters:
  1. Name: `extension` | Value: `srt`
  2. Name: `directory` | Value: `subtitles`
  3. Name: `fileName` | Value: Copy → `={{ $json.title }}`

**Headers:**
- Click "Add Header"
- Bật **"Send Headers"**
- Copy/paste từng dòng sau:

```
accept = application/json, text/plain, */*
accept-language = vi,vi-VN;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5
authorization = ={{ $json.Token }}
origin = https://studio.vbee.vn
priority = u=1, i
referer = https://studio.vbee.vn/
sec-ch-ua = "Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"
sec-ch-ua-mobile = ?0
sec-ch-ua-platform = "Windows"
sec-fetch-dest = empty
sec-fetch-mode = cors
sec-fetch-site = same-site
user-agent = Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36
```

**Options:**
- Click gear icon (⚙️)
- Bật **"Include Other Fields"** = ON

6. Click **"Execute Node"** để test
7. Click **"Save"**

---

### SỬA NODE "Put data"

1. Click vào node **"Put data"**
2. Tìm trường **"URL"**
3. Xóa giá trị cũ: `={{ $('1. Get Presigned URL1').item.json.result.url }}`
4. Copy/paste giá trị mới: `={{ $json.result.url }}`
5. Click **"Save"**

---

### KẾT NỐI CÁC NODE

1. **Xóa** connection cũ từ "Convert to File" → "Put data"
2. **Kết nối mới:**
   - "Convert to File" → "Preserve Data"
   - "Preserve Data" → "Get Fresh Presigned URL"
   - "Get Fresh Presigned URL" → "Put data"

---

## ✅ KIỂM TRA

1. Click **"Execute Workflow"**
2. Xem execution flow:
   ```
   Convert to File (✓)
      ↓
   Preserve Data (✓) - Xem output có title và Token
      ↓
   Get Fresh Presigned URL (✓) - Xem output có result.url
      ↓
   Put data (✓) - Upload thành công!
   ```

3. Nếu thấy lỗi "Request has expired" → Kiểm tra lại URL trong "Put data"

---

## 🔥 TROUBLESHOOTING

**Lỗi: "Cannot read property 'item' of undefined"**
→ Sửa expression từ `$('Edit Fields').item.json` thành `$('Edit Fields').first().json`

**Lỗi: "Unauthorized 401"**
→ Token đã hết hạn, cập nhật Token mới trong node "Edit Fields"

**Lỗi: Không có binary data**
→ Kiểm tra "Include Other Fields" = ON ở cả 2 node mới

**Lỗi: Vẫn còn "Request has expired"**
→ Kiểm tra URL trong "Put data" phải là `={{ $json.result.url }}` (KHÔNG có $('1. Get Presigned URL1'))

---

## 📞 Cần hỗ trợ?
Gửi screenshot lỗi hoặc export workflow để được hỗ trợ nhanh hơn.
