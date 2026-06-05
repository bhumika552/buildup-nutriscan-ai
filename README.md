# Buildup AI

## Backend API

1. Navigate to `backend/`
2. Run `npm install`
3. Run `npm start`
4. API endpoint: `POST http://localhost:5001/api/analyze`
   - body: `multipart/form-data`
   - field name: `image`

## AI service

1. Navigate to `ai_service/`
2. Run `pip install -r requirements.txt`
3. Start the model API: `uvicorn main:app --host 0.0.0.0 --port 8000`

## Frontend

1. Navigate to `backend/`
2. Run `npm install`
3. Start the backend: `npm start`
4. Open `http://localhost:5001` in your browser

The backend serves the frontend from `backend/public/` and forwards image uploads to the Python AI service.

## Notes

- The backend forwards uploaded images to `http://127.0.0.1:8000/predict`
- If `model.h5` is missing, train it with `python train.py` from `ai_service/`
