# 📋 COPY/PASTE ĐƠN GIẢN NHẤT

## ⚡ CÁCH NHANH NHẤT: Tạo 2 node bằng UI

---

## 📦 NODE 1: "Preserve Data"

### Tạo node:
1. Click node "Convert to File" → Click dấu **+** bên phải
2. Tìm và chọn **"Set"**
3. Đổi tên thành: `Preserve Data`

### Copy/Paste config:

**Field 1:**
```
Type: String
Name: title
Value (copy đoạn này): ={{ $('Edit Fields').item.json.title }}
```

**Field 2:**
```
Type: String
Name: Token
Value (copy đoạn này): ={{ $('Edit Fields').item.json.Token }}
```

**Bật Options:**
- Click biểu tượng ⚙️ (Settings/Options)
- Tìm "Include Other Fields"
- Bật thành **ON** ✅

---

## 🌐 NODE 2: "Get Fresh Presigned URL"

### Tạo node:
1. Click node "Preserve Data" → Click dấu **+** bên phải
2. Tìm và chọn **"HTTP Request"**
3. Đổi tên thành: `Get Fresh Presigned URL`

### Copy/Paste config:

**Method & URL:**
```
Method: GET
URL (copy đoạn này): https://vbee.vn/api/v1/files/presigned-url-for-uploading
```

**Query Parameters (bật "Send Query"):**
```
extension = srt
directory = subtitles
fileName = ={{ $json.title }}
```

**Headers (bật "Send Headers"):**

Copy từng dòng sau vào từng header:

```
Name: accept
Value: application/json, text/plain, */*
```

```
Name: accept-language
Value: vi,vi-VN;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5
```

```
Name: authorization
Value: ={{ $json.Token }}
```

```
Name: origin
Value: https://studio.vbee.vn
```

```
Name: priority
Value: u=1, i
```

```
Name: referer
Value: https://studio.vbee.vn/
```

```
Name: sec-ch-ua
Value: "Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"
```

```
Name: sec-ch-ua-mobile
Value: ?0
```

```
Name: sec-ch-ua-platform
Value: "Windows"
```

```
Name: sec-fetch-dest
Value: empty
```

```
Name: sec-fetch-mode
Value: cors
```

```
Name: sec-fetch-site
Value: same-site
```

```
Name: user-agent
Value: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36
```

**Bật Options:**
- Click biểu tượng ⚙️
- Tìm "Include Other Fields"
- Bật thành **ON** ✅

---

## ✏️ SỬA NODE "Put data"

1. Click vào node **"Put data"**
2. Tìm trường **URL**
3. **XÓA** giá trị cũ (toàn bộ)
4. **PASTE** giá trị mới:

```
={{ $json.result.url }}
```

5. Click **Save**

---

## 🔗 KẾT NỐI

### Xóa connection cũ:
- Xóa line từ "Convert to File" → "Put data"

### Tạo connections mới:
```
Convert to File → Preserve Data
Preserve Data → Get Fresh Presigned URL
Get Fresh Presigned URL → Put data
```

---

## ✅ TEST

1. Click "Execute Workflow"
2. Kiểm tra từng node:
   - ✓ Convert to File: Có binary data
   - ✓ Preserve Data: Output có `title` và `Token`
   - ✓ Get Fresh Presigned URL: Output có `result.url`
   - ✓ Put data: Upload thành công (200 OK)

---

## 🎯 NHANH HƠN NỮA: Copy Headers hàng loạt

Thay vì tạo từng header, bạn có thể:

1. Trong node "Get Fresh Presigned URL"
2. Click "Headers"
3. Click "Add Multiple Parameters"
4. Paste đoạn này:

```json
[
  {"name": "accept", "value": "application/json, text/plain, */*"},
  {"name": "accept-language", "value": "vi,vi-VN;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5"},
  {"name": "authorization", "value": "={{ $json.Token }}"},
  {"name": "origin", "value": "https://studio.vbee.vn"},
  {"name": "priority", "value": "u=1, i"},
  {"name": "referer", "value": "https://studio.vbee.vn/"},
  {"name": "sec-ch-ua", "value": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\""},
  {"name": "sec-ch-ua-mobile", "value": "?0"},
  {"name": "sec-ch-ua-platform", "value": "\"Windows\""},
  {"name": "sec-fetch-dest", "value": "empty"},
  {"name": "sec-fetch-mode", "value": "cors"},
  {"name": "sec-fetch-site", "value": "same-site"},
  {"name": "user-agent", "value": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"}
]
```

*(Lưu ý: Một số version n8n có thể không hỗ trợ "Add Multiple Parameters", trong trường hợp đó hãy thêm từng header thủ công)*

---

## 🔥 LƯU Ý QUAN TRỌNG

**1. Expression phải chính xác:**
- `={{ $('Edit Fields').item.json.title }}` (CÓ dấu =)
- `={{ $json.Token }}` (CÓ dấu =)
- `={{ $json.result.url }}` (CÓ dấu =)

**2. Include Other Fields phải BẬT:**
- Cả 2 node mới phải bật "Include Other Fields" = ON
- Nếu không bật → Mất binary data → Lỗi!

**3. Connection phải đúng thứ tự:**
```
Convert to File
  → Preserve Data
    → Get Fresh Presigned URL
      → Put data
```

---

## 📸 Kiểm tra nhanh

Sau khi setup xong, click "Execute Workflow" và xem output:

**Preserve Data output:**
```json
{
  "title": "final 2025-11-15-11-30-45",
  "Token": "Bearer eyJhbGci...",
  "data": {...}  // ← Binary data phải có!
}
```

**Get Fresh Presigned URL output:**
```json
{
  "result": {
    "url": "https://s3.amazonaws.com/..."  // ← URL mới!
  },
  "title": "...",
  "Token": "...",
  "data": {...}  // ← Binary data vẫn còn!
}
```

**Put data:**
- Status: 200 OK ✅
- Không còn lỗi "Request has expired"

---

## 🆘 Gặp lỗi?

**"Cannot read property 'item'"**
→ Sửa `$('Edit Fields').item.json` thành `$('Edit Fields').first().json`

**"Missing authorization header"**
→ Kiểm tra node "Edit Fields" có field `Token` không

**"Binary data is empty"**
→ Kiểm tra "Include Other Fields" = ON

**Vẫn lỗi "Request has expired"**
→ Kiểm tra URL trong "Put data" = `{{ $json.result.url }}` (không có $('1. Get Presigned URL1'))

---

✅ **HOÀN THÀNH!** Workflow giờ đã sửa xong lỗi presigned URL!
