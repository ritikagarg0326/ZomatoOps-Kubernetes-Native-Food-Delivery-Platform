FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
# Angular build output will be copied here during CI/CD
# COPY ../frontend/dist/zomato-clone/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
