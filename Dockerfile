FROM nginx:alpine

# 維護者資訊
LABEL org.opencontainers.image.source="https://github.com/YOUR_USERNAME/YOUR_REPO"
LABEL org.opencontainers.image.description="井字遊戲 - 靜態網頁應用"
LABEL org.opencontainers.image.licenses="MIT"

# 創建 nginx 用戶和群組
RUN set -x \
    && addgroup -g 101 -S nginx \
    && adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# 設定所需目錄的權限
RUN mkdir -p /usr/share/nginx/html \
    && chown -R nginx:nginx /usr/share/nginx/html \
    && mkdir -p /var/cache/nginx \
    && chown -R nginx:nginx /var/cache/nginx \
    && mkdir -p /var/log/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && mkdir -p /tmp \
    && chown -R nginx:nginx /tmp

# 複製靜態檔案到 Nginx 目錄並設定權限
COPY --chown=nginx:nginx app/ /usr/share/nginx/html/

# 複製並設定 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 修改 Nginx 配置
RUN sed -i 's/listen\s*80;/listen 8080;/g' /etc/nginx/conf.d/default.conf \
    && sed -i 's/listen\s*\[::\]:80;/listen [::]:8080;/g' /etc/nginx/conf.d/default.conf \
    && sed -i 's,/var/run/nginx.pid,/tmp/nginx.pid,' /etc/nginx/nginx.conf \
    && chown -R nginx:nginx /etc/nginx/conf.d/default.conf

# 切換到 nginx 用戶
USER nginx

# 暴露 8080 端口
EXPOSE 8080

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]