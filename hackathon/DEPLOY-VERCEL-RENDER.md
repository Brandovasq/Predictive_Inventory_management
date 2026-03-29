# Deploy Guide (Vercel + Render)

This gives you a stable public full-stack setup:
- Frontend: Vercel
- Backend (Flask): Render

## 1) Push code to GitHub
1. Create a GitHub repo.
2. Push this project to GitHub.

## 2) Deploy backend on Render
1. Go to Render Dashboard -> New -> Web Service.
2. Connect your GitHub repo.
3. Choose Root Directory: `backend1`
4. Runtime: Python 3
5. Build Command:
   `pip install -r requirements.txt`
6. Start Command:
   `gunicorn app:app`
7. Add environment variable (optional):
   - `FLASK_DEBUG` = `0`
8. Create Web Service.
9. Copy the backend URL, e.g. `https://your-backend.onrender.com`
10. Test in browser:
   - `https://your-backend.onrender.com/health`

## 3) Deploy ordering frontend on Vercel
1. Go to Vercel -> Add New Project.
2. Import same GitHub repo.
3. Set Root Directory: `frontend`
4. Framework Preset: Vite
5. In Environment Variables add:
   - `VITE_BACKEND_URL` = `https://your-backend.onrender.com`
6. Deploy.
7. Open deployed site and test ordering.

## 4) Optional: deploy inventory frontend2 on Vercel
1. Add another Vercel project from same repo.
2. Root Directory: `frontend2`
3. Add env var:
   - `VITE_BACKEND_URL` = `https://your-backend.onrender.com`
4. Deploy.

## 5) Verify end-to-end
1. Open ordering app, place an order.
2. Open inventory dashboard and confirm stock decreases.

## Notes
- Free tier Render may sleep after inactivity; first request can be slow.
- This is still much more stable than temporary tunnels.
- Keep backend as source of truth for inventory updates.
