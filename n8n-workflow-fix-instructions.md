# Hướng dẫn sửa lỗi "Request has expired" trong N8N Workflow

## Vấn đề
Presigned URL hết hạn sau 180 giây, nhưng workflow mất quá nhiều thời gian xử lý.

## Giải pháp
Thêm node mới để lấy presigned URL tươi ngay trước khi upload.

## Các bước thực hiện trong N8N UI:

### Bước 1: Thêm node "Edit Fields" mới sau "Convert to File"
1. Click vào khoảng trống giữa node "Convert to File" và "Put data"
2. Thêm node **Set** (đổi tên thành "Preserve Data")
3. Cấu hình như sau:
   - **Assignments**:
     - `title`: `={{ $('Edit Fields').item.json.title }}`
     - `Token`: `={{ $('Edit Fields').item.json.Token }}`
   - **Options** > **Include Other Fields**: Bật ON (để giữ binary data)

### Bước 2: Thêm node lấy Presigned URL mới
1. Thêm node **HTTP Request** sau "Preserve Data"
2. Đổi tên thành "Get Fresh Presigned URL"
3. Cấu hình:

```
Method: GET
URL: https://vbee.vn/api/v1/files/presigned-url-for-uploading

Query Parameters:
  - extension: srt
  - directory: subtitles
  - fileName: ={{ $json.title }}

Headers:
  - accept: application/json, text/plain, */*
  - accept-language: vi,vi-VN;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5
  - authorization: ={{ $json.Token }}
  - origin: https://studio.vbee.vn
  - priority: u=1, i
  - referer: https://studio.vbee.vn/
  - sec-ch-ua: "Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"
  - sec-ch-ua-mobile: ?0
  - sec-ch-ua-platform: "Windows"
  - sec-fetch-dest: empty
  - sec-fetch-mode: cors
  - sec-fetch-site: same-site
  - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36

Options:
  - Include Other Fields: ON
```

### Bước 3: Sửa node "Put data"
1. Click vào node "Put data"
2. Sửa URL thành:
   ```
   ={{ $json.result.url }}
   ```
   (Thay vì `={{ $('1. Get Presigned URL1').item.json.result.url }}`)

### Bước 4: Kết nối lại các node
Thứ tự kết nối mới:
```
Convert to File → Preserve Data → Get Fresh Presigned URL → Put data → HTTP Request1
```

## Kiểm tra
Sau khi sửa xong:
1. Chạy workflow từ đầu
2. Kiểm tra xem node "Get Fresh Presigned URL" có chạy ngay trước "Put data"
3. Xác nhận upload thành công

## Lưu ý
- Presigned URL mới sẽ được tạo ngay trước khi upload nên không bị hết hạn
- Binary data (file SRT) sẽ được preserve qua các node nhờ "Include Other Fields"
- Title và Token được lấy từ node "Edit Fields" ban đầu
