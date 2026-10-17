Website kỷ niệm 18 năm hồi sinh Giáo xứ Khoái Đồng.

## Changelog

### 2026-10-17

- Tích hợp nhánh `codex/story-motion` vào `main` tại commit `06a49cf`.
- Thêm chuyển động mở đầu, số liệu đếm lên, mục lục thu gọn và tiến độ đọc.
- Timeline theo vị trí cuộn, hỗ trợ cuộn nhanh xuôi/ngược và phương án dự phòng cho trình duyệt chưa hỗ trợ animation-timeline.
- Chân dung hỗ trợ vuốt ngang trên mobile và điều khiển bằng bàn phím.
- Thanh so sánh ảnh có hướng dẫn chuyển động một lần, dừng khi người dùng thao tác; nhãn A/B không khẳng định niên đại chưa xác minh.
- Tạm ẩn nút “Xem lớn”; giữ mã hộp xem ảnh để sử dụng sau.
- Giữ favicon ICO và các chỉnh sửa header từ bản nền.
- Hỗ trợ giảm chuyển động; nội dung vẫn đọc được khi tắt JavaScript.
- Kiểm tra timeline đạt ở 390/768/1440px. Kiểm tra motion với phần mở ảnh đang ẩn được bỏ qua đạt ở 320/390/1440px, gồm cảm ứng mô phỏng, bàn phím, giảm chuyển động và không JavaScript. Bài kiểm tra gốc còn yêu cầu bấm nút đang ẩn; chưa kiểm tra trên iPhone Safari thực tế.

Changelog trên bản triển khai: [README.md](/README.md).

## Bản thử nghiệm chuyển động

Nhánh `codex/story-motion`, worktree riêng `giaoxukhoaidong-motion`.
Bản nền là snapshot các file hiện tại từ `giaoxukhoaidong-18nam`, bao gồm thay đổi chưa commit; bản gốc vẫn giữ nguyên trên `main`.

Chạy riêng, không dừng các server 4173/4175:

```sh
python3 -m http.server 4176 --bind 127.0.0.1 --directory .
```

Mở http://127.0.0.1:4176 trên máy này. Đây là preview cục bộ, không phải bản triển khai Vercel.

Các thay đổi:
- Ảnh mở đầu thu nhẹ, tiêu đề/ngày hiện lệch nhịp; ảnh toàn cảnh và chân dung hiện một lần.
- Số liệu đếm lên, giữ số cuối và dấu xấp xỉ; trình đọc màn hình đọc giá trị cuối.
- Timeline đậm theo cuộn, nhấn mốc đang đọc; nội dung lịch sử giữ nguyên.
- Chân dung vuốt ngang trên mobile; hỗ trợ phím trái/phải, Home/End; desktop có hover nhẹ.
- Mục lục thu gọn và vạch tiến độ đọc; chữ nội dung mobile căn trái.
- Thanh so sánh đầu tiên hướng dẫn một lần, dừng khi có thao tác.
- Nút xem ảnh lớn đang tạm ẩn; mã hộp xem ảnh A/B được giữ lại.
- Nhãn ảnh mẫu A/B thay cho niên đại chưa xác minh.
- Tôn trọng prefers-reduced-motion, kể cả khi thay đổi trong lúc xem; nội dung vẫn đọc được khi tắt JavaScript.

Kiểm tra (cần Playwright và Chrome có sẵn):

```sh
node tests/check-motion.cjs
```

Có thể đặt `PREVIEW_URL` hoặc `CAPTURE_DIR`. Nếu Playwright không nằm trong project, đặt `NODE_PATH` tới thư mục node_modules của môi trường đã cài. Kiểm tra gồm 320/390/1440px, bàn phím, cảm ứng mô phỏng Chromium, animation, hộp thoại, reduced motion và không JavaScript. Chưa kiểm tra trên iPhone Safari thực tế.
