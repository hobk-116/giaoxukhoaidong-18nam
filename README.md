Website kỷ niệm 18 năm hồi sinh Giáo xứ Khoái Đồng.

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
- Xem ảnh lớn, đổi A/B bằng cụm nút dưới ảnh; Escape đóng và trả focus.
- Nhãn ảnh mẫu A/B thay cho niên đại chưa xác minh.
- Tôn trọng prefers-reduced-motion, kể cả khi thay đổi trong lúc xem; nội dung vẫn đọc được khi tắt JavaScript.

Kiểm tra (cần Playwright và Chrome có sẵn):

```sh
node tests/check-motion.cjs
```

Có thể đặt `PREVIEW_URL` hoặc `CAPTURE_DIR`. Nếu Playwright không nằm trong project, đặt `NODE_PATH` tới thư mục node_modules của môi trường đã cài. Kiểm tra gồm 320/390/1440px, bàn phím, cảm ứng mô phỏng Chromium, animation, hộp thoại, reduced motion và không JavaScript. Chưa kiểm tra trên iPhone Safari thực tế.
