# Set environment variables and start the server
$env:JWT_SECRET="rgram_jwt_secret_key_2024_secure_random_string_12345"
$env:JWT_EXPIRE="30d"
$env:MONGODB_URI="mongodb+srv://tossitswayam:Qwert123%23%24@cluster0.tpk0nle.mongodb.net/api_rgram?retryWrites=true&w=majority"
$env:NODE_ENV="development"
$env:NEXT_PUBLIC_APP_URL="http://localhost:3000"

Write-Host "Environment variables set. Starting server..."
npm run dev
