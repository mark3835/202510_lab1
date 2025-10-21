FROM nginx:alpine

# 維護者資訊
LABEL org.opencontainers.image.source="https://github.com/YOUR_USERNAME/YOUR_REPO"
LABEL org.opencontainers.image.description="井字遊戲 - 靜態網頁應用"
LABEL org.opencontainers.image.licenses="MIT"

# 移除預設的 Nginx 網頁並設定權限
RUN rm -rf /usr/share/nginx/html/* && \
    mkdir -p /tmp/nginx && \
    chown -R nginx:nginx /tmp/nginx

# 複製靜態檔案到 Nginx 目錄
COPY app/ /usr/share/nginx/html/

# 修改 Nginx 配置
RUN sed -i 's/listen\s*80;/listen 8080;/g' /etc/nginx/conf.d/default.conf && \
    sed -i 's/listen\s*\[::\]:80;/listen [::]:8080;/g' /etc/nginx/conf.d/default.conf

USER nginx
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]