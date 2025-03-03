# Photo Upload Server (Nginx + Node.js)

This project is a simple **photo upload server** that allows users to upload images to a local directory. It uses:
- **Nginx** as a **static file server** (for the frontend) and a **reverse proxy** (for the backend).
- **Node.js + Express** for handling file uploads.
- **Multer** to store images on the server.

## **Features**
✅ Store uploaded images locally  
✅ Serve a static frontend using **Nginx**  
✅ Reverse proxy API requests to a **Node.js backend**  
✅ Avoid CORS issues using Nginx  

---

## **1. Clone the Repository**
```sh
git clone https://github.com/yourusername/photo-upload-server.git
cd photo-upload-server
```

---

## **2. Install Dependencies**
Ensure **Node.js** is installed:

```sh
node -v  # Check Node.js version
```

Install backend dependencies:
```sh
cd backend
npm install
```

---

## **3. Configure Nginx**
### **Copy Nginx Config File**
Move the **Nginx configuration file** from the repository to the appropriate location:
```sh
sudo cp nginx/nginx.conf /etc/nginx/sites-available/photo-upload
sudo ln -s /etc/nginx/sites-available/photo-upload /etc/nginx/sites-enabled/
```

### **Restart Nginx**
```sh
sudo systemctl restart nginx
```

### **Check Nginx Status**
```sh
systemctl status nginx
```
If running correctly, you should see **"active (running)"**.

---

## **4. Run the Backend Server**
Start the backend **manually**:
```sh
cd backend
node server.js
```
Or **keep it running** using PM2:
```sh
npm install -g pm2
pm2 start server.js
pm2 save
pm2 startup
```

---

## **5. Set Up the Frontend**
Move frontend files to Nginx’s web directory:
```sh
sudo mkdir -p /var/www/html
sudo cp -r frontend/* /var/www/html/
```

---

## **6. Uploading Files**
Visit:
- **Frontend:** `http://localhost/`
- **API Upload Endpoint:** `http://localhost/api/upload`

Modify `fetch()` requests in the frontend to:
```javascript
fetch("/api/upload", {
    method: "POST",
    body: formData
});
```

---

## **7. Make It Public (Optional)**
To make this accessible on the internet:
1. **Use a domain name** or your public IP.
2. **Open ports 80 & 443** on your router.
3. **Enable HTTPS (SSL) with Let's Encrypt**:
   ```sh
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## **8. Stop or Restart Services**
- **Restart Nginx:** `sudo systemctl restart nginx`
- **Stop backend (if using PM2):** `pm2 stop server`
- **View logs:** `pm2 logs`

---

## **Folder Structure**
```
photo-upload-server/
│── backend/          # Node.js server
│   ├── server.js     # Express API for handling uploads
│   ├── package.json  # Dependencies
│   ├── uploads/      # Stores uploaded images
│── frontend/         # HTML, CSS, and JavaScript
│   ├── index.html    # Main page
│   ├── script.js     # Upload logic
│── nginx/            # Nginx configuration
│   ├── nginx.conf    # Nginx reverse proxy settings
│── README.md         # This file
```

---

## **Done! 🎉**
Now your app is fully running with:
- **Nginx serving static files**
- **Nginx proxying API requests**
- **Node.js handling image uploads**

🚀 Need help? Open an issue in [GitHub](https://github.com/yourusername/photo-upload-server/issues).
