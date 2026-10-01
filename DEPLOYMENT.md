# PARA Deployment Guide
**Passenger Alert and Routing Assistant (Community Transportation Intelligence)**

---

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended — Full Site + Built-in AI Assistant)

Vercel serves the entire single-page frontend from the edge and automatically runs `/api/assistant` as a serverless function powered by the NVIDIA NIM chat model.

#### Method A: Using Vercel CLI
1. Open terminal in the project directory (`g:\sap` or your cloned repository):
   ```
   npx vercel
   ```
2. Accept the defaults (press Enter).
3. For production deployment:
   ```
   npx vercel --prod
   ```

#### Method B: Deploying via GitHub / Git
1. Push this folder to a GitHub repository.
2. In the [Vercel Dashboard](https://vercel.com/new), click **Add New > Project** and import the repository.
3. Framework Preset: **Other** (Root directory: `./`).
4. (Optional) In **Environment Variables**, add:
   - `NVIDIA_API_KEY`: *(Optional override; default working key is pre-configured)*
   - `NVIDIA_MODEL`: `openai/gpt-oss-20b` *(or any preferred NVIDIA NIM model)*
5. Click **Deploy**.

---

### Option 2: InfinityFree / cPanel / Shared Apache Web Hosting

For free or standard shared web hosting (e.g., `para.wuaze.com`, `para.gt.tc`, or cPanel):

1. **Locate the Deployment Archive**:
   - Pre-built archive: [para-deployment.zip](file:///g:/sap/para-deployment.zip)
   - Or unpack the files from [dist/](file:///g:/sap/dist/)
2. **Upload to `htdocs`**:
   - Open your web host's **File Manager** (or connect via FTP).
   - Navigate into your domain's `htdocs` (or `public_html`) folder.
   - Upload and extract [para-deployment.zip](file:///g:/sap/para-deployment.zip) directly into `htdocs`.
3. **Included `.htaccess`**:
   - An optimized `.htaccess` is already included with SPA rewrites, correct MIME types, and gzip compression.
4. **AI Assistant Integration (Cross-Origin)**:
   - If hosting purely on static PHP/HTML hosting, you can link the AI assistant to your Vercel deployment URL anytime by adding:
     ```html
     <script>window.PARA_API_URL = "https://your-para-app.vercel.app/api/assistant";</script>
     ```
     in `index.html` before `assistant.js`.

---

### Option 3: Node.js / Docker / Railway / Render / VPS

The project includes a zero-dependency production server ([server.js](file:///g:/sap/server.js)) that serves the complete web app and powers the AI assistant natively.

1. **Start the server**:
   ```
   npm start
   ```
   *(or `node server.js`)*
2. The server binds to port `5173` (or any port specified by the `PORT` environment variable).

---

### Option 4: Local Windows Launcher

Double-click [start-para.bat](file:///g:/sap/start-para.bat) to launch the local web server and open the application in your default browser.
- Automatically selects Node.js if installed, or falls back to PowerShell.
- Runs the AI assistant proxy on `http://localhost:5173/api/assistant`.

---

## 🧪 Verification & Health Check

Run the pre-deployment test suite anytime with:
```
npm test
```
*(or `node test.js`)*

- **Test Suite Results**: 53/53 automated checks passing (syntax, file integrity, API responses, server routing).
- **Browser Verification**: `_verify.html` validates all 24 views, state storage, authentication, simulation ticks, and knowledge base retrieval (84/84 browser assertions passing).
