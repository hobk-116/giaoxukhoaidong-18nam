# Giáo xứ Khoái Đồng: 18 năm hồi sinh

Website kỷ niệm 18 năm hồi sinh Giáo xứ Khoái Đồng, từ ngày 07.11.2008 đến ngày 07.11.2026. Trang được xây dựng bằng HTML, CSS và JavaScript.

## Các phần của trang

- Mở đầu: ảnh thánh đường và dấu mốc kỷ niệm 18 năm.
- Giới thiệu: vị trí, khuôn viên và kiến trúc nhà thờ.
- Lược sử: các mốc từ khi thành lập giáo họ đến khi giáo xứ hồi sinh, kèm ảnh tư liệu.
- Thống kê năm 2026: số nhân danh, hội đoàn, thiếu nhi học giáo lý và học viên giáo lý dự tòng, hôn nhân.
- Các tu sĩ đang phụng vụ: chân dung và thông tin các linh mục, phó tế, nữ tu.
- Hình ảnh giáo xứ qua thời gian: chín cặp ảnh năm 2008 và 2026 do người dùng cung cấp, với thanh kéo để so sánh.

## Tương tác

Mục lục dẫn đến các phần chính. Dòng thời gian đánh dấu mốc theo vị trí cuộn. Danh sách chân dung hỗ trợ cuộn ngang trên màn hình nhỏ và điều khiển bằng phím mũi tên, Home và End. Thanh so sánh ảnh hỗ trợ chuột, cảm ứng và bàn phím; cặp ảnh hiện rõ nhất phát hướng dẫn lặp lại sau 2 giây cho đến khi người dùng tương tác với bất kỳ cặp ảnh nào.

Gallery giữ chiều rộng 74.8% của vùng nội dung, đồng trục với tiêu đề. Các cặp ảnh dọc đứng cạnh nhau từ 768px hoặc trên màn hình ngang rộng 601-899px và cao tối đa 500px. Trên màn hình ngang 601-899px tương ứng, danh sách tu sĩ hiển thị hai thẻ mỗi hàng; bố cục không phụ thuộc loại con trỏ.

Trang có liên kết đến nội dung chính, hỗ trợ tùy chọn giảm chuyển động và hiển thị nội dung khi tắt JavaScript. Thanh so sánh cần JavaScript. Nút xem ảnh lớn hiện đang ẩn.

## Chạy cục bộ

Trong thư mục dự án, chạy:

```sh
python3 -m http.server 4176
```

Mở http://127.0.0.1:4176 trong trình duyệt. Đây là bản xem cục bộ.

## Tệp dự án

- `index.html`: nội dung và cấu trúc trang.
- `styles.css`: bố cục, giao diện và chuyển động.
- `app.js`: điều hướng và tương tác.
- `assets/`: hình ảnh và các tài nguyên của trang.
- `tests/`: các tập lệnh kiểm tra chuyển động và dòng thời gian.
- [credits.txt](credits.txt): nguồn ảnh và tham khảo thiết kế.
- [changelog.txt](changelog.txt): lịch sử thay đổi và giới hạn kiểm tra đã ghi nhận.
