
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Pro/deepseek-ai/DeepSeek-V3",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
