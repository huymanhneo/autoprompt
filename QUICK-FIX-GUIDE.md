# 🔧 HƯỚNG DẪN SỬA LỖI NHANH - REQUEST HAS EXPIRED

## ⚡ TÓM TẮT VẤN ĐỀ
Presigned URL từ Vbee hết hạn sau 3 phút, nhưng workflow của bạn xử lý lâu hơn → Upload bị lỗi 403.

## ✅ GIẢI PHÁP (5 PHÚT)
Lấy presigned URL MỚI ngay trước khi upload thay vì dùng URL cũ.

---

## 📋 THỰC HIỆN TRONG N8N

### BƯỚC 1: Thêm node "Preserve Data"
1. Mở workflow trong n8n
2. Click vào node **"Convert to File"**
3. Click nút **"+"** bên phải node này
4. Chọn **"Set"** (Data transformation)
5. Đổi tên node thành: **"Preserve Data"**
6. Cấu hình:
   - Click **"Add Field"**
   - Chọn **String**, đặt tên: `title`, giá trị: `{{ $('Edit Fields').item.json.title }}`
   - Click **"Add Field"** lần nữa
   - Chọn **String**, đặt tên: `Token`, giá trị: `{{ $('Edit Fields').item.json.Token }}`
   - Mở **"Options"** (gear icon)
   - Bật **"Include Other Fields"** = ON
7. Click **"Save"**

### BƯỚC 2: Thêm node "Get Fresh Presigned URL"
1. Click nút **"+"** bên phải node **"Preserve Data"** vừa tạo
2. Chọn **"HTTP Request"**
3. Đổi tên thành: **"Get Fresh Presigned URL"**
4. Cấu hình:

**Basic Settings:**
- Method: `GET`
- URL: `https://vbee.vn/api/v1/files/presigned-url-for-uploading`

**Query Parameters** (bật "Send Query"):
```
extension = srt
directory = subtitles
fileName = {{ $json.title }}
```

**Headers** (bật "Send Headers"):
```
accept = application/json, text/plain, */*
accept-language = vi,vi-VN;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5
authorization = {{ $json.Token }}
origin = https://studio.vbee.vn
referer = https://studio.vbee.vn/
sec-fetch-mode = cors
user-agent = Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36
```

**Options:**
- Bật **"Include Other Fields"** = ON

5. Click **"Save"**

### BƯỚC 3: Sửa node "Put data"
1. Click vào node **"Put data"**
2. Tìm trường **URL**
3. Đổi từ: `{{ $('1. Get Presigned URL1').item.json.result.url }}`
4. Thành: `{{ $json.result.url }}`
5. Click **"Save"**

### BƯỚC 4: Kết nối lại
1. Xóa connection cũ từ **"Convert to File"** đến **"Put data"**
2. Kết nối mới theo thứ tự:
   ```
   Convert to File → Preserve Data → Get Fresh Presigned URL → Put data
   ```

### BƯỚC 5: Test
1. Click **"Execute Workflow"**
2. Kiểm tra node **"Get Fresh Presigned URL"** chạy TRƯỚC node **"Put data"**
3. Xác nhận không còn lỗi **"Request has expired"**

---

## 🎯 KẾT QUẢ MONG ĐỢI

**TRƯỚC KHI SỬA:**
```
1. Get Presigned URL1 (t=0s, URL tạo ở đây)
   ↓
... (mất 10+ phút xử lý)
   ↓
Put data (t=600s, URL đã hết hạn ❌)
```

**SAU KHI SỬA:**
```
Convert to File
   ↓
Preserve Data (giữ title + Token)
   ↓
Get Fresh Presigned URL (t=0s, URL mới ✅)
   ↓
Put data (t=2s, upload ngay ✅)
```

---

## ❓ TROUBLESHOOTING

**Lỗi: "Cannot read property 'title' of undefined"**
- Kiểm tra node "Edit Fields" có tạo field `title` không
- Kiểm tra expression `{{ $('Edit Fields').item.json.title }}` có đúng không

**Lỗi: "Unauthorized"**
- Token có thể đã hết hạn, cập nhật Token mới trong node "Edit Fields"

**Vẫn lỗi "Request has expired"**
- Kiểm tra node "Get Fresh Presigned URL" có chạy NGAY TRƯỚC "Put data" không
- Kiểm tra URL trong "Put data" đã đổi thành `{{ $json.result.url }}` chưa

---

## 📞 HỖ TRỢ
Nếu vẫn gặp lỗi, export workflow và gửi file JSON để kiểm tra.
